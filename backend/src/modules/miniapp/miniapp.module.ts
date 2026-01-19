import { Module } from '@nestjs/common';
import { MiniappUserModule } from './miniapp-user/miniapp-user.module';
import { UserCoupleModule } from './user-couple/user-couple.module';
import { CheckinRecordModule } from './checkin-record/checkin-record.module';
import { CheckinNotificationModule } from './checkin-notification/checkin-notification.module';
import { InviteCodeModule } from './invite-code/invite-code.module';

@Module({
  imports: [MiniappUserModule, UserCoupleModule, CheckinRecordModule, CheckinNotificationModule, InviteCodeModule],
  exports: [MiniappUserModule, UserCoupleModule, CheckinRecordModule, CheckinNotificationModule, InviteCodeModule],
})
export class MiniappModule {}
