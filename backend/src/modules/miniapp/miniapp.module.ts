import { Module } from '@nestjs/common';
import { MiniappUserModule } from './miniapp-user/miniapp-user.module';
import { UserCoupleModule } from './user-couple/user-couple.module';
import { CheckinRecordModule } from './checkin-record/checkin-record.module';

@Module({
  imports: [MiniappUserModule, UserCoupleModule, CheckinRecordModule],
  exports: [MiniappUserModule, UserCoupleModule, CheckinRecordModule],
})
export class MiniappModule {}
