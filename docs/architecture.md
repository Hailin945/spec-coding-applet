# Monorepo 架构说明

## 项目结构

```
spec-coding-applet/
├── apps/
│   ├── applet/          # 微信小程序（Taro 4.x + React）
│   ├── web/             # PC 端（Next.js）
│   └── server/          # 后端（NestJS + Prisma + PostgreSQL）
│
├── packages/
│   ├── types/           # 共享类型定义
│   ├── api/             # API 调用封装
│   ├── utils/           # 纯函数工具
│   └── constants/       # 共享常量
│
├── .cursor/rules/       # AI 编码规范
└── docs/                # 文档
```

## 依赖关系

```
apps/applet  ──┐
apps/web     ──┼──> packages/api ──> packages/types
               │                 └──> packages/utils
               │                      packages/constants
               │
apps/server  ──┘──> packages/types（只读）
```

## 技术栈

### 前端
- **小程序**：Taro 4.x + React + Zustand + CSS Modules
- **PC 端**：Next.js 14 (App Router) + React + Zustand + CSS Modules

### 后端
- **框架**：NestJS
- **数据库**：PostgreSQL + Prisma
- **架构**：COLA 分层架构（adapter/application/domain/infrastructure）

### 工具链
- **包管理**：pnpm workspace
- **构建工具**：Turbo
- **语言**：TypeScript

## 认证方案

- **小程序**：微信 openid + JWT
- **PC 端**：账号密码 + JWT

## 开发流程

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发

```bash
# 启动所有服务
pnpm dev

# 或单独启动
cd apps/applet && pnpm dev
cd apps/web && pnpm dev
cd apps/server && pnpm dev
```

### 3. 新增功能

1. 在 `packages/types` 定义类型
2. 在 `apps/server` 实现后端逻辑
3. 在 `packages/api` 封装接口调用
4. 在 `apps/applet` 或 `apps/web` 使用

## AI 编码规范

所有 AI 编码规范位于 `.cursor/rules/` 目录：
- `global.mdc` - 全局规范
- `server.mdc` - 后端规范
- `applet.mdc` - 小程序规范
- `web.mdc` - PC 端规范

## 注意事项

1. **禁止循环依赖**：packages 之间不能循环依赖
2. **禁止跨 app 引用**：apps 之间不能直接引用代码
3. **类型优先**：新增功能先定义类型
4. **代码复用**：重复代码提取到 packages
5. **架构边界**：严格遵守 COLA 分层规范
