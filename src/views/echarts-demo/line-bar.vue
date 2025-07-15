<template>
  <div class="employee-chart-container">
    <div ref="chart" class="employee-chart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { onMounted, ref } from 'vue'

export default {
  setup() {
    const chart = ref(null)

    onMounted(() => {
      initChart()
    })

    const max = [100, 100, 100, 100, 100]
    const value = [50, 50, 50, 50, 23]

    const initChart = () => {
      const myChart = echarts.init(chart.value)

      const option1 = {
        backgroundColor: '#0a1a35', // 深蓝色背景
        tooltip: {
          show: false,
        },
        grid: {
          top: 0,
          left: '10%',
          right: '10%',
          bottom: 0,
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitArea: {
            show: false,
          },
        },
        yAxis: {
          type: 'category',
          axisLabel: {
            show: true,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          data: [
            '一级职员',
            '二级职员',
            '三级职员',
            '四级职员',
            '五级职员',
            '六级职员',
            '七级职员',
            '八级职员',
          ],
        },

        series: [
          {
            type: 'pictorialBar',
            symbol: 'rect',
            symbolRepeat: 'fixed',
            symbolClip: true,
            symbolSize: [10, 35],
            symbolMargin: 3,
            symbolBoundingData: max,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: 'rgba(60, 154, 232, 1)' },
                { offset: 1, color: 'rgba(22, 76, 126, 1)' },
              ]),
            },
            label: {
              show: false,
            },
            data: max,
            animation: false,
            z: 1,
          },
          {
            name: 'bar',
            type: 'pictorialBar',
            symbol: 'rect',
            symbolRepeat: true,
            symbolSize: [10, 35],
            symbolMargin: 3,
            symbolBoundingData: max,
            data: value,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: 'rgba(132, 226, 216, 1)' },
                { offset: 1, color: 'rgba(48, 178, 173, 1)' },
              ]),
            },
            z: 2,
            label: {
              show: true,
              textStyle: {
                color: '#18fcff',
                fontSize: 14,
              },
              position: 'right',
              offset: [135, 0],
            },
            showBackground: true,
            backgroundStyle: {
              color: 'red',
            },
          },
        ],
      }

      const option = {
        backgroundColor: '#0C1C35',
        grid: {
          top: '0%',
          left: '2%',
          right: '2%',
          bottom: '0%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
          splitLine: {
            show: false,
          },
          offset: 10,
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
        yAxis: {
          show: false,
          type: 'category',
          inverse: false,
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            inside: true,
          },
        },
        series: [
          {
            name: 'lineBar',
            type: 'bar',
            barWidth: '36px',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0.5, 0, 0.5, 1, [
                { offset: 0, color: 'rgba(132, 226, 216, 1)' },
                { offset: 1, color: 'rgba(48, 178, 173, 1)' },
              ]),
              borderRadius: [4, 0, 0, 4],
            },
            z: 2,
            data: value,

            // 背景
            showBackground: true,
            backgroundStyle: {
              color: new echarts.graphic.LinearGradient(0.5, 0, 0.5, 1, [
                { offset: 0, color: 'rgba(60, 154, 232, 1)' },
                { offset: 1, color: 'rgba(22, 76, 126, 1)' },
              ]),
              opacity: 0.2,
            },
          },
          // 添加分隔符
          {
            type: 'pictorialBar',
            itemStyle: {
              color: '#0C1C35',
            },
            symbolRepeat: 'fixed',
            symbolMargin: 6,
            symbol: 'rect',
            symbolClip: true,
            symbolSize: [6, 36],
            symbolPosition: 'start',
            symbolOffset: [-6, 0],
            data: [100, 100, 100, 100, 100],
            width: 10,
            z: 1,
            zlevel: 1,
          },
        ],
      }

      myChart.setOption(option)

      // 响应式调整
      window.addEventListener('resize', function () {
        myChart.resize()
      })
    }

    return {
      chart,
    }
  },
}
</script>

<style scoped>
.employee-chart-container {
  width: 100%;
  height: 500px;
}
.employee-chart {
  width: 100%;
  height: 100%;
}
</style>
