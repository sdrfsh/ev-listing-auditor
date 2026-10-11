import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './entities/issue.entity.js';
import { IssueController } from './issue.controller.js';
import { IssueService } from './issue.service.js';
import { Vehicle } from '../vehicles/entities/vehicle.entity.js';
import { VehicleModule } from '../vehicles/vehicle.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Issue, Vehicle]), VehicleModule],
  controllers: [IssueController],
  providers: [IssueService],
  exports: [IssueService],
})
export class IssueModule {}
