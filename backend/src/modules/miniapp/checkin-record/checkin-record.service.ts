import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CheckinRecord } from './checkin-record.entity';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { QueryCheckinDto } from './dto/query-checkin.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';
import { UserCoupleService } from '../user-couple/user-couple.service';
import { CheckinNotificationService } from '../checkin-notification/checkin-notification.service';

@Injectable()
export class CheckinRecordService {
  constructor(
    @InjectRepository(CheckinRecord)
    private readonly recordRepository: Repository<CheckinRecord>,
    private readonly coupleService: UserCoupleService,
    private readonly notificationService: CheckinNotificationService,
  ) {}

  /**
   * 创建打卡记录
   */
  async create(userId: number, createDto: CreateCheckinDto): Promise<CheckinRecord> {
    const record = this.recordRepository.create({
      userId,
      ...createDto,
      isPublic: createDto.isPublic ? 1 : 0,
      status: 1,
    });

    const savedRecord = await this.recordRepository.save(record);

    // 如果用户绑定了另一半，发送通知
    try {
      const couple = await this.coupleService.getCoupleInfo(userId);
      if (couple) {
        const partnerId = couple.userId === userId ? couple.partnerId : couple.userId;
        await this.notificationService.create(partnerId, savedRecord.id, 1);
      }
    } catch (error) {
      console.error('发送通知失败:', error);
      // 通知失败不影响打卡创建
    }

    return savedRecord;
  }

  /**
   * 分页查询打卡记录
   */
  async findAll(queryDto: QueryCheckinDto, userId?: number): Promise<IPaginationResponse<CheckinRecord>> {
    const { page = 1, pageSize = 10, startDate, endDate, includePublic } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.recordRepository.createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .where('record.status = :status', { status: 1 })
      .andWhere('record.deletedAt IS NULL');

    // 如果指定了userId
    if (userId) {
      // 获取用户的另一半ID
      const couple = await this.coupleService.getCoupleInfo(userId);
      const partnerId = couple ? (couple.userId === userId ? couple.partnerId : couple.userId) : null;

      if (includePublic) {
        // 查询用户、另一半和公开的打卡
        queryBuilder.andWhere(
          '(record.userId = :userId OR record.userId = :partnerId OR record.isPublic = 1)',
          { userId, partnerId: partnerId || -1 }
        );
      } else {
        // 只查询用户和另一半的打卡
        queryBuilder.andWhere(
          '(record.userId = :userId OR record.userId = :partnerId)',
          { userId, partnerId: partnerId || -1 }
        );
      }
    } else if (includePublic) {
      // 没有userId但需要公开的，只查询公开的
      queryBuilder.andWhere('record.isPublic = 1');
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
   * 获取地图标记点（用于地图展示）
   */
  async getMapMarkers(userId: number, includePublic: boolean = false): Promise<CheckinRecord[]> {
    const queryBuilder = this.recordRepository.createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .where('record.status = :status', { status: 1 })
      .andWhere('record.deletedAt IS NULL');

    // 获取用户的另一半ID
    const couple = await this.coupleService.getCoupleInfo(userId);
    const partnerId = couple ? (couple.userId === userId ? couple.partnerId : couple.userId) : null;

    if (includePublic) {
      // 查询用户、另一半和公开的打卡
      queryBuilder.andWhere(
        '(record.userId = :userId OR record.userId = :partnerId OR record.isPublic = 1)',
        { userId, partnerId: partnerId || -1 }
      );
    } else {
      // 只查询用户和另一半的打卡
      queryBuilder.andWhere(
        '(record.userId = :userId OR record.userId = :partnerId)',
        { userId, partnerId: partnerId || -1 }
      );
    }

    return await queryBuilder
      .orderBy('record.createdAt', 'DESC')
      .getMany();
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
    if (userId) {
      // 如果是公开的打卡，允许访问
      if (record.isPublic === 1) {
        return record;
      }
      
      // 检查是否是用户自己的打卡
      if (record.userId === userId) {
        return record;
      }
      
      // 检查是否是另一半的打卡
      const couple = await this.coupleService.getCoupleInfo(userId);
      if (couple) {
        const partnerId = couple.userId === userId ? couple.partnerId : couple.userId;
        if (record.userId === partnerId) {
          return record;
        }
      }
      
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
