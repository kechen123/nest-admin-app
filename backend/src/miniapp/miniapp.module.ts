import { Module } from '@nestjs/common';
import { MiniappAuthModule } from './auth/auth.module';
import { MiniappProductModule } from './product/product.module';
import { MiniappCartModule } from './cart/cart.module';
import { MiniappOrderModule } from './order/order.module';
import { MiniappAddressModule } from './address/address.module';
import { MiniappUserModule } from './user/user.module';
import { MiniappBannerModule } from './banner/banner.module';

@Module({
  imports: [
    MiniappAuthModule,
    MiniappProductModule,
    MiniappCartModule,
    MiniappOrderModule,
    MiniappAddressModule,
    MiniappUserModule,
    MiniappBannerModule,
  ],
  exports: [
    MiniappAuthModule,
    MiniappProductModule,
    MiniappCartModule,
    MiniappOrderModule,
    MiniappAddressModule,
    MiniappUserModule,
    MiniappBannerModule,
  ],
})
export class MiniappModule {}

