import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';

export function ApiResponseDecorator(options: ApiResponseOptions) {
  return applyDecorators(
    ApiResponse(options)
  );
}

// 常用的响应装饰器
export function ApiSuccessResponse(description: string = '操作成功') {
  return ApiResponse({
    status: 200,
    description,
  });
}

export function ApiCreatedResponse(description: string = '创建成功') {
  return ApiResponse({
    status: 201,
    description,
  });
}

export function ApiBadRequestResponse(description: string = '请求参数错误') {
  return ApiResponse({
    status: 400,
    description,
  });
}

export function ApiUnauthorizedResponse(description: string = '未授权') {
  return ApiResponse({
    status: 401,
    description,
  });
}

export function ApiForbiddenResponse(description: string = '权限不足') {
  return ApiResponse({
    status: 403,
    description,
  });
}

export function ApiNotFoundResponse(description: string = '资源不存在') {
  return ApiResponse({
    status: 404,
    description,
  });
}

export function ApiInternalServerErrorResponse(description: string = '服务器内部错误') {
  return ApiResponse({
    status: 500,
    description,
  });
}