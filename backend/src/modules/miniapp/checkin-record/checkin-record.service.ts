import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CheckinRecord } from './checkin-record.entity';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { QueryCheckinDto } from './dto/query-checkin.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class CheckinRecordService {
  constructor(
    @InjectRepository(CheckinRecord)
    private readonly recordRepository: Repository<CheckinRecord>,
  ) {}

  /**
   * 创建打卡记录
   */
  async create(userId: number, createDto: CreateCheckinDto): Promise<CheckinRecord> {
    const record = this.recordRepository.create({
      userId,
      ...createDto,
      status: 1,
    });

    return await this.recordRepository.save(record);
  }

  /**
   * 分页查询打卡记录
   */
  async findAll(queryDto: QueryCheckinDto, userId?: number): Promise<IPaginationResponse<CheckinRecord>> {
    const { page = 1, pageSize = 10, startDate, endDate } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.recordRepository.createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .where('record.status = :status', { status: 1 })
      .andWhere('record.deletedAt IS NULL');

    // 如果指定了userId，只查询该用户的记录
    if (userId) {
      queryBuilder.andWhere('record.userId = :userId', { userId });
    }

    // 日期范围查询
    if (startDate) {
      queryBuilder.andWhere('DATE(record.createdAt) >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('DATE(record.createdAt) <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('record.createdAt', 'DESC')
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
   * 根据ID查询打卡记录
   */
  async findOne(id: number, userId?: number): Promise<CheckinRecord> {
    const record = await this.recordRepository.findOne({
      where: { id, status: 1 },
      relations: ['user'],
    });

    if (!record) {
      throw new NotFoundException('打卡记录不存在');
    }

    // 如果指定了userId，检查权限
    if (userId && record.userId !== userId) {
      throw new ForbiddenException('无权访问该记录');
    }

    return record;
  }

  /**
   * 更新打卡记录
   */
  async update(id: number, userId: number, updateDto: UpdateCheckinDto): Promise<CheckinRecord> {
    const record = await this.findOne(id, userId);
    Object.assign(record, updateDto);
    return await this.recordRepository.save(record);
  }

  /**
   * 删除打卡记录（软删除）
   */
  async remove(id: number, userId: number): Promise<void> {
    const record = await this.findOne(id, userId);
    record.status = 0;
    record.deletedAt = new Date();
    await this.recordRepository.save(record);
  }

  /**
   * 获取用户的打卡统计
   */
  async getStatistics(userId: number): Promise<{ total: number; thisMonth: number; thisWeek: number }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [total, thisMonth, thisWeek] = await Promise.all([
      this.recordRepository.count({
        where: { userId, status: 1 },
      }),
      this.recordRepository.count({
        where: {
          userId,
          status: 1,
          createdAt: Between(startOfMonth, now),
        },
      }),
      this.recordRepository.count({
        where: {
          userId,
          status: 1,
          createdAt: Between(startOfWeek, now),
        },
      }),
    ]);

    return { total, thisMonth, thisWeek };
  }
}
