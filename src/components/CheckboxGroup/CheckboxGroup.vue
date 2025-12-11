<template>
  <div class="checkbox-group button-style" :class="{ inline: inline }">
    <div
      v-for="(option, index) in options"
      :key="index"
      class="checkbox-btn"
      :class="{ checked: isChecked(option.value), disabled: option.disabled }"
      @click="handleClick(option)"
    >
      <span class="checkbox-btn-label">{{ option.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface CheckboxOption {
  label: string
  value: string | number
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: (string | number)[]
    options: CheckboxOption[]
    inline?: boolean
    disabled?: boolean
  }>(),
  {
    inline: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]): void
  (e: 'change', value: (string | number)[]): void
}>()

function isChecked(val: string | number): boolean {
  return props.modelValue.includes(val)
}

function handleClick(option: CheckboxOption) {
  if (option.disabled || props.disabled) return

  const current = [...props.modelValue]
  const idx = current.indexOf(option.value)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(option.value)
  }
  emit('update:modelValue', current)
  emit('change', current)
}
</script>

<style scoped>
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-group.inline {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
}

.checkbox-btn {
  min-width: 120px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #d1d5db;
  background: #fff;
  color: #374151;
  font-size: 20px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.checkbox-btn.checked {
  background: #ecf6ff;
  color: #1890ff;
  border-color: #1890ff;
}

/* 右下角黄色三角形 */
.checkbox-btn {
  position: relative;
}

.checkbox-btn.checked::before {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  color: #fff;
  z-index: 2;

  width: 14px; /* 与 SVG viewBox 同比例 */
  height: 14px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14'%3E%3Cpath d='M2 6.5l4 4 6-6' stroke='%23fff' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
    center/contain no-repeat;
}

.checkbox-btn.checked::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 26px 26px;
  border-color: transparent transparent #1890ff transparent;
}

.checkbox-btn.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-btn-label {
  padding: 0 24px;
}
</style>
