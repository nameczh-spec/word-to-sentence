/**
 * 项目清理工具 - cleanup.js
 * 功能：识别和清理临时文件、冗余目录
 * 用法：node .dev-tools/cleanup.js [--dry-run] [--verbose]
 *   --dry-run  只显示要删除的文件，不实际删除
 *   --verbose  显示详细信息
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const WEB_DIR = path.join(PROJECT_ROOT, 'vocab-reading-generator');

const C = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m',
    gray: '\x1b[90m', bold: '\x1b[1m'
};

let dryRun = process.argv.includes('--dry-run');
let verbose = process.argv.includes('--verbose');

const deleted = [];
const skipped = [];

function safeDelete(filePath) {
    const relPath = path.relative(PROJECT_ROOT, filePath);
    try {
        if (dryRun) {
            console.log(`  ${C.yellow}[模拟] ${relPath}${C.reset}`);
            skipped.push(relPath);
            return;
        }
        fs.unlinkSync(filePath);
        if (verbose) console.log(`  ${C.green}已删除 ${relPath}${C.reset}`);
        deleted.push(relPath);
    } catch (e) {
        console.error(`  ${C.red}删除失败 ${relPath}: ${e.message}${C.reset}`);
    }
}

function safeRemoveDir(dirPath) {
    const relPath = path.relative(PROJECT_ROOT, dirPath);
    try {
        if (dryRun) {
            console.log(`  ${C.yellow}[模拟] 目录 ${relPath}/${C.reset}`);
            return;
        }
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`  ${C.green}已删除目录 ${relPath}/${C.reset}`);
        deleted.push(relPath + '/');
    } catch (e) {
        console.error(`  ${C.red}删除目录失败 ${relPath}: ${e.message}${C.reset}`);
    }
}

function cleanupTempFiles() {
    console.log(`\n${C.cyan}=== 清理临时文件 ===${C.reset}`);
    const tempPatterns = [
        /^_.*\.js$/,
        /^_.*-raw\.txt$/,
        /^debug.*\.txt$/
    ];

    const files = fs.readdirSync(WEB_DIR);
    let count = 0;

    for (const file of files) {
        if (tempPatterns.some(p => p.test(file))) {
            count++;
            safeDelete(path.join(WEB_DIR, file));
        }
    }

    if (count === 0) {
        console.log(`  ${C.green}无临时文件需要清理${C.reset}`);
    } else {
        console.log(`  ${dryRun ? '将删除' : '已删除'} ${count} 个临时文件${C.reset}`);
    }
}

function cleanupRedundantDirs() {
    console.log(`\n${C.cyan}=== 清理冗余目录 ===${C.reset}`);
    const dirs = [
        path.join(WEB_DIR, 'VocabTool'),
        path.join(WEB_DIR, 'english-vocabulary-master'),
        path.join(WEB_DIR, 'build', 'VocabTool')
    ];

    let count = 0;
    for (const dir of dirs) {
        if (fs.existsSync(dir)) {
            count++;
            safeRemoveDir(dir);
        }
    }

    if (count === 0) {
        console.log(`  ${C.green}无冗余目录需要清理${C.reset}`);
    }
}

function cleanupBackupFiles() {
    console.log(`\n${C.cyan}=== 清理备份文件 ===${C.reset}`);
    let count = 0;
    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir);
        for (const item of items) {
            if (item === 'node_modules' || item === '.git') continue;
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (item.endsWith('.backup') || item.endsWith('.bak')) {
                count++;
                safeDelete(fullPath);
            }
        }
    }
    walk(WEB_DIR);
    walk(path.join(PROJECT_ROOT, 'vocab-reading-generator-mobile'));

    if (count === 0) {
        console.log(`  ${C.green}无备份文件需要清理${C.reset}`);
    }
}

// 执行清理
console.log(`${C.bold}${C.blue}单词化句 - 项目清理工具${C.reset}`);
console.log(`${C.gray}  时间：${new Date().toLocaleString('zh-CN')}${C.reset}`);
console.log(`${C.gray}  模式：${dryRun ? '模拟运行（不实际删除）' : '实际删除'}${C.reset}`);

cleanupTempFiles();
cleanupRedundantDirs();
cleanupBackupFiles();

console.log(`\n${C.bold}${C.blue}========== 清理摘要 ==========${C.reset}`);
console.log(`  ${C.green}已删除：${deleted.length} 项${C.reset}`);
if (dryRun) console.log(`  ${C.yellow}模拟跳过：${skipped.length} 项${C.reset}`);
console.log(`${C.bold}${C.blue}==============================${C.reset}\n`);

if (dryRun && deleted.length > 0) {
    console.log(`${C.yellow}这是模拟运行，实际执行请去掉 --dry-run 参数${C.reset}`);
}
