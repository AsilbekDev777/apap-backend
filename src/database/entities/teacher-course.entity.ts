import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { Group } from './group.entity';
import { Semester } from './semester.entity';

@Entity('teacher_courses')
export class TeacherCourse {
  @PrimaryColumn({ name: 'teacher_user_id' })
  teacherUserId: string;

  @PrimaryColumn({ name: 'course_id' })
  courseId: string;

  @PrimaryColumn({ name: 'group_id' })
  groupId: string;

  @PrimaryColumn({ name: 'semester_id' })
  semesterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_user_id' })
  teacher: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;
}
