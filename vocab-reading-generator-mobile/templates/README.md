# VocabTool 模板格式规范

## 1. 概述

模板（Template）是句子骨架文件。生成器加载模板后，将用户单词按词性填入骨架的占位符中，组装成完整的阅读段落。

你可以通过以下方式管理模板：
- **网页导入**：打开 设置 → 模板管理 → 选择模板文件导入（推荐）
- **文件放置**：将 `.json` 文件放入程序目录的 `templates/` 文件夹，重启生效

---

## 2. JSON 文件结构

每个模板文件是一个 JSON 对象，包含三个字段：

```json
{
    "topic": "science",
    "description": "科学研究类 - 适用于实验、发现、理论等学术话题",
    "skeletons": [
        {
            "text": "The {adj} discovery of {n} has {v} the existing paradigm.",
            "slots": [
                { "pos": "adj" },
                { "pos": "n" },
                { "pos": "v", "form": "pp" }
            ]
        }
    ]
}
```

### 顶层字段

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `topic` | 是 | string | 主题标识符，如 `science`、`technology`。也是文件名（`science.json`） |
| `description` | 是 | string | 主题描述，用于日志和调试 |
| `skeletons` | 是 | array | 句子骨架数组，每个元素是一条骨架 |

### 骨架字段

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `text` | 是 | string | 骨架文本，包含占位符（如 `{n}`、`{v}`） |
| `slots` | 是 | array | 占位符定义数组，声明每个占位符的词性和变形要求 |

### 槽位（slot）字段

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `pos` | 是 | string | 词性标识符，见下方「占位符类型」 |
| `form` | 否 | string | 动词变形要求，仅 `pos` 为 `v` 时有效，见下方「动词变形」 |

---

## 3. 占位符类型

占位符写在 `text` 字段中，用花括号包裹。共有 7 种：

### 3.1 标准词性占位符

| 占位符 | 词性 | 说明 | 生成器行为 |
|--------|------|------|-----------|
| `{n}` | 名词 | 普通名词，句子讨论的核心对象 | 从用户名词库随机选取；无则用默认词（如 `phenomenon`、`factor`） |
| `{v}` | 动词 | 动作词 | 从用户动词库选取，并根据 `form` 字段变形；无则用默认词（如 `affect`、`demonstrate`） |
| `{adj}` | 形容词 | 描述性修饰词 | 从用户形容词库选取；无则用默认词（如 `significant`、`crucial`） |
| `{adv}` | 副词 | 程度/方式修饰词 | 从用户副词库选取；无则用默认词（如 `significantly`、`increasingly`） |

### 3.2 语义身份占位符

| 占位符 | 语义身份 | 说明 | 生成器行为 |
|--------|---------|------|-----------|
| `{Name}` | 专有名词 | 人名、地名、机构名等背景设定 | **优先**选大写开头的词；无则选 5-12 字母的词；无则用默认专有名词（如 `Harvard`、`NASA`、`Silicon Valley`） |
| `{term}` | 专业术语 | 考研大纲中的学术词汇、长词 | **优先**选 ≥8 字母的长词；无则选 ≥6 字母的词；无则用默认术语（如 `globalization`、`biodiversity`） |
| `{num}` | 数字 | 数值占位 | 直接生成 10-99 的随机数，**不消耗用户单词** |

### 3.3 为什么需要语义身份？

同一个句子中可能有多个名词槽位，但它们的语义角色不同：

```
原句：Steve Jobs, the founder of Apple, revolutionized the smartphone industry.
```

如果全部用 `{n}`：
```json
{ "text": "{n}, the founder of {n}, {v} the {n} industry." }
```
→ 三个 `{n}` 看起来一样，无法区分哪个是人名、哪个是公司名、哪个是行业术语。

使用语义标签后：
```json
{ "text": "{Name}, the founder of {Name}, {v} the {term} industry." }
```
→ 一眼就能看出：第一个是人名，第二个是公司名，第三个是行业术语。

**对生成器而言**：`{Name}` 和 `{term}` 都从名词库取词，但 `{Name}` 优先选大写/中等长度的词，`{term}` 优先选长词（学术词通常较长）。这样生成的句子更自然、更符合考研阅读风格。

---

## 4. 动词变形

当 `pos` 为 `v` 时，可通过 `form` 字段指定动词的变形形式：

| form 值 | 说明 | 输入 → 输出 |
|---------|------|-------------|
| `base` | 原形（默认，可省略） | `demonstrate` → `demonstrate` |
| `past` | 过去式 | `demonstrate` → `demonstrated` |
| `pp` | 过去分词 | `demonstrate` → `demonstrated` |
| `3sg` | 第三人称单数 | `demonstrate` → `demonstrates` |
| `gerund` | 现在分词 | `demonstrate` → `demonstrating` |

生成器内置 86 个不规则动词的变形表（如 `begin → began → begun`），规则动词按拼写规则自动变形。

**注意**：`form` 仅对 `{v}` 有效。`{n}`、`{adj}`、`{adv}`、`{Name}`、`{term}` 不需要 `form` 字段。

---

## 5. 完整示例

### 5.1 英文学术模板

```json
{
    "topic": "technology",
    "description": "科技类 - 适用于人工智能、数字化、自动化等技术话题",
    "skeletons": [
        {
            "text": "The {adj} advancement in {term} has {v} to {adj} improvements in efficiency.",
            "slots": [
                { "pos": "adj" },
                { "pos": "term" },
                { "pos": "v", "form": "pp" },
                { "pos": "adj" }
            ]
        },
        {
            "text": "{Name} {v} that the integration of {term} into everyday life {v} both opportunities and challenges.",
            "slots": [
                { "pos": "Name" },
                { "pos": "v", "form": "3sg" },
                { "pos": "term" },
                { "pos": "v", "form": "3sg" }
            ]
        },
        {
            "text": "In {num}, {Name} published a {adj} study on {n} and its {n} implications.",
            "slots": [
                { "pos": "num" },
                { "pos": "Name" },
                { "pos": "adj" },
                { "pos": "n" },
                { "pos": "n" }
            ]
        }
    ]
}
```

### 5.2 中文叙事模板

中文模板的 `text` 直接写中文，占位符位置嵌入英文单词：

```json
{
    "topic": "chinese",
    "description": "中文叙事类 - 中文躯干嵌入英文单词模式",
    "skeletons": [
        {
            "text": "近年来，{Name}团队在{term}领域取得了{adj}突破，{v}了人们对{n}的传统认知。",
            "slots": [
                { "pos": "Name" },
                { "pos": "term" },
                { "pos": "adj" },
                { "pos": "v", "form": "past" },
                { "pos": "n" }
            ]
        }
    ]
}
```

---

## 6. 格式要求

### 必须遵守

1. **文件编码**：UTF-8（无 BOM）
2. **文件后缀**：`.json`
3. **JSON 合法性**：文件必须是合法的 JSON，不能有注释、尾逗号等
4. **占位符数量**：`text` 中每种占位符的出现次数应与 `slots` 中对应 `pos` 的数量一致
5. **topic 唯一性**：不同文件的 `topic` 不能重复（导入时会提示覆盖）

### 命名规范

- 文件名与 `topic` 字段保持一致：`science.json` → `"topic": "science"`
- 以下划线 `_` 开头的文件会被忽略（如 `_example.json`）
- 建议使用小写英文，用连字符分隔复合词：`health-care.json`

### 建议但不强制

- 每个主题至少 10 条骨架，以确保生成多样性
- 每条骨架包含 1-4 个占位符
- 骨架文本应符合考研英语阅读理解的学术风格
- 避免骨架中出现真实的专有名词或具体数字（用占位符代替）

---

## 7. 导入方式

### 方式一：网页导入（推荐）

1. 打开 VocabTool 网页
2. 点击右上角 **设置** 按钮
3. 找到 **模板管理** 区域
4. 点击 **选择模板文件**，选取一个 `.json` 文件
5. 导入成功后，模板立即生效，刷新页面也不会丢失

### 方式二：文件放置

1. 将 `.json` 文件放入程序目录的 `templates/` 文件夹
2. 编辑 `templates/_files.json`，将文件名添加到数组中
3. 重启程序

`_files.json` 格式：
```json
[
    "science.json",
    "technology.json",
    "your-custom.json"
]
```
