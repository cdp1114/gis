<script setup lang="ts">
import MapContainer from '@/components/map/MapContainer.vue';
import LayerPanel from '@/components/map/LayerPanel.vue';
import { ref } from 'vue';

const mapRef = ref<InstanceType<typeof MapContainer> | null>(null);

defineExpose({ mapRef });
</script>

<template>
  <div class="h-full w-full relative">
    <MapContainer ref="mapRef" />
  </div>
</template>
