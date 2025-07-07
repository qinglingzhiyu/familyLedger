# 数据库设计说明

## 数据库选择

**数据库类型**: PostgreSQL  
**ORM**: Prisma  
**连接方式**: Supabase 云数据库

## 核心数据表结构

### 1. 用户表 (users)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | String | PRIMARY KEY, CUID | 用户唯一标识 |
| email | String | UNIQUE, NOT NULL | 用户邮箱 |
| phone | String | UNIQUE, NULLABLE | 用户手机号 |
| password | String | NOT NULL | 加密后的密码 |
| nickname | String | NOT NULL | 用户昵称 |
| avatar | String | NULLABLE | 头像URL |
| status | UserStatus | DEFAULT: ACTIVE | 用户状态 |
| createdAt | DateTime | DEFAULT: now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

**用户状态枚举 (UserStatus)**:
- ACTIVE: 活跃
- INACTIVE: 非活跃
- SUSPENDED: 暂停

### 2. 账本表 (ledgers)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | String | PRIMARY KEY, CUID | 账本唯一标识 |
| name | String | NOT NULL | 账本名称 |
| description | String | NULLABLE | 账本描述 |
| cover | String | NULLABLE | 封面图片URL |
| currency | String | DEFAULT: "CNY" | 货币类型 |
| status | LedgerStatus | DEFAULT: ACTIVE | 账本状态 |
| createdAt | DateTime | DEFAULT: now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

**账本状态枚举 (LedgerStatus)**:
- ACTIVE: 活跃
- ARCHIVED: 已归档
- DELETED: 已删除

### 3. 账本成员表 (ledger_members)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | String | PRIMARY KEY, CUID | 成员关系唯一标识 |
| userId | String | FOREIGN KEY | 用户ID |
| ledgerId | String | FOREIGN KEY | 账本ID |
| role | MemberRole | DEFAULT: MEMBER | 成员角色 |
| joinedAt | DateTime | DEFAULT: now() | 加入时间 |

**复合唯一约束**: (userId, ledgerId)

**成员角色枚举 (MemberRole)**:
- OWNER: 所有者
- ADMIN: 管理员
- MEMBER: 普通成员

### 4. 账户表 (accounts)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | String | PRIMARY KEY, CUID | 账户唯一标识 |
| name | String | NOT NULL | 账户名称 |
| type | AccountType | NOT NULL | 账户类型 |
| balance | Decimal(15,2) | DEFAULT: 0 | 账户余额 |
| currency | String | DEFAULT: "CNY" | 货币类型 |
| icon | String | NULLABLE | 图标 |
| color | String | NULLABLE | 颜色 |
| isDefault | Boolean | DEFAULT: false | 是否默认账户 |
| userId | String | FOREIGN KEY | 用户ID |
| ledgerId | String | FOREIGN KEY | 账本ID |
| createdAt | DateTime | DEFAULT: now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

**账户类型枚举 (AccountType)**:
- CASH: 现金
- BANK_CARD: 银行卡
- CREDIT_CARD: 信用卡
- ALIPAY: 支付宝
- WECHAT: 微信
- OTHER: 其他

### 5. 分类表 (categories)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | String | PRIMARY KEY, CUID | 分类唯一标识 |
| name | String | NOT NULL | 分类名称 |
| icon | String | NULLABLE | 图标 |
| color | String | NULLABLE | 颜色 |
| type | TransactionType | NOT NULL | 交易类型 |
| parentId | String | FOREIGN KEY, NULLABLE | 父分类ID |
| ledgerId | String | FOREIGN KEY | 账本ID |
| isSystem | Boolean | DEFAULT: false | 是否系统分类 |
| sortOrder | Integer | DEFAULT: 0 | 排序顺序 |
| createdAt | DateTime | DEFAULT: now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

### 6. 交易记录表 (transactions)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | String | PRIMARY KEY, CUID | 交易唯一标识 |
| amount | Decimal(15,2) | NOT NULL | 交易金额 |
| type | TransactionType | NOT NULL | 交易类型 |
| description | String | NULLABLE | 交易描述 |
| note | String | NULLABLE | 备注 |
| images | String[] | ARRAY | 图片URL数组 |
| date | DateTime | NOT NULL | 交易日期 |
| userId | String | FOREIGN KEY | 用户ID |
| ledgerId | String | FOREIGN KEY | 账本ID |
| accountId | String | FOREIGN KEY | 账户ID |
| categoryId | String | FOREIGN KEY | 分类ID |
| status | TransactionStatus | DEFAULT: CONFIRMED | 交易状态 |
| createdAt | DateTime | DEFAULT: now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

**交易类型枚举 (TransactionType)**:
- INCOME: 收入
- EXPENSE: 支出
- TRANSFER: 转账

**交易状态枚举 (TransactionStatus)**:
- PENDING: 待确认
- CONFIRMED: 已确认
- CANCELLED: 已取消

## 关系说明

### 一对多关系
- User → LedgerMember (一个用户可以是多个账本的成员)
- User → Transaction (一个用户可以有多个交易记录)
- User → Account (一个用户可以有多个账户)
- Ledger → LedgerMember (一个账本可以有多个成员)
- Ledger → Transaction (一个账本可以有多个交易记录)
- Ledger → Category (一个账本可以有多个分类)
- Ledger → Account (一个账本可以有多个账户)
- Account → Transaction (一个账户可以有多个交易记录)
- Category → Transaction (一个分类可以有多个交易记录)

### 多对多关系
- User ↔ Ledger (通过 LedgerMember 中间表)

### 自关联关系
- Category → Category (父子分类关系)

## 索引建议

### 主要索引
- users.email (唯一索引)
- users.phone (唯一索引)
- ledger_members(userId, ledgerId) (复合唯一索引)
- transactions.date (普通索引，用于按日期查询)
- transactions.userId (普通索引)
- transactions.ledgerId (普通索引)
- transactions.accountId (普通索引)
- transactions.categoryId (普通索引)

## 数据完整性

### 外键约束
- 所有外键关系都设置了 `onDelete: Cascade`，确保数据一致性
- 删除用户时，相关的账本成员关系、交易记录、账户都会被级联删除
- 删除账本时，相关的成员关系、交易记录、分类、账户都会被级联删除

### 数据验证
- 邮箱格式验证
- 密码长度验证（最少6位）
- 金额精度控制（15位整数，2位小数）
- 枚举值验证