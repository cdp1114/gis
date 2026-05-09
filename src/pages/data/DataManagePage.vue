<script setup lang="ts">
import { ref } from 'vue';
import { Upload, Download, FolderOpen, Database, Trash2, CheckCircle, XCircle } from 'lucide-vue-next';
import { ElTable, ElTableColumn, ElButton, ElUpload, ElMessage, ElProgress } from 'element-plus';
import DataManagement from '@/components/data/DataManagement.vue';

const uploadedFiles = ref([
  { id: '1', name: 'facilities.geojson', size: '256 KB', status: 'success', progress: 100, type: 'GeoJSON' },
  { id: '2', name: 'roads.shp', size: '1.2 MB', status: 'success', progress: 100, type: 'Shapefile' },
  { id: '3', name: 'regions.geojson', size: '512 KB', status: 'error', progress: 0, type: 'GeoJSON' }
]);

const importProgress = ref(0);
const isImporting = ref(false);

const handleImport = () => {
  isImporting.value = true;
  importProgress.value = 0;
  const interval = setInterval(() => {
    importProgress.value += Math.random() * 20;
    if (importProgress.value >= 100) {
      importProgress.value = 100;
      clearInterval(interval);
      setTimeout(() => {
        isImporting.value = false;
        ElMessage.success('导入完成');
      }, 500);
    }
  }, 200);
};

const handleExport = () => {
  ElMessage.success('导出任务已启动');
};

const handleDelete = (row: any) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== row.id);
  ElMessage.success('已删除');
};
</script>

<template>
  <div class="h-full flex bg-slate-900">
    <div class="flex-1 p-6 overflow-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">数据管理</h1>
          <p class="text-slate-400 mt-1">管理空间数据的导入导出</p>
        </div>
        <div class="flex gap-3">
          <ElButton type="primary" @click="handleImport" :loading="isImporting">
            <Upload :size="16" class="mr-1" />
            导入数据
          </ElButton>
          <ElButton @click="handleExport">
            <Download :size="16" class="mr-1" />
            导出数据
          </ElButton>
        </div>
      </div>

      <div v-if="isImporting" class="mb-6 bg-slate-800 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-slate-300">正在导入...</span>
          <span class="text-blue-400">{{ Math.round(importProgress) }}%</span>
        </div>
        <ElProgress :percentage="importProgress" :show-text="false" />
      </div>

      <div class="bg-slate-800 rounded-xl border border-slate-700">
        <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
          <FolderOpen :size="16" class="text-blue-400" />
          <h2 class="text-white font-medium">已导入数据</h2>
        </div>
        <ElTable :data="uploadedFiles" stripe class="w-full">
          <ElTableColumn prop="name" label="文件名" min-width="200">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <Database :size="14" class="text-slate-400" />
                <span class="text-white">{{ row.name }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="type" label="类型" width="100">
            <template #default="{ row }">
              <span class="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{{ row.type }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="size" label="大小" width="100" />
          <ElTableColumn prop="status" label="状态" width="100">
            <template #default="{ row }">
              <div v-if="row.status === 'success'" class="flex items-center gap-1 text-emerald-400">
                <CheckCircle :size="14" />
                <span class="text-sm">成功</span>
              </div>
              <div v-else class="flex items-center gap-1 text-red-400">
                <XCircle :size="14" />
                <span class="text-sm">失败</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="160">
            <template #default="{ row }">
              <button
                @click="handleDelete(row)"
                class="flex items-center gap-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
              >
                <Trash2 :size="14" />
                <span class="text-xs">删除</span>
              </button>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>
    <div class="w-80 h-full bg-slate-800/95 border-l border-slate-700">
      <DataManagement />
    </div>
  </div>
</template>

<style scoped>
:deep(.el-table) {
  background-color: #1e293b;
  --el-table-bg-color: #1e293b;
  --el-table-tr-bg-color: #1e293b;
  --el-table-header-bg-color: rgba(51, 65, 85, 0.8);
  --el-table-border-color: #334155;
}

:deep(.el-table__header-wrapper th) {
  background-color: rgba(51, 65, 85, 0.8);
  color: #e2e8f0;
  font-weight: 600;
  border-bottom: 1px solid #334155;
}

:deep(.el-table__body-wrapper) {
  background-color: #1e293b;
}

:deep(.el-table__body-wrapper tr) {
  background-color: #1e293b;
}

:deep(.el-table__body-wrapper td) {
  background-color: #1e293b;
  border-bottom: 1px solid #334155;
  color: #cbd5e1;
}

:deep(.el-table__body-wrapper tr:hover > td) {
  background-color: rgba(51, 65, 85, 0.5) !important;
}
</style>
