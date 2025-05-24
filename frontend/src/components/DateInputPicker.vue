<template>
  <div class="form-item d-flex flex-column ga-0 align-start">
    <span v-if="label" class="text-caption">
      {{ label }}
      <span v-if="required" class="text-red">*</span>
    </span>

    <!-- MENU ──────────────────────────────────────────── -->
    <div class="wrap-menu">
      <v-menu v-model="menu" :disabled="disabled" :close-on-content-click="false" transition="scale-transition" offset-y>
        <!-- ACTIVATOR (input) -->
        <template #activator="{ props }">
          <div class="wrap-input">
            <v-text-field v-bind="props" v-model="displayDate" :placeholder="placeholder" :density="density"
              :variant="variant" :hide-details="hideDetails" :error="!!errorMessage" :error-messages="errorMessage"
              readonly class="custom-font" color="blue" @focus="$emit('focus')" />
          </div>
        </template>

        <!-- DATE-PICKER -->
        <v-locale-provider locale="vi">
          <v-date-picker v-model="internalDate" :multiple="multiple" hide-header color="blue" :elevation="2"
            @update:model-value="onDateSelected" />
        </v-locale-provider>
      </v-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

/** ────── Props */
interface Props {
  modelValue: Date | null | Date[]
  label?: string
  density?: 'compact' | 'comfortable' | 'default'
  variant?: 'outlined' | 'underlined' | 'filled' | 'plain'
  hideDetails?: boolean
  placeholder?: string
  required?: boolean
  errorMessage?: string
  disabled?: boolean
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  density: 'compact',
  variant: 'outlined',
  hideDetails: false,
  placeholder: 'Chọn ngày',
  required: false,
  errorMessage: '',
  disabled: false,
  multiple: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | Date[] | null): void
  (e: 'focus'): void
}>()

/** ────── State */
const menu = ref(false)

/* giá trị hiển thị trong v-text-field */
const displayDate = ref('')

/* model nội bộ cho date-picker – có thể là Date | Date[] | null */
const internalDate = ref<Date | Date[] | null>(props.modelValue ?? null)

/** ────── Helpers */
function formatDateVi(date: Date) {
  return format(date, 'dd/MM/yyyy', { locale: vi })
}

/* chuyển array date → chuỗi hiển thị */
function formatDates(dates: Date[]): string {
  return dates.map(d => formatDateVi(d)).join(', ')
}

/** ────── Watch prop từ cha */
watch(
  () => props.modelValue,
  val => {
    internalDate.value = val
    if (Array.isArray(val)) {
      displayDate.value = val.length ? formatDates(val) : ''
    } else {
      displayDate.value = val ? formatDateVi(val) : ''
    }
  },
  { immediate: true }
)

/** ────── Khi người dùng chọn */
function onDateSelected(value: Date | Date[] | null) {
  emit('update:modelValue', value)

  if (Array.isArray(value)) {
    displayDate.value = value.length ? formatDates(value) : ''
  } else {
    displayDate.value = value ? formatDateVi(value) : ''
  }

  /* Đóng menu khi chọn xong (single) – với multiple đóng khi click ngoài */
  if (!props.multiple) menu.value = false
}
</script>

<style scoped lang="scss">
// .custom-font :deep(input) {
//   text-align: left;
//   font-size: 14px;
//   font-weight: 500;
// }

// .input-wrap {
//   width: 100%;

//   .custom-font :deep(input) {
//     text-align: left;
//     font-size: 14px;
//     font-weight: 500;
//   }
// }

.form-item {
  .wrap-menu {
    width: 100%;
  }

  .input-wrap {
    width: 100%;

    .custom-font :deep(input) {
      text-align: left;
      font-size: 14px;
      font-weight: 500;
    }
  }
}
</style>
