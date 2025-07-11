import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MemberRole } from '@prisma/client';
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

    if (!currentMember || currentMember.role !== MemberRole.OWNER) {
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
    if (targetMember.role === MemberRole.OWNER) {
      throw new BadRequestException('不能修改所有者角色');
    }

    // 角色验证已在DTO中处理

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
    if (currentMember.role === MemberRole.MEMBER) {
      // 普通成员只能退出自己
      if (targetMember.userId !== currentUserId) {
        throw new ForbiddenException('权限不足');
      }
    } else if (currentMember.role === MemberRole.ADMIN) {
      // 管理员可以移除普通成员，但不能移除其他管理员
      if (targetMember.role === MemberRole.ADMIN && targetMember.userId !== currentUserId) {
        throw new ForbiddenException('权限不足');
      }
    }

    // 软删除成员
    await this.prisma.ledgerMember.update({
      where: {
        id: memberId,
      },
      data: {
        deletedAt: new Date(),
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

    // 管理员可以直接退出账本

    // 软删除成员
    await this.prisma.ledgerMember.update({
      where: {
        id: member.id,
      },
      data: {
        deletedAt: new Date(),
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
    // 检查当前用户是否是管理员
    const currentMember = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId: currentUserId,
        role: MemberRole.ADMIN,
      },
    });

    if (!currentMember) {
      throw new ForbiddenException('只有管理员可以转让管理权');
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
      // 将当前管理员降级为普通成员
      await tx.ledgerMember.update({
        where: {
          id: currentMember.id,
        },
        data: {
          role: MemberRole.MEMBER,
        },
      });

      // 将目标用户升级为管理员
      await tx.ledgerMember.update({
        where: {
          id: targetMember.id,
        },
        data: {
          role: MemberRole.ADMIN,
        },
      });
    });

    return {
      message: `管理权已转让给 ${targetMember.user.nickname}`,
      newAdmin: targetMember.user,
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
          userId: member.userId,
          type: 'INCOME',
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          ledgerId,
          userId: member.userId,
          type: 'EXPENSE',
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({
        where: {
          ledgerId,
          userId: member.userId,
        },
      }),
    ]);

    const totalIncome = parseFloat(incomeSum._sum?.amount?.toString() || '0');
    const totalExpense = parseFloat(expenseSum._sum?.amount?.toString() || '0');

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