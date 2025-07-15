<template>
  <div class="chart-wrapper">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const data = [
  { value: 59278, name: '地市公司' },
  { value: 4402, name: '直属单位' },
  { value: 375, name: '公司本部' },
]

const option = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    itemGap: 20,
    textStyle: {
      color: '#fff',
      rich: {
        name: {
          fontSize: 14,
          color: '#fff',
          width: 80,
        },
        value: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#fff',
          width: 60,
          align: 'right',
        },
      },
    },
    formatter: (name: string) => {
      const item = data.find((d) => d.name === name)
      return `{name|${name}}{value|${item?.value}}`
    },
  },
  series: [
    // Main Pie Chart
    {
      name: '数据分布',
      type: 'pie',
      radius: ['50%', '65%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
      },
      labelLine: {
        show: false,
      },
      data: data,
      color: ['#00b8a9', '#f6d55c', '#3f51b5'],
    },
    // Outer decorative ring
    {
      type: 'gauge',
      radius: '75%',
      center: ['50%', '50%'],
      startAngle: 215,
      endAngle: -35,
      splitNumber: 10,
      axisLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: [[1, 'rgba(0, 184, 169, 0.3)']],
        },
      },
      axisLabel: { show: false },
      axisTick: {
        show: true,
        splitNumber: 5,
        lineStyle: {
          color: 'rgba(0, 184, 169, 0.8)',
          width: 1,
        },
        length: -6,
      },
      splitLine: {
        show: true,
        length: -12,
        lineStyle: {
          color: 'rgba(0, 184, 169, 0.8)',
        },
      },
      detail: { show: false },
      pointer: { show: false },
      silent: true,
    },
    // Inner icon placeholder
    {
        name: 'icon',
        type: 'pie',
        radius: ['35%', '38%'],
        center: ['50%', '50%'],
        silent: true,
        data: [{ value: 100, name: '' }],
        itemStyle: {
            color: 'rgba(0, 184, 169, 0.3)',
        },
        label: {
            show: true,
            position: 'center',
            formatter: '{building|}',
            rich: {
                building: {
                    backgroundColor: {
                        image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZpbGw9IiMwMGI4YTkiPjxwYXRoIGQ9Ik05NDYgNDk0bC00MzQgMGwtMTYgNDM2bDQ1MCAwbDAgLTM4MWMwIC0yOSAtMjQgLTUzIC01MyA1M2wtNDcgMHoiLz48cGF0aCBkPSJNOTQ2IDQzNmMwIDI5IC0yNCA1MyAtNTMgNTNsLTQ3IDBsLTE2IC00MzZsNDUwIDBjMjkgMCA1MyAyNCA1MyA1M2wwIDMyOHoiIHRyYW5zZm9ybT0icm90YXRlKDE4MCA3MDggMjYxKSIvPjxwYXRoIGQ9Ik04OTYgODY0aC0xNjh2LTQ4YzAtNC40LTMuNi04LTgtOGgtNTZjLTQuNCAwLTggMy42LTggOHY0OGgtMTY4di00OGMwLTQuNC0zLjYtOC04LThoLTY0Yy00LjQgMC04IDMuNi04IDh2NDhoLTE2Yy00LjQgMC04IDMuNi04IDh2NTZjMCA0LjQgMy42IDggOCA4aDUwNGM0LjQgMCA4LTMuNiA4LTh2LTU2YzAtNC40LTMuNi04LTgtOHptLTI0MCAzMmMtMTcuNyAwLTMyLTE0LjMtMzItMzJzMTQuMy0zMiAzMi0zMnMxNy43IDAgMzIgMTQuMyAzMiAzMnMtMTQuMyAzMi0zMiAzMnpNNDY0IDBoNjR2NDhjMCA0LjQgMy42IDggOCA4aDE2OHYxMDQuMTg4bDg4LjE4OCA4OC4xODhjMy4xMjUgMy4xMjUgMy4xMjUgOC4xODggMCAxMS4zMTNsLTg4LjE4OCA4OC4xODh2MTA0LjE4OGgtMTY4di00OGMwLTQuNC0zLjYtOC04LThoLTY0Yy00LjQgMC04IDMuNi04IDh2NDhIMTgwVjU4NGgxNjh2NDhjMCA0LjQgMy42IDggOCA4aDY0YzQuNCAwIDgtMy42IDgtOHYtNDhoMTY4VjI4OEgxODBWMTYwaDI4NHY0OGMwIDQuNCAzLjYgOCA4IDhoNjRjNC40IDAgOC0zLjYgOC04VjB6TTI0MCAyODhoMTg0djY0SDI0MHYtNjR6bTAgMTI4aDE4NHY2NEgyNDB2LTY0em0wIDEyOGgxODR2NjRIMjQwdjY0em0yNDggMGg2NHY2NGgtNjR2LTY0em0wLTEyOGg2NHY2NGgtNjR2LTY0em0wLTEyOGg2NHY2NGgtNjR2LTY0eiIvPjwvc3ZnPg==',
                    },
                    height: 50,
                    width: 50,
                },
            },
        },
        animation: false,
    },
  ],
}

onMounted(() => {
  if (chartRef.value) {
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
</script>

<style scoped>
.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background-color: #0a2e5d;
}

.chart-container {
  width: 600px;
  height: 400px;
}
</style>
