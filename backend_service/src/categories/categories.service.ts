import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransactionType, MemberRole } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(ledgerId: string, createCategoryDto: CreateCategoryDto, userId: string) {
    // 验证用户权限
    await this.checkPermission(ledgerId, userId, ['OWNER', 'ADMIN']);

    // 验证父分类
    if (createCategoryDto.parentId) {
      const parentCategory = await this.prisma.category.findFirst({
        where: {
          id: createCategoryDto.parentId,
          ledgerId,
        },
      });

      if (!parentCategory) {
        throw new BadRequestException('父分类不存在');
      }

      // 检查类型是否一致
      if (parentCategory.type !== createCategoryDto.type) {
        throw new BadRequestException('子分类类型必须与父分类一致');
      }
    }

    // 检查分类名称是否重复（同一父分类下）
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        ledgerId,
        name: createCategoryDto.name,
        parentId: createCategoryDto.parentId || null,
      },
    });

    if (existingCategory) {
      throw new ConflictException('分类名称已存在');
    }

    const category = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        ledgerId,
      },
    });

    return {
      success: true,
      message: '分类创建成功',
      data: category,
    };
  }

  async findAll(
    ledgerId: string,
    options: {
      type?: string;
      parentId?: string;
      includeStats?: boolean;
    } = {},
  ) {
    const { type, parentId, includeStats } = options;

    const where: any = {
      ledgerId,
    };

    if (type) {
      where.type = type as TransactionType;
    }

    if (parentId !== undefined) {
      where.parentId = parentId || null;
    }

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        children: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        _count: includeStats
          ? {
              select: {
                transactions: true,
              },
            }
          : undefined,
      },
    });

    return {
      success: true,
      data: {
        categories,
        total: categories.length,
      },
    };
  }

  async getTree(ledgerId: string, type?: string) {
    const where: any = {
      ledgerId,
      parentId: null, // 只获取顶级分类
    };

    if (type) {
      where.type = type as TransactionType;
    }

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        children: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: {
            children: {
              orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            },
          },
        },
      },
    });

    return {
      success: true,
      data: categories,
    };
  }

  async findOne(ledgerId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        ledgerId,
      },
      include: {
        parent: true,
        children: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 获取最近的交易记录
    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        categoryId: id,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        fromAccount: { select: { name: true } },
        toAccount: { select: { name: true } },
      },
    });

    return {
      success: true,
      data: {
        category,
        recentTransactions,
      },
    };
  }

  async update(
    ledgerId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ) {
    // 验证用户权限
    await this.checkPermission(ledgerId, userId, ['OWNER', 'ADMIN']);

    const category = await this.prisma.category.findFirst({
      where: {
        id,
        ledgerId,
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 验证父分类
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('分类不能设置自己为父分类');
      }

      if (updateCategoryDto.parentId) {
        const parentCategory = await this.prisma.category.findFirst({
          where: {
            id: updateCategoryDto.parentId,
            ledgerId,
          },
        });

        if (!parentCategory) {
          throw new BadRequestException('父分类不存在');
        }

        // 检查类型是否一致
        const newType = updateCategoryDto.type || category.type;
        if (parentCategory.type !== newType) {
          throw new BadRequestException('子分类类型必须与父分类一致');
        }

        // 检查是否会形成循环引用
        if (await this.wouldCreateCycle(id, updateCategoryDto.parentId)) {
          throw new BadRequestException('不能设置子分类为父分类');
        }
      }
    }

    // 检查分类名称是否重复（排除当前分类）
    if (updateCategoryDto.name) {
      const parentId = updateCategoryDto.parentId !== undefined 
        ? updateCategoryDto.parentId 
        : category.parentId;

      const existingCategory = await this.prisma.category.findFirst({
        where: {
          ledgerId,
          name: updateCategoryDto.name,
          parentId: parentId || null,
          id: { not: id },
        },
      });

      if (existingCategory) {
        throw new ConflictException('分类名称已存在');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: '分类更新成功',
      data: updatedCategory,
    };
  }

  async remove(ledgerId: string, id: string, userId: string) {
    // 验证用户权限
    await this.checkPermission(ledgerId, userId, ['OWNER', 'ADMIN']);

    const category = await this.prisma.category.findFirst({
      where: {
        id,
        ledgerId,
      },
      include: {
        children: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查是否有子分类
    if (category.children.length > 0) {
      throw new ConflictException('分类有子分类，无法删除');
    }

    // 检查是否有关联的交易记录
    if (category._count.transactions > 0) {
      throw new ConflictException('分类有关联交易记录，无法删除');
    }

    // 删除分类
    await this.prisma.category.delete({
      where: { id },
    });

    return {
      success: true,
      message: '分类删除成功',
    };
  }

  async move(
    ledgerId: string,
    id: string,
    parentId?: string,
    sortOrder?: number,
    userId?: string,
  ) {
    // 验证用户权限
    if (userId) {
      await this.checkPermission(ledgerId, userId, ['OWNER', 'ADMIN']);
    }

    const category = await this.prisma.category.findFirst({
      where: {
        id,
        ledgerId,
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 验证父分类
    if (parentId) {
      if (parentId === id) {
        throw new BadRequestException('分类不能设置自己为父分类');
      }

      const parentCategory = await this.prisma.category.findFirst({
        where: {
          id: parentId,
          ledgerId,
        },
      });

      if (!parentCategory) {
        throw new BadRequestException('父分类不存在');
      }

      // 检查类型是否一致
      if (parentCategory.type !== category.type) {
        throw new BadRequestException('子分类类型必须与父分类一致');
      }

      // 检查是否会形成循环引用
      if (await this.wouldCreateCycle(id, parentId)) {
        throw new BadRequestException('不能设置子分类为父分类');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        parentId: parentId || null,
        sortOrder,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: '分类移动成功',
      data: updatedCategory,
    };
  }

  async batchCreate(
    ledgerId: string,
    categories: CreateCategoryDto[],
    userId: string,
  ) {
    // 验证用户权限
    await this.checkPermission(ledgerId, userId, ['OWNER', 'ADMIN']);

    const createdCategories = await this.prisma.$transaction(async (tx) => {
      const results: any[] = [];
      
      for (const categoryDto of categories) {
        // 检查分类名称是否重复
        const existingCategory = await tx.category.findFirst({
          where: {
              ledgerId,
              name: categoryDto.name,
              parentId: categoryDto.parentId || null,
            },
        });

        if (!existingCategory) {
          const category = await tx.category.create({
            data: {
              ...categoryDto,
              ledgerId,
            },
          });
          results.push(category);
        }
      }
      
      return results;
    });

    return {
      success: true,
      message: `成功创建${createdCategories.length}个分类`,
      data: createdCategories,
    };
  }

  async importDefault(ledgerId: string, userId: string) {
    // 验证用户权限
    await this.checkPermission(ledgerId, userId, ['OWNER', 'ADMIN']);

    const defaultCategories = this.getDefaultCategories();
    
    return this.batchCreate(ledgerId, defaultCategories, userId);
  }

  async getStatistics(
    ledgerId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      type?: string;
    } = {},
  ) {
    const { startDate, endDate, type } = options;

    const where: any = {
      ledgerId,
    };

    if (type) {
      where.type = type as TransactionType;
    }

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        transactions: {
          where: {
            ...(startDate && { date: { gte: startDate } }),
            ...(endDate && { date: { lte: endDate } }),
          },
        },
      },
    });

    const statistics = categories.map(category => {
      const totalAmount = category.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      );
      const transactionCount = category.transactions.length;

      return {
        id: category.id,
        name: category.name,
        type: category.type,
        totalAmount,
        transactionCount,
        averageAmount: transactionCount > 0 ? totalAmount / transactionCount : 0,
      };
    });

    // 按金额排序
    statistics.sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      success: true,
      data: {
        statistics,
        summary: {
          totalCategories: categories.length,
          totalAmount: statistics.reduce((sum, stat) => sum + stat.totalAmount, 0),
          totalTransactions: statistics.reduce((sum, stat) => sum + stat.transactionCount, 0),
        },
      },
    };
  }

  // 私有方法
  private async checkPermission(
    ledgerId: string,
    userId: string,
    allowedRoles: MemberRole[],
  ) {
    const member = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId,
      },
    });

    if (!member || !allowedRoles.includes(member.role)) {
      throw new ForbiddenException('权限不足');
    }

    return member;
  }

  private async wouldCreateCycle(categoryId: string, parentId: string): Promise<boolean> {
    let currentParentId: string | null = parentId;
    
    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }
      
      const parent = await this.prisma.category.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });
      
      currentParentId = parent?.parentId || null;
    }
    
    return false;
  }

  private getDefaultCategories(): CreateCategoryDto[] {
    return [
      // 支出分类
      { name: '餐饮', type: 'EXPENSE', icon: 'restaurant', color: '#ff4d4f' },
      { name: '交通', type: 'EXPENSE', icon: 'car', color: '#1890ff' },
      { name: '购物', type: 'EXPENSE', icon: 'shopping', color: '#52c41a' },
      { name: '娱乐', type: 'EXPENSE', icon: 'game', color: '#722ed1' },
      { name: '医疗', type: 'EXPENSE', icon: 'medical', color: '#fa8c16' },
      { name: '教育', type: 'EXPENSE', icon: 'book', color: '#13c2c2' },
      { name: '住房', type: 'EXPENSE', icon: 'home', color: '#eb2f96' },
      { name: '通讯', type: 'EXPENSE', icon: 'phone', color: '#faad14' },
      { name: '其他支出', type: 'EXPENSE', icon: 'more', color: '#8c8c8c' },
      
      // 收入分类
      { name: '工资', type: 'INCOME', icon: 'salary', color: '#52c41a' },
      { name: '奖金', type: 'INCOME', icon: 'bonus', color: '#1890ff' },
      { name: '投资收益', type: 'INCOME', icon: 'investment', color: '#722ed1' },
      { name: '兼职', type: 'INCOME', icon: 'work', color: '#fa8c16' },
      { name: '礼金', type: 'INCOME', icon: 'gift', color: '#eb2f96' },
      { name: '其他收入', type: 'INCOME', icon: 'more', color: '#8c8c8c' },
    ];
  }
}