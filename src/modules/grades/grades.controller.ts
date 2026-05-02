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
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { QueryGradeDto } from './dto/query-grade.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UserRole, User } from '../../database/entities/user.entity';

@ApiTags('Grades')
@ApiBearerAuth('access-token')
@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  @ApiOperation({ summary: "Baholar ro'yxati" })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  findAll(@Query() query: QueryGradeDto, @CurrentUser() user: User) {
    return this.gradesService.findAll(query, user);
  }

  @Post()
  @ApiOperation({ summary: 'Baho kiritish' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  create(@Body() dto: CreateGradeDto, @CurrentUser() user: User) {
    return this.gradesService.create(dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Bahoni yangilash' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGradeDto,
    @CurrentUser() user: User,
  ) {
    return this.gradesService.update(id, dto, user);
  }

  @Get('gpa/:studentId/:semesterId')
  @ApiOperation({ summary: "GPA ko'rish (Redis cached)" })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  getGpa(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('semesterId', ParseUUIDPipe) semesterId: string,
  ) {
    return this.gradesService.getGpa(studentId, semesterId);
  }
}
