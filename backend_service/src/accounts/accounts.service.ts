import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountType, LedgerRole } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(ledgerId: string, createAccountDto: CreateAccountDto, userId: string) {
    // 验证用户权限
    await this.checkPermission(ledgerId, userId, ['OWNER', 'ADMIN']);

    // 检查账户名称是否重复
    const existingAccount = await this.prisma.account.findFirst({
      where: {
        ledgerId,
        name: createAccountDto.name,
        deletedAt: null,
      },
    });

    if (existingAccount) {
      throw new ConflictException('账户名称已存在');
    }

    const account = await this.prisma.account.create({
      data: {
        ...createAccountDto,
        ledgerId,
        createdBy: userId,
        balance: createAccountDto.initialBalance || 0,
      },
    });

    return {
      success: true,
      message: '账户创建成功',
      data: account,
    };
  }

  async findAll(
    ledgerId: string,
    options: {
      type?: string;
      includeBalance?: boolean;
    } = {},
  ) {
    const { type, includeBalance } = options;

    const where: any = {
      ledgerId,
      deletedAt: null,
    };

    if (type) {
      where.type = type as AccountType;
    }

    const accounts = await this.prisma.account.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        _count: includeBalance
          ? {
              incomingTransactions: true,
              outgoingTransactions: true,
            }
          : undefined,
      },
    });

    // 按类型分组
    const groupedAccounts = accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = [];
      }
      acc[account.type].push(account);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      success: true,
      data: {
        accounts,
        groupedAccounts,
        total: accounts.length,
      },
    };
  }

  async findOne(ledgerId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: {
        id,
        ledgerId,
        deletedAt: null,
      },
      include: {
        _count: {
          incomingTransactions: true,
          outgoingTransactions: true,
        },
      },
    });

    if (!account) {
      throw new NotFoundException('账户不存在');
    }

    // 获取最近的交易记录
    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccountId: id },
          { toAccountId: id },
        ],
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        fromAccount: { select: { name: true } },
        toAccount: { select: { name: true } },
        category: { select: { name: true, icon: true } },
      },
    });

    return {
      success: true,
      data: {
        account,
        recentTransactions,
      },
    };
  }

  async update(
    ledgerId: string,
    id: string,
    updateAccountDto: UpdateAccountDto,
    userId: string,
  ) {
    // 验证用户权限
    await this.checkPermission(ledgerId, userId, ['OWNER', 'ADMIN']);

    const account = await this.prisma.account.findFirst({
      where: {
        id,
        ledgerId,
        deletedAt: null,
      },
    });

    if (!account) {
      throw new NotFoundException('账户不存在');
    }

    // 检查账户名称是否重复（排除当前账户）
    if (updateAccountDto.name) {
      const existingAccount = await this.prisma.account.findFirst({
        where: {
          ledgerId,
          name: updateAccountDto.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existingAccount) {
        throw new ConflictException('账户名称已存在');
      }
    }

    const updatedAccount = await this.prisma.account.update({
      where: { id },
      data: {
        ...updateAccountDto,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: '账户更新成功',
      data: updatedAccount,
    };
  }

  async remove(ledgerId: string, id: string, userId: string) {
    // 验证用户权限
    await this.checkPermission(ledgerId, userId, ['OWNER', 'ADMIN']);

    const account = await this.prisma.account.findFirst({
      where: {
        id,
        ledgerId,
        deletedAt: null,
      },
      include: {
        _count: {
          incomingTransactions: true,
          outgoingTransactions: true,
        },
      },
    });

    if (!account) {
      throw new NotFoundException('账户不存在');
    }

    // 检查是否有关联的交易记录
    const hasTransactions =
      account._count.incomingTransactions > 0 ||
      account._count.outgoingTransactions > 0;

    if (hasTransactions) {
      throw new ConflictException('账户有关联交易记录，无法删除');
    }

    // 软删除
    await this.prisma.account.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: '账户删除成功',
    };
  }

  async getStatistics(ledgerId: string) {
    const accounts = await this.prisma.account.findMany({
      where: {
        ledgerId,
        deletedAt: null,
      },
    });

    // 按类型统计
    const typeStats = accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = {
          count: 0,
          totalBalance: 0,
        };
      }
      acc[account.type].count++;
      acc[account.type].totalBalance += account.balance;
      return acc;
    }, {} as Record<string, { count: number; totalBalance: number }>);

    // 总资产
    const totalAssets = accounts
      .filter(account => ['CASH', 'BANK', 'INVESTMENT'].includes(account.type))
      .reduce((sum, account) => sum + account.balance, 0);

    // 总负债
    const totalLiabilities = accounts
      .filter(account => account.type === 'CREDIT')
      .reduce((sum, account) => sum + Math.abs(account.balance), 0);

    // 净资产
    const netWorth = totalAssets - totalLiabilities;

    return {
      success: true,
      data: {
        totalAccounts: accounts.length,
        typeStats,
        totalAssets,
        totalLiabilities,
        netWorth,
        accountsByType: {
          CASH: accounts.filter(a => a.type === 'CASH').length,
          BANK: accounts.filter(a => a.type === 'BANK').length,
          CREDIT: accounts.filter(a => a.type === 'CREDIT').length,
          INVESTMENT: accounts.filter(a => a.type === 'INVESTMENT').length,
          OTHER: accounts.filter(a => a.type === 'OTHER').length,
        },
      },
    };
  }

  async transfer(
    ledgerId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description?: string,
    notes?: string,
    userId?: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('转账金额必须大于0');
    }

    if (fromAccountId === toAccountId) {
      throw new BadRequestException('转出账户和转入账户不能相同');
    }

    // 验证账户存在
    const [fromAccount, toAccount] = await Promise.all([
      this.prisma.account.findFirst({
        where: { id: fromAccountId, ledgerId, deletedAt: null },
      }),
      this.prisma.account.findFirst({
        where: { id: toAccountId, ledgerId, deletedAt: null },
      }),
    ]);

    if (!fromAccount) {
      throw new NotFoundException('转出账户不存在');
    }

    if (!toAccount) {
      throw new NotFoundException('转入账户不存在');
    }

    // 检查余额
    if (fromAccount.balance < amount) {
      throw new BadRequestException('账户余额不足');
    }

    // 执行转账事务
    const result = await this.prisma.$transaction(async (tx) => {
      // 更新账户余额
      await Promise.all([
        tx.account.update({
          where: { id: fromAccountId },
          data: { balance: { decrement: amount } },
        }),
        tx.account.update({
          where: { id: toAccountId },
          data: { balance: { increment: amount } },
        }),
      ]);

      // 创建转账记录
      const transaction = await tx.transaction.create({
        data: {
          type: 'TRANSFER',
          amount,
          description: description || `从${fromAccount.name}转账到${toAccount.name}`,
          notes,
          date: new Date(),
          fromAccountId,
          toAccountId,
          ledgerId,
          createdBy: userId,
        },
      });

      return transaction;
    });

    return {
      success: true,
      message: '转账成功',
      data: result,
    };
  }

  async adjustBalance(
    ledgerId: string,
    accountId: string,
    amount: number,
    reason: string,
    notes?: string,
    userId?: string,
  ) {
    if (amount === 0) {
      throw new BadRequestException('调整金额不能为0');
    }

    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        ledgerId,
        deletedAt: null,
      },
    });

    if (!account) {
      throw new NotFoundException('账户不存在');
    }

    // 执行余额调整事务
    const result = await this.prisma.$transaction(async (tx) => {
      // 更新账户余额
      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: amount } },
      });

      // 创建调整记录
      const transaction = await tx.transaction.create({
        data: {
          type: amount > 0 ? 'INCOME' : 'EXPENSE',
          amount: Math.abs(amount),
          description: `余额调整: ${reason}`,
          notes,
          date: new Date(),
          fromAccountId: amount < 0 ? accountId : undefined,
          toAccountId: amount > 0 ? accountId : undefined,
          ledgerId,
          createdBy: userId,
        },
      });

      return { account: updatedAccount, transaction };
    });

    return {
      success: true,
      message: '余额调整成功',
      data: result,
    };
  }

  // 私有方法
  private async checkPermission(
    ledgerId: string,
    userId: string,
    allowedRoles: LedgerRole[],
  ) {
    const member = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId,
        deletedAt: null,
      },
    });

    if (!member || !allowedRoles.includes(member.role)) {
      throw new ForbiddenException('权限不足');
    }

    return member;
  }
}