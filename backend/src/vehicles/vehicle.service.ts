import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity.js';
import { VinSpec } from '../vin-specs/entities/vin-spec.entity.js';
import { ImportVehicleDto } from './dto/import-vehicle.dto.js';
import { PaginationDto } from '../common/pagination.dto.js';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicles: Repository<Vehicle>,
    @InjectRepository(VinSpec)
    private readonly vinSpecs: Repository<VinSpec>,
  ) {}

  async findAll({ limit, offset }: PaginationDto): Promise<Vehicle[]> {
    return await this.vehicles.find({
      take: limit,
      skip: offset,
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicles.findOneBy({ id });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${id} not found`);
    }
    return vehicle;
  }

  async findBySellerId(seller_id: number): Promise<Vehicle[]> {
    return await this.vehicles.findBy({
      sellerId: seller_id,
    });
  }

  // The seller's own car with this VIN (newest first, in case it was listed twice)
  async findBySellerAndVin(sellerId: number, vin: string): Promise<Vehicle> {
    const vehicle = await this.vehicles.findOne({
      where: { sellerId, VIN: vin },
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
    const vinExists = await this.vinSpecs.existsBy({ vin: dto.VIN });
    if (!vinExists) {
      throw new BadRequestException('VIN not found');
    }
    const vehicle = this.vehicles.create(dto);
    return await this.vehicles.save(vehicle);
  }
}
