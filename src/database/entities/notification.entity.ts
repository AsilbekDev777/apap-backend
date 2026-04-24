import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum NotificationType {
  GRADE_ADDED = 'grade_added',
  ATTENDANCE_WARNING = 'attendance_warning',
  REPORT_READY = 'report_ready',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ name: 'title_uz' })
  titleUz: string;

  @Column({ name: 'title_ru' })
  titleRu: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;
}
