import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { Notification } from '../../database/entities/notification.entity';
import { Student } from '../../database/entities/student.entity';
import { ParentStudent } from '../../database/entities/parent-student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Student, ParentStudent]),
    JwtModule.register({}),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
