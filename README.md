# 竞品分析工具

一个专为设计师打造的竞品分析工具，可以自动截图网页、分析各个模块、生成竞品分析报告。

## 功能特点

- 📸 自动截取完整网页长图
- 📊 多维度分析（视觉风格、信息架构、交互设计、可用性、品牌表达、内容策略）
- 🏷️ 自动生成优劣势标签
- 💡 提供核心设计洞察
- 📋 多产品横向对比表格
- 🎯 设计机会点建议

## 本地开发

### 安装依赖

```bash
npm install
npx playwright install chromium
```

### 启动开发服务器

```bash
npm start
```

访问 `http://localhost:3000` 即可使用。

## 部署方案

### 方案一：Render（推荐）

1. 在 GitHub 上创建仓库并推送代码
2. 访问 [render.com](https://render.com) 注册账号
3. 点击 "New +" → "Web Service"
4. 连接你的 GitHub 仓库
5. 配置：
   - **Name**: competitive-analysis-tool
   - **Runtime**: Node
   - **Build Command**: `npm install && npx playwright install chromium`
   - **Start Command**: `npm start`
6. 点击 "Create Web Service"

### 方案二：Railway

1. 在 GitHub 上创建仓库并推送代码
2. 访问 [railway.app](https://railway.app) 注册账号
3. 点击 "New Project" → "Deploy from repo"
4. 选择你的仓库
5. 在设置中添加环境变量（可选）
6. 等待部署完成

### 方案三：Vercel

1. 在 GitHub 上创建仓库并推送代码
2. 访问 [vercel.com](https://vercel.com) 注册账号
3. 点击 "New Project"
4. 导入你的仓库
5. 在项目设置中配置：
   - **Build Command**: `npm install && npx playwright install chromium`
   - **Output Directory**: 留空
6. 点击 "Deploy"

## 环境变量

可以在部署平台设置以下环境变量：

```
PORT=3000
NODE_ENV=production
```

## 技术栈

- Node.js + Express
- Playwright（浏览器自动化）
- Cheerio（HTML 解析）
- EJS（模板引擎）
- Volcengine Agent Design System（UI 设计系统）

## 项目结构

```
.
├── server.js           # 服务器主文件
├── package.json        # 项目配置
├── README.md          # 项目说明
├── views/
│   ├── index.ejs      # 首页
│   └── results.ejs    # 结果页
├── public/
│   └── screenshots/   # 截图存储目录
└── .gitignore         # Git 忽略文件
```
