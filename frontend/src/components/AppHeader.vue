<template>
  <v-app>
    <!-- Drawer bên trái -->
    <v-navigation-drawer v-model="drawer" app temporary :width="220" class="pt-4">
      <v-list>
        <v-list-item title="Trang chủ" />
        <v-list-item title="Báo cáo" />
        <v-list-item title="Cài đặt" />
      </v-list>
    </v-navigation-drawer>

    <!-- Nút mở drawer (chỉ hiện khi mobile) -->
    <v-btn icon class="d-sm-none fixed top-2 left-2 z-50" @click="drawer = !drawer">
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <!-- Nội dung chính -->
    <v-main class="pa-4">
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const drawer = ref(false)
</script>
