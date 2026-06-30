# 项目审计检查清单

## 🔴 高优先级问题

- [ ] 2006年真题数据缺失
  - 验证：检查 vocab-lib/pastpapers/index.json 是否包含2006年条目
  - 验证：检查 vocab-lib/pastpapers/ 目录下是否有 2006.json 文件

- [ ] 移动端真题练习模块完全缺失
  - 验证：检查 vocab-reading-generator-mobile/js/ 目录
  - 验证：缺少 pastPapers.js, pastPaperReader.js, clozeExercise.js, longSentence.js, translation.js, writing.js
  - 验证：缺少 pastPapers.css 样式文件
  - 验证：缺少 vocab-lib/pastpapers/ 数据目录
  - 验证：缺少 images/writing/ 作文图片目录

- [ ] 移动端密钥文件明文存储
  - 验证：检查 vocab-reading-generator-mobile/miyao/ 目录
  - 验证：miyaomima.txt 包含明文密码
  - 验证：vocab-app-key.jks 密钥文件在项目目录中

- [ ] 227个临时文件严重影响项目维护
  - 验证：vocab-reading-generator/ 根目录有 184 个 _*.js 脚本
  - 验证：vocab-reading-generator/ 根目录有 41 个 _*-raw.txt 原始文件
  - 验证：vocab-reading-generator/ 根目录有 2 个 debug*.txt 调试文件
  - 验证：这些文件与项目运行无关，是数据处理过程文件

## 🟡 中优先级问题

- [ ] 2套试卷翻译部分缺失
  - 验证：41套试卷中只有39套有翻译题型
  - 验证：需确认具体是哪两套缺失

- [ ] 2000-2009年试卷分类错误
  - 验证：index.json 中 2000-2009 年试卷 type 字段均为"英语一"
  - 验证：实际上2010年才开始分英语一/英语二
  - 验证：2000-2009年应标记为"考研英语"或类似通用标签

- [ ] getThemeColors 控制台错误
  - 验证：浏览器控制台报错：Cannot destructure property 'exportedColors' of 'undefined'
  - 验证：错误来源不明，需排查 theme.css 或相关脚本

- [ ] 设置面板默认打开
  - 验证：页面加载后右侧设置面板处于显示状态
  - 验证：正常应该默认隐藏，点击设置按钮才显示

- [ ] 模块命名和暴露方式不一致
  - 验证：apiRequest.js 未暴露到全局 window 对象
  - 验证：settingsManager.js 未暴露到全局 window 对象
  - 验证：translation.js 未暴露到全局 window 对象
  - 验证：writing.js 未暴露到全局 window 对象
  - 验证：vocabBook.js 类名为 VocabBookManager（非 VocabBook）
  - 验证：pastPapers.js 使用 IIFE 封装，其他模块风格不统一

- [ ] 冗余目录和文件
  - 验证：VocabTool/ 目录为旧版本项目
  - 验证：english-vocabulary-master/ 为词库源数据
  - 验证：根目录 2024考研英语词汇红宝书.PDF 与项目无关
  - 验证：build/VocabTool/ 为旧版本构建

- [ ] 无单元测试
  - 验证：Web端 0 个测试文件
  - 验证：移动端仅 1 个测试文件（vocabBook.test.js）
  - 验证：核心功能模块无测试覆盖

- [ ] 移动端 www 目录资源重复
  - 验证：vocab-reading-generator-mobile/www/ 包含完整的 Web 资源副本
  - 验证：与根目录下的 js/css/templates 等重复
  - 验证：需要手动同步，容易遗漏

## ⚠️ 低优先级问题

- [ ] 代码风格不统一
  - 验证：部分模块使用 const 对象模式
  - 验证：部分模块使用 class 模式
  - 验证：部分模块使用 IIFE 模式

- [ ] Electron 配置未使用
  - 验证：移动端 package.json 有 electron 相关配置
  - 验证：electron-main.js 存在
  - 验证：未实际构建或使用桌面端

- [ ] 错误处理不完善
  - 验证：部分模块有 try/catch
  - 验证：关键操作缺少错误边界处理
  - 验证：用户提示不完整

- [ ] 移动端进度记录.md 文件
  - 验证：vocab-reading-generator-mobile/进度记录.md 存在
  - 验证：开发过程文档，不影响功能但应归档

## 📋 界面与交互检查

- [ ] 顶部导航栏按钮布局合理
- [ ] 左侧边栏历史记录和词单管理布局清晰
- [ ] 主内容区文本展示正常
- [ ] 设置面板抽屉动画流畅
- [ ] 单词点击弹窗样式统一
- [ ] 真题练习页面风格与主界面一致
- [ ] 按钮状态反馈正常（hover/active/disabled）
- [ ] 加载状态提示正常
- [ ] Toast 提示位置和样式合理

## 📊 数据完整性检查

- [ ] 所有真题数据格式一致
- [ ] 完形填空选项完整（每题4个选项）
- [ ] 阅读理解文章和题目对应
- [ ] 翻译题有原文和参考译文
- [ ] 作文题有题目和范文
- [ ] 答案数据准确无误
- [ ] 词库单词释义准确
- [ ] 单词音标格式统一

## 🔧 架构与维护性检查

- [ ] 模块职责清晰，单一职责原则
- [ ] 模块间依赖关系合理
- [ ] 无循环依赖
- [ ] 代码可扩展性良好
- [ ] 配置与代码分离
- [ ] 有版本号管理
- [ ] 有构建脚本
- [ ] 有部署文档

## 🔒 安全性检查

- [ ] API密钥不以明文出现在代码中
- [ ] 用户数据本地存储安全
- [ ] 无XSS注入风险
- [ ] 文件上传有类型校验
- [ ] 敏感操作有确认提示
