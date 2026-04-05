# 🖼️ Image Viewer — 图片瀑布流浏览器

一个基于纯前端实现的图片浏览器，支持瀑布流布局展示图片，并具备图片在线预览与编辑功能。  
无需后端，直接部署在 **Cloudflare Pages** 即可使用 🚀

***

## 📁 文件结构

项目极简，仅需两个文件：

```
Image_Viewer/
├── index.html        ← 主页面（唯一 HTML 文件）
└── editora.ico       ← 网站图标（文件名可自定义）
```

> 💡 图标文件名可以自定义，只需确保 HTML 中的引用路径与文件名一致即可。

***

## 🔗 网站图标配置

在 `index.html` 的 `<title>` 标签**下方**添加如下一行即可：

```html
<head>
  <meta charset="UTF-8">
  <title>Image Viewer</title>

  <!-- 网站图标 -->
  <link rel="icon" href="editora.ico" type="image/x-icon">

  <!-- 其他样式/脚本... -->
</head>
```

如果你将图标命名为其他名字（例如 `favicon.ico` 或 `photo.ico`），对应修改 `href` 值即可：

```html
<link rel="icon" href="favicon.ico" type="image/x-icon">
```

***

## ☁️ Cloudflare Pages 部署教程

### 方式一：直接上传（推荐新手）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → 点击 **Create application**
3. 选择 **Pages** → **Upload assets（直接上传）**
4. 将项目文件夹（包含 `index.html` 和 `.ico` 文件）**打包成 ZIP** 后上传
5. 点击 **Deploy site**，部署完成后即可获得专属访问链接 🎉

### 方式二：连接 GitHub 自动部署

1. 将项目 Push 到你的 GitHub 仓库
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 **Workers & Pages** → **Create application** → **Pages**
4. 选择 **Connect to Git** → 授权并选择对应仓库
5. 配置构建设置：

   | 配置项 | 值 |
   |---|---|
   | Framework preset | `None` |
   | Build command | （留空） |
   | Build output directory | `/`（根目录）或 `.` |

6. 点击 **Save and Deploy**，后续每次 Push 代码将自动重新部署 ✅

***

## 🚀 本地预览

```bash
# 克隆项目
git clone https://github.com/ethgan/Image_Viewer.git

# 进入目录
cd Image_Viewer

# 直接用浏览器打开 index.html 即可运行
```

***

## ✨ 项目特点

- 🧱 瀑布流布局（类似 Pinterest）
- 🖼️ 图片点击放大预览
- ✏️ 图片在线编辑（基础操作）
- ⚡ 静态页面即可运行（无需后端）
- 📱 响应式设计，适配不同屏幕尺寸

***

## 🛠️ 技术栈

- **HTML5**
- **CSS3**（Flexbox / Grid / 瀑布流布局）
- **JavaScript**（图片加载 & 交互逻辑）

***

## 💡 适用场景

- 图片展示网站
- 图库 / 相册系统
- 摄影作品集
- AI 生成图片展示平台
- 图片编辑工具原型

***

## 🎬 视频教程

项目讲解视频：[https://www.youtube.com/watch?v=WcCOD6Fjn44](https://www.youtube.com/watch?v=WcCOD6Fjn44)

***

## 🔗 源项目地址

GitHub 仓库：[https://github.com/ethgan/Image_Viewer/tree/main](https://github.com/ethgan/Image_Viewer/tree/main)

***

## 📄 License

本项目遵循 [MIT License](LICENSE)，欢迎自由使用与修改。
