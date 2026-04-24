import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Student } from './student.entity';

@Entity('parent_student')
export class ParentStudent {
  @PrimaryColumn({ name: 'parent_user_id' })
  parentUserId: string;

  @PrimaryColumn({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'parent_user_id' })
  parent: User;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
