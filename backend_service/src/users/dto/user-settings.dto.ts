import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsTimeZone,
} from 'class-validator';

export enum Language {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
  JA_JP = 'ja-JP',
  KO_KR = 'ko-KR',
}

export enum Currency {
  CNY = 'CNY',
  USD = 'USD',
  EUR = 'EUR',
  JPY = 'JPY',
  KRW = 'KRW',
  GBP = 'GBP',
  HKD = 'HKD',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export class UserSettingsDto {
  @ApiProperty({
    description: '语言设置',
    enum: Language,
    example: Language.ZH_CN,
    required: false,
  })
  @IsOptional()
  @IsEnum(Language, { message: '语言设置必须是有效的语言代码' })
  language?: Language;

  @ApiProperty({
    description: '默认货币',
    enum: Currency,
    example: Currency.CNY,
    required: false,
  })
  @IsOptional()
  @IsEnum(Currency, { message: '货币设置必须是有效的货币代码' })
  currency?: Currency;

  @ApiProperty({
    description: '主题设置',
    enum: Theme,
    example: Theme.LIGHT,
    required: false,
  })
  @IsOptional()
  @IsEnum(Theme, { message: '主题设置必须是有效的主题选项' })
  theme?: Theme;

  @ApiProperty({
    description: '时区',
    example: 'Asia/Shanghai',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '时区必须是字符串' })
  @IsTimeZone({ message: '时区格式不正确' })
  timezone?: string;

  @ApiProperty({
    description: '是否启用邮件通知',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '邮件通知设置必须是布尔值' })
  emailNotifications?: boolean;

  @ApiProperty({
    description: '是否启用推送通知',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '推送通知设置必须是布尔值' })
  pushNotifications?: boolean;

  @ApiProperty({
    description: '是否启用短信通知',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '短信通知设置必须是布尔值' })
  smsNotifications?: boolean;

  @ApiProperty({
    description: '是否启用双因子认证',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '双因子认证设置必须是布尔值' })
  twoFactorEnabled?: boolean;

  @ApiProperty({
    description: '是否启用生物识别登录',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '生物识别设置必须是布尔值' })
  biometricEnabled?: boolean;

  @ApiProperty({
    description: '自动锁定时间（分钟）',
    example: 15,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '自动锁定时间必须是字符串' })
  autoLockTime?: string;
}