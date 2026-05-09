<script setup lang="ts">
import { ref, computed } from 'vue';
import { UserPlus, Edit2, Trash2, Search, User, Shield } from 'lucide-vue-next';
import { ElTable, ElTableColumn, ElButton, ElInput, ElTag, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElMessage } from 'element-plus';

const searchKeyword = ref('');
const showDialog = ref(false);
const editingUser = ref<any>(null);

const userList = ref([
  { id: '1', username: 'admin', email: 'admin@example.com', role: '管理员', status: 1, createTime: '2026-01-01' },
  { id: '2', username: 'operator', email: 'operator@example.com', role: '运维人员', status: 1, createTime: '2026-02-15' },
  { id: '3', username: 'viewer', email: 'viewer@example.com', role: '业务人员', status: 1, createTime: '2026-03-20' }
]);

const formData = ref({
  username: '',
  email: '',
  role: '',
  password: ''
});

const filteredUsers = computed(() => {
  return userList.value.filter(user =>
    !searchKeyword.value ||
    user.username.includes(searchKeyword.value) ||
    user.email.includes(searchKeyword.value)
  );
});

const handleAdd = () => {
  editingUser.value = null;
  formData.value = { username: '', email: '', role: '', password: '' };
  showDialog.value = true;
};

const handleEdit = (row: any) => {
  editingUser.value = row;
  formData.value = { ...row, password: '' };
  showDialog.value = true;
};

const handleDelete = (row: any) => {
  userList.value = userList.value.filter(u => u.id !== row.id);
  ElMessage.success('删除成功');
};

const handleSave = () => {
  if (editingUser.value) {
    const index = userList.value.findIndex(u => u.id === editingUser.value.id);
    if (index > -1) {
      userList.value[index] = { ...userList.value[index], ...formData.value };
    }
    ElMessage.success('更新成功');
  } else {
    userList.value.push({
      id: String(Date.now()),
      ...formData.value,
      status: 1,
      createTime: new Date().toISOString().split('T')[0]
    });
    ElMessage.success('添加成功');
  }
  showDialog.value = false;
};
</script>

<template>
  <div class="h-full bg-slate-900 p-6 overflow-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">用户管理</h1>
        <p class="text-slate-400 mt-1">管理系统用户账号</p>
      </div>
      <ElButton type="primary" @click="handleAdd">
        <UserPlus :size="16" class="mr-1" />
        添加用户
      </ElButton>
    </div>

    <div class="mb-6">
      <ElInput v-model="searchKeyword" placeholder="搜索用户名或邮箱" class="max-w-md">
        <template #prefix>
          <Search :size="16" class="text-slate-400" />
        </template>
      </ElInput>
    </div>

    <div class="bg-slate-800 rounded-xl border border-slate-700">
      <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
        <User :size="16" class="text-blue-400" />
        <h2 class="text-white font-medium">用户列表</h2>
      </div>
      <ElTable :data="filteredUsers" stripe class="w-full">
        <ElTableColumn prop="username" label="用户名" width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {{ row.username.charAt(0).toUpperCase() }}
              </div>
              <span class="text-white">{{ row.username }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="email" label="邮箱" min-width="200" />
        <ElTableColumn prop="role" label="角色" width="120">
          <template #default="{ row }">
            <ElTag size="small" type="info">{{ row.role }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" width="100">
          <template #default="{ row }">
            <ElTag size="small" :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="创建时间" width="120" />
        <ElTableColumn label="操作" width="160">
          <template #default="{ row }">
            <div class="flex gap-2">
              <button 
                @click="handleEdit(row)" 
                class="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors"
              >
                <Edit2 :size="14" />
                <span class="text-xs">编辑</span>
              </button>
              <button 
                @click="handleDelete(row)" 
                class="flex items-center gap-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
              >
                <Trash2 :size="14" />
                <span class="text-xs">删除</span>
              </button>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <ElDialog v-model="showDialog" :title="editingUser ? '编辑用户' : '添加用户'" width="500px" class="layer-dialog">
      <ElForm :model="formData" label-position="top">
        <ElFormItem label="用户名">
          <ElInput v-model="formData.username" placeholder="请输入用户名" />
        </ElFormItem>
        <ElFormItem label="邮箱">
          <ElInput v-model="formData.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="角色">
          <ElSelect v-model="formData.role" placeholder="请选择角色" class="w-full">
            <ElOption label="管理员" value="管理员" />
            <ElOption label="运维人员" value="运维人员" />
            <ElOption label="业务人员" value="业务人员" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem v-if="!editingUser" label="密码">
          <ElInput v-model="formData.password" type="password" placeholder="请输入密码" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleSave">确定</ElButton>
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
</style>
