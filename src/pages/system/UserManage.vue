<script setup lang="ts">
import { ref, computed } from 'vue';
import { UserPlus, Edit2, Trash2, Search, Shield } from 'lucide-vue-next';
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
  <div class="h-full flex flex-col bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700">
    <div class="flex items-center justify-between p-4 border-b border-slate-700">
      <div class="flex items-center gap-2">
        <Shield :size="18" class="text-blue-400" />
        <h3 class="text-white font-semibold">用户管理</h3>
      </div>
      <button @click="handleAdd" class="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm transition-colors">
        <UserPlus :size="14" />
        <span>添加用户</span>
      </button>
    </div>

    <div class="p-4 border-b border-slate-700">
      <ElInput v-model="searchKeyword" placeholder="搜索用户名或邮箱" class="max-w-md">
        <template #prefix>
          <Search :size="16" class="text-slate-400" />
        </template>
      </ElInput>
    </div>

    <div class="flex-1 overflow-auto p-4">
      <ElTable :data="filteredUsers" stripe>
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
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <button @click="handleEdit(row)" class="p-1 hover:bg-slate-600 text-slate-400 hover:text-white rounded transition-colors">
                <Edit2 :size="14" />
              </button>
              <button @click="handleDelete(row)" class="p-1 hover:bg-red-600 text-slate-400 hover:text-white rounded transition-colors">
                <Trash2 :size="14" />
              </button>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <ElDialog v-model="showDialog" :title="editingUser ? '编辑用户' : '添加用户'" width="500px" class="user-dialog">
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
.user-dialog :deep(.el-dialog) {
  background: #1e293b;
  border: 1px solid #334155;
}
.user-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #334155;
}
.user-dialog :deep(.el-dialog__title) {
  color: #f1f5f9;
}
.user-dialog :deep(.el-form-item__label) {
  color: #cbd5e1;
}
.user-dialog :deep(.el-input__wrapper) {
  background: #0f172a;
  border: 1px solid #334155;
}
.user-dialog :deep(.el-input__inner) {
  color: #f1f5f9;
}
</style>
