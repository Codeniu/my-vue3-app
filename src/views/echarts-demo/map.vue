<template>
  <div class="chart-wrapper">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import henan from './henan.json' // Import GeoJSON

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const data = [
  { name: '郑州市', value: 862 },
  { name: '洛阳市', value: 564 },
  { name: '平顶山市', value: 836 },
  { name: '焦作市', value: 176 },
  { name: '新乡市', value: 236 },
  { name: '安阳市', value: 830 },
  { name: '濮阳市', value: 724 },
  { name: '许昌市', value: 824 },
  { name: '漯河市', value: 325 },
  { name: '三门峡市', value: 550 },
  { name: '南阳市', value: 542 },
  { name: '商丘市', value: 323 },
  { name: '信阳市', value: 641 },
  { name: '周口市', value: 325 },
  { name: '驻马店市', value: 672 },
  { name: '鹤壁市', value: 103 },
  { name: '济源市', value: 550 },
]

onMounted(() => {
  if (chartRef.value) {
    echarts.registerMap('henan', henan as any)
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(option)
    window.addEventListener('resize', resizeChart)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})

function resizeChart() {
  chartInstance?.resize()
}

const option = {
  backgroundColor: '#0a2e5d',
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      return `${params.name}<br/>${params.value}`
    },
  },
  visualMap: {
    min: 100,
    max: 500,
    left: 'right',
    bottom: 'bottom',
    text: ['高', '低'],
    calculable: true,
    inRange: {
      color: ['#2a76c2', '#3c98aa', '#5ab59b', '#89d080', '#b2e26e'],
    },
    textStyle: {
      color: '#fff',
    },
  },
  series: [
    {
      name: '河南地图',
      type: 'map',
      map: 'henan',
      roam: true,
      label: {
        show: true,
        formatter: '{b}\n{c}',
        color: '#fff',
      },
      itemStyle: {
        areaColor: '#2a76c2',
        borderColor: '#0a2e5d',
        borderWidth: 2,
      },
      emphasis: {
        label: { show: true },
        itemStyle: {
          areaColor: '#5ab59b',
        },
      },
      data: data,
    },
  ],
}
</script>

<style scoped>
.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #0a2e5d;
}

.chart-container {
  width: 800px;
  height: 600px;
}
</style>