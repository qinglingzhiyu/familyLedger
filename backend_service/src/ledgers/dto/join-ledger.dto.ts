import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinLedgerDto {
  @ApiProperty({
    description: '邀请码',
    example: 'ABC12345',
    minLength: 8,
    maxLength: 8,
    pattern: '^[A-Z0-9]{8}$',
  })
  @IsString()
  @Length(8, 8, { message: '邀请码必须是8位字符' })
  @Matches(/^[A-Z0-9]{8}$/, {
    message: '邀请码格式不正确，只能包含大写字母和数字',
  })
  code: string;
}