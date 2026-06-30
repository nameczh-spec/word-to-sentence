# 明日继续操作指南

## 📅 明天开始前

### 1. GitHub仓库创建（5分钟）

请在GitHub上执行以下操作：

1. 访问 https://github.com/new
2. 仓库名称填写：`单词化句` 或 `vocab-reading`
3. 选择 Private（私有）或 Public（公开）
4. 点击 "Create repository"
5. 创建后，GitHub会显示推送命令，复制类似以下的命令：

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

6. 在本地终端执行这些命令

### 2. 开始修改前

在本地终端执行：
```bash
cd "h:\IT\单词化句"
git pull  # 拉取最新（如果有更新）
```

## 📋 明天任务清单

### 优先级1：项目清理（高优先级）
- [ ] 删除227个临时文件（184个_*.js + 41个_*.txt + 2个debug*.txt）
- [ ] 删除冗余目录
- [ ] 验证删除后功能正常

### 优先级2：数据修复（高优先级）
- [ ] 补充2006年真题数据
- [ ] 修复缺失翻译的2套试卷
- [ ] 修正2000-2009年试卷分类

### 优先级3：Bug修复（高优先级）
- [ ] 修复getThemeColors控制台错误
- [ ] 修复设置面板默认打开问题

### 优先级4：移动端功能（高优先级）
- [ ] 移植真题练习模块到移动端
- [ ] 适配Pad端默写模式

### 优先级5：实现不背单词风格功能（中期任务）
- [ ] 创建learningEngine.js基础架构
- [ ] 实现记忆曲线算法
- [ ] 实现默写练习（键盘+手写模式）

## 📂 重要文件位置

### 设计文档
```
h:\IT\单词化句\.trae\specs\project-full-audit\
├── spec.md                    # 全面分析报告
├── checklist.md               # 问题检查清单
├── tasks.md                   # 开发路线规划
├── vocab-learning-design.md    # 不背单词功能设计
├── vocab-learning-prd.md      # 产品需求规范
└── PROGRESS.md                # 当前进度报告
```

### 核心项目文件
```
h:\IT\单词化句\
├── vocab-reading-generator\       # Web端主项目
│   ├── js\                         # JS模块
│   ├── css\                        # 样式文件
│   └── vocab-lib\pastpapers\      # 真题数据
└── vocab-reading-generator-mobile\ # 移动端项目
    ├── js\                         # JS模块
    └── www\                        # Web资源副本
```

## 🔧 每次修改前必做

1. **备份文件**：
```bash
git add -A
git commit -m "备份：修改描述"
```

2. **创建备份副本**（针对要修改的文件）：
```bash
copy "原文件路径" "原文件路径.backup"
```

3. **修改并测试**

4. **验证功能正常后删除备份**：
```bash
del "原文件路径.backup"
```

## 📊 Git操作提示

### 查看当前状态
```bash
git status
```

### 查看修改历史
```bash
git log --oneline -10
```

### 创建备份提交
```bash
git add -A
git commit -m "备份：具体描述"
```

### 推送到GitHub（流量充足时）
```bash
git push origin main
```

## ⚠️ 重要提醒

1. **每次修改前务必备份**
2. **每完成一个任务提交一次Git**
3. **发现问题立即回滚**：`git checkout -- 文件名`
4. **定期同步GitHub**：每天至少push一次

## 🎯 成功标准

- ✅ 项目目录整洁，无临时文件
- ✅ 2006年真题数据完整
- ✅ 所有功能正常运行
- ✅ 移动端功能与Web端对齐
- ✅ 不背单词风格功能核心模块完成
- ✅ 代码已推送到GitHub

---

**准备就绪，等待明天继续！**
