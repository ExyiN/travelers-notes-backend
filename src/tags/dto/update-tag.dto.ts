import { IsHexColor, IsNotEmpty } from 'class-validator';

export class UpdateTagDto {
  @IsNotEmpty()
  name: string;
  @IsHexColor()
  color: string;
}
