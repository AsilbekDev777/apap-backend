import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { Response } from 'express'; // ← type import
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UserRole, User } from '../../database/entities/user.entity';
import { ReportFormat } from '../../database/entities/report-job.entity';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: "Report so'rash (async)" })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  create(@Body() dto: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Mening reportlarim' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAll(@CurrentUser() user: User) {
    return this.reportsService.findAll(user);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Report holati' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getStatus(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.reportsService.getStatus(id, user);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Reportni yuklab olish' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const reportJob = await this.reportsService.getStatus(id, user);
    const buffer = await this.reportsService.download(id, user);

    const isPdf = reportJob.format === ReportFormat.PDF;
    const ext = isPdf ? 'pdf' : 'xlsx';
    const contentType = isPdf
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="report-${id}.${ext}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
