import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { IPaginationResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  /**
   * 创建岗位
   */
  async create(createPostDto: CreatePostDto): Promise<Post> {
    // 检查岗位编码是否已存在
    const existingPost = await this.postRepository.findOne({
      where: { code: createPostDto.code, deletedAt: IsNull() },
    });
    if (existingPost) {
      throw new BadRequestException(`岗位编码 ${createPostDto.code} 已存在`);
    }

    const post = this.postRepository.create({
      ...createPostDto,
      orderNum: createPostDto.orderNum || 0,
      status: createPostDto.status !== undefined ? createPostDto.status : 1,
    });

    return await this.postRepository.save(post);
  }

  /**
   * 分页查询岗位
   */
  async findAll(queryDto: QueryPostDto): Promise<IPaginationResponse<Post>> {
    const { page = 1, pageSize = 10, keyword, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.postRepository.createQueryBuilder('post')
      .where('post.deletedAt IS NULL');

    if (keyword) {
      queryBuilder.andWhere(
        '(post.name LIKE :keyword OR post.code LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }
    if (status !== undefined) {
      queryBuilder.andWhere('post.status = :status', { status });
    }

    queryBuilder
      .orderBy('post.orderNum', 'ASC')
      .addOrderBy('post.createdAt', 'DESC')
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
   * 获取所有岗位列表（不分页，用于下拉选择）
   */
  async findAllWithoutPagination(): Promise<Post[]> {
    return await this.postRepository.find({
      where: {
        deletedAt: IsNull(),
        status: 1,
      },
      order: {
        orderNum: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  /**
   * 根据ID查询岗位
   */
  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!post) {
      throw new NotFoundException(`岗位 ID ${id} 不存在`);
    }
    return post;
  }

  /**
   * 更新岗位
   */
  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);

    // 如果更新了岗位编码，检查是否重复
    if (updatePostDto.code && updatePostDto.code !== post.code) {
      const existingPost = await this.postRepository.findOne({
        where: { code: updatePostDto.code, deletedAt: IsNull() },
      });
      if (existingPost) {
        throw new BadRequestException(`岗位编码 ${updatePostDto.code} 已存在`);
      }
    }

    Object.assign(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  /**
   * 删除岗位（软删除）
   */
  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);

    // 检查是否有用户使用此岗位
    // 这里需要注入 UserRepository，但为了避免循环依赖，先简单处理
    // 实际项目中可以通过查询 users 表来检查

    await this.postRepository.softRemove(post);
  }
}

