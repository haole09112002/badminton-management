<template>
  <div class="session-card-vertical" :class="{ 'completed-session': item.status === 'done' }">
    <div class="session-header">
      <div class="session-location">
        <v-icon color="primary" size="22" class="mr-1">mdi-map-marker</v-icon>
        <span>{{ item.location }}</span>
      </div>
      <div class="session-badges">
        <v-chip :color="item.courtType === 'fixed' ? 'primary' : 'orange'" class="chip-type" size="small"
          variant="elevated">
          {{ item.courtType === 'fixed' ? 'Cố định' : 'Vãng lai' }}
        </v-chip>
        <v-chip v-if="new Date(item.time).toDateString() === new Date().toDateString()" color="blue" class="chip-today"
          size="small" variant="elevated">
          Hôm nay
        </v-chip>
        <v-chip v-else-if="new Date(item.time) > new Date()" color="red" class="chip-upcoming" size="small"
          variant="elevated">
          Sắp diễn ra
        </v-chip>
        <v-chip v-else-if="item.status === 'done'" color="grey" class="chip-done" size="small" variant="elevated">
          Đã kết thúc
        </v-chip>
        <v-chip class="status-chip" size="small" :color="getStatusCf(item.status).color" text-color="white"
          variant="elevated" prepend-icon="mdi-checkbox-marked-circle">
          {{ getStatusCf(item.status).text }}
        </v-chip>
      </div>
    </div>
    <div class="session-info">
      <div class="info-row">
        <v-icon color="teal" size="18" class="mr-1">mdi-calendar</v-icon>
        <span>{{ formatDateVi(item.time) }}</span>
      </div>
      <div class="info-row">
        <v-icon color="teal" size="18" class="mr-1">mdi-clock-outline</v-icon>
        <span>{{ item.startTime }} - {{ item.endTime }}</span>
      </div>
      <div class="info-row">
        <v-icon color="deep-orange" size="18" class="mr-1">mdi-tennis</v-icon>
        <span>Tiền sân: <b>{{ formatCurrency(item.courtFee) }}</b></span>
      </div>
      <div class="info-row">
        <v-icon color="amber" size="18" class="mr-1">mdi-badminton</v-icon>
        <span>Tiền cầu: <b>{{ formatCurrency(item.shuttlecockFee) }}</b></span>
      </div>
      <div class="info-row">
        <v-icon color="amber" size="18" class="mr-1">mdi-badminton</v-icon>
        <span>Số cầu: <b>{{ item.numberShuttlecock }}</b></span>
      </div>
      <div class="info-row" v-if="item.extraFee !== 0">
        <v-icon color="grey" size="18" class="mr-1">mdi-currency-usd</v-icon>
        <span>Tiền khác: <b>{{ formatCurrency(item.extraFee) }}</b></span>
      </div>
      <div class="info-row">
        <v-icon color="indigo" size="18" class="mr-1">mdi-account-group</v-icon>
        <span>{{ item.numberParticipant }} người</span>
      </div>
    </div>
    <div class="session-footer">
      <v-btn class="btn-detail-vertical" color="primary" size="small" variant="outlined"
        @click="handleClickSessionDetail">
        Xem chi tiết
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BadmintonSession } from '../../types/responses'
import { formatCurrency, formatDateVi } from '../../utils'

const props = defineProps<{
  item: BadmintonSession
}>()
const router = useRouter()

const getStatusCf = (status: string) => {
  switch (status) {
    case "init":
      return { text: "Mới tạo", color: "grey" }
    case "edited":
      return { text: "Chờ xác nhận", color: "orange" }
    case "confirmed":
      return { text: "Đã xác nhận", color: "#1976d2" }
    case "done":
      return { text: "Hoàn tất", color: "green" }
    default:
      return { text: "Không xác định", color: "red" }
  }
}

const handleClickSessionDetail = () => {
  router.push({ name: 'BadmintonSessionDetail', params: { id: props.item.id } })
}
</script>

<style lang="scss" scoped>
.session-card-vertical {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px 0 rgba(60, 72, 88, 0.10);
  padding: 12px 6px 12px 8px;
  min-width: 90vw;
  max-width: 98vw;
  min-height: 240px;
  height: auto; // 👈 cho auto để không cắt status
  border: 1.5px solid #e3e8ef;
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
  box-sizing: border-box;
  // overflow: hidden; // Thêm dòng này

  &:hover {
    box-shadow: 0 8px 32px 0 rgba(25, 118, 210, 0.13);
    transform: translateY(-2px) scale(1.015);
    border-color: #1976d2;
  }
}

.session-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 10px;
}

.session-location {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1976d2;
  display: flex;
  align-items: center;
  gap: 4px;
  word-break: break-word;
  white-space: normal;
  width: 100%;
}

.session-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip-type,
.chip-today,
.chip-upcoming,
.chip-done {
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  letter-spacing: 0.2px;
}

.session-info {
  flex: 1 1 auto; // Thêm dòng này
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  min-height: 0;
  // overflow: hidden;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #374151;
  gap: 4px;
  min-width: 0;
  white-space: normal;
  word-break: break-word;
}

.status-chip {
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  letter-spacing: 0.2px;
  margin-bottom: 4px;
}

.session-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: auto;
  padding-top: 4px;
  background: #fff;
}

.btn-detail-vertical {
  border-radius: 20px;
  font-weight: 600;
  letter-spacing: 0.2px;
  min-width: 120px;
  transition: background 0.2s, color 0.2s;
}

.btn-detail-vertical:hover {
  background: #1976d2 !important;
  color: #fff !important;
}

.completed-session {
  opacity: 0.5;
  filter: grayscale(0.2);
  // pointer-events: none;  // XÓA hoặc comment dòng này đi
}

@media (max-width: 600px) {
  .session-card-vertical {
    padding: 12px 6px 12px 8px;
    min-width: 90vw;
    max-width: 98vw;
    min-height: 240px;
    height: 270px;
  }

  .btn-detail-vertical {
    min-width: 90px;
    font-size: 13px;
    padding: 0 10px;
  }
}
</style>
