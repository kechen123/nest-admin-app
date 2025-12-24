import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginLog } from './login-log.entity';
import { QueryLoginLogDto } from './dto/query-login-log.dto';
import { IPaginationResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class LoginLogService {
  constructor(
    @InjectRepository(LoginLog)
    private readonly loginLogRepository: Repository<LoginLog>,
  ) {}

  /**
   * 分页查询登录日志
   */
  async findAll(queryDto: QueryLoginLogDto): Promise<IPaginationResponse<LoginLog>> {
    const { page = 1, pageSize = 10, username, ipaddr, status, startTime, endTime } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.loginLogRepository.createQueryBuilder('log');

    if (username) {
      queryBuilder.andWhere('log.username LIKE :username', { username: `%${username}%` });
    }
    if (ipaddr) {
      queryBuilder.andWhere('log.ipaddr LIKE :ipaddr', { ipaddr: `%${ipaddr}%` });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('log.status = :status', { status });
    }
    if (startTime && endTime) {
      queryBuilder.andWhere('log.loginTime BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      });
    } else if (startTime) {
      queryBuilder.andWhere('log.loginTime >= :startTime', { startTime });
    } else if (endTime) {
      queryBuilder.andWhere('log.loginTime <= :endTime', { endTime });
    }

    queryBuilder
      .orderBy('log.loginTime', 'DESC')
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
   * 根据ID查询登录日志
   */
  async findOne(id: number): Promise<LoginLog> {
    const log = await this.loginLogRepository.findOne({ where: { id } });
    if (!log) {
      throw new Error(`登录日志 ID ${id} 不存在`);
    }
    return log;
  }

  /**
   * 创建登录日志
   */
  async create(loginLog: Partial<LoginLog>): Promise<LoginLog> {
    const log = this.loginLogRepository.create({
      ...loginLog,
      loginTime: loginLog.loginTime || new Date(),
    });
    return await this.loginLogRepository.save(log);
  }

  /**
   * 删除登录日志
   */
  async remove(id: number): Promise<void> {
    await this.loginLogRepository.delete(id);
  }

  /**
   * 批量删除登录日志
   */
  async removeBatch(ids: number[]): Promise<void> {
    await this.loginLogRepository.delete(ids);
  }
}

