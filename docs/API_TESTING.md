# 营地管理系统 API 测试指南

## 概述

本文档提供营地管理系统所有API端点的测试指南和示例。

## 基础配置

### 环境
- 开发环境: `http://localhost:3000`
- 生产环境: `https://your-domain.com`

### 认证
所有API请求都需要在Cookie中包含有效的JWT token。

```javascript
// 登录获取token
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
})
```

## API 端点测试

### 1. 用户认证 API

#### 用户登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

#### 用户注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. 套餐管理 API

#### 获取套餐列表
```bash
# 基本请求
curl -X GET "http://localhost:3000/api/packages" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# 带分页和过滤
curl -X GET "http://localhost:3000/api/packages?page=1&limit=10&status=ACTIVE&search=豪华" \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

#### 创建套餐 (管理员权限)
```bash
curl -X POST http://localhost:3000/api/packages \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "测试套餐",
    "description": "这是一个测试套餐",
    "pricePerDay": 29900,
    "duration": 3,
    "capacity": 4,
    "amenities": ["帐篷", "篝火", "烧烤架"],
    "images": ["https://example.com/image1.jpg"],
    "status": "ACTIVE"
  }'
```

#### 获取套餐详情
```bash
curl -X GET http://localhost:3000/api/packages/PACKAGE_ID \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

#### 更新套餐 (管理员权限)
```bash
curl -X PUT http://localhost:3000/api/packages/PACKAGE_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "更新的套餐名称",
    "pricePerDay": 39900
  }'
```

#### 删除套餐 (管理员权限)
```bash
curl -X DELETE http://localhost:3000/api/packages/PACKAGE_ID \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN"
```

### 3. 预订管理 API

#### 获取预订列表
```bash
# 客户查看自己的预订
curl -X GET "http://localhost:3000/api/bookings" \
  -H "Cookie: auth-token=YOUR_TOKEN"

# 管理员查看所有预订
curl -X GET "http://localhost:3000/api/bookings?status=PENDING&page=1&limit=20" \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN"
```

#### 检查可用性
```bash
curl -X POST http://localhost:3000/api/bookings/availability \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "packageId": "PACKAGE_ID",
    "checkIn": "2024-10-01",
    "checkOut": "2024-10-04",
    "guestCount": 2
  }'
```

#### 创建预订
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "packageId": "PACKAGE_ID",
    "checkIn": "2024-10-01",
    "checkOut": "2024-10-04",
    "guestCount": 2,
    "specialRequests": "素食需求"
  }'
```

#### 获取预订详情
```bash
curl -X GET http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

#### 更新预订状态 (员工/管理员权限)
```bash
curl -X PUT http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_STAFF_TOKEN" \
  -d '{
    "status": "CONFIRMED"
  }'
```

#### 批量更新预订状态 (员工/管理员权限)
```bash
curl -X PUT http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_STAFF_TOKEN" \
  -d '{
    "bookingIds": ["BOOKING_ID1", "BOOKING_ID2"],
    "newStatus": "CONFIRMED"
  }'
```

### 4. 客户管理 API

#### 获取客户列表 (员工/管理员权限)
```bash
curl -X GET "http://localhost:3000/api/guests?search=张三&page=1&limit=50" \
  -H "Cookie: auth-token=YOUR_STAFF_TOKEN"
```

#### 获取客户详情 (员工/管理员权限)
```bash
curl -X GET http://localhost:3000/api/guests/GUEST_ID \
  -H "Cookie: auth-token=YOUR_STAFF_TOKEN"
```

#### 更新客户信息 (员工/管理员权限)
```bash
curl -X PUT http://localhost:3000/api/guests/GUEST_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_STAFF_TOKEN" \
  -d '{
    "name": "张三",
    "phone": "13800138000",
    "emergencyContact": "李四",
    "emergencyPhone": "13900139000"
  }'
```

#### 导出客户数据 (管理员权限)
```bash
curl -X GET "http://localhost:3000/api/guests/export?format=csv" \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN" \
  -o guests_export.csv
```

### 5. 用户管理 API

#### 获取用户列表 (管理员权限)
```bash
curl -X GET "http://localhost:3000/api/users?role=guest&page=1&limit=100" \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN"
```

## 测试用例示例

### JavaScript 测试示例

```javascript
// 完整的预订流程测试
async function testBookingFlow() {
  // 1. 登录
  const loginResponse = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: 'customer@example.com',
      password: 'password123'
    })
  });
  
  // 2. 获取套餐列表
  const packagesResponse = await fetch('/api/packages?status=ACTIVE', {
    credentials: 'include'
  });
  const packages = await packagesResponse.json();
  const packageId = packages.data.packages[0].id;
  
  // 3. 检查可用性
  const availabilityResponse = await fetch('/api/bookings/availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      packageId,
      checkIn: '2024-10-01',
      checkOut: '2024-10-04',
      guestCount: 2
    })
  });
  const availability = await availabilityResponse.json();
  
  if (availability.data.available) {
    // 4. 创建预订
    const bookingResponse = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        packageId,
        checkIn: '2024-10-01',
        checkOut: '2024-10-04',
        guestCount: 2,
        specialRequests: '测试预订'
      })
    });
    const booking = await bookingResponse.json();
    console.log('预订创建成功:', booking.data.booking.confirmationCode);
  }
}
```

## 错误处理测试

### 常见错误状态码
- `400`: 请求参数错误
- `401`: 未认证或token无效
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突（如预订时间冲突）
- `500`: 服务器内部错误

### 测试无效请求
```bash
# 测试无效的预订日期
curl -X POST http://localhost:3000/api/bookings/availability \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{
    "packageId": "invalid-id",
    "checkIn": "2024-01-01",
    "checkOut": "2023-12-31",
    "guestCount": 0
  }'
```

## 性能测试

### 并发测试示例
```bash
# 使用 ab (Apache Benchmark) 进行压力测试
ab -n 100 -c 10 -H "Cookie: auth-token=YOUR_TOKEN" \
   "http://localhost:3000/api/packages"
```

## 自动化测试脚本

参考 `scripts/test-system.sh` 和 `scripts/test-system.bat` 文件获取完整的自动化测试脚本。