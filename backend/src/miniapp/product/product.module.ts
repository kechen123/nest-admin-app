import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiniappProductController } from './product.controller';
import { MiniappProductService } from './product.service';
import { Product } from '../../common/entities/mall/product.entity';
import { ProductSku } from '../../common/entities/mall/product-sku.entity';
import { ProductImage } from '../../common/entities/mall/product-image.entity';
import { Category } from '../../common/entities/mall/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductSku, ProductImage, Category])],
  controllers: [MiniappProductController],
  providers: [MiniappProductService],
  exports: [MiniappProductService],
})
export class MiniappProductModule {}

