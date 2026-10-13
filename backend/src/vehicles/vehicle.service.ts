import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity.js';
import { ImportVehicleDto } from './dto/import-vehicle.dto.js';
import { PaginationDto } from '../common/pagination.dto.js';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicles: Repository<Vehicle>) {}

  async findAll({ limit, offset }: PaginationDto): Promise<Vehicle[]> {
    return await this.vehicles.find({
      take: limit,
      skip: offset,
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Vehicle | null> {
    return await this.vehicles.findOne({
      where: { id },
    });
  }

  async findBySellerId(seller_id: number): Promise<Vehicle[]> {
    return await this.vehicles.find({
      where: { sellerId: seller_id },
    });
  }

  async findBySellerAndVin(sellerId: number, vin: string): Promise<Vehicle> {
    const vehicle = await this.vehicles.findOne({
      where: { sellerId, vin: vin },
      order: { id: 'DESC' },
    });
    if (!vehicle) {
      throw new NotFoundException(
        `No car with VIN ${vin} found for seller ${sellerId}`,
      );
    }
    return vehicle;
  }

  async importVehicle(dto: ImportVehicleDto): Promise<Vehicle> {
    if (await this.vehicles.existsBy({ vin: dto.vin })) {
      throw new ConflictException(
        `A vehicle with VIN ${dto.vin} already exists`,
      );
    }
    const vehicle = this.vehicles.create(dto);
    return await this.vehicles.save(vehicle);
  }
}
