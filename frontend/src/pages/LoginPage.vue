<template>
  <v-container class="d-flex justify-center align-center" style="height: 100vh">
    <v-card width="400">
      <v-card-title>Đăng nhập</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin" ref="formRef" v-model="isFormValid">
          <v-text-field v-model="email" label="Email" type="email" :rules="emailRules" required />
          <v-text-field v-model="password" label="Mật khẩu" type="password" :rules="passwordRules" required />
          <v-btn type="submit" color="primary" block :disabled="!isFormValid">Đăng nhập</v-btn>
        </v-form>
        <div class="d-flex mt-4 justify-center">
          <router-link to="/register">Đăng ký</router-link>
        </div>

      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../plugins/axios'; // Axios instance
const email = ref('');
const password = ref('');
const isFormValid = ref(false);
const formRef = ref();

const router = useRouter();

const emailRules = [
  (v: string) => !!v || 'Email không được để trống',
  (v: string) => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
];

const passwordRules = [
  (v: string) => !!v || 'Mật khẩu không được để trống',
  (v: string) => v.length >= 6 || 'Mật khẩu phải ít nhất 6 ký tự'
];

const handleLogin = async () => {
  const isValid = await formRef.value.validate();
  if (!isValid) return;

  try {
    const res = await api.post(
      '/auth/login',
      {
        email: email.value,
        password: password.value
      },
    );

    const data = res.data;
    localStorage.setItem('accessToken', data.accessToken);
    router.push('/home');
  } catch (err: any) {
    alert(err.response?.data?.message || err.message || 'Đăng nhập thất bại');
  }
};
</script>
