import { IsUUID } from 'class-validator';

export class AssignTeacherDto {
  @IsUUID()
  teacherUserId: string;

  @IsUUID()
  courseId: string;

  @IsUUID()
  groupId: string;

  @IsUUID()
  semesterId: string;
}
