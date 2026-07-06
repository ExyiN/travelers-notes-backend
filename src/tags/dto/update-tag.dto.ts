import { IsHexColor, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTagDto {
  @IsNotEmpty()
  @IsOptional()
  name: string;
  @IsHexColor()
  @IsOptional()
  color: string;
}
