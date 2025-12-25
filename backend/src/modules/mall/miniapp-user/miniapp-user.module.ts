import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiniappUserController } from './miniapp-user.controller';
import { MiniappUserService } from './miniapp-user.service';
import { MiniappUser } from '../../../common/entities/mall/miniapp-user.entity';
import { OperationLogModule } from '../../operation-log/operation-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MiniappUser]),
    OperationLogModule,
  ],
  controllers: [MiniappUserController],
  providers: [MiniappUserService],
  exports: [MiniappUserService],
})
export class MiniappUserModule {}

