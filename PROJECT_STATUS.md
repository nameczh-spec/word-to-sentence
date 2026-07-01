# 单词化句 - 项目进度及纲要

> **此文档为主控文档，每次开始工作前请先阅读此文档了解当前状态。**
> 最后更新：2026-07-01

---

## 一、项目概述

考研英语学习工具，提供单词段落生成、真题练习、词单管理、词库检索等功能。
- 技术栈：原生HTML/CSS/JavaScript + Node.js + Capacitor(Android)
- 项目路径：`h:\IT\单词化句`
- Git分支：`main`
- Git用户：nameczh-spec / name.czh@gmail.com

---

## 二、项目文件结构

```
单词化句/
├── .dev-tools/                    # 开发工具脚本（见下方说明）
├── .gitignore                     # Git忽略配置
├── .trae/specs/                   # 项目规范文档
│   └── project-full-audit/        # 全面审计文档
│       ├── spec.md                # 全面分析报告
│       ├── checklist.md           # 问题检查清单
│       ├── tasks.md               # 开发路线规划（19个任务）
│       ├── vocab-learning-design.md  # 不背单词功能设计
│       └── vocab-learning-prd.md  # 产品需求规范
├── PROJECT_STATUS.md              # 本文件（主控文档）
├── README.md                      # 项目说明
├── vocab-reading-generator/       # Web端主项目
│   ├── js/                        # JS模块（21个文件）
│   │   ├── app.js                 # 主应用入口，页面路由
│   │   ├── dataStore.js           # 数据存储（IndexedDB）
│   │   ├── apiRequest.js          # API请求封装
│   │   ├── config.js              # 配置管理
│   │   ├── interaction.js         # 交互逻辑
│   │   ├── localGenerator.js      # 本地段落生成
│   │   ├── templateManager.js     # 模板管理
│   │   ├── textRender.js          # 文本渲染
│   │   ├── userManager.js         # 用户管理
│   │   ├── vocabSearch.js         # 词库检索
│   │   ├── wordManage.js          # 词单管理
│   │   ├── fileExport.js          # 文件导出
│   │   ├── pastPapers.js          # 真题练习主模块（路由、首页）
│   │   ├── pastPaperReader.js     # 真题精读
│   │   ├── clozeExercise.js       # 完形填空
│   │   ├── longSentence.js        # 长难句分析
│   │   ├── translation.js         # 翻译练习
│   │   ├── writing.js             # 作文练习（题目、范文、AI批改）
│   │   ├── dataManager.js         # 数据管理
│   │   ├── settingsManager.js     # 设置管理
│   │   └── vocabBook.js           # 单词本
│   ├── css/                       # 样式文件（6个）
│   │   ├── main.css               # 主样式
│   │   ├── pastPapers.css         # 真题练习专用样式
│   │   ├── login.css              # 登录页样式
│   │   ├── popup.css              # 弹窗样式
│   │   ├── theme.css              # 主题样式
│   │   └── highlight-button.css   # 高亮按钮样式
│   ├── vocab-lib/
│   │   ├── pastpapers/            # 真题数据（41套+index.json）
│   │   ├── 3-CET4-顺序.json       # 四级词库
│   │   ├── 4-CET6-顺序.json       # 六级词库
│   │   └── 5-考研-顺序.json        # 考研词库
│   ├── images/writing/            # 作文题目图片（61张）
│   ├── templates/                 # 段落模板（14个分类）
│   ├── _writing-extracted/        # 作文提取文本（临时，待清理）
│   ├── index.html                 # 主页面
│   ├── youdao-proxy.js            # 有道翻译代理
│   └── package.json
├── vocab-reading-generator-mobile/  # 移动端项目
│   ├── js/                        # 移动端JS模块（17个）
│   ├── css/                       # 移动端样式（5个）
│   ├── www/                       # Web资源副本
│   ├── android/                   # Android工程
│   └── capacitor.config.json      # Capacitor配置
└── 语料库/                        # 语料库（不纳入Git）
    └── word版英语真题/            # PDF转Word的真题文件
```

---

## 三、开发工具说明（.dev-tools/）

| 工具 | 用途 | 用法 |
|------|------|------|
| audit.js | 项目审计：检查文件结构、临时文件、数据完整性 | `node .dev-tools/audit.js [--verbose]` |
| backup.js | Git备份：初始化、提交、状态查看 | `node .dev-tools/backup.js <init\|commit\|status\|backup\|push>` |
| cleanup.js | 项目清理：删除临时文件、冗余目录 | `node .dev-tools/cleanup.js [--dry-run]` |
| filemap.js | 文件清单：生成项目文件结构图 | `node .dev-tools/filemap.js` |

---

## 四、当前进度

### 已完成
- [x] 项目全面审计（结构、代码、数据、UI、移动端、安全）
- [x] 审计文档创建（spec.md、checklist.md、tasks.md、设计文档）
- [x] Git仓库初始化，446个文件已纳入版本控制
- [x] 2000-2009年真题标注"早期真题"标签
- [x] 早年真题（只有Part B）作文模块条件显示
- [x] 作文内容从Word文件提取并校对
- [x] 作文图片提取和优化处理
- [x] 开发工具脚本创建（audit/backup/cleanup/filemap）

### 待完成（按优先级排序）

#### 优先级1：项目清理
- [ ] 删除227个临时文件（184个_*.js + 41个_*-raw.txt + 2个debug*.txt）
- [ ] 删除冗余目录（VocabTool/、english-vocabulary-master/、build/VocabTool/）

#### 优先级2：数据修复
- [ ] 补充2006年真题数据
- [ ] 修复2套缺失翻译的试卷
- [ ] 修正2000-2009年试卷分类（已标注"早期真题"，需确认是否还需修改type字段）

#### 优先级3：Bug修复
- [ ] 修复getThemeColors控制台错误
- [ ] 修复设置面板默认打开问题

#### 优先级4：移动端功能对齐
- [ ] 移植真题练习模块到移动端（6个JS + 1个CSS + 数据目录 + 图片目录）
- [ ] 移动端真题页面UI适配
- [ ] 更新移动端index.html添加真题模块引用
- [ ] 建立Web端与移动端代码同步机制
- [ ] 移动端密钥文件安全处理

#### 优先级5：不背单词风格功能开发
- [ ] 创建learningEngine.js基础架构
- [ ] 实现记忆曲线算法（艾宾浩斯+自定义间隔）
- [ ] 实现默写练习（键盘输入自动判定 + 手写输入用户对照）
- [ ] 实现练习模式（拼写、听写、组词、语境选择、单词配对、派生连句）
- [ ] 实现词典功能（词根词缀、近反义词、柯林斯词典）
- [ ] Pad端适配（双栏布局、手写Canvas、触摸优化）

---

## 五、开发规范

### 5.1 必须遵守
1. **修改前备份**：每次修改文件前先 `git add -A && git commit -m "备份：修改描述"`
2. **修改范围限制**：严格限制在指定模块内，不得修改未授权的文件
3. **修改前复述**：每次收到新要求时，先复述理解，确认后再修改
4. **逐项检查**：对所有项目逐一检查，不得抽样
5. **精准修改**：为每个修改项编写针对性代码，不通用化
6. **最小改动**：只做必要的修改，不重构、不优化无关代码
7. **根因分析**：修复Bug前先分析根本原因
8. **验证后继续**：修改完成后验证功能正常，再继续下一个任务

### 5.2 禁止事项
- 禁止修改全局JS文件（app.js、dataStore.js）除非明确授权
- 禁止修改非目标CSS文件（main.css、popup.css）除非明确授权
- 禁止创建不必要的文件
- 禁止主动创建文档文件（*.md）除非明确要求
- 禁止使用git push --force
- 禁止修改git config
- 禁止运行破坏性git命令（reset --hard、clean -f等）除非明确要求

### 5.3 异常处理
1. **权限异常**：立即停止操作，不重复尝试，报告给用户
2. **流程异常**：超时（5分钟无响应）或循环（重复≥2次），自动终止，记录日志
3. **Git异常**：使用 `git checkout -- 文件名` 回滚，报告给用户

### 5.4 Git操作流程
```
# 修改前备份
git add -A
git commit -m "备份：修改描述"

# 修改文件...

# 验证功能正常后提交
git add -A
git commit -m "完成：具体描述"

# 每天至少push一次
git push origin main
```

---

## 六、关键技术信息

### 6.1 真题数据格式
- 数据目录：`vocab-reading-generator/vocab-lib/pastpapers/`
- 索引文件：`index.json`（包含所有试卷列表）
- 试卷文件：`{year}-{typeNum}.json`（如 `2010-1.json`）
- 2010年前：不分英语一/二，统一归为"英语一"并标注"早期真题"
- 2000-2009年：只有Part B大作文，无Part A应用文

### 6.2 作文图片命名规范
- 2010年前：`{year}-1-partB.{ext}`（如 `2000-1-partB.jpeg`）
- 2010年后：`{year}-{typeNum}-{paperNum}-partB.{ext}`（如 `2010-1-1-partB.png`）
- 多图片：`{year}-{typeNum}-{paperNum}-partB-{序号}.{ext}`（如 `2010-1-1-partB-1.png`）

### 6.3 已知问题
1. **2006年真题数据完全缺失**：index.json中无2006年条目，无2006.json文件
2. **2套试卷翻译缺失**：需运行检查脚本确定具体是哪两套
3. **getThemeColors错误**：控制台报错 `Cannot destructure property 'exportedColors' of 'undefined'`
4. **设置面板默认打开**：页面加载后设置面板应默认隐藏
5. **移动端真题模块缺失**：缺少pastPapers.js等6个JS文件和pastPapers.css
6. **移动端密钥明文存储**：miyao/目录包含明文密码和密钥文件
7. **部分年份作文内容标为"略"**：2013-1、2014-1等Word文件中作文内容为"略"

### 6.4 开发环境
- Node.js：v24.8.0（通过nvm管理）
- Android Studio：用于移动端构建
- Python：可用于HTTP服务器 `python -m http.server 8080`
- 浏览器测试：Chrome DevTools

---

## 七、Git提交历史

```
9a2c6a4 完整备份：合并vocab-reading-generator全部代码、真题数据、移动端项目到主仓库
a0bfd89 初始提交：项目完整备份（Web端+移动端+规范文档+开发工具）
b71ad02 Add continue guide for tomorrow
663186b Add project progress report
ee87e9f Add README.md
d4fcef4 Initial commit
```

---

## 八、后续开发路线（详见 tasks.md）

| 阶段 | 任务 | 优先级 | 状态 |
|------|------|--------|------|
| 一 | 项目清理（临时文件、冗余目录） | 高 | 待开始 |
| 一 | 补充2006年真题 | 高 | 待开始 |
| 一 | 修复缺失翻译 | 中 | 待开始 |
| 一 | 修正试卷分类 | 中 | 待开始 |
| 一 | 修复getThemeColors错误 | 中 | 待开始 |
| 一 | 修复设置面板默认打开 | 中 | 待开始 |
| 二 | 移植真题模块到移动端 | 高 | 待开始 |
| 二 | 移动端UI适配 | 高 | 待开始 |
| 二 | 密钥文件安全处理 | 高 | 待开始 |
| 三 | 模块命名统一 | 中 | 待开始 |
| 三 | 建立单元测试 | 中 | 待开始 |
| 四 | 不背单词功能开发 | 中 | 待开始 |
