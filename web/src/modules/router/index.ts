// import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router/auto'
// import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router/auto'

import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

import { setupLayouts } from 'virtual:generated-layouts'
import { Auth, NotCheckRouter } from './permission'

// import { createRouter, createWebHistory } from 'vue-router'
// import DefaultLayout from '@/components/layouts/default.vue'
// import CustomLayout from '@/components/layouts/custom.vue'
// import Index from '@/pages/index.vue'
// import Login from '@/pages/login.vue'
// import Menu from '@/pages/menu.vue'
// import NotFound from '@/pages/[...404].vue'
// const routes = [
//   {
//     path: '/',
//     component: DefaultLayout,
//     children: [
//       {
//         path: '',
//         name: 'index',
//         component: Index
//       },
//       {
//         path: 'menu',
//         name: 'menu',
//         component: Menu
//       },
//       {
//         path: 'about',
//         name: 'about',
//         component: () => import('@/pages/about.vue')
//       }
//     ]
//   },
//   {
//     path: '/login',
//     name: 'login',
//     component: Login
//   },
// ]

// export const router = createRouter({
//   history: createWebHistory(),
//   routes
// })

// function recursiveLayouts(route: RouteRecordRaw): RouteRecordRaw {
//   if (route.children) {
//     for (let i = 0; i < route.children.length; i++) {
//       route.children[i] = recursiveLayouts(route.children[i])
//     }
//     return route
//   }

//   return setupLayouts([route])[0]
// }
console.log(routes)
export const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(routes),
})

// console.log('router', router.getRoutes())
// 在路由跳转前，检查用户是否有权限访问该路由
router.beforeEach(async (to, from) => {
  let b: boolean | Object = false
  for (const fn of Auth) {
    if (NotCheckRouter.indexOf(to.name?.toString() || '') > -1) {
      break
    }
    b = await fn({ to, from, router })
    if (b) {
      break
    }
  }
  if (b) return b
})

if (import.meta.hot) {
  handleHotUpdate(router)
}
export default router
