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
import { BadmintonSession, BadmintonSessionWaringResponse, BadmintonTeamResponse, MemberBalance, PaginationResult } from '../types/responses'

export const useAppStore = defineStore('app', () => {
  // STATE
  const isLoading = ref(false)
  const user = ref<Member | null>(null)

  // GETTERS
  const isLeadOrAdminPermission = computed(() => {
    return user.value?.role === 'lead' || user.value?.role === 'admin'
  })

  // ACTIONS
  async function fetchAllMembers(): Promise<Member[] | null> {
    const response = await api.get<ApiResponse<Member[]>>('/members')
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
    return response.data.data
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

    // actions
    fetchAllMembers,
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
