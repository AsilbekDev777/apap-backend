import { IsOptional, IsUUID } from 'class-validator';

export class QueryGradeDto {
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  semesterId?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;
}
