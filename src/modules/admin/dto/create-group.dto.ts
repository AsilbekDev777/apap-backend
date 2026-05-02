import { IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: 'uuid-of-faculty' })
  @IsUUID()
  facultyId: string;

  @ApiProperty({ example: 'IIT-21' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2021 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;
}
