import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  intraId: string;

  @IsString()
  imageUrl: string;
}
