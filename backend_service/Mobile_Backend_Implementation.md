# 家庭记账本 - 小程序/App 后端实现方案

## 1. 数据库设计扩展

基于现有的User模型，需要添加以下核心业务模型：

### 1.1 账本模型 (Ledger)

```prisma
model Ledger {
  id          String      @id @default(cuid())
  name        String
  description String?
  type        LedgerType  @default(PERSONAL)
  status      LedgerStatus @default(ACTIVE)
  coverImage  String?
  currency    String      @default("CNY")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?
  
  // 关联关系
  members     LedgerMember[]
  accounts    Account[]
  categories  Category[]
  transactions Transaction[]
  
  @@map("ledgers")
}

enum LedgerType {
  PERSONAL
  FAMILY
}

enum LedgerStatus {
  ACTIVE
  ARCHIVED
  DELETED
}
```

### 1.2 账本成员模型 (LedgerMember)

```prisma
model LedgerMember {
  id       String           @id @default(cuid())
  ledgerId String
  userId   String
  role     LedgerMemberRole @default(MEMBER)
  joinedAt DateTime         @default(now())
  
  // 关联关系
  ledger   Ledger @relation(fields: [ledgerId], references: [id], onDelete: Cascade)
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 复合唯一索引
  @@unique([ledgerId, userId])
  @@map("ledger_members")
}

enum LedgerMemberRole {
  OWNER
  ADMIN
  MEMBER
}
```

### 1.3 账户模型 (Account)

```prisma
model Account {
  id             String      @id @default(cuid())
  ledgerId       String
  name           String
  type           AccountType
  icon           String      @default("💰")
  color          String      @default("#1677FF")
  balance        Decimal     @default(0) @db.Decimal(10, 2)
  initialBalance Decimal     @default(0) @db.Decimal(10, 2)
  currency       String      @default("CNY")
  isDefault      Boolean     @default(false)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  deletedAt      DateTime?
  
  // 关联关系
  ledger              Ledger        @relation(fields: [ledgerId], references: [id], onDelete: Cascade)
  fromTransactions    Transaction[] @relation("FromAccount")
  toTransactions      Transaction[] @relation("ToAccount")
  
  @@map("accounts")
}

enum AccountType {
  CASH
  BANK_CARD
  ALIPAY
  WECHAT
  CREDIT_CARD
  OTHER
}
```

### 1.4 分类模型 (Category)

```prisma
model Category {
  id           String          @id @default(cuid())
  ledgerId     String?
  name         String
  type         TransactionType
  icon         String          @default("📝")
  color        String          @default("#666666")
  parentId     String?
  isDefault    Boolean         @default(false)
  sortOrder    Int             @default(0)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  deletedAt    DateTime?
  
  // 关联关系
  ledger       Ledger?       @relation(fields: [ledgerId], references: [id], onDelete: Cascade)
  parent       Category?     @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children     Category[]    @relation("CategoryHierarchy")
  transactions Transaction[]
  
  @@map("categories")
}
```

### 1.5 交易记录模型 (Transaction)

```prisma
model Transaction {
  id            String          @id @default(cuid())
  ledgerId      String
  type          TransactionType
  amount        Decimal         @db.Decimal(10, 2)
  description   String?
  date          DateTime        @db.Date
  categoryId    String
  accountId     String
  toAccountId   String?
  memberId      String
  images        String[]        @default([])
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  deletedAt     DateTime?
  
  // 关联关系
  ledger        Ledger        @relation(fields: [ledgerId], references: [id], onDelete: Cascade)
  category      Category      @relation(fields: [categoryId], references: [id])
  account       Account       @relation("FromAccount", fields: [accountId], references: [id])
  toAccount     Account?      @relation("ToAccount", fields: [toAccountId], references: [id])
  member        LedgerMember  @relation(fields: [memberId], references: [id])
  
  @@map("transactions")
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
}
```

### 1.6 邀请码模型 (InviteCode)

```prisma
model InviteCode {
  id        String    @id @default(cuid())
  code      String    @unique
  ledgerId  String
  createdBy String
  email     String?
  role      LedgerMemberRole @default(MEMBER)
  expiresAt DateTime
  usedAt    DateTime?
  usedBy    String?
  createdAt DateTime  @default(now())
  
  // 关联关系
  ledger    Ledger @relation(fields: [ledgerId], references: [id], onDelete: Cascade)
  creator   User   @relation("CreatedInvites", fields: [createdBy], references: [id])
  user      User?  @relation("UsedInvites", fields: [usedBy], references: [id])
  
  @@map("invite_codes")
}
```

### 1.7 更新User模型

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  phone     String?    @unique
  nickname  String
  avatar    String?
  status    UserStatus @default(ACTIVE)
  deletedAt DateTime?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  
  // 关联关系
  ledgerMembers   LedgerMember[]
  createdInvites  InviteCode[]     @relation("CreatedInvites")
  usedInvites     InviteCode[]     @relation("UsedInvites")
  
  @@map("users")
}
```

## 2. 后端模块结构

### 2.1 目录结构

```
src/
├── auth/                    # 认证模块
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── users/                   # 用户模块
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── entities/
│       └── user.entity.ts
├── ledgers/                 # 账本模块
│   ├── ledgers.controller.ts
│   ├── ledgers.service.ts
│   ├── ledgers.module.ts
│   ├── dto/
│   │   ├── create-ledger.dto.ts
│   │   ├── update-ledger.dto.ts
│   │   └── invite-member.dto.ts
│   └── entities/
│       ├── ledger.entity.ts
│       ├── ledger-member.entity.ts
│       └── invite-code.entity.ts
├── accounts/                # 账户模块
│   ├── accounts.controller.ts
│   ├── accounts.service.ts
│   ├── accounts.module.ts
│   ├── dto/
│   │   ├── create-account.dto.ts
│   │   └── update-account.dto.ts
│   └── entities/
│       └── account.entity.ts
├── categories/              # 分类模块
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   ├── categories.module.ts
│   ├── dto/
│   │   ├── create-category.dto.ts
│   │   └── update-category.dto.ts
│   └── entities/
│       └── category.entity.ts
├── transactions/            # 交易记录模块
│   ├── transactions.controller.ts
│   ├── transactions.service.ts
│   ├── transactions.module.ts
│   ├── dto/
│   │   ├── create-transaction.dto.ts
│   │   ├── update-transaction.dto.ts
│   │   └── transaction-query.dto.ts
│   └── entities/
│       └── transaction.entity.ts
├── reports/                 # 报表模块
│   ├── reports.controller.ts
│   ├── reports.service.ts
│   ├── reports.module.ts
│   ├── dto/
│   │   └── report-query.dto.ts
│   └── interfaces/
│       └── report.interface.ts
├── upload/                  # 文件上传模块
│   ├── upload.controller.ts
│   ├── upload.service.ts
│   └── upload.module.ts
├── common/                  # 公共模块
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── ledger-member.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── ledger-access.guard.ts
│   ├── interceptors/
│   │   ├── response.interceptor.ts
│   │   └── logging.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── utils/
│       ├── date.util.ts
│       └── crypto.util.ts
└── prisma/                  # 数据库模块
    ├── prisma.service.ts
    └── prisma.module.ts
```

### 2.2 核心服务实现示例

#### 2.2.1 账本服务 (LedgersService)

```typescript
// src/ledgers/ledgers.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { LedgerMemberRole } from '@prisma/client';
import { generateInviteCode } from '../common/utils/crypto.util';

@Injectable()
export class LedgersService {
  constructor(private prisma: PrismaService) {}

  async findUserLedgers(userId: string) {
    const ledgerMembers = await this.prisma.ledgerMember.findMany({
      where: {
        userId,
        ledger: {
          deletedAt: null,
        },
      },
      include: {
        ledger: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return ledgerMembers.map(member => ({
      ...member.ledger,
      role: member.role,
      memberCount: member.ledger._count.members,
    }));
  }

  async create(userId: string, createLedgerDto: CreateLedgerDto) {
    const ledger = await this.prisma.ledger.create({
      data: {
        ...createLedgerDto,
        members: {
          create: {
            userId,
            role: LedgerMemberRole.OWNER,
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    // 创建默认账户
    await this.createDefaultAccounts(ledger.id);
    
    // 创建默认分类
    await this.createDefaultCategories(ledger.id);

    return {
      ...ledger,
      role: LedgerMemberRole.OWNER,
      memberCount: ledger._count.members,
    };
  }

  async findOne(ledgerId: string, userId: string) {
    const ledger = await this.prisma.ledger.findFirst({
      where: {
        id: ledgerId,
        deletedAt: null,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
      },
    });

    if (!ledger) {
      throw new NotFoundException('账本不存在或无权限访问');
    }

    const currentMember = ledger.members.find(m => m.userId === userId);

    return {
      ...ledger,
      role: currentMember?.role,
      members: ledger.members.map(member => ({
        id: member.id,
        userId: member.userId,
        nickname: member.user.nickname,
        avatar: member.user.avatar,
        role: member.role,
        joinedAt: member.joinedAt,
      })),
    };
  }

  async generateInvite(ledgerId: string, userId: string, inviteMemberDto: InviteMemberDto) {
    // 检查权限
    await this.checkLedgerPermission(ledgerId, userId, [LedgerMemberRole.OWNER, LedgerMemberRole.ADMIN]);

    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天有效期

    const inviteCode = await this.prisma.inviteCode.create({
      data: {
        code,
        ledgerId,
        createdBy: userId,
        email: inviteMemberDto.email,
        role: inviteMemberDto.role || LedgerMemberRole.MEMBER,
        expiresAt,
      },
    });

    return {
      inviteCode: code,
      inviteUrl: `https://app.example.com/join?code=${code}`,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?data=${code}`,
      expiresAt,
    };
  }

  async joinLedger(code: string, userId: string) {
    const invite = await this.prisma.inviteCode.findFirst({
      where: {
        code,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      },
      include: {
        ledger: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('邀请码无效或已过期');
    }

    // 检查是否已经是成员
    const existingMember = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId: invite.ledgerId,
        userId,
      },
    });

    if (existingMember) {
      throw new ForbiddenException('您已经是该账本的成员');
    }

    // 加入账本
    await this.prisma.ledgerMember.create({
      data: {
        ledgerId: invite.ledgerId,
        userId,
        role: invite.role,
      },
    });

    // 标记邀请码已使用
    await this.prisma.inviteCode.update({
      where: {
        id: invite.id,
      },
      data: {
        usedAt: new Date(),
        usedBy: userId,
      },
    });

    return {
      ledger: {
        ...invite.ledger,
        role: invite.role,
      },
    };
  }

  private async checkLedgerPermission(
    ledgerId: string,
    userId: string,
    allowedRoles: LedgerMemberRole[]
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

  private async createDefaultAccounts(ledgerId: string) {
    const defaultAccounts = [
      { name: '现金', type: 'CASH', icon: '💵', color: '#52C41A', isDefault: true },
      { name: '支付宝', type: 'ALIPAY', icon: '💰', color: '#1677FF' },
      { name: '微信', type: 'WECHAT', icon: '💚', color: '#07C160' },
    ];

    await this.prisma.account.createMany({
      data: defaultAccounts.map(account => ({
        ...account,
        ledgerId,
      })),
    });
  }

  private async createDefaultCategories(ledgerId: string) {
    const defaultCategories = [
      // 支出分类
      { name: '餐饮', type: 'EXPENSE', icon: '🍽️', color: '#FF6B6B', isDefault: true },
      { name: '交通', type: 'EXPENSE', icon: '🚗', color: '#4ECDC4', isDefault: true },
      { name: '购物', type: 'EXPENSE', icon: '🛍️', color: '#45B7D1', isDefault: true },
      { name: '娱乐', type: 'EXPENSE', icon: '🎮', color: '#96CEB4', isDefault: true },
      { name: '医疗', type: 'EXPENSE', icon: '🏥', color: '#FFEAA7', isDefault: true },
      { name: '教育', type: 'EXPENSE', icon: '📚', color: '#DDA0DD', isDefault: true },
      { name: '住房', type: 'EXPENSE', icon: '🏠', color: '#98D8C8', isDefault: true },
      // 收入分类
      { name: '工资', type: 'INCOME', icon: '💼', color: '#6C5CE7', isDefault: true },
      { name: '奖金', type: 'INCOME', icon: '🎁', color: '#A29BFE', isDefault: true },
      { name: '投资', type: 'INCOME', icon: '📈', color: '#FD79A8', isDefault: true },
      { name: '其他收入', type: 'INCOME', icon: '💰', color: '#FDCB6E', isDefault: true },
    ];

    await this.prisma.category.createMany({
      data: defaultCategories.map((category, index) => ({
        ...category,
        ledgerId,
        sortOrder: index,
      })),
    });
  }
}
```

#### 2.2.2 交易记录服务 (TransactionsService)

```typescript
// src/transactions/transactions.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(ledgerId: string, userId: string, query: TransactionQueryDto) {
    // 检查用户是否有权限访问该账本
    await this.checkLedgerAccess(ledgerId, userId);

    const {
      page = 1,
      limit = 20,
      type,
      categoryId,
      accountId,
      memberId,
      startDate,
      endDate,
      keyword,
    } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // 最大100条

    const where: any = {
      ledgerId,
      deletedAt: null,
    };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.accountId = accountId;
    if (memberId) where.memberId = memberId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (keyword) {
      where.description = {
        contains: keyword,
        mode: 'insensitive',
      };
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
          account: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
            },
          },
          toAccount: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
            },
          },
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    // 计算汇总数据
    const summary = await this.calculateSummary(ledgerId, where);

    return {
      transactions: transactions.map(this.formatTransaction),
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
      summary,
    };
  }

  async create(ledgerId: string, userId: string, createTransactionDto: CreateTransactionDto) {
    // 检查用户是否有权限访问该账本
    const member = await this.checkLedgerAccess(ledgerId, userId);

    // 验证账户和分类是否属于该账本
    await this.validateAccountAndCategory(ledgerId, createTransactionDto);

    const transaction = await this.prisma.$transaction(async (tx) => {
      // 创建交易记录
      const newTransaction = await tx.transaction.create({
        data: {
          ...createTransactionDto,
          ledgerId,
          memberId: member.id,
          date: new Date(createTransactionDto.date),
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
          account: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
            },
          },
          toAccount: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
            },
          },
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      // 更新账户余额
      await this.updateAccountBalance(tx, newTransaction);

      return newTransaction;
    });

    return this.formatTransaction(transaction);
  }

  private async checkLedgerAccess(ledgerId: string, userId: string) {
    const member = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId,
        ledger: {
          deletedAt: null,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('无权限访问该账本');
    }

    return member;
  }

  private async validateAccountAndCategory(ledgerId: string, dto: CreateTransactionDto) {
    const [account, category, toAccount] = await Promise.all([
      this.prisma.account.findFirst({
        where: { id: dto.accountId, ledgerId, deletedAt: null },
      }),
      this.prisma.category.findFirst({
        where: { 
          id: dto.categoryId, 
          OR: [
            { ledgerId },
            { ledgerId: null, isDefault: true },
          ],
          deletedAt: null,
        },
      }),
      dto.toAccountId
        ? this.prisma.account.findFirst({
            where: { id: dto.toAccountId, ledgerId, deletedAt: null },
          })
        : Promise.resolve(null),
    ]);

    if (!account) {
      throw new NotFoundException('账户不存在');
    }
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    if (dto.toAccountId && !toAccount) {
      throw new NotFoundException('目标账户不存在');
    }
    if (dto.type === TransactionType.TRANSFER && !dto.toAccountId) {
      throw new NotFoundException('转账必须指定目标账户');
    }
  }

  private async updateAccountBalance(tx: any, transaction: any) {
    const amount = parseFloat(transaction.amount.toString());

    switch (transaction.type) {
      case TransactionType.EXPENSE:
        // 支出：减少账户余额
        await tx.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });
        break;

      case TransactionType.INCOME:
        // 收入：增加账户余额
        await tx.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });
        break;

      case TransactionType.TRANSFER:
        // 转账：减少源账户，增加目标账户
        await Promise.all([
          tx.account.update({
            where: { id: transaction.accountId },
            data: {
              balance: {
                decrement: amount,
              },
            },
          }),
          tx.account.update({
            where: { id: transaction.toAccountId },
            data: {
              balance: {
                increment: amount,
              },
            },
          }),
        ]);
        break;
    }
  }

  private async calculateSummary(ledgerId: string, where: any) {
    const summaryWhere = { ...where };
    delete summaryWhere.description; // 移除关键词搜索条件

    const [incomeSum, expenseSum, transactionCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          ...summaryWhere,
          type: TransactionType.INCOME,
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          ...summaryWhere,
          type: TransactionType.EXPENSE,
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.transaction.count({
        where: summaryWhere,
      }),
    ]);

    const totalIncome = parseFloat(incomeSum._sum.amount?.toString() || '0');
    const totalExpense = parseFloat(expenseSum._sum.amount?.toString() || '0');

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount,
    };
  }

  private formatTransaction(transaction: any) {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: parseFloat(transaction.amount.toString()),
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0],
      category: transaction.category,
      account: transaction.account,
      toAccount: transaction.toAccount,
      member: {
        id: transaction.member.id,
        nickname: transaction.member.user.nickname,
        avatar: transaction.member.user.avatar,
      },
      images: transaction.images,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
```

## 3. 权限控制和安全

### 3.1 账本访问守卫

```typescript
// src/common/guards/ledger-access.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LedgerAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ledgerId = request.params.ledgerId;

    if (!ledgerId) {
      return true; // 如果没有ledgerId参数，跳过检查
    }

    const member = await this.prisma.ledgerMember.findFirst({
      where: {
        ledgerId,
        userId: user.id,
        ledger: {
          deletedAt: null,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('无权限访问该账本');
    }

    // 将成员信息添加到请求对象中
    request.ledgerMember = member;
    return true;
  }
}
```

### 3.2 当前用户装饰器

```typescript
// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const CurrentLedgerMember = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.ledgerMember;
  },
);
```

## 4. 数据传输对象 (DTOs)

### 4.1 创建账本DTO

```typescript
// src/ledgers/dto/create-ledger.dto.ts
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LedgerType } from '@prisma/client';

export class CreateLedgerDto {
  @ApiProperty({ description: '账本名称', example: '家庭账本' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: '账本描述', example: '家庭日常开销记录' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ description: '账本类型', enum: LedgerType, example: LedgerType.FAMILY })
  @IsEnum(LedgerType)
  type: LedgerType;

  @ApiPropertyOptional({ description: '封面图片URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '货币类型', example: 'CNY' })
  @IsOptional()
  @IsString()
  currency?: string;
}
```

### 4.2 创建交易记录DTO

```typescript
// src/transactions/dto/create-transaction.dto.ts
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({ description: '交易类型', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ description: '金额', example: 128.50 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiPropertyOptional({ description: '交易描述', example: '午餐' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '交易日期', example: '2024-01-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: '分类ID' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: '账户ID' })
  @IsString()
  accountId: string;

  @ApiPropertyOptional({ description: '目标账户ID（转账时使用）' })
  @IsOptional()
  @IsString()
  toAccountId?: string;

  @ApiPropertyOptional({ description: '图片URL数组', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
```

## 5. 部署和性能优化建议

### 5.1 数据库索引优化

```sql
-- 为常用查询添加索引
CREATE INDEX idx_transactions_ledger_date ON transactions(ledger_id, date DESC);
CREATE INDEX idx_transactions_ledger_type ON transactions(ledger_id, type);
CREATE INDEX idx_transactions_ledger_category ON transactions(ledger_id, category_id);
CREATE INDEX idx_transactions_ledger_member ON transactions(ledger_id, member_id);
CREATE INDEX idx_ledger_members_user ON ledger_members(user_id);
CREATE INDEX idx_accounts_ledger ON accounts(ledger_id);
CREATE INDEX idx_categories_ledger ON categories(ledger_id);
```

### 5.2 缓存策略

```typescript
// 使用Redis缓存常用数据
// src/common/cache/cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '@nestjs-modules/ioredis';

@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  async getUserLedgers(userId: string) {
    const cacheKey = `user:${userId}:ledgers`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    return null;
  }

  async setUserLedgers(userId: string, ledgers: any[], ttl = 300) {
    const cacheKey = `user:${userId}:ledgers`;
    await this.redis.setex(cacheKey, ttl, JSON.stringify(ledgers));
  }

  async invalidateUserCache(userId: string) {
    const pattern = `user:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 5.3 API限流

```typescript
// src/common/guards/throttle.guard.ts
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // 基于用户ID进行限流
    return req.user?.id || req.ip;
  }
}
```

## 6. 小程序/App 特殊功能实现

### 6.1 离线数据同步

```typescript
// src/sync/sync.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async syncTransactions(userId: string, ledgerId: string, localTransactions: any[]) {
    const conflicts = [];
    const synced = [];

    for (const localTx of localTransactions) {
      if (localTx.id.startsWith('local_')) {
        // 本地创建的交易，上传到服务器
        try {
          const serverTx = await this.createTransaction(ledgerId, userId, localTx);
          synced.push({
            localId: localTx.id,
            serverId: serverTx.id,
            action: 'created',
          });
        } catch (error) {
          conflicts.push({
            localTransaction: localTx,
            error: error.message,
          });
        }
      } else {
        // 检查服务器端是否有更新
        const serverTx = await this.prisma.transaction.findUnique({
          where: { id: localTx.id },
        });

        if (serverTx && serverTx.updatedAt > new Date(localTx.updatedAt)) {
          conflicts.push({
            localTransaction: localTx,
            serverTransaction: serverTx,
            reason: 'server_newer',
          });
        }
      }
    }

    return {
      synced,
      conflicts,
    };
  }

  async getIncrementalUpdates(userId: string, ledgerId: string, lastSyncTime: string) {
    const since = new Date(lastSyncTime);

    const [transactions, accounts, categories] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          ledgerId,
          updatedAt: {
            gt: since,
          },
        },
        include: {
          category: true,
          account: true,
          member: {
            include: {
              user: {
                select: {
                  nickname: true,
                  avatar: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.account.findMany({
        where: {
          ledgerId,
          updatedAt: {
            gt: since,
          },
        },
      }),
      this.prisma.category.findMany({
        where: {
          OR: [
            { ledgerId, updatedAt: { gt: since } },
            { ledgerId: null, isDefault: true, updatedAt: { gt: since } },
          ],
        },
      }),
    ]);

    return {
      transactions,
      accounts,
      categories,
      syncTime: new Date().toISOString(),
    };
  }
}
```

### 6.2 推送通知

```typescript
// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async notifyNewTransaction(ledgerId: string, transaction: any, creatorId: string) {
    // 获取账本其他成员
    const members = await this.prisma.ledgerMember.findMany({
      where: {
        ledgerId,
        userId: {
          not: creatorId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        ledger: {
          select: {
            name: true,
          },
        },
      },
    });

    // 发送推送通知
    for (const member of members) {
      await this.sendPushNotification(member.user.id, {
        title: `${member.ledger.name} 有新记录`,
        body: `${transaction.member.nickname} 记录了一笔 ${transaction.amount} 元的${transaction.type === 'EXPENSE' ? '支出' : '收入'}`,
        data: {
          type: 'new_transaction',
          ledgerId,
          transactionId: transaction.id,
        },
      });
    }
  }

  private async sendPushNotification(userId: string, notification: any) {
    // 实现具体的推送逻辑
    // 可以集成极光推送、个推等第三方服务
    console.log(`Sending notification to user ${userId}:`, notification);
  }
}
```

这个实现方案为小程序和App提供了完整的后端支持，包括：

1. **完整的数据模型**：支持多账本、多成员、分类管理等核心功能
2. **权限控制**：确保用户只能访问自己参与的账本
3. **性能优化**：数据库索引、缓存策略、API限流
4. **移动端特性**：离线同步、推送通知、增量更新
5. **安全性**：JWT认证、数据验证、SQL注入防护

这套方案可以很好地支持小程序和App的各种使用场景，提供流畅的用户体验。