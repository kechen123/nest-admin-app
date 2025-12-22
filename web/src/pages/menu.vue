<template>
  <div style="background-color: #FFF;">
    ddd
  </div>
</template>
<script lang="ts" setup>
import axios from '@/utils/http/axios'
onMounted(() => {
  udpate()
})

const udpate = async () => {
  // const params = {
  //   fields: 'id,name,age',
  // }
  // await axios.get('/rs/table_list', {params})
  const res = await axios.post('/rs/table_update', {ids: 'qwe123,qwe321'})
  if (res.status === 200) {
    return true
  }
  return false
}
</script>

<style scoped>
.demo-pagination-block+.demo-pagination-block {
  margin-top: 10px;
}

.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}
</style>
