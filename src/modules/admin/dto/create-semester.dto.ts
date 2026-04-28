import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateSemesterDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
