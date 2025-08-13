<template>
  <v-app>
    <!-- Drawer luôn hiện ở desktop, ẩn ở mobile (temporary) -->
    <v-navigation-drawer app v-model="drawer" :permanent="display.smAndUp.value" :temporary="!display.smAndUp.value"
      width="240">
      <!-- <template> -->
      <v-list>
        <v-list-item :to="'/home'" :class="{ 'bg-primary text-white': $route.path === '/home' }">
          <template v-slot:prepend>
            <v-icon>mdi-home</v-icon>
          </template>
          <v-list-item-title>Trang chủ</v-list-item-title>
        </v-list-item>

        <v-list-item :to="'/badminton-session'"
          :class="{ 'bg-primary text-white': $route.path === '/badminton-session' }">
          <template v-slot:prepend>
            <v-icon>mdi-calendar</v-icon>
          </template>
          <v-list-item-title>Lịch đánh</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="appStore.isLeadOrAdminPermission" :to="'/badminton-session/create'"
          :class="{ 'bg-primary text-white': $route.path === '/badminton-session/create' }">
          <template v-slot:prepend>
            <v-icon>mdi-plus-circle</v-icon>
          </template>
          <v-list-item-title>Tạo lịch đánh</v-list-item-title>
        </v-list-item>
        <v-list-item :to="'/transaction-history'"
          :class="{ 'bg-primary text-white': $route.path === '/transaction-history' }">
          <template v-slot:prepend>
            <v-icon>mdi-history</v-icon>
          </template>
          <v-list-item-title>Biến động</v-list-item-title>
        </v-list-item>
        <v-list-item :to="'/payments'" :class="{ 'bg-primary text-white': $route.path === '/payments' }">
          <template v-slot:prepend>
            <v-icon>mdi-credit-card</v-icon>
          </template>
          <v-list-item-title>Nạp tiền</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="appStore.isAdminPermission" :to="'/user-management'"
          :class="{ 'bg-primary text-white': $route.path === '/user-management' }">
          <template v-slot:prepend>
            <v-icon>mdi-account-group</v-icon>
          </template>
          <v-list-item-title>Quản lý người dùng</v-list-item-title>
        </v-list-item>
        <v-list-item :to="'/logout'" :class="{ 'bg-primary text-white': $route.path === '/logout' }">
          <template v-slot:prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Đăng xuất</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Nút mở drawer (chỉ hiện khi mobile) -->
    <v-btn icon class="d-sm-none fixed top-2 left-2 z-50" @click="drawer = true">
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <!-- Nội dung chính -->
    <v-main class="pa-4 overflow-y-auto"
      :style="{ marginLeft: display.smAndUp.value ? '240px' : '0', height: '100vh' }">
      <router-view :key="$route.fullPath" />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useAppStore } from '../stores/app';
const appStore = useAppStore();
const drawer = ref(true)
const display = useDisplay()
</script>
