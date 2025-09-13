import { useState } from 'react'

export default function EditHistory({ history = [] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredHistory = history.filter(item =>
    item.field?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.oldValue?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.newValue?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return '➕'
      case 'UPDATE': return '✏️'
      case 'DELETE': return '🗑️'
      default: return '📝'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>暂无编辑历史</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          编辑历史 ({history.length}条记录)
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-green-600 hover:text-green-700 text-sm font-medium"
        >
          {isExpanded ? '收起' : '展开'}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* 搜索框 */}
          {history.length > 5 && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="搜索编辑记录..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          {/* 历史记录列表 */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredHistory.map((item, index) => (
              <div key={index} className="border-l-4 border-green-200 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getActionIcon(item.action)}</span>
                    <span className="font-medium text-gray-900">
                      {item.action === 'CREATE' ? '创建' :
                       item.action === 'UPDATE' ? '更新' :
                       item.action === 'DELETE' ? '删除' : '修改'}
                    </span>
                    {item.field && (
                      <span className="text-sm text-gray-600">
                        - {item.field}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.timestamp)}
                  </span>
                </div>

                {item.action === 'UPDATE' && item.oldValue !== undefined && (
                  <div className="mt-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">修改前:</span>
                        <span className="ml-2 text-red-600 bg-red-50 px-2 py-1 rounded">
                          {String(item.oldValue)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">修改后:</span>
                        <span className="ml-2 text-green-600 bg-green-50 px-2 py-1 rounded">
                          {String(item.newValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {item.description && (
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                )}

                {item.user && (
                  <p className="mt-1 text-xs text-gray-500">
                    操作者: {item.user.username || item.user.email}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 统计信息 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <span className="block text-lg font-semibold text-blue-600">
                  {history.filter(h => h.action === 'CREATE').length}
                </span>
                <span className="text-gray-600">创建</span>
              </div>
              <div>
                <span className="block text-lg font-semibold text-green-600">
                  {history.filter(h => h.action === 'UPDATE').length}
                </span>
                <span className="text-gray-600">更新</span>
              </div>
              <div>
                <span className="block text-lg font-semibold text-red-600">
                  {history.filter(h => h.action === 'DELETE').length}
                </span>
                <span className="text-gray-600">删除</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}