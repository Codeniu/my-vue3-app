<template>
  <div class="radio-group" :class="{ inline: inline }">
    <div
      v-for="(option, index) in options"
      :key="index"
      class="radio-item"
      :class="{ checked: modelValue === option.value, disabled: option.disabled }"
      @click="handleClick(option)"
    >
      <span class="radio-icon">
        <span v-if="modelValue === option.value" class="radio-dot"></span>
      </span>
      <span class="radio-label">{{ option.label }}</span>
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
</style>
