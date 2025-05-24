<template>
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

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title><strong>Phí đã mua cầu:</strong> {{ formatCurrency(team.shuttlecockFee)
            }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title><strong>Phí sân cố định:</strong> {{ formatCurrency(team.fixedCourtFee)
            }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- <v-list-item>
          <v-list-item-content>
            <v-list-item-title><strong>Số tiền còn lại(ước tính):</strong> {{
              formatCurrency(team.amount - team.shuttlecockFee - team.fixedCourtFee) }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item> -->

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

    <v-card-actions>
      <!-- <v-spacer></v-spacer> -->
      <!-- <v-btn color="primary" text @click="$emit('close')">Đóng</v-btn> -->
    </v-card-actions>
  </v-card>

  <v-progress-circular indeterminate v-else class="mx-auto" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import axios from 'axios'
import { useAppStore } from '../stores/app'
import { BadmintonTeamResponse } from '../types/responses';
const appStore = useAppStore()



// Nhận id team qua props
const props = defineProps<{ id: string }>()
const emit = defineEmits(['close'])

const team = ref<BadmintonTeamResponse | null>(null)

const fetchTeam = async () => {
  try {
    const res = await appStore.getBadmintonTeamById(props.id)
    team.value = res
  } catch (error) {
    console.error('Lỗi khi tải thông tin team:', error)
  }
}

onMounted(() => {
  fetchTeam()
})

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
</script>
