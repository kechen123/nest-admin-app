export const useLayoutStore = defineStore(
  'layout',
  () => {
    const mainLayout = reactive<MainLayout>({
      contentLayout: {
        realTimeWidth: 0,
        downWidth: 0,
        minWidth: 400,
        show: true,
      },
      rightLayout: {
        realTimeWidth: 0,
        downWidth: 0,
        minWidth: 400,
        show: false,
      },
    })

    // 侧边栏折叠状态
    const isCollapse = ref(false)

    // 切换侧边栏折叠状态
    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value
    }

    return { mainLayout, isCollapse, toggleCollapse }
  },
  // {
  //   persist: true,
  // },
)
