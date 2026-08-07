<template>
    <v-container class="py-8" style="max-width: 500px">
        <v-card>
            <v-card-title class="font-weight-bold">Cài đặt hệ thống</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="onSubmit">
                    <v-text-field v-model.number="form.monthlyFee" label="Số tiền hằng tháng (VNĐ)" type="number"
                        required />
                    <v-text-field v-model.number="form.remindStartDay" label="Ngày bật nhắc nộp tiền" type="number"
                        min="1" max="31" required />
                    <v-text-field v-model.number="form.remindEndDay" label="Ngày tắt nhắc nộp tiền" type="number"
                        min="1" max="31" required />
                    <v-btn type="submit" color="primary" class="mt-4" :loading="loading">
                        {{ form._id ? 'Cập nhật' : 'Tạo mới' }}
                    </v-btn>
                    <v-btn v-if="form._id" color="error" class="mt-4 ml-2" @click="onDelete"
                        :loading="loading">Xóa</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import axios from '../plugins/axios'
import { useAppStore } from '../stores/app'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const router = useRouter()
const loading = ref(false)
const form = ref({
    _id: '',
    monthlyFee: 0,
    remindStartDay: 1,
    remindEndDay: 1,
})

const fetchSetting = async () => {
    loading.value = true
    try {
        const res = await axios.get('/site-setting')
        if (res.data) {
            form.value = { ...res.data, _id: res.data._id }
        }
    } catch (e) {
        // Có thể log lỗi nếu cần
    } finally {
        loading.value = false
    }
}
onMounted(fetchSetting)

const onSubmit = async () => {
    loading.value = true
    try {
        if (form.value._id) {
            await axios.put('/site-setting', form.value)
            appStore.showSnackbar('Cập nhật thành công', 'success')
        } else {
            await axios.post('/site-setting', form.value)
            appStore.showSnackbar('Tạo mới thành công', 'success')
            await fetchSetting()
        }
    } catch (e: any) {
        appStore.showSnackbar(e?.response?.data?.message || 'Lỗi', 'error')
    } finally {
        loading.value = false
    }
}

const onDelete = async () => {
    if (!confirm('Bạn chắc chắn muốn xóa cài đặt này?')) return
    loading.value = true
    try {
        await axios.delete('/site-setting')
        appStore.showSnackbar('Đã xóa', 'success')
        form.value = { _id: '', monthlyFee: 0, remindStartDay: 1, remindEndDay: 1 }
    } catch (e: any) {
        appStore.showSnackbar(e?.response?.data?.message || 'Lỗi', 'error')
    }
    loading.value = false
}
</script>
