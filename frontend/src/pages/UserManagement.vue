<template>
    <v-container>
        <!-- Loading khi đang kiểm tra quyền -->
        <v-row v-if="checkingPermission" class="d-flex justify-center align-center" style="height: 400px;">
            <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
                <p class="mt-4 text-body-1">Đang kiểm tra quyền truy cập...</p>
            </v-col>
        </v-row>

        <!-- Nội dung chính -->
        <div v-else>
            <v-row class="mb-4" :align="'center'" justify="space-between">
                <v-col cols="12" md="6">
                    <h2 class="text-h4 font-weight-bold">Quản lý người dùng</h2>
                    <p class="text-body-2 text-medium-emphasis">Quản lý tài khoản và phân quyền người dùng</p>
                </v-col>
                <v-col cols="12" md="6" class="d-flex justify-end">
                    <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
                        Thêm người dùng
                    </v-btn>
                </v-col>
            </v-row>

            <!-- Bộ lọc -->
            <v-row class="mb-4">
                <v-col cols="12" md="4">
                    <v-select v-model="filters.role" :items="roleOptions" label="Lọc theo vai trò" clearable
                        :hide-details="true" density="default" @update:modelValue="fetchUsers" />
                </v-col>
                <v-col cols="12" md="4">
                    <v-text-field v-model="filters.search" label="Tìm kiếm theo tên hoặc email" clearable
                        :hide-details="true" density="default" prepend-inner-icon="mdi-magnify"
                        @update:modelValue="debouncedSearch" />
                </v-col>
            </v-row>

            <!-- Bảng dữ liệu -->
            <v-card class="elevation-1">
                <v-data-table :headers="headers" :items="filteredUsers" :loading="loading"
                    :items-per-page-options="[10, 25, 50, 100]" density="compact" class="elevation-1" show-current-page>
                    <template #item.role="{ item }">
                        <v-chip :color="getRoleColor(item.role)" :text="getRoleText(item.role)" size="small"
                            variant="outlined" />
                    </template>

                    <template #item.balance="{ item }">
                        <span class="font-weight-medium" :class="item.balance < 0 ? 'text-error' : 'text-success'">
                            {{ formatCurrency(item.balance) }}
                        </span>
                    </template>

                    <template #item.actions="{ item }">
                        <v-btn color="primary" size="small" variant="outlined" class="me-2"
                            @click="openEditDialog(item)">
                            <v-icon size="small" class="me-1">mdi-pencil</v-icon>
                            Sửa
                        </v-btn>
                        <v-btn color="error" size="small" variant="outlined" @click="confirmDelete(item)"
                            :disabled="item.id === appStore.user?.id">
                            <v-icon size="small" class="me-1">mdi-delete</v-icon>
                            Xóa
                        </v-btn>
                    </template>
                </v-data-table>
            </v-card>

            <!-- Dialog thêm/sửa user -->
            <v-dialog v-model="dialog" max-width="500px">
                <v-card>
                    <v-card-title>
                        {{ isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới' }}
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="formRef">
                            <v-text-field v-model="form.name" label="Họ tên" required />
                            <v-text-field v-model="form.email" label="Email" type="email" required
                                :disabled="isEditing" />
                            <v-select v-model="form.role" :items="roleOptions" label="Vai trò" required />
                            <v-text-field v-if="isEditing" v-model.number="form.balance" label="Số dư" type="number"
                                suffix="VNĐ" />
                            <v-alert v-if="!isEditing" type="info" variant="tonal" class="mt-3" density="compact">
                                Tài khoản mới sẽ có số dư ban đầu là 0 VNĐ
                            </v-alert>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn color="grey" variant="text" @click="closeDialog">
                            Hủy
                        </v-btn>
                        <v-btn color="primary" @click="saveUser" :loading="saving">
                            {{ isEditing ? 'Cập nhật' : 'Thêm' }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Dialog xác nhận xóa -->
            <v-dialog v-model="deleteDialog" max-width="400px">
                <v-card>
                    <v-card-title class="text-h6">
                        Xác nhận xóa
                    </v-card-title>
                    <v-card-text>
                        Bạn có chắc chắn muốn xóa người dùng <strong>{{ userToDelete?.name }}</strong>?
                        <br>
                        <span class="text-error text-caption">Hành động này không thể hoàn tác!</span>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn color="grey" variant="text" @click="deleteDialog = false">
                            Hủy
                        </v-btn>
                        <v-btn color="error" @click="deleteUser" :loading="deleting">
                            Xóa
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Snackbar thông báo -->
            <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
                {{ snackbar.message }}
                <template v-slot:actions>
                    <v-btn color="white" text @click="snackbar.show = false">
                        Đóng
                    </v-btn>
                </template>
            </v-snackbar>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { useRouter } from 'vue-router'
import type { Member } from '../types'
import { formatCurrency } from '../utils'

const appStore = useAppStore()
const router = useRouter()

// State
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const checkingPermission = ref(true)
const dialog = ref(false)
const deleteDialog = ref(false)
const formValid = ref(false)
const formRef = ref()
const isEditing = ref(false)
const userToDelete = ref<Member | null>(null)
const userToEdit = ref<Member | null>(null)
const users = ref<Member[]>([])

// Form
const form = reactive({
    name: '',
    email: '',
    role: 'user' as 'user' | 'lead' | 'admin',
    balance: 0
})

// Filters
const filters = reactive({
    role: '',
    search: ''
})

// Snackbar
const snackbar = reactive({
    show: false,
    message: '',
    color: 'success'
})

// Options
const roleOptions = [
    { title: 'Người dùng', value: 'user' },
    { title: 'Trưởng nhóm', value: 'lead' },
    { title: 'Quản trị viên', value: 'admin' }
]

// Table headers
const headers = [
    { title: 'Họ tên', key: 'name', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Vai trò', key: 'role', sortable: true },
    { title: 'Số dư', key: 'balance', sortable: true },
    { title: 'Thao tác', key: 'actions', sortable: false }
]

// Validation rules
const rules = {
    required: (v: string) => !!v || 'Trường này là bắt buộc',
    email: (v: string) => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
    balance: (v: any) => v === '' || !isNaN(Number(v)) || 'Số dư phải là số'
}

// Computed
const filteredUsers = computed(() => {
    let result = users.value

    if (filters.role) {
        result = result.filter(user => user.role === filters.role)
    }

    if (filters.search) {
        const search = filters.search.toLowerCase()
        result = result.filter(user =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        )
    }

    return result
})

// Methods
const getRoleColor = (role: string) => {
    switch (role) {
        case 'admin': return 'error'
        case 'lead': return 'warning'
        case 'user': return 'success'
        default: return 'grey'
    }
}

const getRoleText = (role: string) => {
    switch (role) {
        case 'admin': return 'Quản trị viên'
        case 'lead': return 'Trưởng nhóm'
        case 'user': return 'Người dùng'
        default: return role
    }
}

const showSnackbar = (message: string, color: string = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
}

const fetchUsers = async () => {
    try {
        console.log('Fetching users...')
        loading.value = true
        const data = await appStore.fetchAllMembers()
        console.log('Fetched users:', data)
        users.value = data
    } catch (error: any) {
        console.error('Error fetching users:', error)
        showSnackbar(error.response?.data?.message || 'Lỗi khi tải danh sách người dùng', 'error')
    } finally {
        loading.value = false
    }
}

const openCreateDialog = () => {
    console.log('Opening create dialog')
    isEditing.value = false
    resetForm()
    dialog.value = true
}

const openEditDialog = (user: Member) => {
    console.log('Opening edit dialog for user:', user)
    isEditing.value = true
    userToEdit.value = user
    form.name = user.name
    form.email = user.email
    form.role = user.role
    form.balance = user.balance
    dialog.value = true
}

const closeDialog = () => {
    dialog.value = false
    resetForm()
    userToEdit.value = null
}

const resetForm = () => {
    form.name = ''
    form.email = ''
    form.role = 'user'
    form.balance = 0
}

const saveUser = async () => {
    try {
        console.log('Form data:', form)

        // Validation thủ công
        if (!form.name.trim()) {
            showSnackbar('Vui lòng nhập họ tên', 'error')
            return
        }

        if (!form.email.trim()) {
            showSnackbar('Vui lòng nhập email', 'error')
            return
        }

        if (!/.+@.+\..+/.test(form.email)) {
            showSnackbar('Email không hợp lệ', 'error')
            return
        }

        saving.value = true

        if (isEditing.value) {
            console.log('Updating user:', userToEdit.value?.id, form)
            await appStore.updateUser(userToEdit.value!.id, {
                name: form.name,
                email: form.email,
                role: form.role,
                balance: Number(form.balance) || 0
            })
            showSnackbar('Cập nhật người dùng thành công')
        } else {
            console.log('Creating user:', form)
            await appStore.createUser({
                name: form.name,
                email: form.email,
                role: form.role,
                balance: 0 // Luôn set balance = 0 cho tài khoản mới
            })
            showSnackbar('Thêm người dùng thành công')
        }

        closeDialog()
        fetchUsers()
    } catch (error: any) {
        console.error('Error saving user:', error)
        showSnackbar(error.response?.data?.message || 'Lỗi khi lưu người dùng', 'error')
    } finally {
        saving.value = false
    }
}

const confirmDelete = (user: Member) => {
    userToDelete.value = user
    deleteDialog.value = true
}

const deleteUser = async () => {
    if (!userToDelete.value) return

    try {
        deleting.value = true
        await appStore.deleteUser(userToDelete.value.id)
        showSnackbar('Xóa người dùng thành công')
        deleteDialog.value = false
        fetchUsers()
    } catch (error: any) {
        showSnackbar(error.response?.data?.message || 'Lỗi khi xóa người dùng', 'error')
    } finally {
        deleting.value = false
    }
}

// Debounced search
let searchTimeout: number
const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        fetchUsers()
    }, 300)
}

// Lifecycle
onMounted(async () => {
    try {
        // Đảm bảo user profile đã được load
        if (!appStore.user) {
            await appStore.getUserProfile()
        }

        // Kiểm tra quyền admin sau khi đã load user
        if (!appStore.isAdminPermission) {
            router.push('/home')
            return
        }

        await fetchUsers()
    } catch (error) {
        router.push('/login')
    } finally {
        checkingPermission.value = false
    }
})
</script>

<style scoped>
.v-data-table {
    border-radius: 8px;
}
</style>