import { IsEmail, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserLang } from '../../../database/entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@apap.uz' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserLang })
  @IsOptional()
  @IsEnum(UserLang)
  lang?: UserLang;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
