import { IsArray, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  comment: string;
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  locationIds: number[];
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  tagIds: number[];
}
