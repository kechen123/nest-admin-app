import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiniappUser } from './miniapp-user.entity';
import { MiniappUserService } from './miniapp-user.service';
import { MiniappUserController } from './miniapp-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MiniappUser])],
  controllers: [MiniappUserController],
  providers: [MiniappUserService],
  exports: [MiniappUserService],
})
export class MiniappUserModule {}
