<template>
  <section class="lottery-demo">
    <h1>抽奖演示（纵向滚动）</h1>

    <div class="lottery-box">
      <LotteryVertical
        ref="lotteryRef"
        :prizes="prizes"
        :itemHeight="48"
        :visibleCount="5"
        :baseSpeedPerMs="1.55"
        :accelDuration="600"
        :minSpinDuration="3600"
        :extraCycles="3"
        :width="420"
        showControls
        manualMode
        @finished="onFinished"
      />

      <div class="controls">
        <button class="btn" :disabled="running" @click="start">开始抽奖</button>
        <button class="btn" :disabled="running" @click="reset">重置</button>
        <span v-if="winnerLabel" class="result">结果：{{ winnerLabel }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LotteryVertical from '@/components/Lottery/LotteryVertical.vue'

const prizes = ref<string[]>([
  '一等奖：iPhone',
  '二等奖：iPad',
  '三等奖：耳机',
  '四等奖：京东卡',
  '五等奖：咖啡券',
  '六等奖：电影票',
  '七等奖：数据线',
  '参与奖：谢谢参与',
])

const lotteryRef = ref<InstanceType<typeof LotteryVertical> | null>(null)
const running = computed(() => lotteryRef.value?.running ?? false)
const winnerLabel = ref('')

function start() {
  lotteryRef.value?.start()
}
function reset() {
  lotteryRef.value?.reset()
  winnerLabel.value = ''
}
function onFinished(p: { index: number; label: string }) {
  winnerLabel.value = p.label
}
</script>

<style scoped>
.lottery-demo {
  padding: 24px;
}

h1 {
  font-size: 20px;
  margin: 0 0 12px;
}

.lottery-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  appearance: none;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  color: #2563eb;
}
</style>
