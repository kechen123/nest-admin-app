<template>
  <div class="container">
    <div class="card-list">
      <el-card class="box-card" v-for="(item, index) in totals">
        <div class="card">
          <div class="logo">
            <component :is="svg[index]"></component>
          </div>
          <div class="info">
            <span class="title">{{ item.name }}</span>
            <p class="desc">{{ item.value }}</p>
          </div>
        </div>
      </el-card>
    </div>
    <div class="line" ref="line"></div>
    <div class="charts">
      <div class="radar" ref="radar"></div>
      <div class="pie" ref="pie"></div>
      <div class="bar" ref="bar"></div>
    </div>
  </div>
</template>

<script setup lang="ts">

import * as echarts from 'echarts';
import axios from '@/utils/http/axios'
import Empty from '@/assets/svg/empty-box.svg'
import Growth from '@/assets/svg/growth.svg'
import Concept from '@/assets/svg/concept.svg'

console.log(import.meta.env.VITE_APP_BASE_API)

const svg = [Empty, Growth, Concept, Growth]

const totals: any = ref([])
const loading = ref(true)
const line = ref<HTMLElement>()
const radar = ref<HTMLElement>()
const pie = ref<HTMLElement>()
const bar = ref<HTMLElement>()
const lineChart = ref<echarts.ECharts>()
const radarChart = ref<echarts.ECharts>()
const pieChart = ref<echarts.ECharts>()
const barChart = ref<echarts.ECharts>()

onMounted(() => {
  getPageData()
})

onBeforeUnmount(() => {
  lineChart.value?.dispose()
  radarChart.value?.dispose()
  pieChart.value?.dispose()
  barChart.value?.dispose()
})

const getPageData = () => {
  axios.post('/rs/home',).then((res: any) => {
    loading.value = false
    if (res.status === 200) {
      totals.value = res.data.totals
      initLine(res.data.line)
      initRadar(res.data.radar)
      initPie(res.data.pie)
      initBar(res.data.bar)
    } else {
      console.log('error /rs/home!')
    }
  })
}
const initLine = (series: []) => {
  const chart = (lineChart.value = echarts.init(line.value));
  const option = {
    title: {
      text: 'Stacked Line'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series
  };
  chart.setOption(option);
}

const initRadar = (series: []) => {
  const chart = (radarChart.value = echarts.init(radar.value));
  const option = {
    title: {
      text: 'Basic Radar Chart'
    },
    radar: {
      indicator: [
        { name: 'Sales' },
        { name: 'Administration' },
        { name: 'Information Technology' },
        { name: 'Customer Support' },
        { name: 'Development' },
        { name: 'Marketing' }
      ]
    },
    series: [{
      name: 'Budget vs spending',
      type: 'radar',
      data: series
    }]
  }
  chart.setOption(option);
}

const initPie = (series: []) => {
  const chart = (pieChart.value = echarts.init(pie.value));
  const option = {
    toolbox: {
      show: false,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    series: [
      {
        name: 'Radius Mode',
        type: 'pie',
        radius: [20, 140],
        center: ['50%', '50%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 5
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true
          }
        },
        data: series
      }

    ]
  }
  chart.setOption(option);
}

const initBar = (series: []) => {
  const chart = (barChart.value = echarts.init(bar.value));
  const option = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: series,
        type: 'bar'
      }
    ]
  }
  chart.setOption(option);
}

</script>

<style scoped lang="less">
.container {
  .card-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-column-gap: 20px;
    margin: 0 auto;
    width: 100%;



    .box-card {
      width: 100%;
      display: flex;
      align-items: center;

      --el-card-bg-color: var(--gray-90);

      .card {
        display: flex;
        align-items: center;

        .logo {
          width: 60px;
          height: 60px;
          background-color: #eee;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info {
          margin-left: 20px;

          .title {
            font-size: 20px;
            font-weight: bold;
          }

          .desc {
            font-size: 14px;
            color: #999;
          }
        }
      }
    }
  }

  .line {
    width: 100%;
    height: 350px;
    background-color: #fff;
    padding: 20px;
    margin-top: 20px;
  }

  .charts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-column-gap: 20px;
    height: 350px;
    margin-top: 20px;

    .radar,
    .pie,
    .bar {
      width: 100%;
      height: 100%;
      background-color: #fff;
      padding: 20px;
    }
  }
}
</style>
<route lang="json">{
  "meta": {
    "requiresAuth": false
  }
}</route>
