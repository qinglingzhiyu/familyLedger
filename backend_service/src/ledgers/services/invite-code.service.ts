import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerRole } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class InviteCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInviteCode(
    ledgerId: string,
    createdBy: string,
    role: LedgerRole = LedgerRole.MEMBER,
    expiresIn: number = 7 * 24 * 60 * 60 * 1000, // 默认7天
  ) {
    // 生成唯一邀请码
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = this.generateCode();
      const existing = await this.prisma.inviteCode.findUnique({
        where: { code },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new BadRequestException('生成邀请码失败，请重试');
    }

    const expiresAt = new Date(Date.now() + expiresIn);

    const inviteCode = await this.prisma.inviteCode.create({
      data: {
        code,
        ledgerId,
        createdBy,
        role,
        expiresAt,
      },
    });

    return inviteCode;
  }

  async validateInviteCode(code: string) {
    const inviteCode = await this.prisma.inviteCode.findUnique({
      where: { code },
      include: {
        ledger: {
          select: {
            id: true,
            name: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!inviteCode) {
      throw new NotFoundException('邀请码不存在');
    }

    if (inviteCode.ledger.deletedAt) {
      throw new BadRequestException('账本已被删除');
    }

    if (inviteCode.usedAt) {
      throw new BadRequestException('邀请码已被使用');
    }

    if (inviteCode.expiresAt < new Date()) {
      throw new BadRequestException('邀请码已过期');
    }

    return inviteCode;
  }

  async getInviteCodes(ledgerId: string, createdBy?: string) {
    const where: any = {
      ledgerId,
    };

    if (createdBy) {
      where.createdBy = createdBy;
    }

    const inviteCodes = await this.prisma.inviteCode.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        usedByUser: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return inviteCodes.map((inviteCode) => ({
      id: inviteCode.id,
      code: inviteCode.code,
      role: inviteCode.role,
      expiresAt: inviteCode.expiresAt,
      usedAt: inviteCode.usedAt,
      createdAt: inviteCode.createdAt,
      creator: inviteCode.creator,
      usedBy: inviteCode.usedByUser,
      isExpired: inviteCode.expiresAt < new Date(),
      isUsed: !!inviteCode.usedAt,
    }));
  }

  async revokeInviteCode(codeId: string, userId: string) {
    const inviteCode = await this.prisma.inviteCode.findUnique({
      where: { id: codeId },
    });

    if (!inviteCode) {
      throw new NotFoundException('邀请码不存在');
    }

    if (inviteCode.createdBy !== userId) {
      // 检查用户是否有权限撤销（管理员或所有者）
      const member = await this.prisma.ledgerMember.findFirst({
        where: {
          ledgerId: inviteCode.ledgerId,
          userId,
          role: {
            in: [LedgerRole.OWNER, LedgerRole.ADMIN],
          },
        },
      });

      if (!member) {
        throw new BadRequestException('无权限撤销该邀请码');
      }
    }

    if (inviteCode.usedAt) {
      throw new BadRequestException('邀请码已被使用，无法撤销');
    }

    await this.prisma.inviteCode.delete({
      where: { id: codeId },
    });

    return {
      message: '邀请码已撤销',
    };
  }

  async cleanupExpiredCodes() {
    const result = await this.prisma.inviteCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        usedAt: null,
      },
    });

    return {
      deletedCount: result.count,
    };
  }

  async getInviteCodeStatistics(ledgerId: string) {
    const [totalCodes, usedCodes, expiredCodes, activeCodes] = await Promise.all([
      this.prisma.inviteCode.count({
        where: { ledgerId },
      }),
      this.prisma.inviteCode.count({
        where: {
          ledgerId,
          usedAt: { not: null },
        },
      }),
      this.prisma.inviteCode.count({
        where: {
          ledgerId,
          expiresAt: { lt: new Date() },
          usedAt: null,
        },
      }),
      this.prisma.inviteCode.count({
        where: {
          ledgerId,
          expiresAt: { gte: new Date() },
          usedAt: null,
        },
      }),
    ]);

    return {
      totalCodes,
      usedCodes,
      expiredCodes,
      activeCodes,
      usageRate: totalCodes > 0 ? (usedCodes / totalCodes) * 100 : 0,
    };
  }

  private generateCode(): string {
    // 生成8位随机字符串，包含数字和大写字母
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const bytes = randomBytes(8);
    
    for (let i = 0; i < 8; i++) {
      result += chars[bytes[i] % chars.length];
    }
    
    return result;
  }

  async extendInviteCode(
    codeId: string,
    userId: string,
    additionalTime: number = 7 * 24 * 60 * 60 * 1000, // 默认延长7天
  ) {
    const inviteCode = await this.prisma.inviteCode.findUnique({
      where: { id: codeId },
    });

    if (!inviteCode) {
      throw new NotFoundException('邀请码不存在');
    }

    if (inviteCode.createdBy !== userId) {
      // 检查用户是否有权限延长（管理员或所有者）
      const member = await this.prisma.ledgerMember.findFirst({
        where: {
          ledgerId: inviteCode.ledgerId,
          userId,
          role: {
            in: [LedgerRole.OWNER, LedgerRole.ADMIN],
          },
        },
      });

      if (!member) {
        throw new BadRequestException('无权限延长该邀请码');
      }
    }

    if (inviteCode.usedAt) {
      throw new BadRequestException('邀请码已被使用，无法延长');
    }

    const newExpiresAt = new Date(inviteCode.expiresAt.getTime() + additionalTime);

    const updatedInviteCode = await this.prisma.inviteCode.update({
      where: { id: codeId },
      data: {
        expiresAt: newExpiresAt,
      },
    });

    return {
      code: updatedInviteCode.code,
      expiresAt: updatedInviteCode.expiresAt,
      message: '邀请码有效期已延长',
    };
  }
}