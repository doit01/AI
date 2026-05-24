import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/departments' },
    {
      path: '/departments',
      name: 'Department',
      component: () => import('@/views/department/index.vue')
    },
    {
      path: '/users',
      name: 'User',
      component: () => import('@/views/user/index.vue')
    },
    {
      path: '/roles',
      name: 'Role',
      component: () => import('@/views/role/index.vue')
    },
    {
      path: '/menus',
      name: 'Menu',
      component: () => import('@/views/menu/index.vue')
    },
    {
      path: '/manytomany',
      name: 'ManyToMany',
      component: () => import('@/views/manytomany/index.vue')
    },
    {
      path: '/intro',
      name: 'Intro',
      component: () => import('@/views/intro/index.vue')
    }
  ]
})

export default router
