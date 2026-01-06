// vite.config.ts
import path4 from "node:path";
import process4 from "node:process";
import Uni from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/@uni-helper+plugin-uni@0.1._8a302c1e073c83f6c80ae93a6f533162/node_modules/@uni-helper/plugin-uni/src/index.js";
import Components from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/@uni-helper+vite-plugin-uni-components@0.2.3_rollup@4.54.0/node_modules/@uni-helper/vite-plugin-uni-components/dist/index.mjs";
import UniLayouts from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/@uni-helper+vite-plugin-uni-layouts@0.1.11_rollup@4.54.0/node_modules/@uni-helper/vite-plugin-uni-layouts/dist/index.mjs";
import UniManifest from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/@uni-helper+vite-plugin-uni_fb052ebaa973a30b1f27b64b8818f3cc/node_modules/@uni-helper/vite-plugin-uni-manifest/dist/index.mjs";
import UniPages from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/@uni-helper+vite-plugin-uni_29fc03f9c7c6298e1aa44a20ced8b892/node_modules/@uni-helper/vite-plugin-uni-pages/dist/index.mjs";
import UniPlatform from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/@uni-helper+vite-plugin-uni-platform@0.0.5/node_modules/@uni-helper/vite-plugin-uni-platform/dist/index.mjs";
import Optimization from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/@uni-ku+bundle-optimizer@1._e287e4b074aa2f9e56e946fe9acb41a9/node_modules/@uni-ku/bundle-optimizer/dist/index.mjs";
import UniKuRoot from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/@uni-ku+root@1.4.1_vite@5.2_00f005c0347428db5bff9cd2ce9fa644/node_modules/@uni-ku/root/dist/index.mjs";
import dayjs from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/dayjs@1.11.10/node_modules/dayjs/dayjs.min.js";
import { visualizer } from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/rollup-plugin-visualizer@6.0.5_rollup@4.54.0/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import UnoCSS from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/unocss@66.0.0_postcss@8.5.6_7b2e0c310bf62c761256be23c078b4aa/node_modules/unocss/dist/vite.mjs";
import AutoImport from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/unplugin-auto-import@20.3.0/node_modules/unplugin-auto-import/dist/vite.mjs";
import { defineConfig, loadEnv } from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/vite@5.2.8_@types+node@20.19.27_sass@1.77.8_terser@5.44.1/node_modules/vite/dist/node/index.js";
import ViteRestart from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/vite-plugin-restart@1.0.0_v_b4c6773e9d910b0e234268b3df52db5a/node_modules/vite-plugin-restart/dist/index.js";

// scripts/open-dev-tools.js
import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
function _openDevTools() {
  const platform = process.platform;
  const { UNI_PLATFORM } = process.env;
  const uniPlatformText = UNI_PLATFORM === "mp-weixin" ? "\u5FAE\u4FE1\u5C0F\u7A0B\u5E8F" : UNI_PLATFORM === "mp-alipay" ? "\u652F\u4ED8\u5B9D\u5C0F\u7A0B\u5E8F" : "\u5C0F\u7A0B\u5E8F";
  const projectPath = path.resolve(process.cwd(), `dist/dev/${UNI_PLATFORM}`);
  if (!fs.existsSync(projectPath)) {
    console.log(`\u274C ${uniPlatformText}\u6784\u5EFA\u76EE\u5F55\u4E0D\u5B58\u5728:`, projectPath);
    return;
  }
  console.log(`\u{1F680} \u6B63\u5728\u6253\u5F00${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177...`);
  let command = "";
  if (platform === "darwin") {
    if (UNI_PLATFORM === "mp-weixin") {
      command = `/Applications/wechatwebdevtools.app/Contents/MacOS/cli -o "${projectPath}"`;
    } else if (UNI_PLATFORM === "mp-alipay") {
      command = `/Applications/\u5C0F\u7A0B\u5E8F\u5F00\u53D1\u8005\u5DE5\u5177.app/Contents/MacOS/\u5C0F\u7A0B\u5E8F\u5F00\u53D1\u8005\u5DE5\u5177 --p "${projectPath}"`;
    }
  } else if (platform === "win32" || platform === "win64") {
    if (UNI_PLATFORM === "mp-weixin") {
      command = `"C:\\Program Files (x86)\\Tencent\\\u5FAE\u4FE1web\u5F00\u53D1\u8005\u5DE5\u5177\\cli.bat" -o "${projectPath}"`;
    }
  } else {
    console.log("\u274C \u5F53\u524D\u7CFB\u7EDF\u4E0D\u652F\u6301\u81EA\u52A8\u6253\u5F00\u5FAE\u4FE1\u5F00\u53D1\u8005\u5DE5\u5177");
    return;
  }
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`\u274C \u6253\u5F00${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177\u5931\u8D25:`, error.message);
      console.log(`\u{1F4A1} \u8BF7\u786E\u4FDD${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177\u670D\u52A1\u7AEF\u53E3\u5DF2\u542F\u7528`);
      console.log(`\u{1F4A1} \u53EF\u4EE5\u624B\u52A8\u6253\u5F00${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177\u5E76\u5BFC\u5165\u9879\u76EE:`, projectPath);
      return;
    }
    if (stderr) {
      console.log("\u26A0\uFE0F \u8B66\u544A:", stderr);
    }
    console.log(`\u2705 ${uniPlatformText}\u5F00\u53D1\u8005\u5DE5\u5177\u5DF2\u6253\u5F00`);
    if (stdout) {
      console.log(stdout);
    }
  });
}
function openDevTools() {
  let isFirstBuild = true;
  return {
    name: "uni-devtools",
    writeBundle() {
      if (isFirstBuild && process.env.UNI_PLATFORM?.includes("mp")) {
        isFirstBuild = false;
        _openDevTools();
      }
    }
  };
}

// vite-plugins/copy-native-resources.ts
import path2 from "node:path";
import process2 from "node:process";
import fs2 from "file:///D:/code/me/yl/uniapp-mobile/node_modules/.pnpm/fs-extra@10.1.0/node_modules/fs-extra/lib/index.js";
var DEFAULT_OPTIONS = {
  enable: true,
  sourceDir: "nativeplugins",
  targetDirName: "nativeplugins",
  verbose: true,
  logPrefix: "[copy-native-resources]"
};
function copyNativeResources(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  if (!config.enable) {
    return {
      name: "copy-native-resources-disabled",
      apply: "build",
      writeBundle() {
      }
    };
  }
  return {
    name: "copy-native-resources",
    apply: "build",
    // 只在构建时应用
    enforce: "post",
    // 在其他插件执行完毕后执行
    async writeBundle() {
      const { sourceDir, targetDirName, verbose, logPrefix } = config;
      try {
        const projectRoot = process2.cwd();
        const sourcePath = path2.resolve(projectRoot, sourceDir);
        const buildMode = process2.env.NODE_ENV === "production" ? "build" : "dev";
        const platform = process2.env.UNI_PLATFORM || "app";
        const targetPath = path2.resolve(
          projectRoot,
          "dist",
          buildMode,
          platform,
          targetDirName
        );
        const sourceExists = await fs2.pathExists(sourcePath);
        if (!sourceExists) {
          if (verbose) {
            console.warn(`${logPrefix} \u6E90\u76EE\u5F55\u4E0D\u5B58\u5728\uFF0C\u8DF3\u8FC7\u590D\u5236\u64CD\u4F5C`);
            console.warn(`${logPrefix} \u6E90\u76EE\u5F55\u8DEF\u5F84: ${sourcePath}`);
            console.warn(`${logPrefix} \u5982\u9700\u4F7F\u7528\u672C\u5730\u539F\u751F\u63D2\u4EF6\uFF0C\u8BF7\u5728\u9879\u76EE\u6839\u76EE\u5F55\u521B\u5EFA nativeplugins \u76EE\u5F55`);
            console.warn(`${logPrefix} \u5E76\u6309\u7167\u5B98\u65B9\u6587\u6863\u653E\u5165\u539F\u751F\u63D2\u4EF6\u6587\u4EF6`);
            console.warn(`${logPrefix} \u53C2\u8003: https://uniapp.dcloud.net.cn/plugin/native-plugin.html`);
          }
          return;
        }
        const sourceFiles = await fs2.readdir(sourcePath);
        if (sourceFiles.length === 0) {
          if (verbose) {
            console.warn(`${logPrefix} \u6E90\u76EE\u5F55\u4E3A\u7A7A\uFF0C\u8DF3\u8FC7\u590D\u5236\u64CD\u4F5C`);
            console.warn(`${logPrefix} \u6E90\u76EE\u5F55\u8DEF\u5F84: ${sourcePath}`);
            console.warn(`${logPrefix} \u8BF7\u5728 nativeplugins \u76EE\u5F55\u4E2D\u653E\u5165\u539F\u751F\u63D2\u4EF6\u6587\u4EF6`);
          }
          return;
        }
        await fs2.ensureDir(targetPath);
        if (verbose) {
          console.log(`${logPrefix} \u5F00\u59CB\u590D\u5236 UniApp \u672C\u5730\u539F\u751F\u63D2\u4EF6...`);
          console.log(`${logPrefix} \u6E90\u76EE\u5F55: ${sourcePath}`);
          console.log(`${logPrefix} \u76EE\u6807\u76EE\u5F55: ${targetPath}`);
          console.log(`${logPrefix} \u6784\u5EFA\u6A21\u5F0F: ${buildMode}`);
          console.log(`${logPrefix} \u76EE\u6807\u5E73\u53F0: ${platform}`);
          console.log(`${logPrefix} \u53D1\u73B0 ${sourceFiles.length} \u4E2A\u539F\u751F\u63D2\u4EF6\u6587\u4EF6/\u76EE\u5F55`);
        }
        await fs2.copy(sourcePath, targetPath, {
          overwrite: true,
          // 覆盖已存在的文件，确保使用最新版本
          errorOnExist: false,
          // 如果目标文件存在不报错
          preserveTimestamps: true
          // 保持文件的时间戳
        });
        if (verbose) {
          console.log(`${logPrefix} \u2705 UniApp \u672C\u5730\u539F\u751F\u63D2\u4EF6\u590D\u5236\u5B8C\u6210`);
          console.log(`${logPrefix} \u5DF2\u6210\u529F\u590D\u5236 ${sourceFiles.length} \u4E2A\u6587\u4EF6/\u76EE\u5F55\u5230\u6784\u5EFA\u76EE\u5F55`);
          console.log(`${logPrefix} \u539F\u751F\u63D2\u4EF6\u73B0\u5728\u53EF\u4EE5\u5728 App \u4E2D\u6B63\u5E38\u4F7F\u7528`);
        }
      } catch (error) {
        console.error(`${config.logPrefix} \u274C \u590D\u5236 UniApp \u672C\u5730\u539F\u751F\u63D2\u4EF6\u5931\u8D25:`, error);
        console.error(`${config.logPrefix} \u9519\u8BEF\u8BE6\u60C5:`, error instanceof Error ? error.message : String(error));
        console.error(`${config.logPrefix} \u8BF7\u68C0\u67E5\u6E90\u76EE\u5F55\u6743\u9650\u548C\u78C1\u76D8\u7A7A\u95F4`);
      }
    }
  };
}
function createCopyNativeResourcesPlugin(enable = true, options = {}) {
  return copyNativeResources({ enable, ...options });
}

// vite-plugins/sync-manifest-plugins.ts
import fs3 from "node:fs";
import path3 from "node:path";
import process3 from "node:process";
function syncManifestPlugin() {
  return {
    name: "sync-manifest",
    apply: "build",
    enforce: "post",
    writeBundle: {
      order: "post",
      handler() {
        const srcManifestPath = path3.resolve(process3.cwd(), "./src/manifest.json");
        const distAppPath = path3.resolve(process3.cwd(), "./dist/dev/app/manifest.json");
        try {
          const srcManifest = JSON.parse(fs3.readFileSync(srcManifestPath, "utf8"));
          const distAppDir = path3.dirname(distAppPath);
          if (!fs3.existsSync(distAppDir)) {
            fs3.mkdirSync(distAppDir, { recursive: true });
          }
          let distManifest = {};
          if (fs3.existsSync(distAppPath)) {
            distManifest = JSON.parse(fs3.readFileSync(distAppPath, "utf8"));
          }
          if (srcManifest["app-plus"]?.distribute?.plugins) {
            if (!distManifest.plus)
              distManifest.plus = {};
            if (!distManifest.plus.distribute)
              distManifest.plus.distribute = {};
            distManifest.plus.distribute.plugins = srcManifest["app-plus"].distribute.plugins;
            fs3.writeFileSync(distAppPath, JSON.stringify(distManifest, null, 2));
            console.log("\u2705 Manifest plugins \u540C\u6B65\u6210\u529F");
          }
        } catch (error) {
          console.error("\u274C \u540C\u6B65 manifest plugins \u5931\u8D25:", error);
        }
      }
    }
  };
}

// vite.config.ts
var vite_config_default = defineConfig(({ command, mode }) => {
  console.log("command, mode -> ", command, mode);
  const { UNI_PLATFORM } = process4.env;
  console.log("UNI_PLATFORM -> ", UNI_PLATFORM);
  const env = loadEnv(mode, path4.resolve(process4.cwd(), "env"));
  const {
    VITE_APP_PORT,
    VITE_SERVER_BASEURL,
    VITE_APP_TITLE,
    VITE_DELETE_CONSOLE,
    VITE_APP_PUBLIC_BASE,
    VITE_APP_PROXY_ENABLE,
    VITE_APP_PROXY_PREFIX,
    VITE_COPY_NATIVE_RES_ENABLE
  } = env;
  console.log("\u73AF\u5883\u53D8\u91CF env -> ", env);
  return defineConfig({
    envDir: "./env",
    // 自定义env目录
    base: VITE_APP_PUBLIC_BASE,
    plugins: [
      UniLayouts(),
      UniPlatform(),
      UniManifest(),
      UniPages({
        exclude: ["**/components/**/**.*"],
        // pages 目录为 src/pages，分包目录不能配置在pages目录下！！
        // 是个数组，可以配置多个，但是不能为pages里面的目录！！
        subPackages: [
          "src/pages-fg"
          // 这个是相对必要的路由，尽量留着（登录页、注册页、404页等）
        ],
        dts: "src/types/uni-pages.d.ts"
      }),
      // Optimization 插件需要 page.json 文件，故应在 UniPages 插件之后执行
      Optimization({
        enable: {
          "optimization": true,
          "async-import": true,
          "async-component": true
        },
        dts: {
          base: "src/types"
        },
        logger: false
      }),
      // UniXXX 需要在 Uni 之前引入
      // 若存在改变 pages.json 的插件，请将 UniKuRoot 放置其后
      UniKuRoot({
        excludePages: ["**/components/**/**.*"]
      }),
      // Components 需要在 Uni 之前引入
      Components({
        extensions: ["vue"],
        deep: true,
        // 是否递归扫描子目录，
        directoryAsNamespace: false,
        // 是否把目录名作为命名空间前缀，true 时组件名为 目录名+组件名，
        dts: "src/types/components.d.ts"
        // 自动生成的组件类型声明文件路径（用于 TypeScript 支持）
      }),
      Uni(),
      {
        // 临时解决 dcloudio 官方的 @dcloudio/uni-mp-compiler 出现的编译 BUG
        // 参考 github issue: https://github.com/dcloudio/uni-app/issues/4952
        // 自定义插件禁用 vite:vue 插件的 devToolsEnabled，强制编译 vue 模板时 inline 为 true
        name: "fix-vite-plugin-vue",
        configResolved(config) {
          const plugin = config.plugins.find((p) => p.name === "vite:vue");
          if (plugin && plugin.api && plugin.api.options) {
            plugin.api.options.devToolsEnabled = false;
          }
        }
      },
      UnoCSS(),
      AutoImport({
        imports: ["vue", "uni-app"],
        dts: "src/types/auto-import.d.ts",
        dirs: ["src/hooks"],
        // 自动导入 hooks
        vueTemplate: true
        // default false
      }),
      ViteRestart({
        // 通过这个插件，在修改vite.config.js文件则不需要重新运行也生效配置
        restart: ["vite.config.js"]
      }),
      // h5环境增加 BUILD_TIME 和 BUILD_BRANCH
      UNI_PLATFORM === "h5" && {
        name: "html-transform",
        transformIndexHtml(html) {
          return html.replace("%BUILD_TIME%", dayjs().format("YYYY-MM-DD HH:mm:ss")).replace("%VITE_APP_TITLE%", VITE_APP_TITLE);
        }
      },
      // 打包分析插件，h5 + 生产环境才弹出
      UNI_PLATFORM === "h5" && mode === "production" && visualizer({
        filename: "./node_modules/.cache/visualizer/stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true
      }),
      // 原生插件资源复制插件 - 仅在 app 平台且启用时生效
      createCopyNativeResourcesPlugin(
        UNI_PLATFORM === "app" && VITE_COPY_NATIVE_RES_ENABLE === "true",
        {
          verbose: mode === "development"
          // 开发模式显示详细日志
        }
      ),
      syncManifestPlugin(),
      // 自动打开开发者工具插件 (必须修改 .env 文件中的 VITE_WX_APPID)
      openDevTools()
    ],
    define: {
      __VITE_APP_PROXY__: JSON.stringify(VITE_APP_PROXY_ENABLE)
    },
    css: {
      postcss: {
        plugins: [
          // autoprefixer({
          //   // 指定目标浏览器
          //   overrideBrowserslist: ['> 1%', 'last 2 versions'],
          // }),
        ]
      }
    },
    resolve: {
      alias: {
        "@": path4.join(process4.cwd(), "./src"),
        "@img": path4.join(process4.cwd(), "./src/static/images")
      }
    },
    server: {
      host: "0.0.0.0",
      hmr: true,
      port: Number.parseInt(VITE_APP_PORT, 10),
      // 仅 H5 端生效，其他端不生效（其他端走build，不走devServer)
      proxy: JSON.parse(VITE_APP_PROXY_ENABLE) ? {
        [VITE_APP_PROXY_PREFIX]: {
          target: VITE_SERVER_BASEURL,
          changeOrigin: true,
          // 后端有/api前缀则不做处理，没有则需要去掉
          rewrite: (path5) => path5.replace(new RegExp(`^${VITE_APP_PROXY_PREFIX}`), "")
        }
      } : void 0
    },
    esbuild: {
      drop: VITE_DELETE_CONSOLE === "true" ? ["console", "debugger"] : []
    },
    build: {
      sourcemap: false,
      // 方便非h5端调试
      // sourcemap: VITE_SHOW_SOURCEMAP === 'true', // 默认是false
      target: "es6",
      // 开发环境不用压缩
      minify: mode === "development" ? false : "esbuild"
    }
  });
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic2NyaXB0cy9vcGVuLWRldi10b29scy5qcyIsICJ2aXRlLXBsdWdpbnMvY29weS1uYXRpdmUtcmVzb3VyY2VzLnRzIiwgInZpdGUtcGx1Z2lucy9zeW5jLW1hbmlmZXN0LXBsdWdpbnMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxjb2RlXFxcXG1lXFxcXHlsXFxcXHVuaWFwcC1tb2JpbGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGNvZGVcXFxcbWVcXFxceWxcXFxcdW5pYXBwLW1vYmlsZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovY29kZS9tZS95bC91bmlhcHAtbW9iaWxlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xyXG5pbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnXHJcbmltcG9ydCBVbmkgZnJvbSAnQHVuaS1oZWxwZXIvcGx1Z2luLXVuaSdcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAnQHVuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLWNvbXBvbmVudHMnXHJcbi8vIEBzZWUgaHR0cHM6Ly91bmktaGVscGVyLmpzLm9yZy92aXRlLXBsdWdpbi11bmktbGF5b3V0c1xyXG5pbXBvcnQgVW5pTGF5b3V0cyBmcm9tICdAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktbGF5b3V0cydcclxuLy8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktbWFuaWZlc3RcclxuaW1wb3J0IFVuaU1hbmlmZXN0IGZyb20gJ0B1bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1tYW5pZmVzdCdcclxuLy8gQHNlZSBodHRwczovL3VuaS1oZWxwZXIuanMub3JnL3ZpdGUtcGx1Z2luLXVuaS1wYWdlc1xyXG5pbXBvcnQgVW5pUGFnZXMgZnJvbSAnQHVuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLXBhZ2VzJ1xyXG4vLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1wbGF0Zm9ybVxyXG4vLyBcdTk3MDBcdTg5ODFcdTRFMEUgQHVuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLXBhZ2VzIFx1NjNEMlx1NEVGNlx1NEUwMFx1OEQ3N1x1NEY3Rlx1NzUyOFxyXG5pbXBvcnQgVW5pUGxhdGZvcm0gZnJvbSAnQHVuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLXBsYXRmb3JtJ1xyXG4vKipcclxuICogXHU1MjA2XHU1MzA1XHU0RjE4XHU1MzE2XHUzMDAxXHU2QTIxXHU1NzU3XHU1RjAyXHU2QjY1XHU4REU4XHU1MzA1XHU4QzAzXHU3NTI4XHUzMDAxXHU3RUM0XHU0RUY2XHU1RjAyXHU2QjY1XHU4REU4XHU1MzA1XHU1RjE1XHU3NTI4XHJcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3VuaS1rdS9idW5kbGUtb3B0aW1pemVyXHJcbiAqL1xyXG5pbXBvcnQgT3B0aW1pemF0aW9uIGZyb20gJ0B1bmkta3UvYnVuZGxlLW9wdGltaXplcidcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3VuaS1rdS9yb290XHJcbmltcG9ydCBVbmlLdVJvb3QgZnJvbSAnQHVuaS1rdS9yb290J1xyXG5pbXBvcnQgZGF5anMgZnJvbSAnZGF5anMnXHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXHJcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCBWaXRlUmVzdGFydCBmcm9tICd2aXRlLXBsdWdpbi1yZXN0YXJ0J1xyXG5pbXBvcnQgb3BlbkRldlRvb2xzIGZyb20gJy4vc2NyaXB0cy9vcGVuLWRldi10b29scydcclxuaW1wb3J0IHsgY3JlYXRlQ29weU5hdGl2ZVJlc291cmNlc1BsdWdpbiB9IGZyb20gJy4vdml0ZS1wbHVnaW5zL2NvcHktbmF0aXZlLXJlc291cmNlcydcclxuaW1wb3J0IHN5bmNNYW5pZmVzdFBsdWdpbiBmcm9tICcuL3ZpdGUtcGx1Z2lucy9zeW5jLW1hbmlmZXN0LXBsdWdpbnMnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KSA9PiB7XHJcbiAgLy8gQHNlZSBodHRwczovL3Vub2Nzcy5kZXYvXHJcbiAgLy8gY29uc3QgVW5vQ1NTID0gKGF3YWl0IGltcG9ydCgndW5vY3NzL3ZpdGUnKSkuZGVmYXVsdFxyXG4gIC8vIGNvbnNvbGUubG9nKG1vZGUgPT09IHByb2Nlc3MuZW52Lk5PREVfRU5WKSAvLyB0cnVlXHJcblxyXG4gIC8vIG1vZGU6IFx1NTMzQVx1NTIwNlx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1OEZEOFx1NjYyRlx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1xyXG4gIGNvbnNvbGUubG9nKCdjb21tYW5kLCBtb2RlIC0+ICcsIGNvbW1hbmQsIG1vZGUpXHJcbiAgLy8gcG5wbSBkZXY6aDUgXHU2NUY2XHU1Rjk3XHU1MjMwID0+IHNlcnZlIGRldmVsb3BtZW50XHJcbiAgLy8gcG5wbSBidWlsZDpoNSBcdTY1RjZcdTVGOTdcdTUyMzAgPT4gYnVpbGQgcHJvZHVjdGlvblxyXG4gIC8vIHBucG0gZGV2Om1wLXdlaXhpbiBcdTY1RjZcdTVGOTdcdTUyMzAgPT4gYnVpbGQgZGV2ZWxvcG1lbnQgKFx1NkNFOFx1NjEwRlx1NTMzQVx1NTIyQlx1RkYwQ2NvbW1hbmRcdTRFM0FidWlsZClcclxuICAvLyBwbnBtIGJ1aWxkOm1wLXdlaXhpbiBcdTY1RjZcdTVGOTdcdTUyMzAgPT4gYnVpbGQgcHJvZHVjdGlvblxyXG4gIC8vIHBucG0gZGV2OmFwcCBcdTY1RjZcdTVGOTdcdTUyMzAgPT4gYnVpbGQgZGV2ZWxvcG1lbnQgKFx1NkNFOFx1NjEwRlx1NTMzQVx1NTIyQlx1RkYwQ2NvbW1hbmRcdTRFM0FidWlsZClcclxuICAvLyBwbnBtIGJ1aWxkOmFwcCBcdTY1RjZcdTVGOTdcdTUyMzAgPT4gYnVpbGQgcHJvZHVjdGlvblxyXG4gIC8vIGRldiBcdTU0OEMgYnVpbGQgXHU1NDdEXHU0RUU0XHU1M0VGXHU0RUU1XHU1MjA2XHU1MjJCXHU0RjdGXHU3NTI4IC5lbnYuZGV2ZWxvcG1lbnQgXHU1NDhDIC5lbnYucHJvZHVjdGlvbiBcdTc2ODRcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcclxuXHJcbiAgY29uc3QgeyBVTklfUExBVEZPUk0gfSA9IHByb2Nlc3MuZW52XHJcbiAgY29uc29sZS5sb2coJ1VOSV9QTEFURk9STSAtPiAnLCBVTklfUExBVEZPUk0pIC8vIFx1NUY5N1x1NTIzMCBtcC13ZWl4aW4sIGg1LCBhcHAgXHU3QjQ5XHJcblxyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdlbnYnKSlcclxuICBjb25zdCB7XHJcbiAgICBWSVRFX0FQUF9QT1JULFxyXG4gICAgVklURV9TRVJWRVJfQkFTRVVSTCxcclxuICAgIFZJVEVfQVBQX1RJVExFLFxyXG4gICAgVklURV9ERUxFVEVfQ09OU09MRSxcclxuICAgIFZJVEVfQVBQX1BVQkxJQ19CQVNFLFxyXG4gICAgVklURV9BUFBfUFJPWFlfRU5BQkxFLFxyXG4gICAgVklURV9BUFBfUFJPWFlfUFJFRklYLFxyXG4gICAgVklURV9DT1BZX05BVElWRV9SRVNfRU5BQkxFLFxyXG4gIH0gPSBlbnZcclxuICBjb25zb2xlLmxvZygnXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGIGVudiAtPiAnLCBlbnYpXHJcblxyXG4gIHJldHVybiBkZWZpbmVDb25maWcoe1xyXG4gICAgZW52RGlyOiAnLi9lbnYnLCAvLyBcdTgxRUFcdTVCOUFcdTRFNDllbnZcdTc2RUVcdTVGNTVcclxuICAgIGJhc2U6IFZJVEVfQVBQX1BVQkxJQ19CQVNFLFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICBVbmlMYXlvdXRzKCksXHJcbiAgICAgIFVuaVBsYXRmb3JtKCksXHJcbiAgICAgIFVuaU1hbmlmZXN0KCksXHJcbiAgICAgIFVuaVBhZ2VzKHtcclxuICAgICAgICBleGNsdWRlOiBbJyoqL2NvbXBvbmVudHMvKiovKiouKiddLFxyXG4gICAgICAgIC8vIHBhZ2VzIFx1NzZFRVx1NUY1NVx1NEUzQSBzcmMvcGFnZXNcdUZGMENcdTUyMDZcdTUzMDVcdTc2RUVcdTVGNTVcdTRFMERcdTgwRkRcdTkxNERcdTdGNkVcdTU3MjhwYWdlc1x1NzZFRVx1NUY1NVx1NEUwQlx1RkYwMVx1RkYwMVxyXG4gICAgICAgIC8vIFx1NjYyRlx1NEUyQVx1NjU3MFx1N0VDNFx1RkYwQ1x1NTNFRlx1NEVFNVx1OTE0RFx1N0Y2RVx1NTkxQVx1NEUyQVx1RkYwQ1x1NEY0Nlx1NjYyRlx1NEUwRFx1ODBGRFx1NEUzQXBhZ2VzXHU5MUNDXHU5NzYyXHU3Njg0XHU3NkVFXHU1RjU1XHVGRjAxXHVGRjAxXHJcbiAgICAgICAgc3ViUGFja2FnZXM6IFtcclxuICAgICAgICAgICdzcmMvcGFnZXMtZmcnLCAvLyBcdThGRDlcdTRFMkFcdTY2MkZcdTc2RjhcdTVCRjlcdTVGQzVcdTg5ODFcdTc2ODRcdThERUZcdTc1MzFcdUZGMENcdTVDM0RcdTkxQ0ZcdTc1NTlcdTc3NDBcdUZGMDhcdTc2N0JcdTVGNTVcdTk4NzVcdTMwMDFcdTZDRThcdTUxOENcdTk4NzVcdTMwMDE0MDRcdTk4NzVcdTdCNDlcdUZGMDlcclxuICAgICAgICBdLFxyXG4gICAgICAgIGR0czogJ3NyYy90eXBlcy91bmktcGFnZXMuZC50cycsXHJcbiAgICAgIH0pLFxyXG4gICAgICAvLyBPcHRpbWl6YXRpb24gXHU2M0QyXHU0RUY2XHU5NzAwXHU4OTgxIHBhZ2UuanNvbiBcdTY1ODdcdTRFRjZcdUZGMENcdTY1NDVcdTVFOTRcdTU3MjggVW5pUGFnZXMgXHU2M0QyXHU0RUY2XHU0RTRCXHU1NDBFXHU2MjY3XHU4ODRDXHJcbiAgICAgIE9wdGltaXphdGlvbih7XHJcbiAgICAgICAgZW5hYmxlOiB7XHJcbiAgICAgICAgICAnb3B0aW1pemF0aW9uJzogdHJ1ZSxcclxuICAgICAgICAgICdhc3luYy1pbXBvcnQnOiB0cnVlLFxyXG4gICAgICAgICAgJ2FzeW5jLWNvbXBvbmVudCc6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkdHM6IHtcclxuICAgICAgICAgIGJhc2U6ICdzcmMvdHlwZXMnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbG9nZ2VyOiBmYWxzZSxcclxuICAgICAgfSksXHJcbiAgICAgIC8vIFVuaVhYWCBcdTk3MDBcdTg5ODFcdTU3MjggVW5pIFx1NEU0Qlx1NTI0RFx1NUYxNVx1NTE2NVxyXG4gICAgICAvLyBcdTgyRTVcdTVCNThcdTU3MjhcdTY1MzlcdTUzRDggcGFnZXMuanNvbiBcdTc2ODRcdTYzRDJcdTRFRjZcdUZGMENcdThCRjdcdTVDMDYgVW5pS3VSb290IFx1NjUzRVx1N0Y2RVx1NTE3Nlx1NTQwRVxyXG4gICAgICBVbmlLdVJvb3Qoe1xyXG4gICAgICAgIGV4Y2x1ZGVQYWdlczogWycqKi9jb21wb25lbnRzLyoqLyoqLionXSxcclxuICAgICAgfSksXHJcbiAgICAgIC8vIENvbXBvbmVudHMgXHU5NzAwXHU4OTgxXHU1NzI4IFVuaSBcdTRFNEJcdTUyNERcdTVGMTVcdTUxNjVcclxuICAgICAgQ29tcG9uZW50cyh7XHJcbiAgICAgICAgZXh0ZW5zaW9uczogWyd2dWUnXSxcclxuICAgICAgICBkZWVwOiB0cnVlLCAvLyBcdTY2MkZcdTU0MjZcdTkwMTJcdTVGNTJcdTYyNkJcdTYzQ0ZcdTVCNTBcdTc2RUVcdTVGNTVcdUZGMENcclxuICAgICAgICBkaXJlY3RvcnlBc05hbWVzcGFjZTogZmFsc2UsIC8vIFx1NjYyRlx1NTQyNlx1NjI4QVx1NzZFRVx1NUY1NVx1NTQwRFx1NEY1Q1x1NEUzQVx1NTQ3RFx1NTQwRFx1N0E3QVx1OTVGNFx1NTI0RFx1N0YwMFx1RkYwQ3RydWUgXHU2NUY2XHU3RUM0XHU0RUY2XHU1NDBEXHU0RTNBIFx1NzZFRVx1NUY1NVx1NTQwRCtcdTdFQzRcdTRFRjZcdTU0MERcdUZGMENcclxuICAgICAgICBkdHM6ICdzcmMvdHlwZXMvY29tcG9uZW50cy5kLnRzJywgLy8gXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU3Njg0XHU3RUM0XHU0RUY2XHU3QzdCXHU1NzhCXHU1OEYwXHU2NjBFXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjA4XHU3NTI4XHU0RThFIFR5cGVTY3JpcHQgXHU2NTJGXHU2MzAxXHVGRjA5XHJcbiAgICAgIH0pLFxyXG4gICAgICBVbmkoKSxcclxuICAgICAge1xyXG4gICAgICAgIC8vIFx1NEUzNFx1NjVGNlx1ODlFM1x1NTFCMyBkY2xvdWRpbyBcdTVCOThcdTY1QjlcdTc2ODQgQGRjbG91ZGlvL3VuaS1tcC1jb21waWxlciBcdTUxRkFcdTczQjBcdTc2ODRcdTdGMTZcdThCRDEgQlVHXHJcbiAgICAgICAgLy8gXHU1M0MyXHU4MDAzIGdpdGh1YiBpc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL2RjbG91ZGlvL3VuaS1hcHAvaXNzdWVzLzQ5NTJcclxuICAgICAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTYzRDJcdTRFRjZcdTc5ODFcdTc1Mjggdml0ZTp2dWUgXHU2M0QyXHU0RUY2XHU3Njg0IGRldlRvb2xzRW5hYmxlZFx1RkYwQ1x1NUYzQVx1NTIzNlx1N0YxNlx1OEJEMSB2dWUgXHU2QTIxXHU2NzdGXHU2NUY2IGlubGluZSBcdTRFM0EgdHJ1ZVxyXG4gICAgICAgIG5hbWU6ICdmaXgtdml0ZS1wbHVnaW4tdnVlJyxcclxuICAgICAgICBjb25maWdSZXNvbHZlZChjb25maWcpIHtcclxuICAgICAgICAgIGNvbnN0IHBsdWdpbiA9IGNvbmZpZy5wbHVnaW5zLmZpbmQocCA9PiBwLm5hbWUgPT09ICd2aXRlOnZ1ZScpXHJcbiAgICAgICAgICBpZiAocGx1Z2luICYmIHBsdWdpbi5hcGkgJiYgcGx1Z2luLmFwaS5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHBsdWdpbi5hcGkub3B0aW9ucy5kZXZUb29sc0VuYWJsZWQgPSBmYWxzZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIFVub0NTUygpLFxyXG4gICAgICBBdXRvSW1wb3J0KHtcclxuICAgICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd1bmktYXBwJ10sXHJcbiAgICAgICAgZHRzOiAnc3JjL3R5cGVzL2F1dG8taW1wb3J0LmQudHMnLFxyXG4gICAgICAgIGRpcnM6IFsnc3JjL2hvb2tzJ10sIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NSBob29rc1xyXG4gICAgICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLCAvLyBkZWZhdWx0IGZhbHNlXHJcbiAgICAgIH0pLFxyXG4gICAgICBWaXRlUmVzdGFydCh7XHJcbiAgICAgICAgLy8gXHU5MDFBXHU4RkM3XHU4RkQ5XHU0RTJBXHU2M0QyXHU0RUY2XHVGRjBDXHU1NzI4XHU0RkVFXHU2NTM5dml0ZS5jb25maWcuanNcdTY1ODdcdTRFRjZcdTUyMTlcdTRFMERcdTk3MDBcdTg5ODFcdTkxQ0RcdTY1QjBcdThGRDBcdTg4NENcdTRFNUZcdTc1MUZcdTY1NDhcdTkxNERcdTdGNkVcclxuICAgICAgICByZXN0YXJ0OiBbJ3ZpdGUuY29uZmlnLmpzJ10sXHJcbiAgICAgIH0pLFxyXG4gICAgICAvLyBoNVx1NzNBRlx1NTg4M1x1NTg5RVx1NTJBMCBCVUlMRF9USU1FIFx1NTQ4QyBCVUlMRF9CUkFOQ0hcclxuICAgICAgVU5JX1BMQVRGT1JNID09PSAnaDUnICYmIHtcclxuICAgICAgICBuYW1lOiAnaHRtbC10cmFuc2Zvcm0nLFxyXG4gICAgICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XHJcbiAgICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKCclQlVJTERfVElNRSUnLCBkYXlqcygpLmZvcm1hdCgnWVlZWS1NTS1ERCBISDptbTpzcycpKS5yZXBsYWNlKCclVklURV9BUFBfVElUTEUlJywgVklURV9BUFBfVElUTEUpXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgLy8gXHU2MjUzXHU1MzA1XHU1MjA2XHU2NzkwXHU2M0QyXHU0RUY2XHVGRjBDaDUgKyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTYyNERcdTVGMzlcdTUxRkFcclxuICAgICAgVU5JX1BMQVRGT1JNID09PSAnaDUnXHJcbiAgICAgICYmIG1vZGUgPT09ICdwcm9kdWN0aW9uJ1xyXG4gICAgICAmJiB2aXN1YWxpemVyKHtcclxuICAgICAgICBmaWxlbmFtZTogJy4vbm9kZV9tb2R1bGVzLy5jYWNoZS92aXN1YWxpemVyL3N0YXRzLmh0bWwnLFxyXG4gICAgICAgIG9wZW46IHRydWUsXHJcbiAgICAgICAgZ3ppcFNpemU6IHRydWUsXHJcbiAgICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcclxuICAgICAgfSksXHJcbiAgICAgIC8vIFx1NTM5Rlx1NzUxRlx1NjNEMlx1NEVGNlx1OEQ0NFx1NkU5MFx1NTkwRFx1NTIzNlx1NjNEMlx1NEVGNiAtIFx1NEVDNVx1NTcyOCBhcHAgXHU1RTczXHU1M0YwXHU0RTE0XHU1NDJGXHU3NTI4XHU2NUY2XHU3NTFGXHU2NTQ4XHJcbiAgICAgIGNyZWF0ZUNvcHlOYXRpdmVSZXNvdXJjZXNQbHVnaW4oXHJcbiAgICAgICAgVU5JX1BMQVRGT1JNID09PSAnYXBwJyAmJiBWSVRFX0NPUFlfTkFUSVZFX1JFU19FTkFCTEUgPT09ICd0cnVlJyxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB2ZXJib3NlOiBtb2RlID09PSAnZGV2ZWxvcG1lbnQnLCAvLyBcdTVGMDBcdTUzRDFcdTZBMjFcdTVGMEZcdTY2M0VcdTc5M0FcdThCRTZcdTdFQzZcdTY1RTVcdTVGRDdcclxuICAgICAgICB9LFxyXG4gICAgICApLFxyXG4gICAgICBzeW5jTWFuaWZlc3RQbHVnaW4oKSxcclxuICAgICAgLy8gXHU4MUVBXHU1MkE4XHU2MjUzXHU1RjAwXHU1RjAwXHU1M0QxXHU4MDA1XHU1REU1XHU1MTc3XHU2M0QyXHU0RUY2IChcdTVGQzVcdTk4N0JcdTRGRUVcdTY1MzkgLmVudiBcdTY1ODdcdTRFRjZcdTRFMkRcdTc2ODQgVklURV9XWF9BUFBJRClcclxuICAgICAgb3BlbkRldlRvb2xzKCksXHJcbiAgICBdLFxyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgIF9fVklURV9BUFBfUFJPWFlfXzogSlNPTi5zdHJpbmdpZnkoVklURV9BUFBfUFJPWFlfRU5BQkxFKSxcclxuICAgIH0sXHJcbiAgICBjc3M6IHtcclxuICAgICAgcG9zdGNzczoge1xyXG4gICAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgIC8vIGF1dG9wcmVmaXhlcih7XHJcbiAgICAgICAgICAvLyAgIC8vIFx1NjMwN1x1NUI5QVx1NzZFRVx1NjgwN1x1NkQ0Rlx1ODlDOFx1NTY2OFxyXG4gICAgICAgICAgLy8gICBvdmVycmlkZUJyb3dzZXJzbGlzdDogWyc+IDElJywgJ2xhc3QgMiB2ZXJzaW9ucyddLFxyXG4gICAgICAgICAgLy8gfSksXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICcuL3NyYycpLFxyXG4gICAgICAgICdAaW1nJzogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICcuL3NyYy9zdGF0aWMvaW1hZ2VzJyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuICAgICAgaG1yOiB0cnVlLFxyXG4gICAgICBwb3J0OiBOdW1iZXIucGFyc2VJbnQoVklURV9BUFBfUE9SVCwgMTApLFxyXG4gICAgICAvLyBcdTRFQzUgSDUgXHU3QUVGXHU3NTFGXHU2NTQ4XHVGRjBDXHU1MTc2XHU0RUQ2XHU3QUVGXHU0RTBEXHU3NTFGXHU2NTQ4XHVGRjA4XHU1MTc2XHU0RUQ2XHU3QUVGXHU4RDcwYnVpbGRcdUZGMENcdTRFMERcdThENzBkZXZTZXJ2ZXIpXHJcbiAgICAgIHByb3h5OiBKU09OLnBhcnNlKFZJVEVfQVBQX1BST1hZX0VOQUJMRSlcclxuICAgICAgICA/IHtcclxuICAgICAgICAgICAgW1ZJVEVfQVBQX1BST1hZX1BSRUZJWF06IHtcclxuICAgICAgICAgICAgICB0YXJnZXQ6IFZJVEVfU0VSVkVSX0JBU0VVUkwsXHJcbiAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgIC8vIFx1NTQwRVx1N0FFRlx1NjcwOS9hcGlcdTUyNERcdTdGMDBcdTUyMTlcdTRFMERcdTUwNUFcdTU5MDRcdTc0MDZcdUZGMENcdTZDQTFcdTY3MDlcdTUyMTlcdTk3MDBcdTg5ODFcdTUzQkJcdTYzODlcclxuICAgICAgICAgICAgICByZXdyaXRlOiBwYXRoID0+IHBhdGgucmVwbGFjZShuZXcgUmVnRXhwKGBeJHtWSVRFX0FQUF9QUk9YWV9QUkVGSVh9YCksICcnKSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICA6IHVuZGVmaW5lZCxcclxuICAgIH0sXHJcbiAgICBlc2J1aWxkOiB7XHJcbiAgICAgIGRyb3A6IFZJVEVfREVMRVRFX0NPTlNPTEUgPT09ICd0cnVlJyA/IFsnY29uc29sZScsICdkZWJ1Z2dlciddIDogW10sXHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgICAgLy8gXHU2NUI5XHU0RkJGXHU5NzVFaDVcdTdBRUZcdThDMDNcdThCRDVcclxuICAgICAgLy8gc291cmNlbWFwOiBWSVRFX1NIT1dfU09VUkNFTUFQID09PSAndHJ1ZScsIC8vIFx1OUVEOFx1OEJBNFx1NjYyRmZhbHNlXHJcbiAgICAgIHRhcmdldDogJ2VzNicsXHJcbiAgICAgIC8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUwRFx1NzUyOFx1NTM4Qlx1N0YyOVxyXG4gICAgICBtaW5pZnk6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcgPyBmYWxzZSA6ICdlc2J1aWxkJyxcclxuICAgIH0sXHJcbiAgfSlcclxufSlcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxjb2RlXFxcXG1lXFxcXHlsXFxcXHVuaWFwcC1tb2JpbGVcXFxcc2NyaXB0c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcY29kZVxcXFxtZVxcXFx5bFxcXFx1bmlhcHAtbW9iaWxlXFxcXHNjcmlwdHNcXFxcb3Blbi1kZXYtdG9vbHMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2NvZGUvbWUveWwvdW5pYXBwLW1vYmlsZS9zY3JpcHRzL29wZW4tZGV2LXRvb2xzLmpzXCI7aW1wb3J0IHsgZXhlYyB9IGZyb20gJ25vZGU6Y2hpbGRfcHJvY2VzcydcclxuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnXHJcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcclxuaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJ1xyXG5cclxuLyoqXHJcbiAqIFx1NjI1M1x1NUYwMFx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3N1xyXG4gKi9cclxuZnVuY3Rpb24gX29wZW5EZXZUb29scygpIHtcclxuICBjb25zdCBwbGF0Zm9ybSA9IHByb2Nlc3MucGxhdGZvcm0gLy8gZGFyd2luLCB3aW4zMiwgbGludXhcclxuICBjb25zdCB7IFVOSV9QTEFURk9STSB9ID0gcHJvY2Vzcy5lbnYgLy8gIG1wLXdlaXhpbiwgbXAtYWxpcGF5XHJcblxyXG4gIGNvbnN0IHVuaVBsYXRmb3JtVGV4dCA9IFVOSV9QTEFURk9STSA9PT0gJ21wLXdlaXhpbicgPyAnXHU1RkFFXHU0RkUxXHU1QzBGXHU3QTBCXHU1RThGJyA6IFVOSV9QTEFURk9STSA9PT0gJ21wLWFsaXBheScgPyAnXHU2NTJGXHU0RUQ4XHU1QjlEXHU1QzBGXHU3QTBCXHU1RThGJyA6ICdcdTVDMEZcdTdBMEJcdTVFOEYnXHJcblxyXG4gIC8vIFx1OTg3OVx1NzZFRVx1OERFRlx1NUY4NFx1RkYwOFx1Njc4NFx1NUVGQVx1OEY5M1x1NTFGQVx1NzZFRVx1NUY1NVx1RkYwOVxyXG4gIGNvbnN0IHByb2plY3RQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGBkaXN0L2Rldi8ke1VOSV9QTEFURk9STX1gKVxyXG5cclxuICAvLyBcdTY4QzBcdTY3RTVcdTY3ODRcdTVFRkFcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcclxuICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvamVjdFBhdGgpKSB7XHJcbiAgICBjb25zb2xlLmxvZyhgXHUyNzRDICR7dW5pUGxhdGZvcm1UZXh0fVx1Njc4NFx1NUVGQVx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyODpgLCBwcm9qZWN0UGF0aClcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coYFx1RDgzRFx1REU4MCBcdTZCNjNcdTU3MjhcdTYyNTNcdTVGMDAke3VuaVBsYXRmb3JtVGV4dH1cdTVGMDBcdTUzRDFcdTgwMDVcdTVERTVcdTUxNzcuLi5gKVxyXG5cclxuICAvLyBcdTY4MzlcdTYzNkVcdTRFMERcdTU0MENcdTY0Q0RcdTRGNUNcdTdDRkJcdTdFREZcdTYyNjdcdTg4NENcdTRFMERcdTU0MENcdTU0N0RcdTRFRTRcclxuICBsZXQgY29tbWFuZCA9ICcnXHJcblxyXG4gIGlmIChwbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcclxuICAgIC8vIG1hY09TXHJcbiAgICBpZiAoVU5JX1BMQVRGT1JNID09PSAnbXAtd2VpeGluJykge1xyXG4gICAgICBjb21tYW5kID0gYC9BcHBsaWNhdGlvbnMvd2VjaGF0d2ViZGV2dG9vbHMuYXBwL0NvbnRlbnRzL01hY09TL2NsaSAtbyBcIiR7cHJvamVjdFBhdGh9XCJgXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChVTklfUExBVEZPUk0gPT09ICdtcC1hbGlwYXknKSB7XHJcbiAgICAgIGNvbW1hbmQgPSBgL0FwcGxpY2F0aW9ucy9cdTVDMEZcdTdBMEJcdTVFOEZcdTVGMDBcdTUzRDFcdTgwMDVcdTVERTVcdTUxNzcuYXBwL0NvbnRlbnRzL01hY09TL1x1NUMwRlx1N0EwQlx1NUU4Rlx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3NyAtLXAgXCIke3Byb2plY3RQYXRofVwiYFxyXG4gICAgfVxyXG4gIH1cclxuICBlbHNlIGlmIChwbGF0Zm9ybSA9PT0gJ3dpbjMyJyB8fCBwbGF0Zm9ybSA9PT0gJ3dpbjY0Jykge1xyXG4gICAgLy8gV2luZG93c1xyXG4gICAgaWYgKFVOSV9QTEFURk9STSA9PT0gJ21wLXdlaXhpbicpIHtcclxuICAgICAgY29tbWFuZCA9IGBcIkM6XFxcXFByb2dyYW0gRmlsZXMgKHg4NilcXFxcVGVuY2VudFxcXFxcdTVGQUVcdTRGRTF3ZWJcdTVGMDBcdTUzRDFcdTgwMDVcdTVERTVcdTUxNzdcXFxcY2xpLmJhdFwiIC1vIFwiJHtwcm9qZWN0UGF0aH1cImBcclxuICAgIH1cclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICAvLyBMaW51eCBcdTYyMTZcdTUxNzZcdTRFRDZcdTdDRkJcdTdFREZcclxuICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgXHU1RjUzXHU1MjREXHU3Q0ZCXHU3RURGXHU0RTBEXHU2NTJGXHU2MzAxXHU4MUVBXHU1MkE4XHU2MjUzXHU1RjAwXHU1RkFFXHU0RkUxXHU1RjAwXHU1M0QxXHU4MDA1XHU1REU1XHU1MTc3JylcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgZXhlYyhjb21tYW5kLCAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XHJcbiAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5sb2coYFx1Mjc0QyBcdTYyNTNcdTVGMDAke3VuaVBsYXRmb3JtVGV4dH1cdTVGMDBcdTUzRDFcdTgwMDVcdTVERTVcdTUxNzdcdTU5MzFcdThEMjU6YCwgZXJyb3IubWVzc2FnZSlcclxuICAgICAgY29uc29sZS5sb2coYFx1RDgzRFx1RENBMSBcdThCRjdcdTc4NkVcdTRGREQke3VuaVBsYXRmb3JtVGV4dH1cdTVGMDBcdTUzRDFcdTgwMDVcdTVERTVcdTUxNzdcdTY3MERcdTUyQTFcdTdBRUZcdTUzRTNcdTVERjJcdTU0MkZcdTc1MjhgKVxyXG4gICAgICBjb25zb2xlLmxvZyhgXHVEODNEXHVEQ0ExIFx1NTNFRlx1NEVFNVx1NjI0Qlx1NTJBOFx1NjI1M1x1NUYwMCR7dW5pUGxhdGZvcm1UZXh0fVx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3N1x1NUU3Nlx1NUJGQ1x1NTE2NVx1OTg3OVx1NzZFRTpgLCBwcm9qZWN0UGF0aClcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHN0ZGVycikge1xyXG4gICAgICBjb25zb2xlLmxvZygnXHUyNkEwXHVGRTBGIFx1OEI2Nlx1NTQ0QTonLCBzdGRlcnIpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coYFx1MjcwNSAke3VuaVBsYXRmb3JtVGV4dH1cdTVGMDBcdTUzRDFcdTgwMDVcdTVERTVcdTUxNzdcdTVERjJcdTYyNTNcdTVGMDBgKVxyXG5cclxuICAgIGlmIChzdGRvdXQpIHtcclxuICAgICAgY29uc29sZS5sb2coc3Rkb3V0KVxyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9wZW5EZXZUb29scygpIHtcclxuICAvLyBcdTk5OTZcdTZCMjFcdTY3ODRcdTVFRkFcdTY4MDdcdThCQjBcclxuICBsZXQgaXNGaXJzdEJ1aWxkID0gdHJ1ZVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogJ3VuaS1kZXZ0b29scycsXHJcbiAgICB3cml0ZUJ1bmRsZSgpIHtcclxuICAgICAgaWYgKGlzRmlyc3RCdWlsZCAmJiBwcm9jZXNzLmVudi5VTklfUExBVEZPUk0/LmluY2x1ZGVzKCdtcCcpKSB7XHJcbiAgICAgICAgaXNGaXJzdEJ1aWxkID0gZmFsc2VcclxuICAgICAgICBfb3BlbkRldlRvb2xzKClcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxjb2RlXFxcXG1lXFxcXHlsXFxcXHVuaWFwcC1tb2JpbGVcXFxcdml0ZS1wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxjb2RlXFxcXG1lXFxcXHlsXFxcXHVuaWFwcC1tb2JpbGVcXFxcdml0ZS1wbHVnaW5zXFxcXGNvcHktbmF0aXZlLXJlc291cmNlcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovY29kZS9tZS95bC91bmlhcHAtbW9iaWxlL3ZpdGUtcGx1Z2lucy9jb3B5LW5hdGl2ZS1yZXNvdXJjZXMudHNcIjtpbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcclxuaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJ1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnXHJcblxyXG4vKipcclxuICogXHU1MzlGXHU3NTFGXHU2M0QyXHU0RUY2XHU4RDQ0XHU2RTkwXHU1OTBEXHU1MjM2XHU5MTREXHU3RjZFXHU2M0E1XHU1M0UzXHJcbiAqXHJcbiAqIFx1NjgzOVx1NjM2RSBVbmlBcHAgXHU1Qjk4XHU2NUI5XHU2NTg3XHU2ODYzXHVGRjFBaHR0cHM6Ly91bmlhcHAuZGNsb3VkLm5ldC5jbi9wbHVnaW4vbmF0aXZlLXBsdWdpbi5odG1sIyVFNiU5QyVBQyVFNSU5QyVCMCVFNiU4RiU5MiVFNCVCQiVCNi0lRTklOUQlOUUlRTUlODYlODUlRTclQkQlQUUlRTUlOEUlOUYlRTclOTQlOUYlRTYlOEYlOTIlRTQlQkIlQjZcclxuICogXHU2NzJDXHU1NzMwXHU2M0QyXHU0RUY2XHU1RTk0XHU4QkU1XHU1QjU4XHU1MEE4XHU1NzI4XHU5ODc5XHU3NkVFXHU2ODM5XHU3NkVFXHU1RjU1XHU3Njg0IG5hdGl2ZXBsdWdpbnMgXHU3NkVFXHU1RjU1XHU0RTBCXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIENvcHlOYXRpdmVSZXNvdXJjZXNPcHRpb25zIHtcclxuICAvKiogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHU2M0QyXHU0RUY2ICovXHJcbiAgZW5hYmxlPzogYm9vbGVhblxyXG4gIC8qKlxyXG4gICAqIFx1NkU5MFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwQ1x1NzZGOFx1NUJGOVx1NEU4RVx1OTg3OVx1NzZFRVx1NjgzOVx1NzZFRVx1NUY1NVxyXG4gICAqIFx1OUVEOFx1OEJBNFx1NEUzQSAnbmF0aXZlcGx1Z2lucydcdUZGMENcdTdCMjZcdTU0MDggVW5pQXBwIFx1NUI5OFx1NjVCOVx1ODlDNFx1ODMwM1xyXG4gICAqIEBzZWUgaHR0cHM6Ly91bmlhcHAuZGNsb3VkLm5ldC5jbi9wbHVnaW4vbmF0aXZlLXBsdWdpbi5odG1sIyVFNiU5QyVBQyVFNSU5QyVCMCVFNiU4RiU5MiVFNCVCQiVCNi0lRTklOUQlOUUlRTUlODYlODUlRTclQkQlQUUlRTUlOEUlOUYlRTclOTQlOUYlRTYlOEYlOTIlRTQlQkIlQjZcclxuICAgKi9cclxuICBzb3VyY2VEaXI/OiBzdHJpbmdcclxuICAvKipcclxuICAgKiBcdTc2RUVcdTY4MDdcdTc2RUVcdTVGNTVcdTU0MERcdTc5RjBcdUZGMENcdTY3ODRcdTVFRkFcdTU0MEVcdTU3MjggZGlzdCBcdTc2RUVcdTVGNTVcdTRFMkRcdTc2ODRcdTY1ODdcdTRFRjZcdTU5MzlcdTU0MERcclxuICAgKiBcdTlFRDhcdThCQTRcdTRFM0EgJ25hdGl2ZXBsdWdpbnMnXHVGRjBDXHU0RTBFXHU2RTkwXHU3NkVFXHU1RjU1XHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XHJcbiAgICovXHJcbiAgdGFyZ2V0RGlyTmFtZT86IHN0cmluZ1xyXG4gIC8qKiBcdTY2MkZcdTU0MjZcdTY2M0VcdTc5M0FcdThCRTZcdTdFQzZcdTY1RTVcdTVGRDdcdUZGMENcdTRGQkZcdTRFOEVcdThDMDNcdThCRDVcdTU0OENcdTc2RDFcdTYzQTdcdTU5MERcdTUyMzZcdThGQzdcdTdBMEIgKi9cclxuICB2ZXJib3NlPzogYm9vbGVhblxyXG4gIC8qKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTY1RTVcdTVGRDdcdTUyNERcdTdGMDBcdUZGMENcdTc1MjhcdTRFOEVcdTUzM0FcdTUyMDZcdTRFMERcdTU0MENcdTYzRDJcdTRFRjZcdTc2ODRcdTY1RTVcdTVGRDdcdThGOTNcdTUxRkEgKi9cclxuICBsb2dQcmVmaXg/OiBzdHJpbmdcclxufVxyXG5cclxuLyoqXHJcbiAqIFx1OUVEOFx1OEJBNFx1OTE0RFx1N0Y2RVxyXG4gKlxyXG4gKiBcdTY4MzlcdTYzNkUgVW5pQXBwIFx1NUI5OFx1NjVCOVx1NjU4N1x1Njg2M1x1ODlDNFx1ODMwM1x1OEJCRVx1N0Y2RVx1OUVEOFx1OEJBNFx1NTAzQ1x1RkYxQVxyXG4gKiAtIHNvdXJjZURpcjogJ25hdGl2ZXBsdWdpbnMnIC0gXHU3QjI2XHU1NDA4XHU1Qjk4XHU2NUI5XHU2NzJDXHU1NzMwXHU2M0QyXHU0RUY2XHU1QjU4XHU1MEE4XHU4OUM0XHU4MzAzXHJcbiAqIC0gdGFyZ2V0RGlyTmFtZTogJ25hdGl2ZXBsdWdpbnMnIC0gXHU2Nzg0XHU1RUZBXHU1NDBFXHU0RkREXHU2MzAxXHU3NkY4XHU1NDBDXHU3Njg0XHU3NkVFXHU1RjU1XHU3RUQzXHU2Nzg0XHJcbiAqL1xyXG5jb25zdCBERUZBVUxUX09QVElPTlM6IFJlcXVpcmVkPENvcHlOYXRpdmVSZXNvdXJjZXNPcHRpb25zPiA9IHtcclxuICBlbmFibGU6IHRydWUsXHJcbiAgc291cmNlRGlyOiAnbmF0aXZlcGx1Z2lucycsXHJcbiAgdGFyZ2V0RGlyTmFtZTogJ25hdGl2ZXBsdWdpbnMnLFxyXG4gIHZlcmJvc2U6IHRydWUsXHJcbiAgbG9nUHJlZml4OiAnW2NvcHktbmF0aXZlLXJlc291cmNlc10nLFxyXG59XHJcblxyXG4vKipcclxuICogVW5pQXBwIFx1NTM5Rlx1NzUxRlx1NjNEMlx1NEVGNlx1OEQ0NFx1NkU5MFx1NTkwRFx1NTIzNlx1NjNEMlx1NEVGNlxyXG4gKlxyXG4gKiBcdTUyOUZcdTgwRkRcdThCRjRcdTY2MEVcdUZGMUFcclxuICogMS4gXHU4OUUzXHU1MUIzIFVuaUFwcCBcdTRGN0ZcdTc1MjhcdTY3MkNcdTU3MzBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdTY1RjZcdUZGMENcdTYyNTNcdTUzMDVcdTU0MEVcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdThENDRcdTZFOTBcdTYyN0VcdTRFMERcdTUyMzBcdTc2ODRcdTk1RUVcdTk4OThcclxuICogMi4gXHU1QzA2XHU5ODc5XHU3NkVFXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0IG5hdGl2ZXBsdWdpbnMgXHU3NkVFXHU1RjU1XHU1OTBEXHU1MjM2XHU1MjMwXHU2Nzg0XHU1RUZBXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XHU0RTJEXHJcbiAqIDMuIFx1NjUyRlx1NjMwMSBBbmRyb2lkIFx1NTQ4QyBpT1MgXHU1RTczXHU1M0YwXHU3Njg0XHU1MzlGXHU3NTFGXHU2M0QyXHU0RUY2XHU4RDQ0XHU2RTkwXHU1OTBEXHU1MjM2XHJcbiAqIDQuIFx1NEVDNVx1NTcyOCBhcHAgXHU1RTczXHU1M0YwXHU2Nzg0XHU1RUZBXHU2NUY2XHU3NTFGXHU2NTQ4XHVGRjBDXHU1MTc2XHU0RUQ2XHU1RTczXHU1M0YwXHVGRjA4SDVcdTMwMDFcdTVDMEZcdTdBMEJcdTVFOEZcdUZGMDlcdTRFMERcdTYyNjdcdTg4NENcclxuICpcclxuICogXHU0RjdGXHU3NTI4XHU1NzNBXHU2NjZGXHVGRjFBXHJcbiAqIC0gXHU0RjdGXHU3NTI4XHU0RTg2IFVuaUFwcCBcdTY3MkNcdTU3MzBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdUZGMDhcdTk3NUVcdTRFOTFcdTdBRUZcdTYzRDJcdTRFRjZcdUZGMDlcclxuICogLSBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdTUzMDVcdTU0MkJcdTk4OURcdTU5MTZcdTc2ODRcdThENDRcdTZFOTBcdTY1ODdcdTRFRjZcdUZGMDhcdTU5ODIgLnNvIFx1NUU5M1x1NjU4N1x1NEVGNlx1MzAwMVx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlx1N0I0OVx1RkYwOVxyXG4gKiAtIFx1OTcwMFx1ODk4MVx1NTcyOFx1NjI1M1x1NTMwNVx1NTQwRVx1NEZERFx1NjMwMVx1NTM5Rlx1NzUxRlx1NjNEMlx1NEVGNlx1NzY4NFx1NUI4Q1x1NjU3NFx1NzZFRVx1NUY1NVx1N0VEM1x1Njc4NFxyXG4gKlxyXG4gKiBcdTVCOThcdTY1QjlcdTY1ODdcdTY4NjNcdTUzQzJcdTgwMDNcdUZGMUFcclxuICogQHNlZSBodHRwczovL3VuaWFwcC5kY2xvdWQubmV0LmNuL3BsdWdpbi9uYXRpdmUtcGx1Z2luLmh0bWwjJUU2JTlDJUFDJUU1JTlDJUIwJUU2JThGJTkyJUU0JUJCJUI2LSVFOSU5RCU5RSVFNSU4NiU4NSVFNyVCRCVBRSVFNSU4RSU5RiVFNyU5NCU5RiVFNiU4RiU5MiVFNCVCQiVCNlxyXG4gKiBAc2VlIGh0dHBzOi8vdW5pYXBwLmRjbG91ZC5uZXQuY24vdHV0b3JpYWwvbnZ1ZS1hcGkuaHRtbCNkb21cclxuICpcclxuICogQHBhcmFtIG9wdGlvbnMgXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXHU5MDA5XHU5ODc5XHJcbiAqIEByZXR1cm5zIFZpdGUgXHU2M0QyXHU0RUY2XHU1QkY5XHU4QzYxXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29weU5hdGl2ZVJlc291cmNlcyhvcHRpb25zOiBDb3B5TmF0aXZlUmVzb3VyY2VzT3B0aW9ucyA9IHt9KTogUGx1Z2luIHtcclxuICBjb25zdCBjb25maWcgPSB7IC4uLkRFRkFVTFRfT1BUSU9OUywgLi4ub3B0aW9ucyB9XHJcblxyXG4gIC8vIFx1NTk4Mlx1Njc5Q1x1NjNEMlx1NEVGNlx1ODhBQlx1Nzk4MVx1NzUyOFx1RkYwQ1x1OEZENFx1NTZERVx1NEUwMFx1NEUyQVx1N0E3QVx1NjNEMlx1NEVGNlxyXG4gIGlmICghY29uZmlnLmVuYWJsZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTogJ2NvcHktbmF0aXZlLXJlc291cmNlcy1kaXNhYmxlZCcsXHJcbiAgICAgIGFwcGx5OiAnYnVpbGQnLFxyXG4gICAgICB3cml0ZUJ1bmRsZSgpIHtcclxuICAgICAgICAvLyBcdTYzRDJcdTRFRjZcdTVERjJcdTc5ODFcdTc1MjhcdUZGMENcdTRFMERcdTYyNjdcdTg4NENcdTRFRkJcdTRGNTVcdTY0Q0RcdTRGNUNcclxuICAgICAgfSxcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnY29weS1uYXRpdmUtcmVzb3VyY2VzJyxcclxuICAgIGFwcGx5OiAnYnVpbGQnLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTVFOTRcdTc1MjhcclxuICAgIGVuZm9yY2U6ICdwb3N0JywgLy8gXHU1NzI4XHU1MTc2XHU0RUQ2XHU2M0QyXHU0RUY2XHU2MjY3XHU4ODRDXHU1QjhDXHU2QkQ1XHU1NDBFXHU2MjY3XHU4ODRDXHJcblxyXG4gICAgYXN5bmMgd3JpdGVCdW5kbGUoKSB7XHJcbiAgICAgIGNvbnN0IHsgc291cmNlRGlyLCB0YXJnZXREaXJOYW1lLCB2ZXJib3NlLCBsb2dQcmVmaXggfSA9IGNvbmZpZ1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBcdTgzQjdcdTUzRDZcdTk4NzlcdTc2RUVcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcclxuICAgICAgICBjb25zdCBwcm9qZWN0Um9vdCA9IHByb2Nlc3MuY3dkKClcclxuXHJcbiAgICAgICAgLy8gXHU2Nzg0XHU1RUZBXHU2RTkwXHU3NkVFXHU1RjU1XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU5ODc5XHU3NkVFXHU2ODM5XHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0IG5hdGl2ZXBsdWdpbnMgXHU3NkVFXHU1RjU1XHVGRjA5XHJcbiAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdCwgc291cmNlRGlyKVxyXG5cclxuICAgICAgICAvLyBcdTY3ODRcdTVFRkFcdTc2RUVcdTY4MDdcdThERUZcdTVGODRcdUZGMUFkaXN0L1tidWlsZHxkZXZdL1twbGF0Zm9ybV0vbmF0aXZlcGx1Z2luc1xyXG4gICAgICAgIC8vIGJ1aWxkTW9kZTogJ2J1aWxkJyAoXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzKSBcdTYyMTYgJ2RldicgKFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4MylcclxuICAgICAgICAvLyBwbGF0Zm9ybTogJ2FwcCcgKEFwcFx1NUU3M1x1NTNGMCkgXHU2MjE2XHU1MTc2XHU0RUQ2XHU1RTczXHU1M0YwXHU2ODA3XHU4QkM2XHJcbiAgICAgICAgY29uc3QgYnVpbGRNb2RlID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyA/ICdidWlsZCcgOiAnZGV2J1xyXG4gICAgICAgIGNvbnN0IHBsYXRmb3JtID0gcHJvY2Vzcy5lbnYuVU5JX1BMQVRGT1JNIHx8ICdhcHAnXHJcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHBhdGgucmVzb2x2ZShcclxuICAgICAgICAgIHByb2plY3RSb290LFxyXG4gICAgICAgICAgJ2Rpc3QnLFxyXG4gICAgICAgICAgYnVpbGRNb2RlLFxyXG4gICAgICAgICAgcGxhdGZvcm0sXHJcbiAgICAgICAgICB0YXJnZXREaXJOYW1lLFxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2RTkwXHU3NkVFXHU1RjU1XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XHJcbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU0RTBEXHU1QjU4XHU1NzI4IG5hdGl2ZXBsdWdpbnMgXHU3NkVFXHU1RjU1XHVGRjBDXHU4QkY0XHU2NjBFXHU5ODc5XHU3NkVFXHU2Q0ExXHU2NzA5XHU0RjdGXHU3NTI4XHU2NzJDXHU1NzMwXHU1MzlGXHU3NTFGXHU2M0QyXHU0RUY2XHJcbiAgICAgICAgY29uc3Qgc291cmNlRXhpc3RzID0gYXdhaXQgZnMucGF0aEV4aXN0cyhzb3VyY2VQYXRoKVxyXG4gICAgICAgIGlmICghc291cmNlRXhpc3RzKSB7XHJcbiAgICAgICAgICBpZiAodmVyYm9zZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bG9nUHJlZml4fSBcdTZFOTBcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThERjNcdThGQzdcdTU5MERcdTUyMzZcdTY0Q0RcdTRGNUNgKVxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bG9nUHJlZml4fSBcdTZFOTBcdTc2RUVcdTVGNTVcdThERUZcdTVGODQ6ICR7c291cmNlUGF0aH1gKVxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bG9nUHJlZml4fSBcdTU5ODJcdTk3MDBcdTRGN0ZcdTc1MjhcdTY3MkNcdTU3MzBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdUZGMENcdThCRjdcdTU3MjhcdTk4NzlcdTc2RUVcdTY4MzlcdTc2RUVcdTVGNTVcdTUyMUJcdTVFRkEgbmF0aXZlcGx1Z2lucyBcdTc2RUVcdTVGNTVgKVxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bG9nUHJlZml4fSBcdTVFNzZcdTYzMDlcdTcxNjdcdTVCOThcdTY1QjlcdTY1ODdcdTY4NjNcdTY1M0VcdTUxNjVcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdTY1ODdcdTRFRjZgKVxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bG9nUHJlZml4fSBcdTUzQzJcdTgwMDM6IGh0dHBzOi8vdW5pYXBwLmRjbG91ZC5uZXQuY24vcGx1Z2luL25hdGl2ZS1wbHVnaW4uaHRtbGApXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NkU5MFx1NzZFRVx1NUY1NVx1NjYyRlx1NTQyNlx1NEUzQVx1N0E3QVxyXG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFx1NEY0Nlx1NEUzQVx1N0E3QVx1RkYwQ1x1NEU1Rlx1OERGM1x1OEZDN1x1NTkwRFx1NTIzNlx1NjRDRFx1NEY1Q1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZUZpbGVzID0gYXdhaXQgZnMucmVhZGRpcihzb3VyY2VQYXRoKVxyXG4gICAgICAgIGlmIChzb3VyY2VGaWxlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIGlmICh2ZXJib3NlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtsb2dQcmVmaXh9IFx1NkU5MFx1NzZFRVx1NUY1NVx1NEUzQVx1N0E3QVx1RkYwQ1x1OERGM1x1OEZDN1x1NTkwRFx1NTIzNlx1NjRDRFx1NEY1Q2ApXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtsb2dQcmVmaXh9IFx1NkU5MFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NDogJHtzb3VyY2VQYXRofWApXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtsb2dQcmVmaXh9IFx1OEJGN1x1NTcyOCBuYXRpdmVwbHVnaW5zIFx1NzZFRVx1NUY1NVx1NEUyRFx1NjUzRVx1NTE2NVx1NTM5Rlx1NzUxRlx1NjNEMlx1NEVGNlx1NjU4N1x1NEVGNmApXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NzZFRVx1NjgwN1x1NzZFRVx1NUY1NVx1NTNDQVx1NTE3Nlx1NzIzNlx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFxyXG4gICAgICAgIGF3YWl0IGZzLmVuc3VyZURpcih0YXJnZXRQYXRoKVxyXG5cclxuICAgICAgICBpZiAodmVyYm9zZSkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coYCR7bG9nUHJlZml4fSBcdTVGMDBcdTU5Q0JcdTU5MERcdTUyMzYgVW5pQXBwIFx1NjcyQ1x1NTczMFx1NTM5Rlx1NzUxRlx1NjNEMlx1NEVGNi4uLmApXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsb2dQcmVmaXh9IFx1NkU5MFx1NzZFRVx1NUY1NTogJHtzb3VyY2VQYXRofWApXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsb2dQcmVmaXh9IFx1NzZFRVx1NjgwN1x1NzZFRVx1NUY1NTogJHt0YXJnZXRQYXRofWApXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsb2dQcmVmaXh9IFx1Njc4NFx1NUVGQVx1NkEyMVx1NUYwRjogJHtidWlsZE1vZGV9YClcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGAke2xvZ1ByZWZpeH0gXHU3NkVFXHU2ODA3XHU1RTczXHU1M0YwOiAke3BsYXRmb3JtfWApXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsb2dQcmVmaXh9IFx1NTNEMVx1NzNCMCAke3NvdXJjZUZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1MzlGXHU3NTFGXHU2M0QyXHU0RUY2XHU2NTg3XHU0RUY2L1x1NzZFRVx1NUY1NWApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBcdTYyNjdcdTg4NENcdTY1ODdcdTRFRjZcdTU5MERcdTUyMzZcdTY0Q0RcdTRGNUNcclxuICAgICAgICAvLyBcdTVDMDZcdTY1NzRcdTRFMkEgbmF0aXZlcGx1Z2lucyBcdTc2RUVcdTVGNTVcdTU5MERcdTUyMzZcdTUyMzBcdTY3ODRcdTVFRkFcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcclxuICAgICAgICBhd2FpdCBmcy5jb3B5KHNvdXJjZVBhdGgsIHRhcmdldFBhdGgsIHtcclxuICAgICAgICAgIG92ZXJ3cml0ZTogdHJ1ZSwgLy8gXHU4OTg2XHU3NkQ2XHU1REYyXHU1QjU4XHU1NzI4XHU3Njg0XHU2NTg3XHU0RUY2XHVGRjBDXHU3ODZFXHU0RkREXHU0RjdGXHU3NTI4XHU2NzAwXHU2NUIwXHU3MjQ4XHU2NzJDXHJcbiAgICAgICAgICBlcnJvck9uRXhpc3Q6IGZhbHNlLCAvLyBcdTU5ODJcdTY3OUNcdTc2RUVcdTY4MDdcdTY1ODdcdTRFRjZcdTVCNThcdTU3MjhcdTRFMERcdTYyQTVcdTk1MTlcclxuICAgICAgICAgIHByZXNlcnZlVGltZXN0YW1wczogdHJ1ZSwgLy8gXHU0RkREXHU2MzAxXHU2NTg3XHU0RUY2XHU3Njg0XHU2NUY2XHU5NUY0XHU2MjMzXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgaWYgKHZlcmJvc2UpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGAke2xvZ1ByZWZpeH0gXHUyNzA1IFVuaUFwcCBcdTY3MkNcdTU3MzBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdTU5MERcdTUyMzZcdTVCOENcdTYyMTBgKVxyXG4gICAgICAgICAgY29uc29sZS5sb2coYCR7bG9nUHJlZml4fSBcdTVERjJcdTYyMTBcdTUyOUZcdTU5MERcdTUyMzYgJHtzb3VyY2VGaWxlcy5sZW5ndGh9IFx1NEUyQVx1NjU4N1x1NEVGNi9cdTc2RUVcdTVGNTVcdTUyMzBcdTY3ODRcdTVFRkFcdTc2RUVcdTVGNTVgKVxyXG4gICAgICAgICAgY29uc29sZS5sb2coYCR7bG9nUHJlZml4fSBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdTczQjBcdTU3MjhcdTUzRUZcdTRFRTVcdTU3MjggQXBwIFx1NEUyRFx1NkI2M1x1NUUzOFx1NEY3Rlx1NzUyOGApXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y29uZmlnLmxvZ1ByZWZpeH0gXHUyNzRDIFx1NTkwRFx1NTIzNiBVbmlBcHAgXHU2NzJDXHU1NzMwXHU1MzlGXHU3NTFGXHU2M0QyXHU0RUY2XHU1OTMxXHU4RDI1OmAsIGVycm9yKVxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y29uZmlnLmxvZ1ByZWZpeH0gXHU5NTE5XHU4QkVGXHU4QkU2XHU2MEM1OmAsIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSlcclxuICAgICAgICBjb25zb2xlLmVycm9yKGAke2NvbmZpZy5sb2dQcmVmaXh9IFx1OEJGN1x1NjhDMFx1NjdFNVx1NkU5MFx1NzZFRVx1NUY1NVx1Njc0M1x1OTY1MFx1NTQ4Q1x1NzhDMVx1NzZEOFx1N0E3QVx1OTVGNGApXHJcbiAgICAgICAgLy8gXHU0RTBEXHU2MjlCXHU1MUZBXHU5NTE5XHU4QkVGXHVGRjBDXHU5MDdGXHU1MTREXHU1RjcxXHU1NENEXHU2NTc0XHU0RTJBXHU2Nzg0XHU1RUZBXHU4RkM3XHU3QTBCXHVGRjBDXHU0RjQ2XHU0RjFBXHU4QkIwXHU1RjU1XHU4QkU2XHU3RUM2XHU3Njg0XHU5NTE5XHU4QkVGXHU0RkUxXHU2MDZGXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogXHU1MjFCXHU1RUZBIFVuaUFwcCBcdTY3MkNcdTU3MzBcdTUzOUZcdTc1MUZcdTYzRDJcdTRFRjZcdThENDRcdTZFOTBcdTU5MERcdTUyMzZcdTYzRDJcdTRFRjZcdTc2ODRcdTRGQkZcdTYzNzdcdTUxRkRcdTY1NzBcclxuICpcclxuICogXHU4RkQ5XHU2NjJGXHU0RTAwXHU0RTJBXHU0RkJGXHU2Mzc3XHU3Njg0XHU1REU1XHU1MzgyXHU1MUZEXHU2NTcwXHVGRjBDXHU3NTI4XHU0RThFXHU1RkVCXHU5MDFGXHU1MjFCXHU1RUZBXHU2M0QyXHU0RUY2XHU1QjlFXHU0RjhCXHJcbiAqIFx1NzI3OVx1NTIyQlx1OTAwMlx1NzUyOFx1NEU4RVx1NTcyOCB2aXRlLmNvbmZpZy50cyBcdTRFMkRcdThGREJcdTg4NENcdTY3NjFcdTRFRjZcdTYwMjdcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkVcclxuICpcclxuICogXHU0RjdGXHU3NTI4XHU3OTNBXHU0RjhCXHVGRjFBXHJcbiAqIGBgYHR5cGVzY3JpcHRcclxuICogLy8gXHU1NzI4IHZpdGUuY29uZmlnLnRzIFx1NEUyRFxyXG4gKiBwbHVnaW5zOiBbXHJcbiAqICAgLy8gXHU0RUM1XHU1NzI4IGFwcCBcdTVFNzNcdTUzRjBcdTRFMTRcdTU0MkZcdTc1MjhcdTY1RjZcdTc1MUZcdTY1NDhcclxuICogICBVTklfUExBVEZPUk0gPT09ICdhcHAnXHJcbiAqICAgICA/IGNyZWF0ZUNvcHlOYXRpdmVSZXNvdXJjZXNQbHVnaW4oXHJcbiAqICAgICAgICAgVklURV9DT1BZX05BVElWRV9SRVNfRU5BQkxFID09PSAndHJ1ZScsXHJcbiAqICAgICAgICAgeyB2ZXJib3NlOiBtb2RlID09PSAnZGV2ZWxvcG1lbnQnIH1cclxuICogICAgICAgKVxyXG4gKiAgICAgOiBudWxsLFxyXG4gKiBdXHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBAcGFyYW0gZW5hYmxlIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOFx1NjNEMlx1NEVGNlx1RkYwQ1x1OTAxQVx1NUUzOFx1OTAxQVx1OEZDN1x1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1NjNBN1x1NTIzNlxyXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTUxNzZcdTRFRDZcdTkxNERcdTdGNkVcdTkwMDlcdTk4NzlcdUZGMENcdTRFMERcdTUzMDVcdTU0MkIgZW5hYmxlIFx1NUM1RVx1NjAyN1xyXG4gKiBAcmV0dXJucyBWaXRlIFx1NjNEMlx1NEVGNlx1NUJGOVx1OEM2MVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvcHlOYXRpdmVSZXNvdXJjZXNQbHVnaW4oXHJcbiAgZW5hYmxlOiBib29sZWFuID0gdHJ1ZSxcclxuICBvcHRpb25zOiBPbWl0PENvcHlOYXRpdmVSZXNvdXJjZXNPcHRpb25zLCAnZW5hYmxlJz4gPSB7fSxcclxuKTogUGx1Z2luIHtcclxuICByZXR1cm4gY29weU5hdGl2ZVJlc291cmNlcyh7IGVuYWJsZSwgLi4ub3B0aW9ucyB9KVxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcY29kZVxcXFxtZVxcXFx5bFxcXFx1bmlhcHAtbW9iaWxlXFxcXHZpdGUtcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcY29kZVxcXFxtZVxcXFx5bFxcXFx1bmlhcHAtbW9iaWxlXFxcXHZpdGUtcGx1Z2luc1xcXFxzeW5jLW1hbmlmZXN0LXBsdWdpbnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2NvZGUvbWUveWwvdW5pYXBwLW1vYmlsZS92aXRlLXBsdWdpbnMvc3luYy1tYW5pZmVzdC1wbHVnaW5zLnRzXCI7aW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgZnMgZnJvbSAnbm9kZTpmcydcclxuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xyXG5pbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnXHJcblxyXG5pbnRlcmZhY2UgTWFuaWZlc3RUeXBlIHtcclxuICAncGx1cyc/OiB7XHJcbiAgICBkaXN0cmlidXRlPzoge1xyXG4gICAgICBwbHVnaW5zPzogUmVjb3JkPHN0cmluZywgYW55PlxyXG4gICAgfVxyXG4gIH1cclxuICAnYXBwLXBsdXMnPzoge1xyXG4gICAgZGlzdHJpYnV0ZT86IHtcclxuICAgICAgcGx1Z2lucz86IFJlY29yZDxzdHJpbmcsIGFueT5cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN5bmNNYW5pZmVzdFBsdWdpbigpOiBQbHVnaW4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnc3luYy1tYW5pZmVzdCcsXHJcbiAgICBhcHBseTogJ2J1aWxkJyxcclxuICAgIGVuZm9yY2U6ICdwb3N0JyxcclxuICAgIHdyaXRlQnVuZGxlOiB7XHJcbiAgICAgIG9yZGVyOiAncG9zdCcsXHJcbiAgICAgIGhhbmRsZXIoKSB7XHJcbiAgICAgICAgY29uc3Qgc3JjTWFuaWZlc3RQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICcuL3NyYy9tYW5pZmVzdC5qc29uJylcclxuICAgICAgICBjb25zdCBkaXN0QXBwUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnLi9kaXN0L2Rldi9hcHAvbWFuaWZlc3QuanNvbicpXHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAvLyBcdThCRkJcdTUzRDZcdTZFOTBcdTY1ODdcdTRFRjZcclxuICAgICAgICAgIGNvbnN0IHNyY01hbmlmZXN0ID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoc3JjTWFuaWZlc3RQYXRoLCAndXRmOCcpKSBhcyBNYW5pZmVzdFR5cGVcclxuXHJcbiAgICAgICAgICAvLyBcdTc4NkVcdTRGRERcdTc2RUVcdTY4MDdcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcclxuICAgICAgICAgIGNvbnN0IGRpc3RBcHBEaXIgPSBwYXRoLmRpcm5hbWUoZGlzdEFwcFBhdGgpXHJcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlzdEFwcERpcikpIHtcclxuICAgICAgICAgICAgZnMubWtkaXJTeW5jKGRpc3RBcHBEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gXHU4QkZCXHU1M0Q2XHU3NkVFXHU2ODA3XHU2NTg3XHU0RUY2XHVGRjA4XHU1OTgyXHU2NzlDXHU1QjU4XHU1NzI4XHVGRjA5XHJcbiAgICAgICAgICBsZXQgZGlzdE1hbmlmZXN0OiBNYW5pZmVzdFR5cGUgPSB7fVxyXG4gICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZGlzdEFwcFBhdGgpKSB7XHJcbiAgICAgICAgICAgIGRpc3RNYW5pZmVzdCA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGRpc3RBcHBQYXRoLCAndXRmOCcpKVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NkU5MFx1NjU4N1x1NEVGNlx1NUI1OFx1NTcyOCBwbHVnaW5zXHJcbiAgICAgICAgICBpZiAoc3JjTWFuaWZlc3RbJ2FwcC1wbHVzJ10/LmRpc3RyaWJ1dGU/LnBsdWdpbnMpIHtcclxuICAgICAgICAgICAgLy8gXHU3ODZFXHU0RkREXHU3NkVFXHU2ODA3XHU2NTg3XHU0RUY2XHU0RTJEXHU2NzA5XHU1RkM1XHU4OTgxXHU3Njg0XHU1QkY5XHU4QzYxXHU3RUQzXHU2Nzg0XHJcbiAgICAgICAgICAgIGlmICghZGlzdE1hbmlmZXN0LnBsdXMpXHJcbiAgICAgICAgICAgICAgZGlzdE1hbmlmZXN0LnBsdXMgPSB7fVxyXG4gICAgICAgICAgICBpZiAoIWRpc3RNYW5pZmVzdC5wbHVzLmRpc3RyaWJ1dGUpXHJcbiAgICAgICAgICAgICAgZGlzdE1hbmlmZXN0LnBsdXMuZGlzdHJpYnV0ZSA9IHt9XHJcblxyXG4gICAgICAgICAgICAvLyBcdTU5MERcdTUyMzYgcGx1Z2lucyBcdTUxODVcdTVCQjlcclxuICAgICAgICAgICAgZGlzdE1hbmlmZXN0LnBsdXMuZGlzdHJpYnV0ZS5wbHVnaW5zID0gc3JjTWFuaWZlc3RbJ2FwcC1wbHVzJ10uZGlzdHJpYnV0ZS5wbHVnaW5zXHJcblxyXG4gICAgICAgICAgICAvLyBcdTUxOTlcdTUxNjVcdTY2RjRcdTY1QjBcdTU0MEVcdTc2ODRcdTUxODVcdTVCQjlcclxuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXN0QXBwUGF0aCwgSlNPTi5zdHJpbmdpZnkoZGlzdE1hbmlmZXN0LCBudWxsLCAyKSlcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBNYW5pZmVzdCBwbHVnaW5zIFx1NTQwQ1x1NkI2NVx1NjIxMFx1NTI5RicpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFx1NTQwQ1x1NkI2NSBtYW5pZmVzdCBwbHVnaW5zIFx1NTkzMVx1OEQyNTonLCBlcnJvcilcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZRLE9BQU9BLFdBQVU7QUFDOVIsT0FBT0MsY0FBYTtBQUNwQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxnQkFBZ0I7QUFFdkIsT0FBTyxnQkFBZ0I7QUFFdkIsT0FBTyxpQkFBaUI7QUFFeEIsT0FBTyxjQUFjO0FBR3JCLE9BQU8saUJBQWlCO0FBS3hCLE9BQU8sa0JBQWtCO0FBRXpCLE9BQU8sZUFBZTtBQUN0QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxrQkFBa0I7QUFDM0IsT0FBTyxZQUFZO0FBQ25CLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8saUJBQWlCOzs7QUN6QnFSLFNBQVMsWUFBWTtBQUNsVSxPQUFPLFFBQVE7QUFDZixPQUFPLFVBQVU7QUFDakIsT0FBTyxhQUFhO0FBS3BCLFNBQVMsZ0JBQWdCO0FBQ3ZCLFFBQU0sV0FBVyxRQUFRO0FBQ3pCLFFBQU0sRUFBRSxhQUFhLElBQUksUUFBUTtBQUVqQyxRQUFNLGtCQUFrQixpQkFBaUIsY0FBYyxtQ0FBVSxpQkFBaUIsY0FBYyx5Q0FBVztBQUczRyxRQUFNLGNBQWMsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLFlBQVksWUFBWSxFQUFFO0FBRzFFLE1BQUksQ0FBQyxHQUFHLFdBQVcsV0FBVyxHQUFHO0FBQy9CLFlBQVEsSUFBSSxVQUFLLGVBQWUsK0NBQVksV0FBVztBQUN2RDtBQUFBLEVBQ0Y7QUFFQSxVQUFRLElBQUks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VUFBVTtBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFFBQ1YsWUFBWTtBQUFBLE1BQ2QsQ0FBQztBQUFBO0FBQUEsTUFFRDtBQUFBLFFBQ0UsaUJBQWlCLFNBQVMsZ0NBQWdDO0FBQUEsUUFDMUQ7QUFBQSxVQUNFLFNBQVMsU0FBUztBQUFBO0FBQUEsUUFDcEI7QUFBQSxNQUNGO0FBQUEsTUFDQSxtQkFBbUI7QUFBQTtBQUFBLE1BRW5CLGFBQWE7QUFBQSxJQUNmO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixvQkFBb0IsS0FBSyxVQUFVLHFCQUFxQjtBQUFBLElBQzFEO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDUCxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUtUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUVBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUtDLE1BQUssS0FBS0QsU0FBUSxJQUFJLEdBQUcsT0FBTztBQUFBLFFBQ3JDLFFBQVFDLE1BQUssS0FBS0QsU0FBUSxJQUFJLEdBQUcscUJBQXFCO0FBQUEsTUFDeEQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsTUFDTCxNQUFNLE9BQU8sU0FBUyxlQUFlLEVBQUU7QUFBQTtBQUFBLE1BRXZDLE9BQU8sS0FBSyxNQUFNLHFCQUFxQixJQUNuQztBQUFBLFFBQ0UsQ0FBQyxxQkFBcUIsR0FBRztBQUFBLFVBQ3ZCLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQTtBQUFBLFVBRWQsU0FBUyxDQUFBQyxVQUFRQSxNQUFLLFFBQVEsSUFBSSxPQUFPLElBQUkscUJBQXFCLEVBQUUsR0FBRyxFQUFFO0FBQUEsUUFDM0U7QUFBQSxNQUNGLElBQ0E7QUFBQSxJQUNOO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxNQUFNLHdCQUF3QixTQUFTLENBQUMsV0FBVyxVQUFVLElBQUksQ0FBQztBQUFBLElBQ3BFO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxXQUFXO0FBQUE7QUFBQTtBQUFBLE1BR1gsUUFBUTtBQUFBO0FBQUEsTUFFUixRQUFRLFNBQVMsZ0JBQWdCLFFBQVE7QUFBQSxJQUMzQztBQUFBLEVBQ0YsQ0FBQztBQUNILENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiLCAicHJvY2VzcyIsICJwYXRoIiwgInByb2Nlc3MiLCAiZnMiLCAicHJvY2VzcyIsICJwYXRoIiwgImZzIiwgImZzIiwgInBhdGgiLCAicHJvY2VzcyIsICJwYXRoIiwgInByb2Nlc3MiLCAiZnMiLCAicHJvY2VzcyIsICJwYXRoIl0KfQo=
