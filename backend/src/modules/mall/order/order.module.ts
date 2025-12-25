import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '../../../common/entities/mall/order.entity';
import { OperationLogModule } from '../../operation-log/operation-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    OperationLogModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

