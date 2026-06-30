/**
 * 单词段落生成工具 - 移动版启动程序
 * 
 * 纯静态文件服务器，无第三方依赖。
 * 每次启动时给 HTML 中的 JS/CSS 链接注入版本号
 * 彻底解决浏览器缓存问题。
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const STATIC_PORT = 8080;
const PROJECT_DIR = __dirname;
const VERSION = Date.now().toString(36); // 每次启动生成唯一版本号

let serverInstance = null;

// ==================== 日志 ====================
const log = {
    ok: (t) => console.log(`  \x1b[32mOK\x1b[0m  ${t}`),
    doing: (t) => console.log(`  \x1b[34m>\x1b[0m  ${t}`),
    warn: (t) => console.log(`  \x1b[33m!\x1b[0m  ${t}`),
    fail: (t) => console.log(`  \x1b[31mX\x1b[0m  ${t}`)
};

// ==================== 端口管理 ====================
function isPortInUse(port) {
    return new Promise((resolve) => {
        const s = net.createServer();
        s.once('error', () => resolve(true));
        s.once('listening', () => { s.close(); resolve(false); });
        s.listen(port, '127.0.0.1');
    });
}

function killPortProcesses(port) {
    return new Promise((resolve) => {
        const { exec } = require('child_process');
        exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
            if (!stdout) { resolve(); return; }
            const pids = [...new Set(
                stdout.split('\n')
                    .filter(l => l.includes('LISTENING'))
                    .map(l => (l.trim().split(/\s+/).pop() || '').trim())
                    .filter(p => p && parseInt(p) > 0)
            )];
            if (pids.length > 0) {
                log.warn(`端口 ${port} 被占用(PID: ${pids.join(',')})，正在清理...`);
                pids.forEach(pid => exec(`taskkill /PID ${pid} /F`, () => {}));
                setTimeout(resolve, 2000);
            } else {
                resolve();
            }
        });
    });
}

// ==================== 静态文件服务器 ====================
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
    '.ico': 'image/x-icon'
};

/** 给 HTML 中的 script/css 链接注入版本号 */
function injectCacheBuster(html) {
    return html
        .replace(/(<script\s+[^>]*src=")([^"]+)(")/gi, (m, pre, url, post) => {
            if (url.includes('?')) return m;
            return pre + url + '?v=' + VERSION + post;
        })
        .replace(/(<link\s+[^>]*href=")([^"]+)(")/gi, (m, pre, url, post) => {
            if (url.includes('?')) return m;
            return pre + url + '?v=' + VERSION + post;
        });
}

function startStaticServer() {
    return new Promise((resolve) => {
        log.doing('启动静态文件服务器...');

        serverInstance = http.createServer((req, res) => {
            const rawPath = req.url.split('?')[0];
            const decoded = decodeURIComponent(rawPath);
            let filePath;

            if (decoded === '/' || decoded === '') {
                filePath = path.join(PROJECT_DIR, 'index.html');
            } else {
                const normalized = path.normalize(decoded);
                const joined = path.join(PROJECT_DIR, normalized);
                const relative = path.relative(PROJECT_DIR, joined);
                if (relative.startsWith('..') || path.isAbsolute(relative)) {
                    res.writeHead(403); res.end('Forbidden');
                    return;
                }
                filePath = joined;
            }

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        fs.readFile(path.join(PROJECT_DIR, 'index.html'), (err2, html) => {
                            if (err2) {
                                res.writeHead(500); res.end('Server Error');
                                return;
                            }
                            res.writeHead(200, {
                                'Content-Type': 'text/html; charset=utf-8',
                                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                                'Pragma': 'no-cache', 'Expires': '0'
                            });
                            res.end(injectCacheBuster(html.toString()));
                        });
                    } else {
                        res.writeHead(500); res.end('Server Error');
                    }
                    return;
                }

                const ext = path.extname(filePath).toLowerCase();
                const contentType = MIME[ext] || 'application/octet-stream';

                if (ext === '.html') {
                    res.writeHead(200, {
                        'Content-Type': contentType,
                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                        'Pragma': 'no-cache', 'Expires': '0'
                    });
                    res.end(injectCacheBuster(content.toString()));
                } else {
                    res.writeHead(200, {
                        'Content-Type': contentType,
                        'Cache-Control': 'no-store, must-revalidate, max-age=0',
                        'Pragma': 'no-cache', 'Expires': '0'
                    });
                    res.end(content);
                }
            });
        });

        serverInstance.listen(STATIC_PORT, '0.0.0.0', () => {
            log.ok(`静态服务器: http://localhost:${STATIC_PORT}`);
            resolve();
        });

        serverInstance.on('error', (err) => {
            log.fail(`静态服务器启动失败: ${err.message}`);
            resolve();
        });
    });
}

// ==================== 打开浏览器 ====================
function openBrowser() {
    const url = `http://localhost:${STATIC_PORT}`;
    log.doing(`打开浏览器: ${url}`);
    try {
        const { spawn } = require('child_process');
        spawn('cmd', ['/c', 'start', url], { shell: true, detached: true, stdio: 'ignore' });
    } catch (e) {
        log.warn('无法自动打开浏览器，请手动访问: ' + url);
    }
}

// ==================== 关闭 ====================
function shutdown() {
    console.log('');
    log.warn('正在关闭服务...');
    if (serverInstance) {
        serverInstance.close(() => log.ok('静态服务器已停止'));
    }
    setTimeout(() => process.exit(0), 500);
}

// ==================== 主入口 ====================
async function main() {
    console.log('');
    console.log('  \x1b[34m=====================================\x1b[0m');
    console.log('  \x1b[34m   单词段落生成工具 - 移动版\x1b[0m');
    console.log('  \x1b[34m   版本: ' + VERSION.substring(0, 6) + '\x1b[0m');
    console.log('  \x1b[34m=====================================\x1b[0m');
    console.log('');

    process.title = 'VocabTool-Mobile';

    // 确保 data 目录存在
    const dataDir = path.join(PROJECT_DIR, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    // 检查并清理端口
    try {
        if (await isPortInUse(STATIC_PORT)) await killPortProcesses(STATIC_PORT);
    } catch (e) {
        log.fail('端口检查失败: ' + e.message);
    }

    // 启动服务（仅静态文件，无代理）
    await startStaticServer();
    openBrowser();

    console.log('');
    console.log('  \x1b[32m  ✓ 服务已就绪\x1b[0m');
    console.log('  \x1b[2m  按 Ctrl+C 停止服务\x1b[0m');
    console.log('  \x1b[34m=====================================\x1b[0m');
    console.log('');

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    const rl = require('readline').createInterface({
        input: process.stdin, output: process.stdout
    });
    rl.on('SIGINT', () => process.emit('SIGINT'));
}

main();
