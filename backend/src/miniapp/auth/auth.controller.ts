import { Controller, Post, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MiniappAuthService } from './auth.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { MiniappAuthGuard } from './guards/miniapp-auth.guard';

@ApiTags('小程序认证')
@Controller('miniapp/auth')
export class MiniappAuthController {
  constructor(private readonly authService: MiniappAuthService) {}

  @Post('login')
  @ApiOperation({ summary: '微信登录' })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                openid: { type: 'string' },
                nickname: { type: 'string' },
                avatar: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  async login(@Body() wechatLoginDto: WechatLoginDto) {
    return this.authService.wechatLogin(wechatLoginDto);
  }

  @Get('profile')
  @UseGuards(MiniappAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(MiniappAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新个人信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateProfile(@Req() req, @Body() updateData: any) {
    return this.authService.updateProfile(req.user.userId, updateData);
  }

  @Post('bind-phone')
  @UseGuards(MiniappAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '绑定手机号' })
  @ApiResponse({ status: 200, description: '绑定成功' })
  async bindPhone(@Req() req, @Body() body: { phone: string }) {
    return this.authService.bindPhone(req.user.userId, body.phone);
  }
}

