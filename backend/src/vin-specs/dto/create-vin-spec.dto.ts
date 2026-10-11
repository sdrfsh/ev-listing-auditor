import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateVinSpecDto {
  // 17 chars, no I/O/Q (ISO 3779)
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, {
    message: 'vin must be 17 characters (A-Z, 0-9, excluding I, O, Q)',
  })
  vin: string;

  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsString()
  trim: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  modelYear: number;

  @IsInt()
  @Min(0)
  batteryKwh: number;

  @IsInt()
  @Min(0)
  listPrice: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentSpecs?: string[];
}
