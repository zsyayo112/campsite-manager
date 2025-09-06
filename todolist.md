# 营地客人信息管理网站开发清单

## 项目概述
一个基于 Next.js 的全栈营地客人信息管理系统，包含用户认证、套餐预订、客户管理等核心功能。

---

## 阶段一：项目基础搭建（学习基础知识）

### 1. 环境准备
- [x] 安装 Node.js (版本 18 或以上)
- [x] 安装 VS Code 代码编辑器
- [x] 安装 Git 版本控制工具
- [x] 创建 GitHub 账户
- [x] 学习基本的命令行操作

### 2. Next.js 项目初始化
- [x] 创建新的 Next.js 项目 `npx create-next-app@latest campsite-manager`
- [ ] 理解项目文件结构
- [ ] 学习 Next.js 基本概念（组件、页面、路由）
- [x] 运行开发服务器 `npm run dev`
- [ ] 修改首页，显示"营地管理系统"

### 3. 基础UI框架搭建
- [x] 安装 Tailwind CSS 样式框架
- [ ] 创建基础布局组件 `components/Layout.js`
- [ ] 设计顶部导航栏
- [ ] 设计侧边栏菜单
- [ ] 创建响应式设计

---

## 阶段二：用户界面设计（学习组件开发）

### 4. 页面结构设计
- [ ] 创建主页面 `/app/page.js` (已存在，需修改)
- [ ] 创建登录页面 `/app/login/page.js`
- [ ] 创建注册页面 `/app/register/page.js`
- [ ] 创建仪表板页面 `/app/dashboard/page.js`
- [ ] 学习 Next.js App Router 路由系统

### 5. 基础组件开发
- [ ] 创建按钮组件 `components/Button.js`
- [ ] 创建输入框组件 `components/Input.js`
- [ ] 创建卡片组件 `components/Card.js`
- [ ] 创建表格组件 `components/Table.js`
- [ ] 创建模态框组件 `components/Modal.js`

### 6. 表单处理
- [ ] 学习 React Hook Form 库
- [ ] 创建登录表单
- [ ] 创建注册表单
- [ ] 添加表单验证
- [ ] 学习状态管理（useState, useEffect）

---

## 阶段三：数据库设计（学习后端基础）

### 7. 数据库选择和设置
- [ ] 学习数据库基础概念
- [ ] 选择数据库（推荐 PostgreSQL 或 SQLite）
- [ ] 安装 Prisma ORM
- [ ] 设计数据库模式（schema）

### 8. 数据模型设计
- [ ] 设计用户表（users）
  - id, username, email, password, role, created_at
- [ ] 设计营地套餐表（packages）
  - id, name, description, price, duration, capacity
- [ ] 设计预订表（bookings）
  - id, user_id, package_id, check_in, check_out, status
- [ ] 设计客户信息表（guests）
  - id, booking_id, name, phone, emergency_contact

### 9. 数据库连接
- [ ] 配置 Prisma 客户端
- [ ] 创建数据库迁移
- [ ] 编写种子数据
- [ ] 测试数据库连接

---

## 阶段四：用户认证系统（学习认证机制）

### 10. 认证基础设置
- [ ] 学习 JWT 令牌概念
- [ ] 安装 NextAuth.js 或实现自定义认证
- [ ] 配置密码加密（bcrypt）
- [ ] 设置环境变量

### 11. 认证功能实现
- [ ] 实现用户注册 API `/api/auth/register`
- [ ] 实现用户登录 API `/api/auth/login`
- [ ] 实现登出功能
- [ ] 添加受保护的路由
- [ ] 创建用户会话管理

### 12. 权限管理
- [ ] 设计角色系统（管理员、员工、客户）
- [ ] 实现权限检查中间件
- [ ] 限制不同角色的页面访问
- [ ] 添加权限错误处理

---

## 阶段五：核心功能开发（学习CRUD操作）

### 13. 营地套餐管理
- [ ] 创建套餐列表页面 `/app/packages/page.js`
- [ ] 创建添加套餐页面 `/app/packages/add/page.js`
- [ ] 创建编辑套餐页面 `/app/packages/[id]/edit/page.js`
- [ ] 实现套餐 CRUD API
  - [ ] GET `/api/packages` - 获取套餐列表
  - [ ] POST `/api/packages` - 创建套餐
  - [ ] PUT `/api/packages/[id]` - 更新套餐
  - [ ] DELETE `/api/packages/[id]` - 删除套餐

### 14. 预订管理系统
- [ ] 创建预订页面 `/app/bookings/page.js`
- [ ] 创建新预订页面 `/app/bookings/new/page.js`
- [ ] 实现日期选择器
- [ ] 添加可用性检查
- [ ] 实现预订 CRUD API
- [ ] 添加预订状态管理（待确认、已确认、已完成、已取消）

### 15. 客户信息管理
- [ ] 创建客户列表页面 `/app/guests/page.js`
- [ ] 创建客户详情页面 `/app/guests/[id]/page.js`
- [ ] 实现客户信息搜索功能
- [ ] 添加客户信息导出功能
- [ ] 实现客户信息 CRUD API

---

## 阶段六：高级功能（学习复杂业务逻辑）

### 16. 仪表板和统计
- [ ] 创建管理员仪表板
- [ ] 添加预订统计图表
- [ ] 显示收入统计
- [ ] 添加客户活动时间线
- [ ] 集成图表库（Chart.js 或 Recharts）

### 17. 搜索和过滤
- [ ] 实现客户信息搜索
- [ ] 添加预订日期过滤
- [ ] 实现套餐价格范围过滤
- [ ] 添加高级搜索功能

### 18. 文件上传功能
- [ ] 实现套餐图片上传
- [ ] 添加客户头像上传
- [ ] 配置云存储（Cloudinary 或 AWS S3）
- [ ] 优化图片处理

---

## 阶段七：用户体验优化（学习性能优化）

### 19. 性能优化
- [ ] 实现页面加载状态
- [ ] 添加骨架屏效果
- [ ] 优化图片加载
- [ ] 实现数据分页
- [ ] 添加缓存策略

### 20. 错误处理和验证
- [ ] 创建全局错误处理
- [ ] 添加 404 页面
- [ ] 实现表单验证错误显示
- [ ] 添加网络错误处理
- [ ] 实现用户友好的错误信息

### 21. 响应式设计优化
- [ ] 优化移动端界面
- [ ] 测试平板设备兼容性
- [ ] 实现侧边栏收缩功能
- [ ] 优化触摸交互

---

## 阶段八：测试和部署（学习测试和运维）

### 22. 测试实现
- [ ] 学习单元测试概念
- [ ] 安装 Jest 测试框架
- [ ] 编写组件测试
- [ ] 编写 API 测试
- [ ] 实现端到端测试

### 23. 部署准备
- [ ] 配置生产环境变量
- [ ] 优化构建配置
- [ ] 设置数据库生产环境
- [ ] 配置域名和 SSL

### 24. 部署上线
- [ ] 选择部署平台（Vercel、Netlify 或 Railway）
- [ ] 配置自动部署
- [ ] 设置生产数据库
- [ ] 监控应用性能
- [ ] 备份策略设置

---

## 阶段九：高级特性（可选扩展）

### 25. 通知系统
- [ ] 邮件通知功能
- [ ] 短信提醒服务
- [ ] 站内消息系统
- [ ] 预订确认自动化

### 26. 报表系统
- [ ] 财务报表生成
- [ ] 客户统计报告
- [ ] 套餐受欢迎度分析
- [ ] 导出 PDF 报告

### 27. 移动端优化
- [ ] PWA 功能实现
- [ ] 离线访问支持
- [ ] 推送通知
- [ ] 移动端专属功能

---

## 学习资源推荐

### 必读文档
- [ ] Next.js 官方文档 (https://nextjs.org/docs)
- [ ] React 官方文档 (https://react.dev)
- [ ] Tailwind CSS 文档 (https://tailwindcss.com/docs)
- [ ] Prisma 文档 (https://prisma.io/docs)

### 推荐教程
- [ ] Next.js 官方教程
- [ ] React 基础课程
- [ ] JavaScript ES6+ 特性
- [ ] 数据库设计基础

### 实用工具
- [ ] Postman API 测试工具
- [ ] Chrome 开发者工具
- [ ] React 开发者工具
- [ ] Git 版本控制

---

## 注意事项

### 开发原则
1. **循序渐进**：每完成一个阶段再进入下一个，确保基础扎实
2. **实践为主**：边做边学，多写代码多练习
3. **记录过程**：遇到问题和解决方案都要记录下来
4. **版本控制**：每个功能完成后都要提交到 Git
5. **测试习惯**：开发过程中要经常测试功能
6. **代码整洁**：保持代码格式整洁，添加必要的注释

### 时间规划
- **阶段一到三**：约 2-3 周（基础学习）
- **阶段四到六**：约 3-4 周（核心开发）
- **阶段七到八**：约 2-3 周（优化部署）
- **阶段九**：根据兴趣选择性实现

---

## 项目文件结构

```
campsite-manager/
├── app/                    # App Router 页面
│   ├── page.js            # 首页
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   ├── dashboard/         # 仪表板
│   ├── packages/          # 套餐管理
│   ├── bookings/          # 预订管理
│   ├── guests/            # 客户管理
│   └── api/               # API 路由
├── components/             # 可复用组件
├── lib/                   # 工具函数和配置
├── prisma/                # 数据库相关
├── public/                # 静态资源
├── todolist.md           # 开发清单（本文件）
└── README.md             # 项目说明
```

---

## 完成标志

### 项目完成检查清单
- [ ] 项目可以正常运行
- [ ] 所有核心功能都已实现
- [ ] 代码已部署到生产环境
- [ ] 通过基本的用户测试
- [ ] 项目文档完整
- [ ] 具备基本的错误处理能力
- [ ] 移动端适配良好
- [ ] 性能表现良好

---

## 技术栈总结

**前端**：Next.js 14, React 18, Tailwind CSS, React Hook Form  
**后端**：Next.js API Routes, Prisma ORM  
**数据库**：PostgreSQL / SQLite  
**认证**：NextAuth.js / 自定义 JWT  
**部署**：Vercel / Netlify / Railway  
**测试**：Jest, React Testing Library

---

## 下一步行动

当前需要完成的任务：
1. [ ] 理解项目文件结构
2. [ ] 学习 Next.js 基本概念
3. [ ] 修改首页，显示"营地管理系统"

开始时间：[填写日期]  
预计完成时间：[填写日期]