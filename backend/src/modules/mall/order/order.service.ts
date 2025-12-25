import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Order } from '../../../common/entities/mall/order.entity';
import { QueryOrderDto } from './dto/query-order.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';
import { OperationLogService } from '../../operation-log/operation-log.service';
import { Request } from 'express';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly operationLogService: OperationLogService,
  ) {}

  /**
   * 分页查询订单
   */
  async findAll(queryDto: QueryOrderDto): Promise<IPaginationResponse<Order>> {
    const { page = 1, pageSize = 10, orderNo, userId, status, payType } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.deletedAt IS NULL');

    if (orderNo) {
      queryBuilder.andWhere('order.orderNo LIKE :orderNo', { orderNo: `%${orderNo}%` });
    }
    if (userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('order.status = :status', { status });
    }
    if (payType !== undefined) {
      queryBuilder.andWhere('order.payType = :payType', { payType });
    }

    queryBuilder
      .orderBy('order.createdAt', 'DESC')
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
   * 根据ID查询订单详情
   */
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user', 'items'],
    });
    if (!order) {
      throw new NotFoundException(`订单 ID ${id} 不存在`);
    }
    return order;
  }

  /**
   * 根据订单号查询订单
   */
  async findByOrderNo(orderNo: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNo, deletedAt: IsNull() },
      relations: ['user', 'items'],
    });
    if (!order) {
      throw new NotFoundException(`订单号 ${orderNo} 不存在`);
    }
    return order;
  }

  /**
   * 更新订单状态
   */
  async updateStatus(id: number, status: number, req?: Request): Promise<Order> {
    const order = await this.findOne(id);

    // 状态流转验证
    const validTransitions: { [key: number]: number[] } = {
      0: [1, 4], // 待付款 -> 待发货、已取消
      1: [2, 4], // 待发货 -> 待收货、已取消
      2: [3],    // 待收货 -> 已完成
      3: [],     // 已完成 -> 无
      4: [],     // 已取消 -> 无
    };

    const allowedStatuses = validTransitions[order.status] || [];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(`订单状态不能从 ${this.getStatusText(order.status)} 变更为 ${this.getStatusText(status)}`);
    }

    // 更新状态和时间
    order.status = status;
    if (status === 1 && !order.shipTime) {
      // 待发货状态，设置发货时间
      order.shipTime = new Date();
    } else if (status === 3 && !order.confirmTime) {
      // 已完成状态，设置确认收货时间
      order.confirmTime = new Date();
    }

    const saved = await this.orderRepository.save(order);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '订单管理',
        businessType: '修改状态',
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
   * 取消订单
   */
  async cancel(id: number, req?: Request): Promise<Order> {
    const order = await this.findOne(id);

    // 只有待付款和待发货状态的订单可以取消
    if (order.status !== 0 && order.status !== 1) {
      throw new BadRequestException(`只有待付款和待发货状态的订单可以取消`);
    }

    order.status = 4; // 已取消
    const saved = await this.orderRepository.save(order);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '订单管理',
        businessType: '取消订单',
        method: 'cancel',
        requestMethod: 'PATCH',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify({ id }),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 发货
   */
  async ship(id: number, req?: Request): Promise<Order> {
    const order = await this.findOne(id);

    // 只有待发货状态的订单可以发货
    if (order.status !== 1) {
      throw new BadRequestException(`只有待发货状态的订单可以发货`);
    }

    order.status = 2; // 待收货
    order.shipTime = new Date();
    const saved = await this.orderRepository.save(order);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '订单管理',
        businessType: '发货',
        method: 'ship',
        requestMethod: 'PATCH',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify({ id }),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: '待付款',
      1: '待发货',
      2: '待收货',
      3: '已完成',
      4: '已取消',
    };
    return statusMap[status] || '未知';
  }
}

