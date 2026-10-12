import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VehicleService } from './vehicle.service.js';
import { Vehicle } from './entities/vehicle.entity.js';
import { VinSpec } from './entities/vin-spec.entity.js';
import { ImportVehicleDto } from './dto/import-vehicle.dto.js';
import { CreateVinSpecDto } from './dto/create-vin-spec.dto.js';
import { PaginationDto } from '../common/pagination.dto.js';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehiclesService: VehicleService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto): Promise<Vehicle[]> {
    return this.vehiclesService.findAll(pagination);
  }

  @Get('vin-specs')
  findAllVinSpecs(@Query() pagination: PaginationDto): Promise<VinSpec[]> {
    return this.vehiclesService.findAllVinSpecs(pagination);
  }

  @Get('vin-specs/:vin')
  findVinSpec(@Param('vin') vin: string): Promise<VinSpec> {
    return this.vehiclesService.findVinSpec(vin);
  }

  @Post('vin-specs/create')
  createVinSpec(@Body() dto: CreateVinSpecDto): Promise<VinSpec> {
    return this.vehiclesService.createVinSpec(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Vehicle> {
    return this.vehiclesService.findOne(id);
  }

  @Get('seller/:seller_id')
  findBySellerId(@Param('seller_id', ParseIntPipe) seller_id: number): Promise<Vehicle[]> {
    return this.vehiclesService.findBySellerId(seller_id);
  }

  @Post('create')
  importVehicle(@Body() dto: ImportVehicleDto): Promise<Vehicle> {
    return this.vehiclesService.importVehicle(dto);
  }
}
