import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IssueService } from './issue.service.js';
import { Issue } from './entities/issue.entity.js';
import { CreateIssuesDto } from './dto/create-issues.dto.js';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto.js';
import { PaginationDto } from '../common/pagination.dto.js';
import { Extraction } from '../extraction/extraction-result.interface.js';
import { ExtractionService } from '../extraction/extraction.service.js';

@ApiTags('issues')
@Controller('issues')
export class IssueController {
  constructor(private readonly issueService: IssueService, private readonly extractionService: ExtractionService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto): Promise<Issue[]> {
    return this.issueService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Issue> {
    return this.issueService.findOne(id);
  }

  @Get('vehicle/:vehicle_id')
  findByVehicleId(
    @Param('vehicle_id', ParseIntPipe) vehicle_id: number,
  ): Promise<Issue[]> {
    return this.issueService.findByVehicleId(vehicle_id);
  }

  @Get('seller/:seller_id')
  findBySellerId(
    @Param('seller_id', ParseIntPipe) seller_id: number,
  ): Promise<Issue[]> {
    return this.issueService.findBySellerId(seller_id);
  }

  @Post('create')
  createIssue(@Body() dto : CreateIssuesDto): Promise<Issue>{
    return this.issueService.createIssue(dto);
  }

  @Put(':id/status')
  updateIssue(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIssueStatusDto,
  ): Promise<Issue> {
    return this.issueService.updateIssue(id, dto.status);
  }

  @Post('report')
  async ReportIssue(@Body() userMessage: string): Promise<Extraction | null>{
    return await this.extractionService.extract(userMessage);
  }

}
