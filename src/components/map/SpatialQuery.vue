<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, MapPin, Layers, Download, Filter, X, Locate, Navigation } from 'lucide-vue-next';
import { ElTable, ElTableColumn, ElInput, ElButton, ElSelect, ElOption, ElPagination, ElMessage, ElTag } from 'element-plus';

const searchKeyword = ref('');
const selectedLayer = ref('');
const selectedType = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

const searchResults = ref([
  {
    id: '1',
    name: '朝阳区消防站',
    type: 'facility',
    layer: 'facilities',
    address: '北京市朝阳区建国路88号',
    coordinates: [116.4782, 39.9088],
    status: 'active'
  },
  {
    id: '2',
    name: '海淀区公园',
    type: 'park',
    layer: 'regions',
    address: '北京市海淀区中关村大街',
    coordinates: [116.3123, 39.9566],
    status: 'active'
  },
  {
    id: '3',
    name: '东城区医院',
    type: 'hospital',
    layer: 'facilities',
    address: '北京市东城区东单北大街',
    coordinates: [116.4171, 39.9139],
    status: 'active'
  }
]);

const filteredResults = computed(() => {
  return searchResults.value.filter(item => {
    const matchKeyword = !searchKeyword.value || 
      item.name.includes(searchKeyword.value) || 
      item.address.includes(searchKeyword.value);
    const matchLayer = !selectedLayer.value || item.layer === selectedLayer.value;
    const matchType = !selectedType.value || item.type === selectedType.value;
    return matchKeyword && matchLayer && matchType;
  });
});

const handleSearch = () => {
  ElMessage.success('查询完成');
};

const handleLocate = (row: any) => {
  console.log('Locate:', row);
  ElMessage.success(`定位到: ${row.name}`);
};

const handleExport = () => {
  const data = JSON.stringify(filteredResults.value, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'search-results.json';
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success('导出成功');
};

const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'info';
    case 'warning': return 'warning';
    default: return 'info';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '正常';
    case 'inactive': return '停用';
    case 'warning': return '告警';
    default: return '未知';
  }
};
</script>

<template>
  <div class="h-full flex flex-col bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700">
    <div class="flex items-center justify-between p-4 border-b border-slate-700">
      <div class="flex items-center gap-2">
        <Search :size="18" class="text-blue-400" />
        <h3 class="text-white font-semibold">空间查询</h3>
      </div>
      <button @click="handleExport" class="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm transition-colors">
        <Download :size="14" />
        <span>导出</span>
      </button>
    </div>

    <div class="p-4 border-b border-slate-700 space-y-3">
      <div class="flex gap-3">
        <ElInput
          v-model="searchKeyword"
          placeholder="输入名称或地址搜索"
          class="flex-1"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <Search :size="16" class="text-slate-400" />
          </template>
        </ElInput>
        <ElSelect v-model="selectedLayer" placeholder="选择图层" class="w-40">
          <ElOption label="全部图层" value="" />
          <ElOption label="设施点位" value="facilities" />
          <ElOption label="区域边界" value="regions" />
          <ElOption label="道路网络" value="roads" />
        </ElSelect>
        <ElSelect v-model="selectedType" placeholder="选择类型" class="w-32">
          <ElOption label="全部类型" value="" />
          <ElOption label="设施" value="facility" />
          <ElOption label="公园" value="park" />
          <ElOption label="医院" value="hospital" />
        </ElSelect>
        <ElButton type="primary" @click="handleSearch">查询</ElButton>
      </div>
    </div>

    <div class="flex-1 overflow-auto p-4">
      <ElTable :data="filteredResults" stripe class="w-full">
        <ElTableColumn prop="name" label="名称" min-width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <MapPin :size="14" class="text-blue-400" />
              <span class="text-white">{{ row.name }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="type" label="类型" width="100">
          <template #default="{ row }">
            <ElTag size="small" :type="getStatusType(row.status)">{{ row.type }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="layer" label="所属图层" width="120">
          <template #default="{ row }">
            <div class="flex items-center gap-1">
              <Layers :size="12" class="text-slate-400" />
              <span class="text-slate-400">{{ row.layer }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="address" label="地址" min-width="200" />
        <ElTableColumn prop="coordinates" label="坐标" width="180">
          <template #default="{ row }">
            <span class="text-slate-400 font-mono text-xs">
              {{ row.coordinates[0].toFixed(6) }}, {{ row.coordinates[1].toFixed(6) }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <button
              @click="handleLocate(row)"
              class="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors"
            >
              <Navigation :size="14" />
              <span class="text-xs">定位</span>
            </button>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <div class="flex items-center justify-between p-4 border-t border-slate-700">
      <span class="text-sm text-slate-400">共 {{ filteredResults.length }} 条记录</span>
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredResults.length"
        layout="sizes, prev, pager, next"
        small
      />
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

:deep(.el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  box-shadow: none;
}

:deep(.el-input__inner) {
  color: #f1f5f9;
}

:deep(.el-select .el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.8);
}
</style>
