<template>
  <div class="selection-demo-view">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RadioGroup from '@/components/RadioGroup/RadioGroup.vue'
import type { RadioOption } from '@/components/RadioGroup/RadioGroup.vue'
import CheckboxGroup from '@/components/CheckboxGroup/CheckboxGroup.vue'
import type { CheckboxOption } from '@/components/CheckboxGroup/CheckboxGroup.vue'

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
</script>

<style scoped>
.selection-demo-view {
  padding: 24px;
}

/* 单选组件示例样式 */
.radio-demo {
  /* margin-top: 40px; */
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
