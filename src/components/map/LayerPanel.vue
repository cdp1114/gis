<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Eye, EyeOff, Trash2, Edit2, GripVertical, ChevronDown, ChevronRight, Plus, Layers, MousePointer, PenTool, Ruler } from 'lucide-vue-next';
import { ElSwitch, ElSlider, ElButton, ElInput, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElMessage } from 'element-plus';
import { layerApi } from '@/api';
import type { Layer } from '@/types/gis';

const layers = ref<Layer[]>([
  { id: '1', layerName: '底图', layerCode: 'base_map', layerType: 'raster', isVisible: true, opacity: 1, sortOrder: 0 },
  { id: '2', layerName: '道路网络', layerCode: 'roads', layerType: 'line', isVisible: true, opacity: 0.8, sortOrder: 1 },
  { id: '3', layerName: '设施点位', layerCode: 'facilities', layerType: 'point', isVisible: true, opacity: 1, sortOrder: 2 },
  { id: '4', layerName: '区域边界', layerCode: 'regions', layerType: 'polygon', isVisible: false, opacity: 0.6, sortOrder: 3 }
]);

const expandedGroups = ref<string[]>(['vector', 'base']);
const editingLayer = ref<Layer | null>(null);
const showEditDialog = ref(false);
const showAddDialog = ref(false);
const newLayer = ref<Partial<Layer>>({
  layerName: '',
  layerCode: '',
  layerType: 'point',
  dataSource: '',
  opacity: 1,
  isVisible: true
});

const activeTool = ref<'select' | 'draw' | 'measure'>('select');
const drawType = ref<'point' | 'line' | 'polygon'>('point');
const expandedTools = ref<Record<string, boolean>>({});

const emit = defineEmits<{
  (e: 'toolChange', tool: 'select' | 'draw' | 'measure'): void;
  (e: 'drawTypeChange', type: 'point' | 'line' | 'polygon'): void;
}>();

const setActiveTool = (tool: 'select' | 'draw' | 'measure') => {
  activeTool.value = tool;
  emit('toolChange', tool);
};

const setDrawType = (type: 'point' | 'line' | 'polygon') => {
  drawType.value = type;
  emit('drawTypeChange', type);
};

const toggleTools = (layerId: string) => {
  expandedTools.value[layerId] = !expandedTools.value[layerId];
};

const groupedLayers = computed(() => {
  return {
    base: layers.value.filter(l => l.layerType === 'raster' || l.layerType === 'wms'),
    vector: layers.value.filter(l => ['point', 'line', 'polygon'].includes(l.layerType)),
    wfs: layers.value.filter(l => l.layerType === 'wfs')
  };
});

const toggleVisibility = (layer: Layer) => {
  layer.isVisible = !layer.isVisible;
};

const updateOpacity = (layer: Layer, opacity: number) => {
  layer.opacity = opacity / 100;
};

const toggleGroup = (group: string) => {
  const index = expandedGroups.value.indexOf(group);
  if (index > -1) {
    expandedGroups.value.splice(index, 1);
  } else {
    expandedGroups.value.push(group);
  }
};

const handleEditLayer = (layer: Layer) => {
  editingLayer.value = { ...layer };
  showEditDialog.value = true;
};

const handleDeleteLayer = async (layer: Layer) => {
  try {
    layers.value = layers.value.filter(l => l.id !== layer.id);
    ElMessage.success('图层已删除');
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const handleSaveLayer = () => {
  if (editingLayer.value) {
    const index = layers.value.findIndex(l => l.id === editingLayer.value!.id);
    if (index > -1) {
      layers.value[index] = editingLayer.value;
    }
    ElMessage.success('图层已更新');
  }
  showEditDialog.value = false;
  editingLayer.value = null;
};

const handleAddLayer = () => {
  const newId = String(Date.now());
  layers.value.push({
    id: newId,
    layerName: newLayer.value.layerName || '',
    layerCode: newLayer.value.layerCode || '',
    layerType: newLayer.value.layerType as Layer['layerType'],
    dataSource: newLayer.value.dataSource,
    isVisible: true,
    opacity: newLayer.value.opacity || 1,
    sortOrder: layers.value.length
  });
  ElMessage.success('图层已添加');
  showAddDialog.value = false;
  newLayer.value = {
    layerName: '',
    layerCode: '',
    layerType: 'point',
    dataSource: '',
    opacity: 1,
    isVisible: true
  };
};

const getLayerTypeLabel = (type: string) => {
  switch (type) {
    case 'point': return 'POINT';
    case 'line': return 'LINE';
    case 'polygon': return 'POLYGON';
    case 'raster': return 'RASTER';
    case 'wms': return 'WMS';
    case 'wfs': return 'WFS';
    default: return 'UNKNOWN';
  }
};

const getLayerColor = (type: string) => {
  switch (type) {
    case 'point': return 'bg-amber-500';
    case 'line': return 'bg-blue-500';
    case 'polygon': return 'bg-emerald-500';
    case 'raster': return 'bg-slate-500';
    case 'wms': return 'bg-purple-500';
    case 'wfs': return 'bg-rose-500';
    default: return 'bg-slate-500';
  }
};

defineExpose({ layers });
</script>

<template>
  <div class="h-full flex flex-col bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700">
    <div class="flex items-center justify-between p-4 border-b border-slate-700">
      <div class="flex items-center gap-2">
        <Layers :size="18" class="text-blue-400" />
        <h3 class="text-white font-semibold">图层管理</h3>
      </div>
      <button
        @click="showAddDialog = true"
        class="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
      >
        <Plus :size="16" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-3 space-y-3" style="overflow-y: auto;">
      <div v-for="(groupLayers, groupName) in groupedLayers" :key="groupName" class="space-y-2">
        <button
          @click="toggleGroup(groupName)"
          class="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-slate-700/50 rounded-md transition-colors"
        >
          <component :is="expandedGroups.includes(groupName) ? ChevronDown : ChevronRight" :size="14" class="text-slate-400" />
          <span class="text-sm font-medium text-slate-300 capitalize">{{ groupName === 'base' ? '底图' : groupName === 'vector' ? '矢量图层' : 'WFS服务' }}</span>
          <span class="text-xs text-slate-500">({{ groupLayers.length }})</span>
        </button>

        <div v-if="expandedGroups.includes(groupName)" class="space-y-2 pl-4">
          <div
            v-for="layer in groupLayers"
            :key="layer.id"
            class="bg-slate-700/50 rounded-lg p-3 space-y-2 hover:bg-slate-700/70 transition-colors group"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span :class="['w-2 h-2 rounded-full', getLayerColor(layer.layerType)]"></span>
                <span class="text-sm text-white">{{ layer.layerName }}</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="relative">
                  <button
                    @click="toggleTools(layer.id)"
                    class="p-1 hover:bg-slate-600 text-slate-400 hover:text-white rounded transition-colors"
                    title="操作"
                  >
                    <Layers :size="14" />
                  </button>
                  <Transition name="dropdown">
                    <div
                      v-if="expandedTools[layer.id]"
                      class="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 min-w-[100px]"
                    >
                      <button
                        @click="setActiveTool('select'); expandedTools[layer.id] = false"
                        :class="[
                          'w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors',
                          activeTool === 'select' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                        ]"
                      >
                        <MousePointer :size="14" />
                        <span>选择</span>
                      </button>
                      <button
                        @click="setActiveTool('draw'); expandedTools[layer.id] = false"
                        :class="[
                          'w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors',
                          activeTool === 'draw' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                        ]"
                      >
                        <PenTool :size="14" />
                        <span>绘制</span>
                      </button>
                      <button
                        @click="setActiveTool('measure'); expandedTools[layer.id] = false"
                        :class="[
                          'w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors',
                          activeTool === 'measure' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                        ]"
                      >
                        <Ruler :size="14" />
                        <span>测量</span>
                      </button>
                    </div>
                  </Transition>
                </div>
                <button
                  @click="handleEditLayer(layer)"
                  class="p-1 hover:bg-slate-600 text-slate-400 hover:text-white rounded transition-colors"
                >
                  <Edit2 :size="12" />
                </button>
                <button
                  @click="handleDeleteLayer(layer)"
                  class="p-1 hover:bg-red-600 text-slate-400 hover:text-white rounded transition-colors"
                >
                  <Trash2 :size="12" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">{{ getLayerTypeLabel(layer.layerType) }}</span>
              <button
                @click="toggleVisibility(layer)"
                :class="[
                  'p-1 rounded transition-colors',
                  layer.isVisible ? 'text-blue-400 hover:bg-slate-600' : 'text-slate-500 hover:bg-slate-600'
                ]"
              >
                <component :is="layer.isVisible ? Eye : EyeOff" :size="14" />
              </button>
            </div>

            <div v-if="layer.isVisible" class="space-y-1">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>透明度</span>
                <span>{{ Math.round(layer.opacity * 100) }}%</span>
              </div>
              <ElSlider
                :model-value="layer.opacity * 100"
                @update:model-value="(val: number) => updateOpacity(layer, val)"
                :show-tooltip="false"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <ElDialog v-model="showAddDialog" title="添加图层" width="360px" class="layer-dialog">
      <ElForm :model="newLayer" label-position="top">
        <ElFormItem label="图层名称">
          <ElInput v-model="newLayer.layerName" placeholder="请输入图层名称" />
        </ElFormItem>
        <ElFormItem label="图层编码">
          <ElInput v-model="newLayer.layerCode" placeholder="请输入图层编码" />
        </ElFormItem>
        <ElFormItem label="图层类型">
          <ElSelect v-model="newLayer.layerType" class="w-full">
            <ElOption label="点要素" value="point" />
            <ElOption label="线要素" value="line" />
            <ElOption label="面要素" value="polygon" />
            <ElOption label="栅格" value="raster" />
            <ElOption label="WMS服务" value="wms" />
            <ElOption label="WFS服务" value="wfs" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="数据源">
          <ElInput v-model="newLayer.dataSource" placeholder="请输入数据源路径" />
        </ElFormItem>
        <ElFormItem label="透明度">
          <ElSlider v-model="newLayer.opacity" :min="0" :max="1" :step="0.1" show-stops />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleAddLayer">添加</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="showEditDialog" title="编辑图层" width="360px" class="layer-dialog">
      <ElForm v-if="editingLayer" :model="editingLayer" label-position="top">
        <ElFormItem label="图层名称">
          <ElInput v-model="editingLayer.layerName" />
        </ElFormItem>
        <ElFormItem label="透明度">
          <ElSlider v-model="editingLayer.opacity" :min="0" :max="1" :step="0.1" show-stops />
        </ElFormItem>
        <ElFormItem label="可见性">
          <ElSwitch v-model="editingLayer.isVisible" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showEditDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleSaveLayer">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.layer-dialog :deep(.el-dialog) {
  background: #1e293b;
  border: 1px solid #334155;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
}
.layer-dialog :deep(.el-dialog__wrapper) {
  z-index: 9999 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: auto !important;
}
.layer-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #334155;
}
.layer-dialog :deep(.el-dialog__title) {
  color: #f1f5f9;
}
.layer-dialog :deep(.el-form-item__label) {
  color: #cbd5e1;
}
.layer-dialog :deep(.el-input__wrapper) {
  background: #0f172a;
  border: 1px solid #334155;
}
.layer-dialog :deep(.el-input__inner) {
  color: #f1f5f9;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
