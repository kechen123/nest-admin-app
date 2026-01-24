import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { InviteCodeService } from './invite-code.service';
import { GenerateInviteDto } from './dto/generate-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { CancelInviteDto } from './dto/cancel-invite.dto';
import { MarkSharedDto } from './dto/mark-shared.dto';
import { InviteInfoDto } from './dto/invite-info.dto';
import { UserInviteListDto } from './dto/user-invite-list.dto';
import { GenerateInviteResponseDto } from './dto/generate-invite-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('邀请码管理')
@Controller('miniapp/invite')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class InviteCodeController {
  constructor(private readonly inviteCodeService: InviteCodeService) {}

  @Post('generate')
  @ApiOperation({ summary: '生成邀请码' })
  @ApiResponse({
    status: 200,
    type: GenerateInviteResponseDto,
    description: '生成邀请码成功'
  })
  async generateInviteCode(
    @Req() req: any,
    @Body() dto: GenerateInviteDto,
  ): Promise<GenerateInviteResponseDto> {
    const userId = req.user?.userId || req.user?.id;
    return await this.inviteCodeService.generateInviteCode(userId, dto);
  }

  @Get(':code/info')
  @ApiOperation({ summary: '获取邀请码信息' })
  @ApiParam({ name: 'code', description: '邀请码' })
  @ApiResponse({
    status: 200,
    type: InviteInfoDto,
    description: '获取邀请码信息成功'
  })
  async getInviteInfo(@Param('code') code: string): Promise<InviteInfoDto> {
    return await this.inviteCodeService.getInviteInfo(code);
  }

  @Post('accept')
  @ApiOperation({ summary: '接受邀请' })
  @ApiResponse({ status: 200, description: '接受邀请成功' })
  async acceptInvite(
    @Req() req: any,
    @Body() dto: AcceptInviteDto,
  ): Promise<{ message: string }> {
    const userId = req.user?.userId || req.user?.id;
    await this.inviteCodeService.acceptInvite(userId, dto);
    return { message: '接受邀请成功' };
  }

  @Delete('cancel')
  @ApiOperation({ summary: '取消邀请' })
  @ApiResponse({ status: 200, description: '取消邀请成功' })
  async cancelInvite(
    @Req() req: any,
    @Body() dto: CancelInviteDto,
  ): Promise<{ message: string }> {
    const userId = req.user?.userId || req.user?.id;
    await this.inviteCodeService.cancelInvite(userId, dto);
    return { message: '取消邀请成功' };
  }

  @Get('my-codes')
  @ApiOperation({ summary: '获取我的邀请码列表' })
  @ApiResponse({
    status: 200,
    type: [UserInviteListDto],
    description: '获取邀请码列表成功'
  })
  async getUserInviteCodes(@Req() req: any): Promise<UserInviteListDto[]> {
    const userId = req.user?.userId || req.user?.id;
    return await this.inviteCodeService.getUserInviteCodes(userId);
  }

  @Post('mark-shared')
  @ApiOperation({ summary: '标记邀请码为已分享' })
  @ApiResponse({ status: 200, description: '标记成功' })
  async markInviteAsShared(
    @Req() req: any,
    @Body() dto: MarkSharedDto,
  ): Promise<{ message: string }> {
    const userId = req.user?.userId || req.user?.id;
    await this.inviteCodeService.markInviteAsShared(userId, dto.code);
    return { message: '标记成功' };
  }

}