---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*)
argument-hint: [message] | --no-verify
description: 创建符合规范的 Git 提交(使用中文提交信息)
---

# 智能 Git 提交

创建规范的提交信息: $ARGUMENTS

## 当前仓库状态

- Git 状态: !`git status --porcelain`
- 当前分支: !`git branch --show-current`
- 已暂存的更改: !`git diff --cached --stat`
- 未暂存的更改: !`git diff --stat`
- 最近提交: !`git log --oneline -5`

## 此命令的功能

1. 使用 `git status` 检查哪些文件已暂存
2. 如果没有文件被暂存，自动使用 `git add` 添加所有修改和新文件
3. 执行 `git diff` 理解即将提交的更改
4. 分析差异，判断是否存在多个不同的逻辑更改
5. 如果检测到多个不同的更改，建议将提交拆分为多个较小的提交
6. 为每个提交创建中文格式的提交信息

## 提交格式

使用 `<类型>: <中文描述>` 格式，类型为以下之一：

- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更改
- `style`: 代码样式更改（格式化等）
- `refactor`: 既不修复错误也不添加功能的代码更改
- `perf`: 性能改进
- `test`: 添加或修复测试
- `chore`: 构建过程、工具等的更改
- `ci`: CI/CD 改进
- `revert`: 还原更改

**规则**：
- 描述使用简洁中文，第一行不超过 72 个字符
- 每个提交只做一件事（原子提交）

## 示例

单次提交：
- `feat: 添加用户认证系统`
- `fix: 修复渲染过程中的内存泄漏`
- `refactor: 简化解析器中的错误处理逻辑`
- `chore: 更新 package.json 依赖`

拆分提交：
- `feat: 添加交易验证的业务逻辑`
- `test: 为交易验证添加单元测试`
- `docs: 更新 API 文档，添加交易端点说明`

## 拆分提交的判断标准

1. 对代码库中不相关部分的更改
2. 混合了功能、修复、重构等不同类型
3. 拆分后会更容易理解或审查

## 重要说明

- 如果特定文件已暂存，仅提交这些文件
- 如果没有文件被暂存，自动暂存所有修改和新文件
- 提交前检查差异，确保信息与更改匹配
- 如果建议多次提交，分别暂存和提交各部分更改