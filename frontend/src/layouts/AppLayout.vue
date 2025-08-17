<template>
  <v-app>
    <!-- Header cố định -->
    <v-app-bar app color="primary" dark elevate-on-scroll flat>
      <v-app-bar-nav-icon class="d-sm-none" @click="drawer = true" />
      <v-toolbar-title class="font-weight-bold">Badminton Management</v-toolbar-title>
      <v-spacer />
      <v-btn icon :to="'/logout'" class="ml-2" variant="text">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Drawer với gradient và avatar -->
    <v-navigation-drawer app v-model="drawer" :permanent="display.smAndUp.value" :temporary="!display.smAndUp.value"
      width="270" class="drawer-gradient" elevation="8">
      <div class="pa-4 text-center">
        <v-avatar size="72" class="mb-2 elevation-4" color="white">
          <v-icon size="56" color="primary">mdi-badminton</v-icon>
        </v-avatar>
        <div class="font-weight-bold mb-1 text-h6">{{ appStore.user?.name || 'Khách' }}</div>
        <div class="text-caption" style="opacity:0.85">{{ appStore.user?.role || 'Thành viên' }}</div>
      </div>
      <v-divider class="mb-2" />
      <v-list nav density="comfortable">
        <v-list-item v-for="item in menuItems" :key="item.to" :to="item.to" :class="navItemClass(item.to)" rounded="xl"
          class="mb-1 nav-item">
          <template #prepend>
            <v-icon size="30">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title class="font-weight-medium text-body-1">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Nội dung chính -->
    <v-main class="main-content">
      <v-container fluid class="pa-6">
        <router-view :key="route.fullPath" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useAppStore } from '../stores/app'
import { useRoute } from 'vue-router'

const appStore = useAppStore()
const drawer = ref(true)
const display = useDisplay()
const route = useRoute()

const menuItems = computed(() => [
  { to: '/home', icon: 'mdi-home', title: 'Trang chủ' },
  { to: '/badminton-session', icon: 'mdi-calendar', title: 'Lịch đánh' },
  ...(appStore.isLeadOrAdminPermission
    ? [{ to: '/badminton-session/create', icon: 'mdi-plus-circle', title: 'Tạo lịch đánh' }]
    : []),
  { to: '/transaction-history', icon: 'mdi-history', title: 'Biến động' },
  { to: '/payments', icon: 'mdi-credit-card', title: 'Nạp tiền' },
  ...(appStore.isAdminPermission
    ? [{ to: '/user-management', icon: 'mdi-account-group', title: 'Quản lý người dùng' }]
    : []),
  { to: "change-password", icon: 'mdi-lock-reset', title: 'Đổi mật khẩu' },
  { to: '/policy', icon: 'mdi-file-document', title: 'Chính sách' },
  { to: '/logout', icon: 'mdi-logout', title: 'Đăng xuất' }
])

function navItemClass(path: string) {
  return {
    'nav-item-active': route.path === path,
    'nav-item-hover': route.path !== path,
  }
}
</script>

<style scoped>
.drawer-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: #fff;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.nav-item {
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
}

.nav-item-active {
  background: rgba(255, 255, 255, 0.18) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
}

.nav-item-hover:hover {
  background: rgba(255, 255, 255, 0.10) !important;
  color: #fff !important;
}

/* Sửa ở đây: */
.main-content {
  background: linear-gradient(120deg, #ffffff 0%, #fdfdfd 100%);
  height: calc(100vh - 64px);
  /* 64px là chiều cao mặc định của v-app-bar */
  overflow-y: auto;
  min-height: 0;
  /* Nếu header cao hơn, chỉnh lại số px cho đúng */
}
</style>
