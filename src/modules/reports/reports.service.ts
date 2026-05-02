import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull'; // ← type import
import {
  ReportJob,
  ReportStatus,
} from '../../database/entities/report-job.entity';
import { User } from '../../database/entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { RedisService } from '../../shared/redis/redis.service';
import { ReportJobData } from './reports.processor';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportJob)
    private reportJobRepo: Repository<ReportJob>,

    @InjectQueue('reports')
    private reportsQueue: Queue,

    private redis: RedisService,
  ) {}

  async create(dto: CreateReportDto, currentUser: User) {
    if (!dto.studentId && !dto.groupId) {
      throw new BadRequestException('studentId yoki groupId kerak');
    }

    const reportJob = await this.reportJobRepo.save({
      requestedById: currentUser.id,
      type: dto.type,
      format: dto.format,
      status: ReportStatus.PENDING,
    });

    const jobData: ReportJobData = {
      reportJobId: reportJob.id,
      studentId: dto.studentId,
      groupId: dto.groupId,
      semesterId: dto.semesterId,
    };

    await this.reportsQueue.add('generate', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    return {
      reportJobId: reportJob.id,
      status: ReportStatus.PENDING,
      message: 'Report tayyorlanmoqda...',
    };
  }

  async getStatus(id: string, currentUser: User) {
    const reportJob = await this.reportJobRepo.findOne({
      where: { id, requestedById: currentUser.id },
    });

    if (!reportJob) throw new NotFoundException('Report topilmadi');

    return {
      id: reportJob.id,
      status: reportJob.status,
      type: reportJob.type,
      format: reportJob.format,
      fileKey: reportJob.fileKey,
      error: reportJob.error,
      createdAt: reportJob.createdAt,
    };
  }

  async download(id: string, currentUser: User): Promise<Buffer> {
    const reportJob = await this.reportJobRepo.findOne({
      where: { id, requestedById: currentUser.id },
    });

    if (!reportJob) throw new NotFoundException('Report topilmadi');
    if (reportJob.status !== ReportStatus.READY) {
      throw new BadRequestException('Report hali tayyor emas');
    }
    if (!reportJob.fileKey) {
      throw new BadRequestException('Fayl topilmadi');
    }

    const cached = await this.redis.get(reportJob.fileKey);
    if (!cached) {
      throw new BadRequestException("Fayl muddati o'tgan, qayta so'rang");
    }

    return Buffer.from(cached, 'base64');
  }

  async findAll(currentUser: User) {
    return this.reportJobRepo.find({
      where: { requestedById: currentUser.id },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}
