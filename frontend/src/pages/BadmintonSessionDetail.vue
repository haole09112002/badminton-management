<!-- src/pages/Home.vue -->
<template>
  <div class="relative scroll-container">
    <div class="home">
      <span class="text-h6 text-blue">{{ getStatusCf(status ?? "").title }}</span>
      <div class="content">
        <div class="badminton-info">
          <v-radio-group :disabled="!isCreateMode || status === 'confirmed' || status === 'done'" v-model="courtType"
            label="Loại sân" inline density="compact">
            <v-radio label="Sân cố định" value="fixed" density="compact"></v-radio>
            <v-radio label="Sân vãng lai" value="casual" density="compact"></v-radio>
          </v-radio-group>
          <TextFieldWithLabel v-model="location" label="Tên sân" :required="true" placeholder="King Sport..."
            :error-message="errors.location" @focus="errors.location = ''"
            :readonly="status === 'done' || status === 'confirmed' || !appStore.isLeadOrAdminPermission" />
          <DateInputPicker v-model="dateModel" label="Ngày đánh" :required="true" :error-message="errors.time"
            @focus="errors.time = ''"
            :disabled="status === 'done' || status === 'confirmed' || (courtType === 'fixed' && !isCreateMode) || !appStore.isLeadOrAdminPermission"
            :multiple="isCreateMode && courtType === 'fixed'" />
          <div class="d-flex ga-4">
            <TextFieldWithLabel v-model="startTime" label="Giờ bắt đầu" :required="true" type="time"
              :error-message="errors.startTime" @focus="errors.startTime = ''"
              :readonly="status === 'done' || status === 'confirmed' || !appStore.isLeadOrAdminPermission" />
            <TextFieldWithLabel v-model="endTime" label="Giờ kết thúc" :required="true" type="time"
              :error-message="errors.endTime" @focus="errors.endTime = ''"
              :readonly="status === 'done' || status === 'confirmed' || !appStore.isLeadOrAdminPermission" />
          </div>

          <!-- Tiền sân và cầu -->
          <div class="info-row">
            <MoneyInputWithLabel v-model="courtFee"
              :label="courtType === 'fixed' ? (isCreateMode ? 'Tổng tiền đặt cố định' : 'Tiên sân cố định') : 'Tiền sân'"
              :readonly="status === 'done' || status === 'confirmed' || (courtType === 'fixed' && !isCreateMode)"
              :error-message="errors.courtFee" @focus="errors.courtFee = ''" />
            <MoneyInputWithLabel v-if="isCasualCourt" v-model="shuttlecockFee"
              :label="`Tổng tiền cầu (${formatCurrency((team?.shuttlecockFee ?? 0) / (team?.numberShuttlecock ?? 1))}/ 1 quả)`"
              :error-message="errors.shuttlecockFee" @focus="errors.shuttlecockFee = ''"
              :readonly="status === 'done' || status === 'confirmed' || !appStore.isLeadOrAdminPermission" />
            <TextFieldWithLabel v-if="isCasualCourt" v-model="numberShuttlecock" label="Số cầu"
              :error-message="errors.numberShuttlecock" @focus="errors.numberShuttlecock = ''" type="number"
              :readonly="status === 'done' || status === 'confirmed' || !appStore.isLeadOrAdminPermission" />
          </div>

          <!-- Tiền khác và tổng tiền -->
          <div v-if="isCasualCourt" class="info-row">
            <MoneyInputWithLabel v-model="extraFee" label="Tiền khác"
              :readonly="status === 'done' || status === 'confirmed' || !appStore.isLeadOrAdminPermission" />
            <MoneyInputWithLabel v-model="totalAmount" label="Tổng tiền" :readonly="true" />
          </div>

          <!-- Ghi chú và trạng thái -->
          <div class="info-row align-start">
            <TextAreaWithLabel v-model="note" label="Ghi chú"
              :readonly="status === 'done' || status === 'confirmed' || !appStore.isLeadOrAdminPermission" />
            <div class="status-box">
              <span>Trạng thái</span>
              <StatusTag :status="status ?? ''" />
            </div>
          </div>
        </div>
      </div>
      <v-table density="compact">
        <thead>
          <tr class="bg-blue">
            <th class="text-left">
              STT
            </th>
            <th class="text-left">
              Tên
            </th>
            <th class="text-left">
              Tính tiền sân
            </th>
            <th v-if="isCasualCourt" class="text-left">
              Tính tiền cầu
            </th>
            <th v-if="isCasualCourt" class="text-left">
              Tính tiền khác
            </th>
            <th class="text-left">
              Tiền sân
            </th>
            <th v-if="isCasualCourt" class="text-left">
              Tiền cầu
            </th>
            <th v-if="isCasualCourt" class="text-left">
              Tiền khác
            </th>
            <th v-if="isCasualCourt" class="text-left">
              Tiền điều chỉnh
            </th>
            <th class="text-left">
              Tổng
            </th>
            <th v-if="isCasualCourt && status !== 'done' && status !== 'confirmed'" class="text-left">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(participant, index) in participants" :key="participant.memberId">
            <tr class="bg-gray">
              <td data-label="STT" class="text-left">{{ index + 1 }}</td>
              <td class="text-left" data-label="Tên">
                <div class="d-flex flex-column">
                  <span class="text-body-2">{{ participant.name }}</span>
                  <span v-if="status !== 'done'" class="text-caption"> Số dư: <span
                      :class="[calculateAllTotalFee(participant) <= participant.balance ? 'text-green' : 'text-red', 'text-caption']">{{
                        formatCurrency(participant.balance) }}</span></span>
                </div>
              </td>
              <td data-label="Tính tiền sân">
                <v-checkbox v-model="participant.isCourtFeeApplied" @change="handleCheckboxChange()" density="compact"
                  hide-details color="blue"
                  :readonly="status === 'done' || status === 'confirmed' || (appStore.user?.id !== participant.memberId && !appStore.isLeadOrAdminPermission)"></v-checkbox>
              </td>
              <td v-if="isCasualCourt" data-label="Tính tiền cầu">
                <v-checkbox v-model="participant.isShuttlecockFeeApplied" color="blue" @change="handleCheckboxChange()"
                  density="compact" hide-details
                  :readonly="status === 'done' || status === 'confirmed' || (appStore.user?.id !== participant.memberId && !appStore.isLeadOrAdminPermission)"></v-checkbox>
              </td>
              <td v-if="isCasualCourt" data-label="Tính tiền khác">
                <v-checkbox v-model="participant.isExtraFeeApplied" color="blue" @change="handleCheckboxChange()"
                  :ripple="false" density="compact" hide-details
                  :readonly="status === 'done' || status === 'confirmed' || (appStore.user?.id !== participant.memberId && !appStore.isLeadOrAdminPermission)"></v-checkbox>
              </td>
              <td class="text-right font-weight-bold" data-label="Tiền sân">
                <span :class="participant.courtFee == 0 ? 'text-grey-lighten-1' : ''">
                  {{ formatCurrency(participant.courtFee) }}
                </span>
              </td>
              <td v-if="isCasualCourt" class="text-right" data-label="Tiền cầu">
                <span :class="participant.shuttlecockFee == 0 ? 'text-grey-lighten-1' : ''">
                  {{ formatCurrency(participant.shuttlecockFee) }}
                </span>
              </td>
              <td v-if="isCasualCourt" class="text-center" data-label="Tiền khác">
                <span :class="participant.extraFee == 0 ? 'text-grey-lighten-1' : ''">
                  {{ formatCurrency(participant.extraFee) }}
                </span>
              </td>
              <td v-if="isCasualCourt" class="text-left" data-label="Tiền điều chỉnh">
                <MoneyInputWithLabel v-model="participant.modifiedFee" :hide-details="true"
                  :readonly="status === 'done' || status === 'confirmed' || (appStore.user?.id !== participant.memberId && !appStore.isLeadOrAdminPermission)" />
              </td>
              <td class="text-left" data-label="Tổng">
                {{ formatCurrency(calculateTotalFee(participant)) }}
              </td>
              <td v-if="isCasualCourt && status !== 'done' && status !== 'confirmed'" class="text-left"
                data-label="Thao tác">
                <div class="d-flex gap-2">
                  <v-btn text="Thêm vãng lai" class="text-none" color="primary" size="small" variant="text" border slim
                    :disabled="(appStore.user?.id !== participant.memberId && !appStore.isLeadOrAdminPermission)"
                    @click="addNewCasualParticipant(participant.memberId)"></v-btn>
                </div>
              </td>
            </tr>
          </template>
          <!-- Sub-rows section -->
          <template v-for="[memberId, rows] in Array.from(expandedRows)" :key="memberId">
            <template v-for="(subRow, index) in rows" :key="subRow.memberId">
              <tr class="bg-gray sub-row">
                <td data-label="STT" class="text-left">
                  <div class="d-flex align-center">
                    <div class="d-flex flex-column">
                      <div class="d-flex">
                        <v-icon size="small" class="mr-2">mdi-subdirectory-arrow-right</v-icon>
                        <span>{{ String(getMainRowIndex(memberId) + 1) }}.{{ String(index + 1) }}</span>
                      </div>
                      <span class="text-caption text-black">{{participants.find(p => p.memberId ===
                        memberId)?.name}}</span>
                    </div>
                  </div>
                </td>
                <td class="text-left" data-label="Tên">
                  <TextFieldWithLabel v-if="status !== 'done' && status !== 'confirmed'" v-model="subRow.name"
                    :disabled="memberId !== appStore.user?.id && !appStore.isLeadOrAdminPermission" :hide-details="true"
                    label="Tên vãng lai" />
                  <span v-else class="text-caption">Vãng lai: <span class=" text-black">{{ subRow.name }}</span></span>
                </td>
                <td data-label="Tính tiền sân">
                  <v-checkbox v-model="subRow.isCourtFeeApplied" density="compact" hide-details color="blue"
                    :readonly="status === 'done' || status === 'confirmed' || (!appStore.isLeadOrAdminPermission && memberId !== appStore.user?.id)"
                    @update:model-value="handleCheckboxChange"></v-checkbox>
                </td>
                <td v-if="isCasualCourt" data-label="Tính tiền cầu">
                  <v-checkbox v-model="subRow.isShuttlecockFeeApplied" density="compact" hide-details color="blue"
                    :readonly="status === 'done' || status === 'confirmed' || (!appStore.isLeadOrAdminPermission && memberId !== appStore.user?.id)"
                    @update:model-value="handleCheckboxChange"></v-checkbox>
                </td>
                <td v-if="isCasualCourt" data-label="Tính tiền khác">
                  <v-checkbox v-model="subRow.isExtraFeeApplied" density="compact" hide-details color="blue"
                    :readonly="status === 'done' || status === 'confirmed' || (!appStore.isLeadOrAdminPermission && memberId !== appStore.user?.id)"
                    @update:model-value="handleCheckboxChange"></v-checkbox>
                </td>
                <td class="text-right font-weight-bold" data-label="Tiền sân">
                  <span :class="subRow.courtFee == 0 ? 'text-grey-lighten-1' : ''">
                    {{ formatCurrency(subRow.courtFee) }}
                  </span>
                </td>
                <td v-if="isCasualCourt" class="text-right" data-label="Tiền cầu">
                  <span :class="subRow.shuttlecockFee == 0 ? 'text-grey-lighten-1' : ''">
                    {{ formatCurrency(subRow.shuttlecockFee) }}
                  </span>
                </td>
                <td v-if="isCasualCourt" class="text-center" data-label="Tiền khác">
                  <span :class="subRow.extraFee == 0 ? 'text-grey-lighten-1' : ''">
                    {{ formatCurrency(subRow.extraFee) }}
                  </span>
                </td>
                <td v-if="isCasualCourt" class="text-left" data-label="Tiền điều chỉnh">
                  <MoneyInputWithLabel v-model="subRow.modifiedFee" :hide-details="true" :disabled="true" />
                </td>
                <td class="text-left" data-label="Tổng">
                  {{ formatCurrency(calculateTotalFee(subRow)) }}
                </td>
                <td v-if="isCasualCourt && status !== 'done' && status !== 'confirmed'" class="text-left"
                  data-label="Thao tác">
                  <v-btn icon="mdi-delete" size="small" color="error" variant="text" density="compact"
                    :disabled="!appStore.isLeadOrAdminPermission && memberId !== appStore.user?.id"
                    @click="removeNewParticipant(memberId, subRow.memberId)"></v-btn>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
        <tfoot>
          <tr>
            <td :colspan="isCasualCourt ? 9 : 4" class="text-center font-weight-bold">Tổng cộng tạm tính</td>
            <td class="text-left font-weight-bold">{{ formatCurrency(grandTotal) }}</td>
            <td v-if="isCasualCourt && (status !== 'done' && status !== 'confirmed')"
              class="text-left font-weight-bold">
            </td>
          </tr>
        </tfoot>
      </v-table>

      <div class="action">
        <div class="align-center">
          <span>{{ `Cập nhật bởi: ${updateByName ?? "./."}, ${updateTime?.toLocaleString() ?? "./."}` }}</span>

        </div>
      </div>
      <div class="action" v-show="status !== 'done'">
        <span class="text-red" v-show="grandTotal < totalAmount && status">{{ `Tiền tạm tính
          ${formatCurrency(grandTotal)} không thể
          bé
          hơn tiền tổng
          ${formatCurrency(totalAmount)}` }}</span>
        <div v-if="errors.participants" class="text-red text-caption mt-2">
          {{ errors.participants }}
        </div>
        <span v-show="!isValidAccBalance" class="text-red">Có thành viên không đủ số dư</span>
        <v-btn v-if="!status && appStore.isLeadOrAdminPermission" :disabled="status !== undefined" density="compact"
          elevation="4" @click="handleCheckCreate">
          Tạo
        </v-btn>
        <v-btn v-else :disabled="status === 'confirmed'" density="compact" elevation="4" @click="handleEdit">
          Cập nhật
        </v-btn>
        <v-btn v-if="appStore.isLeadOrAdminPermission" :disabled="status !== 'edited' || grandTotal < totalAmount"
          density="compact" elevation="4" @click="dialogConfirm = true">
          Xác nhận
        </v-btn>
        <v-btn v-if="appStore.isLeadOrAdminPermission"
          :disabled="status !== 'confirmed' || grandTotal < totalAmount || !isValidAccBalance" density="compact"
          elevation="4" @click="handlePay">
          Quyết toán ngay
        </v-btn>
      </div>
      <div class="d-flex flex-column align-start">
        <span class="text-caption">Quy trình</span>
        <span class="text-caption">1. Chọn Tạo mới</span>
        <span class="text-caption">2. Chọn cập nhật</span>
        <span class="text-caption">3. Chọn xác nhận</span>
        <span class="text-caption">4. Nếu đã xác nhận, tự động sẽ trừ tiền theo lịch hoặc chọn quyết toán ngay</span>
      </div>
    </div>
    <div v-if="isLoading" class="loading-overlay">
      <v-progress-circular indeterminate color="black" size="64"></v-progress-circular>
    </div>
    <v-dialog v-model="dialogCreate" max-width="500px">
      <v-card>
        <v-card-title>Bạn có chắc chắn muốn tạo sân cố định</v-card-title>
        <v-card-text class="d-flex flex-column">
          <span>
            Sân: {{ location }}
          </span>
          <span>
            Các ngày: {{ Array.isArray(dateModel) ? formatDates(dateModel) : formatDateVi(dateModel) }}
          </span>
          <span>
            Thời gian: {{ startTime }} - {{ endTime }}
          </span>
          <span>
            Sẽ trừ vào tài khoản của nhóm: <span class="text-blue font-weight-bold">{{ formatCurrency(totalAmount)
            }}</span>
          </span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogCreate = false">Hủy</v-btn>
          <v-btn color="primary" @click="handleCreate">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Add confirmation dialog -->
    <v-dialog v-model="dialogConfirm" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Xác nhận</v-card-title>
        <v-card-text>
          Nếu bạn "xác nhận" thì sẽ không còn chỉnh sửa được nữa. Bạn muốn tiếp tục?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="dialogConfirm = false">
            Hủy
          </v-btn>
          <v-btn color="primary" variant="text" @click="handleConfirm">
            Tiếp tục
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
// import TextFieldWithLabel from '@/components/TextFieldWithLabel.vue';
import { ref, computed, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { GROUP_ID } from '../constants/config';
import { useAppStore } from '../stores/app'
import { Member } from '../types';
import { BadmintonSessionRequest, ParticipantRequest } from '../types/requests'
import { BadmintonTeamResponse, Participant } from '../types/responses';
import { formatCurrency, getStatusCf, formatDateVi, formatDates } from '../utils'

interface SubParticipant {
  memberId: string;
  name: string;
  isCourtFeeApplied: boolean;
  isShuttlecockFeeApplied: boolean;
  isExtraFeeApplied: boolean;
  courtFee: number;
  shuttlecockFee: number;
  extraFee: number;
  modifiedFee: number;
  balance: number;
}

const dialogCreate = ref<boolean>(false);
const dialogConfirm = ref<boolean>(false);
const courtType = ref<"fixed" | "casual">('fixed');
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()
const isValidAccBalance = ref<boolean>(true)
const numberShuttlecock = ref<number>(0)
const startTime = ref<string>("");
const endTime = ref<string>("");
const updateTime = ref<Date>();
const updateByName = ref<string>("");
const location = ref<string>("");
const courtFee = ref<number>(0);
const shuttlecockFee = ref<number>(0);
const extraFee = ref<number>(0);
const participants = ref<Participant[]>([])
const status = ref<undefined | 'init' | 'edited' | 'confirmed' | 'done'>(undefined);
const note = ref<string>("")
const sessionId = computed(() => route.params.id as string);
const selectedDates = ref<Date[]>([]);
const selectedDate = ref<Date | null>(null);
const isLoading = ref<boolean>(false);
const dateModel = computed({
  get: () => {
    return (courtType.value === 'fixed' && isCreateMode) ? selectedDates.value : selectedDate.value;
  },
  set: (val: any) => {
    if (courtType.value === 'fixed') {
      selectedDates.value = val;
    } else {
      selectedDate.value = val;
    }
  }
});
const totalAmount = computed(() => {
  const court = Number(courtFee.value)
  const shuttle = Number(shuttlecockFee.value)
  const extraFeeNumber = Number(extraFee.value)
  return court + shuttle + extraFeeNumber
}
)
const errors = ref<Record<string, string>>({
  time: '',
  location: '',
  startTime: '',
  endTime: "",
  courtFee: '',
  shuttlecockFee: '',
  participants: '',
  extraFee: '',
  note: '',
  numberShuttlecock: ''
});
watch(totalAmount, (newValue, oldValue) => {
  handleCheckboxChange()
})

const grandTotal = computed(() => {
  // Tính tổng từ participants hiện tại
  const participantsTotal = participants.value.reduce((sum, p) => {
    return sum + calculateTotalFee(p);
  }, 0);

  // Tính tổng từ tất cả các expandedRows
  const expandedRowsTotal = Array.from(expandedRows.value.values()).reduce((sum, rows) => {
    return sum + rows.reduce((rowSum, p) => rowSum + calculateTotalFee(p), 0);
  }, 0);

  return participantsTotal + expandedRowsTotal;
});
const isCreateMode = (route.name === 'BadmintonSessionCreate' && (route.params.id as string) !== '')
const isCasualCourt = computed(() => courtType.value === 'casual' || !isCreateMode)

// Gom tất cả participant và sub-row lại
const getAllParticipants = () => {
  const all: (Participant | SubParticipant)[] = [...participants.value];
  expandedRows.value.forEach(rows => {
    all.push(...rows);
  });
  return all;
};

// Hàm chia đều tiền (giữ lại logic cũ)
function splitFeeEvenlyInt(total: number, count: number): number[] {
  if (count === 0) return [];
  const base = Math.floor(total / count);
  const remainder = total % count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

// Hàm cập nhật tiền cho từng người
function updateAllFees() {
  const all = getAllParticipants();

  // Lọc ra những người được tính từng loại phí
  const courtFeeApplied = all.filter(p => p.isCourtFeeApplied);
  const shuttlecockFeeApplied = all.filter(p => p.isShuttlecockFeeApplied);
  const extraFeeApplied = all.filter(p => p.isExtraFeeApplied);

  // Chia đều
  const courtFeeList = splitFeeEvenlyInt(courtFee.value, courtFeeApplied.length);
  const shuttlecockFeeList = splitFeeEvenlyInt(shuttlecockFee.value, shuttlecockFeeApplied.length);
  const extraFeeList = splitFeeEvenlyInt(extraFee.value, extraFeeApplied.length);

  // Gán lại cho từng người
  courtFeeApplied.forEach((p, i) => p.courtFee = courtFeeList[i]);
  shuttlecockFeeApplied.forEach((p, i) => p.shuttlecockFee = shuttlecockFeeList[i]);
  extraFeeApplied.forEach((p, i) => p.extraFee = extraFeeList[i]);

  // Những người không được tính thì set = 0
  all.forEach(p => {
    if (!p.isCourtFeeApplied) p.courtFee = 0;
    if (!p.isShuttlecockFeeApplied) p.shuttlecockFee = 0;
    if (!p.isExtraFeeApplied) p.extraFee = 0;
  });
}

// Gọi lại hàm này mỗi khi thay đổi checkbox hoặc số tiền
const handleCheckboxChange = () => {
  updateAllFees();
};

const calculateTotalFee = (participant: Participant | SubParticipant) => {
  return Number(participant.courtFee) + Number(participant.shuttlecockFee) + Number(participant.extraFee) + Number(participant.modifiedFee);
};
const calculateAllTotalFee = (participant: Participant | SubParticipant) => {
  const mainParticipantFee = calculateTotalFee(participant);

  // Calculate total fee for all sub-participants of this main participant
  const subParticipantsFee = (expandedRows.value.get(participant.memberId) || [])
    .reduce((sum, sub) => sum + calculateTotalFee(sub), 0);

  return mainParticipantFee + subParticipantsFee;
};
const newParticipants = ref<Map<string, Participant>>(new Map());

const getNewParticipant = (memberId: string) => {
  if (!newParticipants.value.has(memberId)) {
    newParticipants.value.set(memberId, {
      memberId: '',
      name: '',
      isCourtFeeApplied: false,
      isShuttlecockFeeApplied: false,
      isExtraFeeApplied: false,
      courtFee: 0,
      shuttlecockFee: 0,
      extraFee: 0,
      modifiedFee: 0,
      balance: 0
    });
  }
  return newParticipants.value.get(memberId)!;
};

// Update expandedRows type
const expandedRows = ref<Map<string, SubParticipant[]>>(new Map<string, SubParticipant[]>());

// Add watchEffect for isValidAccBalance
watchEffect(() => {
  isValidAccBalance.value = participants.value.every(mainParticipant => {
    // Calculate main participant's total fee
    const mainParticipantFee = calculateTotalFee(mainParticipant);

    // Calculate total fee for all sub-participants of this main participant
    const subParticipantsFee = (expandedRows.value.get(mainParticipant.memberId) || [])
      .reduce((sum, sub) => sum + calculateTotalFee(sub), 0);

    return mainParticipant.balance >= (mainParticipantFee + subParticipantsFee);
  });
});

// Add helper function to get sub-rows
const getSubRows = (memberId: string): SubParticipant[] => {
  return expandedRows.value.get(memberId) || [];
};

// Add function to add new casual participant
const addNewCasualParticipant = (memberId: string) => {
  const newParticipant: SubParticipant = {
    memberId: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    isCourtFeeApplied: false,
    isShuttlecockFeeApplied: false,
    isExtraFeeApplied: false,
    courtFee: 0,
    shuttlecockFee: 0,
    extraFee: 0,
    modifiedFee: 0,
    balance: 0
  };

  const currentRows = expandedRows.value.get(memberId) || [];
  expandedRows.value.set(memberId, [...currentRows, newParticipant]);
};

// Add function to remove new participant
const removeNewParticipant = (memberId: string, participantId: string) => {
  const currentRows = expandedRows.value.get(memberId) || [];
  const updatedRows = currentRows.filter(row => row.memberId !== participantId);

  if (updatedRows.length === 0) {
    const newMap = new Map(expandedRows.value);
    newMap.delete(memberId);
    expandedRows.value = newMap;
  } else {
    const newMap = new Map(expandedRows.value);
    newMap.set(memberId, updatedRows);
    expandedRows.value = newMap;
  }

  handleCheckboxChange();
};

// Add helper function to get expanded rows count
const getExpandedRowsCount = (memberId: string): number => {
  const rows = expandedRows.value.get(memberId);
  if (!rows) return 0;
  return rows.length;
};

onMounted(async () => {
  try {
    isLoading.value = true
    if (isCreateMode) {
      const [members] = await Promise.all([appStore.fetchAllMembers(), fetchTeam()])
      if (members && members.length > 0) {
        const allParticipants = members.map(m => {
          return {
            memberId: m.id,
            name: m.name,
            isCourtFeeApplied: false,
            isShuttlecockFeeApplied: false,
            isExtraFeeApplied: false,
            courtFee: 0,
            shuttlecockFee: 0,
            extraFee: 0,
            modifiedFee: 0,
            balance: m.balance
          } as Participant
        })
        participants.value = allParticipants
      } else {
        console.error('Không có thành viên nào hoặc có lỗi khi tải dữ liệu')
      }
      handleCheckboxChange()
      isLoading.value = false
    } else {
      const [members, badmintonSession] = await Promise.all([
        appStore.fetchAllMembers(),
        appStore.getBadmintonSession(sessionId.value),
        fetchTeam()
      ])
      if (badmintonSession) {
        if (members && members.length > 0 && badmintonSession.status !== 'confirmed' && badmintonSession.status !== "done") {
          participants.value = mergeMembersWithParticipants(members, badmintonSession.participants)
        } else {
          participants.value = [...badmintonSession.participants]
        }

        // Khởi tạo expandedRows từ sub-participants
        badmintonSession.participants.forEach(p => {
          if (p.participants && p.participants.length > 0) {
            const subParticipants = p.participants.map(sub => ({
              memberId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: sub.name,
              isCourtFeeApplied: sub.isCourtFeeApplied,
              isShuttlecockFeeApplied: sub.isShuttlecockFeeApplied,
              isExtraFeeApplied: sub.isExtraFeeApplied,
              courtFee: sub.courtFee,
              shuttlecockFee: sub.shuttlecockFee,
              extraFee: sub.extraFee,
              modifiedFee: 0,
              balance: 0
            }));
            expandedRows.value.set(p.memberId, subParticipants);
          }
        });

        courtType.value = badmintonSession.courtType
        selectedDate.value = new Date(badmintonSession.time)
        startTime.value = badmintonSession.startTime
        endTime.value = badmintonSession.endTime
        courtFee.value = badmintonSession.courtFee
        shuttlecockFee.value = badmintonSession.shuttlecockFee
        extraFee.value = badmintonSession.extraFee
        location.value = badmintonSession.location
        note.value = badmintonSession.note ?? ""
        status.value = badmintonSession.status
        updateTime.value = new Date(badmintonSession.updateTime)
        updateByName.value = badmintonSession.updateByName
        numberShuttlecock.value = badmintonSession.numberShuttlecock
      }
      isLoading.value = false
    }
  } catch (error) {
    console.log(error);
  }
})
function validateForm(): boolean {
  // Xoá hết lỗi cũ
  errors.value = {
    time: '',
    location: '',
    startTime: '',
    endTime: '',
    courtFee: '',
    shuttlecockFee: '',
    numberShuttlecock: '',
    participants: '',
    extraFee: '',
    note: ''
  }

  let valid = true;
  if (!location.value || location.value.trim() === '') {
    errors.value.location = 'Vui lòng nhập tên sân';
    valid = false;
  }

  if (!startTime.value) {
    errors.value.startTime = 'Vui lòng chọn giờ bắt đầu';
    valid = false;
  }

  if (!endTime.value) {
    errors.value.endTime = 'Vui lòng chọn giờ kết thúc';
    valid = false;
  }
  if (!dateModel.value || (courtType.value === 'fixed' ? ((dateModel.value as Date[]).length <= 0) : false)) {
    errors.value.time = 'Vui lòng chọn ngày';
    valid = false;
  }
  if (courtType.value === 'fixed' && (team.value?.amount ?? 0) < courtFee.value) {
    errors.value.courtFee = "Tiền sân vượt quá tiền đang có của nhóm"
    valid = false;
  }

  // Kiểm tra tên vãng lai
  const hasEmptyCasualName = Array.from(expandedRows.value.values()).some(rows =>
    rows.some(row => !row.name || row.name.trim() === '')
  );
  if (hasEmptyCasualName) {
    errors.value.participants = 'Vui lòng nhập tên người chơi vãng lai';
    valid = false;
  }

  return valid;
}

function validateFormForConfirm(): boolean {
  let valid = true;

  if ((team.value?.numberShuttlecock ?? 0) < numberShuttlecock.value) {
    errors.value.numberShuttlecock = "Số lượng cầu của nhóm không đủ"
    valid = false
  }
  if ((team.value?.shuttlecockFee ?? 0) < shuttlecockFee.value) {
    errors.value.shuttlecockFee = "Số tượng tiền cầu của nhóm không đủ"
    valid = false
  }

  return valid;
}
const handleCheckCreate = async (): Promise<void> => {
  if (!validateForm()) {
    return;
  }
  if (isCreateMode && courtType.value === 'fixed' && !dialogCreate.value) {
    dialogCreate.value = true;
  } else {
    await handleCreate();
  }
}
const handleCreate = async (): Promise<void> => {
  // Lấy tất cả participants từ cả participants.value và expandedRows
  const allParticipants: Participant[] = [...participants.value];

  const listParticipantsRequest: ParticipantRequest[] = allParticipants
    .filter(p => p.isCourtFeeApplied || p.isExtraFeeApplied || p.isShuttlecockFeeApplied || p.modifiedFee !== 0)
    .map(p => {
      // Tìm các expanded rows cho participant này
      const expandedRowsForParticipant = expandedRows.value.get(p.memberId) || [];
      console.log('Expanded rows for participant:', p.name, expandedRowsForParticipant);

      const nestedParticipants = expandedRowsForParticipant
        .filter(row => row.isCourtFeeApplied || row.isExtraFeeApplied || row.isShuttlecockFeeApplied || row.modifiedFee !== 0)
        .map(row => ({
          name: row.name,
          isCourtFeeApplied: row.isCourtFeeApplied,
          isShuttlecockFeeApplied: row.isShuttlecockFeeApplied,
          isExtraFeeApplied: row.isExtraFeeApplied,
          courtFee: row.courtFee,
          shuttlecockFee: row.shuttlecockFee,
          extraFee: row.extraFee
        }));

      const participantRequest = {
        memberId: p.memberId,
        isCourtFeeApplied: p.isCourtFeeApplied,
        isShuttlecockFeeApplied: p.isShuttlecockFeeApplied,
        isExtraFeeApplied: p.isExtraFeeApplied,
        courtFee: p.courtFee,
        shuttlecockFee: p.shuttlecockFee,
        extraFee: p.extraFee,
        modifiedFee: p.modifiedFee,
        participants: nestedParticipants
      };
      console.log('Participant request:', p.name, participantRequest);
      return participantRequest;
    });

  const param: BadmintonSessionRequest = {
    courtType: courtType.value,
    dateList: Array.isArray(dateModel.value)
      ? dateModel.value.filter((d): d is Date => d !== null).map(d => new Date(d))
      : dateModel.value !== null
        ? [new Date(dateModel.value)]
        : [],
    startTime: startTime.value,
    endTime: endTime.value,
    location: location.value,
    courtFee: courtFee.value,
    shuttlecockFee: shuttlecockFee.value,
    participants: listParticipantsRequest,
    extraFee: extraFee.value,
    note: note.value,
    groupId: GROUP_ID,
    numberShuttlecock: numberShuttlecock.value
  }
  console.log('Final request data:', param);
  try {
    isLoading.value = true
    const createdSession = await appStore.createBadmintonSession(param);
    isLoading.value = false
    dialogCreate.value = false
    if (param.courtType === 'fixed') {
      router.push({ name: "BadmintonSession" })
    }
    if (createdSession && createdSession._id) {
      status.value = createdSession?.status
      updateTime.value = new Date(createdSession.updateTime)
      updateByName.value = createdSession.updateByName
      navigationToDetailPage(createdSession._id)
    }
  } catch (error) {
    isLoading.value = false
    console.log(error)
  }
  return;
}

const handleEdit = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }
  const listParticipantsRequest: ParticipantRequest[] = participants.value
    .filter(p => p.isCourtFeeApplied || p.isExtraFeeApplied || p.isShuttlecockFeeApplied || p.modifiedFee !== 0)
    .map(p => {
      const expandedRowsForParticipant = expandedRows.value.get(p.memberId) || [];
      const nestedParticipants = expandedRowsForParticipant
        .filter(row => row.isCourtFeeApplied || row.isExtraFeeApplied || row.isShuttlecockFeeApplied || row.modifiedFee !== 0)
        .map(row => ({
          name: row.name,
          isCourtFeeApplied: row.isCourtFeeApplied,
          isShuttlecockFeeApplied: row.isShuttlecockFeeApplied,
          isExtraFeeApplied: row.isExtraFeeApplied,
          courtFee: row.courtFee,
          shuttlecockFee: row.shuttlecockFee,
          extraFee: row.extraFee
        }));

      return {
        memberId: p.memberId,
        isCourtFeeApplied: p.isCourtFeeApplied,
        isShuttlecockFeeApplied: p.isShuttlecockFeeApplied,
        isExtraFeeApplied: p.isExtraFeeApplied,
        courtFee: p.courtFee,
        shuttlecockFee: p.shuttlecockFee,
        extraFee: p.extraFee,
        modifiedFee: p.modifiedFee,
        participants: nestedParticipants
      };
    });

  const param: BadmintonSessionRequest = {
    courtType: courtType.value,
    dateList: Array.isArray(dateModel.value)
      ? dateModel.value.filter((d): d is Date => d !== null).map(d => new Date(d))
      : dateModel.value !== null
        ? [new Date(dateModel.value)]
        : [],
    startTime: startTime.value,
    endTime: endTime.value,
    location: location.value,
    courtFee: courtFee.value,
    shuttlecockFee: shuttlecockFee.value,
    participants: listParticipantsRequest,
    extraFee: extraFee.value,
    note: note.value,
    groupId: GROUP_ID,
    numberShuttlecock: numberShuttlecock.value
  }
  try {
    isLoading.value = true
    const createdSession = await appStore.updateBadmintonSession(sessionId.value, param);
    if (createdSession.session._id) {
      status.value = createdSession.session.status
      updateTime.value = new Date(createdSession.session.updateTime)
      updateByName.value = createdSession.session.updateByName
      if (createdSession.errors.numberShuttlecock) {
        errors.value.numberShuttlecock = createdSession.errors.numberShuttlecock
      }

      if (createdSession.errors.shuttlecockFee) {
        errors.value.shuttlecockFee = createdSession.errors.shuttlecockFee
      }
    }
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    console.log(error)
  }
}

const handleConfirm = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }
  const listParticipantsRequest: ParticipantRequest[] = participants.value
    .filter(p => p.isCourtFeeApplied || p.isExtraFeeApplied || p.isShuttlecockFeeApplied || p.modifiedFee !== 0)
    .map(p => {
      const expandedRowsForParticipant = expandedRows.value.get(p.memberId) || [];
      const nestedParticipants = expandedRowsForParticipant
        .filter(row => row.isCourtFeeApplied || row.isExtraFeeApplied || row.isShuttlecockFeeApplied || row.modifiedFee !== 0)
        .map(row => ({
          name: row.name,
          isCourtFeeApplied: row.isCourtFeeApplied,
          isShuttlecockFeeApplied: row.isShuttlecockFeeApplied,
          isExtraFeeApplied: row.isExtraFeeApplied,
          courtFee: row.courtFee,
          shuttlecockFee: row.shuttlecockFee,
          extraFee: row.extraFee
        }));

      return {
        memberId: p.memberId,
        isCourtFeeApplied: p.isCourtFeeApplied,
        isShuttlecockFeeApplied: p.isShuttlecockFeeApplied,
        isExtraFeeApplied: p.isExtraFeeApplied,
        courtFee: p.courtFee,
        shuttlecockFee: p.shuttlecockFee,
        extraFee: p.extraFee,
        modifiedFee: p.modifiedFee,
        participants: nestedParticipants
      };
    });

  const param: BadmintonSessionRequest = {
    courtType: courtType.value,
    dateList: Array.isArray(dateModel.value)
      ? dateModel.value.filter((d): d is Date => d !== null).map(d => new Date(d))
      : dateModel.value !== null
        ? [new Date(dateModel.value)]
        : [],
    startTime: startTime.value,
    endTime: endTime.value,
    location: location.value,
    courtFee: courtFee.value,
    shuttlecockFee: shuttlecockFee.value,
    participants: listParticipantsRequest,
    extraFee: extraFee.value,
    note: note.value,
    groupId: GROUP_ID,
    numberShuttlecock: numberShuttlecock.value
  }
  try {
    isLoading.value = true
    const createdSession = await appStore.confirmBadmintonSession(sessionId.value, param);
    if (createdSession.session._id) {
      status.value = createdSession.session.status
      updateTime.value = new Date(createdSession.session.updateTime)
      updateByName.value = createdSession.session.updateByName
      if (createdSession.errors.numberShuttlecock) {
        errors.value.numberShuttlecock = createdSession.errors.numberShuttlecock
      }

      if (createdSession.errors.shuttlecockFee) {
        errors.value.shuttlecockFee = createdSession.errors.shuttlecockFee
      }
      dialogConfirm.value = false
    }
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    console.log(error)
  }
}

const handlePay = async (): Promise<void> => {
  try {

    isLoading.value = true
    const createdSession = await appStore.payBadmintonSession(sessionId.value);
    if (createdSession && createdSession._id) {
      status.value = createdSession?.status
      isLoading.value = false
      // navigationToDetailPage(createdSession._id)
    }
  } catch (error) {
    isLoading.value = false
    console.log(error)
  }
}

function mergeMembersWithParticipants(
  members: Member[],
  oldParticipants: Participant[]
): Participant[] {
  const oldMap = new Map<string, Participant>();
  oldParticipants.forEach(p => oldMap.set(p.memberId, p));

  return members.map(member => {
    const existing = oldMap.get(member.id);
    if (existing) {
      existing.balance = member.balance
      return existing;
    }

    // Nếu không có participant tương ứng => tạo mới mặc định
    return {
      memberId: member.id,
      name: member.name,
      isCourtFeeApplied: false,
      isShuttlecockFeeApplied: false,
      isExtraFeeApplied: false,
      courtFee: 0,
      shuttlecockFee: 0,
      extraFee: 0,
      modifiedFee: 0,
      balance: member.balance
    } as Participant;
  });
}


const navigationToDetailPage = (id: string) => {
  router.push({ name: 'BadmintonSessionDetail', params: { id: id } })
}

const team = ref<BadmintonTeamResponse>()
const headers = [
  { title: 'STT', key: 'no', align: 'start' as const },
  { title: 'Tên', key: 'name', align: 'start' as const },
  { title: 'Tính tiền sân', key: 'isCourtFeeApplied', align: 'start' as const },
  { title: 'Tính tiền cầu', key: 'isShuttlecockFeeApplied', align: 'start' as const },
  { title: 'Tính tiền khác', key: 'isExtraFeeApplied', align: 'start' as const },
  { title: 'Tiền sân', key: 'courtFee', align: 'end' as const },
  { title: 'Tiền cầu', key: 'shuttlecockFee', align: 'end' as const },
  { title: 'Tiền khác', key: 'extraFee', align: 'end' as const },
  { title: 'Tiền điều chỉnh', key: 'modifiedFee', align: 'end' as const },
  { title: 'Tổng', key: 'total', align: 'end' as const }
]

const fetchTeam = async () => {
  try {
    const res = await appStore.getBadmintonTeamById(GROUP_ID)
    team.value = res
  } catch (error) {
    console.error('Lỗi khi tải thông tin team:', error)
  }
}

// Thêm hàm tính phí cho newParticipant
const calculateNewParticipantFees = (memberId: string) => {
  const newParticipant = getNewParticipant(memberId);
  const allParticipants = [...participants.value, newParticipant];

  const courtFeeApplied = allParticipants.filter(p => p.isCourtFeeApplied);
  const shuttlecockFeeApplied = allParticipants.filter(p => p.isShuttlecockFeeApplied);
  const extraFeeApplied = allParticipants.filter(p => p.isExtraFeeApplied);

  const courtFeeList = splitFeeEvenlyInt(courtFee.value, courtFeeApplied.length);
  const shuttlecockFeeList = splitFeeEvenlyInt(shuttlecockFee.value, shuttlecockFeeApplied.length);
  const extraFeeList = splitFeeEvenlyInt(extraFee.value, extraFeeApplied.length);

  // Tìm vị trí của newParticipant trong danh sách
  const courtIndex = courtFeeApplied.findIndex(p => p === newParticipant);
  const shuttleIndex = shuttlecockFeeApplied.findIndex(p => p === newParticipant);
  const extraIndex = extraFeeApplied.findIndex(p => p === newParticipant);

  const courtFeePerPerson = courtIndex >= 0 ? courtFeeList[courtIndex] : 0;
  const shuttlecockFeePer = shuttleIndex >= 0 ? shuttlecockFeeList[shuttleIndex] : 0;
  const extraFeePer = extraIndex >= 0 ? extraFeeList[extraIndex] : 0;

  newParticipants.value.set(memberId, {
    ...newParticipant,
    courtFee: courtFeePerPerson,
    shuttlecockFee: shuttlecockFeePer,
    extraFee: extraFeePer,
  });
};

// Thêm hàm để tạo ID mới cho newParticipant
const generateNewParticipantId = () => {
  return `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Sửa lại hàm handleExpand
const handleExpand = (participant: Participant, isExpanded: () => boolean, toggleExpand: () => void) => {
  const memberId = participant.memberId;

  // Nếu chưa có danh sách row cho memberId này, tạo mới với một row mặc định
  if (!expandedRows.value.has(memberId)) {
    const newParticipant: Participant = {
      memberId: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      isCourtFeeApplied: false,
      isShuttlecockFeeApplied: false,
      isExtraFeeApplied: false,
      courtFee: 0,
      shuttlecockFee: 0,
      extraFee: 0,
      modifiedFee: 0,
      balance: 0
    };
    expandedRows.value.set(memberId, [newParticipant]);
  } else {
    expandedRows.value.delete(memberId);
  }
};

// Update getMainRowIndex function to handle string type
const getMainRowIndex = (memberId: string): number => {
  return participants.value.findIndex(p => p.memberId === memberId);
};

</script>

<style lang="scss" scoped>
.scroll-container {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}

.home {
  text-align: center;
  padding: 20px;
}

.summary {
  display: flex;
  flex-direction: column;
}

.form-item {
  display: flex;
  gap: 16px;
  align-items: center;
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

// ========== ACTION BUTTONS ==========
.action {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  // align-content: center;
  justify-content: flex-end;

  span {
    flex-basis: 100%;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    // align-items: stretch;
    align-items: center;

    .v-btn {
      width: 80%;
    }
  }
}

.badminton-info {
  display: flex;
  flex-direction: column;
  gap: 0px;

  .info-row {
    display: flex;
    gap: 12px;

    // Khi màn hình nhỏ, hiển thị theo cột
    @media (max-width: 600px) {
      flex-direction: column;
    }
  }

  .status-box {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    gap: 4px;
    align-items: start;
  }
}

.v-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 14px;

  thead {
    background-color: #e3f2fd;

    th {
      padding: 12px 8px;
      font-weight: 600;
      text-align: left;
      border-bottom: 1px solid #ccc;
    }
  }

  tbody {
    tr {
      background-color: #f9f9f9;

      &:nth-child(even) {
        background-color: #f0f0f0;
      }

      td {
        padding: 10px 8px;
        border-bottom: 1px solid #ddd;
        vertical-align: middle;

        :deep(.v-field__field input) {
          height: 30px;
          min-height: 30px;
        }

        .text-caption {
          font-size: 12px;
          color: #777;
        }
      }
    }
  }

  tfoot {
    font-weight: bold;
    background-color: #f5f5f5;

    td {
      padding: 10px 8px;
      border-top: 1px solid #ccc;
    }
  }
}

/* Responsive cho mobile */
@media (max-width: 768px) {
  .v-table {
    font-size: 12px;

    thead {
      display: none;
    }

    tbody,
    tfoot {
      display: block;

      tr {
        display: flex;
        flex-direction: column;
        margin-bottom: 12px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #fff;
        overflow: hidden;
      }

      td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: none;
        padding: 8px 12px;

        :deep(.v-field__field input) {
          height: 30px;
          min-height: 30px;
        }

        &:before {
          content: attr(data-label);
          font-weight: 600;
          margin-right: 8px;
        }
      }
    }
  }

  /* Điều chỉnh layout cho expanded rows */
  .v-table tbody tr td[colspan] {
    padding: 24px !important;
    border: none;
    background: transparent;
    width: 100%;
    min-height: 200px;

    .v-table {
      margin: 0;
      border: none;
      background: transparent;
      width: 100%;

      tbody {
        display: block;
        width: 100%;

        tr {
          display: flex;
          flex-direction: column;
          margin: 0 0 16px 0;
          border: 1px solid #ccc;
          border-radius: 8px;
          background-color: #fff;
          overflow: hidden;
          min-height: 120px;

          &:last-child {
            margin-bottom: 0;
          }

          td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: none;
            padding: 12px 16px;
            background: transparent;
            width: 100%;
            min-height: 48px;

            &:before {
              content: attr(data-label);
              font-weight: 600;
              margin-right: 8px;
            }

            .d-flex.flex-column {
              width: 100%;
              gap: 12px;
            }

            .d-flex.align-center {
              margin-bottom: 12px;
              min-height: 36px;

              &:last-child {
                margin-bottom: 0;
              }
            }

            .text-caption {
              font-size: 13px;
            }

            :deep(.v-field__field input) {
              height: 36px;
              min-height: 36px;
            }
          }
        }
      }
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.expanded-list {
  padding: 16px;
  background: #f5f5f5;
}

.expanded-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &:last-child {
    margin-bottom: 0;
  }
}

.item-header {
  padding: 12px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.fee-info {
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-size: 14px;
    color: #666;
  }
}

.fee-amount {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.item-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-top: 1px solid #eee;
}

.total-label {
  font-size: 14px;
  color: #666;
}

.total-amount {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .expanded-list {
    padding: 12px;
  }

  .expanded-item {
    margin-bottom: 6px;
  }

  .item-header,
  .item-content,
  .item-footer {
    padding: 10px;
  }

  .fee-row {
    padding: 6px 0;
  }

  .fee-info span,
  .fee-amount,
  .total-label,
  .total-amount {
    font-size: 13px;
  }

  /* Mobile styles for expanded rows */
  .v-table tbody tr td[colspan] {
    padding: 0 !important;
    border: none;
    background: transparent;
    width: 100%;

    .expanded-list {
      padding: 8px;
    }

    .expanded-item {
      margin-bottom: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }

    .item-header {
      padding: 8px 12px;
      background: #f5f5f5;
    }

    .item-content {
      padding: 8px 12px;
    }

    .fee-row {
      padding: 8px 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }
    }

    .item-footer {
      padding: 8px 12px;
      background: #f5f5f5;
      border-top: 1px solid #eee;
    }
  }
}

.sub-row {
  background-color: #d4e2b7 !important;

  // td {
  //   // border: 1px solid #2196f3;
  // }
}
</style>
