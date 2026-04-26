import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Student } from '../../database/entities/student.entity';
import { User, UserRole, UserLang } from '../../database/entities/user.entity';
import { ParentStudent } from '../../database/entities/parent-student.entity';
import { Group } from '../../database/entities/group.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(ParentStudent)
    private parentStudentRepo: Repository<ParentStudent>,

    @InjectRepository(Group)
    private groupRepo: Repository<Group>,

    private dataSource: DataSource,
  ) {}

  // ─── List ─────────────────────────────────────────────────────────────────
  async findAll(query: QueryStudentDto) {
    const { search, groupId, facultyId, page = 1, limit = 50 } = query;

    const qb = this.studentRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .leftJoinAndSelect('s.group', 'g')
      .leftJoinAndSelect('g.faculty', 'f')
      .where('s.is_deleted = false');

    if (search) {
      qb.andWhere(
        '(s.first_name ILIKE :search OR s.last_name ILIKE :search OR s.student_number ILIKE :search OR u.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (groupId) {
      qb.andWhere('s.group_id = :groupId', { groupId });
    }

    if (facultyId) {
      qb.andWhere('g.faculty_id = :facultyId', { facultyId });
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Find One ─────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const student = await this.studentRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['user', 'group', 'group.faculty'],
    });

    if (!student) throw new NotFoundException('Talaba topilmadi');
    return student;
  }

  // ─── Create ───────────────────────────────────────────────────────────────
  async create(dto: CreateStudentDto) {
    // Email unique tekshirish
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existingUser) throw new ConflictException('Bu email allaqachon mavjud');

    // Student number unique tekshirish
    const existingStudent = await this.studentRepo.findOne({
      where: { studentNumber: dto.studentNumber },
    });
    if (existingStudent) {
      throw new ConflictException('Bu talaba raqami allaqachon mavjud');
    }

    // Group mavjudligini tekshirish
    const group = await this.groupRepo.findOne({ where: { id: dto.groupId } });
    if (!group) throw new NotFoundException('Guruh topilmadi');

    // Transaction — user + student birga yaratiladi
    return this.dataSource.transaction(async (manager) => {
      const hash = await bcrypt.hash(dto.password, 12);

      const user = manager.create(User, {
        email: dto.email,
        passwordHash: hash,
        role: UserRole.STUDENT,
        lang: UserLang.UZ,
        isActive: true,
      });
      await manager.save(user);

      const student = manager.create(Student, {
        userId: user.id,
        groupId: dto.groupId,
        studentNumber: dto.studentNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
      await manager.save(student);

      // Ota-ona bog'lash (ixtiyoriy)
      if (dto.parentUserId) {
        const parentUser = await this.userRepo.findOne({
          where: { id: dto.parentUserId, role: UserRole.PARENT },
        });
        if (!parentUser) throw new NotFoundException('Ota-ona topilmadi');

        const link = manager.create(ParentStudent, {
          parentUserId: dto.parentUserId,
          studentId: student.id,
        });
        await manager.save(link);
      }

      return student;
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.findOne(id);

    if (dto.groupId) {
      const group = await this.groupRepo.findOne({
        where: { id: dto.groupId },
      });
      if (!group) throw new NotFoundException('Guruh topilmadi');
    }

    if (dto.studentNumber && dto.studentNumber !== student.studentNumber) {
      const existing = await this.studentRepo.findOne({
        where: { studentNumber: dto.studentNumber },
      });
      if (existing) {
        throw new ConflictException('Bu talaba raqami allaqachon mavjud');
      }
    }

    Object.assign(student, dto);
    return this.studentRepo.save(student);
  }

  // ─── Soft Delete ──────────────────────────────────────────────────────────
  async remove(id: string) {
    const student = await this.findOne(id);
    await this.studentRepo.update(student.id, { isDeleted: true });
    return { message: "Talaba o'chirildi" };
  }

  // ─── CSV Import ───────────────────────────────────────────────────────────
  async importCsv(buffer: Buffer) {
    const content = buffer.toString('utf-8');
    const lines = content.split('\n').filter((l) => l.trim());

    // Header: email,password,firstName,lastName,studentNumber,groupId
    const [header, ...rows] = lines;
    const headers = header.split(',').map((h) => h.trim());

    const required = [
      'email',
      'password',
      'firstName',
      'lastName',
      'studentNumber',
      'groupId',
    ];

    const missing = required.filter((r) => !headers.includes(r));
    if (missing.length > 0) {
      throw new BadRequestException(
        `CSV headerda yo'q ustunlar: ${missing.join(', ')}`,
      );
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < rows.length; i++) {
      const values = rows[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => (row[h] = values[idx] ?? ''));

      try {
        await this.create({
          email: row['email'],
          password: row['password'],
          firstName: row['firstName'],
          lastName: row['lastName'],
          studentNumber: row['studentNumber'],
          groupId: row['groupId'],
        });
        results.success++;
      } catch (err) {
        results.failed++;
        const message = err instanceof Error ? err.message : "Noma'lum xato";
        results.errors.push(`Qator ${i + 2}: ${message}`);
      }
    }

    return results;
  }
}
