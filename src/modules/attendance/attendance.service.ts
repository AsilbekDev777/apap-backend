import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Attendance,
  AttendanceStatus,
} from '../../database/entities/attendance.entity';
import { Student } from '../../database/entities/student.entity';
import { TeacherCourse } from '../../database/entities/teacher-course.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceStats } from './dto/attendance-stats.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    @InjectRepository(TeacherCourse)
    private teacherCourseRepo: Repository<TeacherCourse>,

    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  // ─── Bulk kiritish ────────────────────────────────────────────────────────
  async bulkCreate(dto: BulkAttendanceDto, currentUser: User) {
    // Teacher faqat o'z kursiga davomat kirita oladi
    if (currentUser.role === UserRole.TEACHER) {
      const assigned = await this.teacherCourseRepo.findOne({
        where: {
          teacherUserId: currentUser.id,
          courseId: dto.courseId,
        },
      });
      if (!assigned) {
        throw new ForbiddenException(
          "Bu kursga davomat kiritish uchun ruxsat yo'q",
        );
      }
    }

    const results = await this.dataSource.transaction(async (manager) => {
      const saved: Attendance[] = [];

      for (const record of dto.records) {
        // Mavjud yozuvni yangilash yoki yangi yaratish (upsert)
        const existing = await manager.findOne(Attendance, {
          where: {
            studentId: record.studentId,
            courseId: dto.courseId,
            lessonDate: dto.lessonDate,
          },
        });

        if (existing) {
          await manager.update(Attendance, existing.id, {
            status: record.status,
          });
          saved.push({ ...existing, status: record.status });
        } else {
          const attendance = manager.create(Attendance, {
            studentId: record.studentId,
            courseId: dto.courseId,
            lessonDate: dto.lessonDate,
            status: record.status,
          });
          await manager.save(attendance);
          saved.push(attendance);
        }
      }

      return saved;
    });

    // Har talaba uchun foiz tekshirish va ogohlantirish
    for (const record of dto.records) {
      const stats = await this.getStudentCourseStats(
        record.studentId,
        dto.courseId,
      );

      if (stats.warning) {
        this.eventEmitter.emit('attendance.warning', {
          studentId: record.studentId,
          courseId: dto.courseId,
          percentage: stats.percentage,
        });
      }
    }

    return { saved: results.length, records: results };
  }

  // ─── List ─────────────────────────────────────────────────────────────────
  async findAll(query: QueryAttendanceDto, currentUser: User) {
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.course', 'c')
      .orderBy('a.lesson_date', 'DESC');

    // RLS — talaba faqat o'z davomatini ko'radi
    if (currentUser.role === UserRole.STUDENT) {
      const student = await this.studentRepo.findOne({
        where: { userId: currentUser.id },
      });
      if (!student) throw new NotFoundException('Talaba topilmadi');
      qb.where('a.student_id = :studentId', { studentId: student.id });
    } else {
      if (query.studentId) {
        qb.where('a.student_id = :studentId', { studentId: query.studentId });
      }
    }

    if (query.courseId) {
      qb.andWhere('a.course_id = :courseId', { courseId: query.courseId });
    }

    const records = await qb.getMany();

    // Foiz statistikasi
    const stats = await this.getStudentCourseStats(
      query.studentId ?? '',
      query.courseId ?? '',
    );

    return { records, stats };
  }

  // ─── Update ───────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateAttendanceDto, currentUser: User) {
    const attendance = await this.attendanceRepo.findOne({ where: { id } });
    if (!attendance) throw new NotFoundException('Davomat yozuvi topilmadi');

    if (currentUser.role === UserRole.TEACHER) {
      const assigned = await this.teacherCourseRepo.findOne({
        where: {
          teacherUserId: currentUser.id,
          courseId: attendance.courseId,
        },
      });
      if (!assigned) {
        throw new ForbiddenException("Bu yozuvni tahrirlash uchun ruxsat yo'q");
      }
    }

    await this.attendanceRepo.update(id, { status: dto.status });
    return this.attendanceRepo.findOne({ where: { id } });
  }

  // ─── Foiz hisoblash ───────────────────────────────────────────────────────
  async getStudentCourseStats(
    studentId: string,
    courseId: string,
  ): Promise<AttendanceStats> {
    if (!studentId || !courseId) {
      return {
        courseId,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 100,
        warning: false,
      };
    }

    const records = await this.attendanceRepo.find({
      where: { studentId, courseId },
    });

    const total = records.length;
    const present = records.filter(
      (r) => r.status === AttendanceStatus.PRESENT,
    ).length;
    const late = records.filter(
      (r) => r.status === AttendanceStatus.LATE,
    ).length;
    const absent = records.filter(
      (r) => r.status === AttendanceStatus.ABSENT,
    ).length;

    // Late = 0.5 present sifatida hisoblanadi
    const effectivePresent = present + late * 0.5;
    const percentage =
      total > 0 ? Math.round((effectivePresent / total) * 100) : 100;

    return {
      courseId,
      total,
      present,
      absent,
      late,
      percentage,
      warning: percentage < 75, // TZ: 75% dan past — ogohlantirish
    };
  }
}
