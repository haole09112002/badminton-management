export interface ApiResponse<T> {
  status: string
  error: string | null
  data: T
}
export interface Member {
  id: string
  name: string
  balance: number
  email: string
  role: 'user' | 'lead' | 'admin'
}
