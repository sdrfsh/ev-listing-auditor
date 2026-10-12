import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity.js';
import { VinSpec } from './entities/vin-spec.entity.js';
import { ImportVehicleDto } from './dto/import-vehicle.dto.js';
import { CreateVinSpecDto } from './dto/create-vin-spec.dto.js';
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
      relations: { vinSpec: true },
      take: limit,
      skip: offset,
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicles.findOne({
      where: { id },
      relations: { vinSpec: true },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${id} not found`);
    }
    return vehicle;
  }

  async findBySellerId(seller_id: number): Promise<Vehicle[]> {
    return await this.vehicles.find({
      where: { sellerId: seller_id },
      relations: { vinSpec: true },
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

  async findAllVinSpecs({ limit, offset }: PaginationDto): Promise<VinSpec[]> {
    return await this.vinSpecs.find({
      take: limit,
      skip: offset,
      order: { vin: 'ASC' },
    });
  }

  async findVinSpec(vin: string): Promise<VinSpec> {
    const vinSpec = await this.vinSpecs.findOneBy({ vin });
    if (!vinSpec) {
      throw new NotFoundException(`VIN spec ${vin} not found`);
    }
    return vinSpec;
  }

  async createVinSpec(dto: CreateVinSpecDto): Promise<VinSpec> {
    const vinExists = await this.vinSpecs.existsBy({ vin: dto.vin });
    if (vinExists) {
      throw new ConflictException(`VIN spec ${dto.vin} already exists`);
    }
    const vinSpec = this.vinSpecs.create(dto);
    return await this.vinSpecs.save(vinSpec);
  }
}
