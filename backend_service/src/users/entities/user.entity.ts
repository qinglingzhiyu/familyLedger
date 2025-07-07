import { User, UserStatus } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserEntity implements User {
  @ApiProperty({
    description: '用户唯一标识符',
    example: 'clxxxxx',
  })
  id: string;

  @ApiProperty({
    description: '用户邮箱地址',
    example: 'user@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: '用户手机号',
    example: '13800138000',
  })
  phone: string | null;

  @ApiProperty({
    description: '用户昵称',
    example: '张三',
  })
  nickname: string;

  @ApiPropertyOptional({
    description: '用户头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatar: string | null;

  @ApiProperty({
    description: '用户状态',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}