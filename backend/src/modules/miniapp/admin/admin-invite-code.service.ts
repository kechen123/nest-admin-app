import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InviteCode } from '../invite-code/invite-code.entity';
import { QueryInviteCodeDto } from './dto/query-invite-code.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class AdminInviteCodeService {
  constructor(
    @InjectRepository(InviteCode)
    private readonly inviteCodeRepository: Repository<InviteCode>,
  ) {}

  /**
   * 分页查询邀请码列表
   */
  async findAll(queryDto: QueryInviteCodeDto): Promise<IPaginationResponse<InviteCode>> {
    const { page = 1, pageSize = 10, code, status, inviterNickname } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.inviteCodeRepository.createQueryBuilder('invite')
      .leftJoinAndSelect('invite.inviter', 'inviter')
      .leftJoinAndSelect('invite.accepter', 'accepter')
      .where('invite.deletedAt IS NULL');

    if (code) {
      queryBuilder.andWhere('invite.code LIKE :code', { code: `%${code}%` });
    }

    if (status) {
      queryBuilder.andWhere('invite.status = :status', { status });
    }

    if (inviterNickname) {
      queryBuilder.andWhere('inviter.nickname LIKE :inviterNickname', { 
        inviterNickname: `%${inviterNickname}%` 
      });
    }

    queryBuilder
      .orderBy('invite.createdAt', 'DESC')
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
   * 删除邀请码
   */
  async remove(id: number): Promise<void> {
    const inviteCode = await this.inviteCodeRepository.findOne({
      where: { id },
    });

    if (!inviteCode) {
      throw new NotFoundException('邀请码不存在');
    }

    await this.inviteCodeRepository.remove(inviteCode);
  }
}
