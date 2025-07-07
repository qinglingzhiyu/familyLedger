import {
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsUUID,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({
    description: '交易类型',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsEnum(TransactionType, { message: '交易类型必须是收入或支出' })
  type: TransactionType;

  @ApiProperty({
    description: '交易金额',
    example: 100.50,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '金额最多保留2位小数' })
  @Min(0.01, { message: '金额必须大于0' })
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiProperty({
    description: '交易描述',
    example: '午餐费用',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200, { message: '描述不能超过200个字符' })
  description: string;

  @ApiProperty({
    description: '交易日期',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsDateString({}, { message: '日期格式不正确' })
  date: string;

  @ApiProperty({
    description: '账户ID',
    example: 'uuid-account-id',
  })
  @IsUUID(4, { message: '账户ID格式不正确' })
  accountId: string;

  @ApiProperty({
    description: '分类ID',
    example: 'uuid-category-id',
  })
  @IsUUID(4, { message: '分类ID格式不正确' })
  categoryId: string;

  @ApiPropertyOptional({
    description: '备注信息',
    example: '和朋友一起吃饭',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '备注不能超过500个字符' })
  notes?: string;

  @ApiPropertyOptional({
    description: '标签',
    example: ['餐饮', '朋友聚餐'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: '附件URL列表',
    example: ['https://example.com/receipt1.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  attachments?: string[];
}