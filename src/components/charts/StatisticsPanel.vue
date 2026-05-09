<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BarChart3, PieChart, TrendingUp, MapPin } from 'lucide-vue-next';
import * as echarts from 'echarts';

const barChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
const statsData = ref({
  total: 1256,
  today: 38,
  active: 1123,
  inactive: 133
});

onMounted(() => {
  if (barChartRef.value) {
    const barChart = echarts.init(barChartRef.value);
    barChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['设施', '道路', '区域', '管线', '标识'],
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155' } }
      },
      series: [{
        name: '数量',
        type: 'bar',
        data: [320, 280, 450, 156, 50],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#1d4ed8' }
          ])
        },
        barWidth: '50%'
      }]
    });
  }

  if (pieChartRef.value) {
    const pieChart = echarts.init(pieChartRef.value);
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: '#94a3b8' }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#1e293b',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        },
        data: [
          { value: 320, name: '设施类', itemStyle: { color: '#3b82f6' } },
          { value: 280, name: '道路类', itemStyle: { color: '#10b981' } },
          { value: 450, name: '区域类', itemStyle: { color: '#f59e0b' } },
          { value: 156, name: '管线类', itemStyle: { color: '#ef4444' } },
          { value: 50, name: '其他', itemStyle: { color: '#8b5cf6' } }
        ]
      }]
    });
  }
});
</script>

<template>
  <div class="h-full flex flex-col bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 overflow-hidden">
    <div class="flex items-center gap-2 p-4 border-b border-slate-700">
      <BarChart3 :size="18" class="text-blue-400" />
      <h3 class="text-white font-semibold">统计分析</h3>
    </div>

    <div class="flex-1 overflow-auto p-4 space-y-4">
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
          <div class="text-blue-200 text-sm mb-1">总数</div>
          <div class="text-white text-3xl font-bold">{{ statsData.total }}</div>
        </div>
        <div class="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-4">
          <div class="text-emerald-200 text-sm mb-1">今日新增</div>
          <div class="text-white text-3xl font-bold">{{ statsData.today }}</div>
        </div>
        <div class="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-4">
          <div class="text-amber-200 text-sm mb-1">活跃</div>
          <div class="text-white text-3xl font-bold">{{ statsData.active }}</div>
        </div>
        <div class="bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg p-4">
          <div class="text-slate-300 text-sm mb-1">停用</div>
          <div class="text-white text-3xl font-bold">{{ statsData.inactive }}</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-slate-700/50 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-4">
            <TrendingUp :size="16" class="text-blue-400" />
            <span class="text-white font-medium">要素数量统计</span>
          </div>
          <div ref="barChartRef" class="h-64"></div>
        </div>

        <div class="bg-slate-700/50 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-4">
            <PieChart :size="16" class="text-emerald-400" />
            <span class="text-white font-medium">类型分布</span>
          </div>
          <div ref="pieChartRef" class="h-64"></div>
        </div>
      </div>

      <div class="bg-slate-700/50 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-4">
          <MapPin :size="16" class="text-amber-400" />
          <span class="text-white font-medium">最近更新</span>
        </div>
        <div class="space-y-2">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between py-2 border-b border-slate-600/50 last:border-0">
            <div>
              <div class="text-slate-300">{{ ['朝阳区消防站', '海淀区公园', '东城区医院', '西城区学校', '丰台区商场'][i-1] }}</div>
              <div class="text-slate-500 text-sm">{{ ['设施点位', '区域边界', '设施点位', '区域边界', '设施点位'][i-1] }}</div>
            </div>
            <div class="text-slate-400 text-sm">{{ `${i}小时前` }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.echarts) {
  width: 100% !important;
  height: 100% !important;
}
</style>
