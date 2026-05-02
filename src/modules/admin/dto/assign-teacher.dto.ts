import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTeacherDto {
  @ApiProperty({ example: 'uuid-of-teacher-user' })
  @IsUUID()
  teacherUserId: string;

  @ApiProperty({ example: 'uuid-of-course' })
  @IsUUID()
  courseId: string;

  @ApiProperty({ example: 'uuid-of-group' })
  @IsUUID()
  groupId: string;

  @ApiProperty({ example: 'uuid-of-semester' })
  @IsUUID()
  semesterId: string;
}
