import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSkuController } from './product-sku.controller';
import { ProductSkuService } from './product-sku.service';
import { ProductSku } from '../../../common/entities/mall/product-sku.entity';
import { Product } from '../../../common/entities/mall/product.entity';
import { OperationLogModule } from '../../operation-log/operation-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductSku, Product]),
    OperationLogModule,
  ],
  controllers: [ProductSkuController],
  providers: [ProductSkuService],
  exports: [ProductSkuService],
})
export class ProductSkuModule {}

