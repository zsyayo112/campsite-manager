# Git 工作流指南

## 分支策略

我们采用 **Git Flow** 分支模型：

### 主要分支

#### `main` 分支

- **用途**：生产环境代码
- **特点**：始终保持稳定，可直接部署
- **保护**：不允许直接推送，只能通过 PR 合并

#### `develop` 分支

- **用途**：开发主分支
- **特点**：包含最新的开发功能
- **来源**：从 `main` 分支创建
- **去向**：合并到 `main` 分支

### 辅助分支

#### `feature/功能名称` 分支

- **用途**：开发新功能
- **命名**：`feature/user-auth`、`feature/booking-system`
- **来源**：从 `develop` 分支创建
- **去向**：合并到 `develop` 分支

#### `hotfix/修复名称` 分支

- **用途**：紧急修复生产环境问题
- **命名**：`hotfix/login-bug`、`hotfix/security-patch`
- **来源**：从 `main` 分支创建
- **去向**：合并到 `main` 和 `develop` 分支

#### `release/版本号` 分支

- **用途**：准备发布版本
- **命名**：`release/v1.0.0`、`release/v1.1.0`
- **来源**：从 `develop` 分支创建
- **去向**：合并到 `main` 和 `develop` 分支

## 工作流程

### 1. 开发新功能

```bash
# 1. 切换到 develop 分支并更新
git checkout develop
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/user-auth

# 3. 开发和提交
git add .
git commit -m "feat: 添加用户登录功能"

# 4. 推送到远程
git push origin feature/user-auth

# 5. 创建 Pull Request 到 develop 分支
```

### 2. 修复 Bug

```bash
# 1. 从 develop 创建 bugfix 分支
git checkout develop
git checkout -b bugfix/fix-sidebar-collapse

# 2. 修复和提交
git add .
git commit -m "fix: 修复侧边栏折叠问题"

# 3. 推送并创建 PR
git push origin bugfix/fix-sidebar-collapse
```

### 3. 紧急修复（Hotfix）

```bash
# 1. 从 main 创建 hotfix 分支
git checkout main
git checkout -b hotfix/critical-security-fix

# 2. 修复和提交
git add .
git commit -m "fix: 修复安全漏洞"

# 3. 合并到 main
git checkout main
git merge hotfix/critical-security-fix
git tag v1.0.1

# 4. 合并到 develop
git checkout develop
git merge hotfix/critical-security-fix

# 5. 删除 hotfix 分支
git branch -d hotfix/critical-security-fix
```

### 4. 版本发布

```bash
# 1. 从 develop 创建 release 分支
git checkout develop
git checkout -b release/v1.1.0

# 2. 版本准备（更新版本号、文档等）
git add .
git commit -m "chore: 准备 v1.1.0 版本发布"

# 3. 合并到 main
git checkout main
git merge release/v1.1.0
git tag v1.1.0

# 4. 合并到 develop
git checkout develop
git merge release/v1.1.0

# 5. 删除 release 分支
git branch -d release/v1.1.0
```

## 提交信息规范

### 提交类型

- **feat**: 新功能
- **fix**: Bug 修复
- **docs**: 文档更新
- **style**: 代码格式调整（不影响代码运行）
- **refactor**: 重构（既不是新增功能，也不是修改 bug）
- **test**: 添加测试
- **chore**: 构建过程或辅助工具的变动

### 提交格式

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 示例

```bash
# 好的提交信息
git commit -m "feat(auth): 添加用户登录功能"
git commit -m "fix(ui): 修复侧边栏在移动端的显示问题"
git commit -m "docs: 更新 API 文档"
git commit -m "style: 统一代码格式"

# 不好的提交信息
git commit -m "修改"
git commit -m "update"
git commit -m "fix bug"
```

## 代码审查规范

### Pull Request 要求

1. **描述清晰**：说明改动内容和原因
2. **测试覆盖**：确保新功能有对应的测试
3. **代码质量**：通过 ESLint 和 Prettier 检查
4. **功能完整**：确保功能完整可用
5. **文档更新**：如有必要，更新相关文档

### PR 模板

```markdown
## 改动说明

简要描述本次改动的内容

## 改动类型

- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新
- [ ] 样式调整

## 测试

- [ ] 已添加相关测试
- [ ] 现有测试通过
- [ ] 手动测试通过

## 检查清单

- [ ] 代码通过 ESLint 检查
- [ ] 代码通过 Prettier 格式化
- [ ] 提交信息符合规范
- [ ] 相关文档已更新
```

## 常用命令

### 分支操作

```bash
# 查看所有分支
git branch -a

# 删除本地分支
git branch -d feature/branch-name

# 删除远程分支
git push origin --delete feature/branch-name

# 重命名分支
git branch -m old-name new-name
```

### 合并操作

```bash
# 普通合并
git merge feature/branch-name

# 不快进合并（保留分支历史）
git merge --no-ff feature/branch-name

# 压缩合并（将多个提交合并为一个）
git merge --squash feature/branch-name
```

### 版本标签

```bash
# 创建标签
git tag v1.0.0

# 推送标签
git push origin v1.0.0

# 查看所有标签
git tag -l

# 删除标签
git tag -d v1.0.0
git push origin --delete v1.0.0
```
