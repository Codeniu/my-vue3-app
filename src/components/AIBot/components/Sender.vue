<script setup lang="ts">
import { openDB } from 'idb'
import { message, Flex, Spin, Space, Badge, Button } from 'ant-design-vue'
import { Sender, BubbleList, type BubbleListProps, Attachments } from 'ant-design-x-vue'
import { computed, h, onWatcherCleanup, ref, watch } from 'vue'
import { UserOutlined, CloudUploadOutlined, LinkOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'Sender' })

// 添加 API 配置项
const apiConfig = {
  model: 'Qwen/QwQ-32B', // 使用的模型名称
  stream: true, // 是否启用流式响应
  max_tokens: 512, // 生成文本的最大长度
  temperature: 0.7, // 温度参数，控制输出的随机性，越高越随机
  top_p: 0.7, // 核采样阈值，控制输出的多样性
  top_k: 50, // 保留概率最高的前k个token
  frequency_penalty: 0.5, // 频率惩罚，避免重复生成相似内容
  n: 1, // 每次请求生成的回复数量
}

const [messageApi, contextHolder] = message.useMessage()

const searchValue = ref('Hello? this is X!')
const loading = ref<boolean>(false)

const rolesAsObject: BubbleListProps['roles'] = {
  ai: {
    placement: 'start',
    avatar: { icon: h(UserOutlined), style: { background: '#fde3cf' } },
    header: 'AI',
    typing: { step: 5, interval: 20 },
    style: {
      maxWidth: '600px',
    },
    loadingRender: () => h(Space, null, [h(Spin, { size: 'small' }), 'Custom loading...']),
    messageRender: (items: any) =>
      h(
        Flex,
        { vertical: true, gap: 'middle' },
        items.map((item: any) => {
          if (item.type === 'reasoning_content') {
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
                  '推理过程：',
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

interface ChatMessage {
  id: number // 添加必需的 id 字段
  role: 'user' | 'ai'
  content: any
  timestamp: number
  chatId: string
}

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

// 数据库初始化函数
const initDB = async () => {
  return await openDB('chatDB', 1, {
    upgrade(db) {
      // 检查并创建 messages 存储空间
      if (!db.objectStoreNames.contains('messages')) {
        const messagesStore = db.createObjectStore('messages', {
          keyPath: 'id',
          autoIncrement: true,
        })
        // 创建 chatId 索引用于查询
        messagesStore.createIndex('chatId', 'chatId')
      }
    },
  })
}

// 加载聊天历史
const loadChatHistory = async (chatId: string) => {
  try {
    const db = await initDB()
    const tx = db.transaction('messages', 'readonly')
    const store = tx.objectStore('messages')
    const index = store.index('chatId')
    const messages = await index.getAll(chatId)

    items.value = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }))

    // 自动滚动到底部
    const messagesContainer = document.querySelector('.messages-container')
    if (messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }, 100)
    }
  } catch (error) {
    console.error(error)
    messageApi.error('加载聊天历史失败')
  }
}

// 修改 onSubmit 函数中的数据库操作
const emit = defineEmits(['create-chat'])

const onSubmit = async () => {
  const newChatId = Date.now().toString()
  if (!props.currentChatId) {
    // 自动创建新对话
    await emit('create-chat', {
      id: newChatId,
      title: searchValue.value.slice(0, 20) + '...', // 使用用户输入的前20个字符作为标题
      groupId: 'default',
      createdAt: Date.now(),
    })
    console.log('1', newChatId)
  }

  const userMessage: ChatMessage = {
    id: Date.now(),
    role: 'user',
    content: searchValue.value,
    timestamp: Date.now(),
    chatId: props.currentChatId || newChatId,
  }

  const aiMessage: ChatMessage = {
    id: Date.now() + 1,
    role: 'ai',
    content: [
      { type: 'reasoning_content', content: '' },
      { type: 'content', content: '' },
    ],
    timestamp: Date.now(),
    chatId: props.currentChatId || newChatId,
  }

  try {
    const db = await initDB()
    const tx = db.transaction('messages', 'readwrite')
    const store = tx.objectStore('messages')
    await store.add(userMessage)
    await tx.done // 等待事务完成

    items.value?.push(userMessage)
    items.value?.push(aiMessage)

    loading.value = true

    const body = {
      ...apiConfig,
      messages: [{ content: searchValue.value, role: 'user' }],
    }

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer sk-ihpdfwnuksiqamsawakkemytfxfkqbhbqdqltlzrkhvtxjlh',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (apiConfig.stream) {
      await handleStreamResponse(response, String(props.currentChatId))
    } else {
      await handleNormalResponse(response, String(props.currentChatId))
    }
  } catch (error) {
    loading.value = false
    messageApi.error('请求失败')
  }
}

// 流式传输
const handleStreamResponse = async (response: Response, chatId: string) => {
  const rb = await response.body
  if (!rb) throw new Error('Response body is null')

  // 使用 getReader() 方法获取一个可读流的读取器
  // 这个读取器允许我们以块的形式读取响应体中的数据
  // 返回一个 ReadableStreamDefaultReader 对象，用于后续逐块读取数据流
  const reader = rb.getReader()
  // TextDecoder 主要用于将从服务器接收到的二进制数据流解码为可读的文本字符串。
  const decoder = new TextDecoder()
  let content = ''
  let reasoning_content = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        // 检查当前行是否为空或不是以'data: '开头
        // 如果是空行或不是以'data: '开头，则跳过当前行继续处理下一行
        if (!line.trim() || !line.startsWith('data: ')) continue

        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          const response = JSON.parse(data)
          const { choices } = response
          if (choices && choices.length > 0) {
            const { delta } = choices[0]
            if (delta.content) content += delta.content
            if (delta.reasoning_content) reasoning_content += delta.reasoning_content

            // 实时更新界面显示
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
          }
        } catch (e) {
          console.error('解析流数据失败:', e)
        }
      }
    }

    // 流结束后，一次性写入数据库
    const db = await openDB('chatDB', 1)
    const finalAiMessage: ChatMessage = {
      id: Date.now(),
      role: 'ai',
      content: [
        { type: 'reasoning_content', content: reasoning_content },
        { type: 'content', content },
      ],
      timestamp: Date.now(),
      chatId,
    }
    await db.add('messages', finalAiMessage)
  } finally {
    loading.value = false
    searchValue.value = ''
  }
}

const handleNormalResponse = async (response: Response, chatId: string) => {
  const data = await response.json()
  const { choices } = data
  if (choices.length > 0) {
    const {
      message: { content, reasoning_content },
    } = choices[0]

    const aiMessage: ChatMessage = {
      id: Date.now(),
      role: 'ai',
      content: [
        { type: 'reasoning_content', content: reasoning_content },
        { type: 'content', content },
      ],
      timestamp: Date.now(),
      chatId,
    }

    const db = await openDB('chatDB', 1)
    await db.add('messages', aiMessage)

    items.value = [
      ...items.value.slice(0, items.value.length - 1),
      {
        role: 'ai',
        content: aiMessage.content,
        loading: false,
        timestamp: aiMessage.timestamp,
      },
    ]
  }
  loading.value = false
  searchValue.value = ''
}

const reset = () => {
  items.value = []
  searchValue.value = '你好，有什么可以帮你的'
}

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
          getDropContainer: () => senderRef.value?.nativeElement,
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
        <Sender
          ref="senderRef"
          v-model:value="searchValue"
          :loading="loading"
          :header="senderHeader"
          :prefix="badgeNode"
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
  height: 600px;
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
