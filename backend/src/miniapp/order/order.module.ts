import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiniappOrderController } from './order.controller';
import { MiniappOrderService } from './order.service';
import { Order } from '../../common/entities/mall/order.entity';
import { OrderItem } from '../../common/entities/mall/order-item.entity';
import { CartItem } from '../../common/entities/mall/cart-item.entity';
import { Address } from '../../common/entities/mall/address.entity';
import { ProductSku } from '../../common/entities/mall/product-sku.entity';
import { Product } from '../../common/entities/mall/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, CartItem, Address, ProductSku, Product])],
  controllers: [MiniappOrderController],
  providers: [MiniappOrderService],
  exports: [MiniappOrderService],
})
export class MiniappOrderModule {}

