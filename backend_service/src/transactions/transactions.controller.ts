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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LedgerAccessGuard } from '../common/guards/ledger-access.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentLedgerMember } from '../common/decorators/current-ledger-member.decorator';
import { User, LedgerMember } from '@prisma/client';

@ApiTags('交易管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, LedgerAccessGuard)
@Controller('ledgers/:ledgerId/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: '创建交易记录' })
  @ApiResponse({ status: 201, description: '交易记录创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '无权限访问该账本' })
  async create(
    @Param('ledgerId') ledgerId: string,
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: User,
    @CurrentLedgerMember() member: LedgerMember,
  ) {
    return this.transactionsService.create(
      ledgerId,
      user.id,
      createTransactionDto,
    );
  }

  @Get()
  @ApiOperation({ summary: '获取交易记录列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'type', required: false, description: '交易类型', enum: ['INCOME', 'EXPENSE'] })
  @ApiQuery({ name: 'categoryId', required: false, description: '分类ID' })
  @ApiQuery({ name: 'accountId', required: false, description: '账户ID' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期', example: '2024-12-31' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: 'INCOME' | 'EXPENSE',
    @Query('categoryId') categoryId?: string,
    @Query('accountId') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('keyword') keyword?: string,
  ) {
    const pageNum = parseInt(page || '1') || 1;
    const limitNum = parseInt(limit || '20') || 20;

    return this.transactionsService.findAll(ledgerId, {
      page: pageNum,
      limit: limitNum,
      type,
      categoryId,
      accountId,
      startDate,
      endDate,
      keyword,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: '获取交易汇总统计' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'groupBy', required: false, description: '分组方式', enum: ['day', 'week', 'month', 'year'] })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSummary(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month' | 'year',
  ) {
    return this.transactionsService.getSummary(ledgerId, {
      startDate,
      endDate,
      groupBy,
    });
  }

  @Get('categories/statistics')
  @ApiOperation({ summary: '获取分类统计' })
  @ApiQuery({ name: 'type', required: false, description: '交易类型', enum: ['INCOME', 'EXPENSE'] })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCategoryStatistics(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Query('type') type?: 'INCOME' | 'EXPENSE',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.getCategoryStatistics(ledgerId, {
      type,
      startDate,
      endDate,
    });
  }

  @Get('accounts/statistics')
  @ApiOperation({ summary: '获取账户统计' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAccountStatistics(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.getAccountStatistics(ledgerId, {
      startDate,
      endDate,
    });
  }

  @Get('trends')
  @ApiOperation({ summary: '获取趋势分析' })
  @ApiQuery({ name: 'period', required: false, description: '时间周期', enum: ['week', 'month', 'quarter', 'year'] })
  @ApiQuery({ name: 'type', required: false, description: '交易类型', enum: ['INCOME', 'EXPENSE'] })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTrends(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Query('period') period?: 'week' | 'month' | 'quarter' | 'year',
    @Query('type') type?: 'INCOME' | 'EXPENSE',
  ) {
    return this.transactionsService.getTrends(ledgerId, {
      period: period || 'month',
      type,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取交易记录详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '交易记录不存在' })
  async findOne(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.transactionsService.findOne(ledgerId, id);
  }

  @Post(':id/update')
  @ApiOperation({ summary: '更新交易记录' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '交易记录不存在' })
  @ApiResponse({ status: 403, description: '无权限修改该交易记录' })
  async update(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() user: User,
  ) {
    return this.transactionsService.update(
      ledgerId,
      id,
      user.id,
      updateTransactionDto,
    );
  }

  @Post(':id/delete')
  @ApiOperation({ summary: '删除交易记录（软删除）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '交易记录不存在' })
  @ApiResponse({ status: 403, description: '无权限删除该交易记录' })
  async remove(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.transactionsService.remove(ledgerId, id, user.id);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量创建交易记录' })
  @ApiResponse({ status: 201, description: '批量创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createBatch(
    @Param('ledgerId') ledgerId: string,
    @Body() createTransactionDtos: CreateTransactionDto[],
    @CurrentUser() user: User,
  ) {
    return this.transactionsService.createBatch(
      ledgerId,
      user.id,
      createTransactionDtos,
    );
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除交易记录（软删除）' })
  @ApiResponse({ status: 200, description: '批量删除成功' })
  async removeBatch(
    @Param('ledgerId') ledgerId: string,
    @Body() ids: string[],
    @CurrentUser() user: User,
  ) {
    return this.transactionsService.removeBatch(ledgerId, ids, user.id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: '复制交易记录' })
  @ApiResponse({ status: 201, description: '复制成功' })
  @ApiResponse({ status: 404, description: '原交易记录不存在' })
  async duplicate(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.transactionsService.duplicate(ledgerId, id, user.id);
  }
}