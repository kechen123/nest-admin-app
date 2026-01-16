import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCouple } from './user-couple.entity';
import { MiniappUser } from '../miniapp-user/miniapp-user.entity';
import { BindPartnerDto, UnbindPartnerDto } from './dto/bind-partner.dto';

@Injectable()
export class UserCoupleService {
  constructor(
    @InjectRepository(UserCouple)
    private readonly coupleRepository: Repository<UserCouple>,
    @InjectRepository(MiniappUser)
    private readonly userRepository: Repository<MiniappUser>,
  ) {}

  /**
   * 绑定另一半
   */
  async bindPartner(userId: number, bindDto: BindPartnerDto): Promise<UserCouple> {
    const { partnerId } = bindDto;

    // 不能绑定自己
    if (userId === partnerId) {
      throw new BadRequestException('不能绑定自己');
    }

    // 检查用户是否存在
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const partner = await this.userRepository.findOne({ where: { id: partnerId } });

    if (!user || !partner) {
      throw new NotFoundException('用户不存在');
    }

    // 检查是否已经绑定
    const existingCouple = await this.coupleRepository.findOne({
      where: [
        { userId, partnerId, status: 1 },
        { userId: partnerId, partnerId: userId, status: 1 },
      ],
    });

    if (existingCouple) {
      throw new BadRequestException('已经绑定过该用户');
    }

    // 创建绑定关系（双向绑定）
    const couple = this.coupleRepository.create({
      userId,
      partnerId,
      status: 1,
      bindTime: new Date(),
    });

    return await this.coupleRepository.save(couple);
  }

  /**
   * 解除绑定
   */
  async unbindPartner(userId: number, unbindDto: UnbindPartnerDto): Promise<void> {
    const { coupleId } = unbindDto;

    const couple = await this.coupleRepository.findOne({
      where: { id: coupleId },
    });

    if (!couple) {
      throw new NotFoundException('绑定关系不存在');
    }

    // 检查是否是自己的绑定关系
    if (couple.userId !== userId && couple.partnerId !== userId) {
      throw new BadRequestException('无权操作');
    }

    couple.status = 0;
    couple.unbindTime = new Date();
    await this.coupleRepository.save(couple);
  }

  /**
   * 获取用户的绑定关系
   */
  async getCoupleInfo(userId: number): Promise<UserCouple | null> {
    const couple = await this.coupleRepository.findOne({
      where: [
        { userId, status: 1 },
        { partnerId: userId, status: 1 },
      ],
      relations: ['user', 'partner'],
    });

    return couple;
  }

  /**
   * 获取另一半的用户信息
   */
  async getPartnerInfo(userId: number): Promise<MiniappUser | null> {
    const couple = await this.getCoupleInfo(userId);
    if (!couple) {
      return null;
    }

    // 返回另一半的用户信息
    if (couple.userId === userId) {
      return couple.partner;
    } else {
      return couple.user;
    }
  }
}
