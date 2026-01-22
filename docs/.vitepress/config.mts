import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "yl",
  description: "基于 Docker 的现代化全栈开发解决方案",
  base: '/nest-admin-app/',
  ignoreDeadLinks: true, // 忽略死链接检查（文档中包含 localhost 示例链接）
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/introduction' },
      { text: '前端', link: '/frontend/' },
      { text: '后端', link: '/backend/' },
      { text: '部署', link: '/deployment/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '快速开始',
          items: [
            { text: '项目介绍', link: '/guide/introduction' },
            { text: 'Docker 运行', link: '/guide/getting-started#docker-运行' },
            { text: 'pnpm 本地运行', link: '/guide/getting-started#pnpm-本地运行' }
          ]
        }
      ],
      '/frontend/': [
        {
          text: '前端文档',
          items: [
            { text: '概述', link: '/frontend/' },
            { text: '快速开始', link: '/frontend/getting-started' },
            { text: '项目配置', link: '/frontend/configuration' },
            { text: '文件目录', link: '/frontend/structure' },
            { text: '组件使用', link: '/frontend/components' },
            { text: '表格页面开发', link: '/frontend/table-development' },
            { text: '开发指南', link: '/frontend/development' },
            { text: '构建部署', link: '/frontend/deployment' }
          ]
        }
      ],
      '/backend/': [
        {
          text: '后端文档',
          items: [
            { text: '概述', link: '/backend/' },
            { text: '快速开始', link: '/backend/getting-started' },
            { text: '项目配置', link: '/backend/configuration' },
            { text: '项目结构', link: '/backend/structure' },
            { text: 'API 开发', link: '/backend/api' },
            { text: '数据库设计', link: '/backend/database' },
            { text: '开发指南', link: '/backend/development' },
            { text: '部署指南', link: '/backend/deployment' }
          ]
        }
      ],
      '/deployment/': [
        {
          text: '部署指南',
          items: [
            { text: '概述', link: '/deployment/' },
            { text: 'Docker 部署', link: '/deployment/docker' },
            { text: 'pnpm 打包部署', link: '/deployment/pnpm' },
            { text: '自动部署', link: '/deployment/automation' },
            { text: 'Docker + 云效 Webhook 自动部署', link: '/deployment/codeup-webhook-docker' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
