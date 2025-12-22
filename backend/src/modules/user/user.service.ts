import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { IPaginationResponse } from '../../common/interfaces/response.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...rest,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  /**
   * 分页查询用户
   */
  async findAll(queryDto: QueryUserDto): Promise<IPaginationResponse<User>> {
    const { page = 1, pageSize = 10, username, email, role } = queryDto;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (username) {
      where.username = Like(`%${username}%`);
    }
    if (email) {
      where.email = Like(`%${email}%`);
    }
    if (role) {
      where.role = role;
    }

    const [list, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: {
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
   * 根据ID查询用户
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }
    return user;
  }

  /**
   * 根据用户名查询用户（用于认证）
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'email', 'password', 'role', 'status'],
    });
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
    
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  /**
   * 删除用户（软删除）
   */
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
  }
}
