import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Student } from './student.entity';
import { Course } from './course.entity';
import { Semester } from './semester.entity';
import { GradeType } from './grade-type.entity';
import { User } from './user.entity';

@Entity('grades')
export class Grade extends BaseEntity {
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

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @Column({ name: 'semester_id' })
  semesterId: string;

  @ManyToOne(() => GradeType)
  @JoinColumn({ name: 'grade_type_id' })
  gradeType: GradeType;

  @Column({ name: 'grade_type_id' })
  gradeTypeId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'entered_by' })
  enteredBy: User;

  @Column({ name: 'entered_by' })
  enteredById: string;
}
