import { IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { Transform } from 'class-transformer';

export class InviteMemberDto {
  @ApiPropertyOptional({
    description: '邀请角色',
    enum: MemberRole,
    default: MemberRole.MEMBER,
    example: MemberRole.MEMBER,
  })
  @IsOptional()
  @IsEnum(MemberRole, { message: '无效的角色类型' })
  role?: MemberRole;

  @ApiPropertyOptional({
    description: '邀请码有效期（毫秒）',
    example: 604800000, // 7天
    minimum: 3600000, // 1小时
    maximum: 2592000000, // 30天
    default: 604800000,
  })
  @IsOptional()
  @IsNumber({}, { message: '有效期必须是数字' })
  @Transform(({ value }) => parseInt(value))
  @Min(3600000, { message: '有效期不能少于1小时' })
  @Max(2592000000, { message: '有效期不能超过30天' })
  expiresIn?: number;
}