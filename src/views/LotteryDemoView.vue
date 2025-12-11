<template>
  <section class="lottery-demo">
    <h1>抽奖演示（纵向滚动）</h1>

    <div class="lottery-box">
      <LotteryVertical
        ref="lotteryRef"
        :prizes="prizes"
        :itemHeight="48"
        :visibleCount="5"
        :baseSpeedPerMs="0.55"
        :accelDuration="600"
        :minSpinDuration="3600"
        :repeatTimes="100"
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

    <!-- 单选组件示例 -->
    <div class="radio-demo">
      <h2>单选组件示例</h2>
      
      <div class="demo-section">
        <h3>基础用法</h3>
        <RadioGroup v-model="selectedValue1" :options="radioOptions1" />
        <p class="selected-value">选中值：{{ selectedValue1 }}</p>
      </div>

      <div class="demo-section">
        <h3>水平排列</h3>
        <RadioGroup v-model="selectedValue2" :options="radioOptions2" inline />
        <p class="selected-value">选中值：{{ selectedValue2 }}</p>
      </div>

      <div class="demo-section">
        <h3>禁用状态</h3>
        <RadioGroup v-model="selectedValue3" :options="radioOptions3" />
        <p class="selected-value">选中值：{{ selectedValue3 }}</p>
      </div>

      <!-- 多选组件示例 -->
      <h2 style="margin-top: 32px">多选组件示例</h2>

      <div class="demo-section">
        <h3>基础用法</h3>
        <CheckboxGroup v-model="checkedValues1" :options="checkboxOptions1" />
        <p class="selected-value">选中值：{{ checkedValues1.join(', ') }}</p>
      </div>

      <div class="demo-section">
        <h3>水平排列</h3>
        <CheckboxGroup v-model="checkedValues2" :options="checkboxOptions2" inline />
        <p class="selected-value">选中值：{{ checkedValues2.join(', ') }}</p>
      </div>

      <div class="demo-section">
        <h3>禁用状态</h3>
        <CheckboxGroup v-model="checkedValues3" :options="checkboxOptions3" />
        <p class="selected-value">选中值：{{ checkedValues3.join(', ') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LotteryVertical from '@/components/Lottery/LotteryVertical.vue'
import RadioGroup from '@/components/RadioGroup/RadioGroup.vue'
import type { RadioOption } from '@/components/RadioGroup/RadioGroup.vue'
import CheckboxGroup from '@/components/CheckboxGroup/CheckboxGroup.vue'
import type { CheckboxOption } from '@/components/CheckboxGroup/CheckboxGroup.vue'

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

// 单选组件数据
const selectedValue1 = ref('option1')
const selectedValue2 = ref('optionA')
const selectedValue3 = ref('enabled')

const radioOptions1: RadioOption[] = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' },
]

const radioOptions2: RadioOption[] = [
  { label: '选项A', value: 'optionA' },
  { label: '选项B', value: 'optionB' },
  { label: '选项C', value: 'optionC' },
  { label: '选项D', value: 'optionD' },
]

const radioOptions3: RadioOption[] = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled', disabled: true },
  { label: '未确定', value: 'undefined' },
]

// 多选组件数据
const checkedValues1 = ref<string[]>(['apple'])
const checkedValues2 = ref<string[]>(['mon'])
const checkedValues3 = ref<string[]>(['read'])

const checkboxOptions1: CheckboxOption[] = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
]

const checkboxOptions2: CheckboxOption[] = [
  { label: '周一', value: 'mon' },
  { label: '周二', value: 'tue' },
  { label: '周三', value: 'wed' },
  { label: '周四', value: 'thu' },
]

const checkboxOptions3: CheckboxOption[] = [
  { label: '阅读', value: 'read' },
  { label: '跑步', value: 'run', disabled: true },
  { label: '音乐', value: 'music' },
]

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

/* 单选组件示例样式 */
.radio-demo {
  margin-top: 40px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.radio-demo h2 {
  font-size: 18px;
  margin: 0 0 20px;
  color: #111827;
}

.demo-section {
  margin-bottom: 24px;
}

.demo-section:last-child {
  margin-bottom: 0;
}

.demo-section h3 {
  font-size: 14px;
  margin: 0 0 12px;
  color: #6b7280;
  font-weight: 500;
}

.selected-value {
  margin: 8px 0 0;
  font-size: 13px;
  color: #2563eb;
  font-weight: 500;
}
</style>
