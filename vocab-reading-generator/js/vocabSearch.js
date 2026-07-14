/**
 * 词库检索模块 - vocabSearch.js
 * 负责词库加载、自动检索、下拉建议列表和词义选择面板
 * 支持本地多词库 + 在线API补充释义
 */

const VocabSearch = {
    // 词库数据（包含来源信息）
    vocabData: [],
    
    // 当前选中的单词
    selectedWord: null,
    
    // 选中的释义
    selectedMeanings: [],
    
    // 词库是否加载成功
    loaded: false,
    
    // 加载错误信息
    loadError: null,
    
    // API数据
    apiData: null,
    apiLoading: false,
    apiError: null,
    
    // 词源筛选状态
    _sourceFilter: 'all',   // 'all', 'kaoyan', 'cet4', 'cet6'
    _availableSources: [],  // [{type, name}] 当前单词实际拥有的词源
    _rawAllMeanings: [],    // 未合并的所有释义（含来源信息）
    
    // 词库文件路径（与index.html同级的vocab-lib文件夹）
    vocabPaths: [
        { path: './vocab-lib/5-考研-顺序.json', type: 'kaoyan', name: '考研' },
        { path: './vocab-lib/3-CET4-顺序.json', type: 'cet4', name: '四级' },
        { path: './vocab-lib/4-CET6-顺序.json', type: 'cet6', name: '六级' }
    ],

    /**
     * 初始化词库检索
     */
    async init() {
        console.log('[VocabSearch] 开始初始化词库检索模块');
        await this.loadVocabData();
        this.bindEvents();
        
        if (this.loaded) {
            console.log(`[VocabSearch] 词库检索初始化完成，共加载 ${this.vocabData.length} 个单词`);
        } else {
            console.error(`[VocabSearch] 词库加载失败: ${this.loadError || '未知错误'}`);
        }
    },

    /**
     * 加载词库数据（支持多词库合并）
     */
    async loadVocabData() {
        this.loaded = false;
        this.loadError = null;
        this.vocabData = [];
        
        let loadedCount = 0;
        let failedCount = 0;
        
        for (const vocabInfo of this.vocabPaths) {
            try {
                const fullUrl = new URL(vocabInfo.path, window.location.href).href;
                console.log(`[VocabSearch] 开始加载词库: ${vocabInfo.name}`);
                console.log(`[VocabSearch] 请求URL: ${fullUrl}`);
                
                const response = await fetch(vocabInfo.path);
                
                if (!response.ok) {
                    throw new Error(`HTTP错误: ${response.status} (${response.statusText})`);
                }
                
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    // 为每个单词添加来源信息
                    const wordsWithSource = data.map(word => ({
                        ...word,
                        sourceType: vocabInfo.type,
                        sourceName: vocabInfo.name
                    }));
                    
                    this.vocabData = this.vocabData.concat(wordsWithSource);
                    loadedCount++;
                    console.log(`[VocabSearch] 成功加载 ${vocabInfo.name} 词库，包含 ${data.length} 个单词`);
                } else {
                    console.warn(`[VocabSearch] ${vocabInfo.name} 词库格式不正确，期望数组格式`);
                    failedCount++;
                }
            } catch (e) {
                failedCount++;
                console.error(`[VocabSearch] 加载 ${vocabInfo.name} 词库失败: ${e.message}`);
            }
        }
        
        if (this.vocabData.length > 0) {
            this.loaded = true;
            console.log(`[VocabSearch] 词库加载完成，成功加载 ${loadedCount} 个词库，失败 ${failedCount} 个，总单词数: ${this.vocabData.length}`);
            
            // 打印前5个单词用于验证
            if (this.vocabData.length > 0) {
                const sampleWords = this.vocabData.slice(0, 5).map(item => item.word || item.headWord);
                console.log(`[VocabSearch] 词库示例单词: ${sampleWords.join(', ')}`);
            }
        } else {
            this.loadError = `未能加载任何词库文件，成功加载 ${loadedCount} 个，失败 ${failedCount} 个`;
            console.error(`[VocabSearch] ${this.loadError}`);
        }
    },

    /**
     * 在线词典查询（有道词典API）
     * @param {string} word - 单词
     */
    async fetchApiData(word) {
        if (!word) return;

        this.apiLoading = true;
        this.apiError = null;
        this.apiData = null;
        this.updateMeaningPanelWithApi();

        try {
            const url = `http://localhost:3000/api/youdao?q=${encodeURIComponent(word.toLowerCase())}`;
            console.log(`[VocabSearch] 正在查询有道词典(代理): ${word}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data && data.data && data.data.entries && data.data.entries.length > 0) {
                const entries = [];
                const queryWord = data.data.query || word;
                for (const entry of data.data.entries) {
                    entries.push({
                        entry: entry.entry || queryWord,
                        explain: entry.explain || ''
                    });
                }
                if (entries.length > 0) {
                    this.apiData = {
                        word: queryWord,
                        entries: entries
                    };
                    this.apiError = null;
                    console.log(`[VocabSearch] 有道词典查询成功: ${word}, 找到 ${entries.length} 个条目`);
                } else {
                    this.apiData = null;
                    this.apiError = '未找到释义';
                    console.log(`[VocabSearch] 有道词典查询成功但无释义: ${word}`);
                }
            } else {
                this.apiData = null;
                this.apiError = '未找到释义';
                console.log(`[VocabSearch] 有道词典查询成功但无释义: ${word}`);
            }
        } catch (e) {
            this.apiData = null;
            this.apiError = `查询失败: ${e.message}`;
            console.error(`[VocabSearch] 有道词典查询失败: ${word}, 错误: ${e.message}`);
        } finally {
            this.apiLoading = false;
            this.updateMeaningPanelWithApi();
        }
    },

    /**
     * 解析有道词典 jsonapi 返回的数据
     * @param {Object} data - API返回的原始数据
     * @returns {Object|null} 格式化后的数据 {word, entries}
     */
    parseYoudaoJsonApi(data) {
        if (!data) return null;

        const entries = [];
        const queryWord = data.ec?.word?.[0]?.returnphrase || data.word || '';

        // 1. 从 ec (英汉) 数据中提取释义
        if (data.ec && data.ec.word) {
            for (const w of data.ec.word) {
                if (w.trs) {
                    for (const tr of w.trs) {
                        const pos = tr.pos || tr.tr?.[0]?.pos || '';
                        const explains = [];
                        if (tr.tr) {
                            for (const t of tr.tr) {
                                if (t.l && t.l.i && t.l.i[0]) {
                                    explains.push(t.l.i[0]);
                                }
                            }
                        }
                        if (explains.length > 0) {
                            entries.push({
                                entry: w.returnphrase || queryWord,
                                explain: `${pos ? pos + ' ' : ''}${explains.join('；')}`
                            });
                        }
                    }
                }
            }
        }

        // 2. 从 ce (汉英) 或 simple 数据中提取
        if (entries.length === 0 && data.simple && data.simple.query) {
            const simpleWord = data.simple.query;
            if (data.simple.word) {
                for (const w of data.simple.word) {
                    if (w.trs) {
                        for (const tr of w.trs) {
                            const pos = tr.pos || '';
                            const explains = [];
                            if (tr.tr) {
                                for (const t of tr.tr) {
                                    if (t.l && t.l.i && t.l.i[0]) {
                                        explains.push(t.l.i[0]);
                                    }
                                }
                            }
                            if (explains.length > 0) {
                                entries.push({
                                    entry: simpleWord,
                                    explain: `${pos ? pos + ' ' : ''}${explains.join('；')}`
                                });
                            }
                        }
                    }
                }
            }
        }

        // 3. 从 web_trans (网络释义) 中提取补充
        if (entries.length === 0 && data.web_trans && data.web_trans.web_translation) {
            const webTrans = data.web_trans.web_translation;
            for (const wt of webTrans) {
                if (wt.trans) {
                    entries.push({
                        entry: wt.key || queryWord,
                        explain: wt.trans
                    });
                }
            }
        }

        if (entries.length === 0) return null;

        return {
            word: queryWord,
            entries: entries
        };
    },

    /**
     * 解析有道词典API返回的数据
     * @param {Object} data - API返回的单词数据
     * @returns {Object|null} 格式化后的单词数据
     */
    parseApiData(data) {
        // 有道词典返回格式：{ result, data: { entries, query, language } }
        if (data.data && data.data.entries && data.data.entries.length > 0) {
            const entries = data.data.entries;
            const queryWord = data.data.query || '';
            
            return {
                word: queryWord,
                entries: entries,
                meanings: []
            };
        }
        
        return null;
    },

    /**
     * 解析代理接口返回的释义格式
     * @param {string} explain - 完整的释义字符串（如 "n. 辩论；辩论会；v. 辩论，争论"）
     * @returns {Array} 按词性分组的释义列表
     */
    parseProxyMeanings(explain) {
        if (!explain) return [];
        
        const meanings = [];
        const lines = explain.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // 按行解析：每行格式为 "词性. 释义1；释义2；释义3"
            const match = trimmed.match(/^([a-z]+\.)(.*)$/i);
            if (match) {
                const pos = match[1].trim();
                const defs = match[2].split('；').map(d => d.trim()).filter(d => d);
                if (defs.length > 0) {
                    meanings.push({
                        partOfSpeech: pos,
                        definitions: defs.map(d => ({
                            definition: d,
                            example: ''
                        }))
                    });
                }
            }
        }
        
        return meanings;
    },

    /**
     * 解析旧有道词典suggest接口的释义格式（备用）
     * @param {Object} item - 有道词典数据项
     * @returns {Array} 释义列表
     */
    parseYoudaoMeanings(item) {
        const meanings = [];
        
        if (item.pos && item.pos.length > 0) {
            for (const posItem of item.pos) {
                const pos = posItem.pos || '';
                const trans = posItem.trans || [];
                
                if (trans.length > 0) {
                    meanings.push({
                        partOfSpeech: pos,
                        definitions: trans.map(t => ({
                            definition: t,
                            example: ''
                        }))
                    });
                }
            }
        }
        
        return meanings;
    },

    /**
     * 在线查询单词释义（通过有道词典代理）
     * @param {string} word - 要查询的单词
     * @returns {Promise<Object|null>} 返回单词数据，失败返回null
     */
    async lookupWordOnline(word) {
        if (!word || word.trim() === '') {
            return null;
        }

        const url = `http://localhost:3000/api/youdao?q=${encodeURIComponent(word.trim())}`;

        try {
            console.log(`[VocabSearch] lookupWordOnline: ${word}`);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`[VocabSearch] lookupWordOnline 失败，状态码: ${response.status}`);
                return null;
            }

            const data = await response.json();

            if (!data || !data.data || !data.data.entries || data.data.entries.length === 0) {
                console.warn(`[VocabSearch] lookupWordOnline 未找到释义: ${word}`);
                return null;
            }

            const entries = [];
            const queryWord = data.data.query || word;

            for (const entry of data.data.entries) {
                const explain = entry.explain || '';
                const parsed = this.parseProxyMeanings(explain);
                if (parsed.length > 0) {
                    for (const p of parsed) {
                        entries.push(p);
                    }
                } else if (explain) {
                    entries.push({
                        partOfSpeech: '',
                        definitions: [{ definition: explain, example: '' }]
                    });
                }
            }

            if (entries.length === 0) {
                return null;
            }

            console.log(`[VocabSearch] lookupWordOnline 成功: ${word}, ${entries.length} 条释义`);

            return {
                word: queryWord,
                phonetic: '',
                entries: entries
            };

        } catch (error) {
            console.error(`[VocabSearch] lookupWordOnline 发生错误: ${error.message}`);
            return null;
        }
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        const input = document.getElementById('singleInput');
        const suggestList = document.getElementById('wordSuggestList');
        
        // 输入事件
        input.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });
        
        // 获取焦点事件
        input.addEventListener('focus', () => {
            if (input.value.trim().length > 0) {
                this.showSuggestList();
            }
        });
        
        // 点击空白区域关闭下拉列表和词义面板
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.single-input-wrapper') && !e.target.closest('.word-meaning-panel')) {
                this.hideSuggestList();
            }
        });
        
        // 键盘导航
        input.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
    },

    /**
     * 处理输入
     * @param {string} value - 输入值
     */
    handleInput(value) {
        const trimmed = this.cleanInput(value);
        
        console.log(`[VocabSearch] 用户输入: "${value}", 清洗后: "${trimmed}"`);
        
        if (trimmed.length === 0) {
            this.hideSuggestList();
            this.hideMeaningModal();
            this.selectedWord = null;
            this.apiData = null;
            this.updateAddButton();
            return;
        }
        
        if (!this.loaded) {
            this.renderSuggestList([]);
            this.showSuggestList();
            return;
        }
        
        const matches = this.searchWords(trimmed);
        console.log(`[VocabSearch] 搜索 "${trimmed}" 找到 ${matches.length} 个匹配结果`);
        
        this.renderSuggestList(matches);
        this.showSuggestList();
    },

    /**
     * 清洗输入字符串
     * @param {string} input - 原始输入
     * @returns {string} 清洗后的字符串
     */
    cleanInput(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        
        let cleaned = input.trim();
        cleaned = cleaned.replace(/[^a-zA-Z-'’]/g, '');
        cleaned = cleaned.toLowerCase();
        
        return cleaned;
    },

    /**
     * 搜索匹配的单词（支持多词库合并）
     * @param {string} query - 搜索词（已清洗）
     * @returns {Array} 匹配结果
     */
    searchWords(query) {
        if (!query || query.length === 0) {
            return [];
        }
        
        const results = [];
        const maxResults = 10;
        const seenWords = new Map(); // 存储单词及其所有词库数据
        
        for (const wordData of this.vocabData) {
            if (!wordData) continue;
            
            const wordKey = wordData.word || wordData.headWord;
            if (!wordKey) continue;
            
            const word = wordKey.toLowerCase();
            const wordOriginal = wordKey;
            
            let priority = 99;
            
            // 优先级1：精确匹配
            if (word === query) {
                priority = 0;
            }
            // 优先级2：前缀匹配
            else if (word.startsWith(query)) {
                priority = 1;
            }
            // 优先级3：包含匹配
            else if (query.length >= 2 && word.includes(query)) {
                priority = 2;
            }
            
            if (priority < 99) {
                if (!seenWords.has(word)) {
                    seenWords.set(word, {
                        word: wordOriginal,
                        phonetic: this.getPhonetic(wordData),
                        data: [wordData],
                        priority: priority
                    });
                } else {
                    // 合并同一单词的不同词库数据
                    const existing = seenWords.get(word);
                    existing.data.push(wordData);
                    // 保留最早找到的音标（通常来自第一个匹配的词库）
                    if (!existing.phonetic) {
                        existing.phonetic = this.getPhonetic(wordData);
                    }
                }
            }
        }
        
        // 转换为数组并排序
        const resultsArray = Array.from(seenWords.values());
        resultsArray.sort((a, b) => a.priority - b.priority);
        
        console.log(`[VocabSearch] 搜索完成，返回 ${resultsArray.length} 个结果（已合并多词库）`);
        
        return resultsArray.slice(0, maxResults);
    },

    /**
     * 获取音标（适配不同词库格式）
     * @param {Object} wordData - 单词数据
     * @returns {string} 音标
     */
    getPhonetic(wordData) {
        if (wordData.phonetic) {
            return wordData.phonetic;
        }
        
        const content = wordData.content?.word?.content;
        return content?.phone || content?.usphone || content?.ukphone || '';
    },

    /**
     * 渲染下拉建议列表
     * @param {Array} matches - 匹配结果
     */
    renderSuggestList(matches) {
        const container = document.getElementById('wordSuggestList');
        
        if (!this.loaded) {
            container.innerHTML = `
                <div class="suggest-empty suggest-error">
                    <div class="error-icon">⚠</div>
                    <div class="error-title">词库加载失败</div>
                    <div class="error-message">${this.loadError || '无法加载词库文件'}</div>
                </div>
            `;
            return;
        }
        
        if (matches.length === 0) {
            container.innerHTML = '<div class="suggest-empty">未找到相关单词</div>';
            return;
        }
        
        const html = matches.map((item, index) => `
            <div class="suggest-item" data-index="${index}" data-word="${item.word}">
                <span class="suggest-word">${item.word}</span>
                <span class="suggest-phonetic">${item.phonetic}</span>
            </div>
        `).join('');
        
        container.innerHTML = html;
        
        container.querySelectorAll('.suggest-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectWord(matches[index]);
            });
        });
    },

    /**
     * 显示下拉建议列表
     */
    showSuggestList() {
        document.getElementById('wordSuggestList').style.display = 'block';
    },

    /**
     * 隐藏下拉建议列表
     */
    hideSuggestList() {
        document.getElementById('wordSuggestList').style.display = 'none';
    },

    /**
     * 选择单词
     * @param {Object} match - 匹配的单词数据
     */
    selectWord(match) {
        this.selectedWord = match;
        
        document.getElementById('singleInput').value = match.word;
        
        this.hideSuggestList();
        
        this.showMeaningModal(match);
        
        // 调用API获取补充释义
        this.fetchApiData(match.word);
    },

    /**
     * 显示释义弹窗
     * @param {Object} match - 单词数据
     */
    showMeaningModal(match) {
        const overlay = document.getElementById('meaningModalOverlay');
        const modal = document.getElementById('meaningModal');
        const body = modal.querySelector('.modal-body');
        
        document.getElementById('modalWord').textContent = match.word;
        document.getElementById('modalPhonetic').textContent = match.phonetic;
        
        // 解析所有来源的原始释义，保留来源信息
        this._rawAllMeanings = this.parseMeaningsFromMultipleSources(match.data);
        
        // 提取当前单词实际拥有的词源
        this._availableSources = this._extractSources(match.data);
        
        this._sourceFilter = 'all';
        
        // 渲染筛选按钮和释义列表
        this.renderSourceFilters();
        this.renderMeaningList();
        
        this.apiData = null;
        this.apiLoading = true;
        this.updateMeaningPanelWithApi();
        
        overlay.style.display = 'flex';
        requestAnimationFrame(() => { body.scrollTop = 0; });
        this.updateAddButton();
        this.bindModalCloseEvents();
    },

    /**
     * 提取单词实际拥有的词源列表
     * @param {Array} dataArray - 单词的多个词库数据
     * @returns {Array} 词源列表 [{type, name}]
     */
    _extractSources(dataArray) {
        const seen = new Set();
        const sources = [];
        for (const item of dataArray) {
            const type = item.sourceType || '';
            const name = item.sourceName || '';
            if (type && !seen.has(type)) {
                seen.add(type);
                sources.push({ type, name });
            }
        }
        const priority = { kaoyan: 1, cet6: 2, cet4: 3 };
        sources.sort((a, b) => (priority[a.type] || 99) - (priority[b.type] || 99));
        return sources;
    },

    /**
     * 渲染词源筛选按钮
     */
    renderSourceFilters() {
        const bar = document.getElementById('sourceFilterBar');
        if (!bar) return;
        
        let html = `<button class="source-filter-btn all${this._sourceFilter === 'all' ? ' active' : ''}" data-filter="all">全部</button>`;
        
        for (const source of this._availableSources) {
            const cls = source.type + (this._sourceFilter === source.type ? ' active' : '');
            html += `<button class="source-filter-btn ${cls}" data-filter="${source.type}">${source.name}</button>`;
        }
        
        bar.innerHTML = html;
        
        // 绑定点击事件
        bar.querySelectorAll('.source-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                if (filter === this._sourceFilter) return;
                this._sourceFilter = filter;
                this.renderSourceFilters();
                this.renderMeaningList();
            });
        });
    },

    /**
     * 绑定弹窗关闭事件
     */
    bindModalCloseEvents() {
        const overlay = document.getElementById('meaningModalOverlay');
        const closeBtn = document.getElementById('modalCloseBtn');
        const modal = document.getElementById('meaningModal');
        
        // 点击关闭按钮
        closeBtn.addEventListener('click', this._closeBtnHandler = () => this.hideMeaningModal());
        
        // 点击遮罩层关闭
        overlay.addEventListener('click', this._overlayHandler = (e) => {
            if (e.target === overlay) {
                this.hideMeaningModal();
            }
        });
        
        // ESC键关闭（使用 addEventListener 避免覆盖其他模块的键盘事件）
        this._escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideMeaningModal();
            }
        };
        document.addEventListener('keydown', this._escHandler);
    },

    /**
     * 隐藏释义弹窗
     */
    hideMeaningModal() {
        const overlay = document.getElementById('meaningModalOverlay');
        overlay.style.display = 'none';
        this.selectedMeanings = [];
        this.apiData = null;
        this._sourceFilter = 'all';
        this._availableSources = [];
        this._rawAllMeanings = [];
        
        // 清除事件绑定
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        if (this._closeBtnHandler) {
            document.getElementById('modalCloseBtn')?.removeEventListener('click', this._closeBtnHandler);
            this._closeBtnHandler = null;
        }
        if (this._overlayHandler) {
            document.getElementById('meaningModalOverlay')?.removeEventListener('click', this._overlayHandler);
            this._overlayHandler = null;
        }
    },

    /**
     * 更新词义面板的API部分
     */
    updateMeaningPanelWithApi() {
        const apiSection = document.getElementById('apiMeaningSection');
        if (!apiSection) return; // 弹窗未打开时跳过UI更新
        
        if (this.apiLoading) {
            apiSection.innerHTML = `
                <div class="api-loading">
                    <span class="loading-icon">⏳</span>
                    <span>正在获取权威释义...</span>
                </div>
            `;
            return;
        }
        
        if (this.apiError || !this.apiData) {
            apiSection.innerHTML = `
                <div class="api-empty">
                    <span class="empty-icon">📖</span>
                    <span>暂无详细释义</span>
                </div>
            `;
            return;
        }
        
        this.renderApiData(this.apiData);
    },

    /**
     * 渲染API数据（权威释义）
     */
    renderApiData(data) {
        const apiSection = document.getElementById('apiMeaningSection');
        
        // 显示所有条目
        if (data.entries && data.entries.length > 0) {
            let html = '';
            
            for (const entry of data.entries) {
                const word = entry.entry || '';
                const explain = entry.explain || '';
                
                if (explain) {
                    html += `<div class="api-meaning-item"><strong>${word}</strong> ${explain}</div>`;
                }
            }
            
            apiSection.innerHTML = html || '<div class="api-empty"><span class="empty-icon">📖</span><span>暂无详细释义</span></div>';
        } else {
            apiSection.innerHTML = '<div class="api-empty"><span class="empty-icon">📖</span><span>暂无详细释义</span></div>';
        }
    },


    /**
     * 从多个词库来源解析释义并合并（严格语义去重）
     * @param {Array} dataArray - 多个词库的数据数组
     * @returns {Array} 合并后的释义列表（按词性分类）
     */
    parseMeaningsFromMultipleSources(dataArray) {
        // 先收集所有释义
        const allMeanings = [];
        
        for (const wordData of dataArray) {
            const sourceType = wordData.sourceType || '';
            const sourceName = wordData.sourceName || '';
            const isKaoyanSource = sourceType === 'kaoyan';
            
            // 词库优先级（用于选择最优项）
            const sourcePriority = this.getSourcePriority(sourceName);
            
            // 新格式（json目录下的合并文件）
            if (wordData.translations && Array.isArray(wordData.translations)) {
                for (const trans of wordData.translations) {
                    const pos = this.normalizePos(trans.type || '');
                    const text = trans.translation || '';
                    if (!text.trim()) continue;
                    
                    allMeanings.push({
                        pos: pos,
                        text: text,
                        isKaoyan: isKaoyanSource,
                        sourceType: sourceType,
                        sourceName: sourceName,
                        sourcePriority: sourcePriority
                    });
                }
            } else {
                // 旧格式（json-full目录下的文件）
                const content = wordData.content?.word?.content;
                
                if (content?.trans && Array.isArray(content.trans)) {
                    for (const trans of content.trans) {
                        const pos = this.normalizePos(trans.pos || '');
                        const text = trans.tranCn || '';
                        if (!text.trim()) continue;
                        
                        allMeanings.push({
                            pos: pos,
                            text: text,
                            isKaoyan: isKaoyanSource,
                            sourceType: sourceType,
                            sourceName: sourceName,
                            sourcePriority: sourcePriority
                        });
                    }
                }
                
                if (content?.syno?.synos && Array.isArray(content.syno.synos)) {
                    for (const syno of content.syno.synos) {
                        if (syno.tran && syno.pos) {
                            const pos = this.normalizePos(syno.pos);
                            const text = syno.tran;
                            if (!text.trim()) continue;
                            
                            allMeanings.push({
                                pos: pos,
                                text: text,
                                isKaoyan: false,
                                sourceType: sourceType,
                                sourceName: sourceName,
                                sourcePriority: sourcePriority
                            });
                        }
                    }
                }
            }
        }
        
        // 按词性分组去重
        const groupedByPos = this.groupByPos(allMeanings);
        const mergedMeanings = [];
        
        // 对每个词性组进行去重
        for (const [pos, meanings] of groupedByPos) {
            const deduplicated = this.deduplicateMeanings(meanings);
            mergedMeanings.push(...deduplicated);
        }
        
        // 排序：考研高频优先，然后按词性排序
        mergedMeanings.sort((a, b) => {
            // 考研高频优先
            if (a.isKaoyan && !b.isKaoyan) return -1;
            if (!a.isKaoyan && b.isKaoyan) return 1;
            
            // 按词性排序（n. < v. < adj. < adv. < 其他）
            const posOrder = { 'n.': 0, 'v.': 1, 'adj.': 2, 'adv.': 3 };
            const aOrder = posOrder[a.pos] !== undefined ? posOrder[a.pos] : 99;
            const bOrder = posOrder[b.pos] !== undefined ? posOrder[b.pos] : 99;
            
            if (aOrder !== bOrder) return aOrder - bOrder;
            
            // 同词性按释义文本排序
            return a.text.localeCompare(b.text);
        });
        
        if (mergedMeanings.length === 0) {
            mergedMeanings.push({
                pos: '',
                text: '暂无释义',
                isKaoyan: false,
                sources: []
            });
        }
        
        return mergedMeanings;
    },

    /**
     * 词性归一化
     * @param {string} pos - 原始词性
     * @returns {string} 归一化后的词性
     */
    normalizePos(pos) {
        if (!pos) return '';
        
        const posLower = pos.toLowerCase().trim();
        
        // 名词
        if (posLower.startsWith('n') && !posLower.startsWith('neg')) {
            return 'n.';
        }
        // 动词
        if (posLower.startsWith('v')) {
            return 'v.';
        }
        // 形容词
        if (posLower.startsWith('adj') || posLower.startsWith('a')) {
            return 'adj.';
        }
        // 副词
        if (posLower.startsWith('adv') || posLower.startsWith('ad')) {
            return 'adv.';
        }
        
        return '';
    },

    /**
     * 获取词库优先级（用于选择最优项）
     * @param {string} sourceName - 词库名称
     * @returns {number} 优先级（数字越小优先级越高）
     */
    getSourcePriority(sourceName) {
        const priorities = {
            '考研': 1,
            '六级': 2,
            '四级': 3
        };
        return priorities[sourceName] || 99;
    },

    /**
     * 按词性分组
     * @param {Array} meanings - 释义列表
     * @returns {Map} 按词性分组的结果
     */
    groupByPos(meanings) {
        const groups = new Map();
        
        for (const meaning of meanings) {
            const pos = meaning.pos || '_other';
            if (!groups.has(pos)) {
                groups.set(pos, []);
            }
            groups.get(pos).push(meaning);
        }
        
        return groups;
    },

    /**
     * 对同一词性组的释义进行去重（语义相似度匹配）
     * @param {Array} meanings - 同一词性的释义列表
     * @returns {Array} 去重后的释义列表
     */
    deduplicateMeanings(meanings) {
        if (meanings.length === 0) return [];
        
        const result = [];
        const processedIndices = new Set();
        
        for (let i = 0; i < meanings.length; i++) {
            if (processedIndices.has(i)) continue;
            
            const current = meanings[i];
            const group = [current];
            processedIndices.add(i);
            
            // 查找相似释义
            for (let j = i + 1; j < meanings.length; j++) {
                if (processedIndices.has(j)) continue;
                
                const other = meanings[j];
                
                // 语义相似度判断（关键词重合度≥60%）
                if (this.calculateSimilarity(current.text, other.text) >= 0.6) {
                    group.push(other);
                    processedIndices.add(j);
                }
            }
            
            // 从相似组中选择最优项并合并来源标签
            const best = this.selectBestMeaning(group);
            result.push(best);
        }
        
        return result;
    },

    /**
     * 计算两个释义的语义相似度（关键词重合度）
     * @param {string} text1 - 文本1
     * @param {string} text2 - 文本2
     * @returns {number} 相似度（0-1）
     */
    calculateSimilarity(text1, text2) {
        const keywords1 = this.extractKeywords(text1);
        const keywords2 = this.extractKeywords(text2);
        
        if (keywords1.length === 0 || keywords2.length === 0) {
            return text1 === text2 ? 1 : 0;
        }
        
        // 计算交集
        const intersection = keywords1.filter(k => keywords2.includes(k));
        const union = [...new Set([...keywords1, ...keywords2])];
        
        return intersection.length / union.length;
    },

    /**
     * 提取中文关键词（分词）
     * @param {string} text - 原始文本
     * @returns {Array} 关键词列表
     */
    extractKeywords(text) {
        if (!text) return [];
        
        // 清洗文本：去除标点、空格
        const clean = text.toLowerCase().replace(/[，。、；：！？,.!?;:\s]/g, '');
        
        // 简单分词：按常见分隔符分割
        const separators = ['和', '与', '或', '及', '等', '、', '/', '\\'];
        let keywords = [clean];
        
        for (const sep of separators) {
            keywords = keywords.flatMap(k => k.split(sep).filter(s => s.length > 0));
        }
        
        // 过滤太短的关键词
        return keywords.filter(k => k.length >= 2);
    },

    /**
     * 从相似释义组中选择最优项
     * @param {Array} group - 相似释义组
     * @returns {Object} 最优释义
     */
    selectBestMeaning(group) {
        if (group.length === 1) {
            const item = group[0];
            return {
                pos: item.pos,
                text: item.text,
                isKaoyan: item.isKaoyan,
                sources: [item.sourceName]
            };
        }
        
        // 按优先级排序：信息丰富度 > 词库优先级 > 考研标记
        group.sort((a, b) => {
            // 计算信息丰富度：包含括号注释的优先
            const hasBracketA = /[\(（].*[\)）]/.test(a.text);
            const hasBracketB = /[\(（].*[\)）]/.test(b.text);
            if (hasBracketA && !hasBracketB) return -1;
            if (!hasBracketA && hasBracketB) return 1;
            
            // 优先选字数更多的（信息更丰富）
            const lenA = a.text.replace(/\s/g, '').length;
            const lenB = b.text.replace(/\s/g, '').length;
            if (lenB !== lenA) return lenB - lenA;
            
            // 词库优先级（数字越小越优先）
            if (a.sourcePriority !== b.sourcePriority) {
                return a.sourcePriority - b.sourcePriority;
            }
            
            // 考研优先
            if (a.isKaoyan && !b.isKaoyan) return -1;
            if (!a.isKaoyan && b.isKaoyan) return 1;
            
            return 0;
        });
        
        // 选择最优项
        const best = group[0];
        
        // 合并所有来源标签
        const sources = [...new Set(group.map(m => m.sourceName))];
        
        return {
            pos: best.pos,
            text: best.text,
            isKaoyan: group.some(m => m.isKaoyan),
            sources: sources
        };
    },

    /**
     * 判断新文本是否比旧文本更好（更丰富、更规范）
     * @param {string} newText - 新文本
     * @param {string} oldText - 旧文本
     * @returns {boolean} 是否更好
     */
    isBetterText(newText, oldText) {
        if (!newText || !oldText) return false;
        
        // 长度明显更长且不只是空格
        const newLen = newText.replace(/\s/g, '').length;
        const oldLen = oldText.replace(/\s/g, '').length;
        
        // 新文本至少比旧文本长30%才替换
        if (newLen > oldLen * 1.3) return true;
        
        // 考研词库的释义优先保留，不被替换
        return false;
    },

    /**
     * 渲染释义列表
     */
    renderMeaningList() {
        const container = document.getElementById('meaningList');
        this.selectedMeanings = [];
        
        if (!this._rawAllMeanings || this._rawAllMeanings.length === 0) {
            container.innerHTML = '<div class="suggest-empty">暂无释义</div>';
            return;
        }
        
        // 1. 按当前筛选获取释义
        const filtered = this._getFilteredMeanings();
        
        // 2. 按词性分组并智能合并（同一词性合并为一条）
        const mergedByPos = this._smartMergeByPos(filtered);
        
        // 3. 渲染
        this._renderMergedMeaningItems(container, mergedByPos);
    },

    /**
     * 按当前筛选条件获取释义
     * @returns {Array} 筛选后的释义列表
     */
    _getFilteredMeanings() {
        if (this._sourceFilter === 'all') {
            return this._rawAllMeanings;
        }
        // 通过 _availableSources 映射 type → name，再匹配 meanings 的 sources 数组
        const sourceName = this._availableSources.find(s => s.type === this._sourceFilter)?.name;
        if (!sourceName) return [];
        return this._rawAllMeanings.filter(m => m.sources && m.sources.includes(sourceName));
    },

    /**
     * 按词性智能合并释义（同一词性下所有义项合并为一条）
     * @param {Array} meanings - 释义列表
     * @returns {Array} 合并后的释义列表
     */
    _smartMergeByPos(meanings) {
        if (!meanings || meanings.length === 0) return [];
        
        // 按词性分组
        const groups = this.groupByPos(meanings);
        const result = [];
        
        const posOrder = { 'n.': 0, 'v.': 1, 'adj.': 2, 'adv.': 3 };
        
        for (const [pos, posMeanings] of groups) {
            // 收集同一词性下所有释义的独立义项
            const allSenses = [];
            for (const m of posMeanings) {
                // 按中文分号分割为独立义项
                const senses = m.text.split('；').map(s => s.trim()).filter(s => s);
                for (const sense of senses) {
                    allSenses.push({
                        raw: sense,
                        normalized: this.normalizeForComparison(sense)
                    });
                }
            }
            
            // 义项级语义去重
            const uniqueSenses = this._dedupSenses(allSenses);
            
            // 排序：按词性排序，同一词性内保持原有顺序
            const text = uniqueSenses.join('；');
            
            // 收集所有来源标签
            const allSources = [...new Set(posMeanings.map(m => m.sourceName).filter(Boolean))];
            const isKaoyan = posMeanings.some(m => m.isKaoyan);
            
            result.push({
                pos: pos === '_other' ? '' : pos,
                text: text,
                isKaoyan: isKaoyan,
                sources: allSources
            });
        }
        
        // 按词性排序输出
        result.sort((a, b) => {
            const aOrder = posOrder[a.pos] !== undefined ? posOrder[a.pos] : 99;
            const bOrder = posOrder[b.pos] !== undefined ? posOrder[b.pos] : 99;
            return aOrder - bOrder;
        });
        
        return result;
    },

    /**
     * 义项级语义去重
     * @param {Array} senses - 义项列表 [{raw, normalized}]
     * @returns {Array} 去重后的原始义项文本列表
     */
    _dedupSenses(senses) {
        if (senses.length <= 1) return senses.map(s => s.raw);
        
        const kept = [senses[0]];
        
        for (let i = 1; i < senses.length; i++) {
            const current = senses[i];
            let isDuplicate = false;
            
            for (const existing of kept) {
                // 完全匹配
                if (current.normalized === existing.normalized) {
                    isDuplicate = true;
                    break;
                }
                // 包含关系（一个包含另一个）
                if (current.normalized.includes(existing.normalized) || existing.normalized.includes(current.normalized)) {
                    // 保留字数更多的
                    if (current.normalized.length > existing.normalized.length) {
                        kept.splice(kept.indexOf(existing), 1, current);
                    }
                    isDuplicate = true;
                    break;
                }
                // 语义相似度
                const similarity = this.calculateEnhancedSimilarity(current.raw, existing.raw);
                if (similarity >= 0.7) {
                    isDuplicate = true;
                    break;
                }
            }
            
            if (!isDuplicate) {
                kept.push(current);
            }
        }
        
        return kept.map(s => s.raw);
    },

    /**
     * 增强的相似度计算（支持中文语义匹配）
     * @param {string} text1 - 文本1
     * @param {string} text2 - 文本2
     * @returns {number} 相似度 (0-1)
     */
    calculateEnhancedSimilarity(text1, text2) {
        if (!text1 || !text2) return 0;
        if (text1 === text2) return 1;
        
        // 1. 标准化文本
        const normalized1 = this.normalizeForComparison(text1);
        const normalized2 = this.normalizeForComparison(text2);
        
        // 2. 完全匹配检查
        if (normalized1 === normalized2) return 1;
        
        // 3. 包含关系检查（一个包含另一个的核心内容）
        if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
            const shorter = Math.min(normalized1.length, normalized2.length);
            const longer = Math.max(normalized1.length, normalized2.length);
            return shorter / longer * 0.9 + 0.1; // 包含关系给较高分
        }
        
        // 4. 字符级相似度（适用于中文）
        const charSimilarity = this.calculateCharSimilarity(normalized1, normalized2);
        
        // 5. 关键词语义相似度
        const keywordSimilarity = this.calculateKeywordSimilarity(text1, text2);
        
        // 6. 编辑距离相似度
        const editSimilarity = this.calculateEditDistanceSimilarity(normalized1, normalized2);
        
        // 综合评分（加权平均）
        return charSimilarity * 0.4 + keywordSimilarity * 0.4 + editSimilarity * 0.2;
    },

    /**
     * 标准化文本用于比较
     * @param {string} text - 原始文本
     * @returns {string} 标准化后的文本
     */
    normalizeForComparison(text) {
        if (!text) return '';
        
        let normalized = text.toLowerCase();
        
        // 去除词性前缀
        normalized = normalized.replace(/^[nvadj]+\.\s*/i, '');
        
        // 去除括号内容（包括中文和英文括号）
        normalized = normalized.replace(/[\(（][^\)）]*[\)）]/g, '');
        
        // 去除标点符号和空格
        normalized = normalized.replace(/[\s,，.。、；：！？\-\/\\]/g, '');
        
        return normalized;
    },

    /**
     * 字符级相似度（适用于中文）
     * @param {string} text1 - 文本1
     * @param {string} text2 - 文本2
     * @returns {number} 相似度 (0-1)
     */
    calculateCharSimilarity(text1, text2) {
        if (!text1 || !text2) return 0;
        
        const chars1 = new Set(text1.split(''));
        const chars2 = new Set(text2.split(''));
        
        const intersection = new Set([...chars1].filter(c => chars2.has(c)));
        const union = new Set([...chars1, ...chars2]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    },

    /**
     * 关键词语义相似度
     * @param {string} text1 - 文本1
     * @param {string} text2 - 文本2
     * @returns {number} 相似度 (0-1)
     */
    calculateKeywordSimilarity(text1, text2) {
        const keywords1 = this.extractEnhancedKeywords(text1);
        const keywords2 = this.extractEnhancedKeywords(text2);
        
        if (keywords1.length === 0 || keywords2.length === 0) {
            return 0;
        }
        
        const intersection = keywords1.filter(k => keywords2.includes(k));
        const union = [...new Set([...keywords1, ...keywords2])];
        
        return union.length > 0 ? intersection.length / union.length : 0;
    },

    /**
     * 增强的关键词提取（支持中文分词）
     * @param {string} text - 文本
     * @returns {Array} 关键词列表
     */
    extractEnhancedKeywords(text) {
        if (!text) return [];
        
        // 清洗文本
        let cleaned = text.toLowerCase();
        cleaned = cleaned.replace(/^[nvadj]+\.\s*/i, '');
        cleaned = cleaned.replace(/[\(（][^\)）]*[\)）]/g, '');
        cleaned = cleaned.replace(/[\s,，.。、；：！？\-\/\\]/g, '');
        
        const keywords = [];
        
        // 1. 提取中文词汇（2-4字组合）
        const chineseChars = cleaned.match(/[\u4e00-\u9fa5]+/g) || [];
        for (const segment of chineseChars) {
            // 添加完整词
            if (segment.length >= 2) {
                keywords.push(segment);
            }
            // 添加2字组合
            for (let i = 0; i < segment.length - 1; i++) {
                keywords.push(segment.substring(i, i + 2));
            }
        }
        
        // 2. 提取英文单词
        const englishWords = cleaned.match(/[a-z]+/g) || [];
        keywords.push(...englishWords.filter(w => w.length >= 2));
        
        return [...new Set(keywords)];
    },

    /**
     * 编辑距离相似度
     * @param {string} text1 - 文本1
     * @param {string} text2 - 文本2
     * @returns {number} 相似度 (0-1)
     */
    calculateEditDistanceSimilarity(text1, text2) {
        if (!text1 || !text2) return 0;
        if (text1 === text2) return 1;
        
        const len1 = text1.length;
        const len2 = text2.length;
        const maxLen = Math.max(len1, len2);
        
        if (maxLen === 0) return 1;
        
        // 计算编辑距离
        const distance = this.levenshteinDistance(text1, text2);
        
        return 1 - (distance / maxLen);
    },

    /**
     * 计算编辑距离（Levenshtein Distance）
     * @param {string} s1 - 字符串1
     * @param {string} s2 - 字符串2
     * @returns {number} 编辑距离
     */
    levenshteinDistance(s1, s2) {
        const len1 = s1.length;
        const len2 = s2.length;
        
        // 创建矩阵
        const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
        
        // 初始化
        for (let i = 0; i <= len1; i++) dp[i][0] = i;
        for (let j = 0; j <= len2; j++) dp[0][j] = j;
        
        // 填充矩阵
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,      // 删除
                    dp[i][j - 1] + 1,      // 插入
                    dp[i - 1][j - 1] + cost // 替换
                );
            }
        }
        
        return dp[len1][len2];
    },

    /**
     * 渲染合并后的释义项到容器
     * @param {HTMLElement} container - 容器元素
     * @param {Array} items - 合并后的释义项列表
     */
    _renderMergedMeaningItems(container, items) {
        this.selectedMeanings = [];

        // 获取考研词源的名称（用于默认勾选）
        const kaoyanName = this._availableSources.find(s => s.type === 'kaoyan')?.name || '';

        const html = items.map((item, index) => {
            const isChecked = item.sources && item.sources.includes(kaoyanName);
            if (isChecked) {
                this.selectedMeanings.push(item);
            }

            const sourceTags = item.sources && item.sources.length > 0
                ? `<span class="meaning-sources">${item.sources.map(s => `<span class="meaning-source">${s}</span>`).join('')}</span>`
                : '';

            // 将同一词性下的多个义项按 "；" 拆分为独立行
            const senses = item.text.split('；').map(s => s.trim()).filter(s => s);
            const sensesHtml = senses.map((sense, sIdx) =>
                `<div class="meaning-sense-line" data-sense-index="${sIdx}">${sense}</div>`
            ).join('');

            return `
                <div class="meaning-item ${kaoyanName && item.sources && item.sources.includes(kaoyanName) ? 'kaoyan-highlight' : ''}" data-index="${index}">
                    <div class="meaning-checkbox ${isChecked ? 'checked' : ''}" data-index="${index}"></div>
                    <div class="meaning-item-content">
                        <span class="meaning-pos">${item.pos || ''}</span>
                        <span class="meaning-text">${sensesHtml}</span>
                    </div>
                    ${sourceTags}
                </div>
            `;
        }).join('');

        container.innerHTML = html;

        container.querySelectorAll('.meaning-checkbox').forEach((checkbox) => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(checkbox.dataset.index);
                this._toggleMergedMeaning(index, items[index]);
            });
        });
    },

    /**
     * 切换合并后的释义选中状态
     * @param {number} index - 索引
     * @param {Object} item - 释义数据
     */
    _toggleMergedMeaning(index, item) {
        const checkbox = document.querySelector(`.meaning-checkbox[data-index="${index}"]`);
        const isChecked = checkbox.classList.contains('checked');
        
        if (isChecked) {
            checkbox.classList.remove('checked');
            this.selectedMeanings = this.selectedMeanings.filter(m => m !== item);
        } else {
            checkbox.classList.add('checked');
            this.selectedMeanings.push(item);
        }
        
        this.updateAddButton();
    },

    /**
     * 更新添加按钮状态
     */
    updateAddButton() {
        const btn = document.getElementById('singleAddBtn');
        const canAdd = this.selectedWord && this.selectedMeanings.length > 0;
        btn.disabled = !canAdd;
    },

    /**
     * 处理键盘导航
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeydown(e) {
        const suggestList = document.getElementById('wordSuggestList');
        const items = suggestList.querySelectorAll('.suggest-item');
        const activeItem = suggestList.querySelector('.suggest-item.active');
        
        if (suggestList.style.display === 'none' || items.length === 0) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (activeItem) {
                    const next = activeItem.nextElementSibling;
                    if (next && next.classList.contains('suggest-item')) {
                        activeItem.classList.remove('active');
                        next.classList.add('active');
                    }
                } else {
                    items[0].classList.add('active');
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (activeItem) {
                    const prev = activeItem.previousElementSibling;
                    if (prev && prev.classList.contains('suggest-item')) {
                        activeItem.classList.remove('active');
                        prev.classList.add('active');
                    }
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (activeItem) {
                    const index = parseInt(activeItem.dataset.index);
                    const matches = this.searchWords(document.getElementById('singleInput').value.trim().toLowerCase());
                    if (matches[index]) {
                        this.selectWord(matches[index]);
                    }
                }
                break;
                
            case 'Escape':
                this.hideSuggestList();
                break;
        }
    },

    /**
     * 清洗释义文本：去除重复词性前缀、合并相同含义
     * @param {string} text - 原始释义文本
     * @returns {string} 清洗后的释义文本
     */
    cleanMeaningText(text) {
        if (!text) return text;
        
        // 1. 按分号分割成独立片段
        const segments = text.split(';').map(s => s.trim()).filter(s => s);
        
        // 2. 清洗每个片段：去除重复词性前缀
        const cleanedSegments = segments.map(seg => {
            let cleaned = seg;
            
            // 去除连续重复的词性前缀（如 "n. n. 数据库" -> "n. 数据库"）
            cleaned = cleaned.replace(/([nvadj]+\.)\s*\1+/g, '$1');
            
            // 去除混入词性前缀中的多余内容 (如 "n. n. " -> "n. ")
            const posTags = ['n.', 'v.', 'adj.', 'adv.'];
            for (const tag of posTags) {
                const pattern = new RegExp(`(?:${tag.replace('.', '\\.')}\\s*)+`, 'g');
                cleaned = cleaned.replace(pattern, tag + ' ');
            }
            
            // 确保词性前缀后只有一个空格
            cleaned = cleaned.replace(/([nvadj]+\.)\s+/g, '$1 ');
            
            return cleaned.trim();
        });
        
        // 3. 跨片段去重：保留内容最丰富的版本
        const seen = new Map(); // key: 词性前缀+核心词, value: {full: 完整文本, score: 丰富度评分}
        
        for (const seg of cleanedSegments) {
            // 提取词性前缀
            const posMatch = seg.match(/^([nvadj]+\.)\s*/);
            const pos = posMatch ? posMatch[1] : '';
            // 去掉词性前缀后的核心内容
            const content = seg.replace(/^[nvadj]+\.\s*/, '').trim();
            
            // 提取核心词（第一个中文词或英文词）
            const coreMatch = content.match(/[\(（]?([a-zA-Z]+|[一-龥]+)/);
            const core = coreMatch ? coreMatch[1] : content;
            
            // 如果内容以括号开头（如 (databank)），也提取括号内内容
            const bracketMatch = content.match(/[\(（]([a-zA-Z]+)[\)）]/);
            const bracketWord = bracketMatch ? bracketMatch[1] : '';
            
            const key = pos + (bracketWord || core);
            
            // 丰富度评分：字数越多越丰富
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

    /**
     * 获取当前选中的单词数据
     * @returns {Object|null} 单词数据
     */
    getSelectedWordData() {
        if (!this.selectedWord || this.selectedMeanings.length === 0) {
            return null;
        }
        
        const translations = this.selectedMeanings.map(m => {
            const text = m.text;
            // 如果 text 已以 m.pos 开头，不再重复添加
            return m.pos && text && !text.startsWith(m.pos) ? `${m.pos} ${text}` : text;
        }).join('; ');
        
        return {
            word: this.selectedWord.word,
            phonetic: this.selectedWord.phonetic,
            translation: translations,
            pos: this.selectedMeanings[0]?.pos || '',
            fullTranslation: translations,
            meanings: this.selectedMeanings.map(m => ({
                ...m,
                text: m.text
            })),
            apiData: this.apiData
        };
    },

    /**
     * 清空选择状态
     */
    clearSelection() {
        this.selectedWord = null;
        this.selectedMeanings = [];
        this.apiData = null;
        document.getElementById('singleInput').value = '';
        this.hideSuggestList();
        this.hideMeaningModal();
        this.updateAddButton();
    }
};

// 导出模块
window.VocabSearch = VocabSearch;