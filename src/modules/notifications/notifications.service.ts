import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import {
  Notification,
  NotificationType,
} from '../../database/entities/notification.entity';
import { Student } from '../../database/entities/student.entity';
import { ParentStudent } from '../../database/entities/parent-student.entity';
import { NotificationsGateway } from './notifications.gateway';

interface GradeCreatedEvent {
  studentId: string;
  courseId: string;
  score: number;
  gpa: { gpa100: number; gpa5: number };
}

interface AttendanceWarningEvent {
  studentId: string;
  courseId: string;
  percentage: number;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    @InjectRepository(ParentStudent)
    private parentStudentRepo: Repository<ParentStudent>,

    private gateway: NotificationsGateway,
  ) {}

  // ─── grade.created event ──────────────────────────────────────────────────
  @OnEvent('grade.created')
  async handleGradeCreated(event: GradeCreatedEvent) {
    const student = await this.studentRepo.findOne({
      where: { id: event.studentId },
      relations: ['user'],
    });
    if (!student) return;

    // Talabaga notification
    await this.createAndSend({
      userId: student.userId,
      type: NotificationType.GRADE_ADDED,
      titleUz: `Yangi baho: ${event.score} ball`,
      titleRu: `Новая оценка: ${event.score} баллов`,
      payload: {
        studentId: event.studentId,
        courseId: event.courseId,
        score: event.score,
        gpa100: event.gpa.gpa100,
        gpa5: event.gpa.gpa5,
      },
    });

    // Ota-onaga notification
    const parentLinks = await this.parentStudentRepo.find({
      where: { studentId: event.studentId },
    });

    for (const link of parentLinks) {
      await this.createAndSend({
        userId: link.parentUserId,
        type: NotificationType.GRADE_ADDED,
        titleUz: `Farzandingizga yangi baho: ${event.score} ball`,
        titleRu: `Новая оценка у вашего ребёнка: ${event.score} баллов`,
        payload: {
          studentId: event.studentId,
          courseId: event.courseId,
          score: event.score,
        },
      });
    }
  }

  // ─── attendance.warning event ─────────────────────────────────────────────
  @OnEvent('attendance.warning')
  async handleAttendanceWarning(event: AttendanceWarningEvent) {
    const student = await this.studentRepo.findOne({
      where: { id: event.studentId },
      relations: ['user'],
    });
    if (!student) return;

    // Talabaga
    await this.createAndSend({
      userId: student.userId,
      type: NotificationType.ATTENDANCE_WARNING,
      titleUz: `Davomat ogohlantirish: ${event.percentage}%`,
      titleRu: `Предупреждение посещаемости: ${event.percentage}%`,
      payload: {
        studentId: event.studentId,
        courseId: event.courseId,
        percentage: event.percentage,
      },
    });

    // Ota-onaga
    const parentLinks = await this.parentStudentRepo.find({
      where: { studentId: event.studentId },
    });

    for (const link of parentLinks) {
      await this.createAndSend({
        userId: link.parentUserId,
        type: NotificationType.ATTENDANCE_WARNING,
        titleUz: `Farzandingiz davomati past: ${event.percentage}%`,
        titleRu: `Посещаемость вашего ребёнка низкая: ${event.percentage}%`,
        payload: {
          studentId: event.studentId,
          courseId: event.courseId,
          percentage: event.percentage,
        },
      });
    }
  }

  // ─── Notification yaratish va yuborish ────────────────────────────────────
  private async createAndSend(data: {
    userId: string;
    type: NotificationType;
    titleUz: string;
    titleRu: string;
    payload: Record<string, unknown>;
  }) {
    const notification = await this.notificationRepo.save({
      userId: data.userId,
      type: data.type,
      titleUz: data.titleUz,
      titleRu: data.titleRu,
      payload: data.payload,
      isRead: false,
    });

    // WebSocket orqali real-time yuborish
    this.gateway.sendToUser(data.userId, 'notification', {
      id: notification.id,
      type: notification.type,
      titleUz: notification.titleUz,
      titleRu: notification.titleRu,
      payload: notification.payload,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  // ─── List ─────────────────────────────────────────────────────────────────
  async findAll(userId: string) {
    const notifications = await this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return { notifications, unreadCount };
  }

  // ─── O'qilgan deb belgilash ───────────────────────────────────────────────
  async markAllRead(userId: string) {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { message: "Barcha notificationlar o'qildi" };
  }

  async markOneRead(id: string, userId: string) {
    await this.notificationRepo.update({ id, userId }, { isRead: true });
    return { message: "Notification o'qildi" };
  }
}
