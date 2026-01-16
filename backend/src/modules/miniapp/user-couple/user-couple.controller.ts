import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UserCoupleService } from './user-couple.service';
import { BindPartnerDto, UnbindPartnerDto } from './dto/bind-partner.dto';
import { UserCouple } from './user-couple.entity';
import { MiniappUser } from '../miniapp-user/miniapp-user.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('用户绑定')
@Controller('miniapp/couple')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserCoupleController {
  constructor(private readonly coupleService: UserCoupleService) {}

  @Post('bind')
  @ApiOperation({ summary: '绑定另一半' })
  @ApiResponse({ status: 200, type: UserCouple })
  async bindPartner(@Req() req: any, @Body() bindDto: BindPartnerDto) {
    const userId = req.user?.userId || req.user?.id;
    return await this.coupleService.bindPartner(userId, bindDto);
  }

  @Delete('unbind')
  @ApiOperation({ summary: '解除绑定' })
  @ApiResponse({ status: 200 })
  async unbindPartner(@Req() req: any, @Body() unbindDto: UnbindPartnerDto) {
    const userId = req.user?.userId || req.user?.id;
    await this.coupleService.unbindPartner(userId, unbindDto);
    return { message: '解除绑定成功' };
  }

  @Get('info')
  @ApiOperation({ summary: '获取绑定信息' })
  @ApiResponse({ status: 200, type: UserCouple })
  async getCoupleInfo(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return await this.coupleService.getCoupleInfo(userId);
  }

  @Get('partner')
  @ApiOperation({ summary: '获取另一半信息' })
  @ApiResponse({ status: 200, type: MiniappUser })
  async getPartnerInfo(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return await this.coupleService.getPartnerInfo(userId);
  }
}
