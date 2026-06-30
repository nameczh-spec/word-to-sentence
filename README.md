# 单词化句 - 考研英语背词助手

## 项目简介

这是一个功能丰富的考研英语学习工具，提供以下核心功能：

- **单词段落生成**：AI智能生成包含目标单词的阅读段落
- **真题练习**：历年考研真题精读、完形填空、长难句分析、翻译、作文
- **词单管理**：自定义词单、批量导入、复习管理
- **词库检索**：考研/四级/六级词库即时查询

## 技术栈

- **前端**：原生HTML/CSS/JavaScript
- **后端**：Node.js（有道翻译代理）
- **移动端**：Capacitor + Android
- **桌面端**：Electron（配置中）

## 项目结构

```
单词化句/
├── vocab-reading-generator/          # Web端主项目
│   ├── js/                          # 核心JS模块
│   ├── css/                         # 样式文件
│   └── vocab-lib/                   # 词库和真题数据
│       ├── pastpapers/             # 真题数据（2000-2025）
│       ├── 3-CET4-顺序.json        # 四级词库
│       ├── 4-CET6-顺序.json        # 六级词库
│       └── 5-考研-顺序.json         # 考研词库
├── vocab-reading-generator-mobile/   # 移动端项目
│   ├── android/                     # Android工程
│   └── js/                          # 移动端JS模块
└── .trae/specs/                     # 项目规范文档
```

## 运行方式

### Web端

```bash
cd vocab-reading-generator
npm install
node start.js
# 访问 http://localhost:8080
```

### 移动端

```bash
cd vocab-reading-generator-mobile
npm install
npx cap sync
npx cap open android
# 在Android Studio中构建APK
```

## 开发说明

### 模块说明

| 模块 | 说明 |
|------|------|
| app.js | 主应用入口 |
| dataStore.js | 数据存储（IndexedDB） |
| wordManage.js | 词单管理 |
| vocabSearch.js | 词库检索 |
| pastPapers.js | 真题练习主模块 |
| pastPaperReader.js | 真题精读 |
| clozeExercise.js | 完形填空 |
| longSentence.js | 长难句分析 |

### API配置

需要配置有道翻译API：
1. 在设置面板中输入API地址和密钥
2. 点击"测试连接"验证
3. 保存配置

## 未来功能规划

- [ ] 不背单词风格学习模块（记忆曲线、多题型练习）
- [ ] 默写练习（键盘/手写双模式）
- [ ] 词根词缀系统
- [ ] 柯林斯词典集成
- [ ] 学习进度统计

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue。
