import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditInterceptor } from '../../shared/interceptors/audit.interceptor';
import { Faculty } from '../../database/entities/faculty.entity';
import { Group } from '../../database/entities/group.entity';
import { Semester } from '../../database/entities/semester.entity';
import { Course } from '../../database/entities/course.entity';
import { User } from '../../database/entities/user.entity';
import { TeacherCourse } from '../../database/entities/teacher-course.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { GradeType } from '../../database/entities/grade-type.entity';
import { ParentStudent } from '../../database/entities/parent-student.entity';
import { Grade } from '../../database/entities/grade.entity';
import { GpaCache } from '../../database/entities/gpa-cache.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { Student } from '../../database/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Faculty,
      Group,
      Semester,
      Course,
      User,
      TeacherCourse,
      AuditLog,
      GradeType,
      ParentStudent,
      Grade,
      GpaCache,
      Attendance,
      Student,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AuditInterceptor],
  exports: [AdminService],
})
export class AdminModule {}
