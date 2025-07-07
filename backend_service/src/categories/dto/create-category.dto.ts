import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsHexColor,
  IsUUID,
} from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({
    description: '分类名称',
    example: '餐饮',
    maxLength: 50,
  })
  @IsString({ message: '分类名称必须是字符串' })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @MaxLength(50, { message: '分类名称不能超过50个字符' })
  name: string;

  @ApiProperty({
    description: '分类类型',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsEnum(TransactionType, { message: '分类类型无效' })
  type: TransactionType;

  @ApiProperty({
    description: '父分类ID',
    example: 'clxxxxx',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: '父分类ID格式无效' })
  parentId?: string;

  @ApiProperty({
    description: '分类描述',
    example: '日常用餐支出',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  @MaxLength(200, { message: '分类描述不能超过200个字符' })
  description?: string;

  @ApiProperty({
    description: '分类图标',
    example: 'restaurant',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '分类图标必须是字符串' })
  icon?: string;

  @ApiProperty({
    description: '分类颜色',
    example: '#ff4d4f',
    required: false,
  })
  @IsOptional()
  @IsHexColor({ message: '分类颜色必须是有效的十六进制颜色值' })
  color?: string;

  @ApiProperty({
    description: '排序顺序',
    example: 1,
    required: false,
    minimum: 0,
    maximum: 999,
  })
  @IsOptional()
  @IsNumber({}, { message: '排序顺序必须是数字' })
  @Min(0, { message: '排序顺序不能小于0' })
  @Max(999, { message: '排序顺序不能大于999' })
  sortOrder?: number;

  @ApiProperty({
    description: '是否启用',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: '分类备注',
    example: '包含早餐、午餐、晚餐等',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '分类备注必须是字符串' })
  @MaxLength(500, { message: '分类备注不能超过500个字符' })
  notes?: string;

  @ApiProperty({
    description: '预算金额',
    example: 1000.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '预算金额最多保留2位小数' })
  @Min(0, { message: '预算金额不能为负数' })
  budgetAmount?: number;

  @ApiProperty({
    description: '预算周期（月/年）',
    example: 'MONTHLY',
    enum: ['MONTHLY', 'YEARLY'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['MONTHLY', 'YEARLY'], { message: '预算周期无效' })
  budgetPeriod?: 'MONTHLY' | 'YEARLY';
}