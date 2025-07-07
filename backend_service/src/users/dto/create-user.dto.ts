import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: '用户邮箱地址',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiPropertyOptional({
    description: '用户手机号',
    example: '13800138000',
    pattern: '^1[3-9]\\d{9}$',
  })
  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' })
  phone?: string;

  @ApiProperty({
    description: '用户密码',
    example: 'password123',
    minLength: 6,
    maxLength: 20,
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  @MaxLength(20, { message: '密码长度不能超过20位' })
  password: string;

  @ApiProperty({
    description: '用户昵称',
    example: '张三',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: '昵称必须是字符串' })
  @MinLength(1, { message: '昵称不能为空' })
  @MaxLength(50, { message: '昵称长度不能超过50位' })
  nickname: string;

  @ApiPropertyOptional({
    description: '用户头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString({ message: '头像必须是字符串' })
  avatar?: string;

  @ApiPropertyOptional({
    description: '用户状态',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: '用户状态值无效' })
  status?: UserStatus;
}