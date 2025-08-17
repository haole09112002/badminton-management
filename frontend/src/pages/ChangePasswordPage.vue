<template>
    <div class="change-password-container d-flex justify-center align-center scroll-container">
        <v-card class="change-password-card" elevation="8">
            <v-card-title class="text-center text-blue font-weight-bold text-h5 mb-2">
                <v-icon color="primary" size="28" class="mr-2">mdi-lock-reset</v-icon>
                Đổi mật khẩu
            </v-card-title>
            <v-card-text>
                <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleChangePassword">
                    <v-text-field v-model="oldPassword" label="Mật khẩu cũ" type="password" :rules="passwordRules"
                        required variant="outlined" color="primary" prepend-inner-icon="mdi-lock" class="mb-3" />
                    <v-text-field v-model="newPassword" label="Mật khẩu mới" type="password" :rules="newPasswordRules"
                        required variant="outlined" color="primary" prepend-inner-icon="mdi-lock" class="mb-3" />
                    <v-text-field v-model="confirmPassword" label="Xác nhận mật khẩu mới" type="password"
                        :rules="confirmPasswordRules" required variant="outlined" color="primary"
                        prepend-inner-icon="mdi-lock-check" class="mb-2" />
                    <v-btn type="submit" color="primary" block size="large" class="btn-change" :loading="loading"
                        :disabled="!isFormValid" elevation="2">
                        Đổi mật khẩu
                    </v-btn>
                </v-form>
                <v-alert v-if="message" :type="messageType" class="mt-4" border="start" density="compact"
                    variant="tonal">
                    {{ message }}
                </v-alert>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // ✅ thêm dòng này
import { useAppStore } from '../stores/app'; // Pinia store

const appStore = useAppStore();
const router = useRouter();

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isFormValid = ref(false);
const formRef = ref();
const loading = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

// ✅ rule cơ bản
const passwordRules = [
    (v: string) => !!v || 'Không được để trống',
    (v: string) => v.length >= 6 || 'Mật khẩu phải ít nhất 6 ký tự'
];

// ✅ rule cho mật khẩu mới (so với mật khẩu cũ)
const newPasswordRules = [
    (v: string) => !!v || 'Không được để trống',
    (v: string) => v.length >= 6 || 'Mật khẩu phải ít nhất 6 ký tự',
    () => newPassword.value !== oldPassword.value || 'Mật khẩu mới không được trùng với mật khẩu cũ'
];

// ✅ rule cho xác nhận mật khẩu
const confirmPasswordRules = [
    (v: string) => !!v || 'Không được để trống',
    () => confirmPassword.value === newPassword.value || 'Mật khẩu xác nhận không khớp'
];

const handleChangePassword = async () => {
    // ✅ Vuetify 3: validate() trả về { valid: boolean }
    const { valid } = await formRef.value?.validate();
    if (!valid) return;

    loading.value = true;
    message.value = '';

    try {
        console.log('Đang đổi mật khẩu...');
        await appStore.changePassword(oldPassword.value, newPassword.value);

        message.value = 'Đổi mật khẩu thành công!';
        messageType.value = 'success';

        oldPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        router.push('/home');
    } catch (err: any) {
        console.error('Lỗi đổi mật khẩu:', err);
        message.value = err.response?.data?.message || 'Đổi mật khẩu thất bại';
        messageType.value = 'error';
    } finally {
        loading.value = false;
    }
};
</script>


<style lang="scss" scoped>
.scroll-container {
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
}

.change-password-container {
    background: linear-gradient(120deg, #e3f2fd 60%, #fff 100%);
    padding: 0;
}

.change-password-card {
    width: 400px;
    border-radius: 22px;
    box-shadow: 0 6px 32px 0 rgba(25, 118, 210, 0.13);
    padding: 28px 24px 22px 24px;
    background: #fff;
}

.text-blue {
    color: #1976d2 !important;
}

.btn-change {
    border-radius: 24px;
    font-weight: 700;
    font-size: 1.08rem;
    letter-spacing: 0.5px;
    margin-top: 12px;
    min-height: 48px;
    box-shadow: 0 2px 8px 0 rgba(25, 118, 210, 0.10);
    text-transform: none;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.btn-change:hover {
    background: linear-gradient(90deg, #1976d2 80%, #42a5f5 100%) !important;
    color: #fff !important;
    box-shadow: 0 8px 24px 0 rgba(25, 118, 210, 0.18);
}

@media (max-width: 600px) {
    .change-password-card {
        width: 98vw;
        min-width: 0;
        padding: 18px 4px 14px 4px;
        border-radius: 0;
        box-shadow: none;
    }
}
</style>