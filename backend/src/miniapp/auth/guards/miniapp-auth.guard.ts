import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MiniappAuthGuard extends AuthGuard('miniapp-jwt') {}

