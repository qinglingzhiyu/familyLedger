import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: '手机号',
    example: '13800138000',
  })
  @IsPhoneNumber('CN', { message: '请输入有效的手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
    minLength: 6,
    maxLength: 20,
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  @MaxLength(20, { message: '密码长度不能超过20位' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiProperty({
    description: '短信验证码',
    example: '123456',
  })
  @IsString({ message: '验证码必须是字符串' })
  @IsNotEmpty({ message: '验证码不能为空' })
  smsCode: string;

  @ApiProperty({
    description: '用户昵称',
    example: '用户昵称',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @MaxLength(20, { message: '昵称长度不能超过20位' })
  nickname?: string;

  @ApiProperty({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;

  @ApiProperty({
    description: '邀请码',
    example: 'ABC12345',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '邀请码必须是字符串' })
  inviteCode?: string;
}