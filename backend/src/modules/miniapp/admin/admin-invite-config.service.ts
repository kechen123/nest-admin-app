import { Injectable } from '@nestjs/common';
import { InviteConfigService } from '../invite-config/invite-config.service';
import { CreateInviteConfigDto } from '../invite-config/dto/create-invite-config.dto';
import { UpdateInviteConfigDto } from '../invite-config/dto/update-invite-config.dto';
import { QueryInviteConfigDto } from '../invite-config/dto/query-invite-config.dto';
import { InviteConfig } from '../invite-config/invite-config.entity';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class AdminInviteConfigService {
  constructor(
    private readonly inviteConfigService: InviteConfigService,
  ) {}

  async create(createDto: CreateInviteConfigDto): Promise<InviteConfig> {
    return this.inviteConfigService.create(createDto);
  }

  async findAll(queryDto: QueryInviteConfigDto): Promise<IPaginationResponse<InviteConfig>> {
    return this.inviteConfigService.findAll(queryDto);
  }

  async findOne(id: number): Promise<InviteConfig> {
    return this.inviteConfigService.findOne(id);
  }

  async update(id: number, updateDto: UpdateInviteConfigDto): Promise<InviteConfig> {
    return this.inviteConfigService.update(id, updateDto);
  }

  async remove(id: number): Promise<void> {
    return this.inviteConfigService.remove(id);
  }

  async toggleEnabled(id: number, isEnabled: number): Promise<InviteConfig> {
    return this.inviteConfigService.toggleEnabled(id, isEnabled);
  }
}
