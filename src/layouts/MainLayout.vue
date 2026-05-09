<script setup lang="ts">
import { ref } from 'vue';
import MapContainer from '@/components/map/MapContainer.vue';
import LayerPanel from '@/components/map/LayerPanel.vue';
import {
  MapPin, Layers, Menu, X, Settings, User, LogOut, ChevronLeft, ChevronRight
} from 'lucide-vue-next';

const showLayerPanel = ref(true);
const collapsed = ref(false);
const mapRef = ref<InstanceType<typeof MapContainer> | null>(null);

const toggleLayerPanel = () => {
  showLayerPanel.value = !showLayerPanel.value;
};

const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
};

defineExpose({ mapRef });
</script>

<template>
  <div class="h-screen w-screen flex overflow-hidden bg-slate-950">
    <aside
      :class="[
        'h-full bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      ]"
    >
      <div class="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div v-if="!collapsed" class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <MapPin :size="18" class="text-white" />
          </div>
          <span class="text-white font-bold text-lg">GIS系统</span>
        </div>
        <button
          @click="toggleSidebar"
          class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <component :is="collapsed ? ChevronRight : ChevronLeft" :size="18" />
        </button>
      </div>

      <nav class="flex-1 py-4 px-2 space-y-1">
        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30"
        >
          <MapPin :size="18" />
          <span v-if="!collapsed" class="text-sm font-medium">地图浏览</span>
        </a>
        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Layers :size="18" />
          <span v-if="!collapsed" class="text-sm">空间查询</span>
        </a>
        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <MapPin :size="18" />
          <span v-if="!collapsed" class="text-sm">空间分析</span>
        </a>
        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Layers :size="18" />
          <span v-if="!collapsed" class="text-sm">数据管理</span>
        </a>
        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <MapPin :size="18" />
          <span v-if="!collapsed" class="text-sm">统计分析</span>
        </a>
      </nav>

      <div class="border-t border-slate-800 p-2">
        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Settings :size="18" />
          <span v-if="!collapsed" class="text-sm">系统设置</span>
        </a>
        <div class="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
          <User :size="18" />
          <span v-if="!collapsed" class="text-sm">admin</span>
        </div>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <header class="h-14 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-4">
        <div class="flex items-center gap-4">
          <button
            @click="toggleLayerPanel"
            :class="[
              'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
              showLayerPanel
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            ]"
          >
            <Layers :size="16" />
            <span class="text-sm">图层</span>
          </button>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-400">北京</span>
          <div class="w-px h-6 bg-slate-700"></div>
          <span class="text-sm text-slate-400">2026-05-09</span>
        </div>
      </header>

      <div class="flex-1 flex overflow-hidden">
        <div class="flex-1 relative">
          <MapContainer ref="mapRef" />
        </div>

        <Transition name="slide">
          <div
            v-if="showLayerPanel"
            class="w-80 h-full p-4 overflow-hidden"
          >
            <LayerPanel />
          </div>
        </Transition>
      </div>

      <footer class="h-8 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between px-4 text-xs text-slate-500">
        <span>EPSG:4326 | 比例尺 1:50000</span>
        <span>2026 GIS地理信息系统</span>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
