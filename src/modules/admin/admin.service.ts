import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Faculty } from '../../database/entities/faculty.entity';
import { Group } from '../../database/entities/group.entity';
import { Semester } from '../../database/entities/semester.entity';
import { Course } from '../../database/entities/course.entity';
import { User } from '../../database/entities/user.entity';
import { TeacherCourse } from '../../database/entities/teacher-course.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { QueryAuditDto } from './dto/query-audit.dto';
import { UserRole } from '../../database/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Faculty)
    private facultyRepo: Repository<Faculty>,

    @InjectRepository(Group)
    private groupRepo: Repository<Group>,

    @InjectRepository(Semester)
    private semesterRepo: Repository<Semester>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(TeacherCourse)
    private teacherCourseRepo: Repository<TeacherCourse>,

    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  // ─── Fakultet ─────────────────────────────────────────────────────────────
  async getFaculties() {
    return this.facultyRepo.find({ order: { code: 'ASC' } });
  }

  async createFaculty(dto: CreateFacultyDto) {
    const existing = await this.facultyRepo.findOne({
      where: { code: dto.code },
    });
    if (existing) throw new ConflictException('Bu kod allaqachon mavjud');

    return this.facultyRepo.save(dto);
  }

  // ─── Guruh ────────────────────────────────────────────────────────────────
  async getGroups(facultyId?: string) {
    return this.groupRepo.find({
      where: facultyId ? { facultyId } : {},
      relations: ['faculty'],
      order: { name: 'ASC' },
    });
  }

  async createGroup(dto: CreateGroupDto) {
    const faculty = await this.facultyRepo.findOne({
      where: { id: dto.facultyId },
    });
    if (!faculty) throw new NotFoundException('Fakultet topilmadi');

    return this.groupRepo.save(dto);
  }

  // ─── Semestr ──────────────────────────────────────────────────────────────
  async getSemesters() {
    return this.semesterRepo.find({ order: { startDate: 'DESC' } });
  }

  async createSemester(dto: CreateSemesterDto) {
    // Faqat bitta active semestr bo'lishi kerak
    if (dto.isActive) {
      await this.semesterRepo.update({ isActive: true }, { isActive: false });
    }
    return this.semesterRepo.save(dto);
  }

  async activateSemester(id: string) {
    const semester = await this.semesterRepo.findOne({ where: { id } });
    if (!semester) throw new NotFoundException('Semestr topilmadi');

    await this.semesterRepo.update({ isActive: true }, { isActive: false });
    await this.semesterRepo.update(id, { isActive: true });

    return { message: 'Semestr faollashtirildi' };
  }

  // ─── Kurs ─────────────────────────────────────────────────────────────────
  async getCourses() {
    return this.courseRepo.find({ order: { code: 'ASC' } });
  }

  async createCourse(dto: CreateCourseDto) {
    const existing = await this.courseRepo.findOne({
      where: { code: dto.code },
    });
    if (existing) throw new ConflictException('Bu kod allaqachon mavjud');

    return this.courseRepo.save(dto);
  }

  // ─── Foydalanuvchi ────────────────────────────────────────────────────────
  async getUsers(role?: string) {
    const where = role ? { role: role as UserRole } : {};
    return this.userRepo.find({
      where,
      select: [
        'id',
        'email',
        'role',
        'lang',
        'isActive',
        'lastLogin',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Bu email allaqachon mavjud');

    const hash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: hash,
      role: dto.role,
      lang: dto.lang,
      isActive: true,
    });

    await this.userRepo.save(user);

    // Destructuring o'rniga to'g'ridan maydonlarni qaytaramiz
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      lang: user.lang,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async toggleUserStatus(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    await this.userRepo.update(id, { isActive: !user.isActive });
    return {
      message: user.isActive ? 'Bloklandi' : 'Faollashtirildi',
    };
  }

  // ─── O'qituvchi kursga biriktirish ────────────────────────────────────────
  async assignTeacher(dto: AssignTeacherDto) {
    const existing = await this.teacherCourseRepo.findOne({
      where: {
        teacherUserId: dto.teacherUserId,
        courseId: dto.courseId,
        groupId: dto.groupId,
        semesterId: dto.semesterId,
      },
    });
    if (existing)
      throw new ConflictException('Bu biriktirish allaqachon mavjud');

    return this.teacherCourseRepo.save(dto);
  }

  async getTeacherAssignments(teacherUserId?: string) {
    return this.teacherCourseRepo.find({
      where: teacherUserId ? { teacherUserId } : {},
      relations: ['course', 'group', 'semester'],
    });
  }

  // ─── Audit log ────────────────────────────────────────────────────────────
  async getAuditLogs(query: QueryAuditDto) {
    const {
      userId,
      action,
      entityType,
      from,
      to,
      page = 1,
      limit = 50,
    } = query;

    const qb = this.auditRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'u')
      .orderBy('a.created_at', 'DESC');

    if (userId) qb.andWhere('a.user_id = :userId', { userId });
    if (action) qb.andWhere('a.action = :action', { action });
    if (entityType) qb.andWhere('a.entity_type = :entityType', { entityType });
    if (from) qb.andWhere('a.created_at >= :from', { from });
    if (to) qb.andWhere('a.created_at <= :to', { to });

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Dashboard statistika ─────────────────────────────────────────────────
  async getDashboardStats() {
    const [totalStudents, totalTeachers, totalCourses, activeSemester] =
      await Promise.all([
        this.userRepo.count({
          where: { role: UserRole.STUDENT, isActive: true },
        }),
        this.userRepo.count({
          where: { role: UserRole.TEACHER, isActive: true },
        }),
        this.courseRepo.count(),
        this.semesterRepo.findOne({ where: { isActive: true } }),
      ]);

    return { totalStudents, totalTeachers, totalCourses, activeSemester };
  }
}
