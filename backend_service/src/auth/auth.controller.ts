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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';

@ApiTags('认证管理')
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
}