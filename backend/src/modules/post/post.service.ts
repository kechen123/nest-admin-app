import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  /**
   * 获取所有岗位列表（不分页）
   */
  async findAll(): Promise<Post[]> {
    return await this.postRepository.find({
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
      where: { id },
    });
    if (!post) {
      throw new Error(`岗位 ID ${id} 不存在`);
    }
    return post;
  }
}

