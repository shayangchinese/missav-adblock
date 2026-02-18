/*
 * MissAV AdRemover Script for Surge
 * 移除 missav.ws 页面内的广告元素、弹窗、跳转劫持和视频广告
 */

const url = $request.url;
let body = $response.body;

// ========== 1. 移除弹窗广告脚本 ==========
// 移除 window.open 弹窗
body = body.replace(/window\.open\s*\([^)]*\)/gi, '');
// 移除 popunder / popup 脚本
body = body.replace(/<script[^>]*>[\s\S]*?(popunder|popup|pop_under|popUnder)[\s\S]*?<\/script>/gi, '');
// 移除广告联盟加载脚本
body = body.replace(/<script[^>]*src=['"]*[^'"]*?(tsyndicate|exoclick|exosrv|realsrv|juicyads|trafficstars|popads|popcash|clickadu|adtng|xlivrdr)[^'"]*['"][^>]*>[\s\S]*?<\/script>/gi, '');
// 移除内联广告脚本
body = body.replace(/<script[^>]*>[\s\S]*?(ad[_-]?banner|ad[_-]?slot|ad[_-]?container|ad[_-]?wrapper|adsbygoogle)[\s\S]*?<\/script>/gi, '');

// ========== 2. 移除页面内嵌广告元素 ==========
// 移除常见广告 div
body = body.replace(/<div[^>]*class=['"][^'"]*?(ad-|ads-|advert|banner-ad|ad_banner|sponsor|ad-container|ad-wrapper|ad-slot|ad-zone)[^'"]*['"][^>]*>[\s\S]*?<\/div>/gi, '');
// 移除广告 iframe
body = body.replace(/<iframe[^>]*src=['"][^'"]*?(exoclick|exosrv|realsrv|juicyads|tsyndicate|trafficstars|doubleclick|googlesyndication|adnxs)[^'"]*['"][^>]*>[\s\S]*?<\/iframe>/gi, '');
body = body.replace(/<iframe[^>]*id=['"][^'"]*?(ad[_-]|banner)[^'"]*['"][^>]*>[\s\S]*?<\/iframe>/gi, '');
// 移除广告 a 标签包裹的区域
body = body.replace(/<a[^>]*href=['"][^'"]*?(exoclick|tsyndicate|juicyads|trafficstars|xlivrdr)[^'"]*['"][^>]*>[\s\S]*?<\/a>/gi, '');

// ========== 3. 阻止跳转广告 ==========
// 禁用 onclick 跳转
body = body.replace(/onclick\s*=\s*['"][^'"]*window\.open[^'"]*['"]/gi, '');
body = body.replace(/onclick\s*=\s*['"][^'"]*location\.href\s*=[^'"]*['"]/gi, '');
// 移除 document.addEventListener 中的跳转逻辑
body = body.replace(/<script[^>]*>[\s\S]*?document\.addEventListener\s*\(\s*['"]click['"][\s\S]*?window\.open[\s\S]*?<\/script>/gi, '');

// ========== 4. 移除视频广告相关 ==========
// 移除 VAST/VPAID 视频广告加载
body = body.replace(/<script[^>]*>[\s\S]*?(VAST|VPAID|vast_url|video_ad|preroll|midroll|postroll)[\s\S]*?<\/script>/gi, '');
// 移除视频播放器内的广告覆盖层
body = body.replace(/<div[^>]*class=['"][^'"]*?(video-ad|player-ad|overlay-ad|ad-overlay|preroll-ad|vast-ad)[^'"]*['"][^>]*>[\s\S]*?<\/div>/gi, '');

// ========== 5. 注入 CSS 隐藏残余广告 ==========
const adBlockCSS = `
<style>
/* 隐藏广告容器 */
div[class*="ad-"], div[class*="ads-"], div[class*="advert"],
div[class*="banner-ad"], div[class*="ad_banner"],
div[class*="sponsor"], div[id*="ad-"], div[id*="ads-"],
div[class*="ad-container"], div[class*="ad-wrapper"],
div[class*="ad-slot"], div[class*="ad-zone"],
div[class*="exo_"], div[class*="exoclick"],
iframe[src*="exoclick"], iframe[src*="exosrv"],
iframe[src*="juicyads"], iframe[src*="realsrv"],
iframe[src*="tsyndicate"], iframe[src*="trafficstars"],
a[href*="exoclick.com"], a[href*="tsyndicate.com"],
a[href*="juicyads.com"], a[href*="trafficstars.com"],
a[href*="xlivrdr.com"],
.ad-float, .ad-popup, .ad-modal, .popunder,
div[class*="overlay"][class*="ad"],
div[style*="z-index: 9999"], div[style*="z-index:9999"],
div[style*="z-index: 99999"], div[style*="z-index:99999"] {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    width: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
}

/* 阻止弹窗背景遮罩 */
.modal-backdrop, .overlay-backdrop,
div[class*="popup-overlay"], div[class*="modal-overlay"] {
    display: none !important;
}

/* 恢复被广告遮挡的页面滚动 */
body.no-scroll, body.modal-open, body.popup-open {
    overflow: auto !important;
    position: static !important;
}
</style>`;

// 在 </head> 前注入 CSS
if (body.includes('</head>')) {
    body = body.replace('</head>', adBlockCSS + '</head>');
}

// ========== 6. 注入运行时保护脚本 ==========
const runtimeProtection = `
<script>
(function() {
    'use strict';

    // 拦截 window.open 弹窗
    const originalOpen = window.open;
    window.open = function() {
        console.log('[MissAV AdBlock] 已拦截弹窗:', arguments[0]);
        return null;
    };

    // 拦截 popunder 类型的事件监听
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'click' || type === 'mousedown' || type === 'mouseup') {
            const listenerStr = listener.toString();
            if (listenerStr.includes('window.open') ||
                listenerStr.includes('popunder') ||
                listenerStr.includes('pop_under') ||
                listenerStr.includes('location.href')) {
                console.log('[MissAV AdBlock] 已拦截可疑事件监听:', type);
                return;
            }
        }
        return originalAddEventListener.call(this, type, listener, options);
    };

    // 定期清理广告 DOM 元素
    const cleanAds = function() {
        const adSelectors = [
            'div[class*="ad-"]', 'div[class*="ads-"]',
            'div[class*="advert"]', 'div[class*="banner-ad"]',
            'div[class*="exo_"]', 'div[class*="exoclick"]',
            'iframe[src*="exoclick"]', 'iframe[src*="exosrv"]',
            'iframe[src*="juicyads"]', 'iframe[src*="realsrv"]',
            'iframe[src*="tsyndicate"]', 'iframe[src*="trafficstars"]',
            'div[class*="popup"]', 'div[class*="popunder"]',
            'a[href*="exoclick.com"]', 'a[href*="tsyndicate.com"]',
            'a[href*="juicyads.com"]', 'a[href*="xlivrdr.com"]'
        ];

        adSelectors.forEach(function(selector) {
            document.querySelectorAll(selector).forEach(function(el) {
                // 排除视频播放器本身
                if (!el.querySelector('video') && !el.classList.contains('player')) {
                    el.remove();
                }
            });
        });
    };

    // 页面加载完成后清理
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanAds);
    } else {
        cleanAds();
    }

    // 使用 MutationObserver 持续监控新增广告
    const observer = new MutationObserver(function(mutations) {
        cleanAds();
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    console.log('[MissAV AdBlock] 广告拦截已启动');
})();
</script>`;

// 在 </body> 前注入运行时保护脚本
if (body.includes('</body>')) {
    body = body.replace('</body>', runtimeProtection + '</body>');
}

$done({ body });
