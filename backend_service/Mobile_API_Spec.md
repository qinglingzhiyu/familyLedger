# 家庭记账本 - 小程序/App API 接口文档

## 基本信息

**API 版本**: v1  
**Base URL**: `http://localhost:3001`  
**认证方式**: JWT Bearer Token  
**数据格式**: JSON  
**适用平台**: 微信小程序、iOS App、Android App

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

### 2. 账本模块 (Ledgers)

#### 2.1 获取用户账本列表

**接口**: `GET /ledgers`  
**描述**: 获取当前用户参与的所有账本  
**认证**: 需要 JWT Token

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取账本列表成功",
  "data": [
    {
      "id": "ledger_001",
      "name": "我的个人账本",
      "description": "个人日常开销记录",
      "type": "PERSONAL",
      "status": "ACTIVE",
      "coverImage": "https://example.com/cover1.jpg",
      "currency": "CNY",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "role": "OWNER",
      "memberCount": 1
    },
    {
      "id": "ledger_002",
      "name": "家庭账本",
      "description": "家庭共同开销",
      "type": "FAMILY",
      "status": "ACTIVE",
      "coverImage": "https://example.com/cover2.jpg",
      "currency": "CNY",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "role": "MEMBER",
      "memberCount": 2
    }
  ]
}
```

#### 2.2 创建账本

**接口**: `POST /ledgers`  
**描述**: 创建新的账本  
**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "name": "新账本",
  "description": "账本描述",
  "type": "FAMILY",
  "coverImage": "https://example.com/cover.jpg",
  "currency": "CNY"
}
```

**参数说明**:
- `name` (string, 必需): 账本名称
- `description` (string, 可选): 账本描述
- `type` (string, 必需): 账本类型，可选值：PERSONAL, FAMILY
- `coverImage` (string, 可选): 账本封面图片URL
- `currency` (string, 可选): 货币类型，默认CNY

**成功响应** (201):
```json
{
  "success": true,
  "message": "账本创建成功",
  "data": {
    "id": "ledger_003",
    "name": "新账本",
    "description": "账本描述",
    "type": "FAMILY",
    "status": "ACTIVE",
    "coverImage": "https://example.com/cover.jpg",
    "currency": "CNY",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "role": "OWNER",
    "memberCount": 1
  }
}
```

#### 2.3 获取账本详情

**接口**: `GET /ledgers/{ledgerId}`  
**描述**: 获取指定账本的详细信息  
**认证**: 需要 JWT Token

**路径参数**:
- `ledgerId` (string, 必需): 账本ID

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取账本详情成功",
  "data": {
    "id": "ledger_001",
    "name": "家庭账本",
    "description": "家庭共同开销",
    "type": "FAMILY",
    "status": "ACTIVE",
    "coverImage": "https://example.com/cover.jpg",
    "currency": "CNY",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "role": "OWNER",
    "members": [
      {
        "id": "member_001",
        "userId": "user_001",
        "nickname": "小明",
        "avatar": "https://example.com/avatar1.jpg",
        "role": "OWNER",
        "joinedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "member_002",
        "userId": "user_002",
        "nickname": "小红",
        "avatar": "https://example.com/avatar2.jpg",
        "role": "MEMBER",
        "joinedAt": "2024-01-02T00:00:00.000Z"
      }
    ]
  }
}
```

#### 2.4 邀请成员加入账本

**接口**: `POST /ledgers/{ledgerId}/invite`  
**描述**: 生成邀请链接或邀请指定用户加入账本  
**认证**: 需要 JWT Token

**路径参数**:
- `ledgerId` (string, 必需): 账本ID

**请求参数**:
```json
{
  "email": "friend@example.com",
  "role": "MEMBER"
}
```

**参数说明**:
- `email` (string, 可选): 被邀请用户的邮箱，如果不提供则生成通用邀请链接
- `role` (string, 可选): 成员角色，可选值：MEMBER, ADMIN，默认MEMBER

**成功响应** (200):
```json
{
  "success": true,
  "message": "邀请链接生成成功",
  "data": {
    "inviteCode": "ABC123DEF",
    "inviteUrl": "https://app.example.com/join?code=ABC123DEF",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?data=ABC123DEF",
    "expiresAt": "2024-01-08T00:00:00.000Z"
  }
}
```

#### 2.5 加入账本

**接口**: `POST /ledgers/join`  
**描述**: 通过邀请码加入账本  
**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "inviteCode": "ABC123DEF"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "成功加入账本",
  "data": {
    "ledger": {
      "id": "ledger_001",
      "name": "家庭账本",
      "description": "家庭共同开销",
      "type": "FAMILY",
      "status": "ACTIVE",
      "coverImage": "https://example.com/cover.jpg",
      "currency": "CNY",
      "role": "MEMBER"
    }
  }
}
```

### 3. 记账模块 (Transactions)

#### 3.1 获取交易记录列表

**接口**: `GET /ledgers/{ledgerId}/transactions`  
**描述**: 获取指定账本的交易记录  
**认证**: 需要 JWT Token

**路径参数**:
- `ledgerId` (string, 必需): 账本ID

**查询参数**:
- `page` (number, 可选): 页码，默认1
- `limit` (number, 可选): 每页数量，默认20，最大100
- `type` (string, 可选): 交易类型，可选值：INCOME, EXPENSE, TRANSFER
- `categoryId` (string, 可选): 分类ID
- `accountId` (string, 可选): 账户ID
- `memberId` (string, 可选): 成员ID
- `startDate` (string, 可选): 开始日期，格式：YYYY-MM-DD
- `endDate` (string, 可选): 结束日期，格式：YYYY-MM-DD
- `keyword` (string, 可选): 搜索关键词（备注内容）

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取交易记录成功",
  "data": {
    "transactions": [
      {
        "id": "trans_001",
        "type": "EXPENSE",
        "amount": 128.50,
        "description": "午餐",
        "date": "2024-01-01",
        "category": {
          "id": "cat_001",
          "name": "餐饮",
          "icon": "🍽️",
          "color": "#FF6B6B"
        },
        "account": {
          "id": "acc_001",
          "name": "支付宝",
          "type": "ALIPAY",
          "icon": "💰"
        },
        "member": {
          "id": "member_001",
          "nickname": "小明",
          "avatar": "https://example.com/avatar1.jpg"
        },
        "images": [
          "https://example.com/receipt1.jpg"
        ],
        "createdAt": "2024-01-01T12:30:00.000Z",
        "updatedAt": "2024-01-01T12:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    },
    "summary": {
      "totalIncome": 8500.00,
      "totalExpense": 6234.50,
      "balance": 2265.50
    }
  }
}
```

#### 3.2 创建交易记录

**接口**: `POST /ledgers/{ledgerId}/transactions`  
**描述**: 在指定账本中创建新的交易记录  
**认证**: 需要 JWT Token

**路径参数**:
- `ledgerId` (string, 必需): 账本ID

**请求参数**:
```json
{
  "type": "EXPENSE",
  "amount": 128.50,
  "description": "午餐",
  "date": "2024-01-01",
  "categoryId": "cat_001",
  "accountId": "acc_001",
  "toAccountId": "acc_002",
  "images": [
    "https://example.com/receipt1.jpg"
  ]
}
```

**参数说明**:
- `type` (string, 必需): 交易类型，可选值：INCOME, EXPENSE, TRANSFER
- `amount` (number, 必需): 金额，支持小数点后两位
- `description` (string, 可选): 交易描述/备注
- `date` (string, 必需): 交易日期，格式：YYYY-MM-DD
- `categoryId` (string, 必需): 分类ID
- `accountId` (string, 必需): 账户ID（转出账户）
- `toAccountId` (string, 可选): 目标账户ID（仅转账时需要）
- `images` (array, 可选): 图片URL数组，最多3张

**成功响应** (201):
```json
{
  "success": true,
  "message": "交易记录创建成功",
  "data": {
    "id": "trans_002",
    "type": "EXPENSE",
    "amount": 128.50,
    "description": "午餐",
    "date": "2024-01-01",
    "category": {
      "id": "cat_001",
      "name": "餐饮",
      "icon": "🍽️",
      "color": "#FF6B6B"
    },
    "account": {
      "id": "acc_001",
      "name": "支付宝",
      "type": "ALIPAY",
      "icon": "💰"
    },
    "member": {
      "id": "member_001",
      "nickname": "小明",
      "avatar": "https://example.com/avatar1.jpg"
    },
    "images": [
      "https://example.com/receipt1.jpg"
    ],
    "createdAt": "2024-01-01T12:30:00.000Z",
    "updatedAt": "2024-01-01T12:30:00.000Z"
  }
}
```

#### 3.3 更新交易记录

**接口**: `PATCH /ledgers/{ledgerId}/transactions/{transactionId}`  
**描述**: 更新指定的交易记录  
**认证**: 需要 JWT Token

**路径参数**:
- `ledgerId` (string, 必需): 账本ID
- `transactionId` (string, 必需): 交易记录ID

**请求参数**: 与创建交易记录相同，所有字段都是可选的

**成功响应** (200): 与创建交易记录响应格式相同

#### 3.4 删除交易记录

**接口**: `DELETE /ledgers/{ledgerId}/transactions/{transactionId}`  
**描述**: 删除指定的交易记录  
**认证**: 需要 JWT Token

**路径参数**:
- `ledgerId` (string, 必需): 账本ID
- `transactionId` (string, 必需): 交易记录ID

**成功响应** (200):
```json
{
  "success": true,
  "message": "交易记录删除成功",
  "data": null
}
```

### 4. 分类模块 (Categories)

#### 4.1 获取分类列表

**接口**: `GET /ledgers/{ledgerId}/categories`  
**描述**: 获取指定账本的分类列表  
**认证**: 需要 JWT Token

**路径参数**:
- `ledgerId` (string, 必需): 账本ID

**查询参数**:
- `type` (string, 可选): 分类类型，可选值：INCOME, EXPENSE

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取分类列表成功",
  "data": [
    {
      "id": "cat_001",
      "name": "餐饮",
      "type": "EXPENSE",
      "icon": "🍽️",
      "color": "#FF6B6B",
      "parentId": null,
      "isDefault": true,
      "children": [
        {
          "id": "cat_001_01",
          "name": "早餐",
          "type": "EXPENSE",
          "icon": "🥐",
          "color": "#FF6B6B",
          "parentId": "cat_001",
          "isDefault": true
        },
        {
          "id": "cat_001_02",
          "name": "午餐",
          "type": "EXPENSE",
          "icon": "🍱",
          "color": "#FF6B6B",
          "parentId": "cat_001",
          "isDefault": true
        }
      ]
    }
  ]
}
```

#### 4.2 创建自定义分类

**接口**: `POST /ledgers/{ledgerId}/categories`  
**描述**: 在指定账本中创建自定义分类  
**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "name": "宠物用品",
  "type": "EXPENSE",
  "icon": "🐕",
  "color": "#4ECDC4",
  "parentId": null
}
```

**成功响应** (201):
```json
{
  "success": true,
  "message": "分类创建成功",
  "data": {
    "id": "cat_custom_001",
    "name": "宠物用品",
    "type": "EXPENSE",
    "icon": "🐕",
    "color": "#4ECDC4",
    "parentId": null,
    "isDefault": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. 账户模块 (Accounts)

#### 5.1 获取账户列表

**接口**: `GET /ledgers/{ledgerId}/accounts`  
**描述**: 获取指定账本的账户列表  
**认证**: 需要 JWT Token

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取账户列表成功",
  "data": [
    {
      "id": "acc_001",
      "name": "支付宝",
      "type": "ALIPAY",
      "icon": "💰",
      "color": "#1677FF",
      "balance": 1234.56,
      "currency": "CNY",
      "isDefault": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "acc_002",
      "name": "现金",
      "type": "CASH",
      "icon": "💵",
      "color": "#52C41A",
      "balance": 500.00,
      "currency": "CNY",
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 5.2 创建账户

**接口**: `POST /ledgers/{ledgerId}/accounts`  
**描述**: 在指定账本中创建新账户  
**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "name": "招商银行储蓄卡",
  "type": "BANK_CARD",
  "icon": "🏦",
  "color": "#722ED1",
  "initialBalance": 5000.00,
  "currency": "CNY"
}
```

**成功响应** (201):
```json
{
  "success": true,
  "message": "账户创建成功",
  "data": {
    "id": "acc_003",
    "name": "招商银行储蓄卡",
    "type": "BANK_CARD",
    "icon": "🏦",
    "color": "#722ED1",
    "balance": 5000.00,
    "currency": "CNY",
    "isDefault": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. 报表模块 (Reports)

#### 6.1 获取收支概览

**接口**: `GET /ledgers/{ledgerId}/reports/overview`  
**描述**: 获取指定账本的收支概览数据  
**认证**: 需要 JWT Token

**查询参数**:
- `period` (string, 可选): 统计周期，可选值：day, week, month, year，默认month
- `date` (string, 可选): 指定日期，格式：YYYY-MM-DD，默认当前日期

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取收支概览成功",
  "data": {
    "period": "month",
    "date": "2024-01",
    "summary": {
      "totalIncome": 8500.00,
      "totalExpense": 6234.50,
      "balance": 2265.50,
      "transactionCount": 156
    },
    "dailyTrend": [
      {
        "date": "2024-01-01",
        "income": 0.00,
        "expense": 128.50,
        "balance": -128.50
      },
      {
        "date": "2024-01-02",
        "income": 8500.00,
        "expense": 256.80,
        "balance": 8243.20
      }
    ],
    "topCategories": [
      {
        "categoryId": "cat_001",
        "categoryName": "餐饮",
        "amount": 1234.50,
        "percentage": 19.8,
        "transactionCount": 45
      },
      {
        "categoryId": "cat_002",
        "categoryName": "交通",
        "amount": 856.20,
        "percentage": 13.7,
        "transactionCount": 28
      }
    ]
  }
}
```

#### 6.2 获取分类统计

**接口**: `GET /ledgers/{ledgerId}/reports/categories`  
**描述**: 获取指定账本的分类统计数据  
**认证**: 需要 JWT Token

**查询参数**:
- `type` (string, 可选): 交易类型，可选值：INCOME, EXPENSE，默认EXPENSE
- `period` (string, 可选): 统计周期，可选值：month, year，默认month
- `date` (string, 可选): 指定日期，格式：YYYY-MM，默认当前月份

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取分类统计成功",
  "data": {
    "type": "EXPENSE",
    "period": "month",
    "date": "2024-01",
    "total": 6234.50,
    "categories": [
      {
        "categoryId": "cat_001",
        "categoryName": "餐饮",
        "icon": "🍽️",
        "color": "#FF6B6B",
        "amount": 1234.50,
        "percentage": 19.8,
        "transactionCount": 45,
        "subcategories": [
          {
            "categoryId": "cat_001_01",
            "categoryName": "早餐",
            "amount": 456.20,
            "percentage": 7.3,
            "transactionCount": 20
          }
        ]
      }
    ]
  }
}
```

#### 6.3 获取成员统计

**接口**: `GET /ledgers/{ledgerId}/reports/members`  
**描述**: 获取指定账本的成员消费统计  
**认证**: 需要 JWT Token

**查询参数**:
- `period` (string, 可选): 统计周期，可选值：month, year，默认month
- `date` (string, 可选): 指定日期，格式：YYYY-MM，默认当前月份

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取成员统计成功",
  "data": {
    "period": "month",
    "date": "2024-01",
    "total": 6234.50,
    "members": [
      {
        "memberId": "member_001",
        "nickname": "小明",
        "avatar": "https://example.com/avatar1.jpg",
        "totalAmount": 3456.20,
        "percentage": 55.4,
        "transactionCount": 89,
        "topCategories": [
          {
            "categoryName": "餐饮",
            "amount": 856.30
          }
        ]
      },
      {
        "memberId": "member_002",
        "nickname": "小红",
        "avatar": "https://example.com/avatar2.jpg",
        "totalAmount": 2778.30,
        "percentage": 44.6,
        "transactionCount": 67,
        "topCategories": [
          {
            "categoryName": "购物",
            "amount": 1234.50
          }
        ]
      }
    ]
  }
}
```

### 7. 用户个人中心

#### 7.1 获取个人信息

**接口**: `GET /users/profile`  
**描述**: 获取当前用户的个人信息  
**认证**: 需要 JWT Token

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取个人信息成功",
  "data": {
    "id": "user_001",
    "email": "user@example.com",
    "nickname": "小明",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "statistics": {
      "ledgerCount": 3,
      "transactionCount": 156,
      "totalDays": 30
    }
  }
}
```

#### 7.2 更新个人信息

**接口**: `PATCH /users/profile`  
**描述**: 更新当前用户的个人信息  
**认证**: 需要 JWT Token

**请求参数**:
```json
{
  "nickname": "新昵称",
  "phone": "13800138001",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**成功响应** (200): 与获取个人信息响应格式相同

### 8. 文件上传

#### 8.1 上传图片

**接口**: `POST /upload/image`  
**描述**: 上传图片文件（用于头像、交易凭证等）  
**认证**: 需要 JWT Token  
**Content-Type**: multipart/form-data

**请求参数**:
- `file` (file, 必需): 图片文件，支持jpg、png、gif格式，最大5MB
- `type` (string, 可选): 图片类型，可选值：avatar, receipt, other，默认other

**成功响应** (200):
```json
{
  "success": true,
  "message": "图片上传成功",
  "data": {
    "url": "https://example.com/uploads/images/20240101/abc123.jpg",
    "filename": "abc123.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

## 数据模型定义

### Ledger (账本)
```json
{
  "id": "string",
  "name": "string",
  "description": "string | null",
  "type": "PERSONAL | FAMILY",
  "status": "ACTIVE | ARCHIVED | DELETED",
  "coverImage": "string | null",
  "currency": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "role": "OWNER | ADMIN | MEMBER",
  "memberCount": "number"
}
```

### Transaction (交易记录)
```json
{
  "id": "string",
  "type": "INCOME | EXPENSE | TRANSFER",
  "amount": "number",
  "description": "string | null",
  "date": "string (YYYY-MM-DD)",
  "category": "Category",
  "account": "Account",
  "toAccount": "Account | null",
  "member": "Member",
  "images": "string[]",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### Category (分类)
```json
{
  "id": "string",
  "name": "string",
  "type": "INCOME | EXPENSE",
  "icon": "string",
  "color": "string",
  "parentId": "string | null",
  "isDefault": "boolean",
  "children": "Category[]"
}
```

### Account (账户)
```json
{
  "id": "string",
  "name": "string",
  "type": "CASH | BANK_CARD | ALIPAY | WECHAT | CREDIT_CARD | OTHER",
  "icon": "string",
  "color": "string",
  "balance": "number",
  "currency": "string",
  "isDefault": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### Member (成员)
```json
{
  "id": "string",
  "userId": "string",
  "nickname": "string",
  "avatar": "string | null",
  "role": "OWNER | ADMIN | MEMBER",
  "joinedAt": "string (ISO 8601)"
}
```

## 错误码说明

| HTTP 状态码 | 错误类型 | 描述 |
|-------------|----------|------|
| 400 | Bad Request | 请求参数验证失败 |
| 401 | Unauthorized | 未提供认证令牌或令牌无效 |
| 403 | Forbidden | 权限不足，无法访问该资源 |
| 404 | Not Found | 请求的资源不存在 |
| 409 | Conflict | 资源冲突（如邮箱已存在） |
| 413 | Payload Too Large | 上传文件过大 |
| 422 | Unprocessable Entity | 请求格式正确但语义错误 |
| 500 | Internal Server Error | 服务器内部错误 |

## 小程序/App 特殊考虑

### 1. 离线支持
- 支持离线记账，数据本地存储
- 网络恢复后自动同步到服务器
- 冲突解决策略：以服务器数据为准

### 2. 快速记账
- 提供快速记账接口，减少必填字段
- 支持语音转文字记账
- 支持扫码记账（二维码、条形码）

### 3. 推送通知
- 账本有新交易时推送通知
- 预算超支提醒
- 成员加入/退出通知

### 4. 数据同步
- 增量同步机制，减少数据传输
- 支持手动刷新和自动同步
- 同步状态指示器

### 5. 性能优化
- 图片压缩和缓存
- 分页加载和虚拟滚动
- 接口响应缓存

## 使用示例

### 小程序快速记账流程
```javascript
// 1. 用户登录
const loginRes = await wx.request({
  url: 'http://localhost:3001/auth/login',
  method: 'POST',
  data: {
    email: 'user@example.com',
    password: 'password123'
  }
});

const token = loginRes.data.data.access_token;
wx.setStorageSync('token', token);

// 2. 获取账本列表
const ledgersRes = await wx.request({
  url: 'http://localhost:3001/ledgers',
  method: 'GET',
  header: {
    'Authorization': `Bearer ${token}`
  }
});

const currentLedger = ledgersRes.data.data[0];

// 3. 快速记账
const transactionRes = await wx.request({
  url: `http://localhost:3001/ledgers/${currentLedger.id}/transactions`,
  method: 'POST',
  header: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  data: {
    type: 'EXPENSE',
    amount: 25.50,
    description: '地铁',
    date: '2024-01-01',
    categoryId: 'cat_transport',
    accountId: 'acc_alipay'
  }
});
```

### App 报表查看流程
```javascript
// 获取月度收支概览
const overviewRes = await fetch(`http://localhost:3001/ledgers/${ledgerId}/reports/overview?period=month&date=2024-01`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const overviewData = await overviewRes.json();

// 获取分类统计
const categoriesRes = await fetch(`http://localhost:3001/ledgers/${ledgerId}/reports/categories?type=EXPENSE&period=month&date=2024-01`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const categoriesData = await categoriesRes.json();
```

## 注意事项

1. **数据安全**: 所有敏感数据传输都使用HTTPS加密
2. **权限控制**: 用户只能访问自己参与的账本数据
3. **数据验证**: 所有输入数据都会进行严格验证
4. **并发控制**: 支持多用户同时操作同一账本
5. **数据备份**: 定期备份用户数据，防止数据丢失
6. **API限流**: 实施API调用频率限制，防止滥用
7. **版本兼容**: 保持API向后兼容，支持客户端渐进式升级