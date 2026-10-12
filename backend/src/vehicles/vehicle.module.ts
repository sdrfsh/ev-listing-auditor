import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity.js';
import { VinSpec } from './entities/vin-spec.entity.js';
import { VehicleController } from './vehicles.controller.js';
import { VehicleService } from './vehicle.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VinSpec])],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
