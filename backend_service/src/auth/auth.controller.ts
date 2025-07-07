import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('用户认证')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录', description: '用户邮箱密码登录' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: '登录成功', schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: '登录成功' },
      data: {
        type: 'object',
        properties: {
          access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clxxxxx' },
              email: { type: 'string', example: 'user@example.com' },
              nickname: { type: 'string', example: '用户昵称' },
              phone: { type: 'string', example: '13800138000' },
              avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
              status: { type: 'string', example: 'ACTIVE' },
              createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
            }
          }
        }
      }
    }
  }})
  @ApiResponse({ status: 401, description: '邮箱或密码错误' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async login(@Request() req, @Body() loginUserDto: LoginUserDto) {
    const result = await this.authService.login(req.user);
    return {
      success: true,
      message: '登录成功',
      data: result,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '用户注册', description: '创建新用户账户' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: '注册成功', schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: '注册成功' },
      data: {
        type: 'object',
        properties: {
          access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clxxxxx' },
              email: { type: 'string', example: 'user@example.com' },
              nickname: { type: 'string', example: '用户昵称' },
              phone: { type: 'string', example: '13800138000' },
              avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
              status: { type: 'string', example: 'ACTIVE' },
              createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
            }
          }
        }
      }
    }
  }})
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '邮箱或手机号已存在' })
  async register(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.register(createUserDto);
    return {
      success: true,
      message: '注册成功',
      data: result,
    };
  }

  // 小程序和移动端专用接口
  @Post('mobile/register')
  @ApiOperation({ summary: '手机号注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '用户已存在' })
  async mobileRegister(@Body() registerDto: RegisterDto) {
    return this.authService.mobileRegister(registerDto);
  }

  @Post('mobile/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '手机号登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '手机号或密码错误' })
  async mobileLogin(@Body() loginDto: LoginDto) {
    return this.authService.mobileLogin(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '刷新令牌无效' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  @Post('verify-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证访问令牌' })
  @ApiResponse({ status: 200, description: '令牌有效' })
  @ApiResponse({ status: 401, description: '令牌无效' })
  async verifyToken(@CurrentUser() user: User) {
    return {
      valid: true,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  @Post('send-sms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送短信验证码' })
  @ApiResponse({ status: 200, description: '发送成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 429, description: '发送频率过高' })
  async sendSms(@Body() body: { phone: string; type: 'register' | 'login' | 'reset' }) {
    return this.authService.sendSmsCode(body.phone, body.type);
  }

  @Post('verify-sms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证短信验证码' })
  @ApiResponse({ status: 200, description: '验证成功' })
  @ApiResponse({ status: 400, description: '验证码错误或已过期' })
  async verifySms(@Body() body: { phone: string; code: string; type: string }) {
    return this.authService.verifySmsCode(body.phone, body.code, body.type);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重置密码' })
  @ApiResponse({ status: 200, description: '重置成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async resetPassword(
    @Body() body: { phone: string; code: string; newPassword: string },
  ) {
    return this.authService.resetPassword(body.phone, body.code, body.newPassword);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  @ApiResponse({ status: 400, description: '原密码错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(user.id, body.oldPassword, body.newPassword);
  }

  @Post('bind-wechat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '绑定微信' })
  @ApiResponse({ status: 200, description: '绑定成功' })
  @ApiResponse({ status: 400, description: '绑定失败' })
  async bindWechat(
    @CurrentUser() user: User,
    @Body() body: { code: string; encryptedData?: string; iv?: string },
  ) {
    return this.authService.bindWechat(user.id, body.code, body.encryptedData, body.iv);
  }

  @Post('wechat-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 400, description: '登录失败' })
  async wechatLogin(
    @Body() body: { code: string; encryptedData?: string; iv?: string },
  ) {
    return this.authService.wechatLogin(body.code, body.encryptedData, body.iv);
  }
}