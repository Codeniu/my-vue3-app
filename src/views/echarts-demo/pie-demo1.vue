<template>
  <div ref="chartRef" style="width: 600px; height: 400px;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const option = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '年龄分布',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'outside',
        formatter: params => {
          return `${params.name}\n${params.value}人 | ${params.percent.toFixed(2)}%`;
        }
      },
      labelLine: {
        show: true
      },
      data: [
        { value: 54, name: '35岁以下' },
        { value: 165, name: '36-40岁' },
        { value: 189, name: '41-45岁' },
        { value: 105, name: '46-50岁' },
        { value: 89, name: '51-55岁' },
        { value: 76, name: '56岁以上' }
      ]
    }
  ],
  graphic: [
    {
      type: 'text',
      left: 'center',
      top: 'center',
      style: {
        text: '平均年龄\n49.58岁',
        textAlign: 'center',
        fill: '#000',
        fontSize: 20,
        fontWeight: 'bold'
      }
    }
  ]
};

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    chartInstance.setOption(option);
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<style scoped>
</style>