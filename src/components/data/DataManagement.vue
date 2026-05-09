<script setup lang="ts">
import { ref } from 'vue';
import { Upload, Download, FileJson, FileImage, CheckCircle, AlertCircle, RefreshCw } from 'lucide-vue-next';
import { ElButton, ElUpload, ElTable, ElTableColumn, ElMessage, ElProgress } from 'element-plus';

const fileList = ref<any[]>([
  {
    id: '1',
    name: 'facilities.geojson',
    size: 10240,
    type: 'GeoJSON',
    status: 'success',
    importedAt: '2026-05-08 14:30'
  },
  {
    id: '2',
    name: 'roads.shp',
    size: 51200,
    type: 'Shapefile',
    status: 'success',
    importedAt: '2026-05-07 10:15'
  },
  {
    id: '3',
    name: 'regions.geojson',
    size: 20480,
    type: 'GeoJSON',
    status: 'error',
    importedAt: '2026-05-06 16:45'
  }
]);

const uploadProgress = ref(0);
const isUploading = ref(false);

const handleFileUpload = () => {
  isUploading.value = true;
  uploadProgress.value = 0;
  
  const interval = setInterval(() => {
    uploadProgress.value += 10;
    if (uploadProgress.value >= 100) {
      clearInterval(interval);
      isUploading.value = false;
      ElMessage.success('文件导入成功');
    }
  }, 200);
};

const handleExport = () => {
  ElMessage.success('数据导出成功');
};

const getFileIcon = (type: string) => {
  return type === 'GeoJSON' ? FileJson : FileImage;
};

const getStatusIcon = (status: string) => {
  return status === 'success' ? CheckCircle : AlertCircle;
};

const getStatusColor = (status: string) => {
  return status === 'success' ? 'text-emerald-400' : 'text-red-400';
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
</script>

<template>
  <div class="h-full flex flex-col bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700">
    <div class="flex items-center justify-between p-4 border-b border-slate-700">
      <div class="flex items-center gap-2">
        <Upload :size="18" class="text-blue-400" />
        <h3 class="text-white font-semibold">数据管理</h3>
      </div>
      <div class="flex items-center gap-2">
        <ElUpload
          class="upload-btn"
          :show-file-list="false"
          accept=".geojson,.shp,.zip"
          :auto-upload="false"
          @click="handleFileUpload"
        >
          <ElButton type="primary" icon="Upload">
            导入数据
          </ElButton>
        </ElUpload>
        <ElButton icon="Download" @click="handleExport">
          导出数据
        </ElButton>
      </div>
    </div>

    <div v-if="isUploading" class="p-4 border-b border-slate-700">
      <div class="flex items-center gap-3">
        <RefreshCw :size="16" class="text-blue-400 animate-spin" />
        <span class="text-sm text-slate-300">正在上传...</span>
        <ElProgress :percentage="uploadProgress" :show-text="false" class="flex-1" />
        <span class="text-sm text-slate-400">{{ uploadProgress }}%</span>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <ElTable :data="fileList" stripe class="w-full">
        <ElTableColumn label="文件名" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <component :is="getFileIcon(row.type)" :size="20" class="text-blue-400" />
              <div>
                <div class="text-white text-sm">{{ row.name }}</div>
                <div class="text-xs text-slate-500">{{ row.type }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="大小" width="100">
          <template #default="{ row }">
            <span class="text-slate-400 text-sm">{{ formatFileSize(row.size) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <div class="flex items-center gap-1">
              <component :is="getStatusIcon(row.status)" :size="14" :class="getStatusColor(row.status)" />
              <span :class="['text-sm', getStatusColor(row.status)]">
                {{ row.status === 'success' ? '成功' : '失败' }}
              </span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="导入时间" width="140">
          <template #default="{ row }">
            <span class="text-slate-400 text-sm">{{ row.importedAt }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="160">
          <template #default="{ row }">
            <button
              v-if="row.status === 'error'"
              @click="handleFileUpload"
              class="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors"
            >
              <RefreshCw :size="14" />
              <span class="text-xs">重新导入</span>
            </button>
            <span v-else class="text-slate-500 text-sm">-</span>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <div class="p-4 border-t border-slate-700">
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-400">共 {{ fileList.length }} 条记录</span>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1">
            <CheckCircle :size="14" class="text-emerald-400" />
            <span class="text-slate-400">{{ fileList.filter(f => f.status === 'success').length }} 成功</span>
          </div>
          <div class="flex items-center gap-1">
            <AlertCircle :size="14" class="text-red-400" />
            <span class="text-slate-400">{{ fileList.filter(f => f.status === 'error').length }} 失败</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-table) {
  background-color: transparent;
}

:deep(.el-table__header-wrapper th) {
  background-color: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
  font-weight: 600;
  border-bottom: 1px solid #334155;
}

:deep(.el-table__body-wrapper tr:hover > td) {
  background-color: rgba(51, 65, 85, 0.3) !important;
}

:deep(.el-table__body-wrapper td) {
  border-bottom: 1px solid rgba(51, 65, 85, 0.3);
  color: #cbd5e1;
}

:deep(.el-progress-bar__outer) {
  background-color: #334155;
}

:deep(.el-progress-bar__inner) {
  background-color: #3b82f6;
}
</style>
