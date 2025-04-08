// API配置和调用服务
export const apiConfig = {
  // model: 'Qwen/QwQ-32B',
  model: 'Qwen/Qwen2.5-7B-Instruct',
  stream: true,
  max_tokens: 4096, // 1 <= x <= 16384
  temperature: 0.7,
  top_p: 0.7,
  top_k: 50,
  frequency_penalty: 0.5,
  n: 1,
}

export class ApiService {
  static async sendMessage(content: string) {
    const body = {
      ...apiConfig,
      messages: [{ content, role: 'user' }],
    }

    return await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer sk-ihpdfwnuksiqamsawakkemytfxfkqbhbqdqltlzrkhvtxjlh',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }
}
