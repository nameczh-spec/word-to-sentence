/**
 * 文件清单工具 - filemap.js
 * 功能：生成项目文件结构清单，记录每个文件的用途
 * 用法：node .dev-tools/filemap.js
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

const C = {
    reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m',
    gray: '\x1b[90m', bold: '\x1b[1m'
};

// 文件用途描述表
const FILE_DESCRIPTIONS = {
    // Web端 JS
    'vocab-reading-generator/js/app.js': '主应用入口，页面路由和初始化',
    'vocab-reading-generator/js/dataStore.js': '数据存储层（IndexedDB）',
    'vocab-reading-generator/js/apiRequest.js': 'API请求封装',
    'vocab-reading-generator/js/config.js': '配置管理',
    'vocab-reading-generator/js/interaction.js': '交互逻辑',
    'vocab-reading-generator/js/localGenerator.js': '本地段落生成',
    'vocab-reading-generator/js/templateManager.js': '模板管理',
    'vocab-reading-generator/js/textRender.js': '文本渲染',
    'vocab-reading-generator/js/userManager.js': '用户管理',
    'vocab-reading-generator/js/vocabSearch.js': '词库检索',
    'vocab-reading-generator/js/wordManage.js': '词单管理',
    'vocab-reading-generator/js/fileExport.js': '文件导出',
    'vocab-reading-generator/js/pastPapers.js': '真题练习主模块（路由、首页）',
    'vocab-reading-generator/js/pastPaperReader.js': '真题精读模块',
    'vocab-reading-generator/js/clozeExercise.js': '完形填空练习',
    'vocab-reading-generator/js/longSentence.js': '长难句分析',
    'vocab-reading-generator/js/translation.js': '翻译练习',
    'vocab-reading-generator/js/writing.js': '作文练习（题目展示、范文、AI批改）',

    // Web端 CSS
    'vocab-reading-generator/css/main.css': '主样式',
    'vocab-reading-generator/css/pastPapers.css': '真题练习专用样式',
    'vocab-reading-generator/css/login.css': '登录页样式',
    'vocab-reading-generator/css/popup.css': '弹窗样式',
    'vocab-reading-generator/css/theme.css': '主题样式',
    'vocab-reading-generator/css/highlight-button.css': '高亮按钮样式',

    // 移动端特有
    'vocab-reading-generator-mobile/js/dataManager.js': '移动端数据管理',
    'vocab-reading-generator-mobile/js/settingsManager.js': '移动端设置管理',
    'vocab-reading-generator-mobile/js/vocabBook.js': '移动端单词本',

    // 工具
    '.dev-tools/audit.js': '项目审计工具',
    '.dev-tools/backup.js': 'Git备份工具',
    '.dev-tools/cleanup.js': '项目清理工具',
    '.dev-tools/filemap.js': '文件清单工具（本文件）',

    // 文档
    'README.md': '项目说明文档',
    '.gitignore': 'Git忽略配置',
    'PROJECT_STATUS.md': '项目进度及纲要（主控文档）'
};

function walk(dir, base = '') {
    const result = [];
    if (!fs.existsSync(dir)) return result;

    const items = fs.readdirSync(dir).sort();
    for (const item of items) {
        if (item === '.git' || item === 'node_modules' || item === 'build') continue;
        const fullPath = path.join(dir, item);
        const relPath = base ? `${base}/${item}` : item;
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            result.push({ type: 'dir', name: item, path: relPath });
            result.push(...walk(fullPath, relPath));
        } else {
            result.push({ type: 'file', name: item, path: relPath, size: stat.size });
        }
    }
    return result;
}

function generateMap() {
    console.log(`${C.bold}${C.blue}单词化句 - 文件清单${C.reset}`);
    console.log(`${C.gray}  生成时间：${new Date().toLocaleString('zh-CN')}${C.reset}\n`);

    const items = walk(PROJECT_ROOT);
    let dirDepth = 0;

    for (const item of items) {
        if (item.type === 'dir') {
            const depth = item.path.split('/').length;
            const indent = '  '.repeat(depth - 1);
            console.log(`${indent}${C.cyan}${item.name}/${C.reset}`);
        } else {
            const depth = item.path.split('/').length;
            const indent = '  '.repeat(depth);
            const desc = FILE_DESCRIPTIONS[item.path] || '';
            const sizeStr = item.size < 1024 ? `${item.size}B` : `${(item.size / 1024).toFixed(1)}KB`;
            const descStr = desc ? ` ${C.gray}- ${desc}${C.reset}` : '';
            console.log(`${indent}${item.name} ${C.gray}(${sizeStr})${C.reset}${descStr}`);
        }
    }

    // 统计
    const files = items.filter(i => i.type === 'file');
    const dirs = items.filter(i => i.type === 'dir');
    console.log(`\n${C.bold}统计${C.reset}`);
    console.log(`  目录：${dirs.length}`);
    console.log(`  文件：${files.length}`);
    console.log(`  总大小：${(files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(2)} MB`);
}

generateMap();
