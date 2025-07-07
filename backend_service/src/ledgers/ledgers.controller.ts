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
  HttpCode,
  HttpStatus,
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
import { User } from '../users/entities/user.entity';
import { ApiResponseDecorator } from '../common/decorators/api-response.decorator';

@ApiTags('账本管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ledgers')
export class LedgersController {
  constructor(private readonly ledgersService: LedgersService) {}

  @ApiOperation({ summary: '获取用户账本列表' })
  @ApiResponseDecorator({
    status: 200,
    description: '获取成功',
    type: 'array',
  })
  @Get()
  async findUserLedgers(@CurrentUser() user: User) {
    return this.ledgersService.findUserLedgers(user.id);
  }

  @ApiOperation({ summary: '创建账本' })
  @ApiResponseDecorator({
    status: 201,
    description: '创建成功',
  })
  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createLedgerDto: CreateLedgerDto,
  ) {
    return this.ledgersService.create(user.id, createLedgerDto);
  }

  @ApiOperation({ summary: '获取账本详情' })
  @ApiResponseDecorator({
    status: 200,
    description: '获取成功',
  })
  @UseGuards(LedgerAccessGuard)
  @Get(':ledgerId')
  async findOne(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
  ) {
    return this.ledgersService.findOne(ledgerId, user.id);
  }

  @ApiOperation({ summary: '更新账本信息' })
  @ApiResponseDecorator({
    status: 200,
    description: '更新成功',
  })
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
  @ApiResponseDecorator({
    status: 200,
    description: '邀请成功',
  })
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
  @ApiResponseDecorator({
    status: 200,
    description: '加入成功',
  })
  @HttpCode(HttpStatus.OK)
  @Post('join')
  async joinLedger(
    @CurrentUser() user: User,
    @Body() joinLedgerDto: JoinLedgerDto,
  ) {
    return this.ledgersService.joinLedger(joinLedgerDto.code, user.id);
  }

  @ApiOperation({ summary: '获取账本成员列表' })
  @ApiResponseDecorator({
    status: 200,
    description: '获取成功',
    type: 'array',
  })
  @UseGuards(LedgerAccessGuard)
  @Get(':ledgerId/members')
  async getMembers(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
  ) {
    return this.ledgersService.getMembers(ledgerId, user.id);
  }

  @ApiOperation({ summary: '移除成员' })
  @ApiResponseDecorator({
    status: 200,
    description: '移除成功',
  })
  @UseGuards(LedgerAccessGuard)
  @Delete(':ledgerId/members/:memberId')
  async removeMember(
    @Param('ledgerId') ledgerId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
  ) {
    return this.ledgersService.removeMember(ledgerId, memberId, user.id);
  }

  @ApiOperation({ summary: '删除账本' })
  @ApiResponseDecorator({
    status: 200,
    description: '删除成功',
  })
  @UseGuards(LedgerAccessGuard)
  @Delete(':ledgerId')
  async remove(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
  ) {
    return this.ledgersService.remove(ledgerId, user.id);
  }

  @ApiOperation({ summary: '获取账本统计信息' })
  @ApiResponseDecorator({
    status: 200,
    description: '获取成功',
  })
  @UseGuards(LedgerAccessGuard)
  @Get(':ledgerId/statistics')
  async getStatistics(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ledgersService.getStatistics(ledgerId, user.id, {
      startDate,
      endDate,
    });
  }
}