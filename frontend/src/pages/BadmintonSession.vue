<template>
  <div class="home">
    <div v-if="appStore.isLeadOrAdminPermission">
      <v-btn class="text-caption mb-1 mt-4" color="primary" size="small" elevation="1" variant="tonal"
        @click="handleCreateNewSession">
        Tạo mới
      </v-btn>
      <v-divider :thickness="2" color="success" class="mt-4 mb-4 border-opacity-100"></v-divider>
    </div>



    <div v-if="!smAndUp" class="d-block">
      <SessionItem class="mb-4" v-for="session in badmintonSessionList" :item="session" :key="session.id" />
    </div>

    <div v-else class="session-list d-sm-flex flex-wrap ga-4">
      <SessionItem v-for="session in badmintonSessionList" :item="session" :key="session.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAppStore } from '../stores/app'
import { BadmintonSession } from '../types/responses'
import { formatCurrency } from '../utils'

const { smAndUp } = useDisplay()

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()
const totalAmount = ref<number>(0)
const totalNotOfficalAmount = ref<number>(0)
const badmintonSessionList = ref<BadmintonSession[]>([])
const isCreatePage = computed(() => route.name === 'BadmintonSessionCreate')
onMounted(async () => {
  try {
    const memberBalances = await appStore.getAllMemberBalance()
    totalAmount.value = memberBalances.reduce((acc, curr) => acc + curr.balance, 0)
    totalNotOfficalAmount.value = memberBalances.reduce((acc, curr) => acc + curr.statusAmounts.pending, 0)

    badmintonSessionList.value = await appStore.getAllBadmintonSession()
  } catch (error) {
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

/* Hiển thị grid cho màn hình lớn */
// .session-list {
//   display: grid;
//   grid-template-columns: repeat(3, 1fr);
//   grid-template-rows: repeat(2, auto);
//   gap: 10px;
// }

/* Chỉ hiển thị session-list dạng grid trên màn hình lớn */
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

/* Ẩn phần list trên các màn hình lớn */
</style>
