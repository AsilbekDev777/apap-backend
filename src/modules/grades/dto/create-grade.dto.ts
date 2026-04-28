import { IsUUID, IsNumber, Min, Max } from 'class-validator';

export class CreateGradeDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  courseId: string;

  @IsUUID()
  semesterId: string;

  @IsUUID()
  gradeTypeId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;
}
