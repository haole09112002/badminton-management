<!-- src/pages/Home.vue -->
<template>
  <div class="relative">
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
            <MoneyInputWithLabel v-model="courtFee" :label="courtType === 'fixed' ? 'Tổng tiền đặt cố định' : 'Tiền sân'"
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="(participant, index) in participants" :key="participant.memberId" class="bg-gray">
            <td data-label="STT" class="text-left">{{ index + 1 }} </td>
            <td class="text-left" data-label="Tên">
              <div class="d-flex flex-column">
                <span class="text-body-2">{{ participant.name }}</span>
                <span v-if="status !== 'done'"> Số dư: <span
                    :class="[calculateTotalFee(participant) <= participant.balance ? 'text-green' : 'text-red', 'text-caption']">{{
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
              <span :class="participant.courtFee == 0 ? 'text-grey-lighten-1' : ''"> {{
                formatCurrency(participant.courtFee) }}</span>

            </td>
            <td class="text-right" data-label="Tiền cầu">
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
              <!-- <TextFieldWithLabel v-model="participant.modifiedFee" label="" :inputWidth="'100px'" /> -->
            </td>
            <td v-if="isCasualCourt" class="text-left">{{ formatCurrency(calculateTotalFee(participant)) }}</td>
          </tr>
        </tbody>
        <tfoot v-if="isCasualCourt">
          <tr>
            <td colspan="9" class="text-center font-weight-bold">Tổng cộng tạm tính</td>
            <td class="text-left font-weight-bold">{{ formatCurrency(grandTotal) }}</td>
          </tr>
        </tfoot>
      </v-table>
      <div class="action">
        <div>
          <span>Cập nhật lúc: {{ updateTime?.toLocaleString() ?? "./." }}</span>

        </div>
      </div>
      <div class="action" v-show="status !== 'done'">

        <span class="text-red" v-show="grandTotal < totalAmount && status">{{ `Tiền tạm tính
          ${formatCurrency(grandTotal)} không thể
                  bé
                  hơn tiền tổng
                  ${formatCurrency(totalAmount)}` }}</span>
        <span v-show="!isValidAccBalance" class="text-red">Có thành viên không đủ số dư</span>
        <v-btn v-if="!status && appStore.isLeadOrAdminPermission" :disabled="status !== undefined" density="compact"
          elevation="4" @click="handleCheckCreate">
          Tạo
        </v-btn>
        <v-btn v-else :disabled="status === 'confirmed'" density="compact" elevation="4" @click="handleEdit">
          Cập nhật
        </v-btn>
        <v-btn v-if="appStore.isLeadOrAdminPermission" :disabled="status !== 'edited' || grandTotal < totalAmount"
          density="compact" elevation="4" @click="handleConfirm">
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
  </div>
</template>

<script setup lang="ts">
// import TextFieldWithLabel from '@/components/TextFieldWithLabel.vue';
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { GROUP_ID } from '../constants/config';
import { useAppStore } from '../stores/app'
import { Member } from '../types';
import { BadmintonSessionRequest, ParticipantRequest } from '../types/requests'
import { BadmintonTeamResponse, Participant } from '../types/responses';
import { formatCurrency, getStatusCf, splitFeeEvenlyInt, formatDateVi, formatDates } from '../utils'

const dialogCreate = ref<boolean>(false);
const courtType = ref<"fixed" | "casual">('fixed');
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()
const isValidAccBalance = ref<boolean>(true)
const numberShuttlecock = ref<number>(0)
const startTime = ref<string>("");
const endTime = ref<string>("");
const updateTime = ref<Date>();
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
  return participants.value.reduce((sum, p) => {
    return sum + calculateTotalFee(p);
  }, 0);
});
const isCreateMode = (route.name === 'BadmintonSessionCreate' && (route.params.id as string) !== '')
const isCasualCourt = computed(() => courtType.value === 'casual' || !isCreateMode)
const handleCheckboxChange = () => {
  const courtFeeApplied = participants.value.filter(p => p.isCourtFeeApplied);
  const shuttlecockFeeApplied = participants.value.filter(p => p.isShuttlecockFeeApplied);
  const extraFeeApplied = participants.value.filter(p => p.isExtraFeeApplied);
  let numberValidAccBalance = 0;
  let courtIndex = 0;
  let shuttleIndex = 0;
  let extraIndex = 0;

  const courtFeeList = splitFeeEvenlyInt(courtFee.value, courtFeeApplied.length);
  const shuttlecockFeeList = splitFeeEvenlyInt(shuttlecockFee.value, shuttlecockFeeApplied.length);
  const extraFeeList = splitFeeEvenlyInt(extraFee.value, extraFeeApplied.length);
  const updatedParticipants = participants.value.map((participant) => {
    const courtFeePerPerson = participant.isCourtFeeApplied ? courtFeeList[courtIndex++]
      : 0;

    const shuttlecockFeePer = participant.isShuttlecockFeeApplied ? shuttlecockFeeList[shuttleIndex++]
      : 0;

    const extraFeePer = participant.isExtraFeeApplied ? extraFeeList[extraIndex++]
      : 0;
    // const isChargeAcc = participant.isCourtFeeApplied || participant.isExtraFeeApplied || participant.isShuttlecockFeeApplied || participant.modifiedFee > 0;
    if (courtFeePerPerson + shuttlecockFeePer + extraFeePer + participant.modifiedFee <= participant.balance) {
      numberValidAccBalance += 1
    }
    return {
      ...participant,
      courtFee: courtFeePerPerson,
      shuttlecockFee: shuttlecockFeePer,
      extraFee: extraFeePer,
    };
  });
  if (numberValidAccBalance === participants.value.length) {
    isValidAccBalance.value = true
  } else {
    isValidAccBalance.value = false
  }
  participants.value = updatedParticipants;
};
const calculateTotalFee = (participant: Participant) => {
  return Number(participant.courtFee) + Number(participant.shuttlecockFee) + Number(participant.extraFee) + Number(participant.modifiedFee);
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

        courtType.value = badmintonSession.courtType
        selectedDate.value = new Date(badmintonSession.time)
        // dateTime.value = new Date(badmintonSession.time)
        startTime.value = badmintonSession.startTime
        endTime.value = badmintonSession.endTime
        courtFee.value = badmintonSession.courtFee
        shuttlecockFee.value = badmintonSession.shuttlecockFee
        extraFee.value = badmintonSession.extraFee
        location.value = badmintonSession.location
        note.value = badmintonSession.note ?? ""
        status.value = badmintonSession.status
        updateTime.value = new Date(badmintonSession.updateTime)
        numberShuttlecock.value = badmintonSession.numberShuttlecock
        // participants.value = badmintonSession.participants
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
  const listParticipantsRequest: ParticipantRequest[] = participants.value
    .filter(p => p.isCourtFeeApplied || p.isExtraFeeApplied || p.isShuttlecockFeeApplied || p.modifiedFee !== 0)
    .map(p => ({
      memberId: p.memberId,
      isCourtFeeApplied: p.isCourtFeeApplied,
      isShuttlecockFeeApplied: p.isShuttlecockFeeApplied,
      isExtraFeeApplied: p.isExtraFeeApplied,
      courtFee: p.courtFee,
      shuttlecockFee: p.shuttlecockFee,
      extraFee: p.extraFee,
      modifiedFee: p.modifiedFee
    }));

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
    const createdSession = await appStore.createBadmintonSession(param);
    isLoading.value = false
    dialogCreate.value = false
    if (param.courtType === 'fixed') {
      router.push({ name: "BadmintonSession" })
    }
    if (createdSession && createdSession._id) {
      status.value = createdSession?.status
      updateTime.value = new Date(createdSession.updateTime)
      navigationToDetailPage(createdSession._id)
    }
  } catch (error) {
    isLoading.value = false
    console.log(error)
  }
}

const handleEdit = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }
  const listParticipantsRequest: ParticipantRequest[] = participants.value
    .filter(p => p.isCourtFeeApplied || p.isExtraFeeApplied || p.isShuttlecockFeeApplied || p.modifiedFee !== 0)
    .map(p => ({
      memberId: p.memberId,
      isCourtFeeApplied: p.isCourtFeeApplied,
      isShuttlecockFeeApplied: p.isShuttlecockFeeApplied,
      isExtraFeeApplied: p.isExtraFeeApplied,
      courtFee: p.courtFee,
      shuttlecockFee: p.shuttlecockFee,
      extraFee: p.extraFee,
      modifiedFee: p.modifiedFee
    }));

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
    .map(p => ({
      memberId: p.memberId,
      isCourtFeeApplied: p.isCourtFeeApplied,
      isShuttlecockFeeApplied: p.isShuttlecockFeeApplied,
      isExtraFeeApplied: p.isExtraFeeApplied,
      courtFee: p.courtFee,
      shuttlecockFee: p.shuttlecockFee,
      extraFee: p.extraFee,
      modifiedFee: p.modifiedFee
    }));

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
const fetchTeam = async () => {
  try {
    const res = await appStore.getBadmintonTeamById(GROUP_ID)
    team.value = res
  } catch (error) {
    console.error('Lỗi khi tải thông tin team:', error)
  }
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
        // padding: 8px;
        background-color: #fff;
      }

      td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: none;

        :deep(.v-field__field input) {
          height: 25px;
          min-height: 25px;
        }
      }

      td::before {
        content: attr(data-label);
        font-weight: 600;
        margin-right: 8px;
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
  background: rgba(0, 0, 0, 0.3); // nền mờ
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10; // nhớ cao hơn nội dung bên trong
}
</style>
