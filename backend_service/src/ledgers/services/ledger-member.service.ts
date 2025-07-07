import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerRole } from '@prisma/client';
import { UpdateMemberRoleDto } from '../dto/update-member-role.dto';

@Injectable()
export class LedgerMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async findMembersByLedger(ledgerId: string) {
    return this.prisma.ledgerMember.findMany({
      where: {
        ledgerId,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            phone: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }

  async findMemberByUserAndLedger(userId: string, ledgerId: string) {
    return this.prisma.ledgerMember.findFirst({
      where: {
        userId,
        ledgerId,
        ledger: {
          deletedAt: null,
        },
      },
      include: {
        ledger: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });
  }

  async updateMemberRole(
    ledgerId: string,
    memberId: string,
    currentUserId: string,
    updateMemberRoleDto: UpdateMemberRoleDto,
  ) {
    // 检查当前用户权限
    const currentMember = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId: currentUserId,
      },
    });

    if (!currentMember || currentMember.role !== LedgerRole.OWNER) {
      throw new ForbiddenException('只有账本所有者可以修改成员角色');
    }

    // 获取目标成员
    const targetMember = await this.prisma.ledgerMember.findFirst({
      where: {
        id: memberId,
        ledgerId,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    if (!targetMember) {
      throw new NotFoundException('成员不存在');
    }

    // 不能修改所有者角色
    if (targetMember.role === LedgerRole.OWNER) {
      throw new BadRequestException('不能修改所有者角色');
    }

    // 不能将成员设置为所有者
    if (updateMemberRoleDto.role === LedgerRole.OWNER) {
      throw new BadRequestException('不能将成员设置为所有者');
    }

    const updatedMember = await this.prisma.ledgerMember.update({
      where: {
        id: memberId,
      },
      data: {
        role: updateMemberRoleDto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });

    return {
      id: updatedMember.id,
      role: updatedMember.role,
      joinedAt: updatedMember.joinedAt,
      user: updatedMember.user,
    };
  }

  async removeMember(ledgerId: string, memberId: string, currentUserId: string) {
    // 检查当前用户权限
    const currentMember = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId: currentUserId,
      },
    });

    if (!currentMember) {
      throw new ForbiddenException('无权限访问该账本');
    }

    // 获取目标成员
    const targetMember = await this.prisma.ledgerMember.findFirst({
      where: {
        id: memberId,
        ledgerId,
      },
    });

    if (!targetMember) {
      throw new NotFoundException('成员不存在');
    }

    // 权限检查
    if (currentMember.role === LedgerRole.MEMBER) {
      // 普通成员只能退出自己
      if (targetMember.userId !== currentUserId) {
        throw new ForbiddenException('权限不足');
      }
    } else if (currentMember.role === LedgerRole.ADMIN) {
      // 管理员可以移除普通成员，但不能移除所有者和其他管理员
      if (
        targetMember.role === LedgerRole.OWNER ||
        (targetMember.role === LedgerRole.ADMIN && targetMember.userId !== currentUserId)
      ) {
        throw new ForbiddenException('权限不足');
      }
    }
    // 所有者可以移除任何人（除了自己）
    else if (currentMember.role === LedgerRole.OWNER) {
      if (targetMember.role === LedgerRole.OWNER && targetMember.userId !== currentUserId) {
        throw new BadRequestException('不能移除其他所有者');
      }
    }

    await this.prisma.ledgerMember.delete({
      where: {
        id: memberId,
      },
    });

    return {
      message: '成员已移除',
    };
  }

  async leaveLedger(ledgerId: string, userId: string) {
    const member = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException('您不是该账本的成员');
    }

    // 检查是否是唯一的所有者
    if (member.role === LedgerRole.OWNER) {
      const ownerCount = await this.prisma.ledgerMember.count({
        where: {
          ledgerId,
          role: LedgerRole.OWNER,
        },
      });

      if (ownerCount === 1) {
        throw new BadRequestException('您是唯一的所有者，无法退出账本。请先转让所有权或删除账本。');
      }
    }

    await this.prisma.ledgerMember.delete({
      where: {
        id: member.id,
      },
    });

    return {
      message: '已退出账本',
    };
  }

  async transferOwnership(
    ledgerId: string,
    targetUserId: string,
    currentUserId: string,
  ) {
    // 检查当前用户是否是所有者
    const currentMember = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId: currentUserId,
        role: LedgerRole.OWNER,
      },
    });

    if (!currentMember) {
      throw new ForbiddenException('只有所有者可以转让所有权');
    }

    // 检查目标用户是否是成员
    const targetMember = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId: targetUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    if (!targetMember) {
      throw new NotFoundException('目标用户不是该账本的成员');
    }

    if (targetMember.userId === currentUserId) {
      throw new BadRequestException('不能转让给自己');
    }

    // 执行转让
    await this.prisma.$transaction(async (tx) => {
      // 将当前所有者降级为管理员
      await tx.ledgerMember.update({
        where: {
          id: currentMember.id,
        },
        data: {
          role: LedgerRole.ADMIN,
        },
      });

      // 将目标用户升级为所有者
      await tx.ledgerMember.update({
        where: {
          id: targetMember.id,
        },
        data: {
          role: LedgerRole.OWNER,
        },
      });
    });

    return {
      message: `所有权已转让给 ${targetMember.user.nickname}`,
      newOwner: targetMember.user,
    };
  }

  async getMemberStatistics(ledgerId: string, memberId: string) {
    const member = await this.prisma.ledgerMember.findFirst({
      where: {
        id: memberId,
        ledgerId,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    // 获取成员的交易统计
    const [incomeSum, expenseSum, transactionCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          ledgerId,
          createdBy: member.userId,
          type: 'INCOME',
          deletedAt: null,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          ledgerId,
          createdBy: member.userId,
          type: 'EXPENSE',
          deletedAt: null,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({
        where: {
          ledgerId,
          createdBy: member.userId,
          deletedAt: null,
        },
      }),
    ]);

    const totalIncome = parseFloat(incomeSum._sum.amount?.toString() || '0');
    const totalExpense = parseFloat(expenseSum._sum.amount?.toString() || '0');

    return {
      member: {
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user,
      },
      statistics: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount,
      },
    };
  }
}