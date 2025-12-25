import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MiniappUser } from '../../common/entities/mall/miniapp-user.entity';

@Injectable()
export class MiniappUserService {
  constructor(
    @InjectRepository(MiniappUser)
    private readonly miniappUserRepository: Repository<MiniappUser>,
  ) {}

  /**
   * 获取用户统计信息
   */
  async getStatistics(userId: number) {
    // 这里可以添加订单统计等
    const user = await this.miniappUserRepository.findOne({
      where: { id: userId },
    });

    return {
      balance: user?.balance || 0,
      points: user?.points || 0,
      memberLevel: user?.memberLevel || 0,
      totalConsumption: user?.totalConsumption || 0,
    };
  }
}

