import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiniappUserController } from './user.controller';
import { MiniappUserService } from './user.service';
import { MiniappUser } from '../../common/entities/mall/miniapp-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MiniappUser])],
  controllers: [MiniappUserController],
  providers: [MiniappUserService],
  exports: [MiniappUserService],
})
export class MiniappUserModule {}

