<template>
  <el-card class="tableSearch">
    <el-form label-position="right" :model="searchData" class="searchForm">
      <el-form-item label="名称" width="200">
        <el-input v-model="searchData.name" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="searchData.type" placeholder="请选择" clearable>
          <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchData.status" placeholder="请选择" clearable>
          <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="searchData.create_time" value-format="YYYY/MM/DD" type="daterange" range-separator="To"
          start-placeholder="起始时间" end-placeholder="结束时间" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="querySearch">Query</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { useSearch, Option } from '@/hooks/useTable'
interface Props {
  typeList: Option[]
  statusList: Option[]
}
const { typeList, statusList } = defineProps<Props>()

const emit = defineEmits(['getPageData'])

const { searchData } = useSearch()


const querySearch = () => {
  emit('getPageData', searchData)
}
</script>

<style scoped lang="less">
.tableSearch {

  .searchForm {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;

    .el-form-item {
      margin-bottom: 0;

      &:last-child {
        // margin-left: auto;
      }
    }


    :deep(.el-input) {
      width: 200px;
    }

    :deep(.el-form-item__label) {
      width: 80px;
    }
  }

}
</style>
