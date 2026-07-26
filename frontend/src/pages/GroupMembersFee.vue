<template>
    <v-container class="d-flex justify-center mt-10">
        <v-card width="500" class="pa-6">
            <!-- Header -->
            <div class="d-flex align-center mb-4">
                <v-avatar color="primary" variant="tonal" size="48" class="me-3">
                    <v-icon>mdi-account-group</v-icon>
                </v-avatar>
                <div>
                    <v-card-title class="pa-0 text-h6">Tổng phí thành viên</v-card-title>
                    <v-card-subtitle class="pa-0 text-caption">
                        <v-icon size="x-small" class="me-1">mdi-shield-account</v-icon>
                        {{ groupName }}
                    </v-card-subtitle>
                </div>
            </div>

            <v-divider class="mb-4" />

            <!-- Toggle status -->
            <v-btn-toggle v-model="status" mandatory color="primary" variant="outlined" density="compact"
                class="mb-4 w-100" @update:model-value="fetchMembersFee">
                <v-btn value="confirmed" class="flex-1-1">
                    <v-icon start size="small">mdi-clock-outline</v-icon>
                    Chưa thanh toán
                </v-btn>
                <v-btn value="done" class="flex-1-1">
                    <v-icon start size="small">mdi-check-circle-outline</v-icon>
                    Đã thanh toán
                </v-btn>
            </v-btn-toggle>

            <v-alert v-if="errorMessage" type="error" class="mb-4">
                {{ errorMessage }}
            </v-alert>

            <div v-if="loading" class="d-flex justify-center my-6">
                <v-progress-circular indeterminate color="primary" />
            </div>

            <div v-else>
                <!-- Tổng group -->
                <v-card :color="status === 'confirmed' ? 'warning' : 'primary'" variant="tonal" class="mb-4 pa-4">
                    <div class="text-subtitle-2 text-grey">
                        {{ status === 'confirmed' ? 'Tổng chưa thanh toán' : 'Tổng đã thanh toán' }}
                    </div>
                    <div class="text-h5 font-weight-bold">{{ formatMoney(groupTotal) }}</div>
                    <div class="text-caption text-grey">{{ membersFee.length }} thành viên</div>
                </v-card>

                <!-- Danh sách thành viên -->
                <v-list lines="two" density="compact">
                    <template v-for="(member, index) in membersFee" :key="member.memberId">
                        <v-list-item class="px-0 py-2">
                            <template #prepend>
                                <v-avatar color="primary" variant="tonal" size="40">
                                    <span class="text-body-2 font-weight-bold">
                                        {{ member.name.charAt(0).toUpperCase() }}
                                    </span>
                                </v-avatar>
                            </template>

                            <v-list-item-title class="font-weight-medium d-flex align-center gap-2">
                                {{ member.name }}
                                <v-chip v-if="member.memberId === memberId" size="x-small" color="primary"
                                    variant="tonal" class="ml-1">
                                    Bạn
                                </v-chip>
                                <v-chip v-if="status != 'done'" :color="member.balance >= 0 ? 'success' : 'error'"
                                    size="x-small" variant="tonal">
                                    {{ formatMoney(member.balance) }}
                                </v-chip>
                            </v-list-item-title>

                            <v-list-item-subtitle class="mt-1">
                                <div class="d-flex align-center gap-3">
                                    <!-- Số buổi -->
                                    <span>
                                        <v-icon size="x-small" class="me-1">mdi-badminton</v-icon>
                                        {{ member.sessionCount }} buổi
                                    </span>
                                </div>
                            </v-list-item-subtitle>
                            <template #append>
                                <div class="d-flex align-center gap-2">
                                    <div class="text-right">
                                        <!-- Tổng phí -->
                                        <div class="text-body-1 font-weight-bold"
                                            :class="status === 'confirmed' ? 'text-warning' : 'text-primary'">
                                            {{ formatMoney(member.grandTotal) }}
                                        </div>
                                        <!-- Còn thiếu / đã đủ -->

                                        <div v-if="status != 'done'" class="text-caption">
                                            <span
                                                :class="member.balance >= member.grandTotal ? 'text-success' : 'text-error'">
                                                {{
                                                    member.balance >= member.grandTotal
                                                        ? 'Đủ tiền'
                                                        : `Thiếu ${formatMoney(member.grandTotal - member.balance)}`
                                                }}
                                            </span>
                                        </div>
                                    </div>
                                    <v-btn icon variant="text" color="primary" size="small"
                                        @click="navigateToShare(member)">
                                        <v-icon size="small">mdi-share-variant</v-icon>
                                        <v-tooltip activator="parent" location="top">Xem chi tiết</v-tooltip>
                                    </v-btn>
                                </div>
                            </template>
                        </v-list-item>

                        <v-divider v-if="index < membersFee.length - 1" inset />
                    </template>
                </v-list>

                <!-- Empty state -->
                <div v-if="membersFee.length === 0" class="text-center py-8 text-grey">
                    <v-icon size="48" class="mb-2">mdi-account-off</v-icon>
                    <div>Không có dữ liệu</div>
                </div>
            </div>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../plugins/axios';

const router = useRouter();

const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('groupId') ?? '';
const memberId = urlParams.get('memberId') ?? '';
const groupName = urlParams.get('groupName') ?? '';

// Mặc định confirmed
const status = ref(urlParams.get('status') ?? 'confirmed');

const loading = ref(false);
const errorMessage = ref('');
const groupTotal = ref(0);
const membersFee = ref<{
    memberId: string;
    name: string;
    grandTotal: number;
    sessionCount: number;
}[]>([]);

const fetchMembersFee = async () => {
    if (!groupId) {
        errorMessage.value = 'Thiếu thông tin groupId';
        return;
    }
    try {
        loading.value = true;
        errorMessage.value = '';

        const res = await api.get('/groups/members-fee', {
            params: { groupId, status: status.value }
        });

        const data = res.data.data;
        membersFee.value = data.members;
        groupTotal.value = data.groupTotal;
    } catch (err: any) {
        errorMessage.value = err.response?.data?.message || 'Đã xảy ra lỗi';
    } finally {
        loading.value = false;
    }
};

const navigateToShare = (member: { memberId: string; name: string }) => {
    router.push({
        path: '/share',
        query: {
            groupId,
            memberId: member.memberId,
            memberName: member.name,
            groupName,
            status: status.value
        }
    });
};

const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

onMounted(fetchMembersFee);
</script>