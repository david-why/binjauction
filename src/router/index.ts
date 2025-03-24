import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/works/:id',
      name: 'bid',
      component: () => import('../views/BidView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
    },
    {
      path: '/admin/qr',
      name: 'admin-qr',
      component: () => import('../views/AdminQrView.vue'),
    }
  ],
})

export default router
