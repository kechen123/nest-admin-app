import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { Banner } from '../../../common/entities/mall/banner.entity';
import { OperationLogModule } from '../../operation-log/operation-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner]),
    OperationLogModule,
  ],
  controllers: [BannerController],
  providers: [BannerService],
  exports: [BannerService],
})
export class BannerModule {}

