# 家庭记账本后端服务

基于 NestJS + Prisma + PostgreSQL 构建的现代化家庭记账本后端 API 服务。

## 🚀 技术栈

- **框架**: NestJS v11 (Node.js + TypeScript)
- **数据库**: PostgreSQL (Supabase)
- **ORM**: Prisma v6
- **认证**: JWT + Passport
- **验证**: class-validator + class-transformer
- **密码加密**: bcryptjs

## 📋 功能特性

### 已实现功能
- ✅ 用户注册和登录
- ✅ JWT 身份认证
- ✅ 用户信息管理 (CRUD)
- ✅ 密码加密存储
- ✅ 数据验证和转换
- ✅ 统一响应格式
- ✅ CORS 跨域支持

### 待实现功能
- 🔄 账本管理
- 🔄 交易记录管理
- 🔄 账户管理
- 🔄 分类管理
- 🔄 数据统计和报表
- 🔄 文件上传
- 🔄 数据导入导出

## 🛠️ 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL 数据库

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置数据库连接和其他环境变量：
```env
# 数据库连接字符串
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT 密钥
JWT_SECRET="your-jwt-secret-key-here"

# 应用端口
PORT=3001
```

### 数据库设置

1. 生成 Prisma 客户端：
```bash
npx prisma generate
```

2. 同步数据库结构：
```bash
npx prisma db push
```

3. (可选) 查看数据库：
```bash
npx prisma studio
```

### 启动服务

#### 开发模式
```bash
npm run start:dev
```

#### 生产模式
```bash
npm run build
npm run start:prod
```

服务启动后，访问 `http://localhost:3001` 即可使用 API。

## 📚 API 文档

详细的 API 接口文档请查看：[API_Spec.md](./API_Spec.md)

### 快速测试

#### 1. 用户注册
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nickname": "测试用户"
  }'
```

#### 2. 用户登录
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 3. 获取用户列表（需要 Token）
```bash
curl -X GET http://localhost:3001/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🏗️ 项目结构

```
backend_service/
├── prisma/                    # Prisma 配置和数据库模式
│   └── schema.prisma          # 数据库模式定义
├── src/                       # 源代码目录
│   ├── app.module.ts          # 应用主模块
│   ├── main.ts                # 应用入口文件
│   ├── prisma/                # Prisma 服务模块
│   ├── auth/                  # 认证模块
│   │   ├── guards/            # 认证守卫
│   │   └── strategies/        # 认证策略
│   └── users/                 # 用户模块
│       ├── dto/               # 数据传输对象
│       └── entities/          # 实体定义
├── .env                       # 环境变量配置
├── package.json               # 项目依赖配置
└── README.md                  # 项目说明文档
```

详细的代码结构说明请查看：[Code_Structure.md](./Code_Structure.md)

## 🗄️ 数据库设计

数据库采用 PostgreSQL，通过 Prisma ORM 进行管理。主要数据表包括：

- **users**: 用户表
- **ledgers**: 账本表
- **ledger_members**: 账本成员表
- **accounts**: 账户表
- **categories**: 分类表
- **transactions**: 交易记录表

详细的数据库设计说明请查看：[DB_Schema.md](./DB_Schema.md)

## 🔧 开发指南

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 NestJS 官方编码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化

### 运行代码检查
```bash
# 代码格式化
npm run format

# 代码检查
npm run lint

# 修复代码问题
npm run lint:fix
```

### 运行测试
```bash
# 单元测试
npm run test

# 测试覆盖率
npm run test:cov

# E2E 测试
npm run test:e2e
```

### 数据库操作

```bash
# 重置数据库
npx prisma db push --force-reset

# 生成迁移文件
npx prisma migrate dev --name migration_name

# 应用迁移
npx prisma migrate deploy

# 查看数据库
npx prisma studio
```

## 🚀 部署指南

### Docker 部署

1. 构建 Docker 镜像：
```bash
docker build -t family-ledger-backend .
```

2. 运行容器：
```bash
docker run -p 3001:3001 \
  -e DATABASE_URL="your_database_url" \
  -e JWT_SECRET="your_jwt_secret" \
  family-ledger-backend
```

### 云服务部署

推荐部署平台：
- **Vercel**: 适合快速部署和测试
- **Railway**: 支持数据库和应用一体化部署
- **Heroku**: 传统的云应用平台
- **AWS/阿里云**: 企业级部署方案

## 🔒 安全性

- ✅ JWT Token 认证
- ✅ 密码 bcrypt 加密
- ✅ 输入数据验证
- ✅ SQL 注入防护 (Prisma)
- ✅ CORS 跨域保护
- 🔄 Rate Limiting (待实现)
- 🔄 API 访问日志 (待实现)

## 📈 性能优化

- ✅ Prisma 查询优化
- ✅ 数据库连接池
- 🔄 Redis 缓存 (待实现)
- 🔄 分页查询优化 (待实现)
- 🔄 CDN 静态资源加速 (待实现)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

### 提交信息规范

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 创建 Issue
- 发送邮件
- 提交 Pull Request

## 🔗 相关链接

- [NestJS 官方文档](https://nestjs.com/)
- [Prisma 官方文档](https://www.prisma.io/docs/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [JWT 官方网站](https://jwt.io/)

---

**Happy Coding! 🎉**
