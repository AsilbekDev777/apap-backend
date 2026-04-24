import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('semesters')
export class Semester extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;
}
