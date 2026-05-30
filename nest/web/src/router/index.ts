import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      children: [
        { path: '', name: 'Welcome', component: () => import('../views/Welcome.vue') },
        { path: 'departments', name: 'Departments', component: () => import('../views/Department.vue'), meta: { permission: 'dept:read' } },
        { path: 'users', name: 'Users', component: () => import('../views/User.vue'), meta: { permission: 'user:read' } },
        { path: 'roles', name: 'Roles', component: () => import('../views/Role.vue'), meta: { permission: 'role:read' } },
        { path: 'concurrency', name: 'Concurrency', component: () => import('../views/ConcurrencyDemo.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    return '/login'
  }
  if (to.meta.permission && !auth.hasPermission(to.meta.permission as string)) {
    return '/login'
  }
})

export default router
