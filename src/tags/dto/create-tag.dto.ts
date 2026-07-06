import { IsHexColor, IsNotEmpty } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty()
  name: string;
  @IsHexColor()
  color: string;
}
