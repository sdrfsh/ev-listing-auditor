import { Type } from 'class-transformer';
import {
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ImportVehicleDto {
  @IsInt()
  sellerId: number;

  @IsString()
  VIN: string;

  @IsString()
  model: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  mileage: number;

  @Type(() => Number)
  @IsInt()
  @Max(100)
  @Min(0)
  batteryHealth: number;

  @IsInt()
  @Min(0)
  price: number;

  @IsBoolean()
  isSaleReady: boolean;

  @IsBoolean()
  isAvailable: boolean;

  @IsOptional()
  @IsString()
  equipments?: string;
}
