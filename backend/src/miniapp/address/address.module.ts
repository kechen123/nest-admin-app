import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiniappAddressController } from './address.controller';
import { MiniappAddressService } from './address.service';
import { Address } from '../../common/entities/mall/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address])],
  controllers: [MiniappAddressController],
  providers: [MiniappAddressService],
  exports: [MiniappAddressService],
})
export class MiniappAddressModule {}

