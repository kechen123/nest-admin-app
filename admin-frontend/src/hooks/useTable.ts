// 表格相关的组合式函数
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface TableOptions<T = any> {
  fetchData: (params: PaginationParams & any) => Promise<{
    list: T[];
    total: number;
  }>;
  immediate?: boolean;
  defaultPageSize?: number;
}

export function useTable<T = any>(options: TableOptions<T>) {
  const { fetchData, immediate = true, defaultPageSize = 10 } = options;

  const loading = ref(false);
  const tableData = ref<T[]>([]);
  const pagination = reactive({
    page: 1,
    pageSize: defaultPageSize,
    total: 0,
  });

  // 获取数据
  const getTableData = async (extraParams?: Record<string, any>) => {
    loading.value = true;
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...extraParams,
      };
      const response = await fetchData(params);
      tableData.value = response.list;
      pagination.total = response.total;
    } catch (error: any) {
      ElMessage.error(error.message || "获取数据失败");
    } finally {
      loading.value = false;
    }
  };

  // 页码变化
  const handlePageChange = (page: number) => {
    pagination.page = page;
    getTableData();
  };

  // 每页条数变化
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size;
    pagination.page = 1;
    getTableData();
  };

  // 刷新数据
  const refresh = (extraParams?: Record<string, any>) => {
    pagination.page = 1;
    getTableData(extraParams);
  };

  // 重置
  const reset = () => {
    pagination.page = 1;
    pagination.pageSize = defaultPageSize;
    getTableData();
  };

  if (immediate) {
    getTableData();
  }

  return {
    loading,
    tableData,
    pagination,
    getTableData,
    handlePageChange,
    handleSizeChange,
    refresh,
    reset,
  };
}
