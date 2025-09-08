import { prisma } from '../../../lib/prisma'

export default async function TestDB() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">数据库连接测试</h1>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="border p-4 rounded">
            <p><strong>用户名:</strong> {user.username}</p>
            <p><strong>邮箱:</strong> {user.email}</p>
            <p><strong>角色:</strong> {user.role}</p>
            <p><strong>创建时间:</strong> {user.createdAt.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
