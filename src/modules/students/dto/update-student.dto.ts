import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'Alisher' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Karimov' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '21-002' })
  @IsOptional()
  @IsString()
  studentNumber?: string;

  @ApiPropertyOptional({ example: 'uuid-of-group' })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent-user' })
  @IsOptional()
  @IsUUID()
  parentUserId?: string;
}
