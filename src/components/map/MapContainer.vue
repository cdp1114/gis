<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { GisMap } from '@/utils/map';
import { MapPin, Layers, Ruler, Trash2, Download, MousePointer, Plus, Edit, Grid3X3 } from 'lucide-vue-next';
import type { DrawType } from '@/types/gis';

const mapContainer = ref<HTMLElement | null>(null);
const mapTarget = ref<string>('map-container');
let gisMap: GisMap | null = null;

const activeTool = ref<'select' | 'draw' | 'measure'>('select');
const drawType = ref<DrawType>('point');
const measureMode = ref<'none' | 'distance' | 'area'>('none');
const showLayerPanel = ref(false);
const showMeasureResult = ref(false);
const measureResult = ref({ value: 0, unit: '' });

const emit = defineEmits<{
  (e: 'featureSelected', features: any[]): void;
  (e: 'mapClick', coordinates: [number, number]): void;
}>();

onMounted(() => {
  if (mapContainer.value) {
    mapTarget.value = 'map-container';
    gisMap = new GisMap({
      target: mapTarget.value,
      center: [116.3974, 39.9088],
      zoom: 10,
      projection: 'EPSG:4326'
    });

    gisMap.getMap().on('click', (event) => {
      const coord = gisMap!.getCenter();
      const extent = gisMap!.getMap().getView().calculateExtent();
      emit('mapClick', coord);
    });

    gisMap.enableSelect((features) => {
      emit('featureSelected', features);
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
    gisMap?.enableSelect((features) => {
      emit('featureSelected', features);
    });
  } else if (tool === 'measure') {
    enableMeasure();
  }
};

const setDrawType = (type: DrawType) => {
  drawType.value = type;
  if (activeTool.value === 'draw') {
    enableDraw();
  }
};

const enableDraw = () => {
  if (!gisMap) return;
  const typeMap: Record<DrawType, 'Point' | 'LineString' | 'Polygon'> = {
    point: 'Point',
    line: 'LineString',
    polygon: 'Polygon',
    circle: 'Point',
    rectangle: 'Polygon',
    none: 'Point'
  };
  gisMap.enableDraw(typeMap[drawType.value], (feature) => {
    console.log('Drawn feature:', feature);
  });
};

const enableMeasure = () => {
  if (!gisMap) return;
  measureMode.value = 'distance';
  gisMap.enableDraw('LineString', (feature) => {
    const coordinates = (feature.getGeometry() as any).getCoordinates();
    const result = gisMap!.measureDistance(coordinates);
    measureResult.value = { value: result, unit: 'm' };
    showMeasureResult.value = true;
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

watch(() => drawType.value, () => {
  if (activeTool.value === 'draw') {
    enableDraw();
  }
});

defineExpose({ gisMap });
</script>

<template>
  <div class="relative h-full w-full">
    <div id="map-container" ref="mapContainer" class="h-full w-full bg-slate-900"></div>

    <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <div class="bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-1">
        <button
          @click="setActiveTool('select')"
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all w-full text-sm',
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
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all w-full text-sm',
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
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all w-full text-sm',
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
        class="bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-1"
      >
        <button
          @click="setDrawType('point')"
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all w-full text-sm',
            drawType === 'point'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-300 hover:bg-slate-700'
          ]"
        >
          <MapPin :size="16" />
          <span>点</span>
        </button>
        <button
          @click="setDrawType('line')"
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all w-full text-sm',
            drawType === 'line'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-300 hover:bg-slate-700'
          ]"
        >
          <Layers :size="16" />
          <span>线</span>
        </button>
        <button
          @click="setDrawType('polygon')"
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all w-full text-sm',
            drawType === 'polygon'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-300 hover:bg-slate-700'
          ]"
        >
          <Grid3X3 :size="16" />
          <span>面</span>
        </button>
      </div>
    </div>

    <div class="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <div class="bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-1">
        <button
          @click="zoomIn"
          class="flex items-center justify-center w-10 h-10 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-all"
          title="放大"
        >
          <Plus :size="18" />
        </button>
        <button
          @click="zoomOut"
          class="flex items-center justify-center w-10 h-10 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-all"
          title="缩小"
        >
          <span class="text-lg font-light">-</span>
        </button>
        <button
          @click="resetView"
          class="flex items-center justify-center w-10 h-10 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-all"
          title="复位"
        >
          <MapPin :size="18" />
        </button>
      </div>

      <div class="bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-1">
        <button
          @click="clearMap"
          class="flex items-center justify-center w-10 h-10 text-slate-300 hover:bg-red-600 hover:text-white rounded-md transition-all"
          title="清空"
        >
          <Trash2 :size="18" />
        </button>
        <button
          @click="exportMap"
          class="flex items-center justify-center w-10 h-10 text-slate-300 hover:bg-emerald-600 hover:text-white rounded-md transition-all"
          title="导出"
        >
          <Download :size="18" />
        </button>
      </div>
    </div>

    <div
      v-if="showMeasureResult"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 px-4 py-3"
    >
      <div class="text-slate-400 text-sm">测量结果</div>
      <div class="text-white text-xl font-semibold">
        {{ measureResult.value.toFixed(2) }} {{ measureResult.unit }}
      </div>
    </div>
  </div>
</template>
