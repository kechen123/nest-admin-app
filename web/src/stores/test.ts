export const useTestStore = defineStore(
  'test',
  () => {
    const router = useRouter()
    const matched = router.currentRoute.value.matched
    const routerVal = router.currentRoute.value

    const someState = '你好 setup'
    return { someState }
  },
  {
    persist: true
  }
)
