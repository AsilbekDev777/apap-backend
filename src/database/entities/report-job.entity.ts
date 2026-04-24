import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum ReportType {
  STUDENT_CARD = 'student_card',
  GROUP_REPORT = 'group_report',
}

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
}

@Entity('report_jobs')
export class ReportJob extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  requestedBy: User;

  @Column({ name: 'requested_by' })
  requestedById: string;

  @Column({ type: 'enum', enum: ReportType })
  type: ReportType;

  @Column({ type: 'enum', enum: ReportFormat })
  format: ReportFormat;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ name: 'file_key', nullable: true })
  fileKey: string;

  @Column({ type: 'text', nullable: true })
  error: string;
}
