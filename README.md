# August-Pei.github.io

React + Vite 音乐制作、内容创作与个人履历网站。

目标仓库：https://github.com/August-Pei/August-Pei.github.io
目标站点：https://august-pei.github.io/

## 本地开发

需要 Node.js 24（或满足锁文件要求的版本）以及 Python 3.10 以上。

```sh
npm ci
npm run setup:data
npm run dev
```

开发服务通过 `/api/overall-data` 读取现有 Python 汇总与趋势脚本。

## 构建与预览

```sh
npm run build
npm run preview
```

构建时 Vite 同时读取 `scripts/overall_data.py` 与 `scripts/growth.py` 的结果，将完整合并数据生成到 `dist/overall-data.json`。生产页面读取该静态文件，GitHub Pages 无需运行 Python 后端。更改 data 后需重新构建发布。

## 手动发布

为保留由网站作者负责构建验证和调试的协作约定，工作流只通过 `workflow_dispatch` 手动触发，推送源码不会自动运行此工作流。

1. 在仓库 Settings → Pages → Build and deployment 将 Source 设置为 GitHub Actions。
2. 调试完成后，在 Actions 选择 “Deploy portfolio to GitHub Pages”。
3. 点击 Run workflow，选择 main 并运行。
4. 工作流安装 Node/Python 依赖，构建最新 dist，再发布整个静态产物。

本仓库为用户主页，Vite base 使用 `/`，与已有根路径资源地址一致。

## 源码与素材

保留全部 src、public，以及当前入口直接导入的 Photos 和 music 文件，保留社交数据生成所需两份 Python 脚本、requirements 和 15 份后台导出表。

未上传本地 node_modules、Python 虚拟环境、旧 dist、缓存、历史截图、登录凭据或未引用的原始素材。原始开发仓库的既有提交和未提交文件仍保留在本地。

此次准备没有执行构建、测试或浏览器调试；构建和最终运行效果由作者确认。
