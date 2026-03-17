# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动所有服务
pnpm build            # 构建所有项目
pnpm type-check       # 类型检查
pnpm lint             # 代码检查
pnpm test             # 运行所有测试
pnpm clean            # 清理构建产物
```

单独运行某个包的测试（以 utils 为例）：
```bash
pnpm --filter @spec-coding/utils test
```

## 项目架构

Monorepo，使用 pnpm workspace + Turbo 构建。

```
apps/applet    # 微信小程序（Taro 4.x + React + Zustand）
apps/web       # PC 端（Next.js 14 App Router + React + Zustand）
apps/server    # 后端（NestJS + Prisma + PostgreSQL，COLA 架构）
packages/types      # 共享 DTO、Entity、接口定义
packages/api        # HTTP 客户端 + 业务 API 封装（基于 axios）
packages/utils      # 纯函数工具
packages/constants  # 共享枚举、常量、路由路径
```

包名前缀统一为 `@spec-coding/`。

### 依赖方向（严格遵守，禁止循环）

```
apps/applet  ─┐
apps/web     ─┼──> packages/api ──> packages/types
              │                 └──> packages/utils, constants
apps/server  ─┘──> packages/types（只读，不依赖 api）
```

### 新增功能开发顺序

1. `packages/types` — 定义 DTO / Entity 类型
2. `apps/server` — 后端实现
3. `packages/api` — 封装 API 调用
4. `apps/applet` 或 `apps/web` — 前端调用

## 后端架构（COLA 分层）

详细规范见 `docs/ai-coding-guidelines.md`。

分层依赖方向：`adapter → application → domain ← infrastructure`

```
apps/server/src/modules/{domain}/
├── adapter/
│   ├── applet/     # AppletJwtGuard，路由前缀 /applet/{domain}
│   └── web/        # WebJwtGuard，路由前缀 /web/{domain}
├── application/
│   ├── command/
│   ├── query/
│   ├── service/
│   ├── executor/   # 复杂流程（3+聚合根 / 5+外部调用 / 100+行）
│   └── assembler/
├── domain/
│   ├── entity/
│   ├── value-object/
│   ├── service/
│   ├── repository/ # 接口定义（禁止导入 NestJS/Prisma）
│   └── event/
├── infrastructure/
│   ├── persistence/ # Prisma 实现 repository 接口
│   ├── gateway/
│   └── mapper/
└── {domain}.module.ts
```

**禁止行为：**
- domain 层禁止导入 NestJS、Prisma、任何框架
- adapter 层禁止直接使用 PrismaService
- adapter 层禁止定义 Command/Query

## 前端规范

**小程序（apps/applet）：**
- 组件禁止直接调用 API，统一通过 store action
- 禁止使用 `document`、`window` 等浏览器 API，禁止直接调用 `Taro.request`
- 样式用 CSS Modules（`.module.scss`）
- page 文件不超过 150 行

**PC 端（apps/web）：**
- Server Component 优先，需要交互时才加 `'use client'`
- Server Component 不使用 store，直接 fetch
- Client Component 禁止直接 fetch
- page 文件不超过 150 行

## 认证方案

- 小程序：`wx.login()` → code → `POST /applet/auth/login` → JWT → `Taro.setStorageSync('token', token)`
- PC 端：账号密码 → `POST /web/auth/login` → JWT → httpOnly cookie

## 代码规范

- TypeScript 严格模式，**禁止 `any` 类型**
- 文件名 kebab-case，组件名 PascalCase，常量 UPPER_SNAKE_CASE
- DTO 命名：`XxxRequest` / `XxxResponse`；Entity：`XxxEntity`
- 箭头函数优先，命名导出优先
- 禁止魔法字符串，使用 `@spec-coding/constants`
