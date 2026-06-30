# 不背单词风格功能 - 产品设计文档

## 1. 项目概述

### 1.1 项目名称
`vocab-learning` - 沉浸式单词学习模块

### 1.2 项目目标
为"单词化句"项目添加类似"不背单词"App的完整学习功能，包括记忆曲线复习、多题型练习、词典查询等。

### 1.3 核心价值
- 科学记忆：通过间隔重复和记忆曲线提高记忆效率
- 多维练习：多种练习模式巩固学习效果
- 深度学习：词根词缀、派生词、近反义词构建词汇网络

## 2. 功能范围

### 2.1 核心功能（必须实现）

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 记忆曲线复习 | 多种内置曲线 + 自定义间隔 | P0 |
| 新学单词 | 按词书学习新单词 | P0 |
| 默写练习 | Pad端专属，纸笔式默写模式 | P0 |
| 拼写练习 | 英文拼写测试 | P0 |
| 听写练习 | 音频播放后拼写 | P1 |
| 组词练习 | 拖拽字母组成单词 | P1 |
| 语境选择题 | 根据例句选择正确单词 | P2 |
| 单词配对 | 匹配单词和释义 | P2 |
| 派生连句 | 根据语境填空 | P2 |
| 词根词缀 | 展示词根、词缀、派生词 | P0 |
| 近反义词 | 展示同义词、反义词 | P1 |
| 派生词 | 展示同根词 | P1 |
| 柯林斯词典 | 英文释义（简化版） | P2 |

### 2.2 辅助功能（可选）

| 功能 | 说明 | 状态 |
|------|------|------|
| 学习进度统计 | 每日/每周/每月学习数据 | 待定 |
| 考频信息 | 真题中出现的频率 | 待定 |
| 考点标记 | 标记考试重点词义 | 待定 |

## 3. 界面设计

### 3.1 整体风格
- **主题**：沉浸式深色风格
- **配色**：
  - 背景色：#1a1a2e（深蓝黑）
  - 卡片色：#16213e（中深蓝）
  - 主色调：#e94560（玫红高亮）
  - 文字色：#eaeaea（浅灰白）
  - 辅助色：#0f3460（深蓝）
- **圆角**：12px - 16px
- **字体**：系统字体栈

### 3.2 页面结构

```
┌─────────────────────────────────┐
│         学习首页                  │
│  ┌─────────────────────────┐   │
│  │    今日学习任务卡片        │   │
│  │  新学: 20  复习: 50       │   │
│  └─────────────────────────┘   │
│                                 │
│  [新学单词]  [复习单词]          │
│                                 │
│  ┌─────────────────────────┐   │
│  │    词典查询入口           │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │    学习设置               │   │
│  │  记忆曲线 | 每日目标      │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### 3.3 练习页面

```
┌─────────────────────────────────┐
│  ← 返回        第3题/20         │
├─────────────────────────────────┤
│                                 │
│     "The scientist made a      │
│      _____ discovery."          │
│                                 │
│  ┌─────────┐ ┌─────────┐       │
│  │  A. great  │ B. great │       │
│  └─────────┘ └─────────┘       │
│  ┌─────────┐ ┌─────────┐       │
│  │ C. greatly│ D. greatness│     │
│  └─────────┘ └─────────┘       │
│                                 │
│  ┌─────────────────────────┐   │
│  │    [显示答案]  [下一个]   │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### 3.4 词典页面

```
┌─────────────────────────────────┐
│  ← 返回        单词详情         │
├─────────────────────────────────┤
│                                 │
│        ambition                 │
│        /æmˈbɪʃ(ə)n/           │
│                                 │
│  ─────────────────────────────   │
│  [词根] [派生] [近反] [柯林斯]  │
│  ─────────────────────────────   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  词根: amb- (走向)      │   │
│  │  -ition (名词后缀)      │   │
│  │  → 走向目标 = 野心/志向  │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  派生词: ambitious      │   │
│  │  派生词: ambitiously    │   │
│  └─────────────────────────┘   │
│                                 │
│  [+加入词单]  [收藏]  [查看例句] │
└─────────────────────────────────┘
```

### 35 默写模式页面（Pad端专属）

```
┌─────────────────────────────────────────────────────────────────┐
│  ← 返回                    默写练习                    [设置]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  输入方式：[●键盘输入]  [○手写输入]                    │   │
│  │  模式选择：[●默写单词]  [○默写释义]  [○默写音标]       │   │
│  │  数量：20  词书：考研高频词                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      开始默写                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

键盘输入模式：
┌─────────────────────────────────────────────────────────────────┐
│  ← 返回                    默写中                    3/20      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ambition                                    [显示] [跳过]│   │
│  │  ───────────────────────────────────────────────────────│   │
│  │                                                               │
│  │  输入：________________________                              │
│  │  ✓/✗ (自动判定)                                             │
│  │                                                               │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  achievement                                   [显示] [跳过]│   │
│  │  ───────────────────────────────────────────────────────│   │
│  │                                                               │
│  │  野心，抱负                                              │
│  │                                                               │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  eloquent                                     [显示] [跳过]│   │
│  │  ───────────────────────────────────────────────────────│   │
│  │                                                               │
│  │  输入：________________________                              │
│  │                                                               │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         [  交卷并查看结果  ]                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

手写输入模式（无自动判定，用户对照）：
┌─────────────────────────────────────────────────────────────────┐
│  ← 返回                    默写中                    3/20      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ambition                                    [显示] [跳过]│   │
│  │  ───────────────────────────────────────────────────────│   │
│  │                                                               │
│  │  ┌─────────────────────────────────────┐                  │   │
│  │  │                                     │                  │   │
│  │  │         [手写输入区域]               │                  │   │
│  │  │         (支持触控笔)                │                  │   │
│  │  │                                     │                  │   │
│  │  │    [橡皮擦] [撤销] [清空]          │                  │   │
│  │  └─────────────────────────────────────┘                  │   │
│  │                                                               │
│  │  [对照答案] (点击显示正确内容)                               │
│  │  ┌─────────────────────────────────────────────────────┐   │
│  │  │  ambition                                           │   │   │
│  │  └─────────────────────────────────────────────────────┘   │
│  │                                                               │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         [  交卷并查看答案  ]                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

默写结果页面：
┌─────────────────────────────────────────────────────────────────┐
│  ← 返回                    默写结果                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         正确率: 75% (15/20)                            │   │
│  │         用时: 8分32秒                                  │   │
│  │         键盘模式 / 手写模式                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ❌ ambition         填写: ambitions     正确: ambition │   │
│  │  ❌ eloquent         填写: eloqent       正确: eloquent │   │
│  │  ✅ achievement      填写: 野心、抱负     正确: 野心、抱负  │   │
│  │  ✅ persist          填写: 坚持           正确: 坚持      │   │
│  │  ...                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [查看错题]  [重新默写]  [复习错词]  [返回首页]         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 默写模式交互说明

**输入方式选择**：
- **键盘输入**：传统键盘/虚拟键盘输入，可自动判定正确与否
- **手写输入**：支持平板触控笔/手指手写，无自动判定，用户自己对照答案

**模式选择**：
- **默写单词**：左侧显示释义，右侧空出填写单词
- **默写释义**：左侧显示单词，右侧空出填写释义
- **默写音标**：左侧显示单词，右侧空出填写音标

**键盘输入交互流程**：
1. 用户点击输入框，开始输入
2. 输入完成后按回车或点击确认
3. 系统自动判定并显示 ✓/✗
4. 自动进入下一个单词
5. 可随时点击"显示"查看答案
6. 可点击"跳过"跳过当前单词
7. 点击"交卷"结束默写

**手写输入交互流程**：
1. 用户点击手写区域，开始手写
2. 支持触控笔/手指书写
3. 提供橡皮擦、撤销、清空工具
4. 点击"对照答案"显示正确答案
5. 用户自行判断是否正确
6. 可点击"跳过"跳过当前单词
7. 点击"交卷"查看完整答案对比

**错误处理**：
- 键盘模式：区分大小写错误（英文），自动判定
- 手写模式：用户自行对照判定
- 允许拼写错误容忍（可选开启）
- 记录错误次数，影响复习安排

### 3.7 记忆曲线在默写中的应用

```
错误次数影响曲线：
├── 首次错误 → 下次复习间隔×1（正常间隔）
├── 错误2次 → 下次复习间隔×0.5（缩短间隔）
├── 错误3次+ → 标记为"困难词"，加入每日必复习
└── 完全正确3次 → 可选跳过后续复习

默写结果与记忆曲线同步：
├── 正确 → 进入下一阶段
├── 错误 → 阶段回退
└── 结果保存到 learningProgress
```

## 4. 数据结构

### 4.1 词根词缀库 (wordRoots.json)

```json
{
  "amb-": {
    "meaning": "走向",
    "source": "拉丁语 ambulare",
    "words": ["ambition", "ambient", "ambulance"]
  },
  "-ition": {
    "meaning": "名词后缀",
    "type": "suffix",
    "words": ["ambition", "addition", "nutrition"]
  }
}
```

### 4.2 派生词映射 (derivations.json)

```json
{
  "ambition": {
    "derivatives": ["ambitious", "ambitiously"],
    "root": "amb-",
    "suffix": "-ition"
  }
}
```

### 4.3 记忆曲线配置 (memoryCurves.json)

```json
{
  "curves": [
    {
      "id": "ebbinghaus",
      "name": "艾宾浩斯遗忘曲线",
      "intervals": [1, 2, 4, 7, 15, 30]
    },
    {
      "id": "simple",
      "name": "简易间隔",
      "intervals": [1, 2, 4, 7]
    },
    {
      "id": "challenge",
      "name": "挑战模式",
      "intervals": [1, 3, 7, 14, 30, 60]
    }
  ]
}
```

### 4.4 学习记录 (learningProgress.json)

```json
{
  "userId": "xxx",
  "words": {
    "ambition": {
      "status": "learning",
      "nextReview": "2026-07-01",
      "reviewCount": 3,
      "mastery": 0.75,
      "lastReview": "2026-06-30",
      "curve": "ebbinghaus",
      "currentStage": 2,
      "errorCount": 1,
      "lastErrorDate": "2026-06-29",
      "difficultWords": [],
      "dictationRecords": [
        {
          "date": "2026-06-30",
          "mode": "word",  // word | meaning | phonetic
          "total": 20,
          "correct": 15,
          "wrongWords": [
            { "word": "ambition", "userAnswer": "ambitious" },
            { "word": "eloquent", "userAnswer": "eloqent" }
          ]
        }
      ]
    }
  },
  "stats": {
    "totalLearned": 500,
    "totalMastered": 200,
    "todayNew": 20,
    "todayReviewed": 50,
    "todayDictation": 20,
    "totalDictation": 1000
  }
}
```

### 4.5 默写记录详解

```json
"dictationRecords": {
  "date": "2026-06-30",          // 默写日期
  "mode": "word",                 // 模式：word(默写单词) | meaning(默写释义) | phonetic(默写音标)
  "total": 20,                   // 总题数
  "correct": 15,                 // 正确数
  "wrongRate": 0.25,             // 错误率
  "duration": 512,                // 用时（秒）
  "wrongWords": [                 // 错误详情
    {
      "word": "ambition",
      "correctAnswer": "ambition",
      "userAnswer": "ambitious",
      "errorType": "spelling",    // spelling | meaning | phonetic
      "errorCount": 1
    }
  ],
  "skippedWords": ["persist"],    // 跳过的单词
  "bookId": "kaoyan-high"         // 词书ID
}
```

## 5. 模块设计

### 5.1 学习引擎 (learningEngine.js)

**职责**：
- 管理学习流程
- 协调各练习模式
- 保存学习进度

**API**：
```javascript
LearningEngine.startLearning(type, wordCount)
LearningEngine.getNextWord()
LearningEngine.submitAnswer(wordId, answer, isCorrect)
LearningEngine.saveProgress()
```

### 5.2 记忆曲线 (memoryCurve.js)

**职责**：
- 计算下次复习时间
- 管理复习队列
- 追踪记忆状态

**算法**：
```
下次复习时间 = 当前时间 + 曲线间隔[当前阶段]
如果答对 → 阶段+1
如果答错 → 阶段重置为1
```

### 5.3 练习模式模块

每个练习模式独立模块，统一接口：

```javascript
// 统一接口
PracticeMode.init(container)
PracticeMode.showWord(word)
PracticeMode.showQuestion()
PracticeMode.checkAnswer(userAnswer)
PracticeMode.getResult()
PracticeMode.destroy()
```

### 5.4 默写练习模块 (dictationPractice.js)

**职责**：
- 管理默写练习流程
- 渲染单词列表界面
- 处理用户输入（键盘/手写）和答案判定
- 记录错误信息
- 与记忆曲线同步

**API**：
```javascript
// 初始化
DictationPractice.init(container, options)
  // options: {
  //   inputMode: 'keyboard' | 'handwriting',  // 新增：输入方式
  //   mode: 'word' | 'meaning' | 'phonetic',  // 默写模式
  //   wordCount: 20,
  //   bookId: 'kaoyan',
  //   onComplete: (result) => {},
  //   autoCheck: true  // 键盘模式自动判定，手写模式false
  // }

// 开始默写
DictationPractice.start()

// 提交答案（键盘模式）
DictationPractice.submit(wordId, userAnswer)
  // 返回: { correct: boolean, correctAnswer: string }

// 提交答案（手写模式 - 用户自行标记）
DictationPractice.markResult(wordId, isCorrect)
  // 用户点击正确/错误按钮标记

// 显示答案
DictationPractice.showAnswer(wordId)

// 跳过当前
DictationPractice.skip(wordId)

// 交卷
DictationPractice.submitAll()

// 获取结果
DictationPractice.getResult()
  // 返回: {
  //   inputMode: 'keyboard' | 'handwriting',
  //   total: 20,
  //   correct: 15,
  //   wrongRate: 0.25,
  //   duration: 512,
  //   wrongWords: [...],
  //   skippedWords: [...]
  // }

// 销毁
DictationPractice.destroy()
```

**界面渲染逻辑**：
```javascript
// 渲染单词卡片（键盘输入模式）
function renderKeyboardCard(word, mode) {
  const leftContent = mode === 'word' ? word.meaning : word.word;
  const rightContent = mode === 'word' ? word.word : word.meaning;
  const inputPlaceholder = mode === 'phonetic' ? '填写音标' : (mode === 'word' ? '填写单词' : '填写释义');

  return `
    <div class="dictation-card keyboard-mode" data-word-id="${word.id}">
      <div class="dictation-left">${leftContent}</div>
      <div class="dictation-divider"></div>
      <div class="dictation-right">
        <input type="text"
               placeholder="${inputPlaceholder}"
               class="dictation-input"
               autocomplete="off" />
        <span class="check-result"></span>
      </div>
      <div class="dictation-actions">
        <button class="show-btn">显示</button>
        <button class="skip-btn">跳过</button>
      </div>
    </div>
  `;
}

// 渲染单词卡片（手写输入模式）
function renderHandwritingCard(word, mode) {
  const leftContent = mode === 'word' ? word.meaning : word.word;
  const rightContent = mode === 'word' ? word.word : word.meaning;

  return `
    <div class="dictation-card handwriting-mode" data-word-id="${word.id}">
      <div class="dictation-left">${leftContent}</div>
      <div class="dictation-divider"></div>
      <div class="dictation-right">
        <div class="handwriting-canvas-wrapper">
          <canvas class="handwriting-canvas"></canvas>
          <div class="handwriting-tools">
            <button class="eraser-btn">橡皮擦</button>
            <button class="undo-btn">撤销</button>
            <button class="clear-btn">清空</button>
          </div>
        </div>
        <div class="answer-toggle">
          <button class="show-answer-btn">对照答案</button>
          <div class="answer-display hidden">
            <span class="answer-label">正确答案：</span>
            <span class="answer-text">${rightContent}</span>
          </div>
        </div>
        <div class="result-marker">
          <button class="mark-correct-btn">✓ 我写对了</button>
          <button class="mark-wrong-btn">✗ 我写错了</button>
        </div>
      </div>
      <div class="dictation-actions">
        <button class="skip-btn">跳过</button>
      </div>
    </div>
  `;
}

// 键盘输入答案判定
function checkKeyboardAnswer(wordId, userAnswer, mode) {
  const word = getWord(wordId);
  const correctAnswer = mode === 'word' ? word.word : word.meaning;

  // 英文模式：忽略大小写，允许轻微拼写差异
  if (mode === 'word' || mode === 'phonetic') {
    return {
      correct: normalizeAndCompare(userAnswer, correctAnswer),
      correctAnswer: correctAnswer
    };
  }

  // 中文模式：允许标点和空格差异
  return {
    correct: normalizeChinese(userAnswer) === normalizeChinese(correctAnswer),
    correctAnswer: correctAnswer
  };
}

// 手写输入用户标记
function markHandwritingResult(wordId, isCorrect) {
  // 记录用户标记的结果
  saveUserMark(wordId, isCorrect);

  // 更新视觉反馈
  const card = document.querySelector(`[data-word-id="${wordId}"]`);
  card.classList.add(isCorrect ? 'marked-correct' : 'marked-wrong');
}

// 错误次数更新
function updateErrorCount(wordId, isCorrect) {
  if (!isCorrect) {
    const errorCount = getWordErrorCount(wordId) + 1;
    updateWordProgress(wordId, { errorCount });

    // 错误3次以上标记为困难词
    if (errorCount >= 3) {
      addToDifficultWords(wordId);
    }

    // 更新记忆曲线间隔
    const currentStage = getWordStage(wordId);
    if (currentStage > 1) {
      // 错误回退半个阶段
      updateWordStage(wordId, Math.max(1, currentStage - 0.5));
    }
  }
}
```

**手写输入Canvas实现**：
```javascript
// 手写Canvas初始化
function initHandwritingCanvas(canvasElement) {
  const ctx = canvasElement.getContext('2d');
  let isDrawing = false;
  let strokeHistory = [];

  // 设置Canvas尺寸
  canvasElement.width = canvasElement.offsetWidth;
  canvasElement.height = canvasElement.offsetHeight;

  // 监听触摸/鼠标事件
  canvasElement.addEventListener('mousedown', startDrawing);
  canvasElement.addEventListener('mousemove', draw);
  canvasElement.addEventListener('mouseup', stopDrawing);
  canvasElement.addEventListener('touchstart', handleTouchStart);
  canvasElement.addEventListener('touchmove', handleTouchMove);
  canvasElement.addEventListener('touchend', stopDrawing);

  function startDrawing(e) {
    isDrawing = true;
    strokeHistory.push([]);
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }

  function draw(e) {
    if (!isDrawing) return;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#eaeaea';
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    strokeHistory[strokeHistory.length - 1].push({ x: e.offsetX, y: e.offsetY });
  }

  function stopDrawing() {
    isDrawing = false;
  }

  // 橡皮擦
  function erase(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  // 撤销
  function undo() {
    if (strokeHistory.length > 0) {
      strokeHistory.pop();
      redrawCanvas();
    }
  }

  // 清空
  function clearCanvas() {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    strokeHistory = [];
  }

  return { erase, undo, clear: clearCanvas };
}
```

### 5.5 默写模块与记忆曲线联动

```javascript
// 默写完成后同步到记忆曲线
function syncDictationToMemoryCurve(result) {
  result.wrongWords.forEach(item => {
    const currentStage = getWordStage(item.word);
    // 错误：阶段回退
    updateWordStage(item.word, Math.max(1, currentStage - 1));

    // 增加错误计数
    incrementErrorCount(item.word);

    // 更新下次复习时间
    updateNextReviewDate(item.word);
  });

  // 正确：正常推进阶段
  result.correctWords.forEach(word => {
    const currentStage = getWordStage(word);
    updateWordStage(word, Math.min(currentStage + 1, maxStage));
    updateNextReviewDate(word);
  });

  // 保存结果
  saveDictationRecord(result);
}
```

## 6. 数据获取策略

### 6.1 数据来源矩阵

| 数据类型 | 主要来源 | 备用来源 | 优先级 |
|---------|---------|---------|--------|
| 词根词缀 | 本地JSON | 搜索补充 | P0 |
| 派生词 | 本地JSON | 有道API | P0 |
| 近反义词 | 有道API | 搜索获取 | P1 |
| 柯林斯词典 | 有道API | 本地简化版 | P2 |
| 例句 | 已有真题数据 | 有道API | P0 |

### 6.2 API集成

**有道翻译API**（用户提供代理）：
```
GET /api/youdao?q={word}
返回：释义、发音、例句、派生词、近反义词
```

### 6.3 本地数据建设

**词根词缀库**：
- 初期：构建200+常用词根
- 扩展：逐步补充到2000+
- 来源：网络搜索 + 人工整理

## 7. 移动端适配

### 7.1 Pad端布局

- 双栏布局：左侧单词列表，右侧详情/练习
- 支持横屏/竖屏切换
- 触摸手势优化

### 7.2 默写模式Pad端布局

```
Pad横屏布局（键盘输入模式）：
┌─────────────────────────────────────────────────────────────────┐
│  单词化句                    默写练习                    [用户]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────────────────┐   │
│  │                    │  │                                │   │
│  │   设置面板          │  │     单词1 - 释义1              │   │
│  │                    │  │     [输入框] ✓/✗              │   │
│  │  输入方式:          │  │     ─────────────────          │   │
│  │  [●键盘] [○手写]  │  │                                │   │
│  │                    │  │     单词2 - 释义2              │   │
│  │  模式选择:          │  │     [输入框]                   │   │
│  │  [●单词] [○释义]  │  │     ─────────────────          │   │
│  │  [○音标]           │  │                                │   │
│  │                    │  │     单词3 - 释义3              │   │
│  │  数量: [20]       │  │     [输入框]                   │   │
│  │                    │  │     ─────────────────          │   │
│  │  词书: [考研▼]   │  │                                │   │
│  │                    │  │     ...                        │   │
│  │  [开始默写]       │  │                                │   │
│  │                    │  │                                │   │
│  │  ───────────────   │  │                                │   │
│  │                    │  │                                │   │
│  │  今日: 新学15     │  │                                │   │
│  │  今日: 复习20     │  │                                │   │
│  │  今日: 默写30     │  │                                │   │
│  │                    │  │                                │   │
│  └────────────────────┘  └────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         [  交卷并查看结果  ]                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Pad横屏布局（手写输入模式）：
┌─────────────────────────────────────────────────────────────────┐
│  单词化句                    默写练习                    [用户]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────────────────┐   │
│  │                    │  │                                │   │
│  │   设置面板          │  │     单词1 - 释义1              │   │
│  │                    │  │     ┌──────────────────┐        │   │
│  │  输入方式:          │  │     │  [手写区域]      │        │   │
│  │  [○键盘] [●手写]  │  │     │  橡皮擦 撤销 清空│        │   │
│  │                    │  │     └──────────────────┘        │   │
│  │  模式选择:          │  │     [对照答案]                 │   │
│  │  [●单词] [○释义]  │  │     ─────────────────          │   │
│  │  [○音标]           │  │     [✓我写对了] [✗我写错了]   │   │
│  │                    │  │                                │   │
│  │  数量: [20]       │  │     单词2 - 释义2              │   │
│  │                    │  │     ┌──────────────────┐        │   │
│  │  词书: [考研▼]   │  │     │  [手写区域]      │        │   │
│  │                    │  │     └──────────────────┘        │   │
│  │  [开始默写]       │  │     [对照答案]                 │   │
│  │                    │  │     ─────────────────          │   │
│  │  ───────────────   │  │     ...                        │   │
│  │                    │  │                                │   │
│  │  今日: 新学15     │  │                                │   │
│  │  今日: 复习20     │  │                                │   │
│  │  今日: 默写30     │  │                                │   │
│  │                    │  │                                │   │
│  └────────────────────┘  └────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         [  交卷并查看答案  ]                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 响应式断点

```css
/* 手机端 */
@media (max-width: 768px) { ... }

/* Pad端 */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* 桌面端 */
@media (min-width: 1025px) { ... }
```

## 8. 实施计划

### Phase 1: 基础框架（1周）
- [ ] 创建learningEngine.js基础架构
- [ ] 实现记忆曲线算法
- [ ] 创建深色主题CSS
- [ ] 基础学习页面UI

### Phase 2: 核心功能（1-2周）
- [ ] 默写练习模式（Pad端专属）
  - [ ] 默写设置页面（模式选择、数量、词书）
  - [ ] 默写界面渲染（单词卡片列表）
  - [ ] 答案判定逻辑
  - [ ] 错误记录和反馈
  - [ ] 默写结果页面
  - [ ] 与记忆曲线同步
- [ ] 新学单词流程
- [ ] 拼写练习模式
- [ ] 复习流程
- [ ] 学习进度保存

### Phase 3: 扩展练习（1周）
- [ ] 听写练习
- [ ] 组词练习
- [ ] 其他练习模式

### Phase 4: 词典功能（1周）
- [ ] 词根词缀库建设
- [ ] 派生词关联
- [ ] 近反义词查询
- [ ] 柯林斯词典（简化版）

### Phase 5: 数据与优化（持续）
- [ ] 补充词根词缀数据
- [ ] 优化练习算法
- [ ] 添加学习统计
- [ ] Pad端专项优化

## 9. 技术约束

### 9.1 兼容性
- 目标浏览器：Chrome 90+, Safari 14+, Firefox 88+
- 目标移动端：iOS 13+, Android 8+
- Pad端：iPadOS 13+, Android Tablet

### 9.2 性能要求
- 首屏加载 < 2s
- 练习响应 < 100ms
- 离线可学（本地数据）

### 9.3 数据安全
- 本地存储加密（可选）
- API密钥不硬编码
- 用户数据隔离
