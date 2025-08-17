// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import BadmintonSessionDetail from '../pages/BadmintonSessionDetail.vue'
import BadmintonSession from '../pages/BadmintonSession.vue'
import HomePage from '../pages/HomePage.vue'
import AppLayout from '../layouts/AppLayout.vue'
import LoginPage from '../pages/LoginPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'
import TransactionHistory from '../pages/TransactionHistory.vue'
import PaymentList from '../pages/PaymentList.vue'
import LogoutPage from '../pages/LogoutPage.vue'
import UserManagement from '../pages/UserManagement.vue'
import ChangePasswordPage from '../pages/ChangePasswordPage.vue'
import PolicyPage from '../pages/PolicyPage.vue'
import GalleryCarousel from '../pages/GalleryCarousel.vue' // hoặc '../pages/GalleryCarousel.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: 'home', name: 'HomePage', component: HomePage },
      { path: 'badminton-session', name: 'BadmintonSession', component: BadmintonSession },
      { path: 'badminton-session/create', name: 'BadmintonSessionCreate', component: BadmintonSessionDetail },
      { path: 'badminton-session/:id', name: 'BadmintonSessionDetail', component: BadmintonSessionDetail },
      { path: 'transaction-history', name: 'TransactionHistory', component: TransactionHistory },
      { path: 'payments', name: 'PaymentList', component: PaymentList },
      { path: 'user-management', name: 'UserManagement', component: UserManagement },
      { path: 'change-password', name: 'ChangePassword', component: ChangePasswordPage },
      { path: 'policy', name: 'Policy', component: PolicyPage },
      { path: 'logout', name: 'Logout', component: LogoutPage },
      {
        path: '/gallery',
        name: 'Gallery',
        component: GalleryCarousel,
        meta: { requiresAuth: true }
      },
    ],
  },
  { path: '/login', name: 'Login', component: LoginPage },
  // { path: '/register', name: 'Register', component: RegisterPage },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Route Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  const role = localStorage.getItem('role')

  if (to.name === 'Login') {
    if (token) {
      return next({ name: 'HomePage' })
    }
    return next()
  }

  if (!token) {
    return next({ name: 'Login' })
  }

  // 👮 Check quyền admin cho UserManagement
  if (to.name === 'UserManagement' && role !== 'admin') {
    return next({ name: 'HomePage' }) // hoặc show page 403 Forbidden riêng
  }

  next()
})

export default router
