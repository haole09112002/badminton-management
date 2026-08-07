<template>
  <div class="home-page">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <v-container>
        <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4">
          <div class="text-center text-md-start">
            <h1 class="text-h3 font-weight-bold text-primary mb-2">
              Dashboard
            </h1>
            <p class="text-body-1 text-medium-emphasis">
              Quản lý đội cầu lông và theo dõi hoạt động
            </p>
          </div>
          <div class="d-flex flex-column flex-sm-row gap-6 w-100 w-md-auto">
            <v-btn v-if="appStore.isLeadOrAdminPermission" color="orange" prepend-icon="mdi-shuttlecock"
              @click="openCreateDialog" variant="elevated" size="large" class="w-100 w-sm-auto">
              Mua cầu
            </v-btn>
            <v-btn v-if="appStore.isLeadOrAdminPermission" color="primary" prepend-icon="mdi-calendar-plus"
              @click="redirectToCreateSession" variant="elevated" size="large" class="w-100 w-sm-auto">
              Tạo lịch
            </v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <!-- Team Info Cards -->
    <v-container v-if="team" class="mb-6">
      <v-row>
        <!-- Team Balance Card -->
        <v-col cols="12" md="4">
          <v-card class="team-card balance-card" elevation="4">
            <v-card-text class="text-center pa-6">
              <v-icon size="64" color="success" class="mb-4">mdi-wallet</v-icon>
              <h3 class="text-h5 font-weight-bold mb-2 text-dark">Số dư nhóm</h3>
              <div class="text-h4 font-weight-bold text-success mb-2">
                {{ formatCurrency(team.amount) }}
              </div>
              <p class="text-body-2 text-medium-emphasis">Tổng số tiền hiện có</p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Shuttlecock Card -->
        <v-col cols="12" md="4">
          <v-card class="team-card shuttlecock-card" elevation="4">
            <v-card-text class="text-center pa-6">
              <v-icon size="64" color="orange" class="mb-4">mdi-badminton</v-icon>
              <h3 class="text-h5 font-weight-bold mb-2 text-dark">Cầu lông</h3>
              <div class="text-h4 font-weight-bold text-orange mb-2">
                {{ team.numberShuttlecock }}
              </div>
              <p class="text-body-2 text-medium-emphasis">
                {{ formatCurrency(team.shuttlecockFee / team.numberShuttlecock) }} / quả
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Team Info Card -->
        <v-col cols="12" md="4">
          <v-card class="team-card info-card" elevation="4">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-icon size="32" color="primary" class="me-3">mdi-account-group</v-icon>
                <h3 class="text-h5 font-weight-bold text-dark">Thông tin đội</h3>
              </div>
              <v-list density="compact" class="bg-transparent">
                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <v-icon size="small" color="primary">mdi-tag</v-icon>
                  </template>
                  <v-list-item-title class="text-body-1 text-dark">
                    <strong>{{ team.name }}</strong>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <v-icon size="small" color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2 text-dark">
                    {{ team.updateById?.name || 'Không rõ' }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <v-icon size="small" color="primary">mdi-clock</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2 text-dark">
                    {{ formatDateTime(team.updateTime) }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
              <v-expand-transition>
                <div v-if="team.note" class="mt-3">
                  <v-divider class="mb-3"></v-divider>
                  <div class="d-flex align-start">
                    <v-icon size="small" color="info" class="me-2 mt-1">mdi-note</v-icon>
                    <p class="text-body-2 text-dark mb-0">{{ team.note }}</p>
                  </div>
                </div>
              </v-expand-transition>
              <!-- Nút Share -->
              <v-divider class="my-4" />
              <v-btn block color="primary" variant="tonal" prepend-icon="mdi-share-variant"
                @click="navigateToGroupFees">
                Xem tổng phí thành viên
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Loading State -->
    <div v-else class="d-flex justify-center align-center" style="height: 300px;">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </div>

    <!-- Members Section -->
    <v-container class="mb-6">
      <v-card class="members-card" elevation="2">
        <v-card-title class="d-flex align-center pa-6 flex-wrap">
          <v-icon size="32" color="primary" class="me-3">mdi-account-multiple</v-icon>
          <h2 class="text-h5 font-weight-bold">Thành viên đội</h2>
          <v-spacer></v-spacer>
          <div class="total-balance-wrap">
            <v-chip color="success" variant="tonal" size="large">
              <v-icon start size="small">mdi-wallet</v-icon>
              Tổng: {{ formatCurrency(totalBalance) }}
            </v-chip>
          </div>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-data-table :headers="memberSeaders" :items="membersWithPayment" :loading="loading" density="comfortable"
            :items-per-page="-1" :mobile-breakpoint="0" hide-default-footer class="members-table">
            <template #item.no="{ index }">
              <v-avatar size="32" color="primary" variant="tonal">
                <span class="text-caption font-weight-bold">{{ index + 1 }}</span>
              </v-avatar>
            </template>
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="40" color="primary" variant="tonal" class="me-3">
                  <span class="text-body-2 font-weight-bold">{{ item.name.charAt(0).toUpperCase() }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
                </div>
              </div>
            </template>
            <template #item.balance="{ item }">
              <v-chip :color="item.balance > 0 ? 'success' : 'error'" variant="tonal" size="large">
                <v-icon start size="small">
                  {{ item.balance > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                {{ formatCurrency(item.balance) }}
              </v-chip>
            </template>
            <template #item.needToPay="{ item }">
              <v-chip :color="item.needToPay > 0 ? 'error' : 'success'" variant="tonal" size="large">
                <v-icon start size="small">
                  {{ item.needToPay > 0 ? 'mdi-alert' : 'mdi-check' }}
                </v-icon>
                {{
                  item.needToPay > 0
                    ? formatCurrency(item.needToPay)
                    : 'Đã đủ'
                }}
              </v-chip>
            </template>
            <!-- <template #item.needToSettle="{ item }">
              <v-chip color="grey" variant="tonal" size="large">
                0 ₫
              </v-chip>
            </template> -->
            <!-- Cột share -->
            <template #item.actions="{ item }">
              <v-btn icon variant="text" color="primary" size="small" @click="navigateToShare(item)">
                <v-icon>mdi-share-variant</v-icon>
                <v-tooltip activator="parent" location="top">Chia sẻ lịch sử phí</v-tooltip>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Transactions Section -->
    <v-container>
      <v-card class="transactions-card" elevation="2">
        <v-card-title class="d-flex align-center pa-6">
          <v-icon size="32" color="primary" class="me-3">mdi-history</v-icon>
          <h2 class="text-h5 font-weight-bold">Lịch sử giao dịch</h2>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-data-table-server :headers="headers" :items="tableData" :items-length="totalCount" :loading="loading"
            density="comfortable" :mobile-breakpoint="0" v-model:options="options"
            :items-per-page-options="[5, 10, 20, 50]" show-current-page @update:options="fetchTransactions"
            class="transactions-table">
            <template #item.delta="{ item }">
              <v-chip :color="item.delta >= 0 ? 'success' : 'error'" variant="tonal" size="small">
                {{ item.delta >= 0 ? "+" + formatCurrency(item.delta) : formatCurrency(item.delta) }}
              </v-chip>
            </template>

            <template #item.balanceAfter="{ item }">
              <span class="font-weight-medium">
                {{ formatCurrency(item.balanceAfter) }}
              </span>
            </template>

            <template #item.reason="{ item }">
              <div class="d-flex align-center">
                <v-icon size="small" color="primary" class="me-2">mdi-information</v-icon>
                <RouterLink v-if="item.sessionId" :to="`/badminton-session/${item.sessionId}`"
                  class="text-primary text-decoration-none font-weight-medium">
                  {{ item.reason }}
                </RouterLink>
                <span v-else class="font-weight-medium">{{ item.reason }}</span>
              </div>
            </template>

            <template #item.createdAt="{ item }">
              <v-chip variant="outlined" size="small" color="grey">
                <v-icon start size="x-small">mdi-clock</v-icon>
                {{ item.createdAt }}
              </v-chip>
            </template>
          </v-data-table-server>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Shuttlecock Payment Dialog -->
    <v-dialog v-model="dialogCreate" max-width="500px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pa-6">
          <v-icon size="32" color="orange" class="me-3">mdi-shuttlecock</v-icon>
          <h3 class="text-h6 font-weight-bold">Thanh toán tiền mua cầu</h3>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form @submit.prevent="handleCreate">
            <v-text-field v-model="form.shuttlecockFee" label="Số tiền" type="number" density="comfortable"
              variant="outlined" prepend-inner-icon="mdi-currency-vnd"
              :rules="[(v: any) => !!v || 'Vui lòng nhập số tiền']" />
            <v-text-field v-model="form.numberShuttlecock" label="Số cầu" type="number" density="comfortable"
              variant="outlined" prepend-inner-icon="mdi-numeric"
              :rules="[(v: any) => !!v || 'Vui lòng nhập số cầu']" />
            <v-textarea v-model="form.note" label="Ghi chú" density="comfortable" variant="outlined"
              prepend-inner-icon="mdi-note" rows="3" />
            <v-alert type="info" variant="tonal" class="mt-3" density="compact">
              Tiền cầu sẽ trừ vào tiền nhóm
            </v-alert>
            <v-alert v-if="!isEnoughtGroupBalance" type="error" variant="tonal" class="mt-3" density="compact">
              <v-icon start size="small">mdi-alert</v-icon>
              Nhóm không đủ số dư
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="outlined" @click="dialogCreate = false" size="large">
            Hủy
          </v-btn>
          <v-btn color="orange" :disabled="!isEnoughtGroupBalance" @click="handleCreate" size="large"
            :loading="isLoading">
            <v-icon start>mdi-check</v-icon>
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { DataTableHeader, useDisplay } from 'vuetify'
import { GROUP_ID } from '../constants/config'
import api from '../plugins/axios'
import { useAppStore } from '../stores/app'
import { Member } from '../types'
import { ShuttlecockFeeRequest } from '../types/requests'
import { Transaction } from '../types/responses'
import { BadmintonTeamResponse } from '../types/responses';

const emit = defineEmits(['close'])
const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  sortDesc: []
});
const team = ref<BadmintonTeamResponse>()
const members = ref<Member[]>([])

const siteConfig = ref<{ monthlyFee: number }>({
  monthlyFee: 0
})

const fetchSiteConfig = async () => {
  try {
    const res = await api.get('/site-setting')
    siteConfig.value = res.data
  } catch (e) {
    console.error('Lỗi fetch site config', e)
  }
}

const isInRemindPeriod = computed(() => {
  const start = siteConfig.value.remindStartDay
  const end = siteConfig.value.remindEndDay

  if (!start || !end) return false

  const today = new Date().getDate()

  return today >= start && today <= end
})

const membersWithPayment = computed(() => {
  const monthlyFee = siteConfig.value.monthlyFee || 0

  return members.value.map(member => {
    const balance = member.balance ?? 0

    const needToPay = Math.max(monthlyFee - balance, 0)

    return {
      ...member,
      needToPay,
      needToSettle: 0
    }
  })
})

const fetchTeam = async () => {
  try {
    const res = await appStore.getBadmintonTeamById(GROUP_ID)
    team.value = res
  } catch (error) {
    console.error('Lỗi khi tải thông tin team:', error)
  }
}

const formatCurrency = (value: number) => {
  if (typeof value !== 'number') return ''
  return value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
}

const formatDateTime = (date: string | Date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('vi-VN', {
    hour12: false,
  })
}
const appStore = useAppStore()
const router = useRouter()
const dialogCreate = ref(false)
const isLoading = ref(false)
const form = ref<ShuttlecockFeeRequest>({
  groupId: GROUP_ID,
  shuttlecockFee: 0,
  numberShuttlecock: 12,
  note: ''
})
const isEnoughtGroupBalance = computed<Boolean>(() => {
  console.log((team.value ? team.value?.amount ?? 0 : 0))
  return form.value.shuttlecockFee <= (team.value ? team.value?.amount ?? 0 : 0);
})
const totalCount = ref(0);
const loading = ref(false);
const totalBalance = computed(() => {
  return members.value.reduce((sum: number, member: Member) => sum + (member.balance ?? 0), 0);
});
const filters = ref({
  startDate: '',
  endDate: ''
});
const transactions = ref<Transaction[]>([]);
const tableData = computed(() =>
  transactions.value.map(t => ({
    type: t.type,
    balanceAfter: t.balanceAfter,
    delta: t.balanceAfter - t.balanceBefore,
    reason: t.reason,
    createdAt: new Date(t.createdAt).toLocaleString(),
    sessionId: t.sessionId
  }))
);
const headers: DataTableHeader[] = [
  { title: 'Số dư', key: 'balanceAfter', align: 'end' },
  { title: 'Biến động', key: 'delta', align: 'end' },
  { title: 'Lý do', key: 'reason', align: 'start' },
  { title: 'Thời gian', key: 'createdAt', align: 'start' },
];
const memberSeaders = computed<DataTableHeader[]>(() => {
  const baseHeaders: DataTableHeader[] = [
    { title: 'STT', key: 'no', align: 'start' },
    { title: 'Tên', key: 'name', align: 'start' },
    { title: 'Số dư', key: 'balance', align: 'start' },
  ]

  if (isInRemindPeriod.value) {
    baseHeaders.push(
      { title: 'Cần nộp ' + (formatCurrency(siteConfig.value.monthlyFee || 0)), key: 'needToPay', align: 'start' }
    )
  }

  // baseHeaders.push(
  //   { title: 'Cần thanh toán', key: 'needToSettle', align: 'start' }
  // )

  baseHeaders.push(
    { title: 'Xem nợ', key: 'actions', align: 'start' }
  )

  return baseHeaders
})
onMounted(async () => {
  try {
    isLoading.value = true
    await Promise.all([appStore.getUserProfile(), fetchTeam(), fetchAllMemberBalance(), fetchSiteConfig()])
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    console.log(error)
  }
})
const handleCreate = async () => {
  if (!form.value.shuttlecockFee) {
    alert('Vui lòng nhập số tiền')
    return
  }
  if (!form.value.numberShuttlecock) {
    alert('Vui lòng nhập số cầu')
    return
  }
  try {
    isLoading.value = true
    await appStore.payForShuttlecockFee(form.value)
    dialogCreate.value = false
    try {
      await Promise.all([fetchTransactions(), fetchTeam(), fetchAllMemberBalance()])
      isLoading.value = false
    } catch (error) {
      isLoading.value = false
      console.log(error)
    }
  } catch (error: any) {
    isLoading.value = false
    alert(error.response?.data?.message || error.message || 'Tạo payment thất bại')
  }
}

const navigateToShare = (member: any) => {
  router.push({
    path: '/share',
    query: {
      groupId: team.value._id,
      memberId: member.id,
      memberName: member.name,
      groupName: team.value.name,
      status: 'confirmed'
    }
  });
};

const fetchAllMemberBalance = async () => {
  try {
    const res = await appStore.fetchAllMembers()
    console.log(res.length)
    members.value = res
  } catch (error) {
    console.error('Lỗi khi tải thông tin member:', error)
  }
}
const openCreateDialog = () => {
  form.value = {
    ...form.value,
    shuttlecockFee: 0,
    numberShuttlecock: 12,
    note: '',
  }
  dialogCreate.value = true
}

const redirectToCreateSession = () => {
  router.push({ name: "BadmintonSessionCreate" })
}

const fetchTransactions = async () => {
  loading.value = true;
  const params: any = {
    groupId: GROUP_ID,
    page: options.value.page,
    limit: options.value.itemsPerPage,
  };
  if (filters.value.startDate) params.startDate = filters.value.startDate;
  if (filters.value.endDate) params.endDate = filters.value.endDate;

  try {
    const res = await api.get('/transactions/groups', { params });
    const data = res.data;
    transactions.value = data.transactions;
    totalCount.value = data.totalCount;
    console.log(data.totalCount)
  } catch (err) {
    console.error(err);
    // Xử lý lỗi nếu cần
  } finally {
    loading.value = false;
  }
};

const navigateToGroupFees = () => {
  router.push({
    path: '/group-fees',
    query: {
      groupId: team.value._id,
      groupName: team.value.name,
      status: 'confirmed'
    }
  });
};
</script>
<style scoped>
.home-page {
  background: #fafafa;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  box-sizing: border-box;
}

.header-section {
  background: #ffffff;
  color: #1e293b;
  padding: 2rem 0;
  margin: -1rem -1rem 2rem -1rem;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.team-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.balance-card {
  background: #ffffff;
  color: #1e293b;
  border: 2px solid #10b981;
}

.shuttlecock-card {
  background: #ffffff;
  color: #1e293b;
  border: 2px solid #f59e0b;
}

.info-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.members-card,
.transactions-card {
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.members-table,
.transactions-table {
  border-radius: 0 0 12px 12px;
}

.total-balance-wrap {
  max-width: 100%;
  white-space: normal;
  word-break: break-word;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .header-section {
    padding: 1.5rem 0;
  }

  .header-section h1 {
    font-size: 2rem !important;
  }
}

@media (max-width: 600px) {
  .header-section {
    padding: 1rem 0;
    margin: -1rem -1rem 1rem -1rem;
  }

  .header-section h1 {
    font-size: 1.5rem !important;
  }

  .header-section p {
    font-size: 0.875rem !important;
  }

  .team-card {
    margin-bottom: 1rem;
  }

  .v-card-text {
    padding: 1rem !important;
  }

  .v-card-title {
    padding: 1rem !important;
  }

  .v-btn {
    font-size: 0.875rem !important;
  }

  .total-balance-wrap {
    margin-top: 12px;
    width: 100%;
    align-items: flex-start;
    text-align: left;
  }

  .v-card-title.flex-wrap {
    flex-wrap: wrap !important;
  }
}

@media (max-width: 480px) {
  .header-section h1 {
    font-size: 1.25rem !important;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  .text-h5 {
    font-size: 1.25rem !important;
  }
}

/* Custom scrollbar for tables */
.members-table ::-webkit-scrollbar,
.transactions-table ::-webkit-scrollbar {
  height: 6px;
}

.members-table ::-webkit-scrollbar-track,
.transactions-table ::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.members-table ::-webkit-scrollbar-thumb,
.transactions-table ::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.members-table ::-webkit-scrollbar-thumb:hover,
.transactions-table ::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Custom responsive button classes */
.w-100 {
  width: 100% !important;
}

.w-sm-auto {
  width: auto !important;
}

@media (max-width: 600px) {
  .w-sm-auto {
    width: 100% !important;
  }
}

/* Ensure button spacing */
.gap-6 {
  gap: 24px !important;
}

@media (max-width: 600px) {
  .gap-6 {
    gap: 16px !important;
  }
}

/* Text contrast improvements */
.text-dark {
  color: #1e293b !important;
}

.text-white {
  color: #ffffff !important;
}

.text-opacity-90 {
  opacity: 0.9 !important;
}

/* Card text improvements */
.balance-card .v-card-text,
.shuttlecock-card .v-card-text {
  color: #1e293b !important;
}

.info-card .v-card-text {
  color: #1e293b !important;
}

/* Remove text shadows since we're using white backgrounds */
.team-card h3,
.team-card .text-h4,
.team-card .text-h5 {
  text-shadow: none;
}

.balance-card h3,
.balance-card .text-h4,
.shuttlecock-card h3,
.shuttlecock-card .text-h4 {
  text-shadow: none;
}
</style>
