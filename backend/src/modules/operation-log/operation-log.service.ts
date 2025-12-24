import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OperationLog } from './operation-log.entity';
import { QueryOperationLogDto } from './dto/query-operation-log.dto';
import { IPaginationResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLog)
    private readonly operationLogRepository: Repository<OperationLog>,
  ) {}

  /**
   * 分页查询操作日志
   */
  async findAll(queryDto: QueryOperationLogDto): Promise<IPaginationResponse<OperationLog>> {
    const { page = 1, pageSize = 10, title, businessType, username, status, userId, startTime, endTime } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.operationLogRepository.createQueryBuilder('log');

    if (title) {
      queryBuilder.andWhere('log.title LIKE :title', { title: `%${title}%` });
    }
    if (businessType) {
      queryBuilder.andWhere('log.businessType LIKE :businessType', { businessType: `%${businessType}%` });
    }
    if (username) {
      queryBuilder.andWhere('log.username LIKE :username', { username: `%${username}%` });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('log.status = :status', { status });
    }
    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }
    if (startTime && endTime) {
      queryBuilder.andWhere('log.operTime BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      });
    } else if (startTime) {
      queryBuilder.andWhere('log.operTime >= :startTime', { startTime });
    } else if (endTime) {
      queryBuilder.andWhere('log.operTime <= :endTime', { endTime });
    }

    queryBuilder
      .orderBy('log.operTime', 'DESC')
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
   * 根据ID查询操作日志
   */
  async findOne(id: number): Promise<OperationLog> {
    const log = await this.operationLogRepository.findOne({ where: { id } });
    if (!log) {
      throw new Error(`操作日志 ID ${id} 不存在`);
    }
    return log;
  }

  /**
   * 创建操作日志
   */
  async create(operationLog: Partial<OperationLog>): Promise<OperationLog> {
    const log = this.operationLogRepository.create({
      ...operationLog,
      operTime: operationLog.operTime || new Date(),
    });
    return await this.operationLogRepository.save(log);
  }

  /**
   * 删除操作日志
   */
  async remove(id: number): Promise<void> {
    await this.operationLogRepository.delete(id);
  }

  /**
   * 批量删除操作日志
   */
  async removeBatch(ids: number[]): Promise<void> {
    await this.operationLogRepository.delete(ids);
  }
}

