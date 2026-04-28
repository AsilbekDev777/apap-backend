import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  nameUz: string;

  @IsString()
  nameRu: string;

  @IsString()
  code: string;

  @IsInt()
  @Min(1)
  @Max(10)
  creditHours: number;
}
