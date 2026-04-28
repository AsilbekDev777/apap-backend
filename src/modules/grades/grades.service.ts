import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Grade } from '../../database/entities/grade.entity';
import { GpaCache } from '../../database/entities/gpa-cache.entity';
import { Student } from '../../database/entities/student.entity';
import { TeacherCourse } from '../../database/entities/teacher-course.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { QueryGradeDto } from './dto/query-grade.dto';
import { GpaCalculator } from './gpa.calculator';
import { RedisService } from '../../shared/redis/redis.service';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepo: Repository<Grade>,

    @InjectRepository(GpaCache)
    private gpaCacheRepo: Repository<GpaCache>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    @InjectRepository(TeacherCourse)
    private teacherCourseRepo: Repository<TeacherCourse>,

    private redis: RedisService,
    private dataSource: DataSource,
    private gpaCalculator: GpaCalculator,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(query: QueryGradeDto, currentUser: User) {
    const qb = this.gradeRepo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.gradeType', 'gt')
      .leftJoinAndSelect('g.course', 'c')
      .leftJoinAndSelect('g.semester', 's');

    if (currentUser.role === UserRole.STUDENT) {
      const student = await this.studentRepo.findOne({
        where: { userId: currentUser.id },
      });
      if (!student) throw new NotFoundException('Talaba topilmadi');
      qb.where('g.student_id = :studentId', { studentId: student.id });
    } else {
      if (query.studentId) {
        qb.where('g.student_id = :studentId', { studentId: query.studentId });
      }
    }

    if (query.semesterId) {
      qb.andWhere('g.semester_id = :semesterId', {
        semesterId: query.semesterId,
      });
    }

    if (query.courseId) {
      qb.andWhere('g.course_id = :courseId', { courseId: query.courseId });
    }

    return qb.getMany();
  }

  async create(dto: CreateGradeDto, currentUser: User) {
    if (currentUser.role === UserRole.TEACHER) {
      const assigned = await this.teacherCourseRepo.findOne({
        where: {
          teacherUserId: currentUser.id,
          courseId: dto.courseId,
          semesterId: dto.semesterId,
        },
      });
      if (!assigned) {
        throw new ForbiddenException(
          "Bu kursga baho qo'yish uchun ruxsat yo'q",
        );
      }
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const grade = manager.create(Grade, {
        studentId: dto.studentId,
        courseId: dto.courseId,
        semesterId: dto.semesterId,
        gradeTypeId: dto.gradeTypeId,
        score: dto.score,
        enteredById: currentUser.id,
      });
      await manager.save(grade);

      const gpa = await this.gpaCalculator.recalculate(
        dto.studentId,
        dto.semesterId,
        manager,
      );

      return { grade, gpa };
    });

    await this.redis.del(`gpa:${dto.studentId}:${dto.semesterId}`);

    this.eventEmitter.emit('grade.created', {
      studentId: dto.studentId,
      courseId: dto.courseId,
      score: dto.score,
      gpa: result.gpa,
    });

    return {
      ...result.grade,
      gpa100: result.gpa.gpa100,
      gpa5: result.gpa.gpa5,
    };
  }

  async update(id: string, dto: UpdateGradeDto, currentUser: User) {
    const grade = await this.gradeRepo.findOne({ where: { id } });
    if (!grade) throw new NotFoundException('Baho topilmadi');

    if (currentUser.role === UserRole.TEACHER) {
      const assigned = await this.teacherCourseRepo.findOne({
        where: {
          teacherUserId: currentUser.id,
          courseId: grade.courseId,
          semesterId: grade.semesterId,
        },
      });
      if (!assigned) {
        throw new ForbiddenException("Bu bahoni yangilash uchun ruxsat yo'q");
      }
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Grade, id, { score: dto.score });
      await this.gpaCalculator.recalculate(
        grade.studentId,
        grade.semesterId,
        manager,
      );
    });

    await this.redis.del(`gpa:${grade.studentId}:${grade.semesterId}`);

    return this.gradeRepo.findOne({
      where: { id },
      relations: ['gradeType', 'course'],
    });
  }

  async getGpa(studentId: string, semesterId: string) {
    const cacheKey = `gpa:${studentId}:${semesterId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as { gpa100: number; gpa5: number };
    }

    const gpaCache = await this.gpaCacheRepo.findOne({
      where: { studentId, semesterId },
    });

    if (!gpaCache) {
      return { gpa100: 0, gpa5: 0 };
    }

    const result = {
      gpa100: Number(gpaCache.gpa100),
      gpa5: Number(gpaCache.gpa5),
    };

    await this.redis.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }
}
