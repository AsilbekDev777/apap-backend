import { IsUUID, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({ example: 'uuid-of-student' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: 'uuid-of-course' })
  @IsUUID()
  courseId: string;

  @ApiProperty({ example: 'uuid-of-semester' })
  @IsUUID()
  semesterId: string;

  @ApiProperty({ example: 'uuid-of-grade-type' })
  @IsUUID()
  gradeTypeId: string;

  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;
}
