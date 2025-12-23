import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { Menu } from './menu.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('菜单管理')
@Controller('menus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({ status: 201, type: Menu })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树（只返回启用的菜单，管理页面使用）' })
  @ApiResponse({ status: 200, type: [Menu] })
  getMenuTree(@Req() req: any) {
    // tree 接口用于管理页面，不根据角色过滤，返回所有启用的菜单
    return this.menuService.getMenuTree();
  }

  @Get('page-tree')
  @ApiOperation({ summary: '获取页面菜单树（登录后使用，根据角色权限过滤）' })
  @ApiResponse({ status: 200, type: [Menu] })
  getPageMenuTree(@Req() req: any) {
    const userId = req.user?.userId;
    return this.menuService.getPageMenuTree(userId);
  }

  @Get()
  @ApiOperation({ summary: '分页查询菜单列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryMenuDto) {
    return this.menuService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询菜单' })
  @ApiResponse({ status: 200, type: Menu })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新菜单' })
  @ApiResponse({ status: 200, type: Menu })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}

