# KC901 系列网络分析仪编程手册

KC901 Series Network Analyzer Programming Manual — 中文 / English

KC901 系列网络分析仪的中英双语网页编程手册，涵盖通信协议、ASCII 命令、测量控制和校准说明。当前手册版本为 **0.7.1**，包含第三代与第四代仪器的相关说明；具体功能请以手册中的型号与固件适用范围为准。

这是一个纯静态网站，可直接在浏览器中阅读、部署到静态网站托管服务，或通过 iframe 嵌入其他网站。

## 功能

- 中英文切换、章节目录与固定锚点链接。
- 浏览器端全文搜索，无需后端服务。
- 适配桌面和移动设备，提供打印样式。
- 协议示例可直接选择、复制。
- 页面资源随仓库提供，可离线阅读；禁用 JavaScript 后仍可阅读双语正文。

## 快速开始

下载或克隆仓库后，用浏览器打开 [index.html](index.html) 即可阅读，无需安装依赖。

如需通过本地 HTTP 服务预览，在项目目录运行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

然后访问 `http://127.0.0.1:8000/`。本地预览服务需要 Python。

## 项目结构

```text
.
├── index.html              # 生成的完整手册，纳入版本管理以便直接部署
├── embed-example.html      # iframe 嵌入示例
├── content/
│   ├── manifest.json       # 章节顺序、源文件路径和锚点 ID
│   ├── zh/                 # 中文章节
│   └── en/                 # 英文章节
├── templates/page.html     # 页面框架与目录、搜索界面
├── assets/
│   ├── style.css           # 页面、移动端和打印样式
│   ├── manual.js           # 语言切换、搜索与章节定位
│   └── images/             # 双语正文共用图片
├── build.py                # 构建与内容校验脚本
└── build.cmd               # Windows 构建入口
```

## 修改与构建

构建需要 **Python 3.9 或以上版本**，仅使用标准库，无需安装第三方依赖。

1. 编辑 `content/zh/` 与 `content/en/` 下的对应章节，使用 UTF-8 编码保存。两种语言独立维护，需要同步修改。
2. 新增或调整章节时，同步修改 `content/manifest.json`；页面框架在 `templates/page.html` 中维护。
3. 在项目目录运行 `python build.py`，Windows 也可双击 `build.cmd`。
4. 打开 `index.html` 检查正文、语言切换、搜索和章节链接；如使用嵌入方式，也检查 `embed-example.html`。
5. 提交源文件和重新生成的 `index.html`。

请勿直接编辑 `index.html`，重新构建会覆盖该文件。仅修改 CSS 或 JavaScript 时，刷新页面即可查看变化。

章节使用 HTML 保存表格和协议文本。编辑时请保留章节的 `id`、标题层级及协议示例中有实际意义的字符。目录标题来自各章节的首个 `h2`、`h3` 或 `h4`。

构建脚本会检查章节标题、章节 ID、重复 ID、内部锚点链接和本地资源，校验通过后才写入 `index.html`。

## 部署与嵌入

将 `index.html` 和整个 `assets/` 目录上传到静态网站托管服务，保持它们的相对位置。运行网页无需 Python 或后端服务。`content/`、`templates/` 和构建脚本用于维护，保留在源码仓库中即可。

例如部署到网站的 `/manual/kc901/` 后，可使用以下代码嵌入：

```html
<iframe
  src="/manual/kc901/index.html"
  title="KC901 中英双语编程手册"
  style="display:block;width:100%;height:85vh;min-height:600px;border:0"
  loading="lazy">
</iframe>
```

按实际部署地址修改 `src`。示例使用 iframe 内部滚动，无需父页面配套脚本。服务器应使用 UTF-8 提供文本资源，且允许目标网站通过 iframe 加载手册。

## 反馈与贡献

欢迎通过仓库的 Issue 或 Pull Request 反馈文档错误、翻译问题和网页改进。涉及命令行为时，请提供仪器型号、硬件代次、固件版本、对应章节及可复现的命令和响应，便于核对。

提交内容修改前，请同步检查中英文章节，运行构建并验证生成的页面。
