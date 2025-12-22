import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Permission } from "./permission.entity";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { QueryPermissionDto } from "./dto/query-permission.dto";
import { IPaginationResponse } from "../../common/interfaces/response.interface";

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  /**
   * 创建权限
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      parentId: createPermissionDto.parentId || null,
      sort: createPermissionDto.sort || 0,
    });
    return await this.permissionRepository.save(permission);
  }

  /**
   * 分页查询权限
   */
  async findAll(queryDto: QueryPermissionDto): Promise<IPaginationResponse<Permission>> {
    const { page = 1, pageSize = 10, name, code, type, parentId } = queryDto;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (code) {
      where.code = Like(`%${code}%`);
    }
    if (type) {
      where.type = type;
    }
    if (parentId !== undefined && parentId !== null) {
      where.parentId = parentId;
    } else if (parentId === null) {
      // 查询顶级权限（parentId 为 null）
      where.parentId = null;
    }

    const [list, total] = await this.permissionRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      relations: ["parent", "children"],
      order: {
        sort: "ASC",
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
   * 获取权限树
   */
  async findTree(): Promise<Permission[]> {
    const permissions = await this.permissionRepository.find({
      relations: ["children"],
      order: {
        sort: "ASC",
        createdAt: "ASC",
      },
    });

    // 构建树形结构
    const tree: Permission[] = [];
    const map = new Map<number, Permission>();

    // 先创建所有节点的映射
    permissions.forEach((permission) => {
      map.set(permission.id, { ...permission, children: [] });
    });

    // 构建树形结构
    permissions.forEach((permission) => {
      const node = map.get(permission.id)!;
      if (!permission.parentId) {
        tree.push(node);
      } else {
        const parent = map.get(permission.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        }
      }
    });

    return tree;
  }

  /**
   * 根据ID查询权限
   */
  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ["parent", "children"],
    });
    if (!permission) {
      throw new NotFoundException(`权限 ID ${id} 不存在`);
    }
    return permission;
  }

  /**
   * 更新权限
   */
  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);
    Object.assign(permission, updatePermissionDto);
    return await this.permissionRepository.save(permission);
  }

  /**
   * 删除权限
   */
  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);

    // 检查是否有子权限
    const children = await this.permissionRepository.find({
      where: { parentId: id },
    });

    if (children.length > 0) {
      throw new Error("该权限下存在子权限，无法删除");
    }

    await this.permissionRepository.remove(permission);
  }
}
