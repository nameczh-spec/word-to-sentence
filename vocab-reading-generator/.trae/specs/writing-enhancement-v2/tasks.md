# 考研真题模块功能增强V2 - 实现计划

## [ ] Task 1: 作文数据提取修复
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 分析真题JSON数据中作文部分的实际格式
  - 修复writing.js中的数据提取逻辑，正确处理表格、图表等
  - 对于无法提取的内容，提供友好的降级提示
  - 测试多套真题的作文显示
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-1.1: 2025年英语一作文题目正确显示
  - `human-judgement` TR-1.2: 含图表的作文题目正确显示
  - `human-judgement` TR-1.3: 历年真题作文都能正常提取
- **Notes**: 先读取几套真题的writing section数据结构

## [ ] Task 2: 参考范文质量提升
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 从网络收集真实的高质量考研英语作文范文
  - 为每篇作文题目准备2-3篇范文
  - 标注范文特点和适用场景
  - 更新writing.js中的范文数据
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` TR-2.1: 每篇作文至少有2篇参考范文
  - `human-judgement` TR-2.2: 范文内容真实，非敷衍生成
  - `human-judgement` TR-2.3: 范文格式正确，排版美观
- **Notes**: 优先更新近5年真题的范文

## [ ] Task 3: 针对性写作技巧编写
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 真正阅读每篇作文题目
  - 根据题目类型（图表作文、书信、应用文、图画作文等）编写针对性技巧
  - 技巧包含：结构建议、开头结尾技巧、常用句型、注意事项
  - 确保不同类型作文的技巧完全不同
  - 更新writing.js中的技巧数据
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-3.1: 图表作文技巧针对图表类型
  - `human-judgement` TR-3.2: 书信/应用文技巧针对书信格式
  - `human-judgement` TR-3.3: 不同年份同一类型技巧有差异
- **Notes**: 需要人工分析每篇题目，不能批量生成

## [ ] Task 4: 作文答题区域实现
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 在writing.js中添加作文答题区域
  - 使用textarea或contenteditable元素
  - 添加字数统计显示
  - 实现localStorage保存草稿功能
  - 样式与整体风格一致
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgement` TR-4.1: 答题区域在题目下方正确显示
  - `human-judgement` TR-4.2: 可以正常输入中英文
  - `human-judgement` TR-4.3: 字数统计实时更新
  - `human-judgement` TR-4.4: 刷新页面后草稿内容保留
- **Notes**: 草稿保存使用paperId作为key

## [ ] Task 5: AI作文批改功能框架
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  - 设计AI批改按钮和交互流程
  - 编写不同类型作文的prompt提示词：
    - 图表作文prompt
    - 书信/应用文prompt
    - 图画作文prompt
  - 设计批改结果展示页面
  - 预留API调用接口
  - 暂时显示"AI批改功能待接入API"或模拟结果
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 提交按钮正确显示
  - `programmatic` TR-5.2: 不同类型作文有不同prompt
  - `human-judgement` TR-5.3: 批改结果页面结构正确
  - `programmatic` TR-5.4: API接口预留正确
- **Notes**: Prompt设计参考专业英语写作评分标准

## [ ] Task 6: 长难句数据大幅扩充
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 从2000-2025年全部真题中提取长难句
  - 目标：至少300句以上
  - 按年份、试卷类型分类存储
  - 确保句子质量（真正包含复杂语法结构）
  - 更新longSentence.js中的defaultSentences数组
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 长难句总数 >= 300句
  - `programmatic` TR-6.2: 覆盖2000-2025年真题
  - `human-judgement` TR-6.3: 每句都包含复杂语法结构
- **Notes**: 优先从历年真题阅读理解文章中提取

## [ ] Task 7: 长难句解析质量提升
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 参考专业考研英语长难句解析标准
  - 规范解析格式：
    - 主干提取
    - 从句分析
    - 词汇注释
  - 逐句审核现有解析，确保准确专业
  - 补充完善所有解析
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgement` TR-7.1: 解析格式统一规范
  - `human-judgement` TR-7.2: 语法分析准确
  - `human-judgement` TR-7.3: 重点词汇标注清晰
- **Notes**: 需要人工审核确保质量

## [ ] Task 8: 书写模式圈画增强
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 在做题页面添加Canvas画布层
  - 实现画笔工具：
    - 颜色选择器（预设+自定义）
    - 粗细调节（细/中/粗/极粗）
    - 形状选择（圆形、方形、荧光笔）
    - 透明度调节
  - 更新工具栏UI
  - 实现画布交互（绑定鼠标/触摸事件）
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-8.1: 可以选择不同颜色
  - `human-judgement` TR-8.2: 可以调节粗细
  - `human-judgement` TR-8.3: 可以选择形状
  - `human-judgement` TR-8.4: 可以调节透明度
  - `human-judgement` TR-8.5: 圈画流畅无延迟
- **Notes**: 画布覆盖文章区域，不覆盖题目

## [ ] Task 9: 橡皮擦功能增强
- **Priority**: medium
- **Depends On**: Task 8
- **Description**:
  - 分离橡皮擦与画笔工具
  - 实现橡皮擦大小调节（小/中/大/极大）
  - 实现橡皮擦形状选择（圆形、方形）
  - 更新工具栏UI添加橡皮擦设置
  - 实现橡皮擦擦除功能
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `human-judgement` TR-9.1: 可以切换橡皮擦模式
  - `human-judgement` TR-9.2: 可以调节橡皮大小
  - `human-judgement` TR-9.3: 可以调节橡皮形状
  - `human-judgement` TR-9.4: 擦除功能正常
- **Notes**: 橡皮擦使用globalCompositeOperation实现

## [ ] Task 10: 整体测试与验证
- **Priority**: high
- **Depends On**: Task 1-9
- **Description**:
  - 打开浏览器逐一测试所有功能
  - 检查界面风格一致性
  - 检查所有交互功能
  - 修复发现的问题
- **Acceptance Criteria Addressed**: AC-1 to AC-9
- **Test Requirements**:
  - `human-judgement` TR-10.1: 所有功能入口正常
  - `human-judgement` TR-10.2: 界面风格统一
  - `human-judgement` TR-10.3: 无JavaScript错误
- **Notes**: 必须在真实浏览器环境测试
