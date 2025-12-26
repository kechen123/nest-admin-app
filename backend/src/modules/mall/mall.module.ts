import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { ProductSkuModule } from './product-sku/product-sku.module';
import { OrderModule } from './order/order.module';
import { MiniappUserModule } from './miniapp-user/miniapp-user.module';

@Module({
  imports: [
    CategoryModule,
    ProductModule,
    ProductSkuModule,
    OrderModule,
    MiniappUserModule,
  ],
  exports: [
    CategoryModule,
    ProductModule,
    ProductSkuModule,
    OrderModule,
    MiniappUserModule,
  ],
})
export class MallModule {}

