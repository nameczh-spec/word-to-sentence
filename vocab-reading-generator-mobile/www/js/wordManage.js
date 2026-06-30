/**
 * 单词管理模块 - wordManage.js
 * 负责单词导入、解析、去重、分组、状态标记
 */

const WordManager = {
    // 当日词单数据（仅当日操作可写入）
    wordList: null,

    // 历史只读视图数据（与当日 wordList 完全隔离）
    _historyWordList: null,

    // 当前筛选状态
    currentGroup: 'all',
    currentStatus: 'all',

    // 是否为只读模式（查看历史数据）
    _isReadOnly: false,
    _historyDate: null,

    /**
     * 初始化单词管理
     */
    init() {
        this.wordList = DataStore.loadWordList();
        this._isReadOnly = false;
        this._historyDate = null;
        this.renderWordList();
        this.updateStats();
        this.bindEvents();
    },

    /**
     * 设置只读模式（查看历史数据）
     * @param {boolean} readonly - 是否只读
     * @param {string|null} date - 历史日期
     */
    setReadOnly(readonly, date) {
        this._isReadOnly = readonly;
        this._historyDate = readonly ? date : null;
    },

    /**
     * 加载历史记录到只读视图（数据隔离：写入独立 _historyWordList，不污染当日 wordList）
     * @param {Object} record - 历史记录
     */
    loadHistoryWords(record) {
        if (!record) return;
        
        // 【数据隔离】历史数据写入独立视图空间，绝不覆盖当日 wordList
        this._historyWordList = {
            date: record.date,
            reviewWords: [...(record.reviewWords || [])],
            newWords: [...(record.newWords || [])],
            wordDetails: { ...(record.wordDetails || {}) }
        };
        
        this._isReadOnly = true;
        this._historyDate = record.date;
        
        this.renderWordList();
        this.updateStats();
        this.renderGroupTabs();
    },

    /**
     * 恢复当天模式（清除历史视图数据，恢复纯净当日词单）
     */
    restoreToday() {
        // 【数据隔离】清除历史视图数据，释放内存
        this._historyWordList = null;
        this._isReadOnly = false;
        this._historyDate = null;

        // 从 localStorage 重新加载纯净的当日词单
        this.wordList = DataStore.loadWordList();
        this.renderWordList();
        this.updateStats();
        this.renderGroupTabs();
    },

    /**
     * 解析输入文本为单词列表（支持带释义格式）
     * @param {string} input - 输入文本
     * @returns {Array} 单词列表（含可选释义信息）
     */
    parseWords(input) {
        if (!input || input.trim() === '') {
            return [];
        }
        
        const lines = input.trim().split(/\n+/);
        const result = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // 尝试匹配带释义的格式: word /phonetic/ pos. meaning
            // 或: word pos. meaning
            const match = trimmed.match(/^([a-zA-Z]+(?:-[a-zA-Z]+)*)\s*(?:\/([^\/]+)\/)?\s*(?:([a-z]+)\.\s*(.+))?$/);
            if (match) {
                const word = match[1].toLowerCase();
                const phonetic = match[2] || '';
                const pos = match[3] || '';
                const meaning = match[4] || '';
                
                result.push({
                    word,
                    phonetic,
                    pos,
                    meaning,
                    hasDetails: !!(phonetic || meaning)
                });
            } else {
                // 回退到纯单词模式
                const words = trimmed
                    .split(/[\s,;]+/)
                    .map(w => w.trim().toLowerCase())
                    .filter(w => w.length > 0 && /^[a-z]+(-[a-z]+)*$/.test(w));
                words.forEach(w => result.push({ word: w, hasDetails: false }));
            }
        }
        
        return result;
    },

    /**
     * 去除重复单词
     * @param {Array} wordObjects - 单词对象列表
     * @returns {Object} 去重后的结果 {uniqueWords, duplicateCount}
     */
    removeDuplicates(wordObjects) {
        const existingWords = [
            ...this.wordList.reviewWords,
            ...this.wordList.newWords
        ];
        
        const uniqueWords = [];
        let duplicateCount = 0;
        
        for (const item of wordObjects) {
            const word = typeof item === 'string' ? item : item.word;
            if (!existingWords.includes(word) && !uniqueWords.find(u => u.word === word)) {
                uniqueWords.push(item);
            } else {
                duplicateCount++;
            }
        }
        
        return { uniqueWords, duplicateCount };
    },

    /**
     * 批量导入单词
     * @param {string} input - 输入文本
     * @param {string} group - 分组 ('review' | 'new')
     * @returns {Object} 导入结果
     */
    batchImport(input, group) {
        if (this._isReadOnly) {
            return { success: false, message: '历史模式中不能添加单词' };
        }
        const wordObjects = this.parseWords(input);
        
        if (wordObjects.length === 0) {
            return { success: false, message: '未检测到有效单词' };
        }
        
        const { uniqueWords, duplicateCount } = this.removeDuplicates(wordObjects);
        
        if (uniqueWords.length === 0) {
            return { success: false, message: `所有${wordObjects.length}个单词均已存在` };
        }
        
        // 添加到指定分组
        for (const item of uniqueWords) {
            const word = typeof item === 'string' ? item : item.word;
            this.addWord(word, group);
            
            // 如果有释义信息，保存到 wordDetails
            if (item.hasDetails && item.meaning) {
                const fullTranslation = item.pos
                    ? `${item.pos}. ${item.meaning}`
                    : item.meaning;
                this.wordList.wordDetails[word] = {
                    word,
                    phonetic: item.phonetic || '',
                    translation: item.meaning,
                    fullTranslation,
                    pos: item.pos || '',
                    extra: ''
                };
            }
        }
        
        // 保存并更新界面
        DataStore.saveWordList(this.wordList);
        this.renderWordList();
        this.updateStats();
        
        let message = `成功导入${uniqueWords.length}个单词`;
        if (duplicateCount > 0) {
            message += `，已过滤${duplicateCount}个重复单词`;
        }
        
        return { success: true, message, addedCount: uniqueWords.length, duplicateCount };
    },

    /**
     * 添加单个单词到指定分组
     * @param {string} word - 单词
     * @param {string} group - 分组 ('review' | 'new')
     */
    addWord(word, group) {
        word = word.trim().toLowerCase();
        
        // 检查是否已存在
        if (this.wordList.reviewWords.includes(word) || this.wordList.newWords.includes(word)) {
            return false;
        }
        
        // 添加到分组
        if (group === 'review') {
            this.wordList.reviewWords.push(word);
        } else {
            this.wordList.newWords.push(word);
        }
        
        // 初始化单词详情
        this.wordList.wordDetails[word] = {
            translation: '',
            pos: '',
            status: '待复习',
            phonetic: '',
            fullTranslation: ''
        };
        
        return true;
    },

    /**
     * 添加带释义的单词到指定分组
     * @param {Object} wordData - 单词数据 {word, phonetic, translation, pos, fullTranslation, meanings}
     * @param {string} group - 分组 ('review' | 'new')
     * @returns {Object} 结果 {success, message}
     */
    addWordWithDetails(wordData, group) {
        if (this._isReadOnly) {
            return { success: false, message: '历史模式中不能添加单词' };
        }
        const word = wordData.word.trim().toLowerCase();
        
        // 检查是否已存在
        if (this.wordList.reviewWords.includes(word) || this.wordList.newWords.includes(word)) {
            return { success: false, message: '单词已存在' };
        }
        
        // 添加到分组
        if (group === 'review') {
            this.wordList.reviewWords.push(word);
        } else {
            this.wordList.newWords.push(word);
        }
        
        // 设置单词详情（包含词库检索获得的释义）
        this.wordList.wordDetails[word] = {
            translation: wordData.translation || '',
            pos: wordData.pos || '',
            status: '待复习',
            phonetic: wordData.phonetic || '',
            fullTranslation: wordData.fullTranslation || '',
            meanings: wordData.meanings || []
        };
        
        return { success: true, message: '添加成功' };
    },

    /**
     * 删除单词
     * @param {string} word - 单词
     */
    removeWord(word) {
        if (this._isReadOnly) return;
        // 从分组中移除
        this.wordList.reviewWords = this.wordList.reviewWords.filter(w => w !== word);
        this.wordList.newWords = this.wordList.newWords.filter(w => w !== word);
        
        // 移除详情
        delete this.wordList.wordDetails[word];
        
        // 保存并更新界面
        DataStore.saveWordList(this.wordList);
        this.renderWordList();
        this.updateStats();
    },

    /**
     * 更新单词释义/词性
     * @param {string} word - 单词
     * @param {Object} detail - 详情 {translation, pos}
     */
    updateWordDetail(word, detail) {
        if (this.wordList.wordDetails[word]) {
            this.wordList.wordDetails[word] = {
                ...this.wordList.wordDetails[word],
                ...detail
            };
            DataStore.saveWordList(this.wordList);
            this.renderWordList();
        }
    },

    /**
     * 设置单词状态标记
     * @param {string} word - 单词
     * @param {string} status - 状态
     */
    setWordStatus(word, status) {
        if (this.wordList.wordDetails[word]) {
            this.wordList.wordDetails[word].status = status;
            DataStore.saveWordList(this.wordList);
            this.renderWordList();
        }
    },

    /**
     * 获取当前活跃词单（历史模式返回只读视图，当日模式返回当日词单）
     * @returns {Object} 当前活跃词单数据
     */
    _getActiveWordList() {
        return this._isReadOnly && this._historyWordList
            ? this._historyWordList
            : this.wordList;
    },

    /**
     * 获取筛选后的单词列表
     * @returns {Array} 筛选后的单词列表
     */
    getFilteredWords() {
        const activeList = this._getActiveWordList();
        let words = [];
        
        // 按分组筛选
        if (this.currentGroup === 'review') {
            words = activeList.reviewWords;
        } else if (this.currentGroup === 'new') {
            words = activeList.newWords;
        } else {
            words = [...activeList.reviewWords, ...activeList.newWords];
        }
        
        // 按状态筛选
        if (this.currentStatus !== 'all') {
            words = words.filter(w => {
                const detail = activeList.wordDetails[w];
                return detail && detail.status === this.currentStatus;
            });
        }
        
        return words;
    },

    /**
     * 获取所有单词（用于生成文本）- 仅返回当日词单单词
     * @returns {Array} 所有单词列表
     */
    getAllWords() {
        return [...this.wordList.reviewWords, ...this.wordList.newWords];
    },

    /**
     * 获取单词统计（基于当前活跃词单）
     * @returns {Object} 统计信息
     */
    getWordCount() {
        return DataStore.getWordStats(this._getActiveWordList());
    },

    /**
     * 更新统计显示
     */
    updateStats() {
        const stats = this.getWordCount();
        document.getElementById('totalWordCount').textContent = stats.total;
        document.getElementById('reviewWordCount').textContent = stats.review;
        document.getElementById('newWordCount').textContent = stats.new;
        
        // 更新历史模式指示
        const modeLabel = document.getElementById('historyModeLabel');
        if (modeLabel) {
            if (this._isReadOnly && this._historyDate) {
                // 缩短日期格式：2026-06-24 -> 06-24
                const shortDate = this._historyDate.slice(5);
                modeLabel.textContent = `【${shortDate} 学习记录】`;
                modeLabel.style.display = 'inline';
            } else {
                modeLabel.style.display = 'none';
            }
        }
    },

    /**
     * 渲染单词列表
     */
    cleanMeaningText(text) {
        if (!text) return text;
        
        // 0. 先全局去除连续重复的词性前缀（如 "n. n. 数据库" -> "n. 数据库"）
        let globalCleaned = text;
        const posTags = ['n.', 'v.', 'adj.', 'adv.'];
        for (const tag of posTags) {
            const pattern = new RegExp(`(${tag.replace('.', '\\.')})\\s*\\1+`, 'g');
            globalCleaned = globalCleaned.replace(pattern, '$1');
        }
        
        // 1. 按分号分割成独立片段
        const segments = globalCleaned.split(';').map(s => s.trim()).filter(s => s);
        
        // 2. 清洗每个片段
        const cleanedSegments = segments.map(seg => {
            let cleaned = seg;
            
            // 去除混入词性前缀中的多余内容
            for (const tag of posTags) {
                const pattern = new RegExp(`(?:${tag.replace('.', '\\.')}\\s*)+`, 'g');
                cleaned = cleaned.replace(pattern, tag + ' ');
            }
            
            // 确保词性前缀后只有一个空格
            cleaned = cleaned.replace(/([nvadj]+\.)\s+/g, '$1 ');
            
            return cleaned.trim();
        });
        
        // 3. 跨片段去重：基于核心语义去重
        const seen = new Map();
        
        for (const seg of cleanedSegments) {
            const posMatch = seg.match(/^([nvadj]+\.)\s*/);
            const pos = posMatch ? posMatch[1] : '';
            const content = seg.replace(/^[nvadj]+\.\s*/, '').trim();
            
            // 提取核心词（去除括号内容）
            const coreContent = content.replace(/[\(（][^\)）]*[\)）]/g, '').trim();
            const coreMatch = coreContent.match(/^([a-zA-Z]+|[一-龥]+)/);
            const core = coreMatch ? coreMatch[1] : coreContent;
            
            // 使用 词性+核心词 作为去重键
            const key = pos + core;
            const score = content.replace(/[\s]/g, '').length;
            
            if (!seen.has(key) || seen.get(key).score < score) {
                seen.set(key, { full: seg, score });
            }
        }
        
        // 4. 按词性排序输出
        const posOrder = { 'n.': 0, 'v.': 1, 'adj.': 2, 'adv.': 3 };
        const result = Array.from(seen.values())
            .sort((a, b) => {
                const posA = a.full.match(/^([nvadj]+\.)/);
                const posB = b.full.match(/^([nvadj]+\.)/);
                const orderA = posOrder[posA ? posA[1] : ''] !== undefined ? posOrder[posA[1]] : 99;
                const orderB = posOrder[posB ? posB[1] : ''] !== undefined ? posOrder[posB[1]] : 99;
                return orderA - orderB;
            })
            .map(item => item.full);
        
        return result.join('; ');
    },

    renderWordList() {
        const container = document.getElementById('wordList');
        const words = this.getFilteredWords();
        const activeList = this._getActiveWordList();
        
        if (words.length === 0) {
            container.innerHTML = '<div class="word-empty">请导入单词</div>';
            return;
        }
        
        const html = words.map(word => {
            const detail = activeList.wordDetails[word] || {};
            const statusClass = this.getStatusClass(detail.status);
            const cleanedTranslation = this.cleanMeaningText(detail.translation || '');
            
            // 如果 cleanedTranslation 已以 detail.pos 开头，不再重复添加
            const displayTranslation = detail.pos && cleanedTranslation
                ? (cleanedTranslation.startsWith(detail.pos) ? cleanedTranslation : `${detail.pos} ${cleanedTranslation}`)
                : (cleanedTranslation || '');
            
            // 只读模式不显示操作按钮
            const actionsHtml = this._isReadOnly ? '' : `
                <div class="word-item-actions">
                    <button class="status-btn" data-status="已掌握" title="标记已掌握">✓</button>
                    <button class="status-btn" data-status="难点词" title="标记难点词">!</button>
                    <button class="delete-btn" title="删除">×</button>
                </div>
            `;
            
            return `
                <div class="word-item ${this._isReadOnly ? 'readonly' : ''}" data-word="${word}">
                    <div class="word-item-content">
                        <span class="word-item-word">${word}</span>
                        <span class="word-item-info">${displayTranslation}</span>
                    </div>
                    <span class="word-item-status ${statusClass}">${detail.status || '待复习'}</span>
                    ${actionsHtml}
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    },

    /**
     * 获取状态样式类名
     * @param {string} status - 状态
     * @returns {string} 类名
     */
    getStatusClass(status) {
        const map = {
            '已掌握': 'status-mastered',
            '待复习': 'status-review',
            '难点词': 'status-difficult'
        };
        return map[status] || 'status-review';
    },

    /**
     * 重置分组标签到"全部"状态
     */
    renderGroupTabs() {
        this.currentGroup = 'all';
        this.currentStatus = 'all';
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const allTab = document.querySelector('.tab-btn[data-group="all"]');
        if (allTab) allTab.classList.add('active');
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        const allFilter = document.querySelector('.filter-btn[data-status="all"]');
        if (allFilter) allFilter.classList.add('active');
    },

    /**
     * 清空词单
     */
    clearAll() {
        DataStore.clearTodayWords();
        this.wordList = DataStore.loadWordList();
        this.renderWordList();
        this.updateStats();
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 分组切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentGroup = btn.dataset.group;
                this.renderWordList();
            });
        });
        
        // 状态筛选
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentStatus = btn.dataset.status;
                this.renderWordList();
            });
        });
        
        // 单词列表点击事件
        document.getElementById('wordList').addEventListener('click', (e) => {
            const wordItem = e.target.closest('.word-item');
            if (!wordItem) return;
            
            const word = wordItem.dataset.word;
            
            // 状态按钮
            if (e.target.classList.contains('status-btn')) {
                this.setWordStatus(word, e.target.dataset.status);
                return;
            }
            
            // 删除按钮
            if (e.target.classList.contains('delete-btn')) {
                this.removeWord(word);
                return;
            }
        });
    }
};

// 导出模块
window.WordManager = WordManager;
