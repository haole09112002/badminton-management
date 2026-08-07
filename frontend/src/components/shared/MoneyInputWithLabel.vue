<template>
  <div class="form-item d-flex flex-column align-start ga-0">
    <span v-if="label !== ''" class="text-caption">{{ label }}</span>
    <div class="input-wrap">
      <v-text-field v-model="inputValue" :placeholder="placeholder" :variant="variant" :density="density"
        :disabled="disabled" :readonly="readonly" :class="inputClass" :hide-details="hideDetails" :suffix="suffix"
        :prefix="prefix" @blur="onBlur" @keydown="onKeydown" @focus="$emit('focus')" class="align-right" color="blue"
        :error="!!errorMessage" :error-messages="errorMessage" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

interface Props {
  modelValue: number;
  label?: string;
  placeholder?: string;
  density?: 'compact' | 'comfortable' | 'default';
  variant?: 'outlined' | 'underlined' | 'filled' | 'plain';
  disabled?: boolean;
  readonly?: boolean;
  suffix?: string;
  prefix?: string;
  hideDetails?: boolean;
  inputClass?: string;
  height?: string;
  errorMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  density: 'compact',
  variant: 'outlined',
  hideDetails: false,
  placeholder: '',
  readonly: false,
  disabled: false,
  height: '30px',
  errorMessage: '',
});

const emit = defineEmits(['update:modelValue', 'focus']);

const inputValue = ref(formatCurrency(props.modelValue));

watch(
  () => props.modelValue,
  (val) => {
    inputValue.value = formatCurrency(val);
  }
);

function formatCurrency(value: number | string): string {
  const number = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(number)) return '';
  return number.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }) + ' ₫';
}

function parseCurrency(value: string): number {
  const cleaned = value.replace(/\D/g, '');
  return parseInt(cleaned || '0', 10);
}

function onBlur() {
  const numeric = parseCurrency(inputValue.value);
  inputValue.value = formatCurrency(numeric);
  emit('update:modelValue', numeric);
}

function onKeydown(e: KeyboardEvent) {
  const allowedKeys = [
    'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End',
  ];
  const isNumber = /^[0-9]$/.test(e.key);
  const isDecimal = e.key === ',' || e.key === '.';

  if (!isNumber && !isDecimal && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }

  // Chỉ cho nhập 1 dấu thập phân
  if (
    isDecimal &&
    (inputValue.value.includes(',') || inputValue.value.includes('.'))
  ) {
    e.preventDefault();
  }
}
</script>

<style scoped lang="scss">
.form-item {
  width: 100%;

  .input-wrap {
    width: 100%;
  }
}

.align-right :deep(input) {
  text-align: right;
  font-size: 14px;
  font-weight: 500;
}
</style>
