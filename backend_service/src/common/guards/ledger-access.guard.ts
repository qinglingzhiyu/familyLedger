import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LedgerAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ledgerId = request.params.ledgerId;

    if (!user || !ledgerId) {
      throw new ForbiddenException('访问被拒绝');
    }

    // 检查用户是否是该账本的成员
    const member = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId: user.id,
      },
    });

    if (!member) {
      throw new NotFoundException('您不是该账本的成员');
    }

    // 将成员信息添加到请求对象中，供后续使用
    request.ledgerMember = member;

    return true;
  }
}