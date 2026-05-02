import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceStats } from './dto/attendance-stats.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UserRole, User } from '../../database/entities/user.entity';

@ApiTags('Attendance')
@ApiBearerAuth('access-token')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('bulk')
  @ApiOperation({ summary: "Guruh bo'yicha davomat kiritish" })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  bulkCreate(@Body() dto: BulkAttendanceDto, @CurrentUser() user: User) {
    return this.attendanceService.bulkCreate(dto, user);
  }

  @Get()
  @ApiOperation({ summary: "Davomat ro'yxati" })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  findAll(@Query() query: QueryAttendanceDto, @CurrentUser() user: User) {
    return this.attendanceService.findAll(query, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Davomat yozuvini yangilash' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser() user: User,
  ) {
    return this.attendanceService.update(id, dto, user);
  }

  @Get('stats/:studentId/:courseId')
  @ApiOperation({ summary: 'Davomat statistikasi (foiz)' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  getStats(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<AttendanceStats> {
    return this.attendanceService.getStudentCourseStats(studentId, courseId);
  }
}
