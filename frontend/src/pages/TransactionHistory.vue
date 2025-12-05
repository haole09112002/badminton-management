<template>
  <v-container class="transaction-history-container" fluid>
    <v-card class="filter-card pa-4 mb-6">
      <v-row>
        <v-col cols="12" md="3">
          <v-menu v-model="menuStart" :close-on-content-click="false" transition="scale-transition" offset-y
            max-width="290px" min-width="auto">
            <template #activator="{ props }">
              <v-text-field v-model="filters.startDate" label="Ngày bắt đầu" readonly v-bind="props" clearable
                @click:clear="filters.startDate = ''" :error="startDateError"
                :error-messages="startDateError ? ['Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc'] : []"
                :max="filters.endDate" prepend-inner-icon="mdi-calendar" density="comfortable" variant="outlined" />
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
                :min="filters.startDate" prepend-inner-icon="mdi-calendar" density="comfortable" variant="outlined" />
            </template>
            <v-date-picker v-model="filters.endDate" @input="menuEnd = false" />
          </v-menu>
        </v-col>
        <v-col cols="12" md="3" class="d-flex align-center">
          <v-btn class="btn-filter" color="primary" size="large" elevation="2" @click="fetchTransactions"
            prepend-icon="mdi-filter-variant">
            Lọc
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="table-card pa-2">
      <v-data-table-server :headers="headers" :items="tableData" density="comfortable" :items-length="totalCount"
        :items-per-page-options="[10, 20, 50]" v-model:options="options" :loading="loading"
        @update:options="onOptionsUpdate" class="modern-table" hide-default-footer>
        <template #item.delta="{ item }">
          <span :class="item.delta > 0 ? 'text-green' : 'text-red'">
            {{ item.delta > 0 ? '+' : '' }}{{ item.delta.toLocaleString() }}
          </span>
        </template>
        <template #item.balanceAfter="{ item }">
          <span class="font-weight-bold">{{ item.balanceAfter.toLocaleString() }}</span>
        </template>
        <template #item.reason="{ item }">
          <RouterLink v-if="item.sessionId" :to="`/badminton-session/${item.sessionId}`"
            class="text-blue text-decoration-underline font-weight-medium">
            {{ item.reason }}
          </RouterLink>
          <span v-else> {{ item.reason }}</span>
        </template>
        <template #item.createdAt="{ item }">
          <span class="text-grey-darken-1">{{ item.createdAt }}</span>
        </template>
        <template #no-data>
          <div class="text-center py-8 text-grey">Không có giao dịch nào</div>
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { DataTableHeader } from 'vuetify';
import api from '../plugins/axios';
import { Transaction } from '../types/responses';

const props = defineProps<{
  memberId?: string;
}>();

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  sortDesc: []
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
const totalCount = ref(0);
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

const headers: DataTableHeader[] = [
  { title: 'Số dư', key: 'balanceAfter', align: 'end' },
  { title: 'Biến động', key: 'delta', align: 'end' },
  { title: 'Lý do', key: 'reason', align: 'start' },
  { title: 'Thời gian', key: 'createdAt', align: 'start' },
];

const fetchTransactions = async () => {
  loading.value = true;
  const params: any = {
    page: options.value.page,
    limit: options.value.itemsPerPage,
  };

  if (filters.value.startDate) params.startDate = filters.value.startDate;
  if (filters.value.endDate) params.endDate = filters.value.endDate;

  try {
    if (props.memberId) {
      const res = await api.get(`/members/${props.memberId}/transactions`, { params });
      const data = res.data;
      transactions.value = data.transactions;
      totalCount.value = data.totalCount;
    } else {
      const res = await api.get('/transactions/me', { params });
      const data = res.data;
      transactions.value = data.transactions;
      totalCount.value = data.totalCount;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const onOptionsUpdate = (newOptions: any) => {
  options.value = { ...options.value, ...newOptions };
  fetchTransactions();
};

onMounted(() => {
  fetchTransactions();
});
</script>
