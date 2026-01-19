import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MiniappUser } from './miniapp-user.entity';
import { UserCouple } from '../user-couple/user-couple.entity';
import { WxLoginDto } from './dto/wx-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserInfoResponseDto } from './dto/user-info.dto';
import { JwtService } from '@nestjs/jwt';
import { InviteCodeService } from '../invite-code/invite-code.service';

@Injectable()
export class MiniappUserService {
  constructor(
    @InjectRepository(MiniappUser)
    private readonly userRepository: Repository<MiniappUser>,
    @InjectRepository(UserCouple)
    private readonly userCoupleRepository: Repository<UserCouple>,
    private readonly inviteCodeService: InviteCodeService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 生成随机用户名（4-6个字符，中英文混合）
   */
  private generateRandomName(): string {
    const length = Math.floor(Math.random() * 3) + 4; // 4-6个字符
    let name = '';

    // 中文字符范围：\u4e00-\u9fff
    // 英文字符：大小写字母 + 数字
    const englishChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      // 随机决定使用中文字符还是英文字符
      const useChinese = Math.random() > 0.3; // 70%概率使用中文字符

      if (useChinese) {
        // 生成随机中文字符
        const code = Math.floor(Math.random() * (0x9fff - 0x4e00 + 1)) + 0x4e00;
        name += String.fromCharCode(code);
      } else {
        // 使用英文字符
        name += englishChars[Math.floor(Math.random() * englishChars.length)];
      }
    }

    return name;
  }

  /**
   * 微信登录/注册
   * 注意：这里简化处理，实际应该调用微信API获取openid
   */
  async wxLogin(wxLoginDto: WxLoginDto, ip?: string): Promise<{ userId: number; token: string; needBindPhone: boolean; userInfo: any }> {
    const { code, userInfo, phone } = wxLoginDto;

    // TODO: 实际应该调用微信API获取openid
    // const wxApiResponse = await this.getWxOpenId(code);
    // const openid = wxApiResponse.openid;
    
    // 临时处理：使用code作为openid（仅用于开发测试）
    const openid = `mock_openid_${code}`;

    // 查找或创建用户
    let user = await this.userRepository.findOne({
      where: { openid },
    });

    if (!user) {
      // 创建新用户
      const nickname = userInfo?.nickName || this.generateRandomName();
      user = this.userRepository.create({
        openid,
        nickname,
        avatar: userInfo?.avatarUrl,
        gender: userInfo?.gender || 0,
        phone: phone || undefined,
        status: 1,
        lastLoginTime: new Date(),
        lastLoginIp: ip,
      });
      user = await this.userRepository.save(user);
    } else {
      // 更新登录信息
      user.lastLoginTime = new Date();
      user.lastLoginIp = ip;
      if (userInfo) {
        if (userInfo.nickName) user.nickname = userInfo.nickName;
        if (userInfo.avatarUrl) user.avatar = userInfo.avatarUrl;
        if (userInfo.gender !== undefined) user.gender = userInfo.gender;
      }
      // 如果传入了手机号且用户未绑定手机号，则绑定
      if (phone && !user.phone) {
        user.phone = phone;
      }
      await this.userRepository.save(user);
    }

    // 检查是否需要绑定手机号
    const needBindPhone = !user.phone;

    // 生成token（使用sub字段，与JWT策略保持一致）
    const token = this.jwtService.sign(
      { sub: user.id, userId: user.id, openid: user.openid },
    );

    return {
      userId: user.id,
      token,
      needBindPhone,
      userInfo: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,
        phone: user.phone,
      },
    };
  }

  /**
   * 绑定手机号
   */
  async bindPhone(userId: number, phone: string): Promise<MiniappUser> {
    const user = await this.findOne(userId);
    
    // 检查手机号是否已被其他用户使用
    const existingUser = await this.userRepository.findOne({
      where: { phone, status: 1 },
    });
    
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('该手机号已被其他用户使用');
    }
    
    user.phone = phone;
    return await this.userRepository.save(user);
  }

  /**
   * 根据ID查询用户
   */
  async findOne(id: number): Promise<MiniappUser> {
    const user = await this.userRepository.findOne({
      where: { id, status: 1 },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * 获取用户信息（包含另一半信息）
   */
  async getUserInfoWithPartner(userId: number): Promise<UserInfoResponseDto> {
    // 查询当前用户信息
    const user = await this.findOne(userId);

    // 查询是否绑定了另一半
    const couple = await this.userCoupleRepository.findOne({
      where: [
        { userId, status: 1 },
        { partnerId: userId, status: 1 }
      ],
      relations: ['user', 'partner']
    });

    const response: UserInfoResponseDto = {
      userInfo: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      hasPartner: false,
      hasPendingInvite: false,
    };

    if (couple) {
      response.hasPartner = true;
      // 确定另一半的用户信息
      const partner = couple.userId === userId ? couple.partner : couple.user;
      response.partnerInfo = {
        id: partner.id,
        nickname: partner.nickname,
        avatar: partner.avatar,
        gender: partner.gender,
        phone: partner.phone,
        createdAt: partner.createdAt,
        updatedAt: partner.updatedAt,
      };
    } else {
      // 检查是否有pending状态的邀请码
      const hasActiveInvite = await this.inviteCodeService.hasUserActiveInvite(userId);

      if (hasActiveInvite) {
        response.hasPendingInvite = true;
      }
    }

    return response;
  }

  /**
   * 更新用户信息
   */
  async update(id: number, updateData: Partial<MiniappUser>): Promise<MiniappUser> {
    const user = await this.findOne(id);
    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  /**
   * 更新当前用户资料
   */
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<MiniappUser> {
    const user = await this.findOne(userId);

    // 处理手机号更新时的唯一性检查
    if (updateProfileDto.phone && updateProfileDto.phone !== user.phone) {
      const existingUser = await this.userRepository.findOne({
        where: { phone: updateProfileDto.phone, status: 1 },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('该手机号已被其他用户使用');
      }
    }

    // 更新用户信息
    if (updateProfileDto.nickname !== undefined) {
      user.nickname = updateProfileDto.nickname;
    }
    if (updateProfileDto.avatar !== undefined) {
      user.avatar = updateProfileDto.avatar;
    }
    if (updateProfileDto.gender !== undefined) {
      user.gender = updateProfileDto.gender;
    }
    if (updateProfileDto.phone !== undefined) {
      user.phone = updateProfileDto.phone;
    }

    return await this.userRepository.save(user);
  }
}
