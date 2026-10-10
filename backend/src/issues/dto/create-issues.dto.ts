import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EditableField } from '../../common/editable-field.enum.js';

export class CreateIssuesDto {
  @IsInt()
  vehicleId: number;

  @IsInt()
  sellerId: number;

  @IsEnum(EditableField)
  fieldName: EditableField;

  @IsOptional()
  @IsString()
  oldValue: string;

  @IsString()
  newValue: string;

  @IsString()
  sellerMessage: string;
}
