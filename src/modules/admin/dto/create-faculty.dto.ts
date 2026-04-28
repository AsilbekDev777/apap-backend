import { IsString, MinLength } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  @MinLength(2)
  nameUz: string;

  @IsString()
  @MinLength(2)
  nameRu: string;

  @IsString()
  code: string;
}
