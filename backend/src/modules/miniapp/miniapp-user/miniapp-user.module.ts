import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MiniappUser } from './miniapp-user.entity';
import { UserCouple } from '../user-couple/user-couple.entity';
import { MiniappUserService } from './miniapp-user.service';
import { MiniappUserController } from './miniapp-user.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([MiniappUser, UserCouple]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '30d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MiniappUserController],
  providers: [MiniappUserService],
  exports: [MiniappUserService],
})
export class MiniappUserModule {}
