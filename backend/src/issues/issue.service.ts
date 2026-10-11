import {
  BadRequestException,
  Injectable,
  NotFoundException,
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

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issues: Repository<Issue>,
    private readonly vehicleService: VehicleService,
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
  ): Promise<Issue> {
    const issue = await this.issues.findOne({ where: { id }, relations });
    if (!issue) {
      throw new NotFoundException(`issue ${id} not found`);
    }
    return issue;
  }

  async findByVehicleId(vehicleId: number): Promise<Issue[]> {
    return await this.issues.findBy({ vehicle: { id: vehicleId } });
  }

  async findBySellerId(seller_id: number): Promise<Issue[]> {
    return await this.issues.findBy({ sellerId: seller_id });
  }

  async createIssue(dto: CreateIssuesDto): Promise<Issue> {
    await this.vehicleService.findOne(dto.vehicleId);
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
