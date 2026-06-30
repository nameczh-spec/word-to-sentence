/**
 * 本地词典代理服务器 - proxy-server.js
 * 转发有道词典请求，解决浏览器跨域限制
 * 
 * 启动方式: node proxy-server.js
 * 默认端口: 3000
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;

    // 只处理 /dict 路径
    if (parsedUrl.pathname !== '/dict') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found. Use /dict?q=word' }));
        return;
    }

    const word = query.q;
    if (!word) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing query parameter: q' }));
        return;
    }

    console.log(`[Proxy] 查询单词: ${word}`);

    // 转发到有道词典API
    const youdaoUrl = `https://dict.youdao.com/jsonapi?q=${encodeURIComponent(word.toLowerCase())}`;

    https.get(youdaoUrl, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    }, (youdaoRes) => {
        let data = '';
        youdaoRes.on('data', chunk => data += chunk);
        youdaoRes.on('end', () => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.writeHead(youdaoRes.statusCode);
            res.end(data);
            console.log(`[Proxy] 查询成功: ${word} (HTTP ${youdaoRes.statusCode})`);
        });
    }).on('error', (err) => {
        console.error(`[Proxy] 查询失败: ${word}, 错误: ${err.message}`);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Upstream error: ${err.message}` }));
    });
});

server.listen(PORT, () => {
    console.log(`[Proxy] 词典代理服务器已启动: http://localhost:${PORT}`);
    console.log(`[Proxy] 使用方式: http://localhost:${PORT}/dict?q=hello`);
});

// 优雅退出
process.on('SIGINT', () => {
    console.log('\n[Proxy] 正在关闭服务器...');
    server.close(() => {
        console.log('[Proxy] 服务器已关闭');
        process.exit(0);
    });
});
