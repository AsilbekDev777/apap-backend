import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Faculty } from './faculty.entity';

@Entity('groups')
export class Group extends BaseEntity {
  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'faculty_id' })
  faculty: Faculty;

  @Column({ name: 'faculty_id' })
  facultyId: string;

  @Column()
  name: string;

  @Column()
  year: number;
}
