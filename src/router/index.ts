import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import LoginPage from '@/pages/LoginPage.vue';
import MapPage from '@/pages/MapPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/map'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/map',
    name: 'map',
    component: MapPage,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/map');
  } else {
    next();
  }
});

export default router;
