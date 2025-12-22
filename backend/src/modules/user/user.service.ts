import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { IPaginationResponse } from '../../common/interfaces/response.interface';
import { Role } from '../role/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, role, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...rest,
      password: hashedPassword,
    });

    // 如果提供了 role，通过关联表设置角色
    if (role) {
      const roleEntity = await this.roleRepository.findOne({ where: { code: role } });
      if (roleEntity) {
        user.roles = [roleEntity];
      }
    }

    return await this.userRepository.save(user);
  }

  /**
   * 分页查询用户
   */
  async findAll(queryDto: QueryUserDto): Promise<IPaginationResponse<User>> {
    const { page = 1, pageSize = 10, username, email, role } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      // 过滤已删除的用户：del_flag = 0 且 deletedAt IS NULL
      .where('user.delFlag = :delFlag', { delFlag: 0 })
      .andWhere('user.deletedAt IS NULL');

    if (username) {
      queryBuilder.andWhere('user.username LIKE :username', { username: `%${username}%` });
    }
    if (email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }
    if (role) {
      // 通过关联表查询角色
      queryBuilder.andWhere('roles.code = :roleCode', { roleCode: role });
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();
    
    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 根据ID查询用户
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { 
        id,
        delFlag: 0, // 过滤已删除的用户
      },
      relations: ['roles'], // 加载角色关联
    });
    if (!user || user.deletedAt) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }
    return user;
  }

  /**
   * 根据用户名查询用户（用于认证）
   */
  async findByUsername(username: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.password',
        'user.status',
        'user.delFlag',
        'user.deletedAt',
      ])
      .where('user.username = :username', { username })
      .andWhere('user.delFlag = :delFlag', { delFlag: 0 })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
    
    return user;
  }

  /**
   * 更新用户
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    // 如果提供了密码，需要加密
    if (updateUserDto.password && updateUserDto.password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hashedPassword;
    } else {
      // 如果没有提供密码，从 DTO 中移除 password 字段，避免更新为空值
      delete updateUserDto.password;
    }
    
    // 处理 role 字段（通过关联表）
    const { role, ...restDto } = updateUserDto;
    if (role !== undefined) {
      const roleEntity = await this.roleRepository.findOne({ where: { code: role } });
      if (roleEntity) {
        user.roles = [roleEntity];
      } else {
        // 如果角色不存在，清空角色关联
        user.roles = [];
      }
    }
    
    Object.assign(user, restDto);
    return await this.userRepository.save(user);
  }

  /**
   * 删除用户（软删除）
   */
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    // 同时设置 delFlag = 1 和 deletedAt，保持数据一致性
    user.delFlag = 1;
    await this.userRepository.softRemove(user);
  }
}
