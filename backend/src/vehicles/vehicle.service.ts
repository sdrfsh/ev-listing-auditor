import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity.js';
import { ImportVehicleDto } from './dto/import-vehicle.dto.js';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicles: Repository<Vehicle>,
  ) {}

  findAll(): Promise<Vehicle[]> {
    return this.vehicles.find();
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicles.findOneBy({ id });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${id} not found`);
    }
    return vehicle;
  }

  async findBySellerId(seller_id: number): Promise<Vehicle[]> {
    const vehicles = await this.vehicles.findBy({
      sellerId: seller_id,
    });
    if (vehicles.length === 0) {
      throw new NotFoundException(`No vehicles found for seller ${seller_id}`);
    }
    return vehicles;
  }

  importVehicle(dto: ImportVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehicles.create(dto);
    return this.vehicles.save(vehicle);
  }
}
