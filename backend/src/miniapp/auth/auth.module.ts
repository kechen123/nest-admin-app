import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MiniappAuthController } from './auth.controller';
import { MiniappAuthService } from './auth.service';
import { MiniappUser } from '../../common/entities/mall/miniapp-user.entity';
import { MiniappJwtStrategy } from './strategies/miniapp-jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([MiniappUser]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: { expiresIn: '7d' }, // 小程序token有效期7天
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MiniappAuthController],
  providers: [MiniappAuthService, MiniappJwtStrategy],
  exports: [MiniappAuthService],
})
export class MiniappAuthModule {}

