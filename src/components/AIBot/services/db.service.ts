import { openDB } from 'idb'

// 数据库服务
export class DBService {
  // 数据库初始化函数
  static async initDB() {
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
  static async loadChatHistory(chatId: string) {
    try {
      const db = await this.initDB()
      const tx = db.transaction('messages', 'readonly')
      const store = tx.objectStore('messages')
      const index = store.index('chatId')
      return await index.getAll(chatId)
    } catch (error) {
      console.error(error)
      throw new Error('加载聊天历史失败')
    }
  }

  // 保存消息
  static async saveMessage(message: any) {
    try {
      const db = await this.initDB()
      return await db.add('messages', message)
    } catch (error) {
      console.error(error)
      throw new Error('保存消息失败')
    }
  }
}