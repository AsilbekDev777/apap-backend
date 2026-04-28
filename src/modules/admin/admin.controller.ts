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

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // Fakultet
  @Get('faculties')
  getFaculties() {
    return this.adminService.getFaculties();
  }

  @Post('faculties')
  createFaculty(@Body() dto: CreateFacultyDto) {
    return this.adminService.createFaculty(dto);
  }

  // Guruh
  @Get('groups')
  getGroups(@Query('facultyId') facultyId?: string) {
    return this.adminService.getGroups(facultyId);
  }

  @Post('groups')
  createGroup(@Body() dto: CreateGroupDto) {
    return this.adminService.createGroup(dto);
  }

  // Semestr
  @Get('semesters')
  getSemesters() {
    return this.adminService.getSemesters();
  }

  @Post('semesters')
  createSemester(@Body() dto: CreateSemesterDto) {
    return this.adminService.createSemester(dto);
  }

  @Put('semesters/:id/activate')
  activateSemester(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.activateSemester(id);
  }

  // Kurs
  @Get('courses')
  getCourses() {
    return this.adminService.getCourses();
  }

  @Post('courses')
  createCourse(@Body() dto: CreateCourseDto) {
    return this.adminService.createCourse(dto);
  }

  // Foydalanuvchi
  @Get('users')
  getUsers(@Query('role') role?: string) {
    return this.adminService.getUsers(role);
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Put('users/:id/toggle-status')
  toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  // O'qituvchi biriktirish
  @Post('teacher-assignments')
  assignTeacher(@Body() dto: AssignTeacherDto) {
    return this.adminService.assignTeacher(dto);
  }

  @Get('teacher-assignments')
  getAssignments(@Query('teacherUserId') teacherUserId?: string) {
    return this.adminService.getTeacherAssignments(teacherUserId);
  }

  // Audit log
  @Get('audit')
  getAuditLogs(@Query() query: QueryAuditDto) {
    return this.adminService.getAuditLogs(query);
  }
}
