import { Processor, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Job } from 'bull'; // ← type import
import {
  ReportJob,
  ReportStatus,
  ReportFormat,
  ReportType,
} from '../../database/entities/report-job.entity';
import { Student } from '../../database/entities/student.entity';
import { Grade } from '../../database/entities/grade.entity';
import { GpaCache } from '../../database/entities/gpa-cache.entity';
import { PdfGenerator } from './generators/pdf.generator';
import { ExcelGenerator } from './generators/excel.generator';
import { RedisService } from '../../shared/redis/redis.service';

export interface ReportJobData {
  reportJobId: string;
  studentId?: string;
  groupId?: string;
  semesterId?: string;
}

@Injectable()
@Processor('reports')
export class ReportsProcessor {
  private readonly logger = new Logger(ReportsProcessor.name);

  constructor(
    @InjectRepository(ReportJob)
    private reportJobRepo: Repository<ReportJob>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    @InjectRepository(Grade)
    private gradeRepo: Repository<Grade>,

    @InjectRepository(GpaCache)
    private gpaCacheRepo: Repository<GpaCache>,

    private pdfGenerator: PdfGenerator,
    private excelGenerator: ExcelGenerator,
    private redis: RedisService,
  ) {}

  @Process('generate')
  async handleGenerate(job: Job<ReportJobData>) {
    const { reportJobId, studentId, groupId, semesterId } = job.data;

    await this.reportJobRepo.update(reportJobId, {
      status: ReportStatus.PROCESSING,
    });

    try {
      const reportJob = await this.reportJobRepo.findOne({
        where: { id: reportJobId },
      });

      if (!reportJob) throw new Error('Report job topilmadi');

      let fileBuffer: Buffer;
      let fileKey: string;

      if (
        reportJob.type === ReportType.STUDENT_CARD &&
        reportJob.format === ReportFormat.PDF &&
        studentId &&
        semesterId
      ) {
        fileBuffer = await this.generateStudentPdf(studentId, semesterId);
        fileKey = `reports/student-${studentId}-${semesterId}.pdf`;
      } else if (
        reportJob.type === ReportType.GROUP_REPORT &&
        reportJob.format === ReportFormat.EXCEL &&
        groupId &&
        semesterId
      ) {
        fileBuffer = await this.generateGroupExcel(groupId, semesterId);
        fileKey = `reports/group-${groupId}-${semesterId}.xlsx`;
      } else {
        throw new Error("Noto'g'ri report parametrlari");
      }

      await this.redis.setex(fileKey, 3600, fileBuffer.toString('base64'));

      await this.reportJobRepo.update(reportJobId, {
        status: ReportStatus.READY,
        fileKey,
      });

      this.logger.log(`Report tayyor: ${fileKey}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Noma'lum xato";
      this.logger.error(`Report xato: ${message}`);

      await this.reportJobRepo.update(reportJobId, {
        status: ReportStatus.FAILED,
        error: message,
      });
    }
  }

  private async generateStudentPdf(
    studentId: string,
    semesterId: string,
  ): Promise<Buffer> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['group', 'group.faculty'],
    });
    if (!student) throw new Error('Talaba topilmadi');

    const grades = await this.gradeRepo.find({
      where: { studentId, semesterId },
      relations: ['gradeType', 'course'],
    });

    const gpaCache = await this.gpaCacheRepo.findOne({
      where: { studentId, semesterId },
    });

    return this.pdfGenerator.generateStudentCard({
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        studentNumber: student.studentNumber,
        group: student.group.name,
        faculty: student.group.faculty.nameUz,
      },
      grades: grades.map((g) => ({
        courseName: g.course.nameUz,
        gradeTypeName: g.gradeType.nameUz,
        score: Number(g.score),
      })),
      gpa100: gpaCache ? Number(gpaCache.gpa100) : 0,
      gpa5: gpaCache ? Number(gpaCache.gpa5) : 0,
      semester: semesterId,
    });
  }

  private async generateGroupExcel(
    groupId: string,
    semesterId: string,
  ): Promise<Buffer> {
    const students = await this.studentRepo.find({
      where: { groupId, isDeleted: false },
      relations: ['group'],
    });

    if (students.length === 0) throw new Error("Guruhda talabalar yo'q");

    const studentsWithGpa = await Promise.all(
      students.map(async (student) => {
        const gpaCache = await this.gpaCacheRepo.findOne({
          where: { studentId: student.id, semesterId },
        });
        return {
          firstName: student.firstName,
          lastName: student.lastName,
          studentNumber: student.studentNumber,
          gpa100: gpaCache ? Number(gpaCache.gpa100) : 0,
          gpa5: gpaCache ? Number(gpaCache.gpa5) : 0,
        };
      }),
    );

    return this.excelGenerator.generateGroupReport({
      groupName: students[0].group.name,
      semester: semesterId,
      students: studentsWithGpa,
    });
  }
}
