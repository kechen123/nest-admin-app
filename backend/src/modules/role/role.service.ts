import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, In } from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "../permission/permission.entity";
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
    private readonly permissionRepository: Repository<Permission>
  ) {}

  /**
   * 创建角色
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create({
      name: createRoleDto.name,
      code: createRoleDto.code,
      remark: createRoleDto.remark,
    });

    // 如果提供了权限ID，则关联权限
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(createRoleDto.permissions),
      });
      role.permissions = permissions;
    }

    return await this.roleRepository.save(role);
  }

  /**
   * 分页查询角色
   */
  async findAll(queryDto: QueryRoleDto): Promise<IPaginationResponse<Role>> {
    const { page = 1, pageSize = 10, name, code } = queryDto;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (code) {
      where.code = Like(`%${code}%`);
    }

    const [list, total] = await this.roleRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      relations: ["permissions"],
      order: {
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
      order: {
        createdAt: "DESC",
      },
    });
  }

  /**
   * 根据ID查询角色
   */
  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ["permissions"],
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

    // 更新基本信息
    if (updateRoleDto.name) role.name = updateRoleDto.name;
    if (updateRoleDto.code) role.code = updateRoleDto.code;
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
   * 删除角色
   */
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
}
