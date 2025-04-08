import { DBService } from './db.service'

export interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  content: any
  timestamp: number
  chatId: string
}

export class MessageService {
  // 处理流式响应
  static async handleStreamResponse(response: Response, chatId: string, updateCallback: Function) {
    const rb = await response.body
    if (!rb) throw new Error('Response body is null')

    const reader = rb.getReader()
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
          if (!line.trim() || !line.startsWith('data: ')) continue

          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const response = JSON.parse(data)
            // console.log('response', response)
            const { choices } = response
            if (choices && choices.length > 0) {
              const { delta } = choices[0]
              if (delta.content) content += delta.content
              if (delta.reasoning_content) reasoning_content += delta.reasoning_content

              // 调用回调更新UI
              updateCallback(reasoning_content, content)
            }
          } catch (e) {
            console.error('解析流数据失败:', e)
          }
        }
      }

      // 流结束后，一次性写入数据库
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
      await DBService.saveMessage(finalAiMessage)
      return finalAiMessage
    } catch (error) {
      console.error('处理流式响应失败:', error)
      throw error
    }
  }

  // 处理普通响应
  static async handleNormalResponse(response: Response, chatId: string) {
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

      await DBService.saveMessage(aiMessage)
      return aiMessage
    }
    return null
  }
}
