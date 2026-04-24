import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('grade_types')
export class GradeType extends BaseEntity {
  @Column({ name: 'name_uz' })
  nameUz: string;

  @Column({ name: 'name_ru' })
  nameRu: string;

  // 30 = 30%, 40 = 40%
  @Column({ name: 'weight_percent', type: 'decimal', precision: 5, scale: 2 })
  weightPercent: number;

  @Column({ name: 'max_score', type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;
}
