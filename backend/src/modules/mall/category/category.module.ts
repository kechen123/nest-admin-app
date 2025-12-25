import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from '../../../common/entities/mall/category.entity';
import { OperationLogModule } from '../../operation-log/operation-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    OperationLogModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}

