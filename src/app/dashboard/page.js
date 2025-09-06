// import Layout from '../../components/layout/Layout'
import Layout from '../../../components/layout/Layout'

// 模拟用户数据
const mockUser = {
  name: '张管理员',
  email: 'admin@campsite.com',
  role: '系统管理员'
}

// 模拟统计数据
const stats = [
  {
    name: '总预订数',
    value: '2,651',
    change: '+4.75%',
    changeType: 'positive',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: '活跃客户',
    value: '1,423',
    change: '+2.02%',
    changeType: 'positive',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    )
  },
  {
    name: '月收入',
    value: '¥89,400',
    change: '+12.5%',
    changeType: 'positive',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    )
  },
  {
    name: '入住率',
    value: '78.2%',
    change: '-3.1%',
    changeType: 'negative',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
]

// 最近预订数据
const recentBookings = [
  {
    id: 'BK001',
    guestName: '李小明',
    package: '豪华帐篷套餐',
    checkIn: '2024-03-15',
    checkOut: '2024-03-17',
    status: 'confirmed',
    amount: '¥1,280'
  },
  {
    id: 'BK002', 
    guestName: '王美丽',
    package: '标准露营套餐',
    checkIn: '2024-03-16',
    checkOut: '2024-03-18',
    status: 'pending',
    amount: '¥680'
  },
  {
    id: 'BK003',
    guestName: '张三丰',
    package: 'VIP度假套餐',
    checkIn: '2024-03-18',
    checkOut: '2024-03-20',
    status: 'confirmed',
    amount: '¥2,100'
  }
]

function StatCard({ stat }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="p-2 bg-green-100 rounded-lg">
            <div className="text-green-600">
              {stat.icon}
            </div>
          </div>
        </div>
        <div className="ml-4 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {stat.name}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </div>
              <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'positive' ? (
                  <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="ml-1">{stat.change}</span>
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}

function getStatusBadge(status) {
  const styles = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800', 
    cancelled: 'bg-red-100 text-red-800'
  }
  
  const labels = {
    confirmed: '已确认',
    pending: '待确认',
    cancelled: '已取消'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function DashboardPage() {
  return (
    <Layout title="仪表板" user={mockUser}>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* 最近预订 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">最近预订</h3>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                查看全部
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{booking.guestName}</h4>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-sm text-gray-600">{booking.package}</p>
                    <p className="text-xs text-gray-500">
                      {booking.checkIn} 至 {booking.checkOut}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-medium text-gray-900">{booking.amount}</p>
                    <p className="text-xs text-gray-500">#{booking.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                <svg className="w-8 h-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium text-gray-900">新建预订</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">添加客户</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
                <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm font-medium text-gray-900">管理套餐</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200">
                <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">查看报表</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 营地状态概览 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">营地状态概览</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-500">已入住</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-500">今日入住</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">5</div>
              <div className="text-sm text-gray-500">今日退房</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}