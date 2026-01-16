import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { MiniappUserService } from './miniapp-user.service';
import { WxLoginDto, WxLoginResponseDto } from './dto/wx-login.dto';
import { MiniappUser } from './miniapp-user.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('小程序用户')
@Controller('miniapp/user')
export class MiniappUserController {
  constructor(private readonly userService: MiniappUserService) {}

  @Post('wxLogin')
  @ApiOperation({ summary: '微信登录/注册' })
  @ApiResponse({ status: 200, type: WxLoginResponseDto })
  async wxLogin(@Body() wxLoginDto: WxLoginDto, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    return await this.userService.wxLogin(wxLoginDto, ip);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({ status: 200, type: MiniappUser })
  async getUserInfo(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findOne(id);
  }
}
