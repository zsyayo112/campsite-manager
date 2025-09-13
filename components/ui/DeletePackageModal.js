import { useState } from 'react'
import { Button } from './FormComponents'

export default function DeletePackageModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  packageData,
  hasBookings = false 
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('删除失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              {hasBookings ? '停用套餐' : '删除套餐'}
            </h3>
            <p className="text-sm text-gray-500">
              {hasBookings ? '此套餐有关联预订，将被停用而不是删除' : '此操作不可撤销'}
            </p>
          </div>
        </div>

        {packageData && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{packageData.name}</h4>
            <p className="text-sm text-gray-600">{packageData.description}</p>
            <p className="text-sm text-gray-500 mt-1">
              价格: {packageData.priceFormatted} | 容量: {packageData.capacity}人
            </p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-700">
            {hasBookings 
              ? '确定要停用这个套餐吗？停用后客户将无法预订此套餐，但现有预订不受影响。'
              : '确定要删除这个套餐吗？此操作将永久删除套餐信息，且无法恢复。'
            }
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={isDeleting}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            variant="danger"
            className="flex-1"
            loading={isDeleting}
            disabled={isDeleting}
          >
            {isDeleting 
              ? (hasBookings ? '停用中...' : '删除中...') 
              : (hasBookings ? '确认停用' : '确认删除')
            }
          </Button>
        </div>
      </div>
    </div>
  )
}