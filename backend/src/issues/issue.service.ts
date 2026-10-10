import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from './entities/issue.entity.js';
import { CreateIssuesDto } from './dto/create-issues.dto.js';
import { IssueStatus } from '../common/issue-status.enum.js';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issues: Repository<Issue>,
  ) {}

  async findAll(): Promise<Issue[]> {
    return await this.issues.find();
  }

  async findOne(id: number): Promise<Issue> {
    const issue = await this.issues.findOneBy({ id });

    if (!issue) {
      throw new NotFoundException(`issue ${id} not found`);
    }
    return issue;
  }

  findByVehicleId(vehicleId: number): Promise<Issue[]> {
    return this.issues.findBy({ vehicle: { id: vehicleId } });
  }

  findBySellerId(seller_id: number) : Promise<Issue[]> {
    return this.issues.findBy({ sellerId: seller_id });
  }

  async createIssue(dto: CreateIssuesDto): Promise<Issue> {
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

  async changeIssueStatus(issue_id: number, status: IssueStatus): Promise<Issue> {
    const issue = await this.findOne(issue_id);
    issue.status = status;
    issue.resolvedAt = (
      status === IssueStatus.Pending ? null : new Date()
    ) as Date;
    return this.issues.save(issue);
  }
}
