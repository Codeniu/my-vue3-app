<template>
  <div class="lottery-vertical">
    <div class="viewport" :style="{ height: viewportHeight + 'px', width: width + 'px' }">
      <ul class="scroll-list" :style="{ transform: `translate3d(0, ${-translateY}px, 0)` }">
        <li
          v-for="(p, idx) in renderPrizes"
          :key="idx"
          class="item"
          :style="{ height: itemHeight + 'px', lineHeight: itemHeight + 'px' }"
        >
          <slot name="item" :label="p" :index="idx">{{ p }}</slot>
        </li>
      </ul>

      <!-- 顶/底渐变遮罩 -->
      <div class="mask mask-top" />
      <div class="mask mask-bottom" />

      <!-- 中心中奖标记 -->
      <div class="marker">
        <span></span>
      </div>
    </div>
    <div class="controls" v-if="showControls">
      <template v-if="manualMode">
        <button class="btn" @click="running ? stop() : start()">
          {{ running ? '结束' : '开始' }}
        </button>
      </template>
      <template v-else>
        <button class="btn" :disabled="running" @click="start">开始</button>
        <button class="btn" :disabled="!running" @click="stop">结束</button>
      </template>
      <button class="btn" @click="reset">重置</button>
      <div class="result" v-if="winnerLabel">结果：{{ winnerLabel }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    prizes: string[] // 奖品池（必填）
    itemHeight?: number // 单行高度（px），默认 48
    visibleCount?: number // 可见行数，默认 5（中奖停在中心行）
    baseSpeedPerMs?: number // 匀速阶段速度（px/ms），默认 0.55
    accelDuration?: number // 加速时长（ms），默认 600
    minSpinDuration?: number // 匀速滚动最短时间（ms），默认 3600
    repeatTimes?: number // 列表重复次数（滚动圈数上限相关），默认 100
    extraCycles?: number // 停靠前额外滚动圈数，默认 3
    width?: number // 组件宽度（px），默认 420
    forceWinnerIndex?: number | null // 固定中奖索引（测试/活动控制），默认 null
    showControls?: boolean // 显示内置控制按钮，默认 false
    stopExtraCycles?: number // 手动结束时额外滚动圈数，默认 0（更快停靠）
    manualMode?: boolean // 是否启用手动抽奖（开始后按钮切换为结束）
  }>(),
  {
    itemHeight: 48,
    visibleCount: 5,
    baseSpeedPerMs: 0.55,
    accelDuration: 600,
    minSpinDuration: 3600,
    repeatTimes: 20,
    extraCycles: 3,
    width: 420,
    forceWinnerIndex: null,
    manualMode: false,
  },
)

const emit = defineEmits<{
  (e: 'finished', payload: { index: number; label: string }): void
  (e: 'start'): void
  (e: 'reset'): void
}>()

const periodHeight = computed(() => props.prizes.length * props.itemHeight)
function modP(v: number): number {
  const p = periodHeight.value
  return ((v % p) + p) % p // 数学模，永远 ≥ 0
}

const viewportHeight = props.itemHeight * props.visibleCount

const renderPrizes = computed(() => {
  const arr: string[] = []
  for (let i = 0; i < props.repeatTimes; i += 1) arr.push(...props.prizes)
  return arr
})

const translateY = ref(0)
const running = ref(false)
const winnerIndex = ref<number | null>(null)
const winnerLabel = ref('')

let rafId: number | null = null
let lastTs = 0
let startTs = 0
let accelEndTs = 0
let decelStartTs = 0
let targetTranslate = 0

function easeInQuad(t: number) {
  return t * t
}

function step(ts: number) {
  if (!running.value) return
  if (!lastTs) lastTs = ts
  const delta = ts - lastTs
  lastTs = ts

  if (ts < accelEndTs) {
    const progress = Math.min(1, (ts - startTs) / props.accelDuration)
    const speed = props.baseSpeedPerMs * easeInQuad(progress)
    translateY.value += speed * delta
  } else if (ts < decelStartTs) {
    translateY.value += props.baseSpeedPerMs * delta
  } else {
    const remain = targetTranslate - translateY.value
    if (remain <= 0.6) {
      translateY.value = targetTranslate
      stopAtWinner()
      return
    }
    const speed = Math.max(0.1, Math.min(1.6, remain * 0.002))
    translateY.value += speed * delta
  }

  // translateY.value = translateY.value % periodHeight.value

  // if (translateY.value < 0) {
  //   console.log('translateY.value < 0', translateY.value)
  //   translateY.value += periodHeight.value
  // }

  translateY.value = modP(translateY.value)

  rafId = requestAnimationFrame(step)
}

function pickWinner(): number {
  const n = props.prizes.length
  if (props.forceWinnerIndex != null) return props.forceWinnerIndex % n
  return Math.floor(Math.random() * n)
}

function calcTargetTranslate(
  current: number,
  winnerIdx: number,
  cycles: number = props.extraCycles,
): number {
  const centerIndex = Math.floor(props.visibleCount / 2)
  const currentTopIndex = Math.floor(current / props.itemHeight)
  const currentCycles = Math.floor(currentTopIndex / props.prizes.length)
  const targetTopIndex = winnerIdx - centerIndex + props.prizes.length * (currentCycles + cycles)
  return targetTopIndex * props.itemHeight
}

function start() {
  if (running.value) return
  running.value = true
  winnerLabel.value = ''
  lastTs = 0

  startTs = performance.now()
  accelEndTs = startTs + props.accelDuration

  if (props.manualMode) {
    // 手动抽奖模式：不预选中奖项，不设定减速开始时间，等待“结束”触发
    winnerIndex.value = null
    decelStartTs = Number.POSITIVE_INFINITY
  } else {
    const wIdx = pickWinner()
    winnerIndex.value = wIdx
    decelStartTs = startTs + props.accelDuration + props.minSpinDuration
    targetTranslate = calcTargetTranslate(translateY.value, wIdx, props.extraCycles)
  }

  emit('start')
  rafId = requestAnimationFrame(step)
}

function stop() {
  if (!running.value) return
  if (winnerIndex.value == null) {
    winnerIndex.value = pickWinner()
  }
  targetTranslate = calcTargetTranslate(
    translateY.value,
    winnerIndex.value!,
    typeof props.stopExtraCycles === 'number' ? props.stopExtraCycles : 0,
  )
  const now = performance.now()
  if (!decelStartTs || decelStartTs > now) {
    decelStartTs = now
  }
}

function stopAtWinner() {
  running.value = false

  translateY.value = modP(translateY.value)

  if (winnerIndex.value != null) {
    console.log('translateY.value', translateY.value)
    console.log('periodHeight.value', periodHeight.value)

    winnerLabel.value = props.prizes[winnerIndex.value]
    emit('finished', { index: winnerIndex.value, label: winnerLabel.value })
  }
  // const totalHeight = props.prizes.length * props.repeatTimes * props.itemHeight
  // translateY.value = translateY.value % totalHeight

  cancelRaf()
}

function reset() {
  if (running.value) return
  translateY.value = 0
  winnerIndex.value = null
  winnerLabel.value = ''
  emit('reset')
}

function cancelRaf() {
  if (rafId != null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

onBeforeUnmount(() => {
  cancelRaf()
})

// 暴露方法给父组件调用
defineExpose({ start, stop, reset, running, winnerLabel })
</script>

<style scoped>
.lottery-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.viewport {
  position: relative;
  max-width: 92vw;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.scroll-list {
  margin: 0;
  padding: 0;
  list-style: none;
  will-change: transform;
}

.item {
  height: 48px;
  line-height: 48px;
  padding: 0 14px;
  border-bottom: 1px dashed #eee;
  color: #222;
  background: #fafafa;
  font-variant-numeric: tabular-nums;
}
.item:nth-child(odd) {
  background: #f7f7f7;
}

.mask {
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  height: 72px;
}
.mask-top {
  top: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
}
.mask-bottom {
  bottom: 0;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
}

.marker {
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 48px;
  border-top: 2px solid #ff6a00;
  border-bottom: 2px solid #ff6a00;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marker span {
  position: relative;
  display: block;
  height: 100%;
}
/* 上下方向小箭头（指向中心） */
.marker span::before,
.marker span::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
}
.marker span::before {
  top: 4px;
  border-top: 8px solid #ff6a0069;
}
.marker span::after {
  bottom: 4px;
  border-bottom: 8px solid #ff6a0069;
}

.controls {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.4);
  transition:
    filter 0.2s ease,
    transform 0.05s ease;
}
.btn:disabled {
  filter: grayscale(0.6);
  cursor: not-allowed;
}
.btn:not(:disabled):active {
  transform: scale(0.98);
}

.result {
  margin-left: 12px;
  font-size: 14px;
  color: #333;
}
</style>
