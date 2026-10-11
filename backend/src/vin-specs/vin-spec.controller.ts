import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VinSpecService } from './vin-spec.service.js';
import { VinSpec } from './entities/vin-spec.entity.js';
import { CreateVinSpecDto } from './dto/create-vin-spec.dto.js';
import { PaginationDto } from '../common/pagination.dto.js';

@ApiTags('vin-specs')
@Controller('vin-specs')
export class VinSpecController {
  constructor(private readonly vinSpecService: VinSpecService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto): Promise<VinSpec[]> {
    return this.vinSpecService.findAll(pagination);
  }

  @Get(':vin')
  findOne(@Param('vin') vin: string): Promise<VinSpec> {
    return this.vinSpecService.findOne(vin);
  }

  @Post('create')
  createVinSpec(@Body() dto: CreateVinSpecDto): Promise<VinSpec> {
    return this.vinSpecService.createVinSpec(dto);
  }
}
