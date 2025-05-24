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
import BadmintonSessionDetail from '@/pages/BadmintonSessionDetail'
import BadmintonSession from '@/pages/BadmintonSession'
import HomePage from '@/pages/HomePage'
import AppLayout from '@/layouts/AppLayout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '../pages/RegisterPage.vue'
import TransactionHistory from '@/pages/TransactionHistory'
import PaymentList from '@/pages/PaymentList'
import LogoutPage from '@/pages/LogoutPage'

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
        component: TransactionHistory // import RegisterPage từ file tương ứng
      },
      {
        path: '/payments',
        name: 'PaymentList',
        component: PaymentList // import RegisterPage từ file tương ứng
      },
      {
        path: '/logout',
        name: 'Logout',
        component: LogoutPage // import LoginPage từ file tương ứng
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage // import LoginPage từ file tương ứng
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage // import RegisterPage từ file tương ứng
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
