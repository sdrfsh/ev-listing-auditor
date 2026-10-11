import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Issue } from './entities/issue.entity.js';
import { CreateIssuesDto } from './dto/create-issues.dto.js';
import { IssueStatus } from '../common/issue-status.enum.js';
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

  async changeIssueStatus(
    issue_id: number,
    status: IssueStatus,
  ): Promise<Issue> {
    const issue = await this.findOne(issue_id);

    if (status === IssueStatus.Confirmed) {
      await this.applyFieldChange(issue);
    }

    issue.status = status;
    issue.resolvedAt = (
      status === IssueStatus.Pending ? null : new Date()
    ) as Date;
    return this.issues.save(issue);
  }

  private async applyFieldChange(issue: Issue): Promise<void> {
    const manager = this.issues.manager;
    const column = manager
      .getRepository(Vehicle)
      .metadata.findColumnWithPropertyName(issue.fieldName);

    if (!column) {
      throw new Error(`Vehicle has no column for "${issue.fieldName}"`);
    }

    const value =
      column.type === 'int' ? Number(issue.newValue) : issue.newValue;
    await manager.update(Vehicle, issue.vehicle.id, {
      [issue.fieldName]: value,
    });
  }
}
