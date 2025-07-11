# 更新日志

## [2024-01-XX] - 软删除和API方法统一

### 重大变更

#### 1. 数据库模型更新
- **添加软删除字段**: 为以下模型添加了 `deletedAt` 字段以支持软删除
  - `Ledger` 模型
  - `LedgerMember` 模型
  - `Account` 模型
  - `Category` 模型
  - `Transaction` 模型
  - `InviteCode` 模型
  - `User` 模型（已存在）

#### 2. API 接口方法统一
- **删除接口**: 所有删除接口从 `DELETE` 方法改为 `POST` 方法，路径添加 `/delete` 后缀
- **更新接口**: 所有更新接口从 `PATCH` 方法改为 `POST` 方法，路径添加 `/update` 后缀

### 具体修改

#### 控制器 (Controllers) 修改

##### AccountsController
- `PATCH /accounts/:id` → `POST /accounts/:id/update`
- `DELETE /accounts/:id` → `POST /accounts/:id/delete`

##### TransactionsController
- `PATCH /transactions/:id` → `POST /transactions/:id/update`
- `DELETE /transactions/:id` → `POST /transactions/:id/delete`
- `DELETE /transactions/batch` → `POST /transactions/batch/delete`

##### LedgersController
- `PATCH /ledgers/:ledgerId` → `POST /ledgers/:ledgerId/update`
- `DELETE /ledgers/:ledgerId` → `POST /ledgers/:ledgerId/delete`
- `DELETE /ledgers/:ledgerId/members/:memberId` → `POST /ledgers/:ledgerId/members/:memberId/remove`

##### CategoriesController
- `PATCH /categories/:id` → `POST /categories/:id/update`
- `DELETE /categories/:id` → `POST /categories/:id/delete`

##### UsersController
- `PATCH /users/:id` → `POST /users/:id/update`
- `PATCH /users/profile` → `POST /users/profile/update`
- `PATCH /users/settings` → `POST /users/settings/update`

#### 服务层 (Services) 修改

##### AccountsService
- `remove()` 方法：移除硬删除逻辑，改为软删除
- 移除关联交易记录检查（软删除不需要）
- 查询条件添加 `deletedAt: null` 过滤

##### TransactionsService
- `remove()` 方法：移除账户余额回滚逻辑，改为软删除
- `removeBatch()` 方法：移除批量硬删除逻辑，改为批量软删除
- 查询条件添加 `deletedAt: null` 过滤

##### CategoriesService
- `remove()` 方法：改为软删除
- 移除关联交易记录检查（软删除不需要）
- 子分类和交易记录查询添加 `deletedAt: null` 过滤

##### LedgersService
- `remove()` 方法：改为软删除

##### LedgerMemberService
- `removeMember()` 方法：改为软删除
- `leaveLedger()` 方法：改为软删除

### 影响说明

#### 前端客户端影响
- **API 调用方法变更**: 所有删除和更新操作需要改为 POST 请求
- **URL 路径变更**: 删除接口添加 `/delete` 后缀，更新接口添加 `/update` 后缀

#### 数据完整性
- **软删除优势**: 删除的数据不会真正丢失，可以恢复
- **查询性能**: 所有查询都需要添加 `deletedAt: null` 条件
- **数据清理**: 需要定期清理软删除的数据以维护性能

### 迁移指南

#### 数据库迁移
```bash
npx prisma db push
```

#### 前端代码更新示例
```javascript
// 旧的删除请求
DELETE /api/accounts/123

// 新的删除请求
POST /api/accounts/123/delete

// 旧的更新请求
PATCH /api/accounts/123

// 新的更新请求
POST /api/accounts/123/update
```

### 注意事项

1. **向后兼容性**: 此更新不向后兼容，所有客户端都需要更新
2. **数据恢复**: 软删除的数据可以通过直接数据库操作恢复（设置 `deletedAt` 为 `null`）
3. **性能考虑**: 建议定期清理长期软删除的数据
4. **权限控制**: 软删除的数据对普通用户不可见，但管理员可以考虑添加恢复功能

### 测试建议

1. 测试所有删除操作确保数据被正确软删除
2. 测试查询操作确保软删除的数据不会被返回
3. 测试更新操作确保新的 POST 方法正常工作
4. 测试级联关系确保软删除不影响关联数据的查询