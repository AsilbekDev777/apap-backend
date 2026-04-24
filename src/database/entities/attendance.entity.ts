import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Student } from './student.entity';
import { Course } from './course.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
}

@Entity('attendance')
export class Attendance extends BaseEntity {
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'course_id' })
  courseId: string;

  @Column({ name: 'lesson_date', type: 'date' })
  lessonDate: string;

  @Column({ type: 'enum', enum: AttendanceStatus })
  status: AttendanceStatus;
}
