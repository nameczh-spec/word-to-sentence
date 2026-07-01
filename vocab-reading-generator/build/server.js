/**
 * VocabTool - 单词段落生成工具 独立服务器
 * 
 * 零外部依赖（仅使用 Node.js 内置模块）
 * 集成了：静态文件服务 + 有道词典代理 + 关闭检测
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ==================== 配置 ====================
const PROXY_PORT = 3000;      // 有道代理端口
const STATIC_PORT = 8080;     // 静态文件端口
const PROJECT_DIR = path.resolve(__dirname, '.');  // 项目根目录（.exe 所在目录）
const VERSION = Date.now().toString(36);

// ==================== 日志（静默模式，支持 --debug） ====================
const isDebug = process.argv.includes('--debug');
const log = {
    info: (t) => { if (isDebug) console.log(`[INFO] ${t}`); },
    ok: (t) => console.log(`  OK  ${t}`),
    doing: (t) => console.log(`  >   ${t}`),
    warn: (t) => console.log(`  !   ${t}`),
    fail: (t) => console.log(`  X   ${t}`)
};

// ==================== 关闭检测注入脚本 ====================
function getShutdownScript() {
    return `
<script>
(function(){
    // 覆盖 API 代理地址，指向内置代理（同源）
    try {
        if (window.ConfigManager && ConfigManager._getKey) {
            var _origLoad = ConfigManager.loadConfig;
            ConfigManager.loadConfig = function() {
                var cfg = _origLoad.call(this);
                cfg.apiProxyUrl = window.location.origin;
                return cfg;
            };
        }
    } catch(e) {}
    
    function safeSend(url, data) {
        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(url, data);
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', url, false);
                xhr.send(data);
            }
        } catch(e) {}
    }
    window.addEventListener('beforeunload', function() {
        safeSend('/shutdown', 'bye');
    });
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden' && document.hidden) {
            safeSend('/shutdown', 'hidden');
        }
    });
    window.addEventListener('pagehide', function() {
        safeSend('/shutdown', 'pagehide');
    });
})();
</script>`;
}

// ==================== MIME 类型 ====================
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8'
};

// ==================== HTML 注入（版本号 + 关闭检测脚本） ====================
function injectHtml(html) {
    // 注入版本号到 script/link 标签
    let result = html
        .replace(/(<script\s+[^>]*src=")([^"]+)(")/gi, (m, pre, url, post) => {
            if (url.includes('?')) return m;
            return pre + url + '?v=' + VERSION + post;
        })
        .replace(/(<link\s+[^>]*href=")([^"]+)(")/gi, (m, pre, url, post) => {
            if (url.includes('?')) return m;
            return pre + url + '?v=' + VERSION + post;
        });
    
    // 在 </body> 前注入关闭检测脚本 + API 代理地址覆盖
    result = result.replace('</body>', getShutdownScript() + '\n</body>');
    
    return result;
}

// ==================== 有道词典代理 ====================
function youdaoProxy(word) {
    return new Promise((resolve, reject) => {
        const url = `https://dict.youdao.com/suggest?q=${encodeURIComponent(word)}&doctype=json`;
        const options = {
            hostname: 'dict.youdao.com',
            path: `/suggest?q=${encodeURIComponent(word)}&doctype=json`,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://dict.youdao.com/'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('解析有道响应失败'));
                }
            });
        });

        req.on('error', (e) => reject(new Error(`请求有道失败: ${e.message}`)));
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('请求超时')); });
        req.end();
    });
}

// ==================== 静态文件服务 + 路由 ====================
let shutdownTimer = null;

function handleRequest(req, res) {
    const url = req.url.split('?')[0];
    const decoded = decodeURIComponent(url);

    // --- 关闭检测路由 ---
    if (url === '/shutdown') {
        res.writeHead(200);
        res.end('ok');
        log.info('收到关闭信号，5秒后关闭服务器...');
        // 延迟关闭，确保响应已发送
        shutdownTimer = setTimeout(() => shutdown(), 5000);
        // 如果 30 秒后仍然没有关闭，强制退出
        setTimeout(() => {
            try { process.exit(0); } catch(e) {}
        }, 35000);
        return;
    }

    // --- 取消关闭（用户快速刷新页面） ---
    if (shutdownTimer) {
        clearTimeout(shutdownTimer);
        shutdownTimer = null;
        log.info('页面重新打开，取消关闭');
    }

    // --- 有道词典代理路由 ---
    if (url === '/api/youdao') {
        const word = new URL(req.url, 'http://localhost').searchParams.get('q');
        if (!word) {
            res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: '缺少单词参数' }));
            return;
        }

        youdaoProxy(word).then(data => {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(data));
        }).catch(err => {
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: err.message }));
        });
        return;
    }

    // --- 静态文件服务 ---
    let filePath;
    if (decoded === '/' || decoded === '') {
        filePath = path.join(PROJECT_DIR, 'index.html');
    } else {
        const normalized = path.normalize(decoded).replace(/^\\+/, '');
        const joined = path.join(PROJECT_DIR, normalized);
        const relative = path.relative(PROJECT_DIR, joined);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        filePath = joined;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 404 回退到 index.html
                fs.readFile(path.join(PROJECT_DIR, 'index.html'), (err2, html) => {
                    if (err2) {
                        res.writeHead(500);
                        res.end('Server Error');
                        return;
                    }
                    res.writeHead(200, {
                        'Content-Type': 'text/html; charset=utf-8',
                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                        'Pragma': 'no-cache', 'Expires': '0'
                    });
                    res.end(injectHtml(html.toString()));
                });
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME[ext] || 'application/octet-stream';

        const headers = {
            'Content-Type': contentType,
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache', 'Expires': '0'
        };

        if (ext === '.html') {
            res.writeHead(200, headers);
            res.end(injectHtml(content.toString()));
        } else {
            res.writeHead(200, headers);
            res.end(content);
        }
    });
}

// ==================== 启动服务 ====================
let serverInstance = null;

async function start() {
    const dataDir = path.join(PROJECT_DIR, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // 启动静态文件服务器（同时包含代理）
    serverInstance = http.createServer(handleRequest);
    serverInstance.listen(STATIC_PORT, '127.0.0.1', () => {
        log.ok(`服务运行在 http://localhost:${STATIC_PORT}`);
        log.ok(`有道代理已内置（端口 ${STATIC_PORT}/api/youdao）`);
    });
    serverInstance.on('error', (err) => {
        log.fail(`服务器启动失败: ${err.message}`);
        process.exit(1);
    });

    // 等服务器就绪后打开浏览器
    await new Promise(r => setTimeout(r, 500));
    openBrowser();
}

// ==================== 打开浏览器 ====================
function openBrowser() {
    const url = `http://localhost:${STATIC_PORT}`;
    log.doing('正在打开浏览器...');
    try {
        const cmd = process.env.COMSPEC || 'cmd.exe';
        spawn(cmd, ['/c', 'start', url], {
            shell: true,
            detached: true,
            stdio: 'ignore'
        });
        log.ok('浏览器已打开');
    } catch (e) {
        log.warn('无法自动打开浏览器，请手动访问: ' + url);
    }
}

// ==================== 关闭 ====================
let shuttingDown = false;

function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    
    log.doing('正在停止服务...');
    if (serverInstance) {
        serverInstance.close(() => {
            log.ok('服务器已停止');
            setTimeout(() => process.exit(0), 200);
        });
        // 强制退出（防止 close 回调不触发）
        setTimeout(() => process.exit(0), 3000);
    } else {
        process.exit(0);
    }
}

// ==================== 主入口 ====================
console.log('');
console.log('  =====================================');
console.log('   单词段落生成工具 - VocabTool');
console.log('   版本: ' + VERSION.substring(0, 6));
console.log('  =====================================');
console.log('');
console.log('  浏览器关闭后，服务器将自动停止');
console.log('  如需手动停止，关闭此窗口即可');
console.log('');

process.title = 'VocabTool';

// 监听退出信号
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', () => {});

// 启动
start().catch(err => {
    console.error('启动失败:', err.message);
    process.exit(1);
});
