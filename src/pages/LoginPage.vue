<script setup lang="ts">
import { ref } from 'vue';
import { MapPin, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-vue-next';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { authApi } from '@/api';

const router = useRouter();
const username = ref('admin');
const password = ref('admin123');
const showPassword = ref(false);
const loading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning('请输入用户名和密码');
    return;
  }

  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    localStorage.setItem('token', 'mock-jwt-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      username: username.value,
      email: 'admin@example.com'
    }));

    ElMessage.success('登录成功');
    router.push('/map');
  } catch (error) {
    ElMessage.error('登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 mb-4">
          <MapPin :size="32" class="text-white" />
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">GIS地理信息系统</h1>
        <p class="text-slate-400">轻量化、高性能、可扩展的空间信息管理平台</p>
      </div>

      <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">用户名</label>
            <div class="relative">
              <User :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="username"
                type="text"
                placeholder="请输入用户名"
                class="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">密码</label>
            <div class="relative">
              <Lock :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <component :is="showPassword ? EyeOff : Eye" :size="18" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0" />
              <span class="text-sm text-slate-400">记住密码</span>
            </label>
            <a href="#" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">忘记密码?</a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Loader2 v-if="loading" :size="20" class="animate-spin" />
            <span>{{ loading ? '登录中...' : '登录' }}</span>
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-slate-700">
          <p class="text-center text-sm text-slate-500">
            演示账号: admin / admin123
          </p>
        </div>
      </div>

      <p class="text-center text-xs text-slate-600 mt-6">
        © 2026 GIS地理信息系统. 保留所有权利.
      </p>
    </div>
  </div>
</template>
