# 单词化句项目 - 后续开发路线规划

## 第一阶段：项目清理与基础修复（1-2周）

### [ ] Task 1: 清理临时文件和目录
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 清理 vocab-reading-generator/ 根目录的 184 个 _*.js 调试脚本
  - 清理 41 个 _*-raw.txt 原始文本文件
  - 清理 debug*.txt 调试输出文件
  - 将需要保留的脚本移动到 scripts/ 专用目录
  - 将需要保留的原始数据移动到 data/raw/ 目录
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 根目录不再有 _ 开头的 .js 文件
  - `programmatic` TR-1.2: 根目录不再有 _ 开头的 .txt 文件
  - `human-judgement` TR-1.3: 项目根目录整洁，只保留核心代码文件
- **Notes**: 删除前确认所有临时文件确实无用，避免误删重要脚本

### [ ] Task 2: 清理冗余目录和无关文件
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 确认 VocabTool/ 目录是否需要保留
  - 确认 english-vocabulary-master/ 是否需要保留
  - 将 2024考研英语词汇红宝书.PDF 移出项目目录
  - 清理过时的 build/VocabTool/ 目录
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` TR-2.1: 项目目录结构清晰，无无关文件
  - `programmatic` TR-2.2: 项目根目录不超过 5 个一级子目录
- **Notes**: 删除前先备份重要数据到外部存储

### [ ] Task 3: 补充 2006 年真题数据
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 查找并获取 2006 年考研英语真题
  - 按照现有数据格式解析并生成 2006.json
  - 更新 index.json 添加 2006 年条目
  - 验证各题型数据完整性
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: vocab-lib/pastpapers/ 目录包含 2006.json
  - `programmatic` TR-3.2: index.json 包含 2006 年条目
  - `programmatic` TR-3.3: 2006 年数据包含完形填空、阅读理解、翻译、作文四个题型
- **Notes**: 2006 年不分英语一/二，type 字段设为"考研英语"

### [ ] Task 4: 修复 2 套缺失翻译的试卷
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 找出哪 2 套试卷缺少翻译部分
  - 补充对应的翻译数据
  - 验证数据格式一致性
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: 41 套试卷全部包含翻译题型
  - `programmatic` TR-4.2: 翻译数据格式与其他试卷一致
- **Notes**: 先运行检查脚本确定具体是哪两套

### [ ] Task 5: 修正 2000-2009 年试卷分类
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 修改 index.json 中 2000-2009 年试卷的 type 字段
  - 从"英语一"改为"考研英语"或统一的标签
  - 确保前端显示逻辑兼容旧分类
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 2000-2009 年试卷 type 不再是"英语一"
  - `human-judgement` TR-5.2: 前端真题列表显示正确分类
- **Notes**: 需同时检查 pastPapers.js 中的分类筛选逻辑

### [ ] Task 6: 修复 getThemeColors 控制台错误
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 定位 getThemeColors 错误来源
  - 修复 exportedColors 解构错误
  - 确保主题色功能正常工作
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 控制台无 getThemeColors 相关错误
  - `human-judgement` TR-6.2: 主题切换功能正常
- **Notes**: 可能与 highlight-button.css 或主题系统相关

### [ ] Task 7: 修复设置面板默认打开问题
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 检查设置面板初始状态
  - 确保页面加载时设置面板默认关闭
  - 验证设置按钮点击可正常打开/关闭
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-7.1: 页面加载后 settingsPanel 默认不可见
  - `human-judgement` TR-7.2: 点击设置按钮可正常切换面板显示
- **Notes**: 检查 CSS 和 JS 中的初始状态设置

---

## 第二阶段：移动端功能对齐（3-4周）

### [ ] Task 8: 移植真题练习模块到移动端
- **Priority**: high
- **Depends On**: Task 3, Task 4, Task 5
- **Description**:
  - 复制 pastPapers.js 到移动端 js/ 目录
  - 复制 pastPaperReader.js 到移动端 js/ 目录
  - 复制 clozeExercise.js 到移动端 js/ 目录
  - 复制 longSentence.js 到移动端 js/ 目录
  - 复制 translation.js 到移动端 js/ 目录
  - 复制 writing.js 到移动端 js/ 目录
  - 复制 pastPapers.css 到移动端 css/ 目录
  - 复制 vocab-lib/pastpapers/ 目录到移动端
  - 复制 images/writing/ 目录到移动端
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-8.1: 移动端 js/ 目录包含所有真题相关 JS 文件
  - `programmatic` TR-8.2: 移动端 css/ 目录包含 pastPapers.css
  - `programmatic` TR-8.3: 移动端有完整的真题数据目录
  - `human-judgement` TR-8.4: 移动端可正常打开真题练习页面
- **Notes**: 复制后需调整移动端适配代码

### [ ] Task 9: 移动端真题页面 UI 适配
- **Priority**: high
- **Depends On**: Task 8
- **Description**:
  - 调整真题练习页面的移动端布局
  - 优化小屏幕下的按钮和文字大小
  - 适配触摸操作（拖拽工具栏等）
  - 确保所有交互在移动端可用
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `human-judgement` TR-9.1: 真题首页布局在手机屏幕上正常显示
  - `human-judgement` TR-9.2: 各子功能页面布局正常
  - `human-judgement` TR-9.3: 触摸操作流畅无卡顿
- **Notes**: 重点测试完形填空和真题精读的交互

### [ ] Task 10: 更新移动端 index.html
- **Priority**: high
- **Depends On**: Task 8
- **Description**:
  - 在移动端 index.html 中添加真题练习相关的 script 标签
  - 添加 pastPapers.css 的 link 标签
  - 添加真题练习入口按钮
  - 确保加载顺序正确
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `programmatic` TR-10.1: index.html 包含所有真题 JS 引用
  - `programmatic` TR-10.2: index.html 包含 pastPapers.css 引用
  - `human-judgement` TR-10.3: 导航栏有真题练习入口按钮
- **Notes**: 参照 Web 端 index.html 的脚本顺序

### [ ] Task 11: 建立 Web 端与移动端代码同步机制
- **Priority**: medium
- **Depends On**: Task 8
- **Description**:
  - 分析两端代码差异
  - 制定代码同步方案
  - 可考虑建立共享源码目录
  - 或编写同步脚本
- **Acceptance Criteria Addressed**: AC-11
- **Test Requirements**:
  - `human-judgement` TR-11.1: 有清晰的同步流程文档
  - `programmatic` TR-11.2: 同步脚本能正确复制文件
- **Notes**: 消除 www/ 目录的重复维护问题

### [ ] Task 12: 移动端密钥文件安全处理
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 将 miyao/ 目录移出项目仓库
  - 添加到 .gitignore
  - miyaomima.txt 密码文件应加密或删除
  - 建立密钥管理规范
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `programmatic` TR-12.1: 项目目录中无明文密码文件
  - `human-judgement` TR-12.2: 密钥文件有安全的存储方式
- **Notes**: 这是安全问题，必须优先处理

---

## 第三阶段：代码质量与架构升级（1-2月）

### [ ] Task 13: 统一模块命名和暴露方式
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 统一所有模块的命名风格
  - 确保所有模块都正确暴露到全局
  - 或统一使用 IIFE / class / const 对象模式
  - 更新所有模块间的引用方式
- **Acceptance Criteria Addressed**: AC-13
- **Test Requirements**:
  - `programmatic` TR-13.1: 所有模块都能通过 window.ModuleName 访问
  - `programmatic` TR-13.2: 模块命名风格一致
  - `human-judgement` TR-13.3: 代码风格统一，易于维护
- **Notes**: 建议统一为 const 对象 + 暴露到 window 的模式

### [ ] Task 14: 建立单元测试体系
- **Priority**: medium
- **Depends On**: Task 13
- **Description**:
  - 选择测试框架（Jest / Mocha）
  - 为核心模块编写测试用例
  - 设置测试覆盖率指标
  - 配置 CI 自动运行测试
- **Acceptance Criteria Addressed**: AC-14
- **Test Requirements**:
  - `programmatic` TR-14.1: 至少有 5 个核心模块的测试文件
  - `programmatic` TR-14.2: 测试覆盖率 > 60%
  - `human-judgement` TR-14.3: 测试用例质量高，覆盖关键路径
- **Notes**: 先从数据模块和工具函数开始

### [ ] Task 15: 引入模块化系统（可选）
- **Priority**: low
- **Depends On**: Task 14
- **Description**:
  - 评估 ES Modules 或打包工具（Vite/Rollup）
  - 逐步迁移核心模块
  - 保留向后兼容
- **Acceptance Criteria Addressed**: AC-15
- **Test Requirements**:
  - `human-judgement` TR-15.1: 模块化方案可行
  - `programmatic` TR-15.2: 构建后代码正常运行
- **Notes**: 需要评估对移动端和桌面端的影响

### [ ] Task 16: TypeScript 类型定义（可选）
- **Priority**: low
- **Depends On**: Task 15
- **Description**:
  - 为核心数据结构编写类型定义
  - 逐步迁移关键模块
  - 提升代码可维护性
- **Acceptance Criteria Addressed**: AC-16
- **Test Requirements**:
  - `human-judgement` TR-16.1: 主要数据结构有类型定义
  - `programmatic` TR-16.2: TypeScript 编译无错误
- **Notes**: 可以先用 JSDoc 方式渐进式添加类型

---

## 第四阶段：独立软件优化（长期）

### [ ] Task 17: 统一构建系统
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 统一 Web 端、移动端、桌面端的构建流程
  - 建立版本号管理机制
  - 自动生成变更日志
  - 优化构建产物大小
- **Acceptance Criteria Addressed**: AC-17
- **Test Requirements**:
  - `human-judgement` TR-17.1: 构建流程文档化
  - `programmatic` TR-17.2: 一键构建所有平台
- **Notes**: 可考虑使用 npm scripts 统一管理

### [ ] Task 18: 安装包优化
- **Priority**: low
- **Depends On**: Task 17
- **Description**:
  - 移除安装包中的调试文件
  - 压缩图片和 JSON 数据
  - 代码混淆（可选）
  - 数字签名（可选）
- **Acceptance Criteria Addressed**: AC-18
- **Test Requirements**:
  - `programmatic` TR-18.1: 安装包体积减小 20% 以上
  - `human-judgement` TR-18.2: 安装过程顺畅无报错
- **Notes**: 需要权衡体积和可读性

### [ ] Task 19: 桌面端完善（可选）
- **Priority**: low
- **Depends On**: Task 17
- **Description**:
  - 完善 Electron 桌面端配置
  - 测试桌面端功能完整性
  - 添加桌面端特有功能（系统托盘、快捷键等）
- **Acceptance Criteria Addressed**: AC-19
- **Test Requirements**:
  - `human-judgement` TR-19.1: 桌面端可正常安装运行
  - `programmatic` TR-19.2: 功能与 Web 端一致
- **Notes**: 如果用户需要桌面端再启动此任务

---

## 任务依赖关系图

```
第一阶段（并行度高）
  Task 1 ──┐
  Task 2 ──┤
  Task 3 ──┤
  Task 4 ──├──→ 第二阶段
  Task 5 ──┤
  Task 6 ──┤
  Task 7 ──┘

第二阶段
  Task 8 → Task 9 → Task 10 → 第三阶段
  Task 11 ──↗
  Task 12（独立）

第三阶段
  Task 13 → Task 14 → Task 15 → Task 16 → 第四阶段

第四阶段
  Task 17 → Task 18
  Task 19（可选）
```
