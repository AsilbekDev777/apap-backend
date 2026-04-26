import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from '../../database/entities/student.entity';
import { User } from '../../database/entities/user.entity';
import { ParentStudent } from '../../database/entities/parent-student.entity';
import { Group } from '../../database/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, User, ParentStudent, Group])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
