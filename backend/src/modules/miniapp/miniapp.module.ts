import { Module } from '@nestjs/common';
import { MiniappUserModule } from './miniapp-user/miniapp-user.module';
import { UserCoupleModule } from './user-couple/user-couple.module';
import { CheckinRecordModule } from './checkin-record/checkin-record.module';
import { CheckinNotificationModule } from './checkin-notification/checkin-notification.module';

@Module({
  imports: [MiniappUserModule, UserCoupleModule, CheckinRecordModule, CheckinNotificationModule],
  exports: [MiniappUserModule, UserCoupleModule, CheckinRecordModule, CheckinNotificationModule],
})
export class MiniappModule {}
