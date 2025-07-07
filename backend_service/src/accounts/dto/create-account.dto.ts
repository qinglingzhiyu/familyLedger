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
} from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({
    description: '账户名称',
    example: '招商银行储蓄卡',
    maxLength: 50,
  })
  @IsString({ message: '账户名称必须是字符串' })
  @IsNotEmpty({ message: '账户名称不能为空' })
  @MaxLength(50, { message: '账户名称不能超过50个字符' })
  name: string;

  @ApiProperty({
    description: '账户类型',
    enum: AccountType,
    example: AccountType.BANK,
  })
  @IsEnum(AccountType, { message: '账户类型无效' })
  type: AccountType;

  @ApiProperty({
    description: '账户描述',
    example: '日常消费使用的银行卡',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: '账户描述必须是字符串' })
  @MaxLength(200, { message: '账户描述不能超过200个字符' })
  description?: string;

  @ApiProperty({
    description: '初始余额',
    example: 1000.00,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '初始余额最多保留2位小数' })
  @Min(0, { message: '初始余额不能为负数' })
  initialBalance?: number;

  @ApiProperty({
    description: '账户图标',
    example: 'bank',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '账户图标必须是字符串' })
  icon?: string;

  @ApiProperty({
    description: '账户颜色',
    example: '#1890ff',
    required: false,
  })
  @IsOptional()
  @IsHexColor({ message: '账户颜色必须是有效的十六进制颜色值' })
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
    description: '是否在统计中包含',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  includeInTotal?: boolean;

  @ApiProperty({
    description: '账户备注',
    example: '主要用于日常开销',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '账户备注必须是字符串' })
  @MaxLength(500, { message: '账户备注不能超过500个字符' })
  notes?: string;
}