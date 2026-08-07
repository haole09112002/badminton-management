<template>
  <v-container class="d-flex justify-center mt-10">
    <v-card width="500" class="pa-6">
      <v-card-title>Đăng ký</v-card-title>

      <v-form v-model="isValid" @submit.prevent="onSubmit">
        <v-text-field v-model="form.name" label="Họ tên" :rules="[rules.required]" required />

        <v-text-field v-model="form.email" label="Email" type="email" :rules="[rules.required, rules.email]" required />

        <v-text-field v-model="form.password" label="Mật khẩu" type="password" :rules="[rules.required, rules.min]"
          required />

        <v-text-field v-model="form.confirmPassword" label="Xác nhận mật khẩu" type="password"
          :rules="[rules.required, confirmPasswordRule]" required />

        <v-btn type="submit" :disabled="!isValid" color="primary" block class="mt-4">
          Đăng ký
        </v-btn>
      </v-form>

      <v-alert v-if="errorMessage" type="error" class="mt-4">
        {{ errorMessage }}
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import api from '../plugins/axios'; // Axios instance

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const isValid = ref(false);
const errorMessage = ref('');

const rules = {
  required: (v: string) => !!v || 'Trường bắt buộc',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
  min: (v: string) => v.length >= 6 || 'Tối thiểu 6 ký tự'
};

const confirmPasswordRule = (v: string) =>
  v === form.password || 'Mật khẩu xác nhận không khớp';

const onSubmit = async () => {
  try {
    errorMessage.value = '';

    await api.post('/auth/register', {
      name: form.name,
      email: form.email,
      password: form.password
    });

    alert('Đăng ký thành công');
    window.location.href = '/login';
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Đã xảy ra lỗi';
  }
};
</script>
