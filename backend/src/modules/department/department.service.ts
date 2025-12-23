import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { Department } from './department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';
import { IPaginationResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  /**
   * 创建部门
   */
  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // 检查父部门是否存在
    if (createDepartmentDto.parentId && createDepartmentDto.parentId !== 0) {
      const parent = await this.departmentRepository.findOne({
        where: { id: createDepartmentDto.parentId, deletedAt: IsNull() },
      });
      if (!parent) {
        throw new BadRequestException(`父部门 ID ${createDepartmentDto.parentId} 不存在`);
      }
    }

    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      parentId: createDepartmentDto.parentId || 0,
      orderNum: createDepartmentDto.orderNum || 0,
      status: createDepartmentDto.status !== undefined ? createDepartmentDto.status : 1,
    });

    return await this.departmentRepository.save(department);
  }

  /**
   * 分页查询部门
   */
  async findAll(queryDto: QueryDepartmentDto): Promise<IPaginationResponse<Department>> {
    const { page = 1, pageSize = 10, name, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const where: any = {
      deletedAt: IsNull(),
      delFlag: 0,
    };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await this.departmentRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      relations: ['parent', 'children'],
      order: {
        orderNum: 'ASC',
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
   * 获取所有部门列表（不分页，用于下拉选择）
   */
  async findAllWithoutPagination(): Promise<Department[]> {
    return await this.departmentRepository.find({
      where: {
        deletedAt: IsNull(),
        delFlag: 0,
        status: 1,
      },
      relations: ['children'],
      order: {
        orderNum: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  /**
   * 获取部门树
   */
  async getDepartmentTree(): Promise<Department[]> {
    const departments = await this.departmentRepository.find({
      where: {
        deletedAt: IsNull(),
        delFlag: 0,
      },
      relations: ['children'],
      order: {
        orderNum: 'ASC',
        createdAt: 'DESC',
      },
    });

    return this.buildTree(departments);
  }

  /**
   * 构建树形结构
   */
  private buildTree(departments: Department[]): Department[] {
    const deptMap = new Map<number, Department>();
    const rootDepartments: Department[] = [];

    // 第一遍遍历：创建所有部门的映射
    departments.forEach((dept) => {
      deptMap.set(dept.id, { ...dept, children: [] });
    });

    // 第二遍遍历：构建树形结构
    departments.forEach((dept) => {
      const deptNode = deptMap.get(dept.id)!;
      if (dept.parentId === null || dept.parentId === undefined || dept.parentId === 0) {
        rootDepartments.push(deptNode);
      } else {
        const parent = deptMap.get(dept.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(deptNode);
        }
      }
    });

    // 递归排序子节点
    const sortChildren = (nodes: Department[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          node.children.sort((a, b) => a.orderNum - b.orderNum);
          sortChildren(node.children);
        }
      });
    };

    sortChildren(rootDepartments);
    return rootDepartments;
  }

  /**
   * 根据ID查询部门
   */
  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
        delFlag: 0,
      },
      relations: ['parent', 'children'],
    });
    if (!department) {
      throw new NotFoundException(`部门 ID ${id} 不存在`);
    }
    return department;
  }

  /**
   * 更新部门
   */
  async update(id: number, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    // 检查父部门是否存在且不是自己
    if (updateDepartmentDto.parentId !== undefined) {
      if (updateDepartmentDto.parentId === id) {
        throw new BadRequestException('不能将自己设置为父部门');
      }
      if (updateDepartmentDto.parentId !== 0) {
        const parent = await this.departmentRepository.findOne({
          where: { id: updateDepartmentDto.parentId, deletedAt: IsNull() },
        });
        if (!parent) {
          throw new BadRequestException(`父部门 ID ${updateDepartmentDto.parentId} 不存在`);
        }
        // 检查是否会形成循环引用
        const isDescendant = await this.isDescendant(id, updateDepartmentDto.parentId);
        if (isDescendant) {
          throw new BadRequestException('不能将子部门设置为父部门');
        }
      }
    }

    Object.assign(department, updateDepartmentDto);
    return await this.departmentRepository.save(department);
  }

  /**
   * 检查是否是子部门
   */
  private async isDescendant(deptId: number, ancestorId: number): Promise<boolean> {
    const dept = await this.departmentRepository.findOne({
      where: { id: deptId, deletedAt: IsNull() },
    });
    if (!dept || dept.parentId === 0 || !dept.parentId) {
      return false;
    }
    if (dept.parentId === ancestorId) {
      return true;
    }
    return this.isDescendant(dept.parentId, ancestorId);
  }

  /**
   * 删除部门（软删除）
   */
  async remove(id: number): Promise<void> {
    const department = await this.findOne(id);

    // 检查是否有子部门
    const childrenCount = await this.departmentRepository.count({
      where: {
        parentId: id,
        deletedAt: IsNull(),
        delFlag: 0,
      },
    });

    if (childrenCount > 0) {
      throw new BadRequestException('部门存在子部门，无法删除');
    }

    // 检查是否有用户使用此部门
    // 这里需要注入 UserRepository，但为了避免循环依赖，先简单处理
    // 实际项目中可以通过查询 users 表来检查

    department.delFlag = 1;
    await this.departmentRepository.softRemove(department);
  }
}

