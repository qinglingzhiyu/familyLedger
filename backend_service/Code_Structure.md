# 后端代码结构方案

## 项目目录结构

```
backend_service/
├── prisma/                    # Prisma 配置和数据库模式
│   ├── schema.prisma          # 数据库模式定义
│   └── migrations/            # 数据库迁移文件（自动生成）
├── src/                       # 源代码目录
│   ├── app.module.ts          # 应用主模块
│   ├── main.ts                # 应用入口文件
│   ├── prisma/                # Prisma 服务模块
│   │   ├── prisma.module.ts   # Prisma 模块定义
│   │   └── prisma.service.ts  # Prisma 服务
│   ├── auth/                  # 认证模块
│   │   ├── auth.module.ts     # 认证模块定义
│   │   ├── auth.service.ts    # 认证服务
│   │   ├── auth.controller.ts # 认证控制器
│   │   ├── guards/            # 认证守卫
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── local-auth.guard.ts
│   │   └── strategies/        # 认证策略
│   │       ├── jwt.strategy.ts
│   │       └── local.strategy.ts
│   ├── users/                 # 用户模块
│   │   ├── users.module.ts    # 用户模块定义
│   │   ├── users.service.ts   # 用户服务
│   │   ├── users.controller.ts # 用户控制器
│   │   ├── dto/               # 数据传输对象
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── login-user.dto.ts
│   │   └── entities/          # 实体定义
│   │       └── user.entity.ts
│   ├── ledgers/               # 账本模块（待开发）
│   ├── transactions/          # 交易模块（待开发）
│   ├── accounts/              # 账户模块（待开发）
│   ├── categories/            # 分类模块（待开发）
│   └── common/                # 公共模块（待开发）
│       ├── decorators/        # 自定义装饰器
│       ├── filters/           # 异常过滤器
│       ├── interceptors/      # 拦截器
│       └── pipes/             # 管道
├── test/                      # 测试文件
├── .env                       # 环境变量配置
├── .gitignore                 # Git 忽略文件
├── package.json               # 项目依赖配置
├── tsconfig.json              # TypeScript 配置
├── nest-cli.json              # NestJS CLI 配置
└── README.md                  # 项目说明文档
```

## 模块设计原则

### 1. 模块化架构
- **单一职责**: 每个模块只负责一个特定的业务领域
- **松耦合**: 模块间通过明确的接口进行通信
- **高内聚**: 模块内部功能紧密相关
- **可重用**: 模块可以在不同场景下复用

### 2. 分层架构
```
┌─────────────────────────────────────┐
│           Controller Layer          │  # 控制器层：处理HTTP请求
├─────────────────────────────────────┤
│            Service Layer            │  # 服务层：业务逻辑处理
├─────────────────────────────────────┤
│         Data Access Layer           │  # 数据访问层：数据库操作
├─────────────────────────────────────┤
│           Database Layer            │  # 数据库层：数据存储
└─────────────────────────────────────┘
```

## 核心模块详解

### 1. 应用入口模块

#### main.ts
- **职责**: 应用程序启动入口
- **功能**:
  - 创建 NestJS 应用实例
  - 配置全局管道、过滤器、拦截器
  - 启用 CORS 跨域支持
  - 配置应用监听端口

#### app.module.ts
- **职责**: 应用主模块，组装所有功能模块
- **功能**:
  - 导入所有功能模块
  - 配置全局模块（如 ConfigModule）
  - 定义全局提供者

### 2. 数据库模块 (prisma/)

#### prisma.service.ts
- **职责**: 数据库连接和操作服务
- **功能**:
  - 管理数据库连接生命周期
  - 提供数据库操作接口
  - 处理连接池和事务

#### prisma.module.ts
- **职责**: Prisma 模块定义
- **功能**:
  - 全局模块，所有其他模块都可以注入 PrismaService
  - 统一管理数据库配置

### 3. 认证模块 (auth/)

#### auth.service.ts
- **职责**: 认证业务逻辑
- **功能**:
  - 用户登录验证
  - JWT Token 生成
  - 用户注册处理
  - 密码验证

#### auth.controller.ts
- **职责**: 认证相关的 HTTP 接口
- **功能**:
  - 用户注册接口
  - 用户登录接口
  - Token 刷新接口（待实现）

#### guards/
- **jwt-auth.guard.ts**: JWT 认证守卫，保护需要认证的路由
- **local-auth.guard.ts**: 本地认证守卫，用于登录验证

#### strategies/
- **jwt.strategy.ts**: JWT 验证策略，解析和验证 JWT Token
- **local.strategy.ts**: 本地认证策略，验证用户名密码

### 4. 用户模块 (users/)

#### users.service.ts
- **职责**: 用户相关业务逻辑
- **功能**:
  - 用户 CRUD 操作
  - 用户信息验证
  - 密码加密处理
  - 用户状态管理

#### users.controller.ts
- **职责**: 用户相关的 HTTP 接口
- **功能**:
  - 用户列表查询
  - 用户详情查询
  - 用户信息更新
  - 用户删除

#### dto/
- **create-user.dto.ts**: 创建用户的数据传输对象
- **update-user.dto.ts**: 更新用户的数据传输对象
- **login-user.dto.ts**: 用户登录的数据传输对象

#### entities/
- **user.entity.ts**: 用户实体定义，用于序列化响应数据

## 代码组织规范

### 1. 文件命名规范
- **模块文件**: `*.module.ts`
- **服务文件**: `*.service.ts`
- **控制器文件**: `*.controller.ts`
- **DTO 文件**: `*.dto.ts`
- **实体文件**: `*.entity.ts`
- **守卫文件**: `*.guard.ts`
- **策略文件**: `*.strategy.ts`

### 2. 类命名规范
- **模块类**: `XxxModule`
- **服务类**: `XxxService`
- **控制器类**: `XxxController`
- **DTO 类**: `XxxDto`
- **实体类**: `XxxEntity`
- **守卫类**: `XxxGuard`
- **策略类**: `XxxStrategy`

### 3. 方法命名规范
- **查询方法**: `find*`, `get*`
- **创建方法**: `create*`
- **更新方法**: `update*`
- **删除方法**: `remove*`, `delete*`
- **验证方法**: `validate*`

## 数据流向

### 1. 请求处理流程
```
HTTP Request
    ↓
Controller (路由处理)
    ↓
Guard (认证授权)
    ↓
Pipe (数据验证和转换)
    ↓
Service (业务逻辑)
    ↓
Prisma Service (数据访问)
    ↓
Database (数据存储)
    ↓
HTTP Response
```

### 2. 模块依赖关系
```
AppModule
├── ConfigModule (全局配置)
├── PrismaModule (数据库服务)
├── AuthModule
│   └── UsersModule (依赖用户服务)
└── UsersModule
    └── PrismaModule (依赖数据库服务)
```

## 扩展指南

### 1. 添加新模块
1. 创建模块目录：`src/module-name/`
2. 创建基础文件：
   - `module-name.module.ts`
   - `module-name.service.ts`
   - `module-name.controller.ts`
3. 创建 DTO 和实体文件
4. 在 `app.module.ts` 中导入新模块

### 2. 添加新功能
1. 在对应模块的 service 中添加业务逻辑
2. 在 controller 中添加 HTTP 接口
3. 创建相应的 DTO 进行数据验证
4. 更新 API 文档

### 3. 数据库模型变更
1. 修改 `prisma/schema.prisma`
2. 运行 `npx prisma generate` 生成客户端
3. 运行 `npx prisma db push` 同步数据库
4. 更新相关的 DTO 和实体

## 最佳实践

### 1. 错误处理
- 使用 NestJS 内置的异常类
- 创建自定义异常过滤器
- 统一错误响应格式

### 2. 数据验证
- 使用 class-validator 进行输入验证
- 在 DTO 中定义验证规则
- 启用全局验证管道

### 3. 安全性
- 使用 JWT 进行身份认证
- 密码使用 bcrypt 加密
- 启用 CORS 保护
- 输入数据严格验证

### 4. 性能优化
- 使用 Prisma 的查询优化
- 合理使用数据库索引
- 实现分页查询
- 考虑缓存策略

### 5. 测试策略
- 单元测试：测试服务层业务逻辑
- 集成测试：测试控制器和数据库交互
- E2E 测试：测试完整的 API 流程

## 开发工作流

### 1. 开发环境设置
```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 生成 Prisma 客户端
npx prisma generate

# 同步数据库
npx prisma db push

# 启动开发服务器
npm run start:dev
```

### 2. 代码提交规范
- 使用语义化提交信息
- 代码格式化：`npm run format`
- 代码检查：`npm run lint`
- 运行测试：`npm run test`

### 3. 部署流程
1. 构建生产版本：`npm run build`
2. 运行数据库迁移：`npx prisma migrate deploy`
3. 启动生产服务：`npm run start:prod`

## 总结

本代码结构方案采用了 NestJS 的模块化架构，通过清晰的分层设计和模块划分，确保了代码的可维护性、可扩展性和可测试性。每个模块都有明确的职责边界，通过依赖注入实现松耦合设计，为后续功能扩展和团队协作奠定了良好的基础。