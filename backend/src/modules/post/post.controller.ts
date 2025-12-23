import {
  Controller,
  Get,
  Post as PostDecorator,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { Post } from './post.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('岗位管理')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @PostDecorator()
  @ApiOperation({ summary: '创建岗位' })
  @ApiResponse({ status: 201, type: Post })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有岗位列表（不分页，用于下拉选择）' })
  @ApiResponse({ status: 200, type: [Post] })
  findAllWithoutPagination() {
    return this.postService.findAllWithoutPagination();
  }

  @Get()
  @ApiOperation({ summary: '分页查询岗位列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryPostDto) {
    return this.postService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询岗位' })
  @ApiResponse({ status: 200, type: Post })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新岗位' })
  @ApiResponse({ status: 200, type: Post })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除岗位' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postService.remove(id);
  }
}

