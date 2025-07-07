import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
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
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserSettingsDto } from './dto/user-settings.dto';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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

  @Post(':id/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除用户', description: '软删除指定的用户账户' })
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

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码', description: '用户修改登录密码' })
  @ApiResponse({ status: 200, description: '密码修改成功' })
  @ApiResponse({ status: 400, description: '请求参数错误或当前密码不正确' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    await this.usersService.changePassword(user.id, changePasswordDto);
    return {
      success: true,
      message: '密码修改成功',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息', description: '获取当前登录用户的详细信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: UserEntity })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async getProfile(@CurrentUser() user: any): Promise<{
    success: boolean;
    message: string;
    data: UserEntity;
  }> {
    const userInfo = await this.usersService.findOne(user.id);
    return {
      success: true,
      message: '获取用户信息成功',
      data: userInfo,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新当前用户信息', description: '更新当前登录用户的信息' })
  @ApiResponse({ status: 200, description: '更新成功', type: UserEntity })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 409, description: '邮箱或手机号已存在' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: UserEntity;
  }> {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    return {
      success: true,
      message: '用户信息更新成功',
      data: updatedUser,
    };
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户设置', description: '获取当前用户的偏好设置' })
  @ApiResponse({ status: 200, description: '获取成功', type: UserSettingsDto })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async getSettings(@CurrentUser() user: any): Promise<{
    success: boolean;
    message: string;
    data: UserSettingsDto;
  }> {
    const settings = await this.usersService.getUserSettings(user.id);
    return {
      success: true,
      message: '获取用户设置成功',
      data: settings,
    };
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户设置', description: '更新当前用户的偏好设置' })
  @ApiResponse({ status: 200, description: '更新成功', type: UserEntity })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async updateSettings(
    @CurrentUser() user: any,
    @Body() settingsDto: UserSettingsDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: UserEntity;
  }> {
    const updatedUser = await this.usersService.updateSettings(user.id, settingsDto);
    return {
      success: true,
      message: '用户设置更新成功',
      data: updatedUser,
    };
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户统计信息', description: '获取当前用户的统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async getStatistics(@CurrentUser() user: any): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    const statistics = await this.usersService.getUserStatistics(user.id);
    return {
      success: true,
      message: '获取用户统计信息成功',
      data: statistics,
    };
  }

  @Post('delete-account')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除账户', description: '用户删除自己的账户' })
  @ApiResponse({ status: 200, description: '账户删除成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async deleteAccount(@CurrentUser() user: any): Promise<{
    success: boolean;
    message: string;
  }> {
    await this.usersService.remove(user.id);
    return {
      success: true,
      message: '账户删除成功',
    };
  }

  @Get('export-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '导出用户数据', description: '导出当前用户的所有数据' })
  @ApiResponse({ status: 200, description: '导出成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async exportData(@CurrentUser() user: any): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    const exportData = await this.usersService.exportUserData(user.id);
    return {
      success: true,
      message: '用户数据导出成功',
      data: exportData,
    };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '搜索用户', description: '根据关键词搜索用户' })
  @ApiQuery({ name: 'q', description: '搜索关键词', required: true })
  @ApiResponse({ status: 200, description: '搜索成功', type: [UserEntity] })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async searchUsers(
    @CurrentUser() user: any,
    @Query('q') query: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: UserEntity[];
  }> {
    const users = await this.usersService.searchUsers(query, user.id);
    return {
      success: true,
      message: '用户搜索成功',
      data: users,
    };
  }
}