'use client'

import Form from '../../../components/form/Form'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Loading from '../../../components/ui/Loading'

export default function ComponentDemo() {
  const handleFormSubmit = async (e) => {
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    console.log('表单提交:', data)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UI组件库演示
          </h1>
          <p className="text-lg text-gray-600">
            营地管理系统基础组件展示
          </p>
        </div>

        <div className="space-y-12">

          {/* 按钮组件演示 */}
          <Card>
            <Card.Header>
              <Card.Title>Button 按钮组件</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">按钮变体</h4>
                  <div className="space-y-3">
                    <div><Button variant="primary">主要按钮</Button></div>
                    <div><Button variant="secondary">次要按钮</Button></div>
                    <div><Button variant="outline">边框按钮</Button></div>
                    <div><Button variant="danger">危险按钮</Button></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">按钮尺寸</h4>
                  <div className="space-y-3">
                    <div><Button size="sm">小尺寸</Button></div>
                    <div><Button size="md">中等尺寸</Button></div>
                    <div><Button size="lg">大尺寸</Button></div>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* 输入框组件演示 */}
          <Card>
            <Card.Header>
              <Card.Title>Input 输入框组件</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="基础输入框"
                    placeholder="请输入内容"
                  />
                  <Input
                    label="邮箱输入"
                    type="email"
                    placeholder="user@example.com"
                  />
                  <Input
                    label="密码输入"
                    type="password"
                    placeholder="请输入密码"
                  />
                </div>
                <div className="space-y-4">
                  <Input
                    label="错误状态"
                    error="这是错误信息"
                    placeholder="输入框错误状态"
                  />
                  <Input
                    label="帮助文本"
                    helperText="这是帮助文本信息"
                    placeholder="带帮助文本"
                  />
                  <Input
                    label="禁用状态"
                    disabled
                    defaultValue="禁用的输入框"
                  />
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* 加载组件演示 */}
          <Card>
            <Card.Header>
              <Card.Title>Loading 加载组件</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">旋转器</h4>
                  <div className="flex items-center space-x-4">
                    <Loading.Spinner size="sm" />
                    <Loading.Spinner size="md" />
                    <Loading.Spinner size="lg" />
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* 表单组件演示 - 简化版本 */}
          <Card>
            <Card.Header>
              <Card.Title>Form 表单组件</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="max-w-md">
                <Form onSubmit={handleFormSubmit}>
                  <Input
                    name="username"
                    label="用户名"
                    placeholder="请输入用户名"
                    required
                  />
                  <Input
                    name="email"
                    type="email"
                    label="邮箱"
                    placeholder="请输入邮箱"
                    required
                  />
                  <Input
                    name="password"
                    type="password"
                    label="密码"
                    placeholder="请输入密码"
                    required
                  />
                  <Button type="submit" fullWidth>
                    提交表单
                  </Button>
                </Form>
              </div>
            </Card.Content>
          </Card>

        </div>
      </div>
    </div>
  )
}
