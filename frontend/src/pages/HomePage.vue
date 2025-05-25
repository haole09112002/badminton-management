<template>
  <div class="summary pa-4">
    <v-card class="mx-auto" max-width="600" v-if="team" color="blue" variant="tonal">
      <v-card-title>
        <span class="headline">Chi tiết đội cầu lông</span>
      </v-card-title>
      <v-card-text>
        <v-list dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>Tên đội:</strong> {{ team.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>Số tiền còn lại:</strong> {{
                formatCurrency(team.amount) }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>Số cầu còn lại:</strong> {{ team.numberShuttlecock }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-if="team.note">
            <v-list-item-content>
              <v-list-item-title><strong>Ghi chú:</strong> {{ team.note }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>Cập nhật bởi:</strong> {{ team.updateById?.name || 'Không rõ'
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                <strong>Cập nhật lúc:</strong> {{ formatDateTime(team.updateTime) }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
    <div v-else class="d-flex justify-center">
      <v-progress-circular indeterminate class="mx-auto" />
    </div>
    <!-- Các nút hành động -->
    <div class="d-flex flex-column ga-3 mt-4 align-center" width="300">
      <v-btn :disabled="!appStore.isLeadOrAdminPermission" color="orange" @click="openCreateDialog" size="small"
        width="300">
        Thanh toán tiền mua cầu
      </v-btn>
      <v-btn :disabled="!appStore.isLeadOrAdminPermission" color="primary" @click="redirectToCreateSession" size="small"
        width="300">
        Thanh toán sân cố định
      </v-btn>
    </div>
    <v-dialog v-model="dialogCreate" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">Thanh toán tiền mua cầu</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.shuttlecockFee" label="Số tiền" type="number" density="compact" />
          <v-text-field v-model="form.numberShuttlecock" label="Số cầu" type="number" density="compact" />
          <v-text-field v-model="form.note" label="Ghi chú" density="compact" />
          <span v-if="!isEnoughtGroupBalance" class="text-caption text-red">Nhóm không đủ số dư</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogCreate = false">Hủy</v-btn>
          <v-btn color="primary" :disabled="!isEnoughtGroupBalance" @click="handleCreate">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-data-table class="mt-4" :headers="headers" :items="tableData" :items-per-page="limit" :page.sync="page"
      :server-items-length="totalCount" :loading="loading" density="compact" :mobile-breakpoint="0"
      @update:page="fetchTransactions">
      <template #item.delta="{ item }">
        <span :style="{ color: item.delta > 0 ? 'green' : 'red' }">
          {{ item.delta > 0 ? '+' : '' }}{{ item.delta.toLocaleString() }}
        </span>
      </template>

      <template #item.balanceAfter="{ item }">
        {{ item.balanceAfter.toLocaleString() }}
      </template>

      <template #item.reason="{ item }">
        <RouterLink v-if="item.sessionId" :to="`/badminton-session/${item.sessionId}`"
          class="text-blue text-decoration-underline">
          {{ item.reason }}
        </RouterLink>
        <span v-else>{{ item.reason }}</span>
      </template>

      <template #item.createdAt="{ item }">
        {{ item.createdAt }}
      </template>
    </v-data-table>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DataTableHeader, useDisplay } from 'vuetify'
import { GROUP_ID } from '../constants/config'
import api from '../plugins/axios'
import { useAppStore } from '../stores/app'
import { ShuttlecockFeeRequest } from '../types/requests'
import { Transaction } from '../types/responses'
import { BadmintonTeamResponse } from '../types/responses';

const emit = defineEmits(['close'])

const team = ref<BadmintonTeamResponse>()

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
  return form.value.shuttlecockFee > (team.value ? team.value?.amount ?? 0 : 0);
})
const totalCount = ref(0);
const page = ref(1);
const limit = 10;
const loading = ref(false);

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

onMounted(async () => {
  try {
    isLoading.value = true
    await Promise.all([appStore.getUserProfile(), fetchTransactions(), fetchTeam()])
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
    await appStore.payForShuttlecockFee(form.value)
    dialogCreate.value = false
  } catch (error: any) {
    alert(error.response?.data?.message || error.message || 'Tạo payment thất bại')
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
    page: page.value,
    limit,
  };
  if (filters.value.startDate) params.startDate = filters.value.startDate;
  if (filters.value.endDate) params.endDate = filters.value.endDate;

  try {
    const res = await api.get('/transactions/groups', { params });
    const data = res.data;
    transactions.value = data.transactions;

    console.log('transactions:', transactions.value);

    totalCount.value = data.totalCount;
  } catch (err) {
    console.error(err);
    // Xử lý lỗi nếu cần
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped>
@media (max-width: 600px) {
  .summary {
    display: flex;
    flex-direction: column;
    padding: 16px;
    align-items: center;
    /* justify-content: center; */
  }

  .v-btn {
    width: 100%;
  }

  .v-card-text {
    padding: 12px;
  }
}
</style>
