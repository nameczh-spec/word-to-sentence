// youdao-proxy.js
const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.get('/api/youdao', (req, res) => {
  const word = req.query.q;
  if (!word) {
    return res.status(400).json({ error: '缺少单词参数' });
  }

  console.log(`[代理] 收到请求，单词: ${word}`);

  const url = `https://dict.youdao.com/suggest?q=${encodeURIComponent(word)}&doctype=json`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://dict.youdao.com/'
  };

  request(url, { headers }, (error, response, body) => {
    if (error) {
      console.error(`[代理] 请求有道词典失败: ${error.message}`);
      return res.status(500).json({ error: '请求有道词典失败', detail: error.message });
    }

    console.log(`[代理] 有道词典返回状态: ${response.statusCode}`);

    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json({ error: '有道词典返回错误', status: response.statusCode });
    }

    try {
      const data = JSON.parse(body);
      res.json(data);
    } catch (parseError) {
      console.error(`[代理] 解析返回数据失败: ${parseError.message}`);
      res.status(500).json({ error: '解析返回数据失败', detail: parseError.message });
    }
  });
});

app.listen(port, () => {
  console.log(`✅ 有道词典代理已启动，地址：http://localhost:${port}/api/youdao`);
  console.log(`🔍 示例请求：http://localhost:${port}/api/youdao?q=database`);
});