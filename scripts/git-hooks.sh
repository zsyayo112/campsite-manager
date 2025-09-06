#!/bin/bash

# Git Hooks 设置脚本
# 用于设置项目的 Git hooks

echo "🚀 设置 Git Hooks..."

# 创建 hooks 目录（如果不存在）
mkdir -p .git/hooks

# 创建 pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔍 运行 pre-commit 检查..."

# 检查是否有文件被暂存
if git diff --cached --quiet; then
    echo "❌ 没有文件被暂存，跳过检查"
    exit 0
fi

# 运行 ESLint 检查
echo "📝 运行 ESLint..."
npm run lint:fix
if [ $? -ne 0 ]; then
    echo "❌ ESLint 检查失败，请修复错误后再提交"
    exit 1
fi

# 运行 Prettier 格式化
echo "🎨 运行 Prettier..."
npm run format
if [ $? -ne 0 ]; then
    echo "❌ Prettier 格式化失败"
    exit 1
fi

# 重新添加格式化后的文件
git add .

echo "✅ Pre-commit 检查通过"
exit 0
EOF

# 创建 commit-msg hook
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

# 提交信息格式检查
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

error_msg="❌ 提交信息格式错误！

请使用以下格式：
  feat: 添加新功能
  fix: 修复bug
  docs: 更新文档
  style: 代码格式调整
  refactor: 重构代码
  test: 添加测试
  chore: 构建工具或依赖更新

示例：
  feat: 添加用户登录功能
  fix: 修复页面跳转bug
  docs: 更新README文档"

if ! grep -qE "$commit_regex" "$1"; then
    echo "$error_msg" >&2
    exit 1
fi

echo "✅ 提交信息格式正确"
EOF

# 创建 pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

echo "🚀 运行 pre-push 检查..."

# 运行完整的代码检查
echo "🔍 运行完整检查..."
npm run check-all
if [ $? -ne 0 ]; then
    echo "❌ 代码检查失败，请修复后再推送"
    exit 1
fi

# 尝试构建项目
echo "🏗️ 测试项目构建..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败，请修复后再推送"
    exit 1
fi

echo "✅ Pre-push 检查通过"
exit 0
EOF

# 设置执行权限
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg
chmod +x .git/hooks/pre-push

echo "✅ Git Hooks 设置完成！

已设置的 hooks：
  - pre-commit: 提交前代码格式化和检查
  - commit-msg: 提交信息格式检查
  - pre-push: 推送前完整检查和构建测试

现在你的每次提交都会自动进行代码检查和格式化！"
