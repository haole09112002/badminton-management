<template>
  <v-container class="login-container d-flex justify-center align-center">
    <v-card class="login-card" elevation="10">
      <v-card-title class="text-center text-blue font-weight-bold text-h5 mb-2">
        <v-icon color="primary" size="32" class="mr-2">mdi-badminton</v-icon>
        Đăng nhập hệ thống
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin" ref="formRef" v-model="isFormValid">
          <v-text-field v-model="email" label="Email" type="email" :rules="emailRules" required variant="outlined"
            color="primary" prepend-inner-icon="mdi-email" class="mb-3" />
          <v-text-field v-model="password" label="Mật khẩu" type="password" :rules="passwordRules" required
            variant="outlined" color="primary" prepend-inner-icon="mdi-lock" class="mb-2" />
          <v-btn type="submit" color="primary" block size="large" class="btn-login" :disabled="!isFormValid"
            elevation="2">
            Đăng nhập
          </v-btn>
        </v-form>
        <!-- <div class="d-flex mt-4 justify-center">
          <router-link to="/register">Đăng ký</router-link>
        </div> -->
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
    localStorage.setItem('refreshToken', data.refreshToken);
    router.push('/home');
  } catch (err: any) {
    alert(err.response?.data?.message || err.message || 'Đăng nhập thất bại');
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  min-width: 100vw;
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 0;
  background: linear-gradient(120deg, #e3f2fd 60%, #fff 100%);
  padding: 0 !important;
  margin: 0 !important;
  overflow: auto;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 400px;
  border-radius: 22px;
  box-shadow: 0 6px 32px 0 rgba(25, 118, 210, 0.13);
  padding: 28px 24px 22px 24px;
  background: #fff;
}

.text-blue {
  color: #1976d2 !important;
}

.btn-login {
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

.btn-login:hover {
  background: linear-gradient(90deg, #1976d2 80%, #42a5f5 100%) !important;
  color: #fff !important;
  box-shadow: 0 8px 24px 0 rgba(25, 118, 210, 0.18);
}

@media (max-width: 600px) {
  .login-card {
    width: 98vw;
    min-width: 0;
    padding: 18px 4px 14px 4px;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
