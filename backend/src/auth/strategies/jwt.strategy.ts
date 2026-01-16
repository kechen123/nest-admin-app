import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../modules/user/user.service';
import { MiniappUserService } from '../../modules/miniapp/miniapp-user/miniapp-user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly miniappUserService: MiniappUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: any) {
    // 判断是小程序用户还是后台用户（通过openid字段判断）
    if (payload.openid) {
      // 小程序用户
      const user = await this.miniappUserService.findOne(payload.sub || payload.userId);
      if (!user || user.status !== 1) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }
      return { userId: user.id, openid: user.openid, type: 'miniapp' };
    } else {
      // 后台用户
      const user = await this.userService.findOne(payload.sub);
      if (!user || !user.status) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }
      return { userId: user.id, username: user.username, role: user.role, type: 'admin' };
    }
  }
}
