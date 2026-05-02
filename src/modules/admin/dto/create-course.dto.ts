import { IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Dasturlash asoslari' })
  @IsString()
  nameUz: string;

  @ApiProperty({ example: 'Основы программирования' })
  @IsString()
  nameRu: string;

  @ApiProperty({ example: 'CS101' })
  @IsString()
  code: string;

  @ApiProperty({ example: 3, minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  creditHours: number;
}
