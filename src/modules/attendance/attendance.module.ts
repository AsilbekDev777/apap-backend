import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance } from '../../database/entities/attendance.entity';
import { Student } from '../../database/entities/student.entity';
import { TeacherCourse } from '../../database/entities/teacher-course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Student, TeacherCourse])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
