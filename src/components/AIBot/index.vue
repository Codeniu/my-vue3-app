<script setup lang="ts">
import Sender from './components/Sender.vue'
import Conversation from './components/Conversation.vue'
import { ref } from 'vue'

const currentChatId = ref<string>('')
const conversationRef = ref()

const handleSelectChat = (chatId: string) => {
  currentChatId.value = chatId
}

const handleCreateChat = async (chat: any) => {
  await conversationRef.value?.createNewChat(chat)
  currentChatId.value = chat.id
}

const senderRef = ref()
const handleResetSender = () => {
  senderRef.value?.reset()
}
</script>

<template>
  <div class="ai-bot-container">
    <div class="conversation-wrapper">
      <Conversation
        @select-chat="handleSelectChat"
        @reset-sender="handleResetSender"
        ref="conversationRef"
      />
    </div>
    <div class="sender-wrapper">
      <Sender ref="senderRef" :currentChatId="currentChatId" @create-chat="handleCreateChat" />
    </div>
  </div>
</template>
<style scoped>
.ai-bot-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.conversation-wrapper {
  flex: 1;
  border-right: 1px solid #eee;
}

.sender-wrapper {
  flex: 2;
  padding-left: 20px;
}
</style>
