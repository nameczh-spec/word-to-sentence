/**
 * API请求模块 - apiRequest.js
 * 负责DeepSeek API封装、请求、异常捕获、Prompt管理
 */

const ApiRequest = {
    // 内置Prompt模板
    PROMPTS: {
        system: `你是一位专业的考研英语教师，擅长编写贴近考研英语阅读风格的文章。你的任务是根据给定的单词列表生成连贯的阅读段落，帮助学生在真实语境中记忆单词。

要求：
1. 必须将所有给定单词完整融入文本，每个单词至少出现一次
2. 单词释义优先使用考研高频释义
3. 在每个使用目标单词的句子后，用【单词:释义】格式标注该单词在当前句子中使用的具体释义
4. 文本风格贴近考研英语阅读：正式、学术、逻辑清晰
5. 如果单词数量较多（超过50个），自动拆分为多篇独立短文，每篇约200-300词
6. 遇到极生僻单词时，简化句式保证通顺，并在文本末尾单独列出这些生僻词
7. 保证全文语法正确、逻辑连贯

输出格式：
- 每篇短文用 ===短文N=== 分隔
- 生僻词汇总放在最后，用 ===生僻词=== 标识`,

        englishMode: `请生成纯英文阅读段落，模拟考研英语阅读文章风格。所有句子使用英文，难度适中，适合考研学生阅读理解。`,

        chineseMode: `请生成中文主线叙事文本，在语句中自然穿插当日英文单词。中文部分作为叙事主线，英文单词作为关键词嵌入，帮助学生在中文语境中理解单词用法。每个英文单词后紧跟其在当前句子中的中文释义。`
    },

    /**
     * 构建请求Prompt
     * @param {Array} words - 单词列表
     * @param {string} mode - 生成模式 ('english' | 'chinese')
     * @returns {string} 完整Prompt
     */
    buildPrompt(words, mode) {
        const wordList = words.join(', ');
        const modePrompt = mode === 'english' ? this.PROMPTS.englishMode : this.PROMPTS.chineseMode;
        
        return `${modePrompt}

今日单词列表（共${words.length}个）：
${wordList}

请开始生成阅读段落。`;
    },

    /**
     * 调用API生成文本（或本地极速模式）
     * @param {Array} words - 单词列表
     * @param {string} mode - 输出格式 'english' | 'chinese'
     * @param {string} engine - 生成引擎 'local' | 'api'
     * @returns {Promise<Object>} 生成结果
     */
    async generateText(words, mode, engine) {
        // 极速模式：走本地生成器
        if (engine === 'local') {
            if (window.LocalGenerator) {
                return window.LocalGenerator.generate(words, mode);
            }
            return { success: false, error: '本地生成器未加载' };
        }

        const apiConfig = ConfigManager.getApiConfig();
        
        // 验证配置
        if (!apiConfig.key) {
            return { success: false, error: '请先配置API密钥' };
        }
        
        if (words.length === 0) {
            return { success: false, error: '词单为空，请先导入单词' };
        }

        const prompt = this.buildPrompt(words, mode);
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);
            
            const response = await fetch(apiConfig.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiConfig.key}`
                },
                body: JSON.stringify({
                    model: apiConfig.model || 'deepseek-chat',
                    messages: [
                        { role: 'system', content: this.PROMPTS.system },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 4000
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                return this.handleApiError(response);
            }
            
            const data = await response.json();
            return this.parseApiResponse(data);
            
        } catch (e) {
            return this.handleApiError(e);
        }
    },

    /**
     * 处理API异常
     * @param {Error|Response} error - 错误对象
     * @returns {Object} 错误结果
     */
    handleApiError(error) {
        if (error.name === 'AbortError') {
            return { success: false, error: '请求超时，请检查网络或增加超时时间' };
        }
        
        if (error instanceof Response) {
            if (error.status === 401) {
                return { success: false, error: 'API密钥无效，请检查配置' };
            }
            if (error.status === 429) {
                return { success: false, error: '请求过于频繁，请稍后再试' };
            }
            if (error.status === 500) {
                return { success: false, error: 'API服务异常，请稍后再试' };
            }
            return { success: false, error: `API返回错误: ${error.status}` };
        }
        
        return { success: false, error: '网络连接失败，请检查网络' };
    },

    /**
     * 解析API返回内容
     * @param {Object} data - API返回数据
     * @returns {Object} 解析结果
     */
    parseApiResponse(data) {
        try {
            const content = data.choices?.[0]?.message?.content || '';
            
            if (!content) {
                return { success: false, error: '生成失败，API返回空内容' };
            }
            
            // 解析文本和生僻词
            const { text, rareWords } = this.parseContent(content);
            
            return {
                success: true,
                data: {
                    text: text,
                    rareWords: rareWords,
                    rawContent: content
                }
            };
        } catch (e) {
            return { success: false, error: '解析返回内容失败' };
        }
    },

    /**
     * 解析生成内容
     * @param {string} content - 原始内容
     * @returns {Object} {text, rareWords}
     */
    parseContent(content) {
        let text = content;
        let rareWords = [];
        
        // 提取生僻词部分
        const rareMatch = content.match(/===生僻词===\s*([\s\S]*?)(?:===|$)/);
        if (rareMatch) {
            const rareSection = rareMatch[1];
            rareWords = rareSection
                .split(/[\n,]+/)
                .map(w => w.trim())
                .filter(w => w.length > 0 && /^[a-z]/i.test(w));
            
            // 移除生僻词标记部分
            text = content.replace(/===生僻词===\s*[\s\S]*?(?===|$)/, '').trim();
        }
        
        // 清理分隔标记
        text = text.replace(/===短文\d+===\s*/g, '\n\n');
        
        // 清理 **加粗标记**（保留单词本身）
        // 支持单词内含标点、撇号等，如 **Database,** **system's**
        text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
        
        // 清理 【单词:释义】 格式的内嵌释义（支持半角冒号:和全角冒号：）
        // 仅当两侧都是ASCII字符时才添加空格，避免英文-中文之间多余空格
        text = text.replace(/([\x21-\x7e])【[a-zA-Z-]+[：:]\s*[^\】]+\】([\x21-\x7e])/g, '$1 $2');
        text = text.replace(/【[a-zA-Z-]+[：:]\s*[^\】]+\】/g, '');
        
        // 清理 （中文释义） 格式的括号注释（中文主线叙事模式）
        // 使用排除法匹配右括号前的所有内容，不添加空格（中文无需空格分隔）
        text = text.replace(/\s*（[^）]+）/g, '');
        
        // 清理多余的空格和换行，规范化空格
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.replace(/\s{2,}/g, ' ');  // 多个空格合并为一个
        text = text.trim();
        
        return { text, rareWords };
    },

    /**
     * 从文本中提取单词释义映射
     * @param {string} text - 生成的文本
     * @returns {Object} 单词释义映射 {word: {pos, translation}}
     */
    extractWordMappings(text) {
        const mappings = {};
        
        // 匹配 【单词:释义】 格式（支持半角冒号:和全角冒号：）
        const regex = /【([a-zA-Z-]+)[：:]\s*([^\】]+)\】/g;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            const word = match[1].toLowerCase();
            const translation = match[2].trim();
            
            // 提取词性（如果有）
            const posMatch = translation.match(/^(n\.|v\.|adj\.|adv\.|prep\.|conj\.|int\.)/);
            const pos = posMatch ? posMatch[1] : '';
            const pureTranslation = posMatch ? translation.replace(posMatch[1], '').trim() : translation;
            
            mappings[word] = {
                pos: pos,
                translation: pureTranslation
            };
        }
        
        return mappings;
    },

    /**
     * 调用大模型对释义列表进行语义去重
     * @param {string} word - 单词
     * @param {Array} meanings - 释义列表 [{pos, text, sources}]
     * @returns {Promise<Array>} 去重后的释义索引列表（保留的索引）
     */
    async deduplicateMeaningsByAI(word, meanings) {
        const apiConfig = ConfigManager.getApiConfig();
        if (!apiConfig.key || meanings.length <= 1) {
            // 无API密钥或只有一条释义，直接返回全部
            return meanings.map((_, i) => i);
        }

        const meaningList = meanings.map((m, i) => `${i}. [${m.pos || '无词性'}] ${m.text}`).join('\n');

        const prompt = `你是一个语义分析专家。请判断以下单词"${word}"的释义列表中，哪些释义表达的是相同或高度相似的意思。

释义列表：
${meaningList}

判断规则：
1. 如果多条释义的核心中文意思完全相同（即使有的带了英文注释如databank，有的没有），它们就是重复的
2. 对于重复的释义，只保留信息最丰富、最完整的那一条（包含括号注释、近义词、英文对照等额外信息的优先）
3. 如果两条释义的核心意思不同（即使词性相同），则都保留

请严格按以下JSON格式返回结果，不要输出任何其他内容：
{"keep":[要保留的释义索引编号，用数字表示]，"reason":"简要说明去重理由"}`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(apiConfig.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiConfig.key}`
                },
                body: JSON.stringify({
                    model: apiConfig.model || 'deepseek-chat',
                    messages: [
                        { role: 'system', content: '你是一个精确的语义分析工具，只输出JSON格式结果。' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0,
                    max_tokens: 500
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                return meanings.map((_, i) => i);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            // 解析JSON结果（先清理可能的Markdown代码块包裹）
            const cleanedContent = content.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
            const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                if (result.keep && Array.isArray(result.keep)) {
                    // 验证索引有效性
                    const validIndices = result.keep
                        .filter(i => i >= 0 && i < meanings.length)
                        .map(i => parseInt(i));
                    // 确保至少保留一条
                    if (validIndices.length > 0) {
                        return validIndices;
                    }
                }
            }

            return meanings.map((_, i) => i);
        } catch (e) {
            // API调用失败，返回全部
            return meanings.map((_, i) => i);
        }
    }
};

// 导出模块
window.ApiRequest = ApiRequest;