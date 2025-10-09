<template>
  <v-container class="payment-list-container" fluid>
    <v-card class="filter-card pa-4 mb-6">
      <v-row>
        <v-col cols="12" md="4">
          <v-select v-model="filters.status" :items="statuses" label="Trạng thái" clearable :hide-details="true"
            density="comfortable" variant="outlined" @update:modelValue="fetchPayments"
            prepend-inner-icon="mdi-filter-variant" />
        </v-col>
        <v-col cols="12" md="8" class="d-flex align-center gap-4">
          <v-btn class="btn-create" color="primary" size="large" elevation="2" variant="elevated" rounded="xl"
            @click="openCreateDialog" prepend-icon="mdi-plus">
            Nạp tiền
          </v-btn>
          <span class="text-red font-italic text-caption">&lt;--- Hãy bấm vào đây để nạp tiền nhé!</span>
        </v-col>
        <v-col cols="12" md="8" class="d-flex align-center gap-4" v-if="appStore.isLeadOrAdminPermission">
          <v-btn class="btn-create" color="primary" size="large" elevation="2" variant="elevated" rounded="xl"
            @click="openNewCreateDialog" prepend-icon="mdi-plus">
            Nạp tiền cho thành viên khác
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="table-card pa-2">
      <v-data-table-server :headers="headers" :items="payments" v-model:options="options" :items-length="totalItems"
        :loading="tableLoading" :items-per-page-options="[5, 10, 20, 50]" @update:options="fetchPayments"
        density="comfortable" class="modern-table" show-current-page>
        <template #item.amount="{ item }">
          <span class="font-weight-bold text-blue">{{ item.amount.toLocaleString() }}</span>
        </template>
        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" class="status-chip" size="small" variant="elevated">
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>
        <template v-if="appStore.isLeadOrAdminPermission" #item.actions="{ item }">
          <v-btn :disabled="item.status === 'accepted' || item.status === 'rejected'" color="success" size="small"
            @click="accept(item)" class="me-2" variant="outlined">
            Chấp nhận
          </v-btn>
          <v-btn :disabled="item.status === 'accepted' || item.status === 'rejected'" color="error" size="small"
            @click="cancel(item)" variant="outlined">
            Hủy
          </v-btn>
        </template>
        <template v-else #item.actions>
          -
        </template>
        <template #no-data>
          <div class="text-center py-8 text-grey">Không có giao dịch nào</div>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="dialogCreate" max-width="420px">
      <v-card>
        <v-card-title class="text-blue font-weight-bold">Nạp tiền</v-card-title>
        <v-card-text class="d-flex flex-column justify-center align-center">
          <span class="text-caption mb-2">Quét mã chuyển khoản rồi nhập thông tin</span>
          <img :src="PAYMENT_QR_URL" class="qr-image mb-2" />
        </v-card-text>
        <v-card-text>
          <v-text-field v-model="form.amount" label="Số tiền" type="number" variant="outlined" color="primary" />
          <v-text-field v-model="form.note" label="Ghi chú: ví dụ thời gian chuyển khoản" variant="outlined"
            color="primary" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogCreate = false">Hủy</v-btn>
          <v-btn color="primary" @click="handleCreate" variant="elevated">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="newDialogCreate" max-width="420px" v-if="appStore.isLeadOrAdminPermission">
      <v-card>
        <v-card-title class="text-blue font-weight-bold">Nạp tiền cho thành viên khác</v-card-title>
        <v-card-text>
          <v-select v-model="newForm.memberId" :items="members" item-title="title" item-value="value" label="Thành viên"
            variant="outlined" color="primary" clearable dense prepend-inner-icon="mdi-account-multiple"
            placeholder="Chọn thành viên" />
          <v-text-field v-model="newForm.amount" label="Số tiền" type="number" variant="outlined" color="primary" />
          <v-text-field v-model="newForm.note" label="Ghi chú: ví dụ thời gian chuyển khoản" variant="outlined"
            color="primary" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="newDialogCreate = false">Hủy</v-btn>
          <v-btn color="primary" @click="handleNewCreate" variant="elevated">Lưu</v-btn>
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
import { GROUP_ID, PAYMENT_QR_URL } from '../constants/config'
import { DataTableHeader } from 'vuetify';

const appStore = useAppStore()

const payments = ref<PaymentResponse[]>([]);
const dialogCreate = ref(false);
const newDialogCreate = ref(false)
const tableLoading = ref(false);
const form = ref<PaymentRequest>({
  groupId: GROUP_ID,
  amount: 0,
  note: ''
})

const newForm = ref({
  groupId: GROUP_ID,
  amount: 0,
  note: '',
  memberId: ''
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

const members = ref<{ title: string; value: string }[]>([]);

const fetchMembers = async () => {
  try {
    const res = await appStore.fetchAllMembers();
    members.value = res.map(m => ({
      title: `${m.name} - ${m.email}`,
      value: m.id
    }));
  } catch (err) {
    console.error('Lỗi lấy danh sách thành viên', err);
  }
};

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

// Gọi khi mở dialog nạp tiền cho thành viên khác
const openNewCreateDialog = async () => {
  newForm.value = {
    ...newForm.value,
    amount: 0,
    note: '',
    memberId: ''
  }
  await fetchMembers();
  newDialogCreate.value = true
}

const handleCreate = async () => {
  if (!form.value.amount) {
    alert('Vui lòng nhập số tiền')
    return
  }
  try {
    await appStore.createPayment(form.value)
    dialogCreate.value = false
    await fetchPayments()
  } catch (error: any) {
    alert(error.response?.data?.message || error.message || 'Tạo payment thất bại')
  }
}

const handleNewCreate = async () => {
  if (!newForm.value.amount) {
    alert('Vui lòng nhập số tiền');
    return
  }
  if (!newForm.value.memberId) {
    alert('Vui lòng chọn thành viên');
    return
  }
  try {
    console.log('Nạp tiền cho thành viên:', newForm.value.memberId);
    await appStore.createPaymentForMember(newForm.value, newForm.value.memberId);
    newDialogCreate.value = false
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
.payment-list-container {
  background: #f8fafc;
  padding-top: 24px;
  padding-bottom: 32px;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}

.filter-card {
  background: linear-gradient(90deg, #e3f2fd 60%, #fff 100%);
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(25, 118, 210, 0.08);
  margin-bottom: 32px;
}

.btn-create {
  font-weight: 700 !important;
  font-size: 1.08rem !important;
  letter-spacing: 0.5px;
  padding: 0 28px !important;
  border-radius: 28px !important;
  min-width: 120px;
  box-shadow: 0 4px 16px 0 rgba(25, 118, 210, 0.10);
  background: linear-gradient(90deg, #1976d2 80%, #42a5f5 100%) !important;
  color: #fff !important;
  text-transform: none;

  &:hover {
    background: linear-gradient(90deg, #1565c0 80%, #64b5f6 100%) !important;
    color: #fff !important;
    box-shadow: 0 8px 24px 0 rgba(25, 118, 210, 0.18);
  }
}

.table-card {
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 rgba(60, 72, 88, 0.10);
  background: #fff;
  padding: 0;
}

.modern-table :deep(.v-data-table-header) {
  background: linear-gradient(90deg, #1976d2 80%, #42a5f5 100%);
  color: #222 !important; // màu đen hiện đại
  font-weight: bold !important;
  font-size: 1.05rem;
  text-shadow: none;
}

.modern-table :deep(th) {
  background: transparent !important;
  color: #222 !important; // màu đen hiện đại
  font-weight: bold !important;
  border-bottom: 2px solid #e3e8ef !important;
  text-shadow: none;
}

.modern-table :deep(td) {
  font-size: 1rem;
  border-bottom: 1px solid #e3e8ef !important;
  background: #f9fafb !important;
}

.modern-table :deep(tr:nth-child(even) td) {
  background: #f3f6fa !important;
}

.modern-table :deep(tr:hover) td {
  background: #e3f2fd !important;
}

.status-chip {
  font-size: 13px !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
  letter-spacing: 0.2px;
  min-height: 28px;
}

.text-blue {
  color: #1976d2 !important;
}

.text-red {
  color: #e53935 !important;
}

.text-grey {
  color: #888 !important;
}

.font-weight-bold {
  font-weight: 700 !important;
}

.font-italic {
  font-style: italic !important;
}

.qr-image {
  max-width: 180px;
  height: auto;
  object-fit: contain;
  display: block;
  border-radius: 10px;
  box-shadow: 0 2px 8px 0 rgba(25, 118, 210, 0.10);
}

@media (max-width: 900px) {

  .filter-card,
  .table-card {
    border-radius: 10px;
    padding: 8px 2px;
  }

  .modern-table :deep(td),
  .modern-table :deep(th) {
    font-size: 0.95rem;
    padding: 8px 4px;
  }
}

@media (max-width: 600px) {
  .payment-list-container {
    padding-top: 8px;
    padding-bottom: 12px;
  }

  .filter-card,
  .table-card {
    border-radius: 0;
    box-shadow: none;
    margin-bottom: 16px;
    padding: 4px 0;
  }

  .modern-table :deep(td),
  .modern-table :deep(th) {
    font-size: 0.92rem;
    padding: 6px 2px;
  }

  .qr-image {
    max-width: 98vw;
  }
}
</style>
