import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not, In, IsNull } from 'typeorm';
import { Menu } from './menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { IPaginationResponse } from '../../common/interfaces/response.interface';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * 创建菜单
   */
  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const menu = this.menuRepository.create(createMenuDto);
    return await this.menuRepository.save(menu);
  }

  /**
   * 分页查询菜单
   */
  async findAll(queryDto: QueryMenuDto): Promise<IPaginationResponse<Menu>> {
    const { page = 1, pageSize = 10, name, status, parentId } = queryDto;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (status !== undefined) {
      where.status = status;
    }
    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    const [list, total] = await this.menuRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      relations: ['parent', 'children'],
      order: {
        sort: 'ASC',
        createdAt: 'DESC',
      },
    });

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取菜单树（只返回启用的菜单）
   */
  async getMenuTree(): Promise<Menu[]> {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0ca50388-22e6-4cac-83d9-1563006094ea',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'menu.service.ts:65',message:'getMenuTree called',data:{orderConfig:{sort:'ASC',createdAt:'ASC'}},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // 查询所有启用的菜单，按排序字段排序
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0ca50388-22e6-4cac-83d9-1563006094ea',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'menu.service.ts:68',message:'Before repository.find',data:{where:{status:1},order:{sort:'ASC',createdAt:'ASC'}},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const menus = await this.menuRepository.find({
      where: { status: 1 },
      relations: ['children'],
      order: {
        sort: 'ASC',
        createdAt: 'ASC',
      },
    }).catch((error) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/0ca50388-22e6-4cac-83d9-1563006094ea',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'menu.service.ts:75',message:'Repository.find error',data:{errorMessage:error.message,errorStack:error.stack,orderField:'sort'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      throw error;
    });

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0ca50388-22e6-4cac-83d9-1563006094ea',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'menu.service.ts:78',message:'Repository.find success',data:{menuCount:menus.length,firstMenuSort:menus[0]?.sort},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // 构建树形结构
    return this.buildTree(menus);
  }

  /**
   * 获取页面菜单树（登录后使用，根据角色权限过滤）
   * @param userId 用户ID，如果提供则根据用户角色过滤菜单
   */
  async getPageMenuTree(userId?: number): Promise<Menu[]> {
    let allowedMenuIds: number[] = [];
    let isAdmin = false;

    // 如果提供了用户ID，根据用户角色过滤菜单
    if (userId) {
      // 查询用户及其角色
      const user = await this.userRepository.findOne({
        where: { id: userId, deletedAt: IsNull() },
        relations: ['roles', 'roles.menus'],
      });

      if (!user) {
        return [];
      }

      // 检查是否是超级管理员
      if (user.isAdmin === 1) {
        isAdmin = true;
      } else if (user.roles && user.roles.length > 0) {
        // 只查询启用状态的角色
        const activeRoles = user.roles.filter((role) => role.status === 1);
        
        // 收集所有角色关联的菜单ID
        const menuIdSet = new Set<number>();
        activeRoles.forEach((role) => {
          if (role.menus && role.menus.length > 0) {
            role.menus.forEach((menu) => {
              menuIdSet.add(menu.id);
            });
          }
        });
        allowedMenuIds = Array.from(menuIdSet);
      }

      // 如果不是管理员且没有找到任何菜单权限，返回空数组
      if (!isAdmin && allowedMenuIds.length === 0) {
        return [];
      }
    }

    // 构建查询条件
    const whereCondition: any = {
      status: 1,
      visible: 1,
      menuType: Not('F'),
      deletedAt: IsNull(),
    };

    // 如果不是管理员且有权限菜单，则只查询这些菜单
    if (userId && !isAdmin && allowedMenuIds.length > 0) {
      whereCondition.id = In(allowedMenuIds);
    }

    // 查询菜单
    const menus = await this.menuRepository.find({
      where: whereCondition,
      relations: ['children'],
      order: {
        sort: 'ASC',
        createdAt: 'ASC',
      },
    });

    // 构建树形结构，并递归过滤隐藏的子菜单
    const filteredMenus = this.filterVisibleMenus(menus);
    const tree = this.buildTree(filteredMenus);

    // 如果不是管理员，需要递归过滤掉没有权限的菜单
    if (userId && !isAdmin && allowedMenuIds.length > 0) {
      return this.filterMenusByPermission(tree, allowedMenuIds);
    }

    return tree;
  }

  /**
   * 根据权限递归过滤菜单树
   */
  private filterMenusByPermission(menus: Menu[], allowedMenuIds: number[]): Menu[] {
    return menus
      .filter((menu) => allowedMenuIds.includes(menu.id))
      .map((menu) => {
        if (menu.children && menu.children.length > 0) {
          menu.children = this.filterMenusByPermission(menu.children, allowedMenuIds);
        }
        return menu;
      });
  }

  /**
   * 递归过滤隐藏的菜单（visible = 0）
   */
  private filterVisibleMenus(menus: Menu[]): Menu[] {
    return menus
      .filter(menu => menu.visible === 1)
      .map(menu => {
        if (menu.children && menu.children.length > 0) {
          menu.children = this.filterVisibleMenus(menu.children);
        }
        return menu;
      });
  }

  /**
   * 构建树形结构
   */
  private buildTree(menus: Menu[]): Menu[] {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0ca50388-22e6-4cac-83d9-1563006094ea',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'menu.service.ts:97',message:'buildTree called',data:{menuCount:menus.length,sampleParentIds:menus.slice(0,5).map(m=>({id:m.id,parentId:m.parentId}))},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const menuMap = new Map<number, Menu>();
    const rootMenus: Menu[] = [];

    // 第一遍遍历：创建所有菜单的映射
    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // 第二遍遍历：构建树形结构
    let rootCount = 0;
    let childCount = 0;
    menus.forEach((menu) => {
      const menuNode = menuMap.get(menu.id)!;
      // #region agent log
      const isRoot = menu.parentId === null || menu.parentId === undefined || menu.parentId === 0;
      if (isRoot) rootCount++; else childCount++;
      // #endregion
      if (menu.parentId === null || menu.parentId === undefined || menu.parentId === 0) {
        // 根节点（parentId为null、undefined或0都视为根节点）
        rootMenus.push(menuNode);
      } else {
        // 子节点，添加到父节点的children中
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(menuNode);
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/0ca50388-22e6-4cac-83d9-1563006094ea',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'menu.service.ts:115',message:'Parent not found',data:{menuId:menu.id,parentId:menu.parentId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
        }
      }
    });

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0ca50388-22e6-4cac-83d9-1563006094ea',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'menu.service.ts:122',message:'buildTree before sort',data:{rootCount,childCount,rootMenusCount:rootMenus.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // 递归排序子节点
    const sortChildren = (nodes: Menu[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          node.children.sort((a, b) => a.sort - b.sort);
          sortChildren(node.children);
        }
      });
    };

    sortChildren(rootMenus);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0ca50388-22e6-4cac-83d9-1563006094ea',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'menu.service.ts:135',message:'buildTree completed',data:{finalRootCount:rootMenus.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return rootMenus;
  }

  /**
   * 根据ID查询菜单
   */
  async findOne(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!menu) {
      throw new NotFoundException(`菜单 ID ${id} 不存在`);
    }
    return menu;
  }

  /**
   * 更新菜单
   */
  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);
    Object.assign(menu, updateMenuDto);
    return await this.menuRepository.save(menu);
  }

  /**
   * 删除菜单（软删除）
   * 如果菜单有子菜单，不允许删除
   */
  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    
    // 检查是否有子菜单（只检查未删除的子菜单）
    const childrenCount = await this.menuRepository
      .createQueryBuilder('menu')
      .where('menu.parentId = :parentId', { parentId: id })
      .andWhere('menu.deletedAt IS NULL')
      .getCount();
    
    if (childrenCount > 0) {
      throw new BadRequestException(`菜单存在子菜单，无法删除`);
    }
    
    await this.menuRepository.softRemove(menu);
  }
}

