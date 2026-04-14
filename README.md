# Geo-Spark

<div align="center">
  <img src="app-icon.png" alt="Geo-Spark Logo" width="128" height="128">
  <p><strong>GeoServer 管理应用程序 - 基于 Tauri + Vue 3 + TypeScript 构建的跨平台地理空间数据管理工具</strong></p>
</div>

## 📖 项目简介

Geo-Spark 是一个现代化的桌面应用程序，用于管理和可视化地理空间数据。它结合了 Cesium 和 MapLibre GL JS 提供强大的 3D 地图渲染能力，支持多种地理空间数据格式的加载、转换和管理。

## ✨ 主要特性

- 🌍 **双引擎地图渲染**
  - 集成 Cesium.js 实现 3D 地球可视化
  - 支持多种底图图层（OSM 等）

- 📊 **地理空间数据管理**
  - 支持 Shapefile 到 GeoJSON 格式转换
  - 流式文件处理，支持大文件加载
  - 数据表格展示与管理

- 🎨 **现代化 UI 设计**
  - 基于 Tailwind CSS v4 和 DaisyUI 构建
  - 响应式设计，适配不同屏幕尺寸
  - 流畅的动画效果（使用 Motion-V）

- 🔧 **丰富的功能模块**
  - 用户登录/注册系统
  - 数据管理器
  - 系统托盘支持

- 🚀 **跨平台支持**
  - Windows、macOS、Linux 全平台支持
  - 原生系统集成（通知、对话框、文件系统等）

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite 6
- **语言**: TypeScript 5
- **状态管理**: Pinia 3
- **路由**: Vue Router 5
- **UI 组件库**: 
  - Reka UI（无头组件）
  - Lucide Vue Next（图标）
  - Tabler Icons Vue
- **样式**: Tailwind CSS v4 + DaisyUI
- **地图引擎**:
  - Cesium.js 1.140+
  - MapLibre GL JS 5.23+
  - Deck.gl 9.3+（数据可视化层）
- **表单验证**: Vee-Validate + Zod
- **工具库**: VueUse, Turf.js, Proj4

### 后端 (Rust)
- **框架**: Tauri 2
- **异步运行时**: Tokio
- **数据处理**:
  - shp2geojson-cesium（Shapefile 转换）
  - czml（CZML 格式支持）
  - satkit（卫星轨道计算）
  - chrono（时间处理）
- **序列化**: Serde + Serde JSON

## 📦 安装与运行

### 前置要求

确保你的系统已安装以下工具：

- [Node.js](https://nodejs.org/) (推荐最新 LTS 版本)
- [Bun](https://bun.sh/) 或 npm/yarn/pnpm
- [Rust](https://www.rust-lang.org/tools/install) (最新稳定版)
- 系统依赖（参考 [Tauri 文档](https://tauri.app/start/prerequisites/)）

### 开发环境设置

1. **克隆仓库**
```bash
git clone <repository-url>
cd geo-spark
```

2. **安装前端依赖**
```bash
bun install
# 或使用 npm
npm install
```

3. **启动开发服务器**
```bash
bun run tauri dev
# 或
npm run tauri dev
```

这将同时启动 Vite 开发服务器和 Tauri 应用程序。

### 构建生产版本

```bash
bun run tauri build
# 或
npm run tauri build
```

构建完成后，可执行文件将位于 `src-tauri/target/release/bundle/` 目录下。

## 📁 项目结构

```
geo-spark/
├── src/                      # 前端源代码
│   ├── assets/              # 静态资源
│   ├── components/          # Vue 组件
│   │   ├── cesium/         # Cesium 地图组件
│   │   ├── maplibre/       # MapLibre 地图组件
│   │   ├── ui/             # UI 基础组件
│   │   ├── forms/          # 表单组件
│   │   └── main/           # 主界面组件
│   ├── lib/                # 工具函数和模块
│   ├── mainViews/          # 主要视图页面
│   ├── pages/              # 路由页面
│   └── App.vue             # 根组件
├── src-tauri/              # Tauri/Rust 后端
│   ├── src/
│   │   └── geo_spark/     # Rust 业务逻辑
│   ├── icons/             # 应用图标
│   ├── Cargo.toml         # Rust 依赖配置
│   └── tauri.conf.json    # Tauri 配置
├── public/                 # 公共资源
├── package.json           # Node.js 依赖配置
└── vite.config.ts        # Vite 配置
```

## 🔌 可用的脚本命令

```bash
# 开发模式
bun run dev          # 仅启动 Vite 开发服务器
bun run tauri dev    # 启动完整的 Tauri 开发环境

# 构建
bun run build        # 构建前端
bun run tauri build  # 构建完整应用

# 预览
bun run preview      # 预览生产构建
```

## 🗺️ 核心功能模块

### 0、SideBar数据源管理
- 通过全局状态(`Pinia`)实现跨组件数据共享
- 通过可选动态传参路由实现数据源管理

### 1. Cesium 3D 可视化
- 3D 地球渲染
- 地理空间数据叠加显示
- 相机控制和视角切换
- 工具栏交互
- 光照分析
- 全局时钟控制
- 数据加载[GeoJSON(可指定Color)、Shapefile(可指定Color)、CZML、3DTiles]
- GeoCoder
- Imagery切换
- 自定义气泡弹窗

### 2. MapLibre 2D 地图
- 高性能矢量瓦片渲染
- 自定义图层支持
- Deck.gl 数据可视化集成

### 3. 用户系统
- 登录/注册功能
- 用户信息管理
- 会话状态持久化

## 🎯 开发指南

### IDE 推荐配置

推荐使用以下开发环境：

- **[VS Code](https://code.visualstudio.com/)** + 扩展:
  - [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
  - [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

- **RustRover** 或 **IntelliJ IDEA** + Rust 插件（用于 Rust 开发）

### 代码规范

- 所有代码注释使用中文
- 遵循 Vue 3 Composition API 最佳实践
- 使用 TypeScript 严格模式
- 遵循 Rust 官方代码风格指南

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！在贡献代码之前，请：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

**MarkusPersad**
- Email: msp060308@gmail.com

## 🙏 致谢

感谢以下开源项目：

- [Tauri](https://tauri.app/) - 构建更小、更快、更安全的桌面应用
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Cesium](https://cesium.com/) - 3D 地理空间可视化平台
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

---

<div align="center">
  <p>如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！</p>
</div>
