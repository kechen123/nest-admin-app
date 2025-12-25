import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MiniappUser } from '../../../common/entities/mall/miniapp-user.entity';

@Injectable()
export class MiniappJwtStrategy extends PassportStrategy(Strategy, 'miniapp-jwt') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MiniappUser)
    private readonly miniappUserRepository: Repository<MiniappUser>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: any) {
    const user = await this.miniappUserRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user || !user.status) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }
    return { userId: user.id, openid: user.openid };
  }
}

