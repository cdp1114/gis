import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import LoginPage from '@/pages/LoginPage.vue';
import MapPage from '@/pages/MapPage.vue';
import HomePage from '@/pages/HomePage.vue';

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
    path: '/home',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/map',
    name: 'map',
    component: MapPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/map/query',
    name: 'mapQuery',
    component: () => import('@/pages/map/SpatialQueryPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/map/analysis',
    name: 'mapAnalysis',
    component: () => import('@/pages/map/SpatialAnalysisPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/data/manage',
    name: 'dataManage',
    component: () => import('@/pages/data/DataManagePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('@/pages/stats/StatsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/system/user',
    name: 'systemUser',
    component: () => import('@/pages/system/UserManage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/system/role',
    name: 'systemRole',
    component: () => import('@/pages/system/RoleManage.vue'),
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
