// /**
//  * router/index.ts
//  *
//  * Automatic routes for `./src/pages/*.vue`
//  */

// // Composables
// import { createRouter, createWebHistory } from 'vue-router/auto'
// import { setupLayouts } from 'virtual:generated-layouts'
// import { routes } from 'vue-router/auto-routes'

// // const homeRoute = {
// //   path: '/home',
// //   name: 'Home',
// //   component: () => import('@/pages/Home.vue'), // Giả sử bạn có file Home.vue trong src/pages
// // }

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: setupLayouts(routes)
// })

// // Workaround for https://github.com/vitejs/vite/issues/11804
// router.onError((err, to) => {
//   if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
//     if (!localStorage.getItem('vuetify:dynamic-reload')) {
//       console.log('Reloading page to fix dynamic import error')
//       localStorage.setItem('vuetify:dynamic-reload', 'true')
//       location.assign(to.fullPath)
//     } else {
//       console.error('Dynamic import error, reloading page did not fix it', err)
//     }
//   } else {
//     console.error(err)
//   }
// })

// router.isReady().then(() => {
//   localStorage.removeItem('vuetify:dynamic-reload')
// })

// export default router

// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import BadmintonSessionDetail from '../pages/BadmintonSessionDetail.vue'
import BadmintonSession from '../pages/BadmintonSession.vue'
import HomePage from '../pages/HomePage.vue'
import AppLayout from '../layouts/AppLayout.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import TransactionHistory from '../pages/TransactionHistory.vue'
import PaymentList from '../pages/PaymentList.vue'
import LogoutPage from '../pages/LogoutPage.vue'
import UserManagement from '../pages/UserManagement.vue'

const routes = [
  {
    path: "/",
    component: AppLayout,
    children: [
      {
        path: '/home',
        name: 'HomePage',
        component: HomePage
      },
      {
        path: '/badminton-session',
        name: 'BadmintonSession',
        component: BadmintonSession
      },
      {
        path: '/badminton-session/create',
        name: 'BadmintonSessionCreate',
        component: BadmintonSessionDetail
      },
      {
        path: 'badminton-session/:id',
        name: 'BadmintonSessionDetail',
        component: BadmintonSessionDetail
      },
      {
        path: '/transaction-history',
        name: 'TransactionHistory',
        component: TransactionHistory
      },
      {
        path: '/payments',
        name: 'PaymentList',
        component: PaymentList
      },
      {
        path: '/user-management',
        name: 'UserManagement',
        component: UserManagement
      },
      {
        path: '/logout',
        name: 'Logout',
        component: LogoutPage
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard để kiểm tra quyền admin
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')

  // Nếu truy cập trang user-management mà không phải admin thì chuyển về home
  if (to.name === 'UserManagement') {
    if (!token) {
      next('/login')
      return
    }

    // Kiểm tra role từ token (có thể decode JWT để lấy role)
    // Tạm thời cho phép truy cập, sẽ kiểm tra trong component
    next()
    return
  }

  next()
})

export default router
