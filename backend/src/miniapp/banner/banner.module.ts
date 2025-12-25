import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiniappBannerController } from './banner.controller';
import { MiniappBannerService } from './banner.service';
import { Banner } from '../../common/entities/mall/banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  controllers: [MiniappBannerController],
  providers: [MiniappBannerService],
  exports: [MiniappBannerService],
})
export class MiniappBannerModule {}

