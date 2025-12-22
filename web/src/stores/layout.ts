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
    return { mainLayout }
  },
  // {
  //   persist: true,
  // },
)
