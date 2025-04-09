<script setup lang="ts">
import { BulbOutlined, InfoCircleOutlined, RocketOutlined } from '@ant-design/icons-vue'
import { message as messageAnt } from 'ant-design-vue'
import { Prompts, type PromptsProps } from 'ant-design-x-vue'
import { h } from 'vue'

defineOptions({ name: 'AXPromptsBasicSetup' })

const [message, contextHolder] = messageAnt.useMessage()

// 定义 emit 事件
const emit = defineEmits<{
  (e: 'select', message: string): void
}>()

const items: PromptsProps['items'] = [
  {
    key: '1',
    icon: h(BulbOutlined, { style: { color: '#FFD700' } }),
    label: 'Ignite Your Creativity',
    description: '我想开始一个新项目，请给我一些创意灵感',
  },
  {
    key: '2',
    icon: h(InfoCircleOutlined, { style: { color: '#1890FF' } }),
    label: 'Uncover Background Info',
    description: '请帮我了解这个主题的背景信息。',
  },
  {
    key: '3',
    icon: h(RocketOutlined, { style: { color: '#722ED1' } }),
    label: 'Efficiency Boost Battle',
    description: '我想提高工作效率，有什么好建议吗？',
  },
]
</script>

<template>
  <context-holder />
  <Prompts
    title="✨ 今天想了解点什么"
    :items="items"
    :on-item-click="
      (info) => {
        emit('select', String(info.data.description))
      }
    "
  />
</template>
