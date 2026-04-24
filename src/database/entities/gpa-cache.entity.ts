import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Student } from './student.entity';
import { Semester } from './semester.entity';

@Entity('gpa_cache')
export class GpaCache {
  @PrimaryColumn({ name: 'student_id' })
  studentId: string;

  @PrimaryColumn({ name: 'semester_id' })
  semesterId: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @Column({ name: 'gpa_100', type: 'decimal', precision: 5, scale: 2 })
  gpa100: number;

  @Column({ name: 'gpa_5', type: 'decimal', precision: 3, scale: 2 })
  gpa5: number;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
