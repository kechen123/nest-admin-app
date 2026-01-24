import { Module } from '@nestjs/common';
import { MiniappUserModule } from './miniapp-user/miniapp-user.module';
import { UserCoupleModule } from './user-couple/user-couple.module';
import { CheckinRecordModule } from './checkin-record/checkin-record.module';
import { CheckinNotificationModule } from './checkin-notification/checkin-notification.module';
import { InviteCodeModule } from './invite-code/invite-code.module';
import { InviteConfigModule } from './invite-config/invite-config.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [MiniappUserModule, UserCoupleModule, CheckinRecordModule, CheckinNotificationModule, InviteCodeModule, InviteConfigModule, AdminModule],
  exports: [MiniappUserModule, UserCoupleModule, CheckinRecordModule, CheckinNotificationModule, InviteCodeModule, InviteConfigModule, AdminModule],
})
export class MiniappModule {}
