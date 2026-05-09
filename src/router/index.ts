import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import LoginPage from '@/pages/LoginPage.vue';
import MainLayoutPage from '@/pages/MainLayoutPage.vue';
import MapPage from '@/pages/MapPage.vue';
import SpatialQueryPage from '@/pages/map/SpatialQueryPage.vue';
import SpatialAnalysisPage from '@/pages/map/SpatialAnalysisPage.vue';
import DataManagePage from '@/pages/data/DataManagePage.vue';
import StatsPage from '@/pages/stats/StatsPage.vue';
import UserManage from '@/pages/system/UserManage.vue';
import RoleManage from '@/pages/system/RoleManage.vue';

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
    path: '/',
    component: MainLayoutPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'map',
        name: 'map',
        component: MapPage
      },
      {
        path: 'map/query',
        name: 'mapQuery',
        component: SpatialQueryPage
      },
      {
        path: 'map/analysis',
        name: 'mapAnalysis',
        component: SpatialAnalysisPage
      },
      {
        path: 'data/manage',
        name: 'dataManage',
        component: DataManagePage
      },
      {
        path: 'stats',
        name: 'stats',
        component: StatsPage
      },
      {
        path: 'system/user',
        name: 'systemUser',
        component: UserManage
      },
      {
        path: 'system/role',
        name: 'systemRole',
        component: RoleManage
      }
    ]
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
