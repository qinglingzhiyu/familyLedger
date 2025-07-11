import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { LedgerMemberService } from './services/ledger-member.service';
import { InviteCodeService } from './services/invite-code.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MemberRole } from '@prisma/client';

@Injectable()
export class LedgersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerMemberService: LedgerMemberService,
    private readonly inviteCodeService: InviteCodeService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findUserLedgers(userId: string) {
    const ledgers = await this.prisma.ledger.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },

      },
      include: {
        members: {
          where: {
            userId,
          },
          select: {
            id: true,
            role: true,
            joinedAt: true,
          },
        },
        _count: {
          select: {
            members: true,
            transactions: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return ledgers.map((ledger) => ({
      id: ledger.id,
      name: ledger.name,
      description: ledger.description,
      currency: ledger.currency,
      role: ledger.members[0]?.role,
      memberCount: ledger._count.members,
      transactionCount: ledger._count.transactions,
      joinedAt: ledger.members[0]?.joinedAt,
      createdAt: ledger.createdAt,
      updatedAt: ledger.updatedAt,
    }));
  }

  async create(userId: string, createLedgerDto: CreateLedgerDto) {
    const ledger = await this.prisma.$transaction(async (tx) => {
      // 创建账本
      const newLedger = await tx.ledger.create({
        data: {
          name: createLedgerDto.name,
          description: createLedgerDto.description,
          currency: createLedgerDto.currency || 'CNY',
        },
      });

      // 添加创建者为所有者
      await tx.ledgerMember.create({
        data: {
          ledgerId: newLedger.id,
          userId,
          role: MemberRole.OWNER,
        },
      });

      // 创建默认账户
      await this.createDefaultAccounts(tx, newLedger.id, userId);

      // 创建默认分类
      await this.createDefaultCategories(tx, newLedger.id);

      return newLedger;
    });

    return this.findOne(ledger.id, userId);
  }

  async findOne(ledgerId: string, userId: string) {
    // 检查用户权限
    await this.checkLedgerAccess(ledgerId, userId);

    const ledger = await this.prisma.ledger.findFirst({
      where: {
        id: ledgerId,
      },
      include: {
        members: {
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
        },
        accounts: {
          select: {
            id: true,
            name: true,
            type: true,
            balance: true,
            icon: true,
            color: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true,
            parentId: true,
          },
        },
      },
    });

    if (!ledger) {
      throw new NotFoundException('账本不存在');
    }

    return {
      id: ledger.id,
      name: ledger.name,
      description: ledger.description,
      currency: ledger.currency,
      members: ledger.members.map((member) => ({
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user,
      })),
      accounts: ledger.accounts,
      categories: ledger.categories,
      createdAt: ledger.createdAt,
      updatedAt: ledger.updatedAt,
    };
  }

  async update(ledgerId: string, userId: string, updateLedgerDto: UpdateLedgerDto) {
    // 检查用户权限（需要管理员权限）
    await this.checkLedgerAccess(ledgerId, userId, [MemberRole.OWNER, MemberRole.ADMIN]);

    const ledger = await this.prisma.ledger.update({
      where: {
        id: ledgerId,
      },
      data: updateLedgerDto,
    });

    return this.findOne(ledger.id, userId);
  }

  async generateInvite(ledgerId: string, userId: string, inviteMemberDto: InviteMemberDto) {
    // 检查用户权限
    await this.checkLedgerAccess(ledgerId, userId, [MemberRole.OWNER, MemberRole.ADMIN]);

    const inviteCode = await this.inviteCodeService.generateInviteCode(
      ledgerId,
      userId,
      inviteMemberDto.role || MemberRole.MEMBER,
      inviteMemberDto.expiresIn,
    );

    return {
      code: inviteCode.code,
      expiresAt: inviteCode.expiresAt,
      role: inviteCode.role,
    };
  }

  async joinLedger(code: string, userId: string) {
    const inviteCode = await this.inviteCodeService.validateInviteCode(code);

    // 检查用户是否已经是成员
    const existingMember = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId: inviteCode.ledgerId,
        userId,
      },
    });

    if (existingMember) {
      throw new ConflictException('您已经是该账本的成员');
    }

    // 添加成员
    const member = await this.prisma.$transaction(async (tx) => {
      const newMember = await tx.ledgerMember.create({
        data: {
          ledgerId: inviteCode.ledgerId,
          userId,
          role: inviteCode.role,
        },
        include: {
          ledger: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            },
          },
        },
      });

      // 标记邀请码为已使用
      await tx.inviteCode.update({
        where: {
          id: inviteCode.id,
        },
        data: {
          usedAt: new Date(),
          usedBy: userId,
        },
      });

      return newMember;
    });

    // 发送通知
    await this.notificationsService.notifyMemberJoined(
      inviteCode.ledgerId,
      member.user,
    );

    return {
      ledger: member.ledger,
      role: member.role,
      joinedAt: member.joinedAt,
    };
  }

  async getMembers(ledgerId: string, userId: string) {
    // 检查用户权限
    await this.checkLedgerAccess(ledgerId, userId);

    const members = await this.prisma.ledgerMember.findMany({
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

    return members.map((member) => ({
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: member.user,
    }));
  }

  async removeMember(ledgerId: string, memberId: string, userId: string) {
    // 检查用户权限
    const currentMember = await this.checkLedgerAccess(ledgerId, userId, [
      MemberRole.OWNER,
      MemberRole.ADMIN,
    ]);

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

    // 不能移除所有者
    if (targetMember.role === MemberRole.OWNER) {
      throw new ForbiddenException('不能移除账本所有者');
    }

    // 管理员不能移除其他管理员（只有所有者可以）
    if (
      currentMember.role === MemberRole.ADMIN &&
      targetMember.role === MemberRole.ADMIN
    ) {
      throw new ForbiddenException('管理员不能移除其他管理员');
    }

    await this.prisma.ledgerMember.delete({
      where: {
        id: memberId,
      },
    });

    // 发送通知
    await this.notificationsService.notifyMemberRemoved(
      ledgerId,
      targetMember.user,
      userId,
    );

    return {
      message: '成员已移除',
    };
  }

  async remove(ledgerId: string, userId: string) {
    // 检查用户权限（只有所有者可以删除账本）
    await this.checkLedgerAccess(ledgerId, userId, [MemberRole.OWNER]);

    await this.prisma.ledger.delete({
      where: {
        id: ledgerId,
      },
    });

    return {
      message: '账本已删除',
    };
  }

  async getStatistics(
    ledgerId: string,
    userId: string,
    options: { startDate?: string; endDate?: string },
  ) {
    // 检查用户权限
    await this.checkLedgerAccess(ledgerId, userId);

    const { startDate, endDate } = options;
    const dateFilter: any = {};

    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const where = {
      ledgerId,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    };

    const [incomeSum, expenseSum, transactionCount, memberCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where }),
      this.prisma.ledgerMember.count({
        where: { ledgerId },
      }),
    ]);

    const totalIncome = parseFloat(incomeSum._sum.amount?.toString() || '0');
    const totalExpense = parseFloat(expenseSum._sum.amount?.toString() || '0');

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount,
      memberCount,
    };
  }

  private async checkLedgerAccess(
    ledgerId: string,
    userId: string,
    requiredRoles?: MemberRole[],
  ) {
    const member = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId,

      },
    });

    if (!member) {
      throw new ForbiddenException('无权限访问该账本');
    }

    if (requiredRoles && !requiredRoles.includes(member.role)) {
      throw new ForbiddenException('权限不足');
    }

    return member;
  }

  private async createDefaultAccounts(tx: any, ledgerId: string, userId: string) {
    const defaultAccounts = [
      {
        name: '现金',
        type: 'CASH',
        balance: 0,
        icon: 'cash',
        color: '#4CAF50',
      },
      {
        name: '银行卡',
        type: 'BANK_CARD',
        balance: 0,
        icon: 'credit-card',
        color: '#2196F3',
      },
      {
        name: '支付宝',
        type: 'ALIPAY',
        balance: 0,
        icon: 'alipay',
        color: '#1890FF',
      },
      {
        name: '微信',
        type: 'WECHAT',
        balance: 0,
        icon: 'wechat',
        color: '#52C41A',
      },
    ];

    for (const account of defaultAccounts) {
      await tx.account.create({
        data: {
          ...account,
          ledgerId,
          userId,
        },
      });
    }
  }

  private async createDefaultCategories(tx: any, ledgerId: string) {
    const defaultCategories = [
      // 支出分类
      {
        name: '餐饮',
        type: 'EXPENSE',
        icon: 'restaurant',
        color: '#FF6B6B',
      },
      {
        name: '交通',
        type: 'EXPENSE',
        icon: 'car',
        color: '#4ECDC4',
      },
      {
        name: '购物',
        type: 'EXPENSE',
        icon: 'shopping-cart',
        color: '#45B7D1',
      },
      {
        name: '娱乐',
        type: 'EXPENSE',
        icon: 'game',
        color: '#96CEB4',
      },
      {
        name: '医疗',
        type: 'EXPENSE',
        icon: 'medical',
        color: '#FFEAA7',
      },
      {
        name: '教育',
        type: 'EXPENSE',
        icon: 'book',
        color: '#DDA0DD',
      },
      {
        name: '住房',
        type: 'EXPENSE',
        icon: 'home',
        color: '#98D8C8',
      },
      {
        name: '其他支出',
        type: 'EXPENSE',
        icon: 'more',
        color: '#F7DC6F',
      },
      // 收入分类
      {
        name: '工资',
        type: 'INCOME',
        icon: 'salary',
        color: '#52C41A',
      },
      {
        name: '奖金',
        type: 'INCOME',
        icon: 'bonus',
        color: '#1890FF',
      },
      {
        name: '投资收益',
        type: 'INCOME',
        icon: 'investment',
        color: '#722ED1',
      },
      {
        name: '其他收入',
        type: 'INCOME',
        icon: 'more',
        color: '#13C2C2',
      },
    ];

    for (const category of defaultCategories) {
      await tx.category.create({
        data: {
          ...category,
          ledgerId,
        },
      });
    }
  }
}