import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @ApiProperty({
    description: '新角色',
    enum: [MemberRole.ADMIN, MemberRole.MEMBER],
    example: MemberRole.ADMIN,
  })
  @IsEnum([MemberRole.ADMIN, MemberRole.MEMBER], {
    message: '角色只能是管理员或普通成员',
  })
  role: 'ADMIN' | 'MEMBER';
}