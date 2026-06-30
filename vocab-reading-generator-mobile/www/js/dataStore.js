/**
 * 数据存储模块 - dataStore.js
 * 负责本地数据存储、历史记录、词单数据管理
 */

const DataStore = {
    // 存储键名（基础键，实际存储时会加上用户ID前缀）
    KEYS: {
        WORDS: 'vocab_words',
        HISTORY: 'vocab_history',
        CURRENT_TEXT: 'vocab_current_text'
    },

    /**
     * 获取带用户ID前缀的存储键
     * @param {string} key - 基础键名
     * @returns {string} 带前缀的键名
     */
    _getKey(key) {
        const userId = UserManager.getCurrentUserId();
        return userId ? `${key}_${userId}` : key;
    },

    /**
     * 获取今日日期字符串
     * @returns {string} 日期字符串 YYYY-MM-DD
     */
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * 加载当日词单数据
     * @returns {Object} 词单数据对象
     */
    loadWordList() {
        try {
            const stored = localStorage.getItem(this._getKey(this.KEYS.WORDS));
            if (stored) {
                const data = JSON.parse(stored);
                // 如果是今天的数据，直接返回
                if (data.date === this.getTodayDate()) {
                    return data;
                }
                // 如果是历史数据，保存到历史记录并返回空词单
                if (data.reviewWords.length > 0 || data.newWords.length > 0) {
                    this.addToHistory(data);
                }
                return this.createEmptyWordList();
            }
        } catch (e) {
            console.error('加载词单失败:', e);
        }
        return this.createEmptyWordList();
    },

    /**
     * 创建空词单数据结构
     * @returns {Object} 空词单对象
     */
    createEmptyWordList() {
        return {
            date: this.getTodayDate(),
            reviewWords: [],
            newWords: [],
            wordDetails: {}
        };
    },

    /**
     * 保存词单数据
     * 【数据隔离】只读模式下禁止写入，防止历史数据污染当日存储
     * @param {Object} data - 词单数据对象
     */
    saveWordList(data) {
        try {
            // 【读写分离】只读模式下拒绝写入当日词单存储
            if (window.WordManager && window.WordManager._isReadOnly) {
                console.warn('写入拦截：当前为历史只读模式，禁止写入当日词单存储');
                return;
            }
            data.date = this.getTodayDate();
            localStorage.setItem(this._getKey(this.KEYS.WORDS), JSON.stringify(data));
        } catch (e) {
            console.error('保存词单失败:', e);
        }
    },

    /**
     * 加载历史记录列表
     * @returns {Object} 历史记录对象
     */
    loadHistory() {
        try {
            const stored = localStorage.getItem(this._getKey(this.KEYS.HISTORY));
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('加载历史记录失败:', e);
        }
        return { records: [] };
    },

    /**
     * 保存历史记录
     * @param {Object} data - 历史记录对象
     */
    saveHistory(data) {
        try {
            localStorage.setItem(this._getKey(this.KEYS.HISTORY), JSON.stringify(data));
        } catch (e) {
            console.error('保存历史记录失败:', e);
        }
    },

    /**
     * 添加当前词单到历史记录
     * @param {Object} wordList - 词单数据
     */
    addToHistory(wordList) {
        const history = this.loadHistory();
        
        // 查找是否已有该日期的记录
        const existingIndex = history.records.findIndex(r => r.date === wordList.date);
        
        if (existingIndex >= 0) {
            // 更新现有记录（保留已有的 sentences）
            const existing = history.records[existingIndex];
            history.records[existingIndex] = {
                ...existing,
                totalWords: wordList.reviewWords.length + wordList.newWords.length,
                reviewCount: wordList.reviewWords.length,
                newCount: wordList.newWords.length,
                wordDetails: wordList.wordDetails,
                reviewWords: wordList.reviewWords,
                newWords: wordList.newWords,
                sentences: existing.sentences || []
            };
        } else {
            // 添加新记录
            history.records.unshift({
                date: wordList.date,
                totalWords: wordList.reviewWords.length + wordList.newWords.length,
                reviewCount: wordList.reviewWords.length,
                newCount: wordList.newWords.length,
                wordDetails: wordList.wordDetails,
                reviewWords: wordList.reviewWords,
                newWords: wordList.newWords,
                versions: [],
                sentences: []
            });
        }
        
        // 按日期倒序排列
        history.records.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 限制历史记录数量（最多30天）
        if (history.records.length > 30) {
            history.records = history.records.slice(0, 30);
        }
        
        this.saveHistory(history);
    },

    /**
     * 保存句子到历史记录
     * @param {string} date - 日期
     * @param {Object} sentenceData - 句子数据 {text, mode, timestamp}
     */
    addSentenceToHistory(date, sentenceData) {
        const history = this.loadHistory();
        let record = history.records.find(r => r.date === date);
        
        if (!record) {
            // 创建空记录
            record = {
                date: date,
                totalWords: 0,
                reviewCount: 0,
                newCount: 0,
                wordDetails: {},
                reviewWords: [],
                newWords: [],
                versions: [],
                sentences: []
            };
            history.records.unshift(record);
        }
        
        if (!record.sentences) {
            record.sentences = [];
        }
        
        // 检查是否已存在相同文本的句子
        const exists = record.sentences.some(s => s.text === sentenceData.text);
        if (!exists) {
            record.sentences.push({
                text: sentenceData.text,
                mode: sentenceData.mode || 'english',
                timestamp: sentenceData.timestamp || new Date().toISOString()
            });
            this.saveHistory(history);
        }
    },

    /**
     * 归档今日数据（关闭前调用）
     * 将当前词单和句子保存到历史记录
     * 【数据隔离】仅归档当日日期的数据，拒绝跨日期污染
     * 【星标控制】仅归档已收藏的文本，未收藏的文本视为临时内容
     */
    archiveToday() {
        const wordList = this.loadWordList();
        const currentText = this.loadCurrentText();
        
        // 【数据隔离】安全检查：仅归档当日数据，防止历史数据混入
        if (wordList.date !== this.getTodayDate()) {
            console.warn('归档中止：词单日期非当日，疑似数据污染', wordList.date);
            return;
        }
        
        // 如果有单词，保存词单
        if (wordList.reviewWords.length > 0 || wordList.newWords.length > 0) {
            this.addToHistory(wordList);
        }
        
        // 【星标控制】仅归档已收藏的文本
        if (currentText && currentText.text && currentText.starred) {
            this.addSentenceToHistory(wordList.date, {
                text: currentText.text,
                mode: currentText.mode || 'english',
                timestamp: new Date().toISOString()
            });
            console.log('已归档收藏的文本到历史记录');
        } else if (currentText && currentText.text && !currentText.starred) {
            console.log('文本未收藏，跳过归档');
        }
    },

    /**
     * 添加文本版本到历史记录
     * @param {string} date - 日期
     * @param {Object} versionData - 版本数据
     */
    addVersionToHistory(date, versionData) {
        const history = this.loadHistory();
        const record = history.records.find(r => r.date === date);
        
        if (record) {
            record.versions.push(versionData);
            this.saveHistory(history);
        }
    },

    /**
     * 按日期获取历史记录
     * @param {string} date - 日期字符串
     * @returns {Object|null} 历史记录对象
     */
    getHistoryByDate(date) {
        const history = this.loadHistory();
        return history.records.find(r => r.date === date);
    },

    /**
     * 加载当前文本
     * @returns {Object} 当前文本对象
     */
    loadCurrentText() {
        try {
            const stored = localStorage.getItem(this._getKey(this.KEYS.CURRENT_TEXT));
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('加载当前文本失败:', e);
        }
        return {
            text: '',
            rareWords: [],
            version: 0,
            date: '',
            mode: ''
        };
    },

    /**
     * 保存当前文本
     * @param {Object} textData - 文本数据对象
     */
    saveCurrentText(textData) {
        try {
            localStorage.setItem(this._getKey(this.KEYS.CURRENT_TEXT), JSON.stringify(textData));
        } catch (e) {
            console.error('保存当前文本失败:', e);
        }
    },

    /**
     * 清空当日词单
     */
    clearTodayWords() {
        const emptyList = this.createEmptyWordList();
        this.saveWordList(emptyList);
    },

    /**
     * 获取单词统计信息
     * @param {Object} wordList - 词单数据
     * @returns {Object} 统计信息
     */
    getWordStats(wordList) {
        return {
            total: wordList.reviewWords.length + wordList.newWords.length,
            review: wordList.reviewWords.length,
            new: wordList.newWords.length
        };
    },

    /**
     * 更新单词状态
     * @param {string} word - 单词
     * @param {string} status - 状态 ('已掌握' | '待复习' | '难点词')
     */
    updateWordStatus(word, status) {
        const wordList = this.loadWordList();
        if (wordList.wordDetails[word]) {
            wordList.wordDetails[word].status = status;
            this.saveWordList(wordList);
        }
    },

    /**
     * 更新单词详情
     * @param {string} word - 单词
     * @param {Object} details - 详情对象
     */
    updateWordDetails(word, details) {
        const wordList = this.loadWordList();
        if (wordList.wordDetails[word]) {
            wordList.wordDetails[word] = { ...wordList.wordDetails[word], ...details };
            this.saveWordList(wordList);
        }
    },

    /**
     * 初始化数据存储
     */
    init() {
        // 确保今日词单存在
        const wordList = this.loadWordList();
        this.saveWordList(wordList);
        
        // 确保历史记录存在
        const history = this.loadHistory();
        this.saveHistory(history);
    },

    // === 自建词本系统 ===
    loadWordBooks() {
        try {
            const data = localStorage.getItem(this._getKey('vocab_wordbooks'));
            return data ? JSON.parse(data) : { books: [] };
        } catch (e) {
            console.warn('加载词本失败:', e);
            return { books: [] };
        }
    },
    saveWordBooks(data) {
        try {
            localStorage.setItem(this._getKey('vocab_wordbooks'), JSON.stringify(data));
        } catch (e) {
            console.error('保存词本失败:', e);
        }
    },
    createWordBook(name) {
        const data = this.loadWordBooks();
        const id = 'wb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        data.books.push({ id, name, createdAt: new Date().toISOString(), words: [] });
        this.saveWordBooks(data);
        return id;
    },
    deleteWordBook(bookId) {
        const data = this.loadWordBooks();
        data.books = data.books.filter(b => b.id !== bookId);
        this.saveWordBooks(data);
    },
    renameWordBook(bookId, newName) {
        const data = this.loadWordBooks();
        const book = data.books.find(b => b.id === bookId);
        if (book) { book.name = newName; this.saveWordBooks(data); }
    },
    addWordToBook(bookId, wordData) {
        const data = this.loadWordBooks();
        const book = data.books.find(b => b.id === bookId);
        if (!book) return;
        const existing = book.words.find(w => w.word.toLowerCase() === wordData.word.toLowerCase());
        if (existing) {
            existing.queryCount = (existing.queryCount || 0) + 1;
            existing.lastQueriedAt = new Date().toISOString();
        } else {
            book.words.push({
                word: wordData.word,
                phonetic: wordData.phonetic || '',
                meanings: wordData.meanings || '',
                addedAt: new Date().toISOString(),
                queryCount: 1,
                lastQueriedAt: new Date().toISOString()
            });
        }
        this.saveWordBooks(data);
    },
    incrementQueryCount(bookId, word) {
        const data = this.loadWordBooks();
        const book = data.books.find(b => b.id === bookId);
        if (!book) return;
        const w = book.words.find(w => w.word.toLowerCase() === word.toLowerCase());
        if (w) {
            w.queryCount = (w.queryCount || 1) + 1;
            w.lastQueriedAt = new Date().toISOString();
            this.saveWordBooks(data);
        }
    },
    getWordBook(bookId) {
        const data = this.loadWordBooks();
        return data.books.find(b => b.id === bookId) || null;
    },
    getWordBooks() {
        return this.loadWordBooks().books.map(b => ({
            id: b.id, name: b.name, wordCount: b.words.length, createdAt: b.createdAt
        }));
    },

    // === 查询历史 ===
    loadQueryHistory() {
        try {
            const data = localStorage.getItem(this._getKey('vocab_query_history'));
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },
    saveQueryHistory(history) {
        try { localStorage.setItem(this._getKey('vocab_query_history'), JSON.stringify(history)); } catch (e) {}
    },
    addQueryHistory(word) {
        const history = this.loadQueryHistory();
        // 去重
        const existing = history.findIndex(h => h.word.toLowerCase() === word.toLowerCase());
        if (existing !== -1) history.splice(existing, 1);
        history.unshift({ word, timestamp: new Date().toISOString() });
        // 从配置读取上限（默认 200）
        const limit = typeof ConfigManager !== 'undefined'
            ? ConfigManager.getQueryHistoryLimit() : 200;
        if (history.length > limit) history.length = limit;
        this.saveQueryHistory(history);
        return history;
    }
};

// 导出模块
window.DataStore = DataStore;