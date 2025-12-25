import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiniappCartController } from './cart.controller';
import { MiniappCartService } from './cart.service';
import { CartItem } from '../../common/entities/mall/cart-item.entity';
import { ProductSku } from '../../common/entities/mall/product-sku.entity';
import { Product } from '../../common/entities/mall/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, ProductSku, Product])],
  controllers: [MiniappCartController],
  providers: [MiniappCartService],
  exports: [MiniappCartService],
})
export class MiniappCartModule {}

