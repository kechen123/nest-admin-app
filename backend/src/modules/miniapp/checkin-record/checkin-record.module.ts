import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckinRecord } from './checkin-record.entity';
import { CheckinRecordService } from './checkin-record.service';
import { CheckinRecordController } from './checkin-record.controller';
import { UserCoupleModule } from '../user-couple/user-couple.module';
import { CheckinNotificationModule } from '../checkin-notification/checkin-notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckinRecord]),
    UserCoupleModule,
    CheckinNotificationModule,
  ],
  controllers: [CheckinRecordController],
  providers: [CheckinRecordService],
  exports: [CheckinRecordService],
})
export class CheckinRecordModule {}
