# Anitabi My Maps Exporter

[中文](README.md) | [English](README.en.md) | [日本語](README.ja.md)

Anitabi My Maps Exporter 可以把 Anitabi 巡礼地点导出为 Google My Maps 可导入的 CSV 或 KML 文件。它既可以作为普通网页使用，也可以作为 Chrome 扩展在 Anitabi 地图页中打开右侧浮动面板。

## 功能

- 从 Anitabi 地图 URL、Bangumi ID 或当前页面读取作品。
- 展示作品信息、地点缩略图、集数、时间、坐标和来源。
- 默认全选地点，支持逐项取消选择。
- 支持搜索其它作品，并把多个作品的地点加入同一个临时清单。
- 临时清单按作品分组，支持删除单点、删除整组和清空。
- 导出 UTF-8 BOM CSV，适合 Google My Maps 识别经纬度字段。
- 导出 KML，按作品创建文件夹并保留截图、来源和 Anitabi 链接。
- 支持浅色、深色和跟随系统主题。
- 支持中文、英文和日文界面。

## 安装 Chrome 扩展

可以从 [Chrome Web Store](https://chromewebstore.google.com/detail/anitabi-my-maps-exporter/fdhehgohnlgdlnhbngagpbcedfmnncee) 安装。

本地构建安装：

1. 在项目目录运行 `pnpm install && pnpm build`。
2. 打开 Chrome 的 `chrome://extensions`。
3. 开启 `Developer mode`。
4. 点击 `Load unpacked`。
5. 选择本项目目录 `anitabi-mymaps-exporter`。

## 使用

1. 打开 Anitabi 地图页，例如 `https://www.anitabi.cn/map?bangumiId=465493`。
2. 点击页面中注入的 `导出` 按钮，或点击扩展入口打开导出器。
3. 检查地点列表，取消不需要的地点。
4. 点击 `加入选中`。
5. 可继续搜索其它作品并追加地点。
6. 在临时清单中下载 CSV 或 KML。

## 普通网页模式

可以直接访问部署后的网页，输入 Bangumi ID 或 Anitabi 地图 URL 后导出。网页模式同样支持多作品临时清单和 CSV/KML 下载。

## 来源署名

导出的数据会尽量保留 Anitabi 的 origin 和 origin URL 字段。请遵守 Anitabi 及原贡献者关于来源署名和 CC BY-NC-SA 4.0 的要求。

## 许可证

本项目使用 [MIT License](LICENSE)。
