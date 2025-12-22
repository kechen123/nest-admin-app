export {}

declare global {
  type Resize = {
    realTimeWidth: number
    downWidth: number
    minWidth: number
    show?: boolean
  }

  type MainLayout = {
    contentLayout: Resize
    rightLayout: Resize & {
      minWidth: number
    }
  }

  interface FlatNode {
    id: string
    name: string
    parentId: string | null
    [key: string]: any
  }

  interface TreeNode extends FlatNode {
    children?: TreeNode[]
  }
}
