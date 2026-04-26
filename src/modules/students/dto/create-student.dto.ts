import {
  IsEmail,
  IsString,
  IsUUID,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateStudentDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  studentNumber: string;

  @IsUUID()
  groupId: string;

  @IsOptional()
  @IsUUID()
  parentUserId?: string;
}
