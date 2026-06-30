/**
 * 交互模块 - interaction.js
 * 贳责单词点击交互、卡片/弹窗展开收起逻辑
 */

const InteractionManager = {
    // 当前显示的卡片
    currentCard: null,
    
    // 当前点击的单词元素
    currentWordElement: null,

    // 当前查看的历史日期（null=当天）
    _activeHistoryDate: null,

    // 历史句子列表（用于多句子切换）
    _historySentences: null,
    _currentHistorySentenceIndex: 0,

    // 标记历史记录是否被修改（返回当天时触发保存）
    _historyTextModified: false,

    // 自建词本相关
    _selectedCustomBook: null,
    _currentSource: 'daily',

    /**
     * 初始化交互
     */
    init() {
        this.initWordClick();
        this.initBlankClick();
        this.initPopupClose();
        this.initSettingsPanel();
        this.initReviewPanel();
        this.initBackToToday();
        this.initSentenceNav();
        this.bindConfigEvents();
        this.bindHistoryEvents();
        this.initWordBookManagement();
        this.initSourceToggle();
        this.initHamburgerMenu();
        this.initCustomDropdowns();
        
        // 词本按钮绑定
        const wbBtn = document.getElementById('wordbookBtn');
        if (wbBtn) {
            wbBtn.addEventListener('click', () => { this.showWordBookPopup(); });
        }

        // 侧边栏历史记录入口按钮 - 打开复习面板
        const sidebarHistoryBtn = document.getElementById('sidebarHistoryEntryBtn');
        if (sidebarHistoryBtn) {
            sidebarHistoryBtn.addEventListener('click', () => {
                // 先关闭侧边栏
                const sidebar = document.getElementById('sidebarLeft');
                const overlay = document.getElementById('sidebarOverlay');
                if (sidebar) sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
                // 打开复习面板
                this.openReviewPanel();
            });
        }

        // API密钥显隐切换
        const apiKeyToggle = document.getElementById('apiKeyToggleBtn');
        if (apiKeyToggle) {
            apiKeyToggle.addEventListener('click', () => {
                const apiKeyInput = document.getElementById('apiKey');
                const eyeOpen = apiKeyToggle.querySelector('.eye-open');
                const eyeClosed = apiKeyToggle.querySelector('.eye-closed');
                if (!apiKeyInput) return;
                if (apiKeyInput.type === 'password') {
                    apiKeyInput.type = 'text';
                    if (eyeOpen) eyeOpen.style.display = 'none';
                    if (eyeClosed) eyeClosed.style.display = 'block';
                } else {
                    apiKeyInput.type = 'password';
                    if (eyeOpen) eyeOpen.style.display = 'block';
                    if (eyeClosed) eyeClosed.style.display = 'none';
                }
            });
        }
    },

    /**
     * 初始化设置面板
     */
    initSettingsPanel() {
        const settingsPanel = document.getElementById('settingsPanel');
        const settingsOverlay = document.getElementById('settingsOverlay');
        const openBtn = document.getElementById('openSettingsBtn');
        const closeBtn = document.getElementById('closeSettingsBtn');
        
        // 打开设置面板
        openBtn.addEventListener('click', () => {
            this.openSettings();
        });
        
        // 关闭设置面板
        closeBtn.addEventListener('click', () => {
            this.closeSettings();
        });
        
        // 点击遮罩关闭
        settingsOverlay.addEventListener('click', () => {
            this.closeSettings();
        });
        
        // 设置面板 - 用户头像点击打开登录
        const userAvatar = document.getElementById('settingsUserAvatar');
        if (userAvatar) {
            userAvatar.addEventListener('click', () => {
                this.closeSettings();
                setTimeout(() => window.App.showLoginScreen(), 250);
            });
        }
        
        // 设置面板 - 复习历史入口
        const reviewEntry = document.getElementById('settingsReviewEntry');
        if (reviewEntry) {
            reviewEntry.addEventListener('click', () => {
                this.closeSettings();
                setTimeout(() => this.openReviewPanel(), 250);
            });
        }
        
        // ESC键关闭（统一 handler，防重复注册）
        if (!this._escBound) {
            this._escBound = true;
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (settingsPanel.classList.contains('open')) {
                        this.closeSettings();
                    }
                    if (document.getElementById('reviewPanel')?.classList.contains('active')) {
                        this.closeReviewPanel();
                    }
                }
            });
        }
        
        // 初始化词书管理设置事件
        this._initVocabSettingsEvents();
    },

    /**
     * 初始化复习面板
     */
    initReviewPanel() {
        const reviewPanel = document.getElementById('reviewPanel');
        const closeBtn = document.getElementById('closeReviewBtn');
        
        if (!reviewPanel || !closeBtn) return;
        
        // 创建遮罩（如果不存在）
        let overlay = document.getElementById('reviewOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'reviewOverlay';
            overlay.className = 'review-overlay';
            document.body.appendChild(overlay);
        }
        
        // 关闭复习面板
        closeBtn.addEventListener('click', () => {
            this.closeReviewPanel();
        });
        
        // 点击遮罩关闭
        overlay.addEventListener('click', () => {
            this.closeReviewPanel();
        });
    },

    /**
     * 打开复习面板
     */
    openReviewPanel() {
        this.renderReviewContent();
        document.getElementById('reviewPanel').classList.add('active');
        const overlay = document.getElementById('reviewOverlay');
        if (overlay) overlay.classList.add('active');
    },

    /**
     * 关闭复习面板
     */
    closeReviewPanel() {
        document.getElementById('reviewPanel').classList.remove('active');
        const overlay = document.getElementById('reviewOverlay');
        if (overlay) overlay.classList.remove('active');
    },

    /**
     * 渲染复习面板内容
     */
    renderReviewContent() {
        const container = document.getElementById('reviewContent');
        const history = DataStore.loadHistory();
        
        if (!history.records || history.records.length === 0) {
            container.innerHTML = `
                <div class="review-empty">
                    <p>暂无学习记录</p>
                    <p class="review-tip">每天学习并关闭页面后，历史记录会自动保存在这里</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.renderRecords(history.records);
        this.bindRecordClicks(history.records);
    },

    /**
     * 绑定记录点击事件
     */
    bindRecordClicks(records) {
        const container = document.getElementById('reviewContent');
        container.querySelectorAll('.review-record').forEach(el => {
            el.addEventListener('click', (e) => {
                // 防止点到内部句子或关闭按钮
                if (e.target.closest('.review-sentence-item') || e.target.closest('.review-close')) return;
                
                const index = parseInt(el.dataset.index);
                if (isNaN(index) || !records[index]) return;
                
                this.loadHistoryRecord(records[index]);
                this.closeReviewPanel();
            });
        });
    },

    /**
     * 加载历史记录到主界面
     */
    loadHistoryRecord(record) {
        this._activeHistoryDate = record.date;
        this._historyTextModified = false;  // 重置修改标记
        
        // 先缓存当天文本，以便恢复
        TextRenderer.cacheTodayText();
        
        // 加载单词到只读列表
        WordManager.loadHistoryWords(record);
        
        // 存储所有句子并显示第一个
        const sentences = record.sentences || [];
        this._historySentences = sentences;
        this._currentHistorySentenceIndex = 0;
        
        if (sentences.length > 0) {
            this.showHistorySentence(0);
        } else {
            TextRenderer.clearText();
            TextRenderer.hideSentenceNav();
        }
        
        // 显示"回到当天"按钮和历史标签，隐藏原标题
        document.getElementById('backToTodayBtn').style.display = 'flex';
        document.getElementById('navTitle').style.display = 'none';
        
        this.showToast(`正在查看 ${record.date} 的学习记录`, 'success');
        
        // 更新复习面板的活跃状态
        this.renderHistoryList();
    },

    /**
     * 切换显示历史记录中的指定句子
     * @param {number} index - 句子索引(0-based)
     */
    showHistorySentence(index) {
        const sentences = this._historySentences;
        if (!sentences || index < 0 || index >= sentences.length) return;
        
        this._currentHistorySentenceIndex = index;
        const sentence = sentences[index];
        
        // 清洗文本：复用 ApiRequest.parseContent() 统一清洗逻辑（兼容旧数据）
        const { text: cleanText } = ApiRequest.parseContent(sentence.text);
        
        // 加载句子到文本区域（历史文本默认未收藏）
        TextRenderer.saveCurrentText(
            cleanText,
            [],
            sentence.mode,
            cleanText
        );
        TextRenderer.renderText(cleanText, []);
        TextRenderer.updateStarButton(false);
        
        // 更新句子导航
        TextRenderer.showSentenceNav(index, sentences.length);
    },

    /**
     * 初始化句子导航按钮
     */
    initSentenceNav() {
        document.getElementById('prevSentenceBtn').addEventListener('click', () => {
            if (this._currentHistorySentenceIndex > 0) {
                this.showHistorySentence(this._currentHistorySentenceIndex - 1);
            }
        });
        
        document.getElementById('nextSentenceBtn').addEventListener('click', () => {
            const sentences = this._historySentences;
            if (sentences && this._currentHistorySentenceIndex < sentences.length - 1) {
                this.showHistorySentence(this._currentHistorySentenceIndex + 1);
            }
        });
    },

    /**
     * 保存对历史文本的修改（仅更新句子内容，不改变存档日期）
     */
    _saveModifiedHistory() {
        const currentText = TextRenderer.currentText;
        if (!currentText || !currentText.text) return;

        const history = DataStore.loadHistory();
        const recordIndex = history.records.findIndex(r => r.date === this._activeHistoryDate);
        if (recordIndex === -1) return;

        const record = history.records[recordIndex];
        const idx = this._currentHistorySentenceIndex;
        if (idx >= 0 && idx < (record.sentences || []).length) {
            // 只替换当前句子的文本，保留原始日期
            record.sentences[idx].text = currentText.text;
            record.sentences[idx].mode = currentText.mode;
            DataStore.saveHistory(history);
            console.log(`[History] 已保存历史存档修改: ${this._activeHistoryDate}`);
        }
        this._historyTextModified = false;
    },

    /**
     * 回到当天
     */
    backToToday() {
        // 如果历史文本被修改过，保存到历史存档
        if (this._activeHistoryDate && this._historyTextModified) {
            this._saveModifiedHistory();
        }

        this._activeHistoryDate = null;
        this._historySentences = null;
        this._currentHistorySentenceIndex = 0;
        
        // 恢复当天数据
        WordManager.restoreToday();
        TextRenderer.restoreTodayText();
        
        // 隐藏"回到当天"按钮和句子导航，恢复原标题
        document.getElementById('backToTodayBtn').style.display = 'none';
        document.getElementById('navTitle').style.display = 'inline';
        TextRenderer.hideSentenceNav();
        
        this.showToast('已回到今天', 'success');
        
        // 更新复习面板
        this.renderHistoryList();
    },

    /**
     * 初始化回到当天按钮
     */
    initBackToToday() {
        document.getElementById('backToTodayBtn').addEventListener('click', () => {
            this.backToToday();
        });
    },

    /**
     * 渲染记录列表
     */
    renderRecords(records) {
        return records.map((record, index) => {
            const allWords = [...(record.reviewWords || []), ...(record.newWords || [])];
            const sentences = record.sentences || [];
            
            const wordsHtml = allWords.map(word => {
                const isNew = record.newWords && record.newWords.includes(word);
                const typeClass = isNew ? 'new' : 'review';
                return `<span class="review-word-tag ${typeClass}">${word}</span>`;
            }).join('');
            
            const sentencesHtml = sentences.map(s => {
                const modeText = s.mode === 'chinese' ? '中文主线' : '纯英文';
                return `
                    <div class="review-sentence-item">
                        <div class="review-sentence-mode">${modeText}</div>
                        <div class="review-sentence-text">${s.text.substring(0, 200)}${s.text.length > 200 ? '...' : ''}</div>
                    </div>
                `;
            }).join('');
            
            const isActive = this._activeHistoryDate === record.date;
            
            return `
                <div class="review-record ${isActive ? 'active' : ''}" data-index="${index}">
                    <div class="review-record-date">
                        <span>${record.date}</span>
                        <span class="review-record-stats">${allWords.length}词 · ${sentences.length}句</span>
                    </div>
                    ${isActive ? '<div class="review-record-badge">当前查看</div>' : ''}
                    <div class="review-record-words">
                        ${wordsHtml || '<span style="color:var(--text-secondary);font-size:12px;">无单词记录</span>'}
                    </div>
                    ${sentencesHtml ? `<div class="review-record-sentences">${sentencesHtml}</div>` : ''}
                </div>
            `;
        }).join('');
    },

    /**
     * 打开设置面板
     */
    openSettings() {
        document.getElementById('settingsPanel').classList.add('open');
        document.getElementById('settingsOverlay').classList.add('open');
        document.getElementById('mainContent').classList.add('settings-open');

        // 加载开关状态
        this._loadToggleStates();

        // 设置面板手势关闭（移动端 touch 向下滑动关闭）
        this._initSettingsSwipeClose();
    },

    /**
     * 初始化自定义下拉菜单
     */
    initCustomDropdowns() {
        const dropdowns = document.querySelectorAll('.custom-dropdown');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.dropdown-menu');
            const valueSpan = dropdown.querySelector('.dropdown-value');
            const items = dropdown.querySelectorAll('.dropdown-item');
            const hiddenSelect = dropdown.querySelector('select');
            
            if (!trigger || !menu) return;
            
            // 将菜单移到 body 下，避免被父容器 overflow:hidden 裁剪
            const menuId = 'dropdown-menu-' + Math.random().toString(36).substr(2, 9);
            menu.id = menuId;
            document.body.appendChild(menu);
            
            // 点击触发器切换菜单
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // 关闭其他已打开的 dropdown
                document.querySelectorAll('.dropdown-menu.open').forEach(m => {
                    if (m !== menu) {
                        m.classList.remove('open');
                        const otherTrigger = m._trigger;
                        if (otherTrigger) otherTrigger.classList.remove('open');
                    }
                });
                
                // 定位菜单到触发器下方，动态计算确保不超出视口
                const rect = trigger.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                // 菜单宽度 = trigger宽度，但不超过右边可用空间（留16px边距）
                const availableWidth = viewportWidth - rect.left - 16;
                const menuWidth = Math.min(rect.width, availableWidth);
                menu.style.position = 'fixed';
                menu.style.top = (rect.bottom + 4) + 'px';
                menu.style.left = rect.left + 'px';
                menu.style.width = menuWidth + 'px';
                menu.style.maxWidth = 'none';
                menu.style.boxSizing = 'border-box';
                menu.style.zIndex = '9999';
                
                trigger.classList.toggle('open');
                menu.classList.toggle('open');
            });
            
            // 记录触发器引用，用于关闭时同步
            menu._trigger = trigger;
            
            // 点击选项
            items.forEach(item => {
                item.addEventListener('click', () => {
                    const value = item.dataset.value;
                    const text = item.textContent.trim();
                    
                    // 更新显示值
                    valueSpan.textContent = text;
                    
                    // 更新 active 状态
                    items.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    
                    // 同步隐藏的 select
                    if (hiddenSelect) {
                        hiddenSelect.value = value;
                        hiddenSelect.dispatchEvent(new Event('change'));
                    }
                    
                    // 关闭菜单
                    trigger.classList.remove('open');
                    menu.classList.remove('open');
                });
            });
        });
        
        // 点击页面其他地方关闭所有 dropdown
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu.open').forEach(m => {
                m.classList.remove('open');
                const trigger = m._trigger;
                if (trigger) trigger.classList.remove('open');
            });
        });
    },

    /**
     * 初始化设置面板下滑手势关闭（仅绑定一次）
     */
    _initSettingsSwipeClose() {
        if (this._settingsSwipeBound) return;
        this._settingsSwipeBound = true;

        const settingsPanel = document.getElementById('settingsPanel');
        if (!settingsPanel) return;

        let touchStartY = 0;
        settingsPanel.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        settingsPanel.addEventListener('touchmove', (e) => {
            // 仅记录，不阻止默认行为
        }, { passive: true });
        settingsPanel.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchEndY - touchStartY;
            if (deltaY > 80) {
                this.closeSettings();
            }
        }, { passive: true });
    },

    /**
     * 关闭设置面板
     */
    closeSettings() {
        document.getElementById('settingsPanel').classList.remove('open');
        document.getElementById('settingsOverlay').classList.remove('open');
        document.getElementById('mainContent').classList.remove('settings-open');
    },

    /**
     * 加载所有开关状态
     */
    _loadToggleStates() {
        const config = typeof ConfigManager !== 'undefined' ? ConfigManager.loadConfig() : {};
        
        // 非导入词释义查询开关
        const lookupToggle = document.getElementById('enableNonImportedLookup');
        if (lookupToggle) {
            lookupToggle.checked = config.enableNonImportedWordLookup === true;
        }
    },

    /**
     * 初始化词书管理设置事件
     */
    _initVocabSettingsEvents() {
        // 非导入词释义查询开关变更保存
        const lookupToggle = document.getElementById('enableNonImportedLookup');
        if (lookupToggle) {
            // 移除旧监听避免重复
            const newToggle = lookupToggle.cloneNode(true);
            lookupToggle.parentNode.replaceChild(newToggle, lookupToggle);
            
            newToggle.addEventListener('change', () => {
                typeof ConfigManager !== 'undefined' && ConfigManager.saveConfig('enableNonImportedWordLookup', newToggle.checked);
            });
        }
    },

    /**
     * 初始化单词点击事件（支持导入单词和非导入单词）
     */
    initWordClick() {
        document.getElementById('textDisplay').addEventListener('click', async (e) => {
            try {
                // —— 情况1：点击的是已导入的加粗单词 ——
                const wordElement = e.target.closest('.highlight-word');
                
                if (wordElement) {
                    e.stopPropagation();
                    const word = wordElement.dataset.word;
                    
                    // 如果已有卡片显示，先收起
                    if (this.currentCard) {
                        this.hideSimpleCard();
                    }
                    
                    // 如果点击的是同一个单词，只收起
                    if (this.currentWordElement === wordElement) {
                        this.currentWordElement = null;
                        return;
                    }
                    
                    // 显示新卡片
                    this.currentWordElement = wordElement;
                    this.showSimpleCard(word, wordElement);
                    return;
                }
                
                // —— 情况2：点击的是未导入的普通英文单词（需开启开关） ——
                const display = document.getElementById('textDisplay');
                if (display.contains(e.target) && !e.target.closest('.text-empty') && !e.target.closest('.pagination')) {
                    const word = this._extractWordAtClick(e);
                    if (word && word.length >= 2 && /^[a-zA-Z][a-zA-Z'-]*[a-zA-Z']$|^[a-zA-Z]$/i.test(word)) {
                        const nearestSpan = e.target.closest('span');
                        if (nearestSpan && nearestSpan.dataset.word) return;
                        
                        // 检查开关：未开启则无任何反应
                        const config = typeof ConfigManager !== 'undefined' ? ConfigManager.loadConfig() : {};
                        if (!config.enableNonImportedWordLookup) return;
                        
                        e.stopPropagation();
                        
                        if (this.currentCard) {
                            this.hideSimpleCard();
                            this.currentWordElement = null;
                        }
                        
                        await this._showNonImportedWordPopup(word.toLowerCase(), e);
                    }
                }
            } catch (err) {
                console.error('单词点击处理异常:', err);
                InteractionManager.showToast('操作异常，请重试', 'error');
            }
        });
    },

    /**
     * 从点击位置提取单词（处理文本节点）
     * @param {MouseEvent} e - 点击事件
     * @returns {string|null} 提取的单词
     */
    _extractWordAtClick(e) {
        try {
            // 兼容 Chrome (caretRangeFromPoint) 和 Firefox (caretPositionFromPoint)
            const range = document.caretRangeFromPoint
                ? document.caretRangeFromPoint(e.clientX, e.clientY)
                : (() => {
                    const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
                    if (!pos) return null;
                    const r = document.createRange();
                    r.setStart(pos.offsetNode, pos.offset);
                    return r;
                })();
            if (range && range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
                const textNode = range.startContainer;
                const offset = range.startOffset;
                const text = textNode.textContent || '';
                
                // 从点击位置向前后查找单词边界
                let start = offset;
                let end = offset;
                while (start > 0 && /[a-zA-Z']/.test(text[start - 1])) start--;
                while (end < text.length && /[a-zA-Z']/.test(text[end])) end++;
                
                if (end > start) {
                    return text.substring(start, end);
                }
            }
        } catch (err) {
            // caretRangeFromPoint 在某些浏览器或场景下不可用
        }
        return null;
    },

    /**
     * 非导入单词被点击：调用有道API查询并显示弹窗
     * @param {string} word - 单词
     * @param {MouseEvent} e - 点击事件
     */
    async _showNonImportedWordPopup(word, e) {
        // 先显示查询中提示
        InteractionManager.showToast(`正在查询 "${word}" 的释义...`, 'info');
        
        try {
            // 从现有 VocabSearch 直接调用 API 获取释义
            if (typeof VocabSearch !== 'undefined') {
                // 调用 获取释义（await 等待完成后直接使用数据）
                await VocabSearch.fetchApiData(word);
                
                const apiData = VocabSearch.apiData;
                if (apiData) {
                    // 成功获取到数据，直接显示弹窗（没有先卡片的闪现）
                    this.hideSimpleCard();
                    // 记录查询历史
                    DataStore.addQueryHistory(word);
                    this.showDetailPopup(word, { youdaoData: apiData, fromClick: true });
                    return;
                } else {
                    // API 返回空数据
                    InteractionManager.showToast(`"${word}" 未找到释义`, 'warning');
                    return;
                }
            }
            
            // API不可用
            InteractionManager.showToast(`"${word}" 查询失败，请检查网络或API配置`, 'error');
        } catch (e) {
            console.error('非导入单词查询失败:', e);
            InteractionManager.showToast('查询失败', 'error');
        }
    },

    /**
     * 初始化空白区域点击（收起卡片）
     */
    initBlankClick() {
        document.addEventListener('click', (e) => {
            // 如果点击的不是单词或卡片，收起卡片
            if (!e.target.closest('.highlight-word') && !e.target.closest('.word-card')) {
                this.hideSimpleCard();
                this.currentWordElement = null;
            }
        });
    },

    /**
     * 初始化弹窗关闭
     */
    initPopupClose() {
        document.getElementById('popupClose').addEventListener('click', () => {
            this.hideDetailPopup();
        });
        
        // 点击弹窗外部关闭
        document.getElementById('detailPopup').addEventListener('click', (e) => {
            if (e.target.id === 'detailPopup') {
                this.hideDetailPopup();
            }
        });
    },

    /**
     * 展示简易卡片
     * @param {string} word - 单词
     * @param {Element} element - 单词元素
     */
    showSimpleCard(word, element) {
        const card = document.getElementById('wordCard');
        
        // 【数据隔离】从当前活跃词单获取单词详情
        const activeList = WordManager._getActiveWordList();
        const wordDetails = activeList.wordDetails[word] || {};
        const pos = wordDetails.pos || '';
        const translation = wordDetails.translation || '（暂无释义）';
        
        // 设置卡片内容
        document.getElementById('cardPos').textContent = pos;
        document.getElementById('cardTranslation').textContent = translation;
        
        // —— 添加卡片发音按钮（仅创建一次） ——
        const cardPosEl = document.getElementById('cardPos');
        let cardSpeakBtn = cardPosEl.parentNode.querySelector('.card-speak-btn');
        if (!cardSpeakBtn) {
            cardSpeakBtn = document.createElement('button');
            cardSpeakBtn.className = 'card-speak-btn';
            cardSpeakBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
            cardSpeakBtn.title = '朗读发音';
            cardPosEl.parentNode.insertBefore(cardSpeakBtn, cardPosEl.nextSibling);
        }
        cardSpeakBtn.onclick = (e) => {
            e.stopPropagation();
            const word = this.currentWordElement ? this.currentWordElement.dataset.word : document.getElementById('popupWord').textContent;
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        };
        
        // 计算卡片位置（相对于视口，考虑滚动）
        const rect = element.getBoundingClientRect();
        const cardWidth = 200;
        const cardHeight = 50;
        const margin = 8;
        
        let left = rect.left;
        let top = rect.bottom + margin;
        
        // 防止超出屏幕右侧
        if (left + cardWidth > window.innerWidth - margin) {
            left = window.innerWidth - cardWidth - margin;
        }
        if (left < margin) {
            left = margin;
        }
        
        // 防止超出屏幕底部（优先显示在上方）
        if (top + cardHeight > window.innerHeight - margin) {
            top = rect.top - cardHeight - margin;
        }
        if (top < margin) {
            top = margin;
        }
        
        // 设置卡片位置（使用 fixed 定位相对于视口）
        card.style.position = 'fixed';
        card.style.left = `${left}px`;
        card.style.top = `${top}px`;
        card.style.display = 'block';
        
        this.currentCard = card;
        
        // 绑定三点按钮事件
        document.getElementById('cardMoreBtn').onclick = () => {
            this.showDetailPopup(word);
        };
        
        // 如果没有释义，尝试从API返回中获取
        if (!wordDetails.translation && TextRenderer.currentText) {
            const mappings = ApiRequest.extractWordMappings(TextRenderer.currentText.rawContent || '');
            if (mappings[word]) {
                document.getElementById('cardPos').textContent = mappings[word].pos;
                document.getElementById('cardTranslation').textContent = mappings[word].translation;
                
                // 更新单词详情
                WordManager.updateWordDetail(word, mappings[word]);
            }
        }
    },

    /**
     * 收起简易卡片
     */
    hideSimpleCard() {
        if (this.currentCard) {
            this.currentCard.style.display = 'none';
            this.currentCard = null;
        }
    },

    /**
     * 展示详情弹窗
     * @param {string} word - 单词
     * @param {Object} [options] - 可选参数
     * @param {Object} [options.youdaoData] - 有道API返回的数据（非导入单词）
     * @param {boolean} [options.fromClick] - 是否从文本点击触发
     */
    showDetailPopup(word, options = {}) {
        const popup = document.getElementById('detailPopup');
        
        document.getElementById('popupWord').textContent = word;
        
        // —— 添加发音按钮（仅创建一次） ——
        const popupWordEl = document.getElementById('popupWord');
        let speakBtn = popupWordEl.parentNode.querySelector('.popup-speak-btn');
        if (!speakBtn) {
            speakBtn = document.createElement('button');
            speakBtn.className = 'popup-speak-btn';
            speakBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
            speakBtn.title = '朗读发音';
            popupWordEl.parentNode.insertBefore(speakBtn, popupWordEl.nextSibling);
        }
        speakBtn.onclick = (e) => {
            e.stopPropagation();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        };
        
        const translationsContainer = document.getElementById('popupTranslations');
        
        // —— 来自非导入单词的点击查询（有道API数据） ——
        if (options.fromClick && options.youdaoData) {
            const youdao = options.youdaoData;
            document.getElementById('popupPhonetic').textContent = '';
            
            // 解析所有条目的释义，按词性合并
            const entries = youdao.entries || [];
            if (entries.length > 0) {
                // 收集所有条目解析后的释义项
                const parsedItems = [];
                for (const entry of entries) {
                    const explain = entry.explain || '';
                    if (!explain) continue;
                    
                    const parsed = typeof VocabSearch !== 'undefined'
                        ? VocabSearch.parseProxyMeanings(explain)
                        : [];
                    
                    for (const item of parsed) {
                        parsedItems.push({
                            pos: item.partOfSpeech,
                            definitions: item.definitions.map(d => d.definition)
                        });
                    }
                }
                
                if (parsedItems.length > 0) {
                    // 按词性合并（保留首次出现的顺序）
                    const merged = new Map();
                    const posOrder = [];  // 记录词性出现顺序
                    for (const item of parsedItems) {
                        if (!merged.has(item.pos)) {
                            merged.set(item.pos, []);
                            posOrder.push(item.pos);
                        }
                        merged.get(item.pos).push(...item.definitions);
                    }
                    
                    // 构建HTML：每张卡片显示一个词性，同一词性的释义用分号分隔
                    const html = posOrder.map(pos => {
                        const allDefs = merged.get(pos);
                        return `<div class="popup-translation-item">
                            <span class="popup-translation-pos">${pos}</span>
                            <span class="popup-translation-text">${allDefs.join('；')}</span>
                        </div>`;
                    }).join('');
                    translationsContainer.innerHTML = html;
                } else {
                    translationsContainer.innerHTML = '<div class="popup-translation-item">暂无释义</div>';
                }
            } else {
                translationsContainer.innerHTML = '<div class="popup-translation-item">暂无释义</div>';
            }
            
            document.getElementById('popupExtra').textContent = '非词库单词，快速查询结果';
            // 隐藏"拓展补充"标题
            const extraSection = document.getElementById('popupExtra').closest('.popup-section');
            if (extraSection) extraSection.style.display = 'none';
            
            // 添加"加入词本"按钮
            const popupBody = document.querySelector('.popup-body');
            // 移除已有的加入词本区域（避免重复）
            const existingBar = popupBody.querySelector('.popup-add-to-wordbook');
            if (existingBar) existingBar.remove();
            
            const addBar = document.createElement('div');
            addBar.className = 'popup-add-to-wordbook';
            addBar.style.cssText = 'margin-top:12px;padding-top:12px;border-top:0.5px solid var(--border-light);display:flex;align-items:center;gap:8px;';
            
            const addSelect = document.createElement('select');
            addSelect.id = 'popupAddWordbookSelect';
            addSelect.style.cssText = 'flex:1;padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;font-size:12px;background:var(--bg-primary);color:var(--text-primary);';
            
            const books = DataStore.getWordBooks();
            if (books.length === 0) {
                addSelect.innerHTML = '<option value="">-- 暂无词本，请先创建 --</option>';
            } else {
                addSelect.innerHTML = '<option value="">-- 选择词本 --</option>' + 
                    books.map(b => `<option value="${b.id}">${b.name} (${b.wordCount}词)</option>`).join('');
            }
            
            const addBtn = document.createElement('button');
            addBtn.textContent = '加入词本';
            addBtn.style.cssText = 'padding:6px 14px;background:var(--accent-color);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;';
            addBtn.onclick = () => {
                const bookId = addSelect.value;
                if (!bookId) {
                    InteractionManager.showToast('请先选择一个词本', 'warning');
                    return;
                }
                const word = document.getElementById('popupWord').textContent;
                const phonetic = document.getElementById('popupPhonetic').textContent;
                // 从释义区域提取释义文本
                const transEls = document.querySelectorAll('.popup-translation-item');
                let meanings = '';
                transEls.forEach(el => {
                    const pos = el.querySelector('.popup-translation-pos');
                    const text = el.querySelector('.popup-translation-text');
                    if (pos && text) meanings += pos.textContent + ' ' + text.textContent + '; ';
                });
                if (meanings.endsWith('; ')) meanings = meanings.slice(0, -2);
                
                DataStore.addWordToBook(bookId, { word, phonetic, meanings });
                InteractionManager.showToast(`已加入词本`, 'success');
            };
            
            addBar.appendChild(addSelect);
            addBar.appendChild(addBtn);
            popupBody.appendChild(addBar);
        } else {
            // —— 已导入单词的弹窗（原有逻辑） ——
            const activeList = WordManager._getActiveWordList();
            const wordDetails = activeList.wordDetails[word] || {};
            document.getElementById('popupPhonetic').textContent = wordDetails.phonetic || '';
            
            // 显示"拓展补充"标题
            const extraSection = document.getElementById('popupExtra').closest('.popup-section');
            if (extraSection) extraSection.style.display = '';
            
            if (wordDetails.fullTranslation) {
                const translations = wordDetails.fullTranslation.split('\n');
                const html = translations.map(t => {
                    const match = t.match(/^([a-z]+\.)\s*(.*)$/i);
                    if (match) {
                        return `<div class="popup-translation-item">
                            <span class="popup-translation-pos">${match[1]}</span>
                            <span class="popup-translation-text">${match[2]}</span>
                        </div>`;
                    }
                    return `<div class="popup-translation-item">
                        <span class="popup-translation-text">${t}</span>
                    </div>`;
                }).join('');
                translationsContainer.innerHTML = html;
            } else if (wordDetails.translation) {
                translationsContainer.innerHTML = `<div class="popup-translation-item">
                    <span class="popup-translation-pos">${wordDetails.pos || ''}</span>
                    <span class="popup-translation-text">${wordDetails.translation}</span>
                </div>`;
            } else {
                translationsContainer.innerHTML = '<div class="popup-translation-item">暂无释义</div>';
            }
            
            document.getElementById('popupExtra').textContent = wordDetails.extra || '暂无拓展信息';
        }
        
        popup.style.display = 'flex';
        this.hideSimpleCard();
    },

    /**
     * 关闭详情弹窗
     */
    hideDetailPopup() {
        document.getElementById('detailPopup').style.display = 'none';
    },

    /**
     * 显示提示弹窗
     * @param {string} message - 提示消息
     * @param {string} type - 类型 ('success' | 'warning' | 'error' | 'info')
     * @param {number} duration - 显示时长（毫秒）
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('toastPopup');
        
        // 设置类型
        toast.className = `toast-popup ${type}`;
        
        // 设置消息
        document.getElementById('toastMessage').textContent = message;
        
        // 显示
        toast.style.display = 'block';
        
        // 自动隐藏
        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    },

    /**
     * 显示加载遮罩
     * @param {string} text - 加载文本
     */
    showLoading(text = 'AI正在生成文本...') {
        document.getElementById('loadingOverlay').style.display = 'flex';
        document.querySelector('.loading-text').textContent = text;
    },

    /**
     * 隐藏加载遮罩
     */
    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    },

    /**
     * 绑定配置区事件
     */
    bindConfigEvents() {
        // 模型预设切换
        document.getElementById('modelPreset').addEventListener('change', (e) => {
            const presetKey = e.target.value;
            const preset = ConfigManager.switchModelPreset(presetKey);
            if (preset) {
                // 自动填充 API 地址
                document.getElementById('apiUrl').value = preset.url;
                this.showToast(`已切换到 ${preset.name}`, 'success');
            }
        });

        // API配置保存
        document.getElementById('saveApiBtn').addEventListener('click', () => {
            const apiUrl = document.getElementById('apiUrl').value;
            const apiKey = document.getElementById('apiKey').value;
            const apiTimeout = parseInt(document.getElementById('apiTimeout').value) || 30000;
            const modelPreset = document.getElementById('modelPreset').value;
            const model = ConfigManager.MODEL_PRESETS[modelPreset]?.model || 'deepseek-chat';
            
            ConfigManager.setApiConfig({
                url: apiUrl,
                key: apiKey,
                timeout: apiTimeout,
                modelPreset: modelPreset,
                model: model
            });
            
            this.showToast('API配置已保存', 'success');
        });
        
        // API测试
        document.getElementById('testApiBtn').addEventListener('click', async () => {
            this.showLoading('正在测试API连接...');
            
            const result = await ConfigManager.testApiConnection();
            
            this.hideLoading();
            this.showToast(result.message, result.success ? 'success' : 'error');
        });
        
        // 高亮样式切换
        document.querySelectorAll('.highlight-btn').forEach(btn => {
            // 鼠标移动光晕效果
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                btn.style.setProperty('--mouse-x', x + 'px');
                btn.style.setProperty('--mouse-y', y + 'px');
            });
            
            // 点击涟漪效果
            btn.addEventListener('click', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                btn.style.setProperty('--click-x', x + 'px');
                btn.style.setProperty('--click-y', y + 'px');
                
                // 添加点击动画类
                btn.classList.add('clicked');
                setTimeout(() => {
                    btn.classList.remove('clicked');
                }, 600);
                
                // 切换激活状态
                document.querySelectorAll('.highlight-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                ConfigManager.setHighlightStyle(btn.dataset.style);
                
                // 如果有文本，重新渲染
                if (TextRenderer.currentText && TextRenderer.currentText.text) {
                    TextRenderer.renderText(TextRenderer.currentText.text, TextRenderer.currentText.rareWords);
                }
            });
        });
        
        // 保存路径设置
        document.getElementById('savePath').addEventListener('change', () => {
            ConfigManager.setSavePath(document.getElementById('savePath').value);
        });
        
        // 查询历史上限设置
        const limitInput = document.getElementById('queryHistoryLimit');
        if (limitInput) {
            limitInput.value = ConfigManager.getQueryHistoryLimit();
            limitInput.addEventListener('change', () => {
                const val = parseInt(limitInput.value) || 200;
                ConfigManager.setQueryHistoryLimit(Math.max(50, Math.min(1000, val)));
            });
        }

        // 设置面板退出登录按钮
        const logoutBtn = document.getElementById('settingsLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                UserManager.logout();
                this.closeSettings();
                window.App.showLoginScreen();
            });
        }
    },

    /**
     * 绑定历史记录事件
     */
    bindHistoryEvents() {
        document.getElementById('historyList').addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                // 移除其他选中状态
                document.querySelectorAll('.history-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // 设置选中状态
                historyItem.classList.add('active');
                
                // 通过日期查找完整记录对象
                const date = historyItem.dataset.date;
                const fullHistory = DataStore.loadHistory();
                const record = fullHistory.records.find(r => r.date === date);
                if (record) {
                    this.loadHistoryRecord(record);
                }
            }
        });
    },

    /**
     * 渲染历史记录列表
     */
    renderHistoryList() {
        const container = document.getElementById('historyList');
        const history = DataStore.loadHistory();
        
        if (history.records.length === 0) {
            container.innerHTML = '<div class="history-empty">暂无历史记录</div>';
            return;
        }
        
        const html = history.records.map(record => `
            <div class="history-item" data-date="${record.date}">
                <span class="history-date">${record.date}</span>
                <span class="history-info">${record.totalWords}词 · ${record.versions?.length || 0}版本</span>
            </div>
        `).join('');
        
        container.innerHTML = html;
    },

    // ========== 汉堡菜单（移动端侧边栏） ==========
    initHamburgerMenu() {
        const hamburger = document.getElementById('hamburgerBtn');
        const sidebar = document.getElementById('sidebarLeft');
        const overlay = document.getElementById('sidebarOverlay');

        if (!hamburger || !sidebar) return;

        const openSidebar = () => {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
        };

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        };

        // 汉堡按钮点击打开
        hamburger.addEventListener('click', openSidebar);

        // 遮罩点击关闭
        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }

        // ESC关闭侧边栏
        if (!this._sidebarEscBound) {
            this._sidebarEscBound = true;
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                    closeSidebar();
                }
            });
        }

        // 侧边栏内点击关闭（用于在手机上快速关闭）
        sidebar.addEventListener('click', (e) => {
            // 只在点击侧边栏空白区域时关闭，不干扰内部按钮
            if (e.target === sidebar || e.target.closest('.history-section') === null && 
                e.target.closest('.word-list-section') === null) {
                // 点击具体交互元素不要关闭
            }
        });

        // 侧边栏手势关闭（移动端 touch 向右滑动关闭）
        let sidebarTouchStartX = 0;
        sidebar.addEventListener('touchstart', (e) => {
            sidebarTouchStartX = e.touches[0].clientX;
        }, { passive: true });
        sidebar.addEventListener('touchmove', (e) => {
            // 仅记录，不阻止默认行为
        }, { passive: true });
        sidebar.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const deltaX = touchEndX - sidebarTouchStartX;
            if (deltaX > 80) {
                closeSidebar();
            }
        }, { passive: true });

        console.log('[Mobile] 汉堡菜单已初始化');
    },

    // ========== 词本管理 ==========
    initWordBookManagement() {
        const overlay = document.getElementById('wordbookOverlay');
        if (!overlay) return;
        document.getElementById('wordbookClose').addEventListener('click', () => this.hideWordBookPopup());
        document.getElementById('wordbookCreateBtn').addEventListener('click', () => this._createWordBook());
        document.getElementById('wordbookNewName').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._createWordBook();
        });
        document.getElementById('wordbookBackBtn').addEventListener('click', () => {
            document.getElementById('wordbookDetail').style.display = 'none';
            document.getElementById('wordbookBody').style.display = '';
        });
        document.getElementById('wordbookHistoryBtn').addEventListener('click', () => this._showQueryHistory());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.hideWordBookPopup();
        });
        
        // 查询历史弹窗关闭 - 移到 init 避免 onclick 被覆盖
        const historyOverlay = document.getElementById('queryHistoryOverlay');
        document.getElementById('queryHistoryClose').addEventListener('click', () => {
            historyOverlay.style.display = 'none';
        });
        historyOverlay.addEventListener('click', (e) => {
            if (e.target === historyOverlay) historyOverlay.style.display = 'none';
        });
    },
    showWordBookPopup() {
        document.getElementById('wordbookOverlay').style.display = 'flex';
        document.getElementById('wordbookBody').style.display = '';
        document.getElementById('wordbookDetail').style.display = 'none';
        this._renderWordBookList();
    },
    hideWordBookPopup() {
        document.getElementById('wordbookOverlay').style.display = 'none';
    },
    _createWordBook() {
        const input = document.getElementById('wordbookNewName');
        const name = input.value.trim();
        if (!name) { InteractionManager.showToast('请输入词本名称', 'warning'); return; }
        DataStore.createWordBook(name);
        input.value = '';
        this._renderWordBookList();
        InteractionManager.showToast(`词本 "${name}" 已创建`, 'success');
    },
    _renderWordBookList() {
        const list = document.getElementById('wordbookList');
        const books = DataStore.getWordBooks();
        if (books.length === 0) {
            list.innerHTML = '<div class="wordbook-word-empty">还没有词本，新建一个吧 📚</div>';
            return;
        }
        list.innerHTML = books.map(b => `
            <div class="wordbook-list-item" data-id="${b.id}">
                <div class="wordbook-list-item-info">
                    <div class="wordbook-list-item-name">${b.name}</div>
                    <div class="wordbook-list-item-meta">${b.wordCount} 个单词 · ${new Date(b.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="wordbook-list-item-actions">
                    <button class="wordbook-list-item-btn select-btn" data-action="select" data-id="${b.id}">选择</button>
                    <button class="wordbook-list-item-btn rename-btn" data-action="rename" data-id="${b.id}">✏️</button>
                    <button class="wordbook-list-item-btn delete-btn" data-action="delete" data-id="${b.id}">🗑️</button>
                </div>
            </div>
        `).join('');
        
        // Event delegation for wordbook list actions
        list.addEventListener('click', (e) => {
            const btn = e.target.closest('.wordbook-list-item-btn');
            if (!btn) {
                // Click on item itself - show detail
                const item = e.target.closest('.wordbook-list-item');
                if (item) this._showWordBookDetail(item.dataset.id);
                return;
            }
            const id = btn.dataset.id;
            const action = btn.dataset.action;
            if (action === 'select') this._selectWordBook(id);
            else if (action === 'delete') this._deleteWordBook(id);
            else if (action === 'rename') this._renameWordBook(id);
        });
    },
    _selectWordBook(bookId) {
        const book = DataStore.getWordBook(bookId);
        if (!book) return;
        // Set as currently selected custom book
        this._selectedCustomBook = book;
        this.hideWordBookPopup();
        InteractionManager.showToast(`已选择词本: ${book.name}`, 'success');
        // Enable source toggle to show "custom" is active
        document.querySelectorAll('.source-toggle-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.source-toggle-btn[data-source="custom"]').classList.add('active');
        this._currentSource = 'custom';
    },
    _deleteWordBook(bookId) {
        const book = DataStore.getWordBook(bookId);
        if (!book) return;
        if (confirm(`确定要删除词本 "${book.name}" 吗？此操作不可撤销。`)) {
            DataStore.deleteWordBook(bookId);
            this._renderWordBookList();
            InteractionManager.showToast(`词本 "${book.name}" 已删除`, 'success');
        }
    },
    _renameWordBook(bookId) {
        const book = DataStore.getWordBook(bookId);
        if (!book) return;
        const newName = prompt('请输入新名称：', book.name);
        if (newName && newName.trim() && newName.trim() !== book.name) {
            DataStore.renameWordBook(bookId, newName.trim());
            this._renderWordBookList();
        }
    },
    _showWordBookDetail(bookId) {
        const book = DataStore.getWordBook(bookId);
        if (!book) return;
        document.getElementById('wordbookBody').style.display = 'none';
        document.getElementById('wordbookDetail').style.display = '';
        document.getElementById('wordbookDetailTitle').textContent = `📖 ${book.name}`;
        const wordList = document.getElementById('wordbookWordList');
        
        if (!book.words || book.words.length === 0) {
            wordList.innerHTML = '<div class="wordbook-word-empty">暂无单词</div>';
            return;
        }
        
        wordList.innerHTML = book.words.map(w => {
            const addedDate = new Date(w.addedAt).toLocaleDateString();
            const queryInfo = w.queryCount > 1 ? `<span class="history-item-status">已查 ${w.queryCount} 次</span>` : '';
            return `<div class="wordbook-word-item">
                <div class="wordbook-word-item-info">
                    <div class="wordbook-word-item-word">${w.word}</div>
                    <div class="wordbook-word-item-meta">${w.meanings || ''} · ${addedDate}</div>
                </div>
                ${queryInfo}
            </div>`;
        }).join('');
        
        document.getElementById('wordbookDetailDelete').onclick = () => this._deleteWordBook(bookId);
    },
    _showQueryHistory() {
        const overlay = document.getElementById('queryHistoryOverlay');
        const body = document.getElementById('queryHistoryBody');
        overlay.style.display = 'flex';
        
        const history = DataStore.loadQueryHistory();
        
        // Check which words are in any word book
        const allBooks = DataStore.loadWordBooks();
        const bookWords = new Set();
        allBooks.books.forEach(b => b.words.forEach(w => bookWords.add(w.word.toLowerCase())));
        
        if (history.length === 0) {
            body.innerHTML = '<div class="history-empty">暂无查询历史</div>';
            return;
        }
        
        body.innerHTML = history.map(h => {
            const isInBook = bookWords.has(h.word.toLowerCase());
            const time = new Date(h.timestamp).toLocaleString();
            const statusHtml = isInBook ? '<span class="history-item-status">已收藏</span>' : '';
            return `<div class="history-item">
                <span class="history-item-word">${h.word}</span>
                <span class="history-item-time">${time}</span>
                ${statusHtml}
            </div>`;
        }).join('');
    },

    // ========== 词源切换 ==========
    initSourceToggle() {
        const toggle = document.getElementById('sourceToggle');
        if (!toggle) return;
        
        // 给每个按钮单独绑定点击事件，避免 img 图标拦截
        toggle.querySelectorAll('.source-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const source = btn.dataset.source;
                this._currentSource = source;
                
                toggle.querySelectorAll('.source-toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (source === 'custom') {
                    if (!this._selectedCustomBook) {
                        this.showWordBookPopup();
                    }
                }
            });
        });
    },
};

// 导出模块
window.InteractionManager = InteractionManager;