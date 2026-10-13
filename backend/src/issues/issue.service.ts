import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsRelations, Repository } from 'typeorm';
import { Issue } from './entities/issue.entity.js';
import { CreateIssuesDto } from './dto/create-issues.dto.js';
import { IssueStatus } from '../common/issue-status.enum.js';
import { EditableField } from '../common/editable-field.enum.js';
import { VehicleService } from '../vehicles/vehicle.service.js';
import { PaginationDto } from '../common/pagination.dto.js';
import { Vehicle } from '../vehicles/entities/vehicle.entity.js';
import { ReportIssueDto } from './dto/report-issue.dto.js';
import {
  ExtractionService,
  equipmentName,
} from '../extraction/extraction.service.js';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issues: Repository<Issue>,
    private readonly vehicleService: VehicleService,
    private readonly extraction: ExtractionService,
  ) {}

  async findAll({ limit, offset }: PaginationDto): Promise<Issue[]> {
    return await this.issues.find({
      take: limit,
      skip: offset,
      order: { id: 'ASC' },
    });
  }

  async findOne(
    id: number,
    relations?: FindOptionsRelations<Issue>,
  ): Promise<Issue | null> {
    // Returns null when there is no issue with this id
    return await this.issues.findOne({ where: { id }, relations });
  }

  async findByVehicleId(vehicleId: number): Promise<Issue[]> {
    return await this.issues.findBy({ vehicle: { id: vehicleId } });
  }

  async findBySellerId(seller_id: number): Promise<Issue[]> {
    return await this.issues.findBy({ sellerId: seller_id });
  }

  async findByVin(vin: string): Promise<Issue[]> {
    return await this.issues.find({
      where: { vehicle: { vin: vin.toUpperCase() } },
      relations: { vehicle: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Seller writes free text -> VIN check -> model extracts edits -> one pending issue per edit
  async reportIssue(dto: ReportIssueDto): Promise<Issue[]> {
    // 1. VIN: from the dto (second try) or from the message itself
    const vin = dto.vin ?? this.extraction.findVin(dto.message);
    if (!vin) {
      throw new UnprocessableEntityException({
        statusCode: 422,
        missing: 'vin',
        message:
          "Please add your car's VIN (17 characters) so we know which car you mean.",
      });
    }

    // 2. The car must exist and belong to this seller (404 otherwise)
    const vehicle = await this.vehicleService.findBySellerAndVin(
      dto.sellerId,
      vin,
    );

    // 3. Ask the model what should change (can be several things)
    const extracted = await this.extraction.extract(dto.message);
    if (!extracted) {
      throw new BadRequestException(
        'Sorry, we could not understand what to change. Please be more specific, e.g. "the mileage is 41,000 km".',
      );
    }

    // 4. Skip edits that change nothing: same mileage, adding an item that's
    //    already listed, or removing ("-item") one that isn't there
    const current = (vehicle.equipments ?? '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const edits = extracted.edits.filter((edit) => {
      if (edit.field === EditableField.Equipments) {
        const listed = current.includes(equipmentName(edit.value));
        const isRemoval = edit.value.startsWith('-');
        return isRemoval ? listed : !listed;
      }
      return String(vehicle[edit.field]) !== edit.value;
    });
    if (!edits.length) {
      throw new BadRequestException('Your listing already has these details.');
    }

    // 5. One pending issue per edit; save([...]) stores them all or none
    const issues = edits.map((edit) =>
      this.issues.create({
        sellerId: dto.sellerId,
        vehicle: { id: vehicle.id },
        fieldName: edit.field,
        oldValue: String(vehicle[edit.field] ?? ''),
        newValue: edit.value,
        sellerMessage: dto.message,
        createdAt: new Date(),
      }),
    );
    return await this.issues.save(issues);
  }

  async createIssue(dto: CreateIssuesDto): Promise<Issue> {
    if (!(await this.vehicleService.findOne(dto.vehicleId))) {
      throw new NotFoundException(`Vehicle ${dto.vehicleId} not found`);
    }
    const issue = this.issues.create({
      sellerId: dto.sellerId,
      vehicle: {
        id: dto.vehicleId,
      },
      fieldName: dto.fieldName,
      oldValue: dto.oldValue,
      newValue: dto.newValue,
      sellerMessage: dto.sellerMessage,
      createdAt: new Date(),
    });
    return await this.issues.save(issue);
  }

  async updateIssue(
    issue_id: number,
    status: IssueStatus,
  ): Promise<Issue> {
    const issue = await this.findOne(issue_id, { vehicle: true });
    if (!issue) {
      throw new NotFoundException(`issue ${issue_id} not found`);
    }

    if (issue.status !== IssueStatus.Pending) {
      throw new BadRequestException(
        `Issue ${issue_id} is already ${issue.status}`,
      );
    }
    if (status === IssueStatus.Pending) {
      throw new BadRequestException('Status must be confirmed or rejected');
    }

    return this.issues.manager.transaction(async (manager) => {
      if (status === IssueStatus.Confirmed) {
        await this.applyFieldChange(manager, issue);
      }

      issue.status = status;
      issue.resolvedAt = new Date() as Date;
      return manager.save(issue);
    });
  }

  private async applyFieldChange(
    manager: EntityManager,
    issue: Issue,
  ): Promise<void> {
    const column = manager
      .getRepository(Vehicle)
      .metadata.findColumnWithPropertyName(issue.fieldName);

    if (!column) {
      throw new Error(`Vehicle has no column for "${issue.fieldName}"`);
    }

    let value: string | number =
      column.type === 'int' ? Number(issue.newValue) : issue.newValue;

    if (issue.fieldName === EditableField.Equipments) {
      const vehicle = await manager.findOneByOrFail(Vehicle, {
        id: issue.vehicle.id,
      });
      value = applyEquipmentChanges(vehicle.equipments, issue.newValue);
    }

    await manager.update(Vehicle, issue.vehicle.id, {
      [issue.fieldName]: value,
    });
  }
}

export function applyEquipmentChanges(
  current: string | null,
  changes: string,
): string {
  const parse = (list: string): string[] =>
    list
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  const sameItem = (a: string, b: string): boolean =>
    a.toLowerCase() === b.toLowerCase();

  let result: string[] = [];
  for (const name of parse(current ?? '')) {
    if (!result.some((existing) => sameItem(existing, name))) {
      result.push(name);
    }
  }

  for (const change of parse(changes)) {
    if (change.startsWith('-')) {
      const name = change.slice(1).trim();
      result = result.filter((existing) => !sameItem(existing, name));
    } else if (!result.some((existing) => sameItem(existing, change))) {
      result.push(change);
    }
  }
  return result.join(', ');
}
