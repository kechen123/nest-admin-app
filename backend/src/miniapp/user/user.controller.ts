import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MiniappUserService } from './user.service';
import { MiniappAuthGuard } from '../auth/guards/miniapp-auth.guard';

@ApiTags('小程序-个人中心')
@Controller('miniapp/user')
@UseGuards(MiniappAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MiniappUserController {
  constructor(private readonly userService: MiniappUserService) {}

  @Get('statistics')
  @ApiOperation({ summary: '获取用户统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStatistics(@Req() req) {
    return this.userService.getStatistics(req.user.userId);
  }
}

