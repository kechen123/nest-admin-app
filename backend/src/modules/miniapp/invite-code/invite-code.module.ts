import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteCodeController } from './invite-code.controller';
import { InviteCodeService } from './invite-code.service';
import { InviteCode } from './invite-code.entity';
import { MiniappUser } from '../miniapp-user/miniapp-user.entity';
import { UserCoupleModule } from '../user-couple/user-couple.module';
import { InviteConfigModule } from '../invite-config/invite-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InviteCode, MiniappUser]),
    UserCoupleModule,
    InviteConfigModule,
  ],
  controllers: [InviteCodeController],
  providers: [InviteCodeService],
  exports: [InviteCodeService],
})
export class InviteCodeModule {}