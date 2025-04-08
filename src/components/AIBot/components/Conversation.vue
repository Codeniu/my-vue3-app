<template>
  <div class="conversation-manager">
    <Button type="primary" class="new-chat-btn" @click="(e: MouseEvent) => createNewChat()">
      <plus-outlined />
      新建对话
    </Button>

    <Collapse v-model:activeKey="activeGroups">
      <CollapsePanel v-for="group in chatGroups" :key="group.id" :header="group.name">
        <List :data-source="group.chats" class="chat-list">
          <template #renderItem="{ item }">
            <ListItem :class="{ active: currentChatId === item.id }">
              <div class="chat-item" @click="selectChat(item)">
                <message-outlined />
                <span v-if="editingChatId !== item.id">{{ item.title }}</span>
                <Input
                  v-else
                  v-model:value="editingTitle"
                  @pressEnter="saveTitle(item)"
                  @blur="saveTitle(item)"
                  class="edit-input"
                />
              </div>
              <div class="chat-actions">
                <EditOutlined @click="startEdit(item)" />
                <DeleteOutlined @click="deleteChat(item)" />
              </div>
            </ListItem>
          </template>
        </List>
      </CollapsePanel>
    </Collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PlusOutlined, MessageOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import {
  message,
  CollapsePanel,
  Collapse,
  List,
  ListItem,
  Button,
  Input,
  Modal,
} from 'ant-design-vue'
import { openDB } from 'idb'

interface Chat {
  id: string
  title: string
  groupId: string
  createdAt: number
}

interface ChatGroup {
  id: string
  name: string
  chats: Chat[]
}

// 数据库初始化
const initDB = async () => {
  const db = await openDB('chatDB', 1, {
    upgrade(db) {
      db.createObjectStore('chats', { keyPath: 'id' })
      db.createObjectStore('groups', { keyPath: 'id' })

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
  return db
}

const chatGroups = ref<ChatGroup[]>([])
const activeGroups = ref<string[]>([])
const currentChatId = ref<string>('')

const emit = defineEmits(['select-chat', 'reset-sender'])

// 创建新对话
const createNewChat = async (chat?: Chat) => {
  const newChat: Chat = {
    id: Date.now().toString(),
    title: chat?.title || '新对话',
    groupId: chat?.groupId || 'default',
    createdAt: chat?.createdAt || Date.now(),
  }

  try {
    const db = await initDB()
    await db.add('chats', newChat)

    const defaultGroup = chatGroups.value.find((g) => g.id === 'default')
    if (defaultGroup) {
      defaultGroup.chats.unshift(newChat)
    }

    message.success('创建新对话成功')
    currentChatId.value = newChat.id

    // 只有当不是从 Sender 组件创建时才需要重置
    if (!chat?.title) {
      emit('select-chat', newChat.id)
      emit('reset-sender')
    }
  } catch (error) {
    message.error('创建对话失败')
  }
}

// 修改 selectChat 函数
const selectChat = (chat: Chat) => {
  currentChatId.value = chat.id
  emit('select-chat', chat.id)
}

// 初始化加载数据
onMounted(async () => {
  try {
    const db = await initDB()
    // 获取所有对话并按创建时间降序排序
    const chats = (await db.getAll('chats')).sort((a, b) => b.createdAt - a.createdAt)

    // 按创建时间分组
    // 按月份对聊天记录进行分组
    const groupedChats = chats.reduce((groups: { [key: string]: Chat[] }, chat) => {
      const date = new Date(chat.createdAt)
      const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`

      if (!groups[monthKey]) {
        groups[monthKey] = []
      }

      groups[monthKey].push(chat)
      return groups
    }, {})

    // 将分组后的数据转换为数组格式
    const timeGroups = Object.entries(groupedChats).map(([name, chats]) => ({
      id: name,
      name,
      chats,
    }))

    // 按时间降序排序分组
    timeGroups.sort((a, b) => {
      const dateA = new Date(a.chats[0].createdAt)
      const dateB = new Date(b.chats[0].createdAt)
      return dateB.getTime() - dateA.getTime()
    })

    // 默认分组
    chatGroups.value = [
      {
        id: 'default',
        name: '默认分组',
        chats: [],
      },
      ...timeGroups,
    ]

    activeGroups.value = ['default']
  } catch (error) {
    message.error('加载对话数据失败')
  }
})

// 添加新的响应式变量
const editingChatId = ref<string>('')
const editingTitle = ref<string>('')

// 开始编辑标题
const startEdit = (chat: Chat) => {
  editingChatId.value = chat.id
  editingTitle.value = chat.title
}

// 保存标题
const saveTitle = async (chat: Chat) => {
  if (!editingTitle.value.trim()) {
    message.error('标题不能为空')
    editingTitle.value = chat.title
    editingChatId.value = ''
    return
  }

  try {
    const db = await initDB()
    const updatedChat = { ...chat, title: editingTitle.value.trim() }
    await db.put('chats', updatedChat)

    // 更新界面数据
    const defaultGroup = chatGroups.value.find((g) => g.id === 'default')
    if (defaultGroup) {
      const chatIndex = defaultGroup.chats.findIndex((c) => c.id === chat.id)
      if (chatIndex !== -1) {
        defaultGroup.chats[chatIndex].title = editingTitle.value.trim()
      }
    }

    editingChatId.value = ''
    message.success('修改标题成功')
  } catch (error) {
    message.error('修改标题失败')
  }
}

// 删除对话
const deleteChat = (chat: Chat) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个对话吗？',
    async onOk() {
      try {
        const db = await initDB()
        await db.delete('chats', chat.id)

        // 更新所有分组的界面数据
        chatGroups.value.forEach((group) => {
          // 从每个分组中过滤掉被删除的对话
          group.chats = group.chats.filter((c) => c.id !== chat.id)
        })

        // 如果删除的是当前选中的对话，清空当前对话ID
        if (currentChatId.value === chat.id) {
          currentChatId.value = ''
          emit('select-chat', '')
        }

        message.success('删除对话成功')
      } catch (error) {
        message.error('删除对话失败')
      }
    },
  })
}

defineExpose({
  createNewChat,
  selectChat,
  chatGroups,
})
</script>

<style scoped>
.conversation-manager {
  padding: 16px;
}

.new-chat-btn {
  width: 100%;
  margin-bottom: 16px;
}

.chat-list {
  cursor: pointer;
}

.chat-list .active {
  background-color: #e6f7ff;
}

.ant-list-item {
  padding: 8px 16px;
}

.ant-list-item:hover {
  background-color: #f5f5f5;
}

.chat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-actions {
  display: none;
  gap: 8px;
}

.ant-list-item:hover .chat-actions {
  display: flex;
}

.chat-actions .anticon {
  cursor: pointer;
  padding: 4px;
}

.chat-actions .anticon:hover {
  color: #1890ff;
}

.edit-input {
  flex: 1;
  margin: 0 8px;
}
</style>
