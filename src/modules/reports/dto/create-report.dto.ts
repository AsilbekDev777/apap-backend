import { IsEnum, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ReportType,
  ReportFormat,
} from '../../../database/entities/report-job.entity';

export class CreateReportDto {
  @ApiProperty({ enum: ReportType, example: ReportType.STUDENT_CARD })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ enum: ReportFormat, example: ReportFormat.PDF })
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @ApiPropertyOptional({ example: 'uuid-of-student' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-group' })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-semester' })
  @IsOptional()
  @IsUUID()
  semesterId?: string;
}
