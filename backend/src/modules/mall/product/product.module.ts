import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from '../../../common/entities/mall/product.entity';
import { Category } from '../../../common/entities/mall/category.entity';
import { OperationLogModule } from '../../operation-log/operation-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
    OperationLogModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}

