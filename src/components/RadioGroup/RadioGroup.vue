<template>
  <div class="radio-group button-style" :class="{ inline: inline }">
    <div
      v-for="(option, index) in options"
      :key="index"
      class="radio-btn"
      :class="{ checked: modelValue === option.value, disabled: option.disabled }"
      @click="handleClick(option)"
    >
      <span class="radio-btn-label">{{ option.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface RadioOption {
  label: string
  value: string | number
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    options: RadioOption[]
    inline?: boolean
    disabled?: boolean
  }>(),
  {
    inline: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

function handleClick(option: RadioOption) {
  if (option.disabled || props.disabled) return

  if (props.modelValue !== option.value) {
    emit('update:modelValue', option.value)
    emit('change', option.value)
  }
}
</script>

<style scoped>
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-group.inline {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.radio-item:hover:not(.disabled) {
  opacity: 0.8;
}

.radio-item.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.radio-icon {
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: #fff;
}

.radio-item.checked .radio-icon {
  border-color: #2563eb;
  background: #2563eb;
}

.radio-dot {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.radio-label {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.radio-item.checked .radio-label {
  color: #2563eb;
  font-weight: 500;
}

.radio-group.button-style {
  display: flex;
  flex-direction: row;
  gap: 24px;
}
.radio-btn {
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
.radio-btn.checked {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}
.radio-btn.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.radio-btn-label {
  padding: 0 24px;
}
</style>
