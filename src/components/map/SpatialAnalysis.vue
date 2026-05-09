<script setup lang="ts">
import { ref } from 'vue';
import { Activity, Circle, Layers, Square, ArrowRight } from 'lucide-vue-next';
import { ElSlider, ElInputNumber, ElButton, ElSelect, ElOption, ElMessage } from 'element-plus';

const analysisType = ref('buffer');
const bufferDistance = ref(500);
const bufferUnit = ref('m');
const analysisResult = ref<any[]>([]);
const isAnalyzing = ref(false);

const targetLayers = ref([
  { id: 'facilities', name: '设施点位', checked: true },
  { id: 'regions', name: '区域边界', checked: true },
  { id: 'roads', name: '道路网络', checked: false }
]);

const performAnalysis = () => {
  isAnalyzing.value = true;
  setTimeout(() => {
    isAnalyzing.value = false;
    analysisResult.value = [
      { id: '1', name: '缓冲区分析结果', count: 15, area: '0.78 km²' },
      { id: '2', name: '重叠区域', count: 3, area: '0.12 km²' }
    ];
    ElMessage.success('分析完成');
  }, 1000);
};

const clearAnalysis = () => {
  analysisResult.value = [];
  ElMessage.info('已清除分析结果');
};
</script>

<template>
  <div class="h-full flex flex-col bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700">
    <div class="flex items-center justify-between p-4 border-b border-slate-700">
      <div class="flex items-center gap-2">
        <Activity :size="18" class="text-blue-400" />
        <h3 class="text-white font-semibold">空间分析</h3>
      </div>
    </div>

    <div class="p-4 border-b border-slate-700 space-y-4">
      <div>
        <label class="block text-sm text-slate-400 mb-2">分析类型</label>
        <ElSelect v-model="analysisType" class="w-full">
          <ElOption label="缓冲区分析" value="buffer" />
          <ElOption label="叠加分析" value="overlay" />
          <ElOption label="相交分析" value="intersect" />
        </ElSelect>
      </div>

      <div v-if="analysisType === 'buffer'">
        <label class="block text-sm text-slate-400 mb-2">缓冲距离</label>
        <div class="flex items-center gap-4">
          <ElSlider v-model="bufferDistance" :min="100" :max="5000" :step="100" class="flex-1" />
          <ElInputNumber v-model="bufferDistance" :min="100" :max="5000" :step="100" class="w-28" />
          <ElSelect v-model="bufferUnit" class="w-24">
            <ElOption label="米" value="m" />
            <ElOption label="千米" value="km" />
          </ElSelect>
        </div>
      </div>

      <div>
        <label class="block text-sm text-slate-400 mb-2">分析目标图层</label>
        <div class="space-y-2">
          <label v-for="layer in targetLayers" :key="layer.id" class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="layer.checked" class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500" />
            <span class="text-sm text-slate-300">{{ layer.name }}</span>
          </label>
        </div>
      </div>

      <div class="flex gap-2">
        <ElButton type="primary" class="flex-1" :loading="isAnalyzing" @click="performAnalysis">
          <Activity :size="16" class="mr-1" />
          开始分析
        </ElButton>
        <ElButton @click="clearAnalysis">清除</ElButton>
      </div>
    </div>

    <div class="flex-1 overflow-auto p-4">
      <div v-if="analysisResult.length > 0" class="space-y-3">
        <div v-for="result in analysisResult" :key="result.id" class="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
          <div class="flex items-center justify-between mb-2">
            <span class="text-white font-medium">{{ result.name }}</span>
            <span class="text-2xl font-bold text-blue-400">{{ result.count }}</span>
          </div>
          <div class="text-sm text-slate-400">影响面积: {{ result.area }}</div>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center h-full text-slate-500">
        <Activity :size="48" class="mb-4 opacity-50" />
        <p>请设置分析参数并开始分析</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-slider__runway) {
  background-color: #334155;
}

:deep(.el-slider__bar) {
  background-color: #3b82f6;
}

:deep(.el-slider__button) {
  border-color: #3b82f6;
}

:deep(.el-input-number .el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
}
</style>
