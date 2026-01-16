import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckinRecord } from './checkin-record.entity';
import { CheckinRecordService } from './checkin-record.service';
import { CheckinRecordController } from './checkin-record.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CheckinRecord])],
  controllers: [CheckinRecordController],
  providers: [CheckinRecordService],
  exports: [CheckinRecordService],
})
export class CheckinRecordModule {}
