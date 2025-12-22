import { useRouterStore } from '@/stores/router'

interface Tag {
  name: string
  path: string
  key: string
}

type TagList = Tag[]

const findNode = (func: (node: any) => boolean, tree: any) => {
  for (const node of tree) {
    if (func(node)) return node
    if (node.children) {
      const res = findNode(func, node.children) as any
      if (res) return res
    }
  }
  return null
}

export const useTagsStore = defineStore(
  'tags',
  () => {
    const router = useRouter()
    const routerSotre = useRouterStore()
    const matched = router.currentRoute.value.matched
    const routerVal = router.currentRoute.value
    const menu = routerSotre.roles
    const getActive = () => {
      let name: any = '404',
        path = '/404',
        key = '/404'
      if (matched.length > 1) {
        const node = findNode((node) => {
          return node.path === routerVal.path
        }, menu)
        if (node) {
          name = node.title
          path = node.path
          key = node.path
        }
      }
      return {
        name,
        path,
        key,
      }
    }
    const active = ref<Tag>(getActive())
    const tags = ref<TagList>([getActive()])

    const addTag = (path: string) => {
      const node = findNode((node) => {
        return node.path === path
      }, menu)
      let tag = {
        name: '404',
        path: '/404',
        key: '/404',
      }
      if (node) {
        tag = {
          name: node.title,
          path: node.path,
          key: node.path,
        }
      }
      if (tags.value.findIndex((item) => item.path === tag.path) === -1) {
        tags.value.push(tag)
      }
      active.value = tag
    }

    const changeTag = (path: string) => {
      const tag = tags.value.find((item) => item.path === path)
      if (tag) {
        active.value = tag
      }
    }

    const removeTag = (path: string) => {
      let index = tags.value.findIndex((item) => item.name === path)
      if (index < 0) return
      tags.value.splice(index, 1)
      if (index > tags.value.length - 1) {
        index = tags.value.length - 1
      }
      active.value = tags.value[index]
      router.push(tags.value[index].path)
    }

    return { tags, active, addTag, changeTag, removeTag }
  },
  // {
  //   persist: true
  // }
)
