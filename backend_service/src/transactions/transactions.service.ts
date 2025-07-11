import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType, TransactionStatus, MemberRole } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface FindAllOptions {
  page: number;
  limit: number;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

interface SummaryOptions {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

interface StatisticsOptions {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
}

interface TrendsOptions {
  period: 'week' | 'month' | 'quarter' | 'year';
  type?: TransactionType;
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    ledgerId: string,
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ) {
    // 验证账户和分类是否属于该账本
    await this.validateAccountAndCategory(
      ledgerId,
      createTransactionDto.accountId,
      createTransactionDto.categoryId,
    );

    const transaction = await this.prisma.$transaction(async (tx) => {
      // 创建交易记录
      const newTransaction = await tx.transaction.create({
        data: {
        ...createTransactionDto,
        ledgerId,
        userId,
        date: new Date(createTransactionDto.date),
      },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
              color: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
              color: true,
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

      // 更新账户余额
      const balanceChange =
        createTransactionDto.type === TransactionType.INCOME
          ? createTransactionDto.amount
          : -createTransactionDto.amount;

      await tx.account.update({
        where: {
          id: createTransactionDto.accountId,
        },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      return newTransaction;
    });

    return {
      id: transaction.id,
      type: transaction.type,
      amount: parseFloat(transaction.amount.toString()),
      description: transaction.description,
      date: transaction.date,
      account: transaction.account,
      category: transaction.category,
      creator: transaction.user,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  async findAll(ledgerId: string, options: FindAllOptions) {
    const { page, limit, type, categoryId, accountId, startDate, endDate, keyword } = options;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {
      ledgerId,
    };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.accountId = accountId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (keyword) {
      where.description = {
        contains: keyword,
      };
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
              color: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
              color: true,
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
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: parseFloat(transaction.amount.toString()),
      description: transaction.description,
      date: transaction.date,
      account: transaction.account,
      category: transaction.category,
      creator: transaction.user,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    }));

    return {
      data: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(ledgerId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        ledgerId,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true,
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

    if (!transaction) {
      throw new NotFoundException('交易记录不存在');
    }

    return {
      id: transaction.id,
      type: transaction.type,
      amount: parseFloat(transaction.amount.toString()),
      description: transaction.description,
      date: transaction.date,
      account: transaction.account,
      category: transaction.category,
      creator: transaction.user,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  async update(
    ledgerId: string,
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        ledgerId,
      },
    });

    if (!existingTransaction) {
      throw new NotFoundException('交易记录不存在');
    }

    // 检查权限：只有创建者或管理员可以修改
    await this.checkTransactionPermission(ledgerId, userId, existingTransaction.userId);

    // 如果更新了账户或分类，需要验证
    if (updateTransactionDto.accountId || updateTransactionDto.categoryId) {
      await this.validateAccountAndCategory(
        ledgerId,
        updateTransactionDto.accountId || existingTransaction.accountId,
        updateTransactionDto.categoryId || existingTransaction.categoryId,
      );
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      // 如果金额、类型或账户发生变化，需要更新账户余额
      const oldAmount = parseFloat(existingTransaction.amount.toString());
      const newAmount = updateTransactionDto.amount || oldAmount;
      const oldType = existingTransaction.type;
      const newType = updateTransactionDto.type || oldType;
      const oldAccountId = existingTransaction.accountId;
      const newAccountId = updateTransactionDto.accountId || oldAccountId;

      if (
        oldAmount !== newAmount ||
        oldType !== newType ||
        oldAccountId !== newAccountId
      ) {
        // 撤销原来的余额变化
        const oldBalanceChange =
          oldType === TransactionType.INCOME ? -oldAmount : oldAmount;
        await tx.account.update({
          where: { id: oldAccountId },
          data: {
            balance: {
              increment: oldBalanceChange,
            },
          },
        });

        // 应用新的余额变化
        const newBalanceChange =
          newType === TransactionType.INCOME ? newAmount : -newAmount;
        await tx.account.update({
          where: { id: newAccountId },
          data: {
            balance: {
              increment: newBalanceChange,
            },
          },
        });
      }

      // 更新交易记录
      const updatedData: any = { ...updateTransactionDto };
      if (updateTransactionDto.date) {
        updatedData.date = new Date(updateTransactionDto.date);
      }

      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: updatedData,
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
              color: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
              color: true,
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

      return updatedTransaction;
    });

    return {
      id: transaction.id,
      type: transaction.type,
      amount: parseFloat(transaction.amount.toString()),
      description: transaction.description,
      date: transaction.date,
      account: transaction.account,
      category: transaction.category,
      creator: transaction.user,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  async remove(ledgerId: string, id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        ledgerId,
      },
    });

    if (!transaction) {
      throw new NotFoundException('交易记录不存在');
    }

    // 检查权限
    await this.checkTransactionPermission(ledgerId, userId, transaction.userId);

    await this.prisma.$transaction(async (tx) => {
      // 撤销账户余额变化
      const balanceChange =
        transaction.type === TransactionType.INCOME
          ? -parseFloat(transaction.amount.toString())
          : parseFloat(transaction.amount.toString());

      await tx.account.update({
        where: {
          id: transaction.accountId,
        },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      // 删除交易记录
      await tx.transaction.delete({
        where: { id },
      });
    });

    return {
      message: '交易记录已删除',
    };
  }

  async getSummary(ledgerId: string, options: SummaryOptions) {
    const { startDate, endDate, groupBy } = options;

    const where: any = {
      ledgerId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [incomeSum, expenseSum, transactionCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.INCOME },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.EXPENSE },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const totalIncome = parseFloat(incomeSum._sum.amount?.toString() || '0');
    const totalExpense = parseFloat(expenseSum._sum.amount?.toString() || '0');

    let groupedData: any[] = [];
    if (groupBy) {
      groupedData = await this.getGroupedTransactions(ledgerId, groupBy, where);
    }

    return {
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount,
      },
      groupedData,
    };
  }

  async getCategoryStatistics(ledgerId: string, options: StatisticsOptions) {
    const { type, startDate, endDate } = options;

    const where: any = {
      ledgerId,
    };

    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const categoryStats = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const categoriesWithDetails = await Promise.all(
      categoryStats.map(async (stat) => {
        const category = await this.prisma.category.findUnique({
          where: { id: stat.categoryId },
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true,
          },
        });

        return {
          category,
          amount: parseFloat(stat._sum.amount?.toString() || '0'),
          count: stat._count.id,
        };
      }),
    );

    // 按金额排序
    categoriesWithDetails.sort((a, b) => b.amount - a.amount);

    const totalAmount = categoriesWithDetails.reduce((sum, item) => sum + item.amount, 0);

    return {
      categories: categoriesWithDetails.map((item) => ({
        ...item,
        percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
      })),
      totalAmount,
    };
  }

  async getAccountStatistics(ledgerId: string, options: StatisticsOptions) {
    const { startDate, endDate } = options;

    const where: any = {
      ledgerId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const accountStats = await this.prisma.transaction.groupBy({
      by: ['accountId'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const accountsWithDetails = await Promise.all(
      accountStats.map(async (stat) => {
        const account = await this.prisma.account.findUnique({
          where: { id: stat.accountId },
          select: {
            id: true,
            name: true,
            type: true,
            balance: true,
            icon: true,
            color: true,
          },
        });

        return {
          account: {
            ...account,
            balance: parseFloat(account?.balance?.toString() || '0'),
          },
          transactionAmount: parseFloat(stat._sum.amount?.toString() || '0'),
          transactionCount: stat._count.id,
        };
      }),
    );

    return accountsWithDetails.sort((a, b) => b.transactionAmount - a.transactionAmount);
  }

  async getTrends(ledgerId: string, options: TrendsOptions) {
    const { period, type } = options;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }

    const where: any = {
      ledgerId,
      date: {
        gte: startDate,
        lte: now,
      },
    };

    if (type) where.type = type;

    const trends = await this.getGroupedTransactions(ledgerId, 'day', where);

    return {
      period,
      startDate,
      endDate: now,
      trends,
    };
  }

  async createBatch(
    ledgerId: string,
    userId: string,
    createTransactionDtos: CreateTransactionDto[],
  ) {
    if (createTransactionDtos.length === 0) {
      throw new BadRequestException('交易记录列表不能为空');
    }

    if (createTransactionDtos.length > 100) {
      throw new BadRequestException('单次最多只能创建100条交易记录');
    }

    // 验证所有账户和分类
    for (const dto of createTransactionDtos) {
      await this.validateAccountAndCategory(ledgerId, dto.accountId, dto.categoryId);
    }

    const results = await this.prisma.$transaction(async (tx) => {
      const createdTransactions: any[] = [];

      for (const dto of createTransactionDtos) {
        // 创建交易记录
        const transaction = await tx.transaction.create({
          data: {
            ...dto,
            ledgerId,
            userId,
            date: new Date(dto.date),
          },
        });

        // 更新账户余额
        const balanceChange =
          dto.type === TransactionType.INCOME ? dto.amount : -dto.amount;

        await tx.account.update({
          where: { id: dto.accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });

        createdTransactions.push(transaction);
      }

      return createdTransactions;
    });

    return {
      message: `成功创建 ${results.length} 条交易记录`,
      count: results.length,
    };
  }

  async removeBatch(ledgerId: string, ids: string[], userId: string) {
    if (ids.length === 0) {
      throw new BadRequestException('交易记录ID列表不能为空');
    }

    if (ids.length > 100) {
      throw new BadRequestException('单次最多只能删除100条交易记录');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        id: { in: ids },
        ledgerId,
      },
    });

    if (transactions.length !== ids.length) {
      throw new NotFoundException('部分交易记录不存在');
    }

    // 检查权限
    for (const transaction of transactions) {
      await this.checkTransactionPermission(ledgerId, userId, transaction.userId);
    }

    await this.prisma.$transaction(async (tx) => {
      for (const transaction of transactions) {
        // 撤销账户余额变化
        const balanceChange =
          transaction.type === TransactionType.INCOME
            ? -parseFloat(transaction.amount.toString())
            : parseFloat(transaction.amount.toString());

        await tx.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });

        // 删除交易记录
        await tx.transaction.delete({
          where: { id: transaction.id },
        });
      }
    });

    return {
      message: `成功删除 ${transactions.length} 条交易记录`,
      count: transactions.length,
    };
  }

  async duplicate(ledgerId: string, id: string, userId: string) {
    const originalTransaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        ledgerId,
      },
    });

    if (!originalTransaction) {
      throw new NotFoundException('原交易记录不存在');
    }

    const duplicatedTransaction = await this.create(ledgerId, userId, {
      type: originalTransaction.type,
      amount: parseFloat(originalTransaction.amount.toString()),
      description: `${originalTransaction.description} (复制)`,
      date: new Date().toISOString(),
      accountId: originalTransaction.accountId,
      categoryId: originalTransaction.categoryId,
    });

    return duplicatedTransaction;
  }

  private async validateAccountAndCategory(
    ledgerId: string,
    accountId: string,
    categoryId: string,
  ) {
    const [account, category] = await Promise.all([
      this.prisma.account.findFirst({
        where: {
          id: accountId,
          ledgerId,
        },
      }),
      this.prisma.category.findFirst({
        where: {
          id: categoryId,
          ledgerId,
        },
      }),
    ]);

    if (!account) {
      throw new BadRequestException('账户不存在或不属于该账本');
    }

    if (!category) {
      throw new BadRequestException('分类不存在或不属于该账本');
    }
  }

  private async checkTransactionPermission(
    ledgerId: string,
    userId: string,
    transactionUserId: string,
  ) {
    // 如果是创建者，直接允许
    if (userId === transactionUserId) {
      return;
    }

    // 检查是否是管理员或所有者
    const member = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId,
        role: {
          in: [MemberRole.OWNER, MemberRole.ADMIN],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('无权限操作该交易记录');
    }
  }

  private async getGroupedTransactions(
    ledgerId: string,
    groupBy: string,
    where: any,
  ) {
    // 这里简化处理，实际项目中可能需要使用原生SQL来实现复杂的分组查询
    const transactions = await this.prisma.transaction.findMany({
      where,
      select: {
        date: true,
        type: true,
        amount: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const grouped = new Map();

    transactions.forEach((transaction) => {
      let key: string;
      const date = new Date(transaction.date);

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          period: key,
          income: 0,
          expense: 0,
          count: 0,
        });
      }

      const group = grouped.get(key);
      const amount = parseFloat(transaction.amount.toString());

      if (transaction.type === TransactionType.INCOME) {
        group.income += amount;
      } else {
        group.expense += amount;
      }
      group.count += 1;
    });

    return Array.from(grouped.values()).map((group) => ({
      ...group,
      balance: group.income - group.expense,
    }));
  }
}