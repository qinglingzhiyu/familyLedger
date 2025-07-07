import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LedgerAccessGuard } from '../common/guards/ledger-access.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('账户管理')
@Controller('ledgers/:ledgerId/accounts')
@UseGuards(JwtAuthGuard, LedgerAccessGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: '创建账户' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async create(
    @Param('ledgerId') ledgerId: string,
    @Body() createAccountDto: CreateAccountDto,
    @CurrentUser() user: User,
  ) {
    return this.accountsService.create(ledgerId, createAccountDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取账户列表' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiQuery({ name: 'type', required: false, description: '账户类型筛选' })
  @ApiQuery({ name: 'includeBalance', required: false, description: '是否包含余额信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Param('ledgerId') ledgerId: string,
    @Query('type') type?: string,
    @Query('includeBalance') includeBalance?: boolean,
  ) {
    return this.accountsService.findAll(ledgerId, { type, includeBalance });
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取账户统计信息' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics(@Param('ledgerId') ledgerId: string) {
    return this.accountsService.getStatistics(ledgerId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取账户详情' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiParam({ name: 'id', description: '账户ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '账户不存在' })
  async findOne(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
  ) {
    return this.accountsService.findOne(ledgerId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新账户信息' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiParam({ name: 'id', description: '账户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '账户不存在' })
  async update(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @CurrentUser() user: User,
  ) {
    return this.accountsService.update(ledgerId, id, updateAccountDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除账户' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiParam({ name: 'id', description: '账户ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '账户不存在' })
  @ApiResponse({ status: 409, description: '账户有关联交易，无法删除' })
  async remove(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.accountsService.remove(ledgerId, id, user.id);
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: '账户间转账' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiParam({ name: 'id', description: '转出账户ID' })
  @ApiResponse({ status: 201, description: '转账成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async transfer(
    @Param('ledgerId') ledgerId: string,
    @Param('id') fromAccountId: string,
    @Body() transferDto: {
      toAccountId: string;
      amount: number;
      description?: string;
      notes?: string;
    },
    @CurrentUser() user: User,
  ) {
    return this.accountsService.transfer(
      ledgerId,
      fromAccountId,
      transferDto.toAccountId,
      transferDto.amount,
      transferDto.description,
      transferDto.notes,
      user.id,
    );
  }

  @Post(':id/adjust-balance')
  @ApiOperation({ summary: '调整账户余额' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiParam({ name: 'id', description: '账户ID' })
  @ApiResponse({ status: 201, description: '调整成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async adjustBalance(
    @Param('ledgerId') ledgerId: string,
    @Param('id') accountId: string,
    @Body() adjustDto: {
      amount: number;
      reason: string;
      notes?: string;
    },
    @CurrentUser() user: User,
  ) {
    return this.accountsService.adjustBalance(
      ledgerId,
      accountId,
      adjustDto.amount,
      adjustDto.reason,
      adjustDto.notes,
      user.id,
    );
  }
}