import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  /**
   * 获取所有部门列表（不分页）
   */
  async findAll(): Promise<Department[]> {
    return await this.departmentRepository.find({
      where: {
        delFlag: 0,
      },
      order: {
        orderNum: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  /**
   * 根据ID查询部门
   */
  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: {
        id,
        delFlag: 0,
      },
    });
    if (!department) {
      throw new Error(`部门 ID ${id} 不存在`);
    }
    return department;
  }
}

