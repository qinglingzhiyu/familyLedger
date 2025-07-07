# 家庭记账本 API 规范文档

## API 概览

- **API 版本**: v1.0
- **Base URL**: `http://localhost:3001/api/v1`
- **文档地址**: `http://localhost:3001/api/docs`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

## OpenAPI 3.0 规范

```yaml
openapi: 3.0.0
info:
  title: 家庭记账本 API
  description: 家庭记账本后端服务API文档
  version: 1.0.0
  contact:
    name: API Support
    email: support@familyledger.com

servers:
  - url: http://localhost:3001/api/v1
    description: 开发环境
  - url: https://api.familyledger.com/v1
    description: 生产环境

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT认证令牌

  schemas:
    # 通用响应格式
    ApiResponse:
      type: object
      properties:
        success:
          type: boolean
          description: 请求是否成功
        message:
          type: string
          description: 响应消息
        data:
          type: object
          description: 响应数据
        timestamp:
          type: string
          format: date-time
          description: 响应时间戳

    # 错误响应格式
    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        message:
          type: string
          description: 错误消息
        error:
          type: object
          properties:
            code:
              type: string
              description: 错误代码
            details:
              type: string
              description: 详细错误信息
        timestamp:
          type: string
          format: date-time
        path:
          type: string
          description: 请求路径

    # 用户相关模型
    User:
      type: object
      properties:
        id:
          type: string
          description: 用户ID
        email:
          type: string
          format: email
          description: 邮箱地址
        nickname:
          type: string
          description: 昵称
        avatar:
          type: string
          description: 头像URL
        phone:
          type: string
          description: 手机号
        language:
          type: string
          enum: [zh-CN, en-US, ja-JP, ko-KR]
          description: 语言设置
        currency:
          type: string
          enum: [CNY, USD, EUR, JPY, KRW, GBP, HKD]
          description: 默认货币
        theme:
          type: string
          enum: [light, dark, auto]
          description: 主题设置
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    # 账本相关模型
    Ledger:
      type: object
      properties:
        id:
          type: string
          description: 账本ID
        name:
          type: string
          description: 账本名称
        description:
          type: string
          description: 账本描述
        currency:
          type: string
          description: 默认货币
        icon:
          type: string
          description: 图标
        color:
          type: string
          description: 主题色
        isActive:
          type: boolean
          description: 是否激活
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    # 账户相关模型
    Account:
      type: object
      properties:
        id:
          type: string
          description: 账户ID
        name:
          type: string
          description: 账户名称
        type:
          type: string
          enum: [CASH, BANK, CREDIT, INVESTMENT, OTHER]
          description: 账户类型
        balance:
          type: number
          format: decimal
          description: 账户余额
        currency:
          type: string
          description: 货币类型
        description:
          type: string
          description: 账户描述
        icon:
          type: string
          description: 图标
        color:
          type: string
          description: 颜色
        isActive:
          type: boolean
          description: 是否激活
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    # 分类相关模型
    Category:
      type: object
      properties:
        id:
          type: string
          description: 分类ID
        name:
          type: string
          description: 分类名称
        type:
          type: string
          enum: [INCOME, EXPENSE]
          description: 分类类型
        parentId:
          type: string
          nullable: true
          description: 父分类ID
        icon:
          type: string
          description: 图标
        color:
          type: string
          description: 颜色
        sortOrder:
          type: integer
          description: 排序顺序
        isActive:
          type: boolean
          description: 是否激活
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    # 交易相关模型
    Transaction:
      type: object
      properties:
        id:
          type: string
          description: 交易ID
        type:
          type: string
          enum: [INCOME, EXPENSE, TRANSFER]
          description: 交易类型
        amount:
          type: number
          format: decimal
          description: 交易金额
        description:
          type: string
          description: 交易描述
        date:
          type: string
          format: date-time
          description: 交易日期
        accountId:
          type: string
          description: 关联账户ID
        categoryId:
          type: string
          description: 关联分类ID
        notes:
          type: string
          description: 备注
        tags:
          type: array
          items:
            type: string
          description: 标签
        attachments:
          type: array
          items:
            type: string
          description: 附件URL
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

paths:
  # 认证相关接口
  /auth/register:
    post:
      tags:
        - 认证管理
      summary: 用户注册
      description: 创建新用户账户
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
                - nickname
              properties:
                email:
                  type: string
                  format: email
                  description: 邮箱地址
                password:
                  type: string
                  minLength: 6
                  description: 密码
                nickname:
                  type: string
                  description: 昵称
                phone:
                  type: string
                  description: 手机号
      responses:
        '201':
          description: 注册成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          user:
                            $ref: '#/components/schemas/User'
                          accessToken:
                            type: string
                          refreshToken:
                            type: string
        '400':
          description: 请求参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '409':
          description: 邮箱已存在
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/login:
    post:
      tags:
        - 认证管理
      summary: 用户登录
      description: 用户登录获取访问令牌
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                  description: 邮箱地址
                password:
                  type: string
                  description: 密码
      responses:
        '200':
          description: 登录成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          user:
                            $ref: '#/components/schemas/User'
                          accessToken:
                            type: string
                          refreshToken:
                            type: string
        '401':
          description: 邮箱或密码错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  # 用户相关接口
  /users/profile:
    get:
      tags:
        - 用户管理
      summary: 获取当前用户信息
      description: 获取当前登录用户的详细信息
      security:
        - bearerAuth: []
      responses:
        '200':
          description: 获取成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        $ref: '#/components/schemas/User'
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    patch:
      tags:
        - 用户管理
      summary: 更新当前用户信息
      description: 更新当前登录用户的信息
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                nickname:
                  type: string
                  description: 昵称
                avatar:
                  type: string
                  description: 头像URL
                phone:
                  type: string
                  description: 手机号
      responses:
        '200':
          description: 更新成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        $ref: '#/components/schemas/User'
        '400':
          description: 请求参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /users/change-password:
    post:
      tags:
        - 用户管理
      summary: 修改密码
      description: 用户修改登录密码
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - currentPassword
                - newPassword
                - confirmPassword
              properties:
                currentPassword:
                  type: string
                  description: 当前密码
                newPassword:
                  type: string
                  minLength: 6
                  description: 新密码
                confirmPassword:
                  type: string
                  description: 确认新密码
      responses:
        '200':
          description: 密码修改成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'
        '400':
          description: 请求参数错误或当前密码不正确
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  # 账本相关接口
  /ledgers:
    get:
      tags:
        - 账本管理
      summary: 获取用户账本列表
      description: 获取当前用户参与的所有账本
      security:
        - bearerAuth: []
      responses:
        '200':
          description: 获取成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        type: array
                        items:
                          $ref: '#/components/schemas/Ledger'
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    post:
      tags:
        - 账本管理
      summary: 创建账本
      description: 创建新的家庭账本
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
              properties:
                name:
                  type: string
                  description: 账本名称
                description:
                  type: string
                  description: 账本描述
                currency:
                  type: string
                  description: 默认货币
                icon:
                  type: string
                  description: 图标
                color:
                  type: string
                  description: 主题色
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        $ref: '#/components/schemas/Ledger'
        '400':
          description: 请求参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /ledgers/{ledgerId}:
    get:
      tags:
        - 账本管理
      summary: 获取账本详情
      description: 获取指定账本的详细信息
      security:
        - bearerAuth: []
      parameters:
        - name: ledgerId
          in: path
          required: true
          schema:
            type: string
          description: 账本ID
      responses:
        '200':
          description: 获取成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        $ref: '#/components/schemas/Ledger'
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: 权限不足
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: 账本不存在
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  # 账户相关接口
  /ledgers/{ledgerId}/accounts:
    get:
      tags:
        - 账户管理
      summary: 获取账户列表
      description: 获取指定账本的账户列表
      security:
        - bearerAuth: []
      parameters:
        - name: ledgerId
          in: path
          required: true
          schema:
            type: string
          description: 账本ID
        - name: type
          in: query
          required: false
          schema:
            type: string
            enum: [CASH, BANK, CREDIT, INVESTMENT, OTHER]
          description: 账户类型筛选
        - name: includeBalance
          in: query
          required: false
          schema:
            type: boolean
          description: 是否包含余额信息
      responses:
        '200':
          description: 获取成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          accounts:
                            type: array
                            items:
                              $ref: '#/components/schemas/Account'
                          groupedAccounts:
                            type: object
                          total:
                            type: integer
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: 权限不足
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    post:
      tags:
        - 账户管理
      summary: 创建账户
      description: 在指定账本中创建新账户
      security:
        - bearerAuth: []
      parameters:
        - name: ledgerId
          in: path
          required: true
          schema:
            type: string
          description: 账本ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - type
              properties:
                name:
                  type: string
                  description: 账户名称
                type:
                  type: string
                  enum: [CASH, BANK, CREDIT, INVESTMENT, OTHER]
                  description: 账户类型
                initialBalance:
                  type: number
                  format: decimal
                  description: 初始余额
                currency:
                  type: string
                  description: 货币类型
                description:
                  type: string
                  description: 账户描述
                icon:
                  type: string
                  description: 图标
                color:
                  type: string
                  description: 颜色
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        $ref: '#/components/schemas/Account'
        '400':
          description: 请求参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: 权限不足
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  # 分类相关接口
  /ledgers/{ledgerId}/categories:
    get:
      tags:
        - 分类管理
      summary: 获取分类列表
      description: 获取指定账本的分类列表
      security:
        - bearerAuth: []
      parameters:
        - name: ledgerId
          in: path
          required: true
          schema:
            type: string
          description: 账本ID
        - name: type
          in: query
          required: false
          schema:
            type: string
            enum: [INCOME, EXPENSE]
          description: 分类类型筛选
        - name: parentId
          in: query
          required: false
          schema:
            type: string
          description: 父分类ID筛选
      responses:
        '200':
          description: 获取成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        type: array
                        items:
                          $ref: '#/components/schemas/Category'
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: 权限不足
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    post:
      tags:
        - 分类管理
      summary: 创建分类
      description: 在指定账本中创建新分类
      security:
        - bearerAuth: []
      parameters:
        - name: ledgerId
          in: path
          required: true
          schema:
            type: string
          description: 账本ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - type
              properties:
                name:
                  type: string
                  description: 分类名称
                type:
                  type: string
                  enum: [INCOME, EXPENSE]
                  description: 分类类型
                parentId:
                  type: string
                  description: 父分类ID
                icon:
                  type: string
                  description: 图标
                color:
                  type: string
                  description: 颜色
                description:
                  type: string
                  description: 分类描述
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        $ref: '#/components/schemas/Category'
        '400':
          description: 请求参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: 权限不足
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  # 交易相关接口
  /ledgers/{ledgerId}/transactions:
    get:
      tags:
        - 交易管理
      summary: 获取交易列表
      description: 获取指定账本的交易记录列表
      security:
        - bearerAuth: []
      parameters:
        - name: ledgerId
          in: path
          required: true
          schema:
            type: string
          description: 账本ID
        - name: page
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
            default: 1
          description: 页码
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
          description: 每页数量
        - name: type
          in: query
          required: false
          schema:
            type: string
            enum: [INCOME, EXPENSE, TRANSFER]
          description: 交易类型筛选
        - name: categoryId
          in: query
          required: false
          schema:
            type: string
          description: 分类ID筛选
        - name: accountId
          in: query
          required: false
          schema:
            type: string
          description: 账户ID筛选
        - name: startDate
          in: query
          required: false
          schema:
            type: string
            format: date
          description: 开始日期
        - name: endDate
          in: query
          required: false
          schema:
            type: string
            format: date
          description: 结束日期
        - name: keyword
          in: query
          required: false
          schema:
            type: string
          description: 关键词搜索
      responses:
        '200':
          description: 获取成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          transactions:
                            type: array
                            items:
                              $ref: '#/components/schemas/Transaction'
                          pagination:
                            type: object
                            properties:
                              page:
                                type: integer
                              limit:
                                type: integer
                              total:
                                type: integer
                              totalPages:
                                type: integer
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: 权限不足
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    post:
      tags:
        - 交易管理
      summary: 创建交易
      description: 在指定账本中创建新交易记录
      security:
        - bearerAuth: []
      parameters:
        - name: ledgerId
          in: path
          required: true
          schema:
            type: string
          description: 账本ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - type
                - amount
                - description
                - accountId
                - categoryId
              properties:
                type:
                  type: string
                  enum: [INCOME, EXPENSE, TRANSFER]
                  description: 交易类型
                amount:
                  type: number
                  format: decimal
                  minimum: 0.01
                  description: 交易金额
                description:
                  type: string
                  description: 交易描述
                date:
                  type: string
                  format: date-time
                  description: 交易日期
                accountId:
                  type: string
                  description: 关联账户ID
                categoryId:
                  type: string
                  description: 关联分类ID
                notes:
                  type: string
                  description: 备注
                tags:
                  type: array
                  items:
                    type: string
                  description: 标签
                attachments:
                  type: array
                  items:
                    type: string
                  description: 附件URL
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        $ref: '#/components/schemas/Transaction'
        '400':
          description: 请求参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: 未授权访问
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: 权限不足
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
```

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误描述",
  "statusCode": 400
}
```

## API 接口列表

### 1. 认证模块 (Authentication)

#### 1.1 用户注册

**接口**: `POST /auth/register`  
**描述**: 注册新用户账户  
**认证**: 无需认证

**请求参数**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "用户昵称",
  "phone": "13800138000",
  "avatar": "https://example.com/avatar.jpg"
}
```

**参数说明**:
- `email` (string, 必需): 用户邮箱，必须是有效的邮箱格式
- `password` (string, 必需): 用户密码，最少6位字符
- `nickname` (string, 必需): 用户昵称
- `phone` (string, 可选): 用户手机号
- `avatar` (string, 可选): 用户头像URL

**成功响应** (201):
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clxxxxx",
      "email": "user@example.com",
      "nickname": "用户昵称",
      "phone": "13800138000",
      "avatar": "https://example.com/avatar.jpg",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**错误响应**:
- `409 Conflict`: 邮箱或手机号已被注册
- `400 Bad Request`: 请求参数验证失败

#### 1.2 用户登录

**接口**: `POST /auth/login`  
**描述**: 用户登录获取访问令牌  
**认证**: 无需认证

**请求参数**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**参数说明**:
- `email` (string, 必需): 用户邮箱
- `password` (string, 必需): 用户密码

**成功响应** (200):
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clxxxxx",
      "email": "user@example.com",
      "nickname": "用户昵称",
      "phone": "13800138000",
      "avatar": "https://example.com/avatar.jpg",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**错误响应**:
- `401 Unauthorized`: 邮箱或密码错误
- `400 Bad Request`: 请求参数验证失败

### 2. 用户管理模块 (Users)

#### 2.1 获取用户列表

**接口**: `GET /users`  
**描述**: 获取所有用户列表  
**认证**: 需要 JWT Token

**请求参数**: 无

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取用户列表成功",
  "data": [
    {
      "id": "clxxxxx",
      "email": "user1@example.com",
      "nickname": "用户1",
      "phone": "13800138000",
      "avatar": "https://example.com/avatar1.jpg",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "clyyyyy",
      "email": "user2@example.com",
      "nickname": "用户2",
      "phone": "13800138001",
      "avatar": "https://example.com/avatar2.jpg",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2.2 获取单个用户信息

**接口**: `GET /users/{id}`  
**描述**: 根据用户ID获取用户详细信息  
**认证**: 需要 JWT Token

**路径参数**:
- `id` (string, 必需): 用户ID

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取用户信息成功",
  "data": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "nickname": "用户昵称",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**错误响应**:
- `404 Not Found`: 用户不存在
- `401 Unauthorized`: 未提供有效的认证令牌

#### 2.3 创建用户

**接口**: `POST /users`  
**描述**: 创建新用户（管理员功能）  
**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "nickname": "新用户",
  "phone": "13800138002",
  "avatar": "https://example.com/avatar.jpg",
  "status": "ACTIVE"
}
```

**参数说明**:
- `email` (string, 必需): 用户邮箱
- `password` (string, 必需): 用户密码，最少6位
- `nickname` (string, 必需): 用户昵称
- `phone` (string, 可选): 用户手机号
- `avatar` (string, 可选): 用户头像URL
- `status` (string, 可选): 用户状态，可选值：ACTIVE, INACTIVE, SUSPENDED

**成功响应** (201):
```json
{
  "success": true,
  "message": "用户创建成功",
  "data": {
    "id": "clxxxxx",
    "email": "newuser@example.com",
    "nickname": "新用户",
    "phone": "13800138002",
    "avatar": "https://example.com/avatar.jpg",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2.4 更新用户信息

**接口**: `PATCH /users/{id}`  
**描述**: 更新用户信息  
**认证**: 需要 JWT Token

**路径参数**:
- `id` (string, 必需): 用户ID

**请求参数**:
```json
{
  "nickname": "更新后的昵称",
  "phone": "13800138003",
  "avatar": "https://example.com/new-avatar.jpg",
  "status": "INACTIVE"
}
```

**参数说明**: 所有参数都是可选的，只需要传入需要更新的字段

**成功响应** (200):
```json
{
  "success": true,
  "message": "用户信息更新成功",
  "data": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "nickname": "更新后的昵称",
    "phone": "13800138003",
    "avatar": "https://example.com/new-avatar.jpg",
    "status": "INACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

**错误响应**:
- `404 Not Found`: 用户不存在
- `409 Conflict`: 邮箱或手机号已被其他用户使用

#### 2.5 删除用户

**接口**: `POST /users/{id}/delete`  
**描述**: 软删除用户账户（标记为已删除，不会真正删除数据）  
**认证**: 需要 JWT Token

**路径参数**:
- `id` (string, 必需): 用户ID

**成功响应** (200):
```json
{
  "success": true,
  "message": "用户删除成功",
  "data": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "nickname": "用户昵称",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "status": "ACTIVE",
    "deletedAt": "2024-01-01T01:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

**错误响应**:
- `404 Not Found`: 用户不存在或已被删除

**注意**: 软删除的用户不会出现在用户列表中，但数据仍保留在数据库中。

## 数据模型定义

### User (用户)
```json
{
  "id": "string",
  "email": "string",
  "phone": "string | null",
  "nickname": "string",
  "avatar": "string | null",
  "status": "ACTIVE | INACTIVE | SUSPENDED",
  "deletedAt": "string (ISO 8601) | null",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### AuthResponse (认证响应)
```json
{
  "access_token": "string",
  "user": "User"
}
```

## 错误码说明

| HTTP 状态码 | 错误类型 | 描述 |
|-------------|----------|------|
| 400 | Bad Request | 请求参数验证失败 |
| 401 | Unauthorized | 未提供认证令牌或令牌无效 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 请求的资源不存在 |
| 409 | Conflict | 资源冲突（如邮箱已存在） |
| 500 | Internal Server Error | 服务器内部错误 |

## 使用示例

### 1. 用户注册和登录流程

```javascript
// 1. 注册用户
const registerResponse = await fetch('http://localhost:3001/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    nickname: '测试用户'
  })
});

const registerData = await registerResponse.json();
const token = registerData.data.access_token;

// 2. 使用 Token 访问受保护的接口
const usersResponse = await fetch('http://localhost:3001/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const usersData = await usersResponse.json();
console.log(usersData.data); // 用户列表
```

### 2. 用户信息管理

```javascript
// 获取用户信息
const userResponse = await fetch('http://localhost:3001/users/clxxxxx', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

// 更新用户信息
const updateResponse = await fetch('http://localhost:3001/users/clxxxxx', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nickname: '新昵称',
    phone: '13800138000'
  })
});
```

## 注意事项

1. **密码安全**: 密码在存储前会使用 bcrypt 进行加密，API 响应中不会返回密码字段
2. **Token 管理**: JWT Token 有效期为7天，过期后需要重新登录
3. **CORS 配置**: API 已配置 CORS，支持来自 `http://localhost:3000` 和 `http://localhost:3001` 的跨域请求
4. **数据验证**: 所有输入数据都会进行严格的验证，确保数据的完整性和安全性
5. **错误处理**: API 提供详细的错误信息，便于前端进行错误处理和用户提示