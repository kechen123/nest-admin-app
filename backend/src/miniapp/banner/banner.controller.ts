import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MiniappBannerService } from './banner.service';

@ApiTags('小程序-轮播图')
@Controller('miniapp/banners')
export class MiniappBannerController {
  constructor(private readonly bannerService: MiniappBannerService) {}

  @Get()
  @ApiOperation({ summary: '获取轮播图列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll() {
    return this.bannerService.findAll();
  }
}

