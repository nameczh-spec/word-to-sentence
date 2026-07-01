/**
 * 文本渲染模块 - textRender.js
 * 负责文本渲染、单词高亮、段落拆分、版本管理
 */

const TextRenderer = {
    // 当前文本数据
    currentText: null,
    
    // 分页数据
    paragraphs: [],
    currentPage: 1,
    totalPages: 1,
    
    // 当前版本号
    currentVersion: 1,

    // 当天文本缓存（查看历史时保存）
    _todayTextCache: null,

    /**
     * 初始化文本渲染
     * 【数据隔离】仅加载当日文本，忽略历史日期缓存
     */
    init() {
        this.currentText = DataStore.loadCurrentText();
        // 【数据隔离】仅渲染当日文本，防止历史文本污染当日视图
        if (this.currentText && this.currentText.text && this.currentText.date === DataStore.getTodayDate()) {
            this.renderText(this.currentText.text, this.currentText.rareWords);
            // 兼容旧数据：starredPages 未定义但有 starred 布尔值
            if (!this.currentText.starredPages && this.paragraphs.length > 0) {
                // 旧数据：全局 starred 映射到所有页面
                this.currentText.starredPages = this.paragraphs.map(() => !!this.currentText.starred);
                DataStore.saveCurrentText(this.currentText);
            }
            this.currentVersion = this.currentText.version || 1;
            this.updateVersionDisplay();
            // 恢复当前页收藏状态
            const pageIndex = (this.currentPage || 1) - 1;
            this.updateStarButton(!!(this.currentText.starredPages && this.currentText.starredPages[pageIndex]));
        } else {
            // 非当日文本，清空缓存
            this.currentText = null;
            this.clearText();
        }

        // 初始化星标按钮事件
        this.initStarButton();
    },

    /**
     * 初始化星标按钮事件
     */
    initStarButton() {
        const starBtn = document.getElementById('starBtn');
        if (starBtn) {
            starBtn.addEventListener('click', () => {
                this.toggleStar();
            });
        }
    },

    /**
     * 切换当前页收藏状态
     */
    toggleStar() {
        if (!this.currentText || !this.currentText.text) return;

        // 确保 starredPages 数组存在且长度与段落数一致
        if (!this.currentText.starredPages || this.currentText.starredPages.length !== this.paragraphs.length) {
            this.currentText.starredPages = this.paragraphs.map(() => false);
        }

        // 只切换当前页的状态
        const pageIndex = this.currentPage - 1;
        this.currentText.starredPages[pageIndex] = !this.currentText.starredPages[pageIndex];

        // 保存到本地存储
        DataStore.saveCurrentText(this.currentText);

        // 更新按钮显示（反映当前页状态）
        this.updateStarButton(this.currentText.starredPages[pageIndex]);

        // 提示用户
        const message = this.currentText.starredPages[pageIndex]
            ? '本页已收藏'
            : '本页已取消收藏';
        InteractionManager.showToast(message, 'success');
    },

    /**
     * 当前页是否已收藏
     * @returns {boolean}
     */
    isCurrentPageStarred() {
        if (!this.currentText || !this.currentText.starredPages) return false;
        const pageIndex = (this.currentPage || 1) - 1;
        return !!this.currentText.starredPages[pageIndex];
    },

    /**
     * 更新星标按钮显示状态
     * @param {boolean} starred - 是否已收藏
     */
    updateStarButton(starred) {
        const starBtn = document.getElementById('starBtn');
        if (!starBtn) return;
        
        if (starred) {
            starBtn.classList.add('starred');
            starBtn.querySelector('.star-text').textContent = '已收藏';
            starBtn.title = '取消收藏（取消后关闭页面不会归档）';
        } else {
            starBtn.classList.remove('starred');
            starBtn.querySelector('.star-text').textContent = '收藏';
            starBtn.title = '收藏此文本（收藏后才会归档）';
        }
    },

    /**
     * 显示星标按钮
     */
    showStarButton() {
        const starBtn = document.getElementById('starBtn');
        if (starBtn) {
            starBtn.style.display = 'flex';
        }
    },

    /**
     * 隐藏星标按钮
     */
    hideStarButton() {
        const starBtn = document.getElementById('starBtn');
        if (starBtn) {
            starBtn.style.display = 'none';
        }
    },

    /**
     * 渲染文本到展示区
     * @param {string} text - 文本内容
     * @param {Array} rareWords - 生僻词列表
     */
    renderText(text, rareWords = []) {
        const container = document.getElementById('textDisplay');
        
        if (!text) {
            container.innerHTML = `
                <div class="text-empty">
                    <p>请先导入单词，然后点击"生成文本"</p>
                    <p class="text-tip">AI将根据您的单词生成连贯的阅读段落</p>
                </div>
            `;
            this.hidePagination();
            this.hideRareWords();
            this.hideVersionInfo();
            this.hideStarButton();
            return;
        }
        
        // 显示星标按钮
        this.showStarButton();
        
        // 高亮单词
        const words = WordManager.getAllWords();
        const highlightedText = this.highlightWords(text, words);
        
        // 拆分段落
        this.paragraphs = this.splitParagraphs(highlightedText);
        this.totalPages = this.paragraphs.length;
        this.currentPage = 1;
        
        // 渲染第一页
        this.renderPage(1);
        
        // 显示分页控制
        if (this.paragraphs.length > 1) {
            this.showPagination();
        } else {
            this.hidePagination();
        }
        
        // 渲染生僻词
        if (rareWords.length > 0) {
            this.renderRareWords(rareWords);
        } else {
            this.hideRareWords();
        }
        
        // 显示版本信息
        this.showVersionInfo();
    },

    /**
     * 高亮标记单词
     * @param {string} text - 原始文本
     * @param {Array} words - 单词列表
     * @returns {string} 高亮后的文本
     */
    highlightWords(text, words) {
        // 空单词列表直接返回（避免空正则匹配所有位置）
        if (!words || words.length === 0) {
            return this.escapeHtmlExceptHighlight(text);
        }
        
        const highlightStyle = ConfigManager.getHighlightStyle();
        
        // 将单词分块处理，每块最多50个，避免正则回溯性能问题
        const CHUNK_SIZE = 50;
        let result = text;
        for (let i = 0; i < words.length; i += CHUNK_SIZE) {
            const chunk = words.slice(i, i + CHUNK_SIZE);
            const wordPattern = chunk
                .map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
                .join('|');
            const regex = new RegExp(`(?<![a-zA-Z])(${wordPattern})(?![a-zA-Z])`, 'gi');
            
            result = result.replace(regex, (match) => {
                const escapedWord = match.toLowerCase().replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                return `<span class="highlight-word style-${highlightStyle}" data-word="${escapedWord}">${match}</span>`;
            });
        }
        
        // 转义HTML特殊字符（但保留高亮标记）
        result = this.escapeHtmlExceptHighlight(result);
        
        return result;
    },

    /**
     * 转义HTML特殊字符，但保留高亮标记
     * @param {string} text - 文本
     * @returns {string} 转义后的文本
     */
    escapeHtmlExceptHighlight(text) {
        // 先保护高亮标记
        const highlights = [];
        let index = 0;
        text = text.replace(/<span class="highlight-word[^>]*>[^<]*<\/span>/g, (match) => {
            highlights.push(match);
            return `__HIGHLIGHT_${index++}__`;
        });
        
        // 转义HTML
        text = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // 恢复高亮标记
        highlights.forEach((highlight, i) => {
            text = text.replace(`__HIGHLIGHT_${i}__`, highlight);
        });
        
        return text;
    },

    /**
     * 拆分段落
     * @param {string} text - 文本
     * @returns {Array} 段落列表
     */
    splitParagraphs(text) {
        // 按换行符拆分
        const paragraphs = text
            .split(/\n\n+/)
            .filter(p => p.trim().length > 0)
            .map(p => `<div class="text-paragraph"><p>${p.replace(/\n/g, '<br>')}</p></div>`);
        
        return paragraphs;
    },

    /**
     * 渲染指定页
     * @param {number} page - 页码
     */
    renderPage(page) {
        const container = document.getElementById('textDisplay');

        if (page >= 1 && page <= this.paragraphs.length) {
            this.currentPage = page;
            // 只渲染当前页对应的段落
            container.innerHTML = this.paragraphs[page - 1] || '';
            this.updatePaginationDisplay();
            // 更新收藏按钮状态（反映当前页）
            if (this.currentText && this.currentText.starredPages) {
                const pageIndex = page - 1;
                const starred = !!this.currentText.starredPages[pageIndex];
                this.updateStarButton(starred);
            }
        }
    },

    /**
     * 显示上一页
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.renderPage(this.currentPage - 1);
        }
    },

    /**
     * 显示下一页
     */
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.renderPage(this.currentPage + 1);
        }
    },

    /**
     * 显示分页控制
     */
    showPagination() {
        document.getElementById('pagination').style.display = 'flex';
        this.updatePaginationDisplay();
    },

    /**
     * 隐藏分页控制
     */
    hidePagination() {
        document.getElementById('pagination').style.display = 'none';
    },

    /**
     * 更新分页显示
     */
    updatePaginationDisplay() {
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('totalPages').textContent = this.totalPages;
    },

    /**
     * 渲染生僻词汇总
     * @param {Array} words - 生僻词列表
     */
    renderRareWords(words) {
        const container = document.getElementById('rareWordsList');
        const section = document.getElementById('rareWordsSection');
        
        const html = words.map(word => 
            `<span class="rare-word-item">${word}</span>`
        ).join('');
        
        container.innerHTML = html;
        section.style.display = 'block';
    },

    /**
     * 隐藏生僻词汇总
     */
    hideRareWords() {
        document.getElementById('rareWordsSection').style.display = 'none';
    },

    /**
     * 显示版本信息
     */
    showVersionInfo() {
        document.getElementById('versionInfo').style.display = 'block';
        this.updateVersionDisplay();
    },

    /**
     * 隐藏版本信息
     */
    hideVersionInfo() {
        document.getElementById('versionInfo').style.display = 'none';
    },

    /**
     * 更新版本显示
     */
    updateVersionDisplay() {
        document.getElementById('currentVersion').textContent = this.currentVersion;
    },

    /**
     * 版本号累加
     */
    incrementVersion() {
        this.currentVersion++;
        this.updateVersionDisplay();
    },

    /**
     * 缓存当天文本（切换到历史视图前调用）
     * 【数据隔离】仅缓存当日文本，不缓存历史数据
     */
    cacheTodayText() {
        if (this.currentText && this.currentText.text && this.currentText.date === DataStore.getTodayDate()) {
            this._todayTextCache = JSON.parse(JSON.stringify(this.currentText));
        } else {
            this._todayTextCache = null;
        }
    },

    /**
     * 显示句子导航（历史模式多句子切换）
     * @param {number} currentIndex - 当前句子索引(0-based)
     * @param {number} total - 总句子数
     */
    showSentenceNav(currentIndex, total) {
        const nav = document.getElementById('sentenceNav');
        if (!nav) return;
        nav.style.display = 'flex';
        document.getElementById('sentenceIndex').textContent = currentIndex + 1;
        document.getElementById('sentenceTotal').textContent = total;
        document.getElementById('prevSentenceBtn').disabled = currentIndex <= 0;
        document.getElementById('nextSentenceBtn').disabled = currentIndex >= total - 1;
    },

    /**
     * 隐藏句子导航
     */
    hideSentenceNav() {
        const nav = document.getElementById('sentenceNav');
        if (nav) nav.style.display = 'none';
    },

    /**
     * 恢复当天文本（从历史视图返回时调用）
     */
    restoreTodayText() {
        if (this._todayTextCache && this._todayTextCache.text) {
            this.currentText = JSON.parse(JSON.stringify(this._todayTextCache));
            this.renderText(this.currentText.text, this.currentText.rareWords || []);
            this.currentVersion = this.currentText.version || 1;
            this.updateVersionDisplay();
            this._todayTextCache = null;
        } else {
            this.clearText();
        }
    },

    /**
     * 一键复制文本
     */
    copyText() {
        if (!this.currentText || !this.currentText.text) {
            InteractionManager.showToast('暂无文本可复制', 'warning');
            return;
        }
        
        // 复制原始文本（不含高亮标记）
        const plainText = this.currentText.rawContent || this.currentText.text;
        
        navigator.clipboard.writeText(plainText)
            .then(() => {
                InteractionManager.showToast('文本已复制到剪贴板', 'success');
            })
            .catch(() => {
                InteractionManager.showToast('复制失败，请手动复制', 'error');
            });
    },

    /**
     * 保存当前文本数据
     * 【数据隔离】只读模式下禁止保存，防止历史文本覆盖当日缓存
     * @param {string} text - 文本内容
     * @param {Array} rareWords - 生僻词列表
     * @param {string} mode - 生成模式
     * @param {string} rawContent - 原始内容
     */
    saveCurrentText(text, rareWords, mode, rawContent) {
        // 【读写分离】只读模式下禁止保存文本到当日存储
        if (window.WordManager && window.WordManager._isReadOnly) {
            this.currentText = {
                text: text,
                rareWords: rareWords,
                rawContent: rawContent,
                version: this.currentVersion,
                date: DataStore.getTodayDate(),
                mode: mode,
                starredPages: []
            };
            // 仅更新内存中的当前文本用于显示，不持久化
            return;
        }

        // 重新生成时重置 starredPages（新文本所有页面默认未收藏）
        const paragraphs = this.splitParagraphs(this.highlightWords(text, WordManager.getAllWords()));
        const newStarredPages = paragraphs.map(() => false);

        this.currentText = {
            text: text,
            rareWords: rareWords,
            rawContent: rawContent,
            version: this.currentVersion,
            date: DataStore.getTodayDate(),
            mode: mode,
            starredPages: newStarredPages
        };

        DataStore.saveCurrentText(this.currentText);

        // 更新星标按钮显示（当前页默认未收藏）
        this.updateStarButton(false);
    },

    /**
     * 加载历史文本
     * @param {Object} versionData - 版本数据
     */
    loadHistoryText(versionData) {
        this.currentVersion = versionData.version;
        this.currentText = {
            text: versionData.text,
            rareWords: versionData.rareWords || [],
            rawContent: versionData.text,
            version: versionData.version,
            date: versionData.date || DataStore.getTodayDate(),
            mode: versionData.mode || 'english'
        };
        
        const { text, rareWords } = ApiRequest.parseContent(versionData.text);
        this.renderText(text, rareWords);
        this.updateVersionDisplay();
    },

    /**
     * 清空文本显示
     */
    clearText() {
        this.currentText = null;
        this.paragraphs = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.currentVersion = 1;
        
        const container = document.getElementById('textDisplay');
        container.innerHTML = `
            <div class="text-empty">
                <p>请先导入单词，然后点击"生成文本"</p>
                <p class="text-tip">AI将根据您的单词生成连贯的阅读段落</p>
            </div>
        `;
        
        this.hidePagination();
        this.hideRareWords();
        this.hideVersionInfo();
        this.hideStarButton();
    }
};

// 导出模块
window.TextRenderer = TextRenderer;