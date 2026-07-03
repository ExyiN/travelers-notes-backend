import { IsArray, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateNoteDto {
  @IsNotEmpty()
  @IsOptional()
  comment: string;
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  locationIds: number[];
}
