import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MiniappUser } from './miniapp-user.entity';
import { MiniappUserService } from './miniapp-user.service';
import { MiniappUserController } from './miniapp-user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MiniappUser]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [MiniappUserController],
  providers: [MiniappUserService],
  exports: [MiniappUserService],
})
export class MiniappUserModule {}
