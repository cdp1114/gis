<script setup lang="ts">
import { ref } from 'vue';
import { User, Shield, Plus, Edit2, Trash2, Check } from 'lucide-vue-next';
import { ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElMessage, ElTree, ElTag } from 'element-plus';

const roles = ref([
  { id: '1', name: '管理员', code: 'admin', description: '系统管理员', permissions: ['layer:manage', 'data:import', 'user:manage', 'analysis:all'], createTime: '2024-01-15' },
  { id: '2', name: '普通用户', code: 'user', description: '普通操作用户', permissions: ['layer:view', 'map:query'], createTime: '2024-01-15' },
  { id: '3', name: '数据分析员', code: 'analyst', description: '数据分析人员', permissions: ['layer:view', 'analysis:all', 'stats:view'], createTime: '2024-02-20' }
]);

const showAddDialog = ref(false);
const showEditDialog = ref(false);
const editingRole = ref<any>(null);
const newRole = ref({ name: '', code: '', description: '', permissions: [] });

const permissionTree = ref([
  {
    label: '地图管理',
    id: 'map',
    children: [
      { label: '图层查看', id: 'layer:view' },
      { label: '图层管理', id: 'layer:manage' },
      { label: '地图查询', id: 'map:query' }
    ]
  },
  {
    label: '数据管理',
    id: 'data',
    children: [
      { label: '数据导入', id: 'data:import' },
      { label: '数据导出', id: 'data:export' }
    ]
  },
  {
    label: '空间分析',
    id: 'analysis',
    children: [
      { label: '缓冲区分析', id: 'analysis:buffer' },
      { label: '叠加分析', id: 'analysis:overlay' },
      { label: '全部分析', id: 'analysis:all' }
    ]
  },
  {
    label: '系统管理',
    id: 'system',
    children: [
      { label: '用户管理', id: 'user:manage' },
      { label: '角色管理', id: 'role:manage' },
      { label: '日志查看', id: 'log:view' }
    ]
  }
]);

const handleAddRole = () => {
  roles.value.push({
    id: String(Date.now()),
    ...newRole.value,
    createTime: new Date().toISOString().split('T')[0]
  });
  ElMessage.success('角色已添加');
  showAddDialog.value = false;
  newRole.value = { name: '', code: '', description: '', permissions: [] };
};

const handleEditRole = (role: any) => {
  editingRole.value = { ...role };
  showEditDialog.value = true;
};

const handleSaveEdit = () => {
  const index = roles.value.findIndex(r => r.id === editingRole.value.id);
  if (index > -1) {
    roles.value[index] = editingRole.value;
  }
  ElMessage.success('角色已更新');
  showEditDialog.value = false;
  editingRole.value = null;
};

const handleDeleteRole = (role: any) => {
  roles.value = roles.value.filter(r => r.id !== role.id);
  ElMessage.success('角色已删除');
};
</script>

<template>
  <div class="h-full bg-slate-900 p-6 overflow-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">角色管理</h1>
        <p class="text-slate-400 mt-1">管理系统角色和权限</p>
      </div>
      <ElButton type="primary" @click="showAddDialog = true">
        <Plus :size="16" class="mr-1" />
        新建角色
      </ElButton>
    </div>

    <div class="bg-slate-800 rounded-xl border border-slate-700">
      <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
        <Shield :size="16" class="text-blue-400" />
        <h2 class="text-white font-medium">角色列表</h2>
      </div>
      <ElTable :data="roles" stripe class="w-full">
        <ElTableColumn prop="name" label="角色名称" min-width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <Shield :size="14" class="text-blue-400" />
              <span class="text-white">{{ row.name }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="code" label="角色编码" width="120">
          <template #default="{ row }">
            <ElTag size="small">{{ row.code }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="description" label="描述" min-width="200" />
        <ElTableColumn prop="permissions" label="权限数量" width="100">
          <template #default="{ row }">
            <span class="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">{{ row.permissions.length }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="创建时间" width="120" />
        <ElTableColumn label="操作" width="200">
          <template #default="{ row }">
            <button
              @click="handleEditRole(row)"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-md transition-colors"
            >
              <Edit2 :size="14" />
              <span class="text-xs">编辑</span>
            </button>
            <button
              @click="handleDeleteRole(row)"
              class="ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-md transition-colors"
            >
              <Trash2 :size="14" />
              <span class="text-xs">删除</span>
            </button>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <ElDialog v-model="showAddDialog" title="新建角色" width="500px" class="layer-dialog">
      <ElForm :model="newRole" label-position="top">
        <ElFormItem label="角色名称" required>
          <ElInput v-model="newRole.name" placeholder="请输入角色名称" />
        </ElFormItem>
        <ElFormItem label="角色编码" required>
          <ElInput v-model="newRole.code" placeholder="请输入角色编码（英文）" />
        </ElFormItem>
        <ElFormItem label="角色描述">
          <ElInput v-model="newRole.description" placeholder="请输入角色描述" />
        </ElFormItem>
        <ElFormItem label="权限设置">
          <ElTree
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :default-checked-keys="newRole.permissions"
            @check-change="(checkedKeys: any) => newRole.permissions = checkedKeys"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleAddRole">确定</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="showEditDialog" title="编辑角色" width="500px" class="layer-dialog">
      <ElForm v-if="editingRole" :model="editingRole" label-position="top">
        <ElFormItem label="角色名称" required>
          <ElInput v-model="editingRole.name" />
        </ElFormItem>
        <ElFormItem label="角色描述">
          <ElInput v-model="editingRole.description" />
        </ElFormItem>
        <ElFormItem label="权限设置">
          <ElTree
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :default-checked-keys="editingRole.permissions"
            @check-change="(checkedKeys: any) => editingRole.permissions = checkedKeys"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showEditDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleSaveEdit">保存</ElButton>
      </template>
    </ElDialog>
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

:deep(.el-tree) {
  background-color: transparent;
}

:deep(.el-tree-node__label) {
  color: #cbd5e1;
}

:deep(.el-tree-node__children) {
  background-color: rgba(15, 23, 42, 0.5);
}
</style>
