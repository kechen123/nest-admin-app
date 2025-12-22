<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, defineProps } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{ options: echarts.EChartsOption }>()
const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(props.options)
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chartInstance?.resize())
})

watch(() => props.options, (newVal) => {
  chartInstance?.setOption(newVal)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => chartInstance?.resize())
  chartInstance?.dispose()
})
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 300px;"></div>
</template>
