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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LedgerAccessGuard } from '../common/guards/ledger-access.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('分类管理')
@Controller('ledgers/:ledgerId/categories')
@UseGuards(JwtAuthGuard, LedgerAccessGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: '创建分类' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async create(
    @Param('ledgerId') ledgerId: string,
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.create(ledgerId, createCategoryDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取分类列表' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiQuery({ name: 'type', required: false, description: '分类类型筛选' })
  @ApiQuery({ name: 'parentId', required: false, description: '父分类ID' })
  @ApiQuery({ name: 'includeStats', required: false, description: '是否包含统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Param('ledgerId') ledgerId: string,
    @Query('type') type?: string,
    @Query('parentId') parentId?: string,
    @Query('includeStats') includeStats?: boolean,
  ) {
    return this.categoriesService.findAll(ledgerId, {
      type,
      parentId,
      includeStats,
    });
  }

  @Get('tree')
  @ApiOperation({ summary: '获取分类树形结构' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiQuery({ name: 'type', required: false, description: '分类类型筛选' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTree(
    @Param('ledgerId') ledgerId: string,
    @Query('type') type?: string,
  ) {
    return this.categoriesService.getTree(ledgerId, type);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取分类统计信息' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'type', required: false, description: '分类类型' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics(
    @Param('ledgerId') ledgerId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    return this.categoriesService.getStatistics(ledgerId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async findOne(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
  ) {
    return this.categoriesService.findOne(ledgerId, id);
  }

  @Post(':id/update')
  @ApiOperation({ summary: '更新分类信息' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async update(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.update(ledgerId, id, updateCategoryDto, user.id);
  }

  @Post(':id/delete')
  @ApiOperation({ summary: '删除分类（软删除）' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async remove(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.remove(ledgerId, id, user.id);
  }

  @Post(':id/move')
  @ApiOperation({ summary: '移动分类' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '移动成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async move(
    @Param('ledgerId') ledgerId: string,
    @Param('id') id: string,
    @Body() moveDto: {
      parentId?: string;
      sortOrder?: number;
    },
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.move(
      ledgerId,
      id,
      moveDto.parentId,
      moveDto.sortOrder,
      user.id,
    );
  }

  @Post('batch')
  @ApiOperation({ summary: '批量创建分类' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async batchCreate(
    @Param('ledgerId') ledgerId: string,
    @Body() batchDto: { categories: CreateCategoryDto[] },
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.batchCreate(ledgerId, batchDto.categories, user.id);
  }

  @Post('import-default')
  @ApiOperation({ summary: '导入默认分类' })
  @ApiParam({ name: 'ledgerId', description: '账本ID' })
  @ApiResponse({ status: 201, description: '导入成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async importDefault(
    @Param('ledgerId') ledgerId: string,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.importDefault(ledgerId, user.id);
  }
}