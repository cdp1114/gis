<script setup lang="ts">import { ref } from 'vue';
import { BarChart3, PieChart, TrendingUp, MapPin } from 'lucide-vue-next';
import StatisticsPanel from '@/components/charts/StatisticsPanel.vue';
import * as echarts from 'echarts';
import { onMounted, ref as eRef } from 'vue';
const barChartRef = eRef<HTMLDivElement | null>(null);
const pieChartRef = eRef<HTMLDivElement | null>(null);
const statsCards = ref([
 { title: '总图层数', value: 24, icon: MapPin, color: 'blue' },
 { title: '要素总数', value: 12580, icon: BarChart3, color: 'emerald' },
 { title: '分析任务', value: 156, icon: TrendingUp, color: 'amber' },
 { title: '活跃用户', value: 89, icon: PieChart, color: 'rose' }
]);
const categoryData = ref([
 { name: '设施点位', value: 4200, percentage: 33.4 },
 { name: '区域边界', value: 3800, percentage: 30.2 },
 { name: '道路网络', value: 3100, percentage: 24.6 },
 { name: '其他', value: 1480, percentage: 11.8 }
]);
onMounted(() => {
 if (barChartRef.value) {
 const barChart = echarts.init(barChartRef.value);
 barChart.setOption({
 tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
 grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
 xAxis: {
 type: 'category',
 data: ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '石景山区'],
 axisLine: { lineStyle: { color: '#475569' } },
 axisLabel: { color: '#94a3b8' }
 },
 yAxis: {
 type: 'value',
 axisLine: { lineStyle: { color: '#475569' } },
 axisLabel: { color: '#94a3b8' }
 },
 series: [
 {
 name: '设施数量',
 type: 'bar',
 data: [1200, 980, 750, 620, 580, 420],
 itemStyle: {
 color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
 { offset: 0, color: '#3b82f6' },
 { offset: 1, color: '#1d4ed8' }
 ]),
 borderRadius: [4, 4, 0, 0]
 }
 }
 ]
 });
 }
 if (pieChartRef.value) {
 const pieChart = echarts.init(pieChartRef.value);
 pieChart.setOption({
 tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
 series: [
 {
 name: '要素分类',
 type: 'pie',
 radius: ['40%', '70%'],
 center: ['50%', '50%'],
 avoidLabelOverlap: false,
 itemStyle: {
 borderRadius: 8,
 borderColor: '#1e293b',
 borderWidth: 2
 },
 label: { show: false, position: 'center' },
 emphasis: {
 label: { show: true, fontSize: 18, fontWeight: 'bold', color: '#fff' }
 },
 labelLine: { show: false },
 data: [
 { value: 4200, name: '设施点位', itemStyle: { color: '#3b82f6' } },
 { value: 3800, name: '区域边界', itemStyle: { color: '#10b981' } },
 { value: 3100, name: '道路网络', itemStyle: { color: '#f59e0b' } },
 { value: 1480, name: '其他', itemStyle: { color: '#6b7280' } }
 ]
 }
 ]
 });
 }
});
</script>

<template>
  <div class="h-full bg-slate-900 p-6 overflow-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">统计分析</h1>
        <p class="text-slate-400 mt-1">空间数据统计与可视化分析</p>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div
        v-for="card in statsCards"
        :key="card.title"
        class="bg-slate-800 rounded-xl border border-slate-700 p-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-sm">{{ card.title }}</p>
            <p class="text-2xl font-bold text-white mt-1">{{ card.value.toLocaleString() }}</p>
          </div>
          <div :class="['p-3 rounded-lg', `bg-${card.color}-500/20`]">
            <component :is="card.icon" :size="24" :class="`text-${card.color}-400`" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 mb-6">
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div class="flex items-center gap-2 mb-4">
          <BarChart3 :size="18" class="text-blue-400" />
          <h3 class="text-white font-medium">区域设施分布</h3>
        </div>
        <div ref="barChartRef" class="h-64"></div>
      </div>

      <div class="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div class="flex items-center gap-2 mb-4">
          <PieChart :size="18" class="text-emerald-400" />
          <h3 class="text-white font-medium">要素分类占比</h3>
        </div>
        <div ref="pieChartRef" class="h-64"></div>
      </div>
    </div>

    <div class="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <StatisticsPanel />
    </div>
  </div>
</template>
