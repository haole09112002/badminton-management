<template>
  <v-card :variant="new Date(item.time) < new Date() ? 'outlined' : 'outlined'" class="mx-auto" :min-width="250"
    elevation="1" rounded="lg" color="white">
    <v-card-item>

      <div class="mb-4">

        <div class="text-subtitle-1 font-weight-medium mb-1 text-blue">
          {{ item.location }}
        </div>
        <div class="d-flex ga-4 align-center justify-center w-100">
          <img v-if="new Date(item.time) > new Date()" :src="comingSoon" alt="Logo" width="32" height="32"
            class="shake" />
          <!-- <v-divider class="mb-2"></v-divider> -->
          <img v-if="new Date(item.time).toDateString() === new Date().toDateString()" :src="hotbadge" alt="Logo"
            width="32" height="32" class="shake" />
        </div>

        <div class="w-100 mb-4">
          <v-chip style="width: 100%; align-items: center; justify-content: center;"
            :color="item.courtType === 'fixed' ? 'primary' : 'orange'" class="text-white" size="x-small">
            {{ item.courtType === 'fixed' ? 'Cố định' : 'Vãng lai' }}
          </v-chip>
        </div>
        <div class="price-container">
          <div class="price-item">
            <div class="d-flex align-center">
              <v-icon size="16" color="red" class="mr-1">mdi-calendar</v-icon>
              <div class="text-red text-caption font-weight-medium">{{ formatDateVi(item.time) }}
              </div>
              <!-- <span class="text-red"></span> -->
            </div>

          </div>
          <div class="price-item">
            <div class="d-flex align-center">
              <v-icon size="16" color="red" class="mr-1">mdi-calendar</v-icon>
              <div class="text-red text-caption font-weight-medium"> Từ {{ item.startTime }}
                đến {{ item.endTime }}
              </div>
              <!-- <span class="text-red"></span> -->
            </div>

          </div>
          <div class="price-item">
            <div class="d-flex align-center">
              <v-icon size="16" color="red" class="mr-1">mdi-tennis</v-icon>
              <span class="text-red text-caption font-weight-medium">Tiền sân:</span>
            </div>
            <span class="text-caption text-black">{{ formatCurrency(item.courtFee) }}</span>
          </div>
          <div class="price-item">
            <div class="d-flex align-center">
              <v-icon size="16" color="red" class="mr-1">mdi-badminton</v-icon>
              <span class="text-red text-caption font-weight-medium">Tiền cầu:</span>
            </div>
            <span class="text-caption text-black">{{ formatCurrency(item.shuttlecockFee) }}</span>
          </div>
          <div class="price-item" v-if="item.extraFee !== 0">
            <div class="d-flex align-center">
              <v-icon size="16" color="red" class="mr-1">mdi-currency-usd</v-icon>
              <span class="text-red text-caption font-weight-medium">Tiền khác:</span>
            </div>
            <span class="text-caption text-black">{{ formatCurrency(item.extraFee) }}</span>
          </div>
          <div class="price-item">
            <div class="d-flex align-center">
              <v-icon size="16" color="red" class="mr-1">mdi-account-group</v-icon>
              <span class="text-red text-caption font-weight-medium">Số người tham gia</span>
            </div>
            <span class="text-caption text-black">{{ item.numberParticipant }}</span>
          </div>
          <div class="price-item">
            <div class="d-flex align-center">
              <v-icon size="16" color="red" class="mr-1">mdi-progress-check</v-icon>
              <span class="text-red text-caption font-weight-medium">Trạng thái</span>
            </div>
            <v-chip class="status-chip px-2 text-caption " size="x-small" :color="getStatusCf(item.status).color"
              text-color="white" variant="elevated" prepend-icon="mdi-checkbox-marked-circle">
              {{ getStatusCf(item.status).text }}
            </v-chip>
          </div>
        </div>
      </div>
      <v-divider class="mb-2"></v-divider>
      <v-btn class="text-caption mb-1 mt-1" color="blue" size="x-small" elevation="1" variant="tonal"
        @click="handleClickSessionDetail">
        Xem chi tiết
      </v-btn>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { BadmintonSession } from '../../types/responses'
import { formatCurrency, formatDateVi } from '../../utils'
import comingSoon from '@/assets/coming-soon.png';
import hotbadge from '@/assets/hot-badge-128.png';

const props = defineProps<{
  item: BadmintonSession
}>()
const router = useRouter()
const emit = defineEmits(['update:modelValue'])

const getStatusCf = (status: string) => {
  switch (status) {
    case "init":
      return {
        text: "Mới tạo",
        color: "grey" // trung tính, chưa có hành động
      }
    case "edited":
      return {
        text: "Chờ thanh toán",
        color: "orange" // cảnh báo nhẹ, cần hành động
      }
    case "confirmed":
      return {
        text: "Đã xác nhận",
        color: "#FED8B1" // cảnh báo nhẹ, cần hành động
      }
    case "done":
      return {
        text: "Hoàn tất",
        color: "green" // thành công
      }
    default:
      return {
        text: "Không xác định",
        color: "red" // lỗi hoặc trạng thái không rõ
      }
  }
}

const handleClickSessionDetail = () => {
  router.push({ name: 'BadmintonSessionDetail', params: { id: props.item.id } })
}

</script>
<style lang="scss"  scoped>
.price-container {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .price-item {
    display: flex;
    justify-content: space-between;
  }
}

.status-chip {
  width: fit-content;
  font-size: 12px;
}

@keyframes shake {
  0% {
    transform: translate(0px, 0px);
  }

  20% {
    transform: translate(-2px, 2px);
  }

  40% {
    transform: translate(2px, -2px);
  }

  60% {
    transform: translate(-2px, 2px);
  }

  80% {
    transform: translate(2px, -2px);
  }

  100% {
    transform: translate(0px, 0px);
  }
}

.shake {
  animation: shake 1.5s infinite;
}
</style>
