import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async notifyMemberRemoved(
    ledgerId: string,
    removedUser: any,
    removedBy: string,
  ) {
    // 这里可以实现通知逻辑，比如发送邮件、推送通知等
    // 目前先留空，后续可以扩展
    console.log(`用户 ${removedUser.nickname} 已从账本 ${ledgerId} 中移除，操作者: ${removedBy}`);
  }

  async notifyMemberJoined(
    ledgerId: string,
    newUser: any,
  ) {
    // 通知账本成员有新成员加入
    console.log(`用户 ${newUser.nickname} 已加入账本 ${ledgerId}`);
  }

  async notifyInviteCodeUsed(
    ledgerId: string,
    inviteCode: string,
    usedBy: any,
  ) {
    // 通知邀请码被使用
    console.log(`邀请码 ${inviteCode} 已被用户 ${usedBy.nickname} 使用，加入账本 ${ledgerId}`);
  }
}