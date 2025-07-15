<template>
  <div class="container">
    <div class="radio-button-group">
      <button
        v-for="option in options"
        :key="option"
        :class="['radio-button', { active: selectedOption === option }]"
        @click="selectedOption = option"
      >
        {{ option }}
      </button>
    </div>
    <div ref="chart" class="chart-container"></div>

    <LineBar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import LineBar from './echarts-demo/line-bar.vue'

const options = ['全省', '公司本部', '直属单位', '地市公司']
const selectedOption = ref('全省')
const chart = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null

const allData = {
  全省: {
    categories: ['三级正职', '三级副职', '四级正职', '四级副职', '五级正职', '五级副职'],
    values: [126, 217, 1597, 1658, 2372, 2741],
  },
  公司本部: {
    categories: ['三级正职', '三级副职', '四级正职', '四级副职', '五级正职', '五级副职'],
    values: [50, 80, 600, 700, 900, 1100],
  },
  直属单位: {
    categories: ['三级正职', '三级副职', '四级正职', '四级副职', '五级正职', '五级副职'],
    values: [30, 50, 400, 450, 600, 750],
  },
  地市公司: {
    categories: ['三级正职', '三级副职', '四级正职', '四级副职', '五级正职', '五级副职'],
    values: [46, 87, 597, 508, 872, 891],
  },
}

const initChart = () => {
  if (chart.value) {
    myChart = echarts.init(chart.value)
    updateChart(selectedOption.value)
  }
}

const updateChart = (option: string) => {
  const data = allData[option as keyof typeof allData]
  if (!myChart || !data) return

  const overallMaxValue = Math.max(...Object.values(allData).flatMap((d) => d.values))
  const xAxisMax = Math.ceil(overallMaxValue / 500) * 500 // Round up to nearest 500
  const backgroundData = data.values.map(() => xAxisMax)

  const optionConfig = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      max: xAxisMax,
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.65)',
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255,255,255,0.1)',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: data.categories,
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: true,
        color: 'rgba(141, 207, 248, 0.85)',
        verticalAlign: 'middle',
      },
      axisTick: {
        show: false, // 隐藏刻度线
      },
      splitLine: {
        show: false, // 隐藏网格线
      },
    },
    series: [
      {
        type: 'bar',
        data: backgroundData,
        barWidth: 28,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: 'rgba(255, 255, 255, 0.1)' },
            { offset: 1, color: 'rgba(255, 255, 255, 0.05)' },
          ]),
          borderRadius: [0, 0, 0, 0],
        },
        barGap: '-20%',
        z: 1,
        tooltip: { show: false },
      },
      {
        name: '数量',
        type: 'bar',
        data: data.values,
        barWidth: 16,
        barGap: '-80%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#43b4e8' },
            { offset: 1, color: '#2376b7' },
          ]),
          borderRadius: [0, 8, 8, 0],
        },
        label: {
          show: true,
          position: 'right',
          color: 'rgba(255, 255, 255, 0.65)',
        },
        z: 2,
      },
    ],
  }

  myChart.setOption(optionConfig)
}

onMounted(() => {
  initChart()
})

watch(selectedOption, (newValue) => {
  updateChart(newValue)
})

window.addEventListener('resize', () => {
  myChart?.resize()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100vh;
  padding-top: 20px;
  background-color: #0a2e5d; /* Dark blue background */
}

.radio-button-group {
  display: flex;
  padding-bottom: 5px;
}

.radio-button {
  background: linear-gradient(0deg, rgba(23, 125, 220, 1) 0%, rgba(22, 76, 126, 1) 100%);
  border: 2px solid #2a8dff;
  border-radius: 8px 8px 0 0;
  color: white;
  padding: 10px 20px;
  margin: 0 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease-in-out;
  position: relative;
  outline: none;
}

.radio-button:hover {
  background: linear-gradient(to bottom, #2988e1, #1a6ab3);
}

.radio-button.active {
  background: linear-gradient(180deg, rgba(97, 212, 252, 1) 0%, rgba(23, 125, 220, 1) 100%);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    inset 0 0 5px rgba(255, 255, 255, 0.4);
}

.radio-button.active::after {
  content: '';
  position: absolute;
  bottom: -7px; /* Position it below the button, aligned with the container's border */
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 3px;
  background-color: #fff;
  border-radius: 2px;
}

.chart-container {
  width: 80%;
  height: 400px;
  margin-top: 20px;
}
</style>
