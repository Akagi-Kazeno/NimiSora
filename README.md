# NimiSora

一个基于 Electron 和 Angular 的桌面应用，使用本地 SQLite 数据库。

## 目录结构
- `main.ts`：Electron 主进程入口
- `preload.ts`：主进程与渲染进程通信桥接
- `renderer.ts`：渲染进程入口
- `services/`：数据库、日志等服务实现
- `ui/`：Angular 前端项目

## 启动方式
1. 安装依赖：`npm install`
2. 启动开发：`npm run dev`
3. 打包发布：`npm run build`

