# 家庭记账本 - 小程序/App 后端代码结构方案

## 1. 项目整体结构

```
family-ledger-backend/
├── src/                          # 源代码目录
│   ├── main.ts                   # 应用入口文件
│   ├── app.module.ts             # 根模块
│   ├── app.controller.ts         # 根控制器
│   ├── app.service.ts            # 根服务
│   │
│   ├── auth/                     # 认证模块
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── local-auth.guard.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── interfaces/
│   │       ├── jwt-payload.interface.ts
│   │       └── auth-response.interface.ts
│   │
│   ├── users/                    # 用户模块
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── change-password.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── interfaces/
│   │       └── user.interface.ts
│   │
│   ├── ledgers/                  # 账本模块
│   │   ├── ledgers.module.ts
│   │   ├── ledgers.controller.ts
│   │   ├── ledgers.service.ts
│   │   ├── dto/
│   │   │   ├── create-ledger.dto.ts
│   │   │   ├── update-ledger.dto.ts
│   │   │   ├── invite-member.dto.ts
│   │   │   └── join-ledger.dto.ts
│   │   ├── entities/
│   │   │   ├── ledger.entity.ts
│   │   │   ├── ledger-member.entity.ts
│   │   │   └── invite-code.entity.ts
│   │   ├── services/
│   │   │   ├── ledger-member.service.ts
│   │   │   └── invite-code.service.ts
│   │   └── interfaces/
│   │       ├── ledger.interface.ts
│   │       └── member.interface.ts
│   │
│   ├── accounts/                 # 账户模块
│   │   ├── accounts.module.ts
│   │   ├── accounts.controller.ts
│   │   ├── accounts.service.ts
│   │   ├── dto/
│   │   │   ├── create-account.dto.ts
│   │   │   ├── update-account.dto.ts
│   │   │   └── transfer-account.dto.ts
│   │   ├── entities/
│   │   │   └── account.entity.ts
│   │   └── interfaces/
│   │       └── account.interface.ts
│   │
│   ├── categories/               # 分类模块
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── dto/
│   │   │   ├── create-category.dto.ts
│   │   │   ├── update-category.dto.ts
│   │   │   └── sort-categories.dto.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts
│   │   └── interfaces/
│   │       └── category.interface.ts
│   │
│   ├── transactions/             # 交易记录模块
│   │   ├── transactions.module.ts
│   │   ├── transactions.controller.ts
│   │   ├── transactions.service.ts
│   │   ├── dto/
│   │   │   ├── create-transaction.dto.ts
│   │   │   ├── update-transaction.dto.ts
│   │   │   ├── transaction-query.dto.ts
│   │   │   └── batch-transaction.dto.ts
│   │   ├── entities/
│   │   │   └── transaction.entity.ts
│   │   ├── services/
│   │   │   ├── transaction-statistics.service.ts
│   │   │   └── transaction-export.service.ts
│   │   └── interfaces/
│   │       ├── transaction.interface.ts
│   │       └── statistics.interface.ts
│   │
│   ├── reports/                  # 报表模块
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts
│   │   ├── reports.service.ts
│   │   ├── dto/
│   │   │   ├── report-query.dto.ts
│   │   │   └── export-report.dto.ts
│   │   ├── services/
│   │   │   ├── income-expense.service.ts
│   │   │   ├── category-analysis.service.ts
│   │   │   ├── member-analysis.service.ts
│   │   │   └── trend-analysis.service.ts
│   │   └── interfaces/
│   │       ├── report.interface.ts
│   │       └── chart-data.interface.ts
│   │
│   ├── upload/                   # 文件上传模块
│   │   ├── upload.module.ts
│   │   ├── upload.controller.ts
│   │   ├── upload.service.ts
│   │   ├── dto/
│   │   │   └── upload-file.dto.ts
│   │   ├── services/
│   │   │   ├── image-processor.service.ts
│   │   │   └── file-validator.service.ts
│   │   └── interfaces/
│   │       └── upload.interface.ts
│   │
│   ├── notifications/             # 通知模块
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   ├── dto/
│   │   │   ├── send-notification.dto.ts
│   │   │   └── notification-settings.dto.ts
│   │   ├── services/
│   │   │   ├── push-notification.service.ts
│   │   │   ├── email-notification.service.ts
│   │   │   └── sms-notification.service.ts
│   │   ├── entities/
│   │   │   ├── notification.entity.ts
│   │   │   └── device-token.entity.ts
│   │   └── interfaces/
│   │       └── notification.interface.ts
│   │
│   ├── sync/                     # 数据同步模块
│   │   ├── sync.module.ts
│   │   ├── sync.controller.ts
│   │   ├── sync.service.ts
│   │   ├── dto/
│   │   │   ├── sync-request.dto.ts
│   │   │   └── conflict-resolution.dto.ts
│   │   ├── services/
│   │   │   ├── conflict-resolver.service.ts
│   │   │   └── incremental-sync.service.ts
│   │   └── interfaces/
│   │       ├── sync.interface.ts
│   │       └── conflict.interface.ts
│   │
│   ├── common/                   # 公共模块
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── current-ledger.decorator.ts
│   │   │   ├── api-response.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── ledger-access.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── throttle.guard.ts
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── cache.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts
│   │   │   ├── parse-object-id.pipe.ts
│   │   │   └── file-validation.pipe.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   ├── prisma-exception.filter.ts
│   │   │   └── validation-exception.filter.ts
│   │   ├── middleware/
│   │   │   ├── logger.middleware.ts
│   │   │   ├── cors.middleware.ts
│   │   │   └── request-id.middleware.ts
│   │   ├── utils/
│   │   │   ├── date.util.ts
│   │   │   ├── crypto.util.ts
│   │   │   ├── validation.util.ts
│   │   │   ├── pagination.util.ts
│   │   │   └── file.util.ts
│   │   ├── constants/
│   │   │   ├── error-codes.constant.ts
│   │   │   ├── cache-keys.constant.ts
│   │   │   ├── notification-types.constant.ts
│   │   │   └── file-types.constant.ts
│   │   ├── interfaces/
│   │   │   ├── api-response.interface.ts
│   │   │   ├── pagination.interface.ts
│   │   │   ├── query-options.interface.ts
│   │   │   └── file-upload.interface.ts
│   │   └── types/
│   │       ├── request.type.ts
│   │       ├── response.type.ts
│   │       └── pagination.type.ts
│   │
│   ├── database/                 # 数据库模块
│   │   ├── database.module.ts
│   │   ├── prisma.service.ts
│   │   ├── redis.service.ts
│   │   ├── migrations/
│   │   │   └── (Prisma自动生成)
│   │   ├── seeds/
│   │   │   ├── seed.ts
│   │   │   ├── users.seed.ts
│   │   │   ├── categories.seed.ts
│   │   │   └── accounts.seed.ts
│   │   └── factories/
│   │       ├── user.factory.ts
│   │       ├── ledger.factory.ts
│   │       └── transaction.factory.ts
│   │
│   ├── config/                   # 配置模块
│   │   ├── config.module.ts
│   │   ├── configuration.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   ├── upload.config.ts
│   │   └── notification.config.ts
│   │
│   └── health/                   # 健康检查模块
│       ├── health.module.ts
│       ├── health.controller.ts
│       ├── health.service.ts
│       └── indicators/
│           ├── database.indicator.ts
│           ├── redis.indicator.ts
│           └── memory.indicator.ts
│
├── prisma/                       # Prisma配置
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── test/                         # 测试文件
│   ├── unit/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── ledgers/
│   │   └── transactions/
│   ├── integration/
│   │   ├── auth.e2e-spec.ts
│   │   ├── users.e2e-spec.ts
│   │   └── transactions.e2e-spec.ts
│   ├── fixtures/
│   │   ├── users.fixture.ts
│   │   └── transactions.fixture.ts
│   └── utils/
│       ├── test-db.util.ts
│       └── mock.util.ts
│
├── docs/                         # 文档目录
│   ├── api/
│   │   ├── swagger.json
│   │   └── postman.json
│   ├── deployment/
│   │   ├── docker.md
│   │   └── kubernetes.md
│   └── development/
│       ├── setup.md
│       └── guidelines.md
│
├── scripts/                      # 脚本文件
│   ├── build.sh
│   ├── deploy.sh
│   ├── migrate.sh
│   └── seed.sh
│
├── docker/                       # Docker配置
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── nginx/
│       └── nginx.conf
│
├── .env.example                  # 环境变量示例
├── .env.development              # 开发环境变量
├── .env.production               # 生产环境变量
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

## 2. 核心模块详细结构

### 2.1 认证模块 (auth/)

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

```typescript
// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponse } from './interfaces/auth-response.interface';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: '刷新Token' })
  @ApiResponse({ status: 200, description: 'Token刷新成功' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @ApiOperation({ summary: '退出登录' })
  @ApiResponse({ status: 200, description: '退出成功' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req): Promise<{ message: string }> {
    await this.authService.logout(req.user.id);
    return { message: '退出成功' };
  }
}
```

### 2.2 账本模块 (ledgers/)

```typescript
// src/ledgers/ledgers.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LedgersService } from './ledgers.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JoinLedgerDto } from './dto/join-ledger.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LedgerAccessGuard } from '../common/guards/ledger-access.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentLedgerMember } from '../common/decorators/current-ledger.decorator';
import { User } from '../users/entities/user.entity';
import { LedgerMember } from './entities/ledger-member.entity';

@ApiTags('账本管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ledgers')
export class LedgersController {
  constructor(private readonly ledgersService: LedgersService) {}

  @ApiOperation({ summary: '获取用户账本列表' })
  @Get()
  async findUserLedgers(@CurrentUser() user: User) {
    return this.ledgersService.findUserLedgers(user.id);
  }

  @ApiOperation({ summary: '创建账本' })
  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createLedgerDto: CreateLedgerDto,
  ) {
    return this.ledgersService.create(user.id, createLedgerDto);
  }

  @ApiOperation({ summary: '获取账本详情' })
  @UseGuards(LedgerAccessGuard)
  @Get(':ledgerId')
  async findOne(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
  ) {
    return this.ledgersService.findOne(ledgerId, user.id);
  }

  @ApiOperation({ summary: '更新账本信息' })
  @UseGuards(LedgerAccessGuard)
  @Patch(':ledgerId')
  async update(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Body() updateLedgerDto: UpdateLedgerDto,
  ) {
    return this.ledgersService.update(ledgerId, user.id, updateLedgerDto);
  }

  @ApiOperation({ summary: '邀请成员' })
  @UseGuards(LedgerAccessGuard)
  @Post(':ledgerId/invite')
  async inviteMember(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Body() inviteMemberDto: InviteMemberDto,
  ) {
    return this.ledgersService.generateInvite(ledgerId, user.id, inviteMemberDto);
  }

  @ApiOperation({ summary: '加入账本' })
  @Post('join')
  async joinLedger(
    @CurrentUser() user: User,
    @Body() joinLedgerDto: JoinLedgerDto,
  ) {
    return this.ledgersService.joinLedger(joinLedgerDto.code, user.id);
  }

  @ApiOperation({ summary: '获取账本成员列表' })
  @UseGuards(LedgerAccessGuard)
  @Get(':ledgerId/members')
  async getMembers(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
  ) {
    return this.ledgersService.getMembers(ledgerId, user.id);
  }

  @ApiOperation({ summary: '移除成员' })
  @UseGuards(LedgerAccessGuard)
  @Delete(':ledgerId/members/:memberId')
  async removeMember(
    @Param('ledgerId') ledgerId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
  ) {
    return this.ledgersService.removeMember(ledgerId, memberId, user.id);
  }
}
```

### 2.3 交易记录模块 (transactions/)

```typescript
// src/transactions/transactions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { BatchTransactionDto } from './dto/batch-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LedgerAccessGuard } from '../common/guards/ledger-access.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('交易记录')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, LedgerAccessGuard)
@Controller('ledgers/:ledgerId/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: '获取交易记录列表' })
  @Get()
  async findAll(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Query() query: TransactionQueryDto,
  ) {
    return this.transactionsService.findAll(ledgerId, user.id, query);
  }

  @ApiOperation({ summary: '创建交易记录' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5))
  @Post()
  async create(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Body() createTransactionDto: CreateTransactionDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.transactionsService.create(
      ledgerId,
      user.id,
      createTransactionDto,
      images,
    );
  }

  @ApiOperation({ summary: '批量创建交易记录' })
  @Post('batch')
  async createBatch(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Body() batchTransactionDto: BatchTransactionDto,
  ) {
    return this.transactionsService.createBatch(
      ledgerId,
      user.id,
      batchTransactionDto,
    );
  }

  @ApiOperation({ summary: '获取交易记录详情' })
  @Get(':id')
  async findOne(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.transactionsService.findOne(ledgerId, id, user.id);
  }

  @ApiOperation({ summary: '更新交易记录' })
  @Patch(':id')
  async update(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(
      ledgerId,
      id,
      user.id,
      updateTransactionDto,
    );
  }

  @ApiOperation({ summary: '删除交易记录' })
  @Delete(':id')
  async remove(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.transactionsService.remove(ledgerId, id, user.id);
  }

  @ApiOperation({ summary: '获取交易统计' })
  @Get('statistics/overview')
  async getStatistics(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Query() query: TransactionQueryDto,
  ) {
    return this.transactionsService.getStatistics(ledgerId, user.id, query);
  }

  @ApiOperation({ summary: '导出交易记录' })
  @Get('export')
  async exportTransactions(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Query() query: TransactionQueryDto,
  ) {
    return this.transactionsService.exportTransactions(ledgerId, user.id, query);
  }
}
```

## 3. 数据传输对象 (DTOs) 结构

### 3.1 基础DTO类

```typescript
// src/common/dto/base.dto.ts
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BaseDto {
  @ApiPropertyOptional({ description: '创建时间' })
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiPropertyOptional({ description: '更新时间' })
  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}

export class PaginationDto {
  @ApiPropertyOptional({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: '排序字段' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: '排序方向', enum: ['asc', 'desc'] })
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}

export class QueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
```

### 3.2 交易记录DTO

```typescript
// src/transactions/dto/create-transaction.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ description: '交易类型', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ description: '金额', example: 128.50, minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiPropertyOptional({ description: '交易描述', example: '午餐', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ description: '交易日期', example: '2024-01-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: '分类ID' })
  @IsString()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: '账户ID' })
  @IsString()
  @IsUUID()
  accountId: string;

  @ApiPropertyOptional({ description: '目标账户ID（转账时使用）' })
  @IsOptional()
  @IsString()
  @IsUUID()
  toAccountId?: string;

  @ApiPropertyOptional({ description: '图片URL数组', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: '标签', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '备注', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
```

```typescript
// src/transactions/dto/transaction-query.dto.ts
import { IsOptional, IsEnum, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TransactionType } from '@prisma/client';
import { QueryDto } from '../../common/dto/base.dto';

export class TransactionQueryDto extends QueryDto {
  @ApiPropertyOptional({ description: '交易类型', enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: '账户ID' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({ description: '成员ID' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({ description: '最小金额' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  minAmount?: number;

  @ApiPropertyOptional({ description: '最大金额' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  maxAmount?: number;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: '是否包含图片' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  hasImages?: boolean;
}
```

## 4. 实体类 (Entities) 结构

### 4.1 基础实体类

```typescript
// src/common/entities/base.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class BaseEntity {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '删除时间', required: false })
  deletedAt?: Date;
}
```

### 4.2 交易记录实体

```typescript
// src/transactions/entities/transaction.entity.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { BaseEntity } from '../../common/entities/base.entity';
import { Category } from '../../categories/entities/category.entity';
import { Account } from '../../accounts/entities/account.entity';
import { LedgerMember } from '../../ledgers/entities/ledger-member.entity';

export class Transaction extends BaseEntity {
  @ApiProperty({ description: '账本ID' })
  ledgerId: string;

  @ApiProperty({ description: '交易类型', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ description: '金额' })
  amount: number;

  @ApiPropertyOptional({ description: '交易描述' })
  description?: string;

  @ApiProperty({ description: '交易日期' })
  date: Date;

  @ApiProperty({ description: '分类ID' })
  categoryId: string;

  @ApiProperty({ description: '账户ID' })
  accountId: string;

  @ApiPropertyOptional({ description: '目标账户ID' })
  toAccountId?: string;

  @ApiProperty({ description: '成员ID' })
  memberId: string;

  @ApiPropertyOptional({ description: '图片URL数组', type: [String] })
  images?: string[];

  @ApiPropertyOptional({ description: '标签', type: [String] })
  tags?: string[];

  @ApiPropertyOptional({ description: '备注' })
  note?: string;

  // 关联实体
  @ApiPropertyOptional({ description: '分类信息', type: () => Category })
  category?: Category;

  @ApiPropertyOptional({ description: '账户信息', type: () => Account })
  account?: Account;

  @ApiPropertyOptional({ description: '目标账户信息', type: () => Account })
  toAccount?: Account;

  @ApiPropertyOptional({ description: '成员信息', type: () => LedgerMember })
  member?: LedgerMember;
}
```

## 5. 服务类 (Services) 结构

### 5.1 基础服务类

```typescript
// src/common/services/base.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../dto/base.dto';
import { PaginationResult } from '../interfaces/pagination.interface';

@Injectable()
export abstract class BaseService<T> {
  constructor(protected readonly prisma: PrismaService) {}

  protected async paginate<K>(
    model: any,
    args: any,
    pagination: PaginationDto,
  ): Promise<PaginationResult<K>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const [data, total] = await Promise.all([
      model.findMany({
        ...args,
        skip,
        take,
      }),
      model.count({ where: args.where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        hasNext: page * take < total,
        hasPrev: page > 1,
      },
    };
  }

  protected buildOrderBy(sort?: string, order: 'asc' | 'desc' = 'desc') {
    if (!sort) return { createdAt: order };
    
    return { [sort]: order };
  }

  protected buildDateFilter(startDate?: string, endDate?: string) {
    const filter: any = {};
    
    if (startDate) filter.gte = new Date(startDate);
    if (endDate) filter.lte = new Date(endDate);
    
    return Object.keys(filter).length > 0 ? filter : undefined;
  }
}
```

### 5.2 交易记录服务

```typescript
// src/transactions/transactions.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BaseService } from '../common/services/base.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { BatchTransactionDto } from './dto/batch-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { TransactionType } from '@prisma/client';
import { UploadService } from '../upload/upload.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TransactionsService extends BaseService<Transaction> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
    private readonly notificationsService: NotificationsService,
  ) {
    super(prisma);
  }

  async findAll(ledgerId: string, userId: string, query: TransactionQueryDto) {
    // 检查用户权限
    await this.checkLedgerAccess(ledgerId, userId);

    const {
      type,
      categoryId,
      accountId,
      memberId,
      minAmount,
      maxAmount,
      tag,
      hasImages,
      search,
      startDate,
      endDate,
      ...pagination
    } = query;

    // 构建查询条件
    const where: any = {
      ledgerId,
      deletedAt: null,
    };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.accountId = accountId;
    if (memberId) where.memberId = memberId;
    if (tag) where.tags = { has: tag };
    if (hasImages !== undefined) {
      where.images = hasImages ? { not: { equals: [] } } : { equals: [] };
    }

    // 金额范围
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    // 日期范围
    const dateFilter = this.buildDateFilter(startDate, endDate);
    if (dateFilter) where.date = dateFilter;

    // 关键词搜索
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { note: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 排序
    const orderBy = this.buildOrderBy(pagination.sort, pagination.order);

    // 查询数据
    const result = await this.paginate(
      this.prisma.transaction,
      {
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
        orderBy,
      },
      pagination,
    );

    // 计算汇总数据
    const summary = await this.calculateSummary(ledgerId, where);

    return {
      ...result,
      summary,
    };
  }

  async create(
    ledgerId: string,
    userId: string,
    createTransactionDto: CreateTransactionDto,
    images?: Express.Multer.File[],
  ) {
    // 检查用户权限
    const member = await this.checkLedgerAccess(ledgerId, userId);

    // 验证账户和分类
    await this.validateAccountAndCategory(ledgerId, createTransactionDto);

    // 上传图片
    let imageUrls: string[] = [];
    if (images && images.length > 0) {
      imageUrls = await this.uploadService.uploadImages(images, 'transactions');
    }

    // 创建交易记录
    const transaction = await this.prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...createTransactionDto,
          ledgerId,
          memberId: member.id,
          date: new Date(createTransactionDto.date),
          images: imageUrls,
        },
        include: {
          category: true,
          account: true,
          toAccount: true,
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

    // 发送通知
    await this.notificationsService.notifyNewTransaction(
      ledgerId,
      transaction,
      userId,
    );

    return this.formatTransaction(transaction);
  }

  async createBatch(
    ledgerId: string,
    userId: string,
    batchTransactionDto: BatchTransactionDto,
  ) {
    const member = await this.checkLedgerAccess(ledgerId, userId);
    const { transactions } = batchTransactionDto;

    if (transactions.length === 0) {
      throw new BadRequestException('交易记录不能为空');
    }

    if (transactions.length > 100) {
      throw new BadRequestException('批量创建最多支持100条记录');
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < transactions.length; i++) {
      try {
        const transaction = await this.create(ledgerId, userId, transactions[i]);
        results.push(transaction);
      } catch (error) {
        errors.push({
          index: i,
          transaction: transactions[i],
          error: error.message,
        });
      }
    }

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors,
    };
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

  private async validateAccountAndCategory(
    ledgerId: string,
    dto: CreateTransactionDto,
  ) {
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
      throw new BadRequestException('转账必须指定目标账户');
    }
  }

  private async updateAccountBalance(tx: any, transaction: any) {
    const amount = parseFloat(transaction.amount.toString());

    switch (transaction.type) {
      case TransactionType.EXPENSE:
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { decrement: amount } },
        });
        break;

      case TransactionType.INCOME:
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: amount } },
        });
        break;

      case TransactionType.TRANSFER:
        await Promise.all([
          tx.account.update({
            where: { id: transaction.accountId },
            data: { balance: { decrement: amount } },
          }),
          tx.account.update({
            where: { id: transaction.toAccountId },
            data: { balance: { increment: amount } },
          }),
        ]);
        break;
    }
  }

  private async calculateSummary(ledgerId: string, where: any) {
    const summaryWhere = { ...where };
    delete summaryWhere.OR; // 移除搜索条件

    const [incomeSum, expenseSum, transactionCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...summaryWhere, type: TransactionType.INCOME },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...summaryWhere, type: TransactionType.EXPENSE },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where: summaryWhere }),
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
      tags: transaction.tags,
      note: transaction.note,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
```

## 6. 公共模块结构

### 6.1 响应拦截器

```typescript
// src/common/interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  requestId: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers['x-request-id'] || uuidv4();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        requestId,
      })),
    );
  }
}
```

### 6.2 异常过滤器

```typescript
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'] || uuidv4();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).details;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
      `RequestId: ${requestId}`,
    );

    const errorResponse = {
      success: false,
      error: {
        code: this.getErrorCode(status),
        message,
        details,
      },
      timestamp: new Date().toISOString(),
      requestId,
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const errorCodes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }
}
```

### 6.3 日志中间件

```typescript
// src/common/middleware/logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] || uuidv4();
    const startTime = Date.now();
    
    // 添加请求ID到请求头
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);

    // 记录请求日志
    this.logger.log(
      `${req.method} ${req.originalUrl} - ${req.ip} - RequestId: ${requestId}`,
    );

    // 监听响应完成
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.log(
        `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - RequestId: ${requestId}`,
      );
    });

    next();
  }
}
```

这个代码结构方案为小程序和App后端提供了：

1. **清晰的模块化架构**：每个功能模块独立，便于维护和扩展
2. **标准化的代码组织**：统一的文件命名和目录结构
3. **完整的数据验证**：使用DTO和管道进行请求验证
4. **统一的响应格式**：通过拦截器和过滤器标准化API响应
5. **权限控制机制**：基于JWT和自定义守卫的安全控制
6. **日志和监控**：完整的请求日志和错误追踪
7. **数据库事务管理**：确保数据一致性
8. **文件上传处理**：支持图片上传和处理
9. **通知推送系统**：支持多种通知方式
10. **数据同步机制**：支持离线数据同步

## 7. 配置文件结构

### 7.1 环境配置

```typescript
// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    cdnUrl: process.env.CDN_URL,
  },
  notification: {
    fcm: {
      projectId: process.env.FCM_PROJECT_ID,
      privateKey: process.env.FCM_PRIVATE_KEY,
      clientEmail: process.env.FCM_CLIENT_EMAIL,
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
    },
  },
  app: {
    name: process.env.APP_NAME || 'Family Ledger',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
});
```

### 7.2 数据库配置

```typescript
// src/config/database.config.ts
import { ConfigService } from '@nestjs/config';
import { PrismaClientOptions } from '@prisma/client/runtime/library';

export const getDatabaseConfig = (
  configService: ConfigService,
): PrismaClientOptions => {
  const environment = configService.get('NODE_ENV');
  
  return {
    datasources: {
      db: {
        url: configService.get<string>('DATABASE_URL'),
      },
    },
    log: environment === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
  };
};
```

## 8. 部署配置

### 8.1 Dockerfile

```dockerfile
# docker/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 生成Prisma客户端
RUN npx prisma generate

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产镜像
FROM node:18-alpine AS production

WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# 创建上传目录
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
```

### 8.2 Docker Compose

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/family_ledger
      - REDIS_HOST=redis
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - db
      - redis
    volumes:
      - uploads:/app/uploads
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=family_ledger
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - uploads:/var/www/uploads
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  uploads:
```

## 9. 测试结构

### 9.1 单元测试示例

```typescript
// test/unit/transactions/transactions.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '../../../src/transactions/transactions.service';
import { PrismaService } from '../../../src/database/prisma.service';
import { UploadService } from '../../../src/upload/upload.service';
import { NotificationsService } from '../../../src/notifications/notifications.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: PrismaService;
  let uploadService: UploadService;
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    transaction: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    ledgerMember: {
      findFirst: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockUploadService = {
    uploadImages: jest.fn(),
  };

  const mockNotificationsService = {
    notifyNewTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
    uploadService = module.get<UploadService>(UploadService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const ledgerId = 'ledger-1';
    const userId = 'user-1';
    const createTransactionDto = {
      type: TransactionType.EXPENSE,
      amount: 100,
      description: '午餐',
      date: '2024-01-01',
      categoryId: 'category-1',
      accountId: 'account-1',
    };

    it('should create a transaction successfully', async () => {
      const mockMember = { id: 'member-1', userId, ledgerId };
      const mockAccount = { id: 'account-1', ledgerId };
      const mockCategory = { id: 'category-1' };
      const mockTransaction = {
        id: 'transaction-1',
        ...createTransactionDto,
        ledgerId,
        memberId: mockMember.id,
        date: new Date(createTransactionDto.date),
        images: [],
        category: mockCategory,
        account: mockAccount,
        member: {
          id: mockMember.id,
          user: {
            id: userId,
            nickname: 'Test User',
            avatar: null,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.ledgerMember.findFirst.mockResolvedValue(mockMember);
      mockPrismaService.account.findFirst.mockResolvedValue(mockAccount);
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
          account: {
            update: jest.fn(),
          },
        };
        return callback(mockTx);
      });

      const result = await service.create(ledgerId, userId, createTransactionDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('transaction-1');
      expect(result.amount).toBe(100);
      expect(mockNotificationsService.notifyNewTransaction).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user has no access to ledger', async () => {
      mockPrismaService.ledgerMember.findFirst.mockResolvedValue(null);

      await expect(
        service.create(ledgerId, userId, createTransactionDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when account does not exist', async () => {
      const mockMember = { id: 'member-1', userId, ledgerId };
      
      mockPrismaService.ledgerMember.findFirst.mockResolvedValue(mockMember);
      mockPrismaService.account.findFirst.mockResolvedValue(null);

      await expect(
        service.create(ledgerId, userId, createTransactionDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions with summary', async () => {
      const ledgerId = 'ledger-1';
      const userId = 'user-1';
      const query = { page: 1, limit: 20 };
      
      const mockMember = { id: 'member-1', userId, ledgerId };
      const mockTransactions = [
        {
          id: 'transaction-1',
          type: TransactionType.EXPENSE,
          amount: 100,
          description: '午餐',
        },
      ];
      
      mockPrismaService.ledgerMember.findFirst.mockResolvedValue(mockMember);
      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrismaService.transaction.count.mockResolvedValue(1);
      mockPrismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 0 } }) // income
        .mockResolvedValueOnce({ _sum: { amount: 100 } }); // expense

      const result = await service.findAll(ledgerId, userId, query);

      expect(result.data).toEqual(mockTransactions);
      expect(result.summary.totalExpense).toBe(100);
      expect(result.summary.totalIncome).toBe(0);
      expect(result.summary.balance).toBe(-100);
    });
  });
});
```

### 9.2 集成测试示例

```typescript
// test/integration/transactions.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TransactionType } from '@prisma/client';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let testUser: any;
  let testLedger: any;
  let testAccount: any;
  let testCategory: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    
    await app.init();

    // 创建测试数据
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // 创建测试用户
    testUser = await prismaService.user.create({
      data: {
        phone: '13800138000',
        nickname: 'Test User',
        password: 'hashedPassword',
      },
    });

    // 生成JWT token
    authToken = jwtService.sign({ sub: testUser.id, phone: testUser.phone });

    // 创建测试账本
    testLedger = await prismaService.ledger.create({
      data: {
        name: 'Test Ledger',
        description: 'Test Description',
        members: {
          create: {
            userId: testUser.id,
            role: 'OWNER',
          },
        },
      },
    });

    // 创建测试账户
    testAccount = await prismaService.account.create({
      data: {
        name: 'Test Account',
        type: 'CASH',
        balance: 1000,
        ledgerId: testLedger.id,
      },
    });

    // 创建测试分类
    testCategory = await prismaService.category.create({
      data: {
        name: 'Test Category',
        type: 'EXPENSE',
        icon: 'food',
        color: '#FF6B6B',
        ledgerId: testLedger.id,
      },
    });
  }

  async function cleanupTestData() {
    await prismaService.transaction.deleteMany({
      where: { ledgerId: testLedger.id },
    });
    await prismaService.category.deleteMany({
      where: { ledgerId: testLedger.id },
    });
    await prismaService.account.deleteMany({
      where: { ledgerId: testLedger.id },
    });
    await prismaService.ledgerMember.deleteMany({
      where: { ledgerId: testLedger.id },
    });
    await prismaService.ledger.delete({
      where: { id: testLedger.id },
    });
    await prismaService.user.delete({
      where: { id: testUser.id },
    });
  }

  describe('/ledgers/:ledgerId/transactions (GET)', () => {
    it('should return transactions list', () => {
      return request(app.getHttpServer())
        .get(`/ledgers/${testLedger.id}/transactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('pagination');
          expect(res.body.data).toHaveProperty('summary');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get(`/ledgers/${testLedger.id}/transactions`)
        .expect(401);
    });
  });

  describe('/ledgers/:ledgerId/transactions (POST)', () => {
    it('should create a new transaction', () => {
      const createTransactionDto = {
        type: TransactionType.EXPENSE,
        amount: 50.5,
        description: 'Test Transaction',
        date: '2024-01-01',
        categoryId: testCategory.id,
        accountId: testAccount.id,
      };

      return request(app.getHttpServer())
        .post(`/ledgers/${testLedger.id}/transactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTransactionDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.amount).toBe(50.5);
          expect(res.body.data.description).toBe('Test Transaction');
          expect(res.body.data.type).toBe(TransactionType.EXPENSE);
        });
    });

    it('should return 400 for invalid data', () => {
      const invalidDto = {
        type: 'INVALID_TYPE',
        amount: -10, // 负数
        description: '',
        date: 'invalid-date',
      };

      return request(app.getHttpServer())
        .post(`/ledgers/${testLedger.id}/transactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });
});
```

## 10. 开发工具配置

### 10.1 ESLint配置

```json
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    '@nestjs/eslint-config',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

### 10.2 Prettier配置

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 80,
  "endOfLine": "lf"
}
```

这个完整的代码结构方案为家庭记账本的小程序和App后端提供了企业级的开发框架，包含了从基础架构到部署的所有必要组件。