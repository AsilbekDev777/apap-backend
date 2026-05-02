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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { QueryAuditDto } from './dto/query-audit.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard statistika' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('faculties')
  @ApiOperation({ summary: "Fakultetlar ro'yxati" })
  getFaculties() {
    return this.adminService.getFaculties();
  }

  @Post('faculties')
  @ApiOperation({ summary: 'Fakultet yaratish' })
  createFaculty(@Body() dto: CreateFacultyDto) {
    return this.adminService.createFaculty(dto);
  }

  @Get('groups')
  @ApiOperation({ summary: "Guruhlar ro'yxati" })
  @ApiQuery({ name: 'facultyId', required: false })
  getGroups(@Query('facultyId') facultyId?: string) {
    return this.adminService.getGroups(facultyId);
  }

  @Post('groups')
  @ApiOperation({ summary: 'Guruh yaratish' })
  createGroup(@Body() dto: CreateGroupDto) {
    return this.adminService.createGroup(dto);
  }

  @Get('semesters')
  @ApiOperation({ summary: "Semestrlar ro'yxati" })
  getSemesters() {
    return this.adminService.getSemesters();
  }

  @Post('semesters')
  @ApiOperation({ summary: 'Semestr yaratish' })
  createSemester(@Body() dto: CreateSemesterDto) {
    return this.adminService.createSemester(dto);
  }

  @Put('semesters/:id/activate')
  @ApiOperation({ summary: 'Semesterni faollashtirish' })
  activateSemester(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.activateSemester(id);
  }

  @Get('courses')
  @ApiOperation({ summary: "Kurslar ro'yxati" })
  getCourses() {
    return this.adminService.getCourses();
  }

  @Post('courses')
  @ApiOperation({ summary: 'Kurs yaratish' })
  createCourse(@Body() dto: CreateCourseDto) {
    return this.adminService.createCourse(dto);
  }

  @Get('users')
  @ApiOperation({ summary: "Foydalanuvchilar ro'yxati" })
  @ApiQuery({ name: 'role', required: false })
  getUsers(@Query('role') role?: string) {
    return this.adminService.getUsers(role);
  }

  @Post('users')
  @ApiOperation({ summary: 'Foydalanuvchi yaratish' })
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Put('users/:id/toggle-status')
  @ApiOperation({ summary: 'Foydalanuvchini bloklash / faollashtirish' })
  toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  @Post('teacher-assignments')
  @ApiOperation({ summary: "O'qituvchini kursga biriktirish" })
  assignTeacher(@Body() dto: AssignTeacherDto) {
    return this.adminService.assignTeacher(dto);
  }

  @Get('teacher-assignments')
  @ApiOperation({ summary: "O'qituvchi biriktirishlari" })
  @ApiQuery({ name: 'teacherUserId', required: false })
  getAssignments(@Query('teacherUserId') teacherUserId?: string) {
    return this.adminService.getTeacherAssignments(teacherUserId);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Audit log' })
  getAuditLogs(@Query() query: QueryAuditDto) {
    return this.adminService.getAuditLogs(query);
  }
}
