# Geo-Spark

<div align="center">
  <img src="app-icon.png" alt="Geo-Spark Logo" width="128" height="128">
  <p><strong>跨平台地理空间数据可视化桌面工具 — 基于 Tauri + Vue 3 + TypeScript 构建</strong></p>
</div>

## 📖 项目简介

Geo-Spark 是一个现代化的桌面应用程序，用于加载、转换、分析和可视化地理空间数据。它集成了 Cesium 和 MapLibre GL JS，提供强大的 3D / 2D 地图渲染能力，支持多种地理空间数据格式，并内置可视域分析、路径规划、测量等空间分析工具。

<p>服务端仓库：<a href="https://github.com/MarkusPersad/GH-Server.git">GH-Server</a></p>

## ✨ 主要特性

- 🌍 **双引擎地图渲染**
  - Cesium.js 实现 3D 地球可视化（支持光影、地形、时钟控制）
  - MapLibre GL JS 高性能 2D 矢量瓦片渲染
  - Deck.gl 数据可视化层

- 📊 **多格式数据加载**
  - GeoJSON（可指定填充色与描边色）
  - Shapefile（自动转换为 GeoJSON 后加载）
  - CZML（含时钟动画联动）
  - 3D Tiles（含 LOD 优化、注视点渲染、跳级加载）
  - GeoTIFF（自动识别投影坐标系）

- 🔬 **空间分析工具**
  - 3D 可视域分析 (Viewshed3D)：指定观察点和目标点计算可视范围
  - 路径规划 (RoutePlan)：支持驾车/骑行/步行/公交，含 3D 模型动画
  - 距离与面积测量 (Measure)

- 🎨 **现代化 UI**
  - Tailwind CSS v4 + Reka UI 无头组件
  - 响应式设计，桌面端侧边栏 / 移动端底部导航栏自适应
  - 全屏模式、启动画面、系统托盘最小化

- 👤 **用户系统**
  - 登录 / 注册
  - 用户信息管理与本地持久化
  - 头像上传 (自动 WebP 压缩 + Base64 编码)

- 🚀 **桌面端原生能力**
  - 自定义 URI scheme `stream://` 实现大文件流式加载
  - 摄像头录制 (crabcamera)
  - 系统通知、文件对话框、进程管理
  - 单实例运行

- 🖥️ **跨平台支持**
  - Windows、macOS、Linux 全平台
  - 自动检测桌面环境 (KDE / GNOME / Hyprland 等 20+ 种)

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite 8
- **语言**: TypeScript 6
- **状态管理**: Pinia 3
- **路由**: Vue Router 5
- **UI 组件**: Reka UI（无头组件）、Lucide Vue Next（图标）、Tabler Icons Vue
- **样式**: Tailwind CSS v4 + tw-animate-css（动画）
- **地图引擎**:
  - Cesium.js 1.142+
  - MapLibre GL JS 5.24+
  - Deck.gl 9.3+
  - tiff-imagery-provider（GeoTIFF 加载）
- **空间分析**: Turf.js 7、Proj4（投影转换）
- **表单验证**: Vee-Validate + Zod 4
- **工具库**: VueUse、Motion-V、html2canvas-pro、vue-sonner

### 后端 (Rust)
- **框架**: Tauri 2（Rust 2024 Edition）
- **异步运行时**: Tokio (full)
- **插件**:
  - `tauri-plugin-dialog` — 系统文件对话框
  - `tauri-plugin-fs` — 文件系统访问
  - `tauri-plugin-http` — HTTP 客户端
  - `tauri-plugin-notification` — 系统通知
  - `tauri-plugin-shell` / `tauri-plugin-process` — 进程管理
  - `tauri-plugin-store` — 本地持久化存储
  - `tauri-plugin-upload` — 文件上传
  - `tauri-plugin-os` — 系统信息
  - `tauri-plugin-opener` — 外部链接打开
  - `tauri-plugin-single-instance` — 单实例管理
  - `crabcamera` — 摄像头录制
- **数据处理**:
  - `shp2geojson-cesium` — Shapefile → GeoJSON 转换
  - `image` + `jpeg-encoder` + `base64` — 图片编解码与 WebP 压缩
  - `mime` — MIME 类型检测
  - `http-range` + `percent-encoding` — 流式文件服务
- **网络**: `public-ip-address`（公网 IP）、`numeris`（数字格式化）
- **系统**: `detect-desktop-environment`（桌面环境检测）
- **序列化**: `serde` + `serde_json` + `anyhow`

## 📦 安装与运行

### 前置要求

- [Node.js](https://nodejs.org/) (推荐最新 LTS 版本)
- [Bun](https://bun.sh/) 或 npm/yarn/pnpm
- [Rust](https://www.rust-lang.org/tools/install) (最新稳定版，需支持 Rust 2024 Edition)
- 系统依赖：[Tauri 2 前置要求](https://tauri.app/start/prerequisites/)

### 开发环境设置

1. **克隆仓库**
```bash
git clone <repository-url>
cd geo-spark
```

2. **安装前端依赖**
```bash
bun install
# 或 npm install
```

3. **启动开发环境**
```bash
bun run tauri dev
# 或 npm run tauri dev
```

这将同时启动 Vite 开发服务器（端口 1420）和 Tauri 窗口。

### 构建生产版本

```bash
bun run tauri build
```

产物位于 `src-tauri/target/release/bundle/`。

## 📁 项目结构

```
geo-spark/
├── src/                        # 前端源代码
│   ├── assets/                # 静态资源
│   ├── components/            # Vue 组件
│   │   ├── cesium/           # Cesium 地图组件 + 工具栏
│   │   │   └── toolbar/     # BaseLayerSwitch, Clock, Export, FileLoader,
│   │   │                       GeoCoder, Light, Location, Measure,
│   │   │                       Popup, RoutePlan, TerrainToggle,
│   │   │                       Viewshed3D, Zoom
│   │   ├── maplibre/         # MapLibre 地图组件 + 图层
│   │   ├── ui/               # Reka UI 基础组件 (40+)
│   │   ├── forms/            # 登录/注册表单
│   │   ├── data/             # DataTable + FloatingButton
│   │   └── main/             # AppSideBar, MobileDock, NavMain, NavUser
│   ├── lib/                  # 工具函数
│   │   ├── CesiumUtils/     # 可视域分析, GLSL, 坐标工具
│   │   └── state/           # Pinia Stores (sources, clock, settings...)
│   ├── mainViews/            # 主视图: CesiumShow, DataManager, Setting
│   ├── pages/                # 路由页面: Login, Main
│   └── App.vue               # 根组件
├── src-tauri/                # Tauri / Rust 后端
│   ├── src/
│   │   ├── lib.rs           # Tauri 入口 + 命令注册 + 自定义协议
│   │   └── geo_spark/       # 业务模块
│   │       ├── mod.rs       # 公网 IP、头像处理
│   │       ├── shapefile_to_geojson.rs
│   │       ├── states.rs    # 应用状态
│   │       └── stream_file.rs  # 流式文件服务
│   ├── capabilities/        # Tauri 权限声明
│   ├── icons/               # 应用图标（全平台）
│   └── tauri.conf.json
├── public/                   # 公共资源 (glb, 启动页)
├── package.json
└── vite.config.ts
```

## 🔌 可用命令

```bash
bun run dev          # 仅启动 Vite 开发服务器
bun run tauri dev    # 启动完整 Tauri 开发环境
bun run build        # 构建前端 (含 vue-tsc 类型检查)
bun run tauri build  # 构建完整桌面应用
bun run preview      # 预览构建产物
```

## 🗺️ 核心功能模块

### 0. 侧边栏数据源管理
- 基于 Pinia 全局状态，跨组件共享加载的数据源
- 通过动态路由参数 `/map/:key?/:delete?` 实现数据源的定位与移除
- 支持桌面端侧边栏（AppSideBar）和移动端底部导航（MobileDock）

### 1. Cesium 3D 可视化 (`CesiumShow`)
- **数据加载**：GeoJSON / Shapefile / CZML / 3D Tiles / GeoTIFF
- **底图切换**：多图层叠加，可切换显示
- **地形**：支持地形开关
- **时钟控制**：播放 / 暂停 / 倍速，CZML 数据自动联动
- **光照分析**：模拟不同时段的光照效果
- **可视域分析**：两点间可视范围计算与 3D 可视化
- **路径规划**：接入后端 API，支持驾车 / 骑行 / 步行 / 公交，3D 模型路径动画
- **测量工具**：距离和面积测量
- **地理编码**：地址搜索与定位
- **定位**：跳转到当前位置
- **导出**：截图导出 (html2canvas-pro)
- **气泡弹窗**：点击要素显示自定义信息

### 2. MapLibre 2D 地图 (`DataManager`)
- 高性能矢量瓦片渲染 (OSM 底图)
- Deck.gl 数据可视化图层
- 与 DataTable 联动展示属性数据

### 3. 用户系统
- 登录 / 注册表单（含 Vee-Validate + Zod 校验）
- 用户信息持久化到本地 Store
- 头像上传自动转 WebP 并 Base64 编码

### 4. 桌面特性
- **启动画面**：应用启动时显示 splashscreen
- **单实例**：重复启动自动聚焦已有窗口
- **系统托盘**：关闭窗口最小化到托盘，防止误关闭
- **全屏模式**：地图全屏沉浸体验
- **通知**：原生系统通知
- **桌面环境检测**：自动识别当前桌面环境 (KDE / GNOME / Hyprland 等)

## 🎯 开发指南

### IDE 推荐

- **VS Code** + 扩展：Vue - Official、Tauri、rust-analyzer、Tailwind CSS IntelliSense
- **RustRover** / **IntelliJ IDEA** + Rust 插件（用于 Rust 开发）

### 代码规范
- 代码注释使用中文
- 遵循 Vue 3 Composition API 最佳实践
- TypeScript 严格模式
- Rust 官方代码风格指南

## 🤝 贡献

欢迎提交 Issue 和 Pull Request：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 — 详见 [LICENSE](LICENSE)。

## 👨‍💻 作者

**MarkusPersad** — msp060308@gmail.com

## 🙏 致谢

感谢以下开源项目：

- [Tauri](https://tauri.app/) — 构建更小、更快、更安全的桌面应用
- [Vue.js](https://vuejs.org/) — 渐进式 JavaScript 框架
- [Cesium](https://cesium.com/) — 3D 地理空间可视化平台
- [MapLibre](https://maplibre.org/) — 开源地图渲染引擎
- [Tailwind CSS](https://tailwindcss.com/) — 实用优先的 CSS 框架
- [Reka UI](https://reka-ui.com/) — 无头 UI 组件库
- [Deck.gl](https://deck.gl/) — 大规模数据可视化框架
- [Turf.js](https://turfjs.org/) — 浏览器端空间分析库

---

<div align="center">
  <p>如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！</p>
</div>
