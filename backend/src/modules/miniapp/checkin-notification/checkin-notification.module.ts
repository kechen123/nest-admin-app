import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckinNotification } from './checkin-notification.entity';
import { CheckinNotificationService } from './checkin-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([CheckinNotification])],
  providers: [CheckinNotificationService],
  exports: [CheckinNotificationService],
})
export class CheckinNotificationModule {}
