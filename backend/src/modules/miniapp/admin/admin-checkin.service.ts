import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckinRecord } from '../checkin-record/checkin-record.entity';
import { QueryCheckinDto } from './dto/query-checkin.dto';
import { AuditCheckinDto } from './dto/audit-checkin.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class AdminCheckinService {
  constructor(
    @InjectRepository(CheckinRecord)
    private readonly checkinRepository: Repository<CheckinRecord>,
  ) {}

  /**
   * 分页查询用户打卡列表
   */
  async findAll(queryDto: QueryCheckinDto): Promise<IPaginationResponse<CheckinRecord>> {
    const { page = 1, pageSize = 10, userNickname, auditStatus, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.checkinRepository.createQueryBuilder('checkin')
      .leftJoinAndSelect('checkin.user', 'user')
      .where('checkin.deletedAt IS NULL');

    if (userNickname) {
      queryBuilder.andWhere('user.nickname LIKE :userNickname', { 
        userNickname: `%${userNickname}%` 
      });
    }

    if (auditStatus !== undefined && auditStatus !== null) {
      queryBuilder.andWhere('checkin.auditStatus = :auditStatus', { auditStatus });
    }

    if (status !== undefined && status !== null) {
      queryBuilder.andWhere('checkin.status = :status', { status });
    }

    queryBuilder
      .orderBy('checkin.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 删除打卡记录
   */
  async remove(id: number): Promise<void> {
    const checkin = await this.checkinRepository.findOne({
      where: { id },
    });

    if (!checkin) {
      throw new NotFoundException('打卡记录不存在');
    }

    await this.checkinRepository.remove(checkin);
  }

  /**
   * 审核打卡记录
   */
  async audit(id: number, auditDto: AuditCheckinDto, auditBy: number): Promise<CheckinRecord> {
    const checkin = await this.checkinRepository.findOne({
      where: { id },
    });

    if (!checkin) {
      throw new NotFoundException('打卡记录不存在');
    }

    checkin.auditStatus = auditDto.auditStatus;
    checkin.auditRemark = auditDto.auditRemark;
    checkin.auditTime = new Date();
    checkin.auditBy = auditBy;

    return await this.checkinRepository.save(checkin);
  }
}
