<template>
  <v-container>
    <v-card class="pa-4 mb-4">
      <v-row>
        <v-col cols="12" md="3">
          <v-menu v-model="menuStart" :close-on-content-click="false" transition="scale-transition" offset-y
            max-width="290px" min-width="auto">
            <template #activator="{ props }">
              <v-text-field v-model="filters.startDate" label="Ngày bắt đầu" readonly v-bind="props" clearable
                @click:clear="filters.startDate = ''" :error="startDateError"
                :error-messages="startDateError ? ['Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc'] : []"
                :max="filters.endDate" />
            </template>
            <v-date-picker v-model="filters.startDate" @input="menuStart = false" />
          </v-menu>
        </v-col>
        <v-col cols="12" md="3">
          <v-menu v-model="menuEnd" :close-on-content-click="false" transition="scale-transition" offset-y
            max-width="290px" min-width="auto">
            <template #activator="{ props }">
              <v-text-field v-model="filters.endDate" label="Ngày kết thúc" readonly v-bind="props" clearable
                @click:clear="filters.endDate = ''" :error="endDateError"
                :error-messages="endDateError ? ['Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu'] : []"
                :min="filters.startDate" />
            </template>
            <v-date-picker v-model="filters.endDate" @input="menuEnd = false" />
          </v-menu>
        </v-col>
        <v-col cols="12" md="3" class="d-flex align-center">
          <v-btn color="primary" @click="fetchTransactions">Lọc</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-data-table :headers="headers" :items="tableData" :items-per-page="limit" :page.sync="page" density="compact"
      :server-items-length="totalCount" :loading="loading" @update:page="fetchTransactions">

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
        <span v-else> {{ item.reason }}</span>

      </template>
      <template #item.createdAt="{ item }">
        {{ item.createdAt }}
      </template>
    </v-data-table>
  </v-container>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/plugins/axios'; // Axios instance
import { formatDateVi } from '../utils';
import { Transaction } from '../types/responses';


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
const totalCount = ref(0);
const page = ref(1);
const limit = 10;
const loading = ref(false);

const filters = ref({
  startDate: '',
  endDate: ''
});

const menuStart = ref(false);
const menuEnd = ref(false);
const startDateError = computed(() => {
  if (!filters.value.startDate || !filters.value.endDate) return false;
  return new Date(filters.value.startDate) > new Date(filters.value.endDate);
});

const endDateError = computed(() => {
  if (!filters.value.startDate || !filters.value.endDate) return false;
  return new Date(filters.value.endDate) < new Date(filters.value.startDate);
});
const headers = [
  { title: 'Số dư', key: 'balanceAfter', align: 'end' },
  { title: 'Biến động', key: 'delta', align: 'end' },
  { title: 'Lý do', key: 'reason', align: 'start' },
  { title: 'Thời gian', key: 'createdAt', align: 'start' },
];
const fetchTransactions = async () => {
  loading.value = true;

  // Chuẩn bị params
  const params: any = { // Thay thành memberId thực tế của user, có thể lấy từ context hoặc store
    page: page.value,
    limit,
  };
  if (filters.value.startDate) params.startDate = filters.value.startDate;
  if (filters.value.endDate) params.endDate = filters.value.endDate;

  try {
    const res = await api.get('/transactions/me', { params });
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

onMounted(() => {
  fetchTransactions();
});
</script>
<style lang="scss" scoped>
:deep(.v-data-table thead th) {
  background-color: #1976d2 !important;
  color: black !important;
  font-weight: bold !important;
}
</style>
