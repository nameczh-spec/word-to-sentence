/**
 * 项目备份工具 - backup.js
 * 功能：Git初始化、提交、文件备份辅助
 * 用法：node .dev-tools/backup.js <command> [options]
 *   init              初始化Git仓库
 *   commit <message>  提交所有更改
 *   status            查看Git状态
 *   backup <file>     备份单个文件
 *   push              推送到远程仓库
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');

const C = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m',
    gray: '\x1b[90m', bold: '\x1b[1m'
};

function runGit(cmd, options = {}) {
    try {
        const result = execSync(`git ${cmd}`, {
            cwd: PROJECT_ROOT,
            encoding: 'utf-8',
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options
        });
        return result ? result.trim() : '';
    } catch (e) {
        if (!options.silent) {
            console.error(`${C.red}Git命令失败：git ${cmd}${C.reset}`);
            console.error(e.stderr || e.message);
        }
        return null;
    }
}

function isGitInitialized() {
    return fs.existsSync(path.join(PROJECT_ROOT, '.git'));
}

function cmdInit() {
    console.log(`${C.cyan}初始化Git仓库...${C.reset}`);

    if (isGitInitialized()) {
        console.log(`  ${C.yellow}Git仓库已存在${C.reset}`);
        return;
    }

    // 检查gitignore
    const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
        console.log(`  ${C.red}.gitignore 不存在，请先创建${C.reset}`);
        return;
    }

    runGit('init');
    runGit('branch -M main');

    // 检查用户配置
    const userName = runGit('config user.name', { silent: true });
    const userEmail = runGit('config user.email', { silent: true });

    if (!userName) {
        runGit('config user.name "单词化句开发者"');
        console.log(`  ${C.gray}已设置默认用户名${C.reset}`);
    }
    if (!userEmail) {
        runGit('config user.email "dev@vocab.local"');
        console.log(`  ${C.gray}已设置默认邮箱${C.reset}`);
    }

    console.log(`  ${C.green}Git仓库初始化完成${C.reset}`);

    // 首次提交
    runGit('add -A');
    runGit('commit -m "初始提交：项目备份（Web端+移动端+规范文档）"');
    console.log(`  ${C.green}初始提交完成${C.reset}`);

    // 显示统计
    const log = runGit('log --oneline -1', { silent: true });
    if (log) console.log(`  ${C.gray}${log}${C.reset}`);
}

function cmdCommit(message) {
    if (!message) {
        console.log(`${C.red}请提供提交信息：node .dev-tools/backup.js commit "提交信息"${C.reset}`);
        return;
    }

    if (!isGitInitialized()) {
        console.log(`${C.red}Git仓库未初始化，请先运行 init${C.reset}`);
        return;
    }

    // 检查是否有更改
    const status = runGit('status --porcelain', { silent: true });
    if (!status) {
        console.log(`${C.yellow}没有需要提交的更改${C.reset}`);
        return;
    }

    runGit('add -A');
    runGit(`commit -m "${message}"`);
    console.log(`${C.green}提交完成${C.reset}`);

    const log = runGit('log --oneline -3', { silent: true });
    if (log) console.log(`${C.gray}${log}${C.reset}`);
}

function cmdStatus() {
    if (!isGitInitialized()) {
        console.log(`${C.red}Git仓库未初始化${C.reset}`);
        return;
    }

    console.log(`${C.cyan}=== Git状态 ===${C.reset}`);
    const branch = runGit('branch --show-current', { silent: true });
    console.log(`  分支：${branch || 'main'}`);

    const remote = runGit('remote -v', { silent: true });
    if (remote) {
        console.log(`  远程：${remote.split('\n')[0]}`);
    } else {
        console.log(`  ${C.yellow}  未配置远程仓库${C.reset}`);
    }

    console.log(`\n${C.cyan}=== 文件状态 ===${C.reset}`);
    runGit('status -s');

    console.log(`\n${C.cyan}=== 最近提交 ===${C.reset}`);
    runGit('log --oneline -5');
}

function cmdBackupFile(filePath) {
    if (!filePath) {
        console.log(`${C.red}请指定文件：node .dev-tools/backup.js backup <文件路径>${C.reset}`);
        return;
    }

    const absPath = path.resolve(PROJECT_ROOT, filePath);
    if (!fs.existsSync(absPath)) {
        console.log(`${C.red}文件不存在：${absPath}${C.reset}`);
        return;
    }

    const backupPath = absPath + '.backup';
    fs.copyFileSync(absPath, backupPath);
    console.log(`${C.green}已备份：${path.relative(PROJECT_ROOT, backupPath)}${C.reset}`);
}

function cmdPush() {
    if (!isGitInitialized()) {
        console.log(`${C.red}Git仓库未初始化${C.reset}`);
        return;
    }

    const remote = runGit('remote', { silent: true });
    if (!remote) {
        console.log(`${C.red}未配置远程仓库${C.reset}`);
        console.log(`  请先添加远程仓库：`);
        console.log(`  git remote add origin https://github.com/用户名/仓库名.git`);
        return;
    }

    runGit('push -u origin main');
    console.log(`${C.green}推送完成${C.reset}`);
}

// 主逻辑
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
    case 'init':
        cmdInit();
        break;
    case 'commit':
        cmdCommit(arg);
        break;
    case 'status':
        cmdStatus();
        break;
    case 'backup':
        cmdBackupFile(arg);
        break;
    case 'push':
        cmdPush();
        break;
    default:
        console.log(`${C.bold}项目备份工具${C.reset}`);
        console.log(`用法：node .dev-tools/backup.js <command> [options]\n`);
        console.log(`命令：`);
        console.log(`  init              初始化Git仓库`);
        console.log(`  commit <message>  提交所有更改`);
        console.log(`  status            查看Git状态`);
        console.log(`  backup <file>     备份单个文件`);
        console.log(`  push              推送到远程仓库`);
}
