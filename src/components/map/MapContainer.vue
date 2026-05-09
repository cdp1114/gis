<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { GisMap } from '@/utils/map';
import { MousePointer, Edit, Ruler, MapPin, Layers, Grid3X3, Trash2, Download, Plus } from 'lucide-vue-next';

const mapContainer = ref<HTMLElement | null>(null);
let gisMap: GisMap | null = null;

const activeTool = ref<'select' | 'draw' | 'measure'>('select');
const drawType = ref<'point' | 'line' | 'polygon' | 'circle' | 'rectangle'>('point');
const showMeasureResult = ref(false);
const measureResult = ref({ value: 0, unit: '' });

onMounted(() => {
  if (mapContainer.value) {
    gisMap = new GisMap({
      target: 'map-container',
      center: [116.3974, 39.9088],
      zoom: 10,
      projection: 'EPSG:4326'
    });

    gisMap.enableSelect((features) => {
      console.log('Selected features:', features);
    });
  }
});

onUnmounted(() => {
  gisMap?.dispose();
});

const setActiveTool = (tool: 'select' | 'draw' | 'measure') => {
  activeTool.value = tool;
  gisMap?.disableInteractions();

  if (tool === 'select') {
    gisMap?.enableSelect();
  } else if (tool === 'draw') {
    enableDraw();
  } else if (tool === 'measure') {
    enableMeasure();
  }
};

const setDrawType = (type: 'point' | 'line' | 'polygon') => {
  drawType.value = type;
  if (activeTool.value === 'draw') {
    enableDraw();
  }
};

const enableDraw = () => {
  if (!gisMap) return;
  const typeMap: Record<string, 'Point' | 'LineString' | 'Polygon'> = {
    point: 'Point',
    line: 'LineString',
    polygon: 'Polygon'
  };
  gisMap.enableDraw(typeMap[drawType.value], (feature) => {
    console.log('Drawn feature:', feature);
  });
};

const enableMeasure = () => {
  if (!gisMap) return;
  gisMap.enableDraw('LineString', (feature) => {
    const geom = feature.getGeometry();
    if (geom) {
      const coordinates = (geom as any).getCoordinates();
      const result = gisMap!.measureDistance(coordinates);
      measureResult.value = { value: result, unit: 'm' };
      showMeasureResult.value = true;
    }
  });
};

const clearMap = () => {
  gisMap?.clearFeatures();
};

const zoomIn = () => {
  gisMap?.setZoom(gisMap.getZoom() + 1);
};

const zoomOut = () => {
  gisMap?.setZoom(gisMap.getZoom() - 1);
};

const resetView = () => {
  gisMap?.setCenter([116.3974, 39.9088]);
  gisMap?.setZoom(10);
};

const exportMap = () => {
  if (gisMap) {
    const geojson = gisMap.exportToGeoJSON();
    const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map-export.geojson';
    a.click();
    URL.revokeObjectURL(url);
  }
};

defineExpose({ gisMap });
</script>

<template>
  <div class="relative h-full w-full">
    <div id="map-container" ref="mapContainer" class="h-full w-full bg-slate-900"></div>

    <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <div class="bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-1.5">
        <button
          @click="setActiveTool('select')"
          :class="[
            'flex items-center gap-2.5 px-3.5 py-2.5 rounded-md transition-all w-full text-sm font-medium',
            activeTool === 'select'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:bg-slate-700'
          ]"
        >
          <MousePointer :size="16" />
          <span>选择</span>
        </button>
        <button
          @click="setActiveTool('draw')"
          :class="[
            'flex items-center gap-2.5 px-3.5 py-2.5 rounded-md transition-all w-full text-sm font-medium',
            activeTool === 'draw'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:bg-slate-700'
          ]"
        >
          <Edit :size="16" />
          <span>绘制</span>
        </button>
        <button
          @click="setActiveTool('measure')"
          :class="[
            'flex items-center gap-2.5 px-3.5 py-2.5 rounded-md transition-all w-full text-sm font-medium',
            activeTool === 'measure'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:bg-slate-700'
          ]"
        >
          <Ruler :size="16" />
          <span>测量</span>
        </button>
      </div>

      <div
        v-if="activeTool === 'draw'"
        class="bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-1.5"
      >
        <button
          @click="setDrawType('point')"
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all w-full text-xs font-medium',
            drawType === 'point'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:bg-slate-700'
          ]"
        >
          <MapPin :size="14" />
          <span>点</span>
        </button>
        <button
          @click="setDrawType('line')"
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all w-full text-xs font-medium',
            drawType === 'line'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:bg-slate-700'
          ]"
        >
          <Layers :size="14" />
          <span>线</span>
        </button>
        <button
          @click="setDrawType('polygon')"
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all w-full text-xs font-medium',
            drawType === 'polygon'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:bg-slate-700'
          ]"
        >
          <Grid3X3 :size="14" />
          <span>面</span>
        </button>
      </div>
    </div>

    <div class="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <div class="bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-1.5">
        <button
          @click="zoomIn"
          class="flex items-center justify-center w-10 h-10 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-all"
          title="放大"
        >
          <Plus :size="18" />
        </button>
        <button
          @click="zoomOut"
          class="flex items-center justify-center w-10 h-10 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-all text-base font-light"
          title="缩小"
        >
          -
        </button>
        <button
          @click="resetView"
          class="flex items-center justify-center w-10 h-10 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-all"
          title="复位"
        >
          <MapPin :size="18" />
        </button>
      </div>

      <div class="bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-1.5">
        <button
          @click="clearMap"
          class="flex items-center justify-center w-10 h-10 text-slate-300 hover:bg-red-600/20 hover:text-red-400 rounded-md transition-all"
          title="清空"
        >
          <Trash2 :size="18" />
        </button>
        <button
          @click="exportMap"
          class="flex items-center justify-center w-10 h-10 text-slate-300 hover:bg-emerald-600/20 hover:text-emerald-400 rounded-md transition-all"
          title="导出"
        >
          <Download :size="18" />
        </button>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="showMeasureResult"
        class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 px-4 py-3"
      >
        <div class="text-slate-400 text-sm mb-1">测量结果</div>
        <div class="text-white text-xl font-semibold">
          {{ measureResult.value.toFixed(2) }} {{ measureResult.unit }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
