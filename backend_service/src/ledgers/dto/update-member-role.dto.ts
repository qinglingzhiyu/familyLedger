import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LedgerRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @ApiProperty({
    description: '新角色',
    enum: [LedgerRole.ADMIN, LedgerRole.MEMBER],
    example: LedgerRole.ADMIN,
  })
  @IsEnum([LedgerRole.ADMIN, LedgerRole.MEMBER], {
    message: '角色只能是管理员或普通成员',
  })
  role: LedgerRole.ADMIN | LedgerRole.MEMBER;
}