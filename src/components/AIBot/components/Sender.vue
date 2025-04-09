<script setup lang="ts">
import { message, Flex, Spin, Space, Badge, Button } from 'ant-design-vue'
import { Sender, BubbleList, type BubbleListProps, Attachments } from 'ant-design-x-vue'
import { computed, h, ref, watch } from 'vue'
import { UserOutlined, CloudUploadOutlined, LinkOutlined } from '@ant-design/icons-vue'
import { DBService } from '../services/db.service'
import { ApiService, apiConfig } from '../services/api.service'
import { MessageService, type ChatMessage } from '../services/message.service'

defineOptions({ name: 'Sender' })

const [messageApi, contextHolder] = message.useMessage()

const searchValue = ref('Hello? this is X!')
const loading = ref<boolean>(false)

// 角色配置
const rolesAsObject: BubbleListProps['roles'] = {
  ai: {
    placement: 'start',
    avatar: { icon: h(UserOutlined), style: { background: '#fde3cf' } },
    header: 'AI',
    typing: { step: 5, interval: 20 },
    style: {
      maxWidth: '600px',
    },
    loadingRender: () => h(Space, null, [h(Spin, { size: 'small' }), '思考中...']),
    messageRender: (items: any) =>
      h(Flex, { vertical: true, gap: 'middle' }, () =>
        items.map((item: any) => {
          if (item.type === 'reasoning_content' && item.content) {
            return h(
              'div',
              {
                class: 'reasoning-content',
                style: {
                  background: '#e3f0ff',
                  padding: '12px',
                  borderRadius: '6px',
                  marginTop: '8px',
                  fontSize: '14px',
                  color: '#666',
                  borderLeft: '4px solid #1890ff',
                },
              },
              [
                h(
                  'div',
                  {
                    style: {
                      fontWeight: 'bold',
                      marginBottom: '4px',
                      color: '#1890ff',
                    },
                  },
                  () => '推理过程：',
                ),
                item.content,
              ],
            )
          }
          return h('div', { class: 'message-content' }, item.content)
        }),
      ),
  },
  user: {
    placement: 'end',
    header: 'User',
    avatar: {
      icon: h(UserOutlined),
      style: { background: '#87d068' },
    },
  },
}

const items = ref<any>([])

// 判断是否有对话内容
const hasMessages = computed(() => items.value && items.value.length > 0)

// 接收当前聊天ID
const props = defineProps<{
  currentChatId?: string
}>()

// 监听当前聊天ID变化
watch(
  () => props.currentChatId,
  async (newChatId) => {
    if (newChatId) {
      await loadChatHistory(newChatId)
    } else {
      items.value = []
    }
  },
)

// 加载聊天历史
const loadChatHistory = async (chatId: string) => {
  try {
    const messages = await DBService.loadChatHistory(chatId)

    items.value = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }))

    // 自动滚动到底部
    scrollToBottom()
  } catch (error) {
    console.error(error)
    messageApi.error('加载聊天历史失败')
  }
}

// 滚动到底部
const scrollToBottom = () => {
  const messagesContainer = document.querySelector('.messages-container')
  if (messagesContainer) {
    // 使用 requestAnimationFrame 确保在下一帧渲染前执行滚动
    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    })
  }
}

// 发送消息
const emit = defineEmits(['create-chat'])

const onSubmit = async () => {
  const newChatId = Date.now().toString()
  const chatId = props.currentChatId || newChatId

  // 如果没有当前聊天ID，创建新对话
  if (!props.currentChatId) {
    await emit('create-chat', {
      id: newChatId,
      title: searchValue.value.slice(0, 20) + '...',
      groupId: 'default',
      createdAt: Date.now(),
    })
  }

  // 创建用户消息
  const userMessage: ChatMessage = {
    id: Date.now(),
    role: 'user',
    content: searchValue.value,
    timestamp: Date.now(),
    chatId,
  }

  // 创建AI消息占位
  const aiMessage: ChatMessage = {
    id: Date.now() + 1,
    role: 'ai',
    content: [
      { type: 'reasoning_content', content: '' },
      { type: 'content', content: '' },
    ],
    timestamp: Date.now(),
    chatId,
  }

  try {
    // 保存用户消息到数据库
    await DBService.saveMessage(userMessage)

    // 更新UI
    items.value?.push(userMessage)
    items.value?.push(aiMessage)

    // 设置加载状态
    loading.value = true

    // 发送API请求
    const response = await ApiService.sendMessage(searchValue.value)

    // 处理响应
    if (apiConfig.stream) {
      await MessageService.handleStreamResponse(
        response,
        chatId,
        (reasoning_content: string, content: string) => {
          // 更新UI显示
          items.value = [
            ...items.value.slice(0, items.value.length - 1),
            {
              role: 'ai',
              content: [
                { type: 'reasoning_content', content: reasoning_content },
                { type: 'content', content },
              ],
              loading: false,
              timestamp: Date.now(),
            },
          ]
          // 在每次更新内容后滚动到底部
          scrollToBottom()
        },
      )
    } else {
      const aiResponse = await MessageService.handleNormalResponse(response, chatId)
      if (aiResponse) {
        items.value = [
          ...items.value.slice(0, items.value.length - 1),
          {
            role: 'ai',
            content: aiResponse.content,
            loading: false,
            timestamp: aiResponse.timestamp,
          },
        ]
        // 在非流式响应更新后滚动到底部
        scrollToBottom()
      }
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    messageApi.error('请求失败')
  } finally {
    loading.value = false
    searchValue.value = ''
    scrollToBottom()
  }
}

// 重置对话
const reset = () => {
  items.value = []
  searchValue.value = '你好，有什么可以帮你的'
}

// 附件上传相关
const open = ref(false)
const senderRef = ref<any>()
const files = ref<any>([])

// sender 头部
const senderHeader = computed(() =>
  h(
    Sender.Header,
    {
      title: '附件上传',
      styles: {
        content: {
          padding: 0,
        },
      },
      open: open.value,
      onOpenChange: (v: boolean) => (open.value = v),
      forceRender: true,
    },
    {
      default: () =>
        h(Attachments, {
          beforeUpload: () => false,
          items: files.value,
          onChange: ({ fileList }: { fileList: any[] }) => (files.value = fileList),
          placeholder: (type: string) =>
            type === 'drop'
              ? { title: '拖拽文件到此处' }
              : {
                  icon: h(CloudUploadOutlined),
                  title: '上传附件',
                  description: '点击上传或者拖拽文件到此处',
                },
          getDropContainer: () => senderRef.value, // 修复: 移除 .nativeElement
        }),
    },
  ),
)

const badgeNode = computed(() =>
  h(
    Badge,
    { dot: files.value.length > 0 && !open.value },
    {
      default: () =>
        h(Button, {
          onClick: () => (open.value = !open.value),
          icon: h(LinkOutlined),
        }),
    },
  ),
)

defineExpose({
  onSubmit,
  reset,
  hasMessages,
})
</script>

<template>
  <contextHolder />
  <div class="chat-container">
    <div class="messages-container" :class="{ 'has-messages': hasMessages }">
      <BubbleList ref="listRef" :roles="rolesAsObject" :items="items"> </BubbleList>
    </div>
    <div class="sender-container" :class="{ 'has-messages': hasMessages }">
      <Flex vertical gap="middle" style="width: 100%">
        <!--           :header="senderHeader"
          :prefix="badgeNode" -->
        <Sender
          ref="senderRef"
          v-model:value="searchValue"
          :loading="loading"
          @submit="onSubmit"
          @cancel="
            () => {
              loading = false
              messageApi.error('Cancel sending!')
            }
          "
        >
        </Sender>
      </Flex>
    </div>
  </div>
</template>

<style>
.chat-container {
  position: relative;
  max-height: 600px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.messages-container.has-messages {
  padding-bottom: 100px;
}

.sender-container {
  position: absolute;
  left: 0;
  right: 0;
  padding: 20px;
}

/* 当没有消息时，输入框居中 */
.sender-container {
  top: 50%;
  transform: translateY(-50%);
}

/* 当有消息时，输入框固定在底部 */
.sender-container.has-messages {
  bottom: 0;
  top: auto;
  transform: none;
  background: white;
  border-top: 1px solid #eee;
}
.message-timestamp {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
