import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { GpaCalculator } from './gpa.calculator';
import { Grade } from '../../database/entities/grade.entity';
import { GpaCache } from '../../database/entities/gpa-cache.entity';
import { Student } from '../../database/entities/student.entity';
import { TeacherCourse } from '../../database/entities/teacher-course.entity';
import { GradeType } from '../../database/entities/grade-type.entity';
import { Course } from '../../database/entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Grade,
      GpaCache,
      Student,
      TeacherCourse,
      GradeType,
      Course,
    ]),
  ],
  controllers: [GradesController],
  providers: [GradesService, GpaCalculator],
  exports: [GradesService, GpaCalculator],
})
export class GradesModule {}
