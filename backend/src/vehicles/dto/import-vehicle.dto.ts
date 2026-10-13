import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class ImportVehicleDto {
  @IsInt()
  sellerId: number;

  // Same VIN rule as the chat, stored uppercase so lookups match
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, {
    message: 'vin must be 17 characters (no I, O or Q)',
  })
  vin: string;

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
