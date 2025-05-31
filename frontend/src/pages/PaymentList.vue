<template>
  <v-container>
    <v-row class="mb-4" :align="'center'" justify="start">
      <v-col cols="12" md="4">
        <v-select v-model="filters.status" :items="statuses" label="Trạng thái" clearable :hide-details="true"
          density="default" @update:modelValue="fetchPayments" />
      </v-col>
      <v-col cols="12" md="8" class="d-flex justify-start align-center ga-4">
        <v-btn color="primary" @click="openCreateDialog">
          Nạp tiền
        </v-btn>
        <span class="text-red">&lt----- van xin mọi người hãy bấm vào đây</span>
      </v-col>
    </v-row>

    <v-data-table-server :headers="headers" :items="payments" v-model:options="options" :items-length="totalItems"
      :loading="tableLoading" :items-per-page-options="[5, 10, 20, 50]" @update:options="fetchPayments" density="compact"
      class="elevation-1" show-current-page>
      <template v-if="appStore.isLeadOrAdminPermission" #item.actions="{ item }">
        <v-btn :disabled="item.status === 'accepted'" color="success" size="small" @click="accept(item)" class="me-2"
          variant="outlined">
          Chấp nhận
        </v-btn>

        <v-btn :disabled="item.status === 'accepted'" color="error" size="small" @click="cancel(item)" variant="outlined">
          Hủy
        </v-btn>
      </template>
      <template v-else #item.actions="{ item }">
        -
      </template>
      <template #item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" dark size="small">
          {{ getStatusText(item.status) }}
        </v-chip>
      </template>
    </v-data-table-server>
    <v-dialog v-model="dialogCreate" max-width="500px">
      <v-card>
        <v-card-title>Nạp tiền</v-card-title>
        <v-card-text class="d-flex flex-column justify-center align-center">
          <span class="text-caption">Quét mã chuyển khoản rồi nhập thông tin</span>
          <img :srcset="qr" class="qr-image" />
        </v-card-text>
        <v-card-text>
          <!-- Form tạo mới (ví dụ) -->
          <v-text-field v-model="form.amount" label="Số tiền" type="number" />
          <v-text-field v-model="form.note" label="Ghi chú: ví dụ thời gian chuyển khoản" />

        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogCreate = false">Hủy</v-btn>
          <v-btn color="primary" @click="handleCreate">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { PaymentResponse } from '../types/responses';
import { PaymentRequest } from '../types/requests';
import { useAppStore } from '../stores/app'
import { GROUP_ID } from '../constants/config'
import { DataTableHeader } from 'vuetify';
import qr from '@/assets/qr.jpg';

const appStore = useAppStore()

const payments = ref<PaymentResponse[]>([]);
const dialogCreate = ref(false)
const tableLoading = ref(false);
const form = ref<PaymentRequest>({
  groupId: GROUP_ID,
  amount: 0,
  note: ''
})

const options = ref({
  page: 1,
  itemsPerPage: 5,
  sortBy: [],
  sortDesc: []
});

const filters = reactive({
  status: undefined as string | undefined,
});

const statuses = [
  { title: 'Tất cả', value: undefined },
  { title: 'Chờ duyệt', value: 'pending' },
  { title: 'Đã duyệt', value: 'accepted' },
  { title: 'Từ chối', value: 'rejected' },
];

const headers: DataTableHeader[] = [
  { title: 'Ngày thanh toán', key: 'date', align: 'start' },
  { title: 'Số tiền', key: 'amount', align: 'end' },
  { title: 'Ghi chú', key: 'note', align: 'start' },
  { title: 'Trạng thái', key: 'status', align: 'start' },
  { title: 'Hành động', key: 'actions', sortable: false }
];

const totalItems = ref(0);
const fetchPayments = async () => {
  try {
    const { page, itemsPerPage } = options.value;
    tableLoading.value = true
    const res = await appStore.getMyPayments({
      page: page,
      limit: itemsPerPage,
      status: filters.status,
    });
    payments.value = res.data;
    totalItems.value = Number(res.pagination.total)
    tableLoading.value = false
  } catch (err) {
    console.error('Lỗi khi tải danh sách thanh toán', err);
    tableLoading.value = false
  }
};
const openCreateDialog = () => {
  form.value = {
    ...form.value,
    amount: 0,
    note: '',
  }
  dialogCreate.value = true
}
const handleCreate = async () => {
  if (!form.value.amount) {
    alert('Vui lòng nhập số tiền')
    return
  }
  try {
    console.log("tesststst")
    await appStore.createPayment(form.value)
    dialogCreate.value = false
    await fetchPayments()
  } catch (error: any) {
    alert(error.response?.data?.message || error.message || 'Tạo payment thất bại')
  }
}
const accept = async (item: PaymentResponse) => {
  console.log("Chấp nhận:", item);
  try {
    await appStore.acceptPayment(item._id)
    await fetchPayments()
  } catch (error) {
    console.log(error);
  }
};

const cancel = async (item: PaymentResponse) => {
  console.log("Hủy:", item);
  try {
    await appStore.rejectPayment(item._id)
    await fetchPayments()
  } catch (error) {
    console.log(error);
  }
};
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'orange';
    case 'accepted':
      return 'green';
    case 'rejected':
      return 'red';
    default:
      return 'grey';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Chờ duyệt';
    case 'accepted':
      return 'Đã duyệt';
    case 'rejected':
      return 'Từ chối';
    default:
      return 'Không rõ';
  }
};
onMounted(async () => {
  // await fetchPayments();
});
</script>
<style lang="scss" scoped>
.qr-image {
  max-width: 200px;
  /* hoặc bạn set width cụ thể như 128px */
  height: auto;
  object-fit: contain;
  /* không bị méo ảnh */
  display: block;
}
</style>
