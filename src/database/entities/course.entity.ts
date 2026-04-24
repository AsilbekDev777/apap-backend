import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('courses')
export class Course extends BaseEntity {
  @Column({ name: 'name_uz' })
  nameUz: string;

  @Column({ name: 'name_ru' })
  nameRu: string;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'credit_hours' })
  creditHours: number;
}
