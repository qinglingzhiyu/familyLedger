import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';

enum LoginType {
  PASSWORD = 'password',
  SMS = 'sms',
}

export class LoginDto {
  @ApiProperty({
    description: '手机号',
    example: '13800138000',
  })
  @IsPhoneNumber('CN', { message: '请输入有效的手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @ApiProperty({
    description: '登录类型',
    enum: LoginType,
    example: LoginType.PASSWORD,
    default: LoginType.PASSWORD,
  })
  @IsEnum(LoginType, { message: '登录类型无效' })
  @IsOptional()
  type?: LoginType = LoginType.PASSWORD;

  @ApiProperty({
    description: '密码（密码登录时必填）',
    example: 'password123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '密码必须是字符串' })
  password?: string;

  @ApiProperty({
    description: '短信验证码（短信登录时必填）',
    example: '123456',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '验证码必须是字符串' })
  smsCode?: string;

  @ApiProperty({
    description: '设备信息',
    example: 'iPhone 15 Pro',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '设备信息必须是字符串' })
  deviceInfo?: string;

  @ApiProperty({
    description: '设备ID',
    example: 'device-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '设备ID必须是字符串' })
  deviceId?: string;
}