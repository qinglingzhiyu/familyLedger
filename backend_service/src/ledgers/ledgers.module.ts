import { Module } from '@nestjs/common';
import { LedgersController } from './ledgers.controller';
import { LedgersService } from './ledgers.service';
import { LedgerMemberService } from './services/ledger-member.service';
import { InviteCodeService } from './services/invite-code.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, UsersModule, NotificationsModule],
  controllers: [LedgersController],
  providers: [LedgersService, LedgerMemberService, InviteCodeService],
  exports: [LedgersService, LedgerMemberService],
})
export class LedgersModule {}