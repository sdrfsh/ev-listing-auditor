import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// What the seller sends: their own words. The app figures out field + value.
export class ReportIssueDto {
  @IsInt()
  sellerId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  // Optional: sent on the second try, after the API asked for the VIN
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  vin?: string;
}
