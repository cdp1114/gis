<script setup lang="ts">
import { ref, computed } from 'vue';
import MapContainer from '@/components/map/MapContainer.vue';
import SpatialQuery from '@/components/map/SpatialQuery.vue';
import { Search } from 'lucide-vue-next';

const searchKeyword = ref('');
const activeTab = ref<'query' | 'result'>('query');

const emit = defineEmits(['search']);

const handleSearch = () => {
  emit('search', searchKeyword.value);
};
</script>

<template>
  <div class="h-full flex">
    <div class="flex-1">
      <MapContainer />
    </div>
    <div class="w-96 h-full bg-slate-900/95 border-l border-slate-800">
      <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
        <Search :size="18" class="text-blue-400" />
        <h2 class="text-white font-semibold">空间查询</h2>
      </div>
      <SpatialQuery />
    </div>
  </div>
</template>
