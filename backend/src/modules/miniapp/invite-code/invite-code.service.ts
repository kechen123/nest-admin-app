import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Not } from 'typeorm';
import { InviteCode, InviteCodeStatus } from './invite-code.entity';
import { MiniappUser } from '../miniapp-user/miniapp-user.entity';
import { UserCoupleService } from '../user-couple/user-couple.service';
import { GenerateInviteDto } from './dto/generate-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { CancelInviteDto } from './dto/cancel-invite.dto';
import { InviteInfoDto } from './dto/invite-info.dto';
import { UserInviteListDto } from './dto/user-invite-list.dto';
import { GenerateInviteResponseDto } from './dto/generate-invite-response.dto';

@Injectable()
export class InviteCodeService {
  constructor(
    @InjectRepository(InviteCode)
    private readonly inviteCodeRepository: Repository<InviteCode>,
    @InjectRepository(MiniappUser)
    private readonly userRepository: Repository<MiniappUser>,
    private readonly coupleService: UserCoupleService,
  ) {}

  /**
   * 生成唯一邀请码
   */
  private async generateUniqueCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = '';
      for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      attempts++;
    } while (await this.inviteCodeRepository.findOne({ where: { code } }) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('无法生成唯一邀请码，请重试');
    }

    return code;
  }

  /**
   * 生成邀请码
   */
  async generateInviteCode(userId: number, dto: GenerateInviteDto): Promise<GenerateInviteResponseDto> {
    // 检查用户是否已有有效的邀请码
    const existingInvite = await this.inviteCodeRepository.findOne({
      where: {
        inviterId: userId,
        status: InviteCodeStatus.PENDING,
        expireTime: Not(LessThan(new Date())),
      },
    });

    if (existingInvite) {
      throw new BadRequestException('您已经有一个有效的邀请码，请使用完当前邀请码后再生成新的');
    }

    // 检查用户是否已经有绑定关系
    const coupleInfo = await this.coupleService.getCoupleInfo(userId);
    if (coupleInfo) {
      throw new BadRequestException('您已经绑定了另一半，无法生成邀请码');
    }

    // 生成邀请码
    const code = await this.generateUniqueCode();
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + (dto.expireHours || 24));

    const inviteCode = this.inviteCodeRepository.create({
      code,
      inviterId: userId,
      expireTime,
      status: InviteCodeStatus.PENDING,
    });

    const savedInvite = await this.inviteCodeRepository.save(inviteCode);

    // 构建邀请链接（小程序路径）
    const inviteUrl = `/pages/invite/invite?code=${code}`;
    const shareParams = {
      title: '邀请你共同记录美好时光',
      path: `pages/invite/invite?code=${code}`,
      imageUrl: '/static/images/invite-share.png',
    };

    return {
      id: savedInvite.id,
      code: savedInvite.code,
      expireTime: savedInvite.expireTime,
      inviteUrl,
      shareParams,
    };
  }

  /**
   * 获取邀请码信息
   */
  async getInviteInfo(code: string): Promise<InviteInfoDto> {
    const inviteCode = await this.inviteCodeRepository.findOne({
      where: { code },
      relations: ['inviter'],
    });

    if (!inviteCode) {
      throw new NotFoundException('邀请码不存在');
    }

    const now = new Date();
    const isExpired = inviteCode.expireTime < now;
    const canAccept = inviteCode.status === InviteCodeStatus.PENDING && !isExpired;

    return {
      id: inviteCode.id,
      code: inviteCode.code,
      inviter: {
        id: inviteCode.inviter.id,
        nickname: inviteCode.inviter.nickname || '未知用户',
        avatar: inviteCode.inviter.avatar,
      },
      status: inviteCode.status,
      expireTime: inviteCode.expireTime,
      createdAt: inviteCode.createdAt,
      isExpired,
      canAccept,
    };
  }

  /**
   * 接受邀请
   */
  async acceptInvite(userId: number, dto: AcceptInviteDto): Promise<void> {
    const inviteCode = await this.inviteCodeRepository.findOne({
      where: { code: dto.code },
      relations: ['inviter'],
    });

    if (!inviteCode) {
      throw new NotFoundException('邀请码不存在');
    }

    // 检查邀请码状态
    if (inviteCode.status !== InviteCodeStatus.PENDING) {
      throw new BadRequestException('邀请码已被使用或已失效');
    }

    // 检查是否过期
    if (inviteCode.expireTime < new Date()) {
      // 自动标记为过期
      inviteCode.status = InviteCodeStatus.EXPIRED;
      await this.inviteCodeRepository.save(inviteCode);
      throw new BadRequestException('邀请码已过期');
    }

    // 检查是否是邀请自己
    if (inviteCode.inviterId === userId) {
      throw new BadRequestException('不能接受自己的邀请');
    }

    // 检查用户是否已经有绑定关系
    const existingCouple = await this.coupleService.getCoupleInfo(userId);
    if (existingCouple) {
      throw new BadRequestException('您已经绑定了另一半');
    }

    // 检查邀请者是否已经有绑定关系
    const inviterCouple = await this.coupleService.getCoupleInfo(inviteCode.inviterId);
    if (inviterCouple) {
      // 标记邀请码为已取消
      inviteCode.status = InviteCodeStatus.CANCELLED;
      await this.inviteCodeRepository.save(inviteCode);
      throw new BadRequestException('邀请者已经绑定了其他人');
    }

    // 绑定用户关系
    await this.coupleService.bindPartner(userId, { partnerId: inviteCode.inviterId });

    // 更新邀请码状态
    inviteCode.status = InviteCodeStatus.ACCEPTED;
    inviteCode.acceptedAt = new Date();
    inviteCode.acceptedBy = userId;
    await this.inviteCodeRepository.save(inviteCode);
  }

  /**
   * 取消邀请
   */
  async cancelInvite(userId: number, dto: CancelInviteDto): Promise<void> {
    const inviteCode = await this.inviteCodeRepository.findOne({
      where: { id: dto.inviteCodeId },
    });

    if (!inviteCode) {
      throw new NotFoundException('邀请码不存在');
    }

    // 检查是否是邀请者本人
    if (inviteCode.inviterId !== userId) {
      throw new BadRequestException('无权取消此邀请码');
    }

    // 只能取消等待中的邀请码
    if (inviteCode.status !== InviteCodeStatus.PENDING) {
      throw new BadRequestException('只能取消等待中的邀请码');
    }

    inviteCode.status = InviteCodeStatus.CANCELLED;
    await this.inviteCodeRepository.save(inviteCode);
  }

  /**
   * 获取用户的邀请码列表
   */
  async getUserInviteCodes(userId: number): Promise<UserInviteListDto[]> {
    const inviteCodes = await this.inviteCodeRepository.find({
      where: { inviterId: userId },
      relations: ['accepter'],
      order: { createdAt: 'DESC' },
    });

    const now = new Date();

    return inviteCodes.map(inviteCode => ({
      id: inviteCode.id,
      code: inviteCode.code,
      status: inviteCode.status,
      expireTime: inviteCode.expireTime,
      acceptedAt: inviteCode.acceptedAt,
      accepter: inviteCode.accepter ? {
        id: inviteCode.accepter.id,
        nickname: inviteCode.accepter.nickname || '未知用户',
        avatar: inviteCode.accepter.avatar,
      } : undefined,
      createdAt: inviteCode.createdAt,
      isExpired: inviteCode.expireTime < now,
    }));
  }

  /**
   * 清理过期邀请码（定时任务调用）
   */
  async cleanupExpiredInvites(): Promise<void> {
    const expiredInvites = await this.inviteCodeRepository.find({
      where: {
        status: InviteCodeStatus.PENDING,
        expireTime: LessThan(new Date()),
      },
    });

    if (expiredInvites.length > 0) {
      await this.inviteCodeRepository.update(
        { id: expiredInvites.map(invite => invite.id) } as any,
        { status: InviteCodeStatus.EXPIRED }
      );
    }
  }

  /**
   * 检查用户是否有有效的 pending 邀请码
   */
  async hasUserActiveInvite(userId: number): Promise<boolean> {
    const count = await this.inviteCodeRepository.count({
      where: {
        inviterId: userId,
        status: InviteCodeStatus.PENDING,
        expireTime: Not(LessThan(new Date())),
      },
    });

    return count > 0;
  }

  /**
   * 获取用户的当前有效邀请码
   */
  async getUserActiveInvite(userId: number): Promise<InviteCode | null> {
    return await this.inviteCodeRepository.findOne({
      where: {
        inviterId: userId,
        status: InviteCodeStatus.PENDING,
        expireTime: Not(LessThan(new Date())),
      },
      relations: ['inviter'],
    });
  }

}