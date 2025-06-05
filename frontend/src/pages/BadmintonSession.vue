<template>
  <div class="home">
    <div v-if="appStore.isLeadOrAdminPermission">
      <v-btn class="text-caption mb-1 mt-4" color="primary" size="small" elevation="1" variant="tonal"
        @click="handleCreateNewSession">
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
  text-align: center;
  padding: 20px;
}

.summary {
  display: flex;
  flex-direction: column;
}

.d-sm-grid {
  display: grid !important;
}

/* Ẩn session-list cho mobile */
.d-none {
  display: none !important;
}

/* Hiển thị session list dưới dạng list cho mobile */
.session-list-mobile {
  display: block;
  // margin-bottom: 8px;
}

.session-list-mobile>* {
  margin-bottom: 8px;
  /* Khoảng cách giữa các mục */
}

.loading-overlay {
  // position: absolute;
  // top: 0;
  // left: 0;
  width: 100%;
  height: 100%;
  // background: rgba(0, 0, 0, 0.3); // nền mờ
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10; // nhớ cao hơn nội dung bên trong
}

/* Ẩn phần list trên các màn hình lớn */

.upcoming-session {
  border: 2px solid #F44336 !important;
  position: relative;

  &::before {
    content: "Sắp diễn ra";
    position: absolute;
    top: 0;
    right: 0;
    background-color: #F44336;
    color: white;
    padding: 2px 8px;
    font-size: 12px;
    border-bottom-left-radius: 4px;
  }
}

.today-session {
  border: 2px solid #2196F3 !important;
  position: relative;

  &::before {
    content: "Hôm nay";
    position: absolute;
    top: 0;
    right: 0;
    background-color: #2196F3;
    color: white;
    padding: 2px 8px;
    font-size: 12px;
    border-bottom-left-radius: 4px;
  }
}

.completed-session {
  opacity: 0.6;
  filter: grayscale(0.5);
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
}

.mobile-session-list {
  >div:last-child {
    margin-bottom: 0 !important;
  }
}
</style>
