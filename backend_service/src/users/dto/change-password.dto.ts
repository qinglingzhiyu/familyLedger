import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: '当前密码',
    example: 'oldPassword123',
    minLength: 6,
    maxLength: 50,
  })
  @IsString({ message: '当前密码必须是字符串' })
  @IsNotEmpty({ message: '当前密码不能为空' })
  @MinLength(6, { message: '当前密码长度不能少于6位' })
  @MaxLength(50, { message: '当前密码长度不能超过50位' })
  currentPassword: string;

  @ApiProperty({
    description: '新密码',
    example: 'newPassword123',
    minLength: 6,
    maxLength: 50,
  })
  @IsString({ message: '新密码必须是字符串' })
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '新密码长度不能少于6位' })
  @MaxLength(50, { message: '新密码长度不能超过50位' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, {
    message: '新密码必须包含至少一个大写字母、一个小写字母和一个数字',
  })
  newPassword: string;

  @ApiProperty({
    description: '确认新密码',
    example: 'newPassword123',
    minLength: 6,
    maxLength: 50,
  })
  @IsString({ message: '确认密码必须是字符串' })
  @IsNotEmpty({ message: '确认密码不能为空' })
  @MinLength(6, { message: '确认密码长度不能少于6位' })
  @MaxLength(50, { message: '确认密码长度不能超过50位' })
  confirmPassword: string;
}