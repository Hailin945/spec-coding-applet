# spec-coding-applet

工具类小程序 + PC 端 Monorepo 项目

## 技术栈

- **小程序**：Taro 4.x + React + Zustand
- **PC 端**：Next.js 14 + React + Zustand
- **后端**：NestJS + Prisma + PostgreSQL（COLA 架构）
- **工具链**：pnpm + Turbo + TypeScript

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动所有服务
pnpm dev

# 构建所有项目
pnpm build

# 类型检查
pnpm type-check
```

## 项目结构

```
├── apps/
│   ├── applet/          # 微信小程序
│   ├── web/             # PC 端
│   └── server/          # 后端服务
├── packages/
│   ├── types/           # 共享类型
│   ├── api/             # API 调用
│   ├── utils/           # 工具函数
│   └── constants/       # 常量
└── .cursor/rules/       # AI 编码规范
```

详细架构说明见 [docs/architecture.md](./docs/architecture.md)

## 认证方案

- 小程序：微信 openid + JWT
- PC 端：账号密码 + JWT
