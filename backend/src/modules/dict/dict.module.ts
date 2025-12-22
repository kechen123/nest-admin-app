import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictType } from './dict-type.entity';
import { DictData } from './dict-data.entity';
import { DictService } from './dict.service';
import { DictController } from './dict.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DictType, DictData])],
  controllers: [DictController],
  providers: [DictService],
  exports: [DictService],
})
export class DictModule {}

