import {
  IsEmail,
  IsString,
  IsUUID,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'student@apap.uz' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Student123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Alibek' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Karimov' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '21-001' })
  @IsString()
  studentNumber: string;

  @ApiProperty({ example: 'uuid-of-group' })
  @IsUUID()
  groupId: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent-user' })
  @IsOptional()
  @IsUUID()
  parentUserId?: string;
}
