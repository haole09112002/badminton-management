<template>
  <div class="form-item d-flex flex-column align-start ga-0">
    <span v-if="label !== ''" class="text-caption">{{ label }}</span>
    <div class="input-wrap">
      <v-textarea row-height="20" rows="2" v-model="model" :density="density" :variant="variant" auto-grow
        :readonly="readonly" :hide-details="hideDetails" :placeholder="placeholder" color="blue" class="custom-font"
        :error="!!errorMessage" :error-messages="errorMessage" @focus="$emit('focus')"></v-textarea>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  modelValue: string
  label: string
  density?: 'compact' | 'comfortable' | 'default'
  variant?: 'outlined' | 'underlined' | 'filled' | 'plain'
  hideDetails?: boolean
  placeholder?: string,
  errorMessage?: string,
  readonly?: boolean

}

const props = withDefaults(defineProps<Props>(), {
  density: 'compact',
  variant: 'outlined',
  hideDetails: true,
  placeholder: 'Nhập ghi chú',
  errorMessage: "",
  readonly: false
})

const emit = defineEmits(['update:modelValue', 'focus'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<style scoped lang="scss">
.form-item {
  margin-bottom: 12px;
  width: 100%;

  .input-wrap {
    width: 100%
  }

  .custom-font :deep(textarea) {
    text-align: left;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
