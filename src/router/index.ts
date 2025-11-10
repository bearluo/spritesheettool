import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/pack'
    },
    {
      path: '/pack',
      name: 'pack',
      component: () => import('@/views/PackView.vue')
    },
    {
      path: '/unpack',
      name: 'unpack',
      component: () => import('@/views/UnpackView.vue')
    }
  ]
})

export default router

