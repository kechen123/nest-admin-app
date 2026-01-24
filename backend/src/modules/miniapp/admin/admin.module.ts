import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMiniappUserController } from './admin-miniapp-user.controller';
import { AdminMiniappUserService } from './admin-miniapp-user.service';
import { AdminInviteCodeController } from './admin-invite-code.controller';
import { AdminInviteCodeService } from './admin-invite-code.service';
import { AdminInviteConfigController } from './admin-invite-config.controller';
import { AdminInviteConfigService } from './admin-invite-config.service';
import { AdminCheckinController } from './admin-checkin.controller';
import { AdminCheckinService } from './admin-checkin.service';
import { MiniappUser } from '../miniapp-user/miniapp-user.entity';
import { InviteCode } from '../invite-code/invite-code.entity';
import { CheckinRecord } from '../checkin-record/checkin-record.entity';
import { InviteConfigModule } from '../invite-config/invite-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MiniappUser, InviteCode, CheckinRecord]),
    InviteConfigModule,
  ],
  controllers: [
    AdminMiniappUserController,
    AdminInviteCodeController,
    AdminInviteConfigController,
    AdminCheckinController,
  ],
  providers: [
    AdminMiniappUserService,
    AdminInviteCodeService,
    AdminInviteConfigService,
    AdminCheckinService,
  ],
  exports: [
    AdminMiniappUserService,
    AdminInviteCodeService,
    AdminInviteConfigService,
    AdminCheckinService,
  ],
})
export class AdminModule {}
