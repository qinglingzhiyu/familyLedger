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

## 认证说明

### JWT Token 使用方式
在需要认证的接口请求头中添加：
```
Authorization: Bearer <your_jwt_token>
```

### Token 有效期
- 访问令牌有效期：7天
- Token 过期后需要重新登录获取新的 Token

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据内容
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误描述",
  "error": {
    "code": "ERROR_CODE",
    "details": "详细错误信息"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/users"
}
```

## 常见错误代码

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| VALIDATION_ERROR | 400 | 请求参数验证失败 |
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突（如邮箱已存在） |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| EMAIL_EXISTS | 409 | 邮箱已存在 |
| PHONE_EXISTS | 409 | 手机号已存在 |
| INVALID_CREDENTIALS | 401 | 邮箱或密码错误 |
| TOKEN_EXPIRED | 401 | Token已过期 |
| INVALID_TOKEN | 401 | 无效的Token |
| LEDGER_NOT_FOUND | 404 | 账本不存在 |
| ACCOUNT_NOT_FOUND | 404 | 账户不存在 |
| CATEGORY_NOT_FOUND | 404 | 分类不存在 |
| TRANSACTION_NOT_FOUND | 404 | 交易记录不存在 |
| INSUFFICIENT_BALANCE | 400 | 余额不足 |
| DUPLICATE_NAME | 409 | 名称重复 |

## 分页参数

对于支持分页的接口，使用以下查询参数：

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|---------|
| page | integer | 1 | 页码，从1开始 |
| limit | integer | 20 | 每页数量，最大100 |
| sortBy | string | createdAt | 排序字段 |
| sortOrder | string | desc | 排序方向（asc/desc） |

## 筛选和搜索

### 日期筛选
- `startDate`: 开始日期（YYYY-MM-DD格式）
- `endDate`: 结束日期（YYYY-MM-DD格式）

### 关键词搜索
- `keyword`: 关键词搜索，支持模糊匹配

### 类型筛选
- `type`: 根据类型筛选（如交易类型、账户类型等）

## 数据验证规则

### 用户相关
- **邮箱**: 必须是有效的邮箱格式
- **密码**: 最少6位字符
- **昵称**: 1-50个字符
- **手机号**: 有效的手机号格式

### 金额相关
- **金额**: 必须大于0，最多2位小数
- **货币**: 支持的货币代码（CNY, USD, EUR等）

### 名称相关
- **账本名称**: 1-100个字符
- **账户名称**: 1-50个字符
- **分类名称**: 1-30个字符

## 国际化支持

### 支持的语言
- `zh-CN`: 简体中文
- `en-US`: 英语
- `ja-JP`: 日语
- `ko-KR`: 韩语

### 支持的货币
- `CNY`: 人民币
- `USD`: 美元
- `EUR`: 欧元
- `JPY`: 日元
- `KRW`: 韩元
- `GBP`: 英镑
- `HKD`: 港币

## 安全考虑

### 密码安全
- 密码使用bcrypt加密存储
- 最少6位字符要求
- 支持密码强度验证

### Token安全
- JWT Token包含用户ID和权限信息
- Token有效期为7天
- 支持Token刷新机制

### 数据保护
- 所有敏感数据传输使用HTTPS
- 用户密码不会在API响应中返回
- 支持软删除，保护数据完整性

## 性能优化

### 缓存策略
- 用户信息缓存
- 账本权限缓存
- 分类数据缓存

### 数据库优化
- 关键字段建立索引
- 分页查询优化
- 关联查询优化

### API限流
- 每个用户每分钟最多100次请求
- 登录接口每分钟最多5次尝试

## 使用示例

### JavaScript示例

#### 用户注册
```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    nickname: '用户昵称',
    phone: '13800138000'
  })
});

const data = await response.json();
if (data.success) {
  // 保存Token
  localStorage.setItem('accessToken', data.data.accessToken);
  console.log('注册成功:', data.data.user);
} else {
  console.error('注册失败:', data.message);
}
```

#### 用户登录
```javascript
const response = await fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
if (data.success) {
  // 保存Token
  localStorage.setItem('accessToken', data.data.accessToken);
  console.log('登录成功:', data.data.user);
} else {
  console.error('登录失败:', data.message);
}
```

#### 获取用户信息
```javascript
const token = localStorage.getItem('accessToken');
const response = await fetch('http://localhost:3001/api/v1/users/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
if (data.success) {
  console.log('用户信息:', data.data);
} else {
  console.error('获取失败:', data.message);
}
```

#### 创建账本
```javascript
const token = localStorage.getItem('accessToken');
const response = await fetch('http://localhost:3001/api/v1/ledgers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: '家庭账本',
    description: '我们的家庭记账本',
    currency: 'CNY',
    icon: 'home',
    color: '#1890ff'
  })
});

const data = await response.json();
if (data.success) {
  console.log('账本创建成功:', data.data);
} else {
  console.error('创建失败:', data.message);
}
```

#### 创建交易记录
```javascript
const token = localStorage.getItem('accessToken');
const ledgerId = 'your_ledger_id';
const response = await fetch(`http://localhost:3001/api/v1/ledgers/${ledgerId}/transactions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'EXPENSE',
    amount: 50.00,
    description: '午餐费用',
    date: new Date().toISOString(),
    accountId: 'account_id',
    categoryId: 'category_id',
    notes: '和同事一起吃饭',
    tags: ['餐饮', '工作']
  })
});

const data = await response.json();
if (data.success) {
  console.log('交易记录创建成功:', data.data);
} else {
  console.error('创建失败:', data.message);
}
```

## 重要说明

1. **密码安全**: 密码在传输和存储时都会进行加密处理
2. **Token 管理**: 请妥善保管访问令牌，避免泄露
3. **CORS 配置**: 前端应用需要配置正确的 CORS 域名
4. **数据验证**: 所有输入数据都会进行严格的验证
5. **错误处理**: 请根据返回的错误代码进行相应的错误处理
6. **API版本**: 当前API版本为v1，后续版本更新会保持向后兼容
7. **环境配置**: 开发环境和生产环境使用不同的Base URL
8. **文档更新**: API文档会随着功能更新而同步更新

## 联系支持

如果您在使用API过程中遇到问题，请通过以下方式联系我们：

- **邮箱**: support@familyledger.com
- **文档地址**: http://localhost:3001/api/docs
- **GitHub**: https://github.com/familyledger/api

---

*最后更新时间: 2024-01-01*  
*API版本: v1.0*