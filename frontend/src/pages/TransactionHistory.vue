<template>
  <v-container class="transaction-history-container" fluid>
    <v-card class="filter-card pa-4 mb-6">
      <v-row>
        <!-- Start Date -->
        <v-col cols="12" md="3">
          <v-menu v-model="menuStart" :close-on-content-click="false" transition="scale-transition" offset-y>
            <template #activator="{ props }">
              <v-text-field v-model="filters.startDate" label="Ngày bắt đầu" readonly v-bind="props" clearable
                prepend-inner-icon="mdi-calendar" density="comfortable" variant="outlined" />
            </template>
            <v-date-picker v-model="filters.startDate" @input="menuStart = false" />
          </v-menu>
        </v-col>

        <!-- End Date -->
        <v-col cols="12" md="3">
          <v-menu v-model="menuEnd" :close-on-content-click="false" transition="scale-transition" offset-y>
            <template #activator="{ props }">
              <v-text-field v-model="filters.endDate" label="Ngày kết thúc" readonly v-bind="props" clearable
                prepend-inner-icon="mdi-calendar" density="comfortable" variant="outlined" />
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
      <v-data-table-server :headers="headers" :items="tableData" density="comfortable" v-model:options="options"
        :items-length="totalCount" :items-per-page-options="[10, 20, 50]" :loading="loading"
        @update:options="onOptionsUpdate" class="modern-table">
        <!-- delta -->
        <template #item.delta="{ item }">
          <span :class="item.delta > 0 ? 'text-green' : 'text-red'">
            {{ item.delta > 0 ? '+' : '' }}{{ item.delta.toLocaleString() }}
          </span>
        </template>

        <!-- balanceAfter -->
        <template #item.balanceAfter="{ item }">
          <span class="font-weight-bold">{{ item.balanceAfter.toLocaleString() }}</span>
        </template>

        <!-- reason (link) -->
        <template #item.reason="{ item }">
          <RouterLink v-if="item.sessionId" :to="`/badminton-session/${item.sessionId}`"
            class="text-blue text-decoration-underline font-weight-medium">
            {{ item.reason }}
          </RouterLink>
          <span v-else>{{ item.reason }}</span>
        </template>

        <!-- createdAt -->
        <template #item.createdAt="{ item }">
          <span class="text-grey-darken-1">{{ item.createdAt }}</span>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-grey">Không có giao dịch nào</div>
        </template>

        <!-- FOOTER PHÂN TRANG -->
        <template #bottom>
          <v-data-table-footer :options="options" :items-per-page-options="[10, 20, 50]" :items-length="totalCount" />
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DataTableHeader } from 'vuetify'
import api from '../plugins/axios'
import { Transaction } from '../types/responses'

const props = defineProps<{ memberId?: string }>()

// pagination + sort options
const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  sortDesc: []
})

const filters = ref({
  startDate: '',
  endDate: ''
})

const menuStart = ref(false)
const menuEnd = ref(false)

// data
const transactions = ref<Transaction[]>([])
const totalCount = ref(0)
const loading = ref(false)

const headers: DataTableHeader[] = [
  { title: 'Biến động', key: 'delta' },
  { title: 'Số dư sau', key: 'balanceAfter' },
  { title: 'Lý do', key: 'reason' },
  { title: 'Ngày tạo', key: 'createdAt' }
]

// mapping để hiển thị
const tableData = computed(() =>
  transactions.value.map(t => ({
    ...t,
    delta: t.balanceAfter - t.balanceBefore
  }))
)

// gọi API (GIỮ NGUYÊN HÀM NÀY)
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
// Khi đổi trang / page-size / sort
const onOptionsUpdate = () => {
  fetchTransactions()
}

onMounted(() => {
  fetchTransactions()
})
</script>
