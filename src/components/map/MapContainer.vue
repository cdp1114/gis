<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { GisMap } from '@/utils/map';
import { Trash2, Download, Plus, ZoomOut, RotateCcw, MapPin, MousePointer, PenTool, Ruler, Layers, Grid3X3 } from 'lucide-vue-next';

const mapContainer = ref<HTMLElement | null>(null);
let gisMap: GisMap | null = null;

const activeTool = ref<'select' | 'draw' | 'measure'>('select');
const drawType = ref<'point' | 'line' | 'polygon'>('point');
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

const handleToolChange = (tool: 'select' | 'draw' | 'measure') => {
  setActiveTool(tool);
};

const handleDrawTypeChange = (type: 'point' | 'line' | 'polygon') => {
  setDrawType(type);
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

defineExpose({ 
  gisMap,
  handleToolChange,
  handleDrawTypeChange
});
</script>

<template>
  <div class="relative h-full w-full">
    <div id="map-container" ref="mapContainer" class="h-full w-full bg-slate-900"></div>

    <div class="absolute top-6 left-6 z-20 flex flex-col gap-3">
      <div class="bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 p-2 min-w-[120px]">
        <div class="flex flex-col gap-1">
          <button
            @click="setActiveTool('select')"
            :class="[
              'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all',
              activeTool === 'select'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            ]"
          >
            <MousePointer :size="18" />
            <span class="text-sm font-medium">选择</span>
          </button>
          <button
            @click="setActiveTool('draw')"
            :class="[
              'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all',
              activeTool === 'draw'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            ]"
          >
            <PenTool :size="18" />
            <span class="text-sm font-medium">绘制</span>
          </button>
          <button
            @click="setActiveTool('measure')"
            :class="[
              'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all',
              activeTool === 'measure'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            ]"
          >
            <Ruler :size="18" />
            <span class="text-sm font-medium">测量</span>
          </button>
        </div>
      </div>

      <Transition name="slide-down">
        <div
          v-if="activeTool === 'draw'"
          class="bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-emerald-500/30 p-2 min-w-[100px]"
        >
          <div class="flex flex-col gap-1">
            <button
              @click="setDrawType('point')"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm',
                drawType === 'point'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              ]"
            >
              <MapPin :size="16" />
              <span>点</span>
            </button>
            <button
              @click="setDrawType('line')"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm',
                drawType === 'line'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              ]"
            >
              <Layers :size="16" />
              <span>线</span>
            </button>
            <button
              @click="setDrawType('polygon')"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm',
                drawType === 'polygon'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              ]"
            >
              <Grid3X3 :size="16" />
              <span>面</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <div class="absolute top-6 right-6 z-20 flex flex-col gap-3">
      <div class="bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 p-2">
        <div class="flex flex-col gap-1">
          <button
            @click="zoomIn"
            class="flex items-center justify-center w-10 h-10 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            title="放大"
          >
            <Plus :size="18" />
          </button>
          <button
            @click="zoomOut"
            class="flex items-center justify-center w-10 h-10 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            title="缩小"
          >
            <ZoomOut :size="18" />
          </button>
          <button
            @click="resetView"
            class="flex items-center justify-center w-10 h-10 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            title="复位"
          >
            <RotateCcw :size="18" />
          </button>
        </div>
      </div>

      <div class="bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 p-2">
        <div class="flex flex-col gap-1">
          <button
            @click="clearMap"
            class="flex items-center justify-center w-10 h-10 text-slate-300 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-all"
            title="清空"
          >
            <Trash2 :size="18" />
          </button>
          <button
            @click="exportMap"
            class="flex items-center justify-center w-10 h-10 text-slate-300 hover:text-emerald-400 hover:bg-emerald-600/20 rounded-lg transition-all"
            title="导出"
          >
            <Download :size="18" />
          </button>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="showMeasureResult"
        class="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 px-5 py-3 z-20"
      >
        <div class="text-slate-400 text-sm mb-1">测量结果</div>
        <div class="text-white text-xl font-semibold">
          {{ measureResult.value.toFixed(2) }} {{ measureResult.unit }}
        </div>
      </div>
    </Transition>

    <div class="absolute bottom-6 left-6 z-10 bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-700 px-3 py-2">
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <MapPin :size="12" />
        <span>EPSG:4326</span>
      </div>
    </div>
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
