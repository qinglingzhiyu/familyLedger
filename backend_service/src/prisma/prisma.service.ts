import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('数据库连接成功');
    } catch (error) {
      this.logger.warn('数据库连接失败，应用将在无数据库模式下启动');
      this.logger.warn('请检查数据库配置和连接信息');
      console.warn('Database connection failed:', error.message);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      this.logger.warn('数据库断开连接时出错:', error.message);
    }
  }
}