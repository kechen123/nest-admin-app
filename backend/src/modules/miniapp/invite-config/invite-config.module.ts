import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteConfigService } from './invite-config.service';
import { InviteConfigController } from './invite-config.controller';
import { InviteConfig } from './invite-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InviteConfig])],
  controllers: [InviteConfigController],
  providers: [InviteConfigService],
  exports: [InviteConfigService],
})
export class InviteConfigModule {}
