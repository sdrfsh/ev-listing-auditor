import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinSpec } from './entities/vin-spec.entity.js';
import { CreateVinSpecDto } from './dto/create-vin-spec.dto.js';
import { PaginationDto } from '../common/pagination.dto.js';

@Injectable()
export class VinSpecService {
  constructor(
    @InjectRepository(VinSpec)
    private readonly vinSpecs: Repository<VinSpec>,
  ) {}

  async findAll({ limit, offset }: PaginationDto): Promise<VinSpec[]> {
    return await this.vinSpecs.find({
      take: limit,
      skip: offset,
      order: { vin: 'ASC' },
    });
  }

  async findOne(vin: string): Promise<VinSpec> {
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
