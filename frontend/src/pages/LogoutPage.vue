<!-- views/LogoutView.vue -->
<template>
  <v-container class="text-center mt-10">
    <v-progress-circular indeterminate color="primary" size="40" />
    <div>Đang đăng xuất...</div>
  </v-container>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { useAppStore } from '../stores/app'
const appStore = useAppStore()

const router = useRouter();

onMounted(() => {
  appStore.logout();
  router.replace('/login');
});
</script>
