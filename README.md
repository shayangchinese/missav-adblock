# 🛡️ MissAV AdBlock — Surge Module

拦截 MissAV (missav.ws) 全类型广告的 Surge 模块，适用于 **macOS** 和 **iOS** 双平台。

## ✨ 功能

| 广告类型 | 拦截方式 |
|---------|---------|
| 🪟 弹窗广告 | 拦截 `window.open`、popunder 事件劫持 |
| 📰 页面内嵌广告 | CSS 隐藏 + DOM 移除广告 div/iframe |
| 🔀 跳转广告 | 阻止 onclick 跳转、redirect 链接 |
| 🎬 视频广告 | 拦截 VAST/VPAID 加载、移除播放器广告覆盖层 |

## 🚫 拦截的广告网络（40+ 域名）

ExoClick · JuicyAds · TSyndicate · TrafficStars · PopAds · PopCash · ClickAdu · PropellerAds · AdMaven 等

## 📦 文件说明

| 文件 | 说明 |
|------|------|
| `MissAV_AdBlock.sgmodule` | Surge 模块主文件（规则 + URL 重写 + 脚本配置） |
| `missav-adremover.js` | 页面广告清理脚本（DOM 移除 + CSS 注入 + 运行时保护） |

## 📲 安装方法

### macOS

1. 下载两个文件到同一目录
2. Surge Mac → 侧边栏 → **模块** → **+** → **从文件安装** → 选择 `.sgmodule`
3. 开启 **增强模式** + **MitM**（安装并信任证书） + **脚本**

### iOS

1. 下载两个文件到 iPhone（通过 iCloud / AirDrop / 文件 App）
2. Surge iOS → **模块** → **安装新模块** → **从文件导入**
3. 开启 **MitM** → 安装证书 → **设置 → 通用 → 关于本机 → 证书信任设置** → 信任 Surge CA 证书
4. 开启 **脚本** 功能

> ⚠️ iOS 必须在系统设置中手动开启对 Surge CA 证书的完全信任，否则 HTTPS 解密无法工作。

### 快速安装（URL 方式）

在 Surge 中通过 URL 安装模块：

```
https://raw.githubusercontent.com/syang/missav-adblock/main/MissAV_AdBlock.sgmodule
```

## 🔧 技术实现

- **[Rule]** — 40+ 广告域名 REJECT 规则
- **[URL Rewrite]** — 广告请求 URL 拦截重写
- **[Map Local]** — 广告 JS 请求映射为空响应
- **[Script]** — HTTP Response 注入去广告脚本
- **[MITM]** — HTTPS 解密目标域名

## 📄 License

MIT License
