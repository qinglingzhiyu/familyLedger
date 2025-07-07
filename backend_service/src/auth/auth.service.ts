import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly smsCodeCache = new Map<string, { code: string; expires: Date; type: string }>();
  private readonly refreshTokenCache = new Map<string, { userId: string; expires: Date }>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    return await this.usersService.validateUser(email, password);
  }

  async login(user: UserEntity) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  // 小程序和移动端专用方法
  async mobileRegister(registerDto: RegisterDto) {
    const { phone, password, smsCode, nickname, avatar, inviteCode } = registerDto;

    // 验证短信验证码
    if (!this.verifySmsCodeInternal(phone, smsCode, 'register')) {
      throw new BadRequestException('验证码错误或已过期');
    }

    // 检查用户是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException('手机号已注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        nickname: nickname || `用户${phone.slice(-4)}`,
        avatar,
        status: 'ACTIVE',
      },
    });

    // 处理邀请码
    if (inviteCode) {
      await this.handleInviteCode(user.id, inviteCode);
    }

    // 生成令牌
    const tokens = await this.generateTokens(user);

    // 清除验证码
    this.smsCodeCache.delete(`${phone}:register`);

    return {
      success: true,
      message: '注册成功',
      data: {
        ...tokens,
        user: this.excludePassword(user),
      },
    };
  }

  async mobileLogin(loginDto: LoginDto) {
    const { phone, type, password, smsCode, deviceInfo, deviceId } = loginDto;

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('账户已被禁用');
    }

    // 验证登录方式
    if (type === 'password') {
      if (!password) {
        throw new BadRequestException('密码不能为空');
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('密码错误');
      }
    } else if (type === 'sms') {
      if (!smsCode) {
        throw new BadRequestException('验证码不能为空');
      }
      if (!this.verifySmsCodeInternal(phone, smsCode, 'login')) {
        throw new UnauthorizedException('验证码错误或已过期');
      }
      // 清除验证码
      this.smsCodeCache.delete(`${phone}:login`);
    }

    // 更新最后登录时间和设备信息
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        deviceInfo,
        deviceId,
      },
    });

    // 生成令牌
    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: '登录成功',
      data: {
        ...tokens,
        user: this.excludePassword(user),
      },
    };
  }

  async refresh(refreshToken: string) {
    const tokenData = this.refreshTokenCache.get(refreshToken);
    
    if (!tokenData || tokenData.expires < new Date()) {
      this.refreshTokenCache.delete(refreshToken);
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: tokenData.userId },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    // 删除旧的刷新令牌
    this.refreshTokenCache.delete(refreshToken);

    // 生成新的令牌
    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: '刷新成功',
      data: tokens,
    };
  }

  async logout(userId: string) {
    // 清除该用户的所有刷新令牌
    for (const [token, data] of this.refreshTokenCache.entries()) {
      if (data.userId === userId) {
        this.refreshTokenCache.delete(token);
      }
    }

    return {
      success: true,
      message: '登出成功',
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ledgerMembers: {
          include: {
            ledger: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      success: true,
      data: {
        user: this.excludePassword(user),
        ledgers: user.ledgerMembers.map(member => ({
          id: member.ledger.id,
          name: member.ledger.name,
          role: member.role,
        })),
      },
    };
  }

  async sendSmsCode(phone: string, type: 'register' | 'login' | 'reset') {
    // 检查发送频率（1分钟内只能发送一次）
    const cacheKey = `${phone}:${type}`;
    const existingCode = this.smsCodeCache.get(cacheKey);
    
    if (existingCode && existingCode.expires > new Date()) {
      const remainingTime = Math.ceil((existingCode.expires.getTime() - Date.now()) / 1000);
      throw new BadRequestException(`请等待${remainingTime}秒后再试`);
    }

    // 生成6位数字验证码
    const code = Math.random().toString().slice(2, 8);
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5分钟过期

    // 存储验证码
    this.smsCodeCache.set(cacheKey, { code, expires, type });

    // TODO: 集成真实的短信服务
    console.log(`发送短信验证码到 ${phone}: ${code}`);

    return {
      success: true,
      message: '验证码发送成功',
      data: {
        expires: expires.toISOString(),
      },
    };
  }

  async verifySmsCode(phone: string, code: string, type: string) {
    const isValid = this.verifySmsCodeInternal(phone, code, type);
    
    return {
      success: isValid,
      message: isValid ? '验证成功' : '验证码错误或已过期',
    };
  }

  async resetPassword(phone: string, code: string, newPassword: string) {
    // 验证短信验证码
    if (!this.verifySmsCodeInternal(phone, code, 'reset')) {
      throw new BadRequestException('验证码错误或已过期');
    }

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 清除验证码
    this.smsCodeCache.delete(`${phone}:reset`);

    // 清除该用户的所有刷新令牌
    await this.logout(user.id);

    return {
      success: true,
      message: '密码重置成功',
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证原密码
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('原密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message: '密码修改成功',
    };
  }

  async bindWechat(userId: string, code: string, encryptedData?: string, iv?: string) {
    // TODO: 实现微信绑定逻辑
    // 1. 通过code获取openid和session_key
    // 2. 如果有encryptedData和iv，解密获取用户信息
    // 3. 绑定到当前用户
    
    return {
      success: true,
      message: '微信绑定成功',
    };
  }

  async wechatLogin(code: string, encryptedData?: string, iv?: string) {
    // TODO: 实现微信登录逻辑
    // 1. 通过code获取openid和session_key
    // 2. 查找绑定的用户
    // 3. 如果没有绑定用户，创建新用户
    // 4. 返回登录令牌
    
    return {
      success: true,
      message: '微信登录成功',
      data: {
        // access_token: '',
        // refresh_token: '',
        // user: {},
      },
    };
  }

  // 私有方法
  private async generateTokens(user: User) {
    const payload = { sub: user.id, phone: user.phone };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '2h', // 访问令牌2小时过期
    });

    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天过期
    
    // 存储刷新令牌
    this.refreshTokenCache.set(refreshToken, {
      userId: user.id,
      expires: refreshExpires,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 7200, // 2小时
      token_type: 'Bearer',
    };
  }

  private verifySmsCodeInternal(phone: string, code: string, type: string): boolean {
    const cacheKey = `${phone}:${type}`;
    const storedData = this.smsCodeCache.get(cacheKey);
    
    if (!storedData) {
      return false;
    }

    if (storedData.expires < new Date()) {
      this.smsCodeCache.delete(cacheKey);
      return false;
    }

    return storedData.code === code;
  }

  private excludePassword(user: any) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async handleInviteCode(userId: string, inviteCode: string) {
    // TODO: 处理邀请码逻辑
    // 1. 验证邀请码是否有效
    // 2. 将用户加入对应的账本
    // 3. 给邀请人奖励等
    console.log(`处理邀请码: ${inviteCode} for user: ${userId}`);
  }
}