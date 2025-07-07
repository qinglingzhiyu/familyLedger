import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@ApiTags('用户管理')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建用户', description: '创建新用户账户' })
  @ApiResponse({ status: 201, description: '用户创建成功', type: UserEntity })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '邮箱或手机号已存在' })
  async create(@Body() createUserDto: CreateUserDto): Promise<{
    success: boolean;
    message: string;
    data: UserEntity;
  }> {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      message: '用户创建成功',
      data: user,
    };
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表', description: '获取所有用户信息列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [UserEntity] })
  async findAll(): Promise<{
    success: boolean;
    message: string;
    data: UserEntity[];
  }> {
    const users = await this.usersService.findAll();
    return {
      success: true,
      message: '获取用户列表成功',
      data: users,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情', description: '根据用户ID获取用户详细信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: UserEntity })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
    data: UserEntity;
  }> {
    const user = await this.usersService.findOne(id);
    return {
      success: true,
      message: '获取用户信息成功',
      data: user,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息', description: '更新指定用户的信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: UserEntity })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 409, description: '邮箱或手机号已存在' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: UserEntity;
  }> {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      success: true,
      message: '用户信息更新成功',
      data: user,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除用户', description: '删除指定的用户账户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
    data: UserEntity;
  }> {
    const user = await this.usersService.remove(id);
    return {
      success: true,
      message: '用户删除成功',
      data: user,
    };
  }
}