import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserLang } from '../../../database/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'teacher@apap.uz' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Teacher123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TEACHER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ enum: UserLang, example: UserLang.UZ })
  @IsEnum(UserLang)
  lang: UserLang;
}
