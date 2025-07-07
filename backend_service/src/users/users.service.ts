import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserSettingsDto } from './dto/user-settings.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    // 检查邮箱是否已存在
    const existingUser = await this.prisma.user.findFirst({
      where: { email: createUserDto.email, deletedAt: null },
    });

    if (existingUser) {
      throw new ConflictException('邮箱已被注册');
    }

    // 检查手机号是否已存在（如果提供了手机号）
    if (createUserDto.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: createUserDto.phone, deletedAt: null },
      });

      if (existingPhone) {
        throw new ConflictException('手机号已被注册');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    return new UserEntity(user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null }, // 只查询未删除的用户
      orderBy: { createdAt: 'desc' },
    });
    return users.map(user => new UserEntity(user));
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null }, // 只查询未删除的用户
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return new UserEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null }, // 只查询未删除的用户
    });

    return user ? new UserEntity(user) : null;
  }

  async findByEmailWithPassword(email: string) {
    return await this.prisma.user.findFirst({
      where: { email, deletedAt: null }, // 只查询未删除的用户
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    // 检查用户是否存在
    const existingUser = await this.prisma.user.findFirst({
      where: { id, deletedAt: null }, // 只查询未删除的用户
    });

    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    // 如果更新邮箱，检查是否已被其他用户使用
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: { email: updateUserDto.email, deletedAt: null },
      });

      if (emailExists) {
        throw new ConflictException('邮箱已被其他用户使用');
      }
    }

    // 如果更新手机号，检查是否已被其他用户使用
    if (updateUserDto.phone && updateUserDto.phone !== existingUser.phone) {
      const phoneExists = await this.prisma.user.findFirst({
        where: { phone: updateUserDto.phone, deletedAt: null },
      });

      if (phoneExists) {
        throw new ConflictException('手机号已被其他用户使用');
      }
    }

    // 如果更新密码，进行加密
    const updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return new UserEntity(user);
  }

  async remove(id: string): Promise<UserEntity> {
    // 检查用户是否存在且未被删除
    const existingUser = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    // 软删除：设置deletedAt时间戳
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return new UserEntity(user);
  }

  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.findByEmailWithPassword(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      return new UserEntity(user);
    }
    
    return null;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // 检查新密码和确认密码是否一致
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('新密码和确认密码不一致');
    }

    // 获取用户信息（包含密码）
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('当前密码不正确');
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('新密码不能与当前密码相同');
    }

    // 加密新密码并更新
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }

  async updateSettings(userId: string, settingsDto: UserSettingsDto): Promise<UserEntity> {
    // 检查用户是否存在
    const existingUser = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    // 更新用户设置
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        language: settingsDto.language,
        currency: settingsDto.currency,
        theme: settingsDto.theme,
        timezone: settingsDto.timezone,
        emailNotifications: settingsDto.emailNotifications,
        pushNotifications: settingsDto.pushNotifications,
        smsNotifications: settingsDto.smsNotifications,
        twoFactorEnabled: settingsDto.twoFactorEnabled,
        biometricEnabled: settingsDto.biometricEnabled,
        autoLockTime: settingsDto.autoLockTime,
      },
    });

    return new UserEntity(user);
  }

  async getUserSettings(userId: string): Promise<UserSettingsDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        language: true,
        currency: true,
        theme: true,
        timezone: true,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: true,
        twoFactorEnabled: true,
        biometricEnabled: true,
        autoLockTime: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user as UserSettingsDto;
  }

  async getUserStatistics(userId: string): Promise<{
    totalLedgers: number;
    totalTransactions: number;
    totalAccounts: number;
    totalCategories: number;
    recentActivity: any[];
  }> {
    // 检查用户是否存在
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 获取用户参与的账本数量
    const totalLedgers = await this.prisma.ledgerMember.count({
      where: { userId },
    });

    // 获取用户创建的交易数量
    const totalTransactions = await this.prisma.transaction.count({
      where: { createdBy: userId },
    });

    // 获取用户创建的账户数量
    const totalAccounts = await this.prisma.account.count({
      where: { createdBy: userId },
    });

    // 获取用户创建的分类数量
    const totalCategories = await this.prisma.category.count({
      where: { createdBy: userId },
    });

    // 获取最近活动（最近10条交易）
    const recentActivity = await this.prisma.transaction.findMany({
      where: { createdBy: userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true } },
        ledger: { select: { name: true } },
      },
    });

    return {
      totalLedgers,
      totalTransactions,
      totalAccounts,
      totalCategories,
      recentActivity,
    };
  }

  async exportUserData(userId: string): Promise<any> {
    // 检查用户是否存在
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 导出用户数据
    const userData = await this.prisma.user.findFirst({
      where: { id: userId },
      include: {
        ledgerMembers: {
          include: {
            ledger: {
              include: {
                accounts: true,
                categories: true,
                transactions: {
                  where: { createdBy: userId },
                },
              },
            },
          },
        },
      },
    });

    // 移除敏感信息
    const { password, ...safeUserData } = userData;
    
    return {
      exportDate: new Date().toISOString(),
      user: safeUserData,
    };
  }

  async searchUsers(query: string, currentUserId: string): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { deletedAt: null },
          { id: { not: currentUserId } }, // 排除当前用户
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { nickname: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      take: 20, // 限制返回结果数量
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => new UserEntity(user));
  }
}