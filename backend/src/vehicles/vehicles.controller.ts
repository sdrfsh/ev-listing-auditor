import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service.js';
import { Vehicle } from './entities/vehicle.entity.js';
import { ImportVehicleDto } from './dto/import-vehicle.dto.js';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehiclesService: VehicleService) {}

  @Get()
  findAll(): Promise<Vehicle[]> {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Vehicle> {
    return this.vehiclesService.findOne(id);
  }

  @Get('seller/:seller_id')
  findOneBySellerId(@Param('seller_id', ParseIntPipe) seller_id: number): Promise<Vehicle[]> {
    return this.vehiclesService.findBySellerId(seller_id);
  }

  @Post('import')
  importVehicle(@Body() dto: ImportVehicleDto): Promise<Vehicle> {
    return this.vehiclesService.importVehicle(dto);
  }
}
