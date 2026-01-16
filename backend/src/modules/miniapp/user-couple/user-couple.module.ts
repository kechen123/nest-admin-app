import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCouple } from './user-couple.entity';
import { MiniappUser } from '../miniapp-user/miniapp-user.entity';
import { UserCoupleService } from './user-couple.service';
import { UserCoupleController } from './user-couple.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserCouple, MiniappUser])],
  controllers: [UserCoupleController],
  providers: [UserCoupleService],
  exports: [UserCoupleService],
})
export class UserCoupleModule {}
