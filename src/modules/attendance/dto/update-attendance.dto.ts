import { IsEnum } from 'class-validator';
import { AttendanceStatus } from '../../../database/entities/attendance.entity';

export class UpdateAttendanceDto {
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
