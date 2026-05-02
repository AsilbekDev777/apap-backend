import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFacultyDto {
  @ApiProperty({ example: 'Informatika va axborot texnologiyalari' })
  @IsString()
  @MinLength(2)
  nameUz: string;

  @ApiProperty({ example: 'Информатика и информационные технологии' })
  @IsString()
  @MinLength(2)
  nameRu: string;

  @ApiProperty({ example: 'IIT' })
  @IsString()
  code: string;
}
