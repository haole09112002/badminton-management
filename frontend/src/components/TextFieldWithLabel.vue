<template>
  <div class="form-item d-flex flex-column align-start ga-0">
    <span v-if="label !== ''" class="text-caption">{{ label }}
      <span v-if="required" class="text-red">*</span>
    </span>
    <div class="input-wrap">
      <v-text-field v-model="model" :density="density" :variant="variant" :hide-details="hideDetails" :readonly="readonly"
        :type="type" :disabled="disabled" :placeholder="placeholder" color="blue" class="align-left"
        :error="!!errorMessage" :error-messages="errorMessage" @focus="$emit('focus')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  label: string
  labelWidth?: string
  inputWidth?: string
  density?: 'compact' | 'comfortable' | 'default'
  variant?: 'outlined' | 'underlined' | 'filled' | 'plain'
  hideDetails?: boolean
  placeholder?: string
  readonly?: boolean
  disabled?: boolean
  required?: boolean
  type?: string
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '100px',
  inputWidth: '300px',
  density: 'compact',
  variant: 'outlined',
  hideDetails: false,
  placeholder: '',
  readonly: false,
  disabled: false,
  required: false,
  type: "text",
  errorMessage: ""
})

const emit = defineEmits(['update:modelValue', 'focus'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<style scoped lang="scss">
.form-item {
  /* margin-bottom: 12px; */
  width: 100%;

  .input-wrap {
    width: 100%;
  }

  .align-left :deep(input) {
    text-align: left;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
