<script setup lang="ts">
import MapContainer from '@/components/map/MapContainer.vue';
import SpatialAnalysis from '@/components/map/SpatialAnalysis.vue';
import { Activity } from 'lucide-vue-next';
</script>

<template>
  <div class="h-full flex">
    <div class="flex-1">
      <MapContainer />
    </div>
    <div class="w-96 h-full bg-slate-900/95 border-l border-slate-800">
      <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
        <Activity :size="18" class="text-blue-400" />
        <h2 class="text-white font-semibold">空间分析</h2>
      </div>
      <SpatialAnalysis />
    </div>
  </div>
</template>
