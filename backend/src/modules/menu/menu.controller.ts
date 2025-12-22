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

  @Get()
  @ApiOperation({ summary: '分页查询菜单列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryMenuDto) {
    return this.menuService.findAll(queryDto);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树（只返回启用的菜单）' })
  @ApiResponse({ status: 200, type: [Menu] })
  getMenuTree() {
    return this.menuService.getMenuTree();
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

