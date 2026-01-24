import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MiniappUser } from '../miniapp-user/miniapp-user.entity';
import { QueryMiniappUserDto } from './dto/query-miniapp-user.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class AdminMiniappUserService {
  constructor(
    @InjectRepository(MiniappUser)
    private readonly userRepository: Repository<MiniappUser>,
  ) {}

  /**
   * 分页查询小程序用户列表
   */
  async findAll(queryDto: QueryMiniappUserDto): Promise<IPaginationResponse<MiniappUser>> {
    const { page = 1, pageSize = 10, nickname, phone, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    if (nickname) {
      queryBuilder.andWhere('user.nickname LIKE :nickname', { nickname: `%${nickname}%` });
    }

    if (phone) {
      queryBuilder.andWhere('user.phone LIKE :phone', { phone: `%${phone}%` });
    }

    if (status !== undefined && status !== null) {
      queryBuilder.andWhere('user.status = :status', { status });
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
}
