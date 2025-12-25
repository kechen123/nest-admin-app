import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MiniappUser } from '../../../common/entities/mall/miniapp-user.entity';
import { QueryMiniappUserDto } from './dto/query-miniapp-user.dto';
import { UpdateMiniappUserDto } from './dto/update-miniapp-user.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';
import { OperationLogService } from '../../operation-log/operation-log.service';
import { Request } from 'express';

@Injectable()
export class MiniappUserService {
  constructor(
    @InjectRepository(MiniappUser)
    private readonly miniappUserRepository: Repository<MiniappUser>,
    private readonly operationLogService: OperationLogService,
  ) {}

  /**
   * 分页查询小程序用户
   */
  async findAll(queryDto: QueryMiniappUserDto): Promise<IPaginationResponse<MiniappUser>> {
    const { page = 1, pageSize = 10, nickname, phone, status, memberLevel } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.miniappUserRepository.createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    if (nickname) {
      queryBuilder.andWhere('user.nickname LIKE :nickname', { nickname: `%${nickname}%` });
    }
    if (phone) {
      queryBuilder.andWhere('user.phone LIKE :phone', { phone: `%${phone}%` });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('user.status = :status', { status });
    }
    if (memberLevel !== undefined) {
      queryBuilder.andWhere('user.memberLevel = :memberLevel', { memberLevel });
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
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
   * 根据ID查询用户
   */
  async findOne(id: number): Promise<MiniappUser> {
    const user = await this.miniappUserRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }
    return user;
  }

  /**
   * 更新用户信息
   */
  async update(id: number, updateUserDto: UpdateMiniappUserDto, req?: Request): Promise<MiniappUser> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);
    const saved = await this.miniappUserRepository.save(user);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '小程序用户管理',
        businessType: '修改',
        method: 'update',
        requestMethod: 'PATCH',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify(updateUserDto),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 更新用户状态（启用/禁用）
   */
  async updateStatus(id: number, status: number, req?: Request): Promise<MiniappUser> {
    const user = await this.findOne(id);
    user.status = status;
    const saved = await this.miniappUserRepository.save(user);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '小程序用户管理',
        businessType: status === 1 ? '启用' : '禁用',
        method: 'updateStatus',
        requestMethod: 'PATCH',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify({ id, status }),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 调整用户余额
   */
  async adjustBalance(id: number, adjustBalanceDto: AdjustBalanceDto, req?: Request): Promise<MiniappUser> {
    const user = await this.findOne(id);

    const newBalance = Number(user.balance) + adjustBalanceDto.amount;
    if (newBalance < 0) {
      throw new BadRequestException('余额不足，无法完成调整');
    }

    user.balance = newBalance;
    const saved = await this.miniappUserRepository.save(user);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '小程序用户管理',
        businessType: '调整余额',
        method: 'adjustBalance',
        requestMethod: 'PATCH',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify({ id, ...adjustBalanceDto }),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 调整用户积分
   */
  async adjustPoints(id: number, adjustPointsDto: AdjustPointsDto, req?: Request): Promise<MiniappUser> {
    const user = await this.findOne(id);

    const newPoints = user.points + adjustPointsDto.points;
    if (newPoints < 0) {
      throw new BadRequestException('积分不足，无法完成调整');
    }

    user.points = newPoints;
    const saved = await this.miniappUserRepository.save(user);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '小程序用户管理',
        businessType: '调整积分',
        method: 'adjustPoints',
        requestMethod: 'PATCH',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify({ id, ...adjustPointsDto }),
        status: 1,
      });
    }

    return saved;
  }
}

