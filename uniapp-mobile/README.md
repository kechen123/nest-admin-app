# UniApp 跨端移动应用

## 技术栈

- UniApp
- Vue 3
- TypeScript
- Pinia
- Vite

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

### 3. 运行项目

H5 开发：

```bash
npm run dev:h5
```

微信小程序开发：

```bash
npm run dev:mp-weixin
```

App 开发：

```bash
npm run dev:app
```

### 4. 使用 HBuilderX

1. 使用 HBuilderX 打开项目
2. 选择运行到浏览器/小程序/App

## 项目结构

```
src/
├── api/            # API 请求模块
├── stores/         # Pinia 状态管理
├── pages/          # 页面文件
├── static/         # 静态资源
└── manifest.json   # 应用配置
```

## 功能特性

- 基于 `uni.request` 的请求封装
- Pinia 状态管理
- 支持条件编译（#ifdef MP-WEIXIN 等）
- 微信小程序登录示例
- TypeScript 类型支持

## 平台支持

- H5
- 微信小程序
- App (iOS/Android)

## 开发说明

- API 请求使用 `src/api/request.ts` 封装的 `api` 方法
- 认证状态管理使用 `src/stores/auth.ts`
- 页面路由配置在 `src/pages.json` 中
- 使用条件编译处理平台差异
