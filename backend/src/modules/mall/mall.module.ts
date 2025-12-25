import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { MiniappUserModule } from './miniapp-user/miniapp-user.module';

@Module({
  imports: [
    CategoryModule,
    ProductModule,
    OrderModule,
    MiniappUserModule,
  ],
  exports: [
    CategoryModule,
    ProductModule,
    OrderModule,
    MiniappUserModule,
  ],
})
export class MallModule {}

