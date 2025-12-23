import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, In, IsNull } from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "../permission/permission.entity";
import { Menu } from "../menu/menu.entity";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { QueryRoleDto } from "./dto/query-role.dto";
import { IPaginationResponse } from "../../common/interfaces/response.interface";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>
  ) {}

  /**
   * 创建角色
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // 检查角色代码是否已存在
    const existingRole = await this.roleRepository.findOne({
      where: { code: createRoleDto.code, deletedAt: IsNull() },
    });
    if (existingRole) {
      throw new BadRequestException(`角色代码 ${createRoleDto.code} 已存在`);
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      code: createRoleDto.code,
      dataScope: createRoleDto.dataScope || "1",
      orderNum: createRoleDto.orderNum || 0,
      status: createRoleDto.status !== undefined ? createRoleDto.status : 1,
      remark: createRoleDto.remark,
    });

    // 如果提供了权限ID，则关联权限
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(createRoleDto.permissions),
      });
      role.permissions = permissions;
    }

    // 如果提供了菜单ID，则关联菜单
    if (createRoleDto.menuIds && createRoleDto.menuIds.length > 0) {
      const menus = await this.menuRepository.findBy({
        id: In(createRoleDto.menuIds),
        deletedAt: IsNull(),
      });
      role.menus = menus;
    }

    return await this.roleRepository.save(role);
  }

  /**
   * 分页查询角色
   */
  async findAll(queryDto: QueryRoleDto): Promise<IPaginationResponse<Role>> {
    const { page = 1, pageSize = 10, name, code, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const where: any = {
      deletedAt: IsNull(),
    };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (code) {
      where.code = Like(`%${code}%`);
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await this.roleRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      relations: ["permissions", "menus"],
      order: {
        orderNum: "ASC",
        createdAt: "DESC",
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
   * 获取所有角色列表（不分页）
   */
  async findAllWithoutPagination(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: {
        deletedAt: IsNull(),
        status: 1,
      },
      order: {
        orderNum: "ASC",
        createdAt: "DESC",
      },
    });
  }

  /**
   * 根据ID查询角色
   */
  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ["permissions", "menus"],
    });
    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }
    return role;
  }

  /**
   * 更新角色
   */
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // 如果更新角色代码，检查是否重复
    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existingRole = await this.roleRepository.findOne({
        where: { code: updateRoleDto.code, deletedAt: IsNull() },
      });
      if (existingRole) {
        throw new BadRequestException(`角色代码 ${updateRoleDto.code} 已存在`);
      }
    }

    // 更新基本信息
    if (updateRoleDto.name !== undefined) role.name = updateRoleDto.name;
    if (updateRoleDto.code !== undefined) role.code = updateRoleDto.code;
    if (updateRoleDto.dataScope !== undefined) role.dataScope = updateRoleDto.dataScope;
    if (updateRoleDto.orderNum !== undefined) role.orderNum = updateRoleDto.orderNum;
    if (updateRoleDto.status !== undefined) role.status = updateRoleDto.status;
    if (updateRoleDto.remark !== undefined) role.remark = updateRoleDto.remark;

    // 如果提供了权限ID，则更新权限关联
    if (updateRoleDto.permissions !== undefined) {
      if (updateRoleDto.permissions.length > 0) {
        const permissions = await this.permissionRepository.findBy({
          id: In(updateRoleDto.permissions),
        });
        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    // 如果提供了菜单ID，则更新菜单关联
    if (updateRoleDto.menuIds !== undefined) {
      if (updateRoleDto.menuIds.length > 0) {
        const menus = await this.menuRepository.findBy({
          id: In(updateRoleDto.menuIds),
          deletedAt: IsNull(),
        });
        role.menus = menus;
      } else {
        role.menus = [];
      }
    }

    return await this.roleRepository.save(role);
  }

  /**
   * 分配权限
   */
  async assignPermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const role = await this.findOne(roleId);

    if (permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });
      role.permissions = permissions;
    } else {
      role.permissions = [];
    }

    return await this.roleRepository.save(role);
  }

  /**
   * 分配菜单
   */
  async assignMenus(roleId: number, menuIds: number[]): Promise<Role> {
    const role = await this.findOne(roleId);

    if (menuIds.length > 0) {
      const menus = await this.menuRepository.findBy({
        id: In(menuIds),
        deletedAt: IsNull(),
      });
      role.menus = menus;
    } else {
      role.menus = [];
    }

    return await this.roleRepository.save(role);
  }

  /**
   * 删除角色（软删除）
   */
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    
    // 检查是否有用户使用此角色
    // 这里需要注入 UserRepository，但为了避免循环依赖，我们先简单处理
    // 实际项目中可以通过查询 user_roles 表来检查
    
    await this.roleRepository.softRemove(role);
  }
}
