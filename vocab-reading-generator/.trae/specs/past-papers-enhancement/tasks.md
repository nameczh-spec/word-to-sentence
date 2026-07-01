# 考研真题模块功能增强 - 实现计划

## [x] Task 1: 历年真题网格布局优化
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 修改CSS，将年份分组改为纯网格布局
  - 所有试卷卡片并排显示，一行多个，自动换行
  - 保持卡片悬停效果和点击交互
  - 修改JS渲染逻辑，移除年份分组，直接渲染卡片网格
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-1.1: 试卷卡片以网格形式排列，一行显示多个（至少3-4个），自动换行
  - `human-judgement` TR-1.2: 卡片悬停效果和点击功能正常
- **Notes**: 移除pp-year-group分组，直接用grid布局渲染所有卡片

## [x] Task 2: 翻译练习模块功能完善
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 从真题JSON数据的translation section提取翻译句子
  - 实现翻译页面的完整渲染（原文、参考译文、句子解析）
  - 实现句子切换功能（上一句/下一句或tab切换）
  - 实现折叠面板展开/收起功能
  - 完善返回试卷选择功能
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` TR-2.1: 选择试卷后能正常显示翻译原文句子
  - `human-judgement` TR-2.2: 可以切换不同的翻译句子
  - `human-judgement` TR-2.3: 参考译文和解析折叠面板可以正常展开收起
- **Notes**: 确保所有年份试卷都有翻译数据，缺失的做降级处理

## [x] Task 3: 作文指导模块功能完善
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 从真题JSON数据的writing section提取作文题目
  - 实现作文页面的完整渲染（Part A、Part B题目）
  - 实现参考范文折叠面板
  - 实现写作技巧折叠面板
  - 完善返回试卷选择功能
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-3.1: 选择试卷后能正常显示Part A和Part B作文题目
  - `human-judgement` TR-3.2: 参考范文和写作技巧折叠面板可以正常展开收起
  - `human-judgement` TR-3.3: 返回按钮功能正常
- **Notes**: 范文和技巧可以先提供通用模板，后续再细化

## [x] Task 4: 长难句数据扩充与规范
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 从所有真题阅读文章中自动筛选长难句（基于长度和复杂度）
  - 为每句生成规范的解析：句子主干、中文翻译、语法分析
  - 数量目标：至少100句以上
  - 按来源（年份+试卷+篇目）分类
  - 解析格式参考考研英语长难句标准解析方式
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: 长难句总数 >= 100句
  - `human-judgement` TR-4.2: 每句都有完整的五个字段（来源、原句、主干、翻译、解析）
  - `human-judgement` TR-4.3: 解析格式规范，语法分析准确
- **Notes**: 优先保证质量，宁缺毋滥；可以从近年真题开始提取

## [x] Task 5: 做题模式工具栏
- **Priority**: medium
- **Depends On**: Task 6
- **Description**:
  - 在做题页面（完形填空、真题精读）添加工具栏
  - 选择模式按钮：默认模式，可点击选择答案
  - 书写模式按钮：模拟答题环境（可选：显示答题区域）
  - 橡皮擦按钮：清除当前题或全部题的答案
  - 工具栏样式与整体风格一致
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgement` TR-5.1: 工具栏在题目区域正确显示
  - `human-judgement` TR-5.2: 三个模式按钮可点击，有选中状态
  - `human-judgement` TR-5.3: 橡皮擦功能可以清除已选答案
- **Notes**: 书写模式初期可简化为纯展示模式，后续再增强

## [x] Task 6: 真题精读题目交互修复与Text切换修复
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 修复Text 2及以后页面切换报错问题（section.article undefined）
  - 实现题目选项点击选择功能
  - 添加选项选中状态样式（高亮/变色）
  - 支持切换答案（重新点击其他选项）
  - 确保4篇阅读文章都能正常切换显示
- **Acceptance Criteria Addressed**: AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-6.1: 点击Text 1-4标签都能正常切换，控制台无报错
  - `human-judgement` TR-6.2: 题目选项A/B/C/D可以点击选择
  - `human-judgement` TR-6.3: 选中的选项有明显的视觉反馈
  - `human-judgement` TR-6.4: 可以切换选择不同选项
- **Notes**: 先修复Text切换bug，再实现选项交互

## [x] Task 7: 整体测试与验证
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5, Task 6
- **Description**:
  - 打开浏览器逐一测试所有功能
  - 检查界面风格一致性
  - 检查所有按钮点击是否正常
  - 检查页面排版美观度
  - 修复发现的所有问题
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7
- **Test Requirements**:
  - `human-judgement` TR-7.1: 所有功能入口可正常进入，无空白页或报错
  - `human-judgement` TR-7.2: 界面风格统一，排版美观
  - `human-judgement` TR-7.3: 所有交互功能（点击、切换、展开收起）正常工作
- **Notes**: 必须在真实浏览器环境中测试验证
