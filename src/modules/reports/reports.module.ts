import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsProcessor } from './reports.processor';
import { PdfGenerator } from './generators/pdf.generator';
import { ExcelGenerator } from './generators/excel.generator';
import { ReportJob } from '../../database/entities/report-job.entity';
import { Student } from '../../database/entities/student.entity';
import { Grade } from '../../database/entities/grade.entity';
import { GpaCache } from '../../database/entities/gpa-cache.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportJob, Student, Grade, GpaCache]),
    BullModule.registerQueue({ name: 'reports' }),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsProcessor, PdfGenerator, ExcelGenerator],
  exports: [ReportsService],
})
export class ReportsModule {}
