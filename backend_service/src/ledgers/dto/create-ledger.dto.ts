import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLedgerDto {
  @ApiProperty({
    description: '账本名称',
    example: '家庭账本',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1, { message: '账本名称不能为空' })
  @MaxLength(50, { message: '账本名称不能超过50个字符' })
  name: string;

  @ApiPropertyOptional({
    description: '账本描述',
    example: '记录家庭日常收支',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '账本描述不能超过200个字符' })
  description?: string;

  @ApiPropertyOptional({
    description: '货币类型',
    example: 'CNY',
    default: 'CNY',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: '账本图标',
    example: 'wallet',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: '账本颜色',
    example: '#4CAF50',
  })
  @IsOptional()
  @IsString()
  color?: string;
}