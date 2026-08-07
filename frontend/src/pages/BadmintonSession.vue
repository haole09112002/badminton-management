<template>
  <div class="home">
    <div v-if="appStore.isLeadOrAdminPermission">
      <v-btn class="btn-create-session text-caption mb-1 mt-4" color="primary" size="large" elevation="3"
        variant="elevated" rounded="xl" @click="handleCreateNewSession" prepend-icon="mdi-plus">
        Tạo mới
      </v-btn>
      <v-divider :thickness="2" color="success" class="mt-4 mb-4 border-opacity-100"></v-divider>
    </div>
    <div v-if="!isLoading">
      <div v-if="!smAndUp" class="d-block mobile-session-list">
        <div v-for="(session, index) in badmintonSessionList" :key="session.id" class="mb-4">
          <SessionItem :item="session" :class="{
            'upcoming-session': isUpcomingSession(session),
            'today-session': new Date(session.time).toDateString() === new Date().toDateString(),
            'completed-session': session.status === 'done'
          }" :is-first="index === 0" />
        </div>
      </div>

      <div v-else class="session-list d-sm-flex flex-wrap ga-4">
        <SessionItem v-for="(session, index) in badmintonSessionList" :item="session" :key="session.id" :class="{
          'upcoming-session': isUpcomingSession(session),
          'today-session': new Date(session.time).toDateString() === new Date().toDateString(),
          'completed-session': session.status === 'done'
        }" :is-first="index === 0" />
      </div>
    </div>
    <div v-if="isLoading" class="loading-overlay">
      <v-progress-circular indeterminate color="black" size="30"></v-progress-circular>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAppStore } from '../stores/app'
import { BadmintonSession } from '../types/responses'

const { smAndUp } = useDisplay()

const appStore = useAppStore()
const router = useRouter()
const badmintonSessionList = ref<BadmintonSession[]>([])
const isLoading = ref<boolean>(false)
onMounted(async () => {
  try {
    isLoading.value = true
    const sessions = await appStore.getAllBadmintonSession()
    // Sắp xếp lại danh sách
    badmintonSessionList.value = sessions.sort((a, b) => {
      const dateA = new Date(a.time)
      const dateB = new Date(b.time)
      const now = new Date()

      // Kiểm tra xem có phải là hôm nay không
      const isTodayA = dateA.toDateString() === now.toDateString()
      const isTodayB = dateB.toDateString() === now.toDateString()

      // Nếu cả hai đều là hôm nay, sắp xếp theo thời gian
      if (isTodayA && isTodayB) {
        return dateA.getTime() - dateB.getTime()
      }
      // Nếu chỉ a là hôm nay, a lên trước
      if (isTodayA) return -1
      // Nếu chỉ b là hôm nay, b lên trước
      if (isTodayB) return 1

      // Nếu cả hai đều là tương lai, sắp xếp theo thời gian gần nhất
      if (dateA.getTime() > now.getTime() && dateB.getTime() > now.getTime()) {
        return dateA.getTime() - dateB.getTime()
      }
      // Nếu chỉ a là tương lai, a lên trước
      if (dateA.getTime() > now.getTime()) return -1
      // Nếu chỉ b là tương lai, b lên trước
      if (dateB.getTime() > now.getTime()) return 1

      // Nếu cả hai đều là quá khứ, sắp xếp theo thời gian gần nhất
      return dateB.getTime() - dateA.getTime()
    })
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    console.log(error)
  }
})

const handleCreateNewSession = (): void => {
  router.push({ name: 'BadmintonSessionCreate' })
}

const isUpcomingSession = (session: BadmintonSession): boolean => {
  const sessionDate = new Date(session.time)
  const now = new Date()

  // Kiểm tra xem có phải là hôm nay không
  const isToday = sessionDate.toDateString() === now.toDateString()

  // Nếu là hôm nay, thêm class today-session
  if (isToday) {
    return true
  }

  return sessionDate.getTime() > now.getTime()
}
</script>

<style lang="scss" scoped>
.home {
  padding: 24px 8px 32px 8px;
  background: #ffff;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}

.v-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.btn-create-session {
  font-weight: 700 !important;
  font-size: 1.08rem !important;
  letter-spacing: 0.5px;
  padding: 0 28px !important;
  border-radius: 28px !important;
  min-width: 140px;
  box-shadow: 0 4px 16px 0 rgba(25, 118, 210, 0.10);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  background: linear-gradient(90deg, #1976d2 80%, #42a5f5 100%) !important;
  color: #fff !important;
  text-transform: none;

  &:hover {
    background: linear-gradient(90deg, #1565c0 80%, #64b5f6 100%) !important;
    color: #fff !important;
    box-shadow: 0 8px 24px 0 rgba(25, 118, 210, 0.18);
  }
}

.session-list,
.mobile-session-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}

.session-list {
  @media (max-width: 600px) {
    display: none !important;
  }
}

.mobile-session-list {
  flex-direction: column;
  gap: 16px;

  @media (min-width: 600px) {
    display: none !important;
  }
}

/* Card style cho SessionItem */
:deep(.session-card-modern) {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px 0 rgba(60, 72, 88, 0.10);
  padding: 22px 22px 18px 22px;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1.5px solid #e3e8ef;
  min-width: 260px;
  max-width: 420px;
  margin: 0 auto;
  position: relative;

  &:hover {
    box-shadow: 0 8px 32px 0 rgba(25, 118, 210, 0.13);
    transform: translateY(-2px) scale(1.015);
    border-color: #1976d2;
  }
}

/* Card style cho SessionItem - Kiểu dọc */
:deep(.session-card-vertical) {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px 0 rgba(60, 72, 88, 0.10);
  padding: 20px 20px 16px 20px;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1.5px solid #e3e8ef;
  min-width: 320px;
  max-width: 420px;
  min-height: 320px;
  height: 340px;
  margin: 0 auto;
  position: relative;

  &:hover {
    box-shadow: 0 8px 32px 0 rgba(25, 118, 210, 0.13);
    transform: translateY(-2px) scale(1.015);
    border-color: #1976d2;
  }
}

/* Trạng thái đặc biệt */
.upcoming-session:deep(.session-card-modern) {
  border-color: #ff9800 !important;

  &::before {
    content: "Sắp diễn ra";
    position: absolute;
    top: 14px;
    right: 14px;
    background: linear-gradient(90deg, #ff9800 80%, #fff3e0 100%);
    color: #fff;
    font-weight: 600;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(255, 152, 0, 0.08);
    z-index: 2;
  }
}

.today-session:deep(.session-card-modern) {
  border-color: #1976d2 !important;

  &::before {
    content: "Hôm nay";
    position: absolute;
    top: 14px;
    right: 14px;
    background: linear-gradient(90deg, #1976d2 80%, #e3f2fd 100%);
    color: #fff;
    font-weight: 600;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(25, 118, 210, 0.08);
    z-index: 2;
  }
}

.completed-session:deep(.session-card-modern) {
  opacity: 0.7;
  filter: grayscale(0.2);
  border-color: #bdbdbd !important;

  &::before {
    content: "Đã kết thúc";
    position: absolute;
    top: 14px;
    right: 14px;
    background: linear-gradient(90deg, #757575 80%, #eeeeee 100%);
    color: #fff;
    font-weight: 600;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(117, 117, 117, 0.08);
    z-index: 2;
  }
}

/* Trạng thái đặc biệt - Kiểu dọc */
.upcoming-session:deep(.session-card-vertical) {
  border-color: #ff9800 !important;

  &::before {
    content: "Sắp diễn ra";
    position: absolute;
    top: 14px;
    right: 14px;
    background: linear-gradient(90deg, #ff9800 80%, #fff3e0 100%);
    color: #fff;
    font-weight: 600;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(255, 152, 0, 0.08);
    z-index: 2;
  }
}

.today-session:deep(.session-card-vertical) {
  border-color: #1976d2 !important;

  &::before {
    content: "Hôm nay";
    position: absolute;
    top: 14px;
    right: 14px;
    background: linear-gradient(90deg, #1976d2 80%, #e3f2fd 100%);
    color: #fff;
    font-weight: 600;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(25, 118, 210, 0.08);
    z-index: 2;
  }
}

.completed-session:deep(.session-card-vertical) {
  opacity: 0.7;
  filter: grayscale(0.2);
  border-color: #bdbdbd !important;

  &::before {
    content: "Đã kết thúc";
    position: absolute;
    top: 14px;
    right: 14px;
    background: linear-gradient(90deg, #757575 80%, #eeeeee 100%);
    color: #fff;
    font-weight: 600;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(117, 117, 117, 0.08);
    z-index: 2;
  }
}

.loading-overlay {
  width: 100%;
  min-height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  z-index: 10;
}

@media (max-width: 600px) {
  .home {
    padding: 10px 2px 24px 2px;
  }

  :deep(.session-card-modern) {
    min-width: 90vw;
    max-width: 98vw;
    padding: 14px 8px 14px 12px;
  }

  :deep(.session-card-vertical) {
    padding: 12px 6px 12px 8px;
    min-width: 90vw;
    max-width: 98vw;
    min-height: 240px;
    height: 270px;
  }
}
</style>
