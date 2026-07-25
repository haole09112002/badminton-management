<template>
    <v-container class="d-flex justify-center mt-10">
        <v-card width="500" class="pa-6">
            <!-- Header -->
            <div class="d-flex align-center mb-4">
                <v-avatar color="primary" variant="tonal" size="48" class="me-3">
                    <v-icon>mdi-account-group</v-icon>
                </v-avatar>
                <div>
                    <v-card-title class="pa-0 text-h6">{{ memberName || 'Lịch sử phí' }}</v-card-title>
                    <v-card-subtitle class="pa-0 text-caption">
                        <v-icon size="x-small" class="me-1">mdi-shield-account</v-icon>
                        {{ groupName }}
                    </v-card-subtitle>
                </div>
            </div>

            <v-divider class="mb-4" />

            <!-- Toggle status -->
            <v-btn-toggle v-model="status" mandatory color="primary" variant="outlined" density="compact"
                class="mb-4 w-100" @update:model-value="onStatusChange">
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
                <!-- Tổng tiền -->
                <v-card :color="status === 'confirmed' ? 'warning' : 'primary'" variant="tonal" class="mb-4 pa-4">
                    <div class="text-subtitle-2 text-grey">
                        {{ status === 'confirmed' ? 'Tổng chưa thanh toán' : 'Tổng đã thanh toán' }}
                    </div>
                    <div class="text-h5 font-weight-bold">{{ formatMoney(summary.grandTotal) }}</div>
                    <div class="text-caption text-grey">{{ summary.totalCount }} buổi</div>
                </v-card>

                <!-- Danh sách buổi -->
                <v-list lines="two">
                    <template v-for="(session, index) in sessions" :key="session.sessionId">
                        <v-list-item :href="`/sessions/${session.sessionId}`" target="_blank" active-color="primary">
                            <template #prepend>
                                <v-avatar :color="status === 'confirmed' ? 'warning' : 'primary'" variant="tonal"
                                    size="40">
                                    <v-icon>mdi-badminton</v-icon>
                                </v-avatar>
                            </template>

                            <v-list-item-title class="font-weight-medium">
                                {{ session.location }}
                            </v-list-item-title>

                            <v-list-item-subtitle>
                                {{ formatDate(session.date) }}
                            </v-list-item-subtitle>

                            <!-- Guest list -->
                            <div v-if="session.guests?.length" class="mt-1">
                                <v-chip v-for="guest in session.guests" :key="guest.name" size="x-small"
                                    color="secondary" variant="tonal" class="mr-1">
                                    {{ guest.name }}: {{ formatMoney(guest.total) }}
                                </v-chip>
                            </div>

                            <template #append>
                                <div class="text-right d-flex align-center gap-2">
                                    <div>
                                        <div class="text-body-1 font-weight-bold"
                                            :class="status === 'confirmed' ? 'text-warning' : 'text-primary'">
                                            {{ formatMoney(session.total) }}
                                        </div>
                                        <div v-if="session.guests?.length" class="text-caption text-grey">
                                            Bạn: {{ formatMoney(session.memberTotal) }}
                                        </div>
                                    </div>
                                    <v-icon size="small" color="grey">mdi-chevron-right</v-icon>
                                </div>
                            </template>
                        </v-list-item>

                        <v-divider v-if="index < sessions.length - 1" />
                    </template>
                </v-list>

                <!-- Empty state -->
                <div v-if="sessions.length === 0" class="text-center py-8 text-grey">
                    <v-icon size="48" class="mb-2">mdi-calendar-blank</v-icon>
                    <div>Không có buổi đánh nào</div>
                </div>

                <!-- Phân trang -->
                <v-pagination v-if="totalPages > 1" v-model="page" :length="totalPages" class="mt-4"
                    @update:model-value="fetchData" />
            </div>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../plugins/axios';

const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('groupId') ?? '';
const memberId = urlParams.get('memberId') ?? '';
const memberName = urlParams.get('memberName') ?? '';
const groupName = urlParams.get('groupName') ?? '';

const status = ref(urlParams.get('status') ?? 'confirmed');
const loading = ref(false);
const errorMessage = ref('');
const page = ref(1);
const totalPages = ref(1);

const summary = ref({ grandTotal: 0, totalCount: 0 });
const sessions = ref<{
    sessionId: string;
    date: string;
    location: string;
    memberTotal: number;
    guests: { name: string; total: number }[];
    total: number;
}[]>([]);

const fetchData = async () => {
    if (!groupId || !memberId) {
        errorMessage.value = 'Thiếu thông tin groupId hoặc memberId';
        return;
    }
    try {
        loading.value = true;
        errorMessage.value = '';

        const res = await api.get('/share', {
            params: {
                groupId,
                memberId,
                status: status.value,
                page: page.value,
                limit: 10
            }
        });

        const data = res.data.data;
        sessions.value = data.sessions;
        totalPages.value = data.totalPages;
        summary.value = {
            grandTotal: data.grandTotal,
            totalCount: data.totalCount,
        };
    } catch (err: any) {
        errorMessage.value = err.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu';
    } finally {
        loading.value = false;
    }
};

const onStatusChange = () => {
    page.value = 1;
    fetchData();
};

const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(date));

onMounted(fetchData);
</script>