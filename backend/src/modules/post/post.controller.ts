import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PostService } from './post.service';
import { Post } from './post.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('岗位管理')
@Controller('position')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: '获取所有岗位列表' })
  @ApiResponse({ status: 200, type: [Post] })
  async findAll() {
    return await this.postService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询岗位' })
  @ApiParam({ name: 'id', description: '岗位ID', example: 1 })
  @ApiResponse({ status: 200, type: Post })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.postService.findOne(id);
  }
}

