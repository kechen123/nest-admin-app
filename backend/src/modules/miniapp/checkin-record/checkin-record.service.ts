import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CheckinRecord } from './checkin-record.entity';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { QueryCheckinDto } from './dto/query-checkin.dto';
import { QueryMapMarkersDto } from './dto/query-map-markers.dto';
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
    const { page = 1, pageSize = 10, startDate, endDate, includePublic = true } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.recordRepository.createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .where('record.status = :status', { status: 1 })
      .andWhere('record.deletedAt IS NULL');

    // includePublic 默认为 true，查询全部公开打卡记录
    if (includePublic) {
      if (userId) {
        // 如果用户已登录，获取用户的另一半ID
        const couple = await this.coupleService.getCoupleInfo(userId);
        const partnerId = couple ? (couple.userId === userId ? couple.partnerId : couple.userId) : null;
        
        // 查询逻辑：
        // 1. 用户自己的打卡：包含所有状态（包括被拒绝的）
        // 2. 另一半的打卡：过滤掉被拒绝的
        // 3. 公开的打卡：过滤掉被拒绝的
        queryBuilder.andWhere(
          '(record.userId = :userId OR (record.userId = :partnerId AND (record.auditStatus IS NULL OR record.auditStatus != :rejectedStatus)) OR (record.isPublic = 1 AND (record.auditStatus IS NULL OR record.auditStatus != :rejectedStatus)))',
          { userId, partnerId: partnerId || -1, rejectedStatus: 2 }
        );
      } else {
        // 未登录用户，只查询公开的打卡，过滤掉被拒绝的
        queryBuilder.andWhere('record.isPublic = 1')
          .andWhere('(record.auditStatus IS NULL OR record.auditStatus != :rejectedStatus)', { rejectedStatus: 2 });
      }
    } else {
      // includePublic 为 false，需要 userId，查询我和绑定用户的打卡记录
      if (!userId) {
        throw new BadRequestException('includePublic 为 false 时需要用户登录');
      }
      
      // 获取用户的另一半ID
      const couple = await this.coupleService.getCoupleInfo(userId);
      const partnerId = couple ? (couple.userId === userId ? couple.partnerId : couple.userId) : null;
      
      // 查询逻辑：
      // 1. 用户自己的打卡：包含所有状态（包括被拒绝的）
      // 2. 另一半的打卡：过滤掉被拒绝的
      queryBuilder.andWhere(
        '(record.userId = :userId OR (record.userId = :partnerId AND (record.auditStatus IS NULL OR record.auditStatus != :rejectedStatus)))',
        { userId, partnerId: partnerId || -1, rejectedStatus: 2 }
      );
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
   * 获取地图标记点（用于地图展示，支持位置范围查询）
   */
  async getMapMarkers(userId?: number, queryDto?: QueryMapMarkersDto): Promise<CheckinRecord[]> {
    const { latitude, longitude, radius = 10, includePublic = true } = queryDto || {};
    
    const queryBuilder = this.recordRepository.createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .where('record.status = :status', { status: 1 })
      .andWhere('record.deletedAt IS NULL')
      .andWhere('(record.auditStatus IS NULL OR record.auditStatus != :rejectedStatus)', { rejectedStatus: 2 });

    // includePublic 默认为 true，查询全部公开打卡记录
    // 如果用户已登录，也要包含用户和绑定用户的私密点位数据
    if (includePublic) {
      if (userId) {
        // 如果用户已登录，获取用户的另一半ID
        const couple = await this.coupleService.getCoupleInfo(userId);
        const partnerId = couple ? (couple.userId === userId ? couple.partnerId : couple.userId) : null;
        
        // 查询用户、另一半和公开的打卡
        queryBuilder.andWhere(
          '(record.userId = :userId OR record.userId = :partnerId OR record.isPublic = 1)',
          { userId, partnerId: partnerId || -1 }
        );
      } else {
        // 未登录用户，只查询公开的打卡
        queryBuilder.andWhere('record.isPublic = 1');
      }
    } else {
      // includePublic 为 false，需要 userId，查询我和绑定用户的打卡记录
      if (!userId) {
        throw new BadRequestException('includePublic 为 false 时需要用户登录');
      }
      
      // 获取用户的另一半ID
      const couple = await this.coupleService.getCoupleInfo(userId);
      const partnerId = couple ? (couple.userId === userId ? couple.partnerId : couple.userId) : null;
      
      // 只查询用户和另一半的打卡
      queryBuilder.andWhere(
        '(record.userId = :userId OR record.userId = :partnerId)',
        { userId, partnerId: partnerId || -1 }
      );
    }

    // 如果提供了位置参数，添加位置范围过滤
    if (latitude !== undefined && longitude !== undefined && radius !== undefined) {
      // 使用 Haversine 公式计算距离（单位：公里）
      // 地球半径：6371 公里
      // 计算纬度差和经度差的弧度
      const latRad = latitude * Math.PI / 180;
      const lonRad = longitude * Math.PI / 180;
      
      // 计算距离的 SQL 表达式
      // 使用 Haversine 公式：d = 2R * arcsin(sqrt(sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)))
      // 为了性能，我们使用简化的边界框过滤，然后再精确计算
      // 1度纬度约等于111公里，1度经度在赤道约等于111公里，在高纬度会变小
      const latDelta = radius / 111; // 纬度差（度）
      const lonDelta = radius / (111 * Math.cos(latRad)); // 经度差（度）
      
      // 先使用边界框快速过滤（性能优化）
      queryBuilder
        .andWhere('record.latitude BETWEEN :minLat AND :maxLat', {
          minLat: latitude - latDelta,
          maxLat: latitude + latDelta,
        })
        .andWhere('record.longitude BETWEEN :minLon AND :maxLon', {
          minLon: longitude - lonDelta,
          maxLon: longitude + lonDelta,
        });
      
      // 添加精确距离计算的子查询（使用 Haversine 公式）
      // 注意：TypeORM 的 QueryBuilder 对复杂地理计算支持有限，这里使用原生 SQL
      const records = await queryBuilder.getMany();
      
      // 在内存中精确计算距离并过滤
      const filteredRecords = records.filter(record => {
        const recordLat = Number(record.latitude);
        const recordLon = Number(record.longitude);
        const distance = this.calculateDistance(latitude, longitude, recordLat, recordLon);
        return distance <= radius;
      });
      
      return filteredRecords.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
    }

    return await queryBuilder
      .orderBy('record.createdAt', 'DESC')
      .getMany();
  }

  /**
   * 计算两点之间的距离（公里）
   * 使用 Haversine 公式
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
      * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
      // 检查是否是用户自己的打卡（自己的打卡可以查看所有状态，包括被拒绝的）
      if (record.userId === userId) {
        return record;
      }
      
      // 如果是公开的打卡且未被拒绝，允许访问
      if (record.isPublic === 1 && (record.auditStatus === null || record.auditStatus !== 2)) {
        return record;
      }
      
      // 检查是否是另一半的打卡（另一半的打卡需要过滤掉被拒绝的）
      const couple = await this.coupleService.getCoupleInfo(userId);
      if (couple) {
        const partnerId = couple.userId === userId ? couple.partnerId : couple.userId;
        if (record.userId === partnerId && (record.auditStatus === null || record.auditStatus !== 2)) {
          return record;
        }
      }
      
      throw new ForbiddenException('无权访问该记录');
    }

    // 未登录用户，只能查看公开且未被拒绝的打卡
    if (record.isPublic === 1 && (record.auditStatus === null || record.auditStatus !== 2)) {
      return record;
    }

    throw new ForbiddenException('无权访问该记录');
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

    // 使用 queryBuilder 来过滤掉拒绝状态的记录
    const baseQuery = () => this.recordRepository.createQueryBuilder('record')
      .where('record.userId = :userId', { userId })
      .andWhere('record.status = :status', { status: 1 })
      .andWhere('record.deletedAt IS NULL')
      .andWhere('(record.auditStatus IS NULL OR record.auditStatus != :rejectedStatus)', { rejectedStatus: 2 });

    const [total, thisMonth, thisWeek] = await Promise.all([
      baseQuery().getCount(),
      baseQuery()
        .andWhere('record.createdAt >= :startOfMonth', { startOfMonth })
        .andWhere('record.createdAt <= :now', { now })
        .getCount(),
      baseQuery()
        .andWhere('record.createdAt >= :startOfWeek', { startOfWeek })
        .andWhere('record.createdAt <= :now', { now })
        .getCount(),
    ]);

    return { total, thisMonth, thisWeek };
  }
}
