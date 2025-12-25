import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MiniappUser } from '../../common/entities/mall/miniapp-user.entity';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MiniappAuthService {
  constructor(
    @InjectRepository(MiniappUser)
    private readonly miniappUserRepository: Repository<MiniappUser>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 微信登录
   * 注意：这里需要调用微信API获取openid，实际使用时需要配置微信小程序AppID和AppSecret
   */
  async wechatLogin(wechatLoginDto: WechatLoginDto) {
    const { code } = wechatLoginDto;

    // TODO: 调用微信API获取openid和session_key
    // const wechatResponse = await this.getWechatOpenId(code);
    // const { openid, unionid, session_key } = wechatResponse;

    // 临时模拟，实际需要调用微信API
    const openid = `mock_openid_${Date.now()}`;
    const unionid = `mock_unionid_${Date.now()}`;

    // 查找或创建用户
    let user = await this.miniappUserRepository.findOne({
      where: { openid },
    });

    if (!user) {
      // 创建新用户
      user = this.miniappUserRepository.create({
        openid,
        unionid,
        status: 1,
      });
      await this.miniappUserRepository.save(user);
    }

    // 生成JWT Token
    const payload = { sub: user.id, openid: user.openid, type: 'miniapp' };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
      },
    };
  }

  /**
   * 获取用户信息
   */
  async getProfile(userId: number) {
    const user = await this.miniappUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      gender: user.gender,
      balance: user.balance,
      points: user.points,
      memberLevel: user.memberLevel,
      totalConsumption: user.totalConsumption,
    };
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userId: number, updateData: Partial<MiniappUser>) {
    const user = await this.miniappUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    Object.assign(user, updateData);
    await this.miniappUserRepository.save(user);

    return user;
  }

  /**
   * 绑定手机号
   */
  async bindPhone(userId: number, phone: string) {
    const user = await this.miniappUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 检查手机号是否已被绑定
    const existingUser = await this.miniappUserRepository.findOne({
      where: { phone },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('手机号已被绑定');
    }

    user.phone = phone;
    await this.miniappUserRepository.save(user);

    return user;
  }

  /**
   * 调用微信API获取openid（需要实现）
   * 实际使用时需要安装 axios 并配置微信小程序信息
   */
  private async getWechatOpenId(code: string) {
    // const appId = this.configService.get<string>('WECHAT_APPID');
    // const appSecret = this.configService.get<string>('WECHAT_APPSECRET');
    // const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    // const response = await axios.get(url);
    // return response.data;
    throw new Error('需要实现微信API调用');
  }
}

