# 技术选型与架构说明

## 核心技术栈

### 后端框架
- **语言**: TypeScript
- **运行时**: Node.js (v18+)
- **框架**: NestJS v10
- **架构模式**: 模块化架构 (Modular Architecture)

### 数据库与ORM
- **数据库**: PostgreSQL
- **云服务**: Supabase
- **ORM**: Prisma v6
- **数据库客户端**: @prisma/client

### 认证与安全
- **认证方式**: JWT (JSON Web Token)
- **认证库**: @nestjs/jwt, @nestjs/passport
- **策略**: passport-local, passport-jwt
- **密码加密**: bcryptjs
- **Token 有效期**: 7天

### 数据验证
- **验证库**: class-validator
- **数据转换**: class-transformer
- **管道**: ValidationPipe (全局启用)

### 配置管理
- **配置库**: @nestjs/config
- **环境变量**: .env 文件
- **全局配置**: 支持多环境配置

## 项目架构

### 整体架构
```
家庭记账本后端服务
├── 表现层 (Presentation Layer)
│   ├── Controllers (控制器)
│   ├── DTOs (数据传输对象)
│   └── Guards (守卫)
├── 业务逻辑层 (Business Logic Layer)
│   ├── Services (服务)
│   ├── Entities (实体)
│   └── Strategies (策略)
├── 数据访问层 (Data Access Layer)
│   ├── Prisma Service
│   └── Database Models
└── 基础设施层 (Infrastructure Layer)
    ├── Configuration
    ├── Authentication
    └── Validation
```

### 模块划分

#### 1. 核心模块 (Core Modules)
- **AppModule**: 应用主模块，负责模块组装和全局配置
- **PrismaModule**: 数据库连接模块，提供全局数据库服务
- **ConfigModule**: 配置管理模块，处理环境变量和应用配置

#### 2. 功能模块 (Feature Modules)
- **UsersModule**: 用户管理模块
  - 用户CRUD操作
  - 用户信息验证
  - 用户状态管理
- **AuthModule**: 认证授权模块
  - 用户注册登录
  - JWT Token 生成和验证
  - 密码加密和验证

#### 3. 共享模块 (Shared Modules)
- **Guards**: 路由守卫
  - JwtAuthGuard: JWT认证守卫
  - LocalAuthGuard: 本地认证守卫
- **Strategies**: 认证策略
  - JwtStrategy: JWT验证策略
  - LocalStrategy: 本地登录策略

## 技术选型理由

### NestJS 框架选择
**优势**:
- **TypeScript 原生支持**: 提供强类型检查和更好的开发体验
- **模块化架构**: 清晰的模块划分，便于维护和扩展
- **装饰器模式**: 简化代码编写，提高可读性
- **依赖注入**: 松耦合设计，便于测试和维护
- **丰富的生态**: 内置支持多种功能模块
- **企业级**: 适合构建大型、复杂的后端应用

### Prisma ORM 选择
**优势**:
- **类型安全**: 自动生成类型定义，减少运行时错误
- **数据库迁移**: 简化数据库版本管理
- **查询构建器**: 直观的API设计
- **多数据库支持**: 支持PostgreSQL、MySQL、SQLite等
- **性能优化**: 自动查询优化和连接池管理
- **开发体验**: 优秀的IDE支持和错误提示

### PostgreSQL 数据库选择
**优势**:
- **ACID 事务**: 保证数据一致性
- **丰富的数据类型**: 支持JSON、数组等复杂类型
- **扩展性**: 支持水平和垂直扩展
- **性能**: 优秀的查询性能和并发处理能力
- **开源**: 无许可费用，社区活跃
- **云服务支持**: Supabase提供托管服务

### JWT 认证选择
**优势**:
- **无状态**: 服务器不需要存储会话信息
- **跨域支持**: 适合前后端分离架构
- **可扩展**: 支持分布式部署
- **标准化**: 业界标准，兼容性好
- **安全性**: 支持签名验证，防止篡改

## 性能优化策略

### 数据库优化
- **连接池**: Prisma 自动管理数据库连接池
- **查询优化**: 使用 Prisma 的查询优化功能
- **索引策略**: 在关键字段上建立索引
- **分页查询**: 避免一次性加载大量数据

### 缓存策略
- **应用级缓存**: 可集成 Redis 进行数据缓存
- **查询缓存**: 缓存频繁查询的结果
- **静态资源缓存**: CDN 加速静态资源访问

### 安全策略
- **输入验证**: 使用 class-validator 进行严格的输入验证
- **SQL 注入防护**: Prisma 自动防护 SQL 注入
- **密码安全**: bcrypt 加密存储密码
- **CORS 配置**: 限制跨域访问来源
- **Rate Limiting**: 可集成限流中间件

## 部署架构

### 开发环境
- **本地开发**: Node.js + PostgreSQL (本地或Docker)
- **热重载**: NestJS 内置开发服务器
- **调试支持**: VS Code 调试配置

### 生产环境建议
- **容器化**: Docker + Docker Compose
- **负载均衡**: Nginx 或云服务负载均衡器
- **数据库**: 云数据库服务 (如 Supabase、AWS RDS)
- **监控**: 日志收集和性能监控
- **CI/CD**: GitHub Actions 或其他 CI/CD 工具

## 扩展性考虑

### 水平扩展
- **无状态设计**: JWT 认证支持多实例部署
- **数据库读写分离**: 支持主从复制
- **微服务架构**: 可拆分为多个独立服务

### 功能扩展
- **模块化设计**: 新功能可独立开发和部署
- **插件系统**: 支持第三方插件集成
- **API 版本控制**: 支持多版本 API 并存

## 开发规范

### 代码规范
- **TypeScript**: 严格模式，启用所有类型检查
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **命名规范**: 驼峰命名法，语义化命名

### 文档规范
- **API 文档**: OpenAPI/Swagger 规范
- **代码注释**: JSDoc 格式注释
- **README**: 详细的项目说明和使用指南

### 测试策略
- **单元测试**: Jest 测试框架
- **集成测试**: 端到端测试
- **API 测试**: Postman 或自动化测试
- **测试覆盖率**: 目标覆盖率 > 80%

## 依赖管理

### 核心依赖
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/config": "^3.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@prisma/client": "^6.11.1",
  "prisma": "^6.11.1",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "passport-local": "^1.0.0",
  "bcryptjs": "^2.4.3",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1"
}
```

### 开发依赖
```json
{
  "@types/node": "^20.0.0",
  "@types/passport-local": "^1.0.38",
  "@types/passport-jwt": "^4.0.1",
  "@types/bcryptjs": "^2.4.6",
  "typescript": "^5.0.0",
  "ts-node": "^10.0.0"
}
```

## 总结

本项目采用现代化的技术栈，注重类型安全、开发效率和系统可维护性。通过 NestJS + Prisma + PostgreSQL 的组合，提供了一个稳定、高性能、易扩展的后端服务架构，能够满足家庭记账本应用的各种需求，并为未来的功能扩展奠定了良好的基础。