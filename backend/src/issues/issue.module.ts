import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './entities/issue.entity.js';
import { IssueController } from './issue.controller.js';
import { IssueService } from './issue.service.js';
import { Vehicle } from '../vehicles/entities/vehicle.entity.js';
import { VehicleModule } from '../vehicles/vehicle.module.js';
import { ExtractionModule } from '../extraction/extraction.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Issue, Vehicle]), VehicleModule, ExtractionModule],
  controllers: [IssueController],
  providers: [IssueService],
  exports: [IssueService],
})
export class IssueModule {}
