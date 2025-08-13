// stores/app.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../plugins/axios'
import type {
  ApiResponse,
  Member,

} from '../types'
import type {
  BadmintonSessionRequest,
  PaymentRequest,
  ShuttlecockFeeRequest
} from '../types/requests'
import { BadmintonSession, BadmintonSessionWaringResponse, BadmintonTeamResponse, MemberBalance, PaginationResult, PaymentResponse } from '../types/responses'
import { formatCurrency, formatDateTimeVN, formatDateVi } from '../utils/index'

// Interface cho create user request
interface CreateUserRequest {
  name: string
  email: string
  role: 'user' | 'lead' | 'admin'
  balance?: number
}

export const useAppStore = defineStore('app', () => {
  // STATE
  const isLoading = ref(false)
  const user = ref<Member | null>(null)

  // GETTERS
  const isLeadOrAdminPermission = computed(() => {
    return user.value?.role === 'lead' || user.value?.role === 'admin'
  })

  const isAdminPermission = computed(() => {
    return user.value?.role === 'admin'
  })

  // ACTIONS
  async function fetchAllMembers(): Promise<Member[]> {
    const response = await api.get<ApiResponse<Member[]>>('/members')
    return response.data.data
  }

  async function createUser(param: CreateUserRequest): Promise<Member> {
    console.log('Creating user with params:', param)
    const response = await api.post<ApiResponse<Member>>('/members', param)
    console.log('Create user response:', response.data)
    return response.data.data
  }

  async function deleteUser(userId: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/members/${userId}`)
  }

  async function restoreUser(userId: string): Promise<Member> {
    const response = await api.patch<ApiResponse<Member>>(`/members/${userId}/restore`)
    return response.data.data
  }

  async function updateUser(userId: string, param: CreateUserRequest): Promise<Member> {
    console.log('Updating user with params:', userId, param)
    const response = await api.put<ApiResponse<Member>>(`/members/${userId}`, param)
    console.log('Update user response:', response.data)
    return response.data.data
  }

  async function createBadmintonSession(param: BadmintonSessionRequest): Promise<BadmintonSession | null> {
    const response = await api.post<ApiResponse<BadmintonSession>>('/badminton-session', param)
    return response.data.data
  }

  async function updateBadmintonSession(sessionId: string, param: BadmintonSessionRequest): Promise<BadmintonSessionWaringResponse> {
    const response = await api.put<ApiResponse<BadmintonSessionWaringResponse>>(`/badminton-session/${sessionId}`, param)
    return response.data.data
  }

  async function confirmBadmintonSession(sessionId: string, param: BadmintonSessionRequest): Promise<BadmintonSessionWaringResponse> {
    const response = await api.put<ApiResponse<BadmintonSessionWaringResponse>>(`/badminton-session/${sessionId}/confirm`, param)
    return response.data.data
  }

  async function payBadmintonSession(sessionId: string): Promise<BadmintonSession | null> {
    const response = await api.put<ApiResponse<BadmintonSession>>(`/badminton-session/${sessionId}/pay`)
    return response.data.data
  }

  async function getAllMemberBalance(): Promise<MemberBalance[]> {
    const response = await api.get<ApiResponse<MemberBalance[]>>('/all-members-balance')
    return response.data.data
  }

  async function getAllBadmintonSession(): Promise<BadmintonSession[]> {
    const response = await api.get<ApiResponse<BadmintonSession[]>>('/badminton-session/list')
    return response.data.data
  }

  async function getBadmintonSession(sessionId: string): Promise<BadmintonSession | null> {
    const response = await api.get<ApiResponse<BadmintonSession | null>>(`/badminton-session/${sessionId}`)
    return response.data.data
  }

  async function getMyPayments(params: {
    page: number
    limit: number
    status?: string
  }): Promise<PaginationResult<PaymentResponse>> {
    const response = await api.get<ApiResponse<PaginationResult<PaymentResponse>>>('/payments/me', { params })
    var data = response.data.data
    data.data.map(item => {
      item.date = formatDateTimeVN(item.date)
      item.amount = formatCurrency(Number(item.amount))
    })

    return data
  }

  async function createPayment(param: PaymentRequest): Promise<PaymentResponse> {
    const response = await api.post<ApiResponse<PaymentResponse>>('/payments', param)
    return response.data.data
  }

  async function acceptPayment(paymentId: string): Promise<PaymentResponse> {
    const response = await api.put<ApiResponse<PaymentResponse>>(`/payments/${paymentId}/accept`)
    return response.data.data
  }

  async function rejectPayment(paymentId: string): Promise<PaymentResponse> {
    const response = await api.put<ApiResponse<PaymentResponse>>(`/payments/${paymentId}/reject`)
    return response.data.data
  }

  async function logout(): Promise<void> {
    await api.post<ApiResponse<any>>(`/auth/logout`)
    localStorage.removeItem('accessToken')
    user.value = null
  }

  async function getBadmintonTeamById(teamId: string): Promise<BadmintonTeamResponse> {
    const response = await api.get<ApiResponse<BadmintonTeamResponse>>(`/badminton-teams/${teamId}`)
    return response.data.data
  }

  async function payForShuttlecockFee(param: ShuttlecockFeeRequest): Promise<PaymentResponse> {
    const response = await api.post<ApiResponse<PaymentResponse>>("/badminton-teams/pay-shuttlecock", param)
    return response.data.data
  }

  async function getUserProfile(): Promise<Member> {
    const response = await api.get<ApiResponse<Member>>("/members/me")
    user.value = response.data.data
    return response.data.data
  }

  return {
    // state
    isLoading,
    user,

    // getters
    isLeadOrAdminPermission,
    isAdminPermission,

    // actions
    fetchAllMembers,
    createUser,
    deleteUser,
    restoreUser,
    updateUser,
    createBadmintonSession,
    updateBadmintonSession,
    confirmBadmintonSession,
    payBadmintonSession,
    getAllMemberBalance,
    getAllBadmintonSession,
    getBadmintonSession,
    getMyPayments,
    createPayment,
    acceptPayment,
    rejectPayment,
    logout,
    getBadmintonTeamById,
    payForShuttlecockFee,
    getUserProfile
  }
}, {
  persist: true
})
