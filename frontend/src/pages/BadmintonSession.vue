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
      <div v-if="!smAndUp" class="d-block">
        <SessionItem class="mb-4" v-for="session in badmintonSessionList" :item="session" :key="session.id" />
      </div>

      <div v-else class="session-list d-sm-flex flex-wrap ga-4">
        <SessionItem v-for="session in badmintonSessionList" :item="session" :key="session.id" />
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
    badmintonSessionList.value = await appStore.getAllBadmintonSession()
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    console.log(error)
  }
})

const handleCreateNewSession = (): void => {
  router.push({ name: 'BadmintonSessionCreate' })
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
</style>
