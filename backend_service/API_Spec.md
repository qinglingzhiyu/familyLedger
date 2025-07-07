# 家庭记账本 API 接口文档

## 基本信息

**API 版本**: v1  
**Base URL**: `http://localhost:3001`  
**认证方式**: JWT Bearer Token  
**数据格式**: JSON

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

**接口**: `DELETE /users/{id}`  
**描述**: 删除用户账户  
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
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**错误响应**:
- `404 Not Found`: 用户不存在

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