const VocabLearning = {
    _initialized: false,

    init() {
        if (this._initialized) return;
        this._bindEvents();
        this._initialized = true;
        console.log('[VocabLearning] 学习页面模块已初始化');
    },

    show() {
        const root = document.getElementById('vocabLearningRoot');
        if (!root) return;
        const mainContent = document.querySelector('.main-content');
        if (mainContent) mainContent.style.display = 'none';
        root.classList.add('active');
        this._renderHomeTab();
    },

    hide() {
        const root = document.getElementById('vocabLearningRoot');
        if (!root) return;
        root.classList.remove('active');
        const mainContent = document.querySelector('.main-content');
        if (mainContent) mainContent.style.display = '';
    },

    _renderHomeTab() {
        const container = document.getElementById('vlHomeContent');
        if (!container) return;

        const stats = LearningEngine.getStats();
        const dueCount = LearningEngine.getDueCount();
        const learningCount = LearningEngine.getLearningCount();
        const masteredCount = LearningEngine.getMasteredCount();

        container.innerHTML = `
            <div class="vl-stats-grid">
                <div class="vl-stat-card">
                    <div class="vl-stat-number">${dueCount}</div>
                    <div class="vl-stat-label">待复习</div>
                </div>
                <div class="vl-stat-card">
                    <div class="vl-stat-number">${learningCount}</div>
                    <div class="vl-stat-label">学习中</div>
                </div>
                <div class="vl-stat-card">
                    <div class="vl-stat-number">${masteredCount}</div>
                    <div class="vl-stat-label">已掌握</div>
                </div>
            </div>
            <div style="text-align:center;margin-bottom:20px;">
                <span class="vl-streak-badge">🔥 连续学习 ${stats.streak} 天</span>
            </div>
            <div class="vl-action-group">
                <button class="vl-action-btn vl-btn-primary" id="vlStartReviewBtn">
                    📖 开始复习 (${dueCount})
                </button>
                <button class="vl-action-btn vl-btn-secondary" id="vlStartNewBtn">
                    ✨ 学习新词
                </button>
                <button class="vl-action-btn vl-btn-secondary" id="vlPracticeBtn">
                    🎯 多种练习
                </button>
                <button class="vl-action-btn vl-btn-secondary" id="vlDictationBtn">
                    ✍️ 默写练习
                </button>
            </div>
        `;

        document.getElementById('vlStartReviewBtn').addEventListener('click', () => {
            this._startReview();
        });
        document.getElementById('vlStartNewBtn').addEventListener('click', () => {
            this._startNewWords();
        });
        document.getElementById('vlDictationBtn').addEventListener('click', () => {
            this._startDictation();
        });
        document.getElementById('vlPracticeBtn').addEventListener('click', () => {
            this._startPractice();
        });
    },

    _renderWordsTab() {
        const container = document.getElementById('vlWordsContent');
        if (!container) return;

        const words = LearningEngine.getWordList();
        if (words.length === 0) {
            container.innerHTML = `
                <div class="vl-empty">
                    <div class="vl-empty-icon">📚</div>
                    <div class="vl-empty-text">还没有添加单词</div>
                    <div class="vl-empty-desc">从词库中选择单词开始学习</div>
                </div>
            `;
            return;
        }

        const listHtml = words.map(w => {
            const statusText = w.isDifficult ? '困难' : (
                w.status === 'new' ? '新词' :
                w.status === 'learning' ? '学习中' :
                w.status === 'reviewing' ? '复习中' :
                w.status === 'mastered' ? '已掌握' : w.status
            );
            const statusClass = w.isDifficult ? 'difficult' : w.status;
            const meaning = w.translations || '';
            return `
                <div class="vl-word-item" data-word="${w.word}">
                    <span class="vl-word-text">${w.word}</span>
                    <span class="vl-word-meaning">${meaning}</span>
                    <span class="vl-word-status ${statusClass}">${statusText}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = `<div class="vl-word-list">${listHtml}</div>`;
    },

    _renderSettingsTab() {
        const container = document.getElementById('vlSettingsContent');
        if (!container) return;

        const settings = LearningEngine.getSettings();
        const curves = LearningEngine.CURVES;

        let curveOptions = '';
        for (const [id, curve] of Object.entries(curves)) {
            const selected = id === settings.curveId ? 'selected' : '';
            curveOptions += `<option value="${id}" ${selected}>${curve.name}</option>`;
        }

        container.innerHTML = `
            <div class="vl-section-card">
                <div class="vl-settings-row">
                    <div>
                        <div class="vl-settings-label">每日新词上限</div>
                        <div class="vl-settings-desc">每天学习的新单词数量</div>
                    </div>
                    <input type="number" class="vl-settings-input" id="vlDailyNewWords" value="${settings.dailyNewWords}" min="5" max="100">
                </div>
                <div class="vl-settings-row">
                    <div>
                        <div class="vl-settings-label">每日复习上限</div>
                        <div class="vl-settings-desc">每天复习的最大单词数</div>
                    </div>
                    <input type="number" class="vl-settings-input" id="vlDailyReviewLimit" value="${settings.dailyReviewLimit}" min="10" max="200">
                </div>
                <div class="vl-settings-row">
                    <div>
                        <div class="vl-settings-label">记忆曲线</div>
                        <div class="vl-settings-desc">选择复习间隔方案</div>
                    </div>
                    <select class="vl-select" id="vlCurveSelect">
                        ${curveOptions}
                    </select>
                </div>
                <div class="vl-settings-row">
                    <div>
                        <div class="vl-settings-label">自动播放发音</div>
                        <div class="vl-settings-desc">学习时自动朗读单词</div>
                    </div>
                    <button class="vl-toggle ${settings.autoPlayAudio ? 'on' : ''}" id="vlAutoAudioToggle"></button>
                </div>
            </div>
            <div style="margin-top:16px;">
                <button class="vl-action-btn vl-btn-primary vl-btn-sm" id="vlSaveSettingsBtn">保存设置</button>
            </div>
            <div style="margin-top:24px;padding-top:16px;border-top:0.5px solid var(--vl-border);">
                <div class="vl-settings-label" style="margin-bottom:8px;">数据管理</div>
                <div style="display:flex;gap:8px;">
                    <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="vlExportBtn" style="flex:1;">导出学习数据</button>
                    <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="vlImportBtn" style="flex:1;">导入学习数据</button>
                </div>
                <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="vlResetBtn" style="margin-top:8px;color:var(--vl-danger);border-color:rgba(255,59,48,0.3);">重置所有学习数据</button>
            </div>
        `;

        document.getElementById('vlSaveSettingsBtn').addEventListener('click', () => {
            const dailyNewWords = parseInt(document.getElementById('vlDailyNewWords').value) || 20;
            const dailyReviewLimit = parseInt(document.getElementById('vlDailyReviewLimit').value) || 50;
            const curveId = document.getElementById('vlCurveSelect').value;
            LearningEngine.updateSettings({ dailyNewWords, dailyReviewLimit, curveId });
            InteractionManager && InteractionManager.showToast('设置已保存', 'success');
        });

        document.getElementById('vlAutoAudioToggle').addEventListener('click', function () {
            const isOn = this.classList.toggle('on');
            LearningEngine.updateSettings({ autoPlayAudio: isOn });
        });

        document.getElementById('vlExportBtn').addEventListener('click', () => {
            const data = LearningEngine.loadProgress();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vocab-learning-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        document.getElementById('vlImportBtn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        localStorage.setItem(LearningEngine._getKey(), JSON.stringify(data));
                        InteractionManager && InteractionManager.showToast('导入成功，请刷新页面', 'success');
                    } catch (err) {
                        InteractionManager && InteractionManager.showToast('导入失败：数据格式错误', 'error');
                    }
                };
                reader.readAsText(file);
            });
            input.click();
        });

        document.getElementById('vlResetBtn').addEventListener('click', () => {
            if (confirm('确定要重置所有学习数据吗？此操作不可撤销！')) {
                localStorage.removeItem(LearningEngine._getKey());
                InteractionManager && InteractionManager.showToast('学习数据已重置', 'info');
                this._renderHomeTab();
                this._renderWordsTab();
            }
        });
    },

    _startReview() {
        const words = LearningEngine.getTodayReviewWords();
        const newWords = LearningEngine.getTodayNewWords();
        const allWords = [...words, ...newWords];

        if (allWords.length === 0) {
            InteractionManager && InteractionManager.showToast('今天没有需要学习的单词，先去添加一些单词吧', 'info');
            return;
        }

        this._showQuickReview(allWords);
    },

    _startNewWords() {
        const newWords = LearningEngine.getTodayNewWords();
        if (newWords.length === 0) {
            InteractionManager && InteractionManager.showToast('今天的新词已学完，或者还没有添加单词', 'info');
            return;
        }
        this._showQuickReview(newWords);
    },

    _startPractice() {
        const words = LearningEngine.getWordList();
        if (words.length === 0) {
            InteractionManager && InteractionManager.showToast('还没有添加单词，请先在词库中添加单词', 'info');
            return;
        }
        const container = document.getElementById('vlHomeContent');
        if (!container) return;

        container.innerHTML = `
            <div class="vl-section-card">
                <div class="vl-section-title" style="margin-bottom:16px;">🎯 练习模式</div>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <button class="vl-action-btn vl-btn-primary" id="psModeSpelling" style="justify-content:flex-start;">
                        🔤 <span style="flex:1;text-align:left;">拼写练习</span>
                        <span style="font-size:12px;font-weight:400;color:rgba(255,255,255,0.7);">看释义拼写单词</span>
                    </button>
                    <button class="vl-action-btn vl-btn-secondary" id="psModeContext" style="justify-content:flex-start;">
                        📝 <span style="flex:1;text-align:left;">语境选择</span>
                        <span style="font-size:12px;font-weight:400;color:var(--vl-text-secondary);">根据语境选词填空</span>
                    </button>
                    <button class="vl-action-btn vl-btn-secondary" id="psModeMatching" style="justify-content:flex-start;">
                        🔗 <span style="flex:1;text-align:left;">单词配对</span>
                        <span style="font-size:12px;font-weight:400;color:var(--vl-text-secondary);">匹配单词和释义</span>
                    </button>
                </div>
            </div>
            <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="psModeBack" style="margin-top:16px;">返回</button>
        `;

        document.getElementById('psModeSpelling').addEventListener('click', () => {
            PracticeModes.init(container, { mode: 'spelling', words: [...words] });
            PracticeModes.start();
        });
        document.getElementById('psModeContext').addEventListener('click', () => {
            PracticeModes.init(container, { mode: 'context', words: [...words] });
            PracticeModes.start();
        });
        document.getElementById('psModeMatching').addEventListener('click', () => {
            PracticeModes.init(container, { mode: 'matching', words: [...words] });
            PracticeModes.start();
        });
        document.getElementById('psModeBack').addEventListener('click', () => {
            this._renderHomeTab();
        });
    },

    _startDictation() {
        const words = LearningEngine.getWordList();
        if (words.length === 0) {
            InteractionManager && InteractionManager.showToast('还没有添加单词，请先在词库中添加单词', 'info');
            return;
        }
        this._showDictationSettings(words);
    },

    _showDictationSettings(words) {
        const container = document.getElementById('vlHomeContent');
        if (!container) return;

        const settings = DictationPractice.getSettingsForDictation();
        const totalWords = words.length;

        container.innerHTML = `
            <div class="vl-section-card">
                <div class="vl-section-title" style="margin-bottom:16px;">✍️ 默写设置</div>
                <div class="vl-settings-row">
                    <div>
                        <div class="vl-settings-label">输入方式</div>
                        <div class="vl-settings-desc">键盘自动判定 / 手写对照</div>
                    </div>
                    <select class="vl-select" id="dictInputMode">
                        <option value="keyboard">⌨️ 键盘输入</option>
                        <option value="handwriting">✍️ 手写输入</option>
                    </select>
                </div>
                <div class="vl-settings-row">
                    <div>
                        <div class="vl-settings-label">默写模式</div>
                        <div class="vl-settings-desc">默写单词 / 释义 / 音标</div>
                    </div>
                    <select class="vl-select" id="dictMode">
                        <option value="word">默写单词</option>
                        <option value="meaning">默写释义</option>
                        <option value="phonetic">默写音标</option>
                    </select>
                </div>
                <div class="vl-settings-row">
                    <div>
                        <div class="vl-settings-label">默写数量</div>
                        <div class="vl-settings-desc">最多 ${totalWords} 个单词可用</div>
                    </div>
                    <input type="number" class="vl-settings-input" id="dictWordCount"
                        value="${Math.min(20, totalWords)}" min="5" max="${totalWords}">
                </div>
                <div class="vl-settings-row">
                    <div>
                        <div class="vl-settings-label">词源</div>
                        <div class="vl-settings-desc">选择要默写的单词范围</div>
                    </div>
                    <select class="vl-select" id="dictWordSource">
                        <option value="all">所有单词 (${totalWords})</option>
                        <option value="learning">学习中 (${LearningEngine.getLearningCount()})</option>
                        <option value="due">待复习 (${LearningEngine.getDueCount()})</option>
                    </select>
                </div>
            </div>
            <div style="display:flex;gap:10px;margin-top:16px;">
                <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="dictSettingsBack" style="flex:1;">返回</button>
                <button class="vl-action-btn vl-btn-primary vl-btn-sm" id="dictSettingsStart" style="flex:1;">开始默写</button>
            </div>
        `;

        document.getElementById('dictSettingsBack').addEventListener('click', () => {
            this._renderHomeTab();
        });

        document.getElementById('dictSettingsStart').addEventListener('click', () => {
            const inputMode = document.getElementById('dictInputMode').value;
            const mode = document.getElementById('dictMode').value;
            const count = parseInt(document.getElementById('dictWordCount').value) || 20;
            const source = document.getElementById('dictWordSource').value;

            let selectedWords;
            if (source === 'due') {
                selectedWords = LearningEngine.getTodayReviewWords();
            } else if (source === 'learning') {
                const allWords = LearningEngine.getWordList();
                selectedWords = allWords.filter(w => w.status === 'learning' || w.status === 'reviewing');
            } else {
                selectedWords = words;
            }

            selectedWords = selectedWords.slice(0, count);
            if (selectedWords.length === 0) {
                InteractionManager && InteractionManager.showToast('没有符合条件的单词', 'info');
                return;
            }

            DictationPractice.init(container, {
                inputMode,
                mode,
                wordCount: selectedWords.length,
                words: selectedWords
            });
            DictationPractice.start();
        });
    },

    _showQuickReview(words) {
        const container = document.getElementById('vlHomeContent');
        if (!container) return;

        let currentIndex = 0;
        let correctCount = 0;
        const totalCount = words.length;
        let isFlipped = false;

        const renderCard = () => {
            if (currentIndex >= totalCount) {
                this._showReviewResult(correctCount, totalCount);
                return;
            }

            const current = words[currentIndex];
            const totalLearned = totalCount;

            container.innerHTML = `
                <div style="text-align:center;margin-bottom:16px;">
                    <span style="font-size:13px;color:var(--vl-text-secondary);">${currentIndex + 1} / ${totalLearned}</span>
                    <div style="margin-top:8px;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">
                        <div style="height:100%;width:${((currentIndex + 1) / totalLearned) * 100}%;background:var(--vl-primary);border-radius:2px;transition:width 0.3s;"></div>
                    </div>
                </div>
                <div class="vl-section-card" style="text-align:center;padding:40px 20px;cursor:pointer;" id="vlReviewCard">
                    <div style="font-size:32px;font-weight:700;color:var(--vl-text);margin-bottom:12px;font-family:'SF Pro Text','Helvetica Neue',Arial,sans-serif;">
                        ${current.word}
                    </div>
                    ${current.state.phonetic ? `<div style="font-size:16px;color:var(--vl-text-secondary);margin-bottom:8px;">${current.state.phonetic}</div>` : ''}
                    <div id="vlReviewMeaning" style="display:none;font-size:18px;color:var(--vl-primary);font-weight:500;margin-top:16px;padding-top:16px;border-top:0.5px solid var(--vl-border);">
                        ${current.state.translations || '暂无释义'}
                    </div>
                    <div style="margin-top:16px;font-size:13px;color:var(--vl-text-tertiary);">
                        ${isFlipped ? '👆 点击卡片收起' : '👆 点击卡片查看释义'}
                    </div>
                </div>
                <div style="display:flex;gap:10px;margin-top:16px;">
                    <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="vlReviewWrong" style="flex:1;color:var(--vl-danger);border-color:rgba(255,59,48,0.3);">✗ 不认识</button>
                    <button class="vl-action-btn vl-btn-primary vl-btn-sm" id="vlReviewCorrect" style="flex:1;">✓ 认识</button>
                </div>
            `;

            if (!isFlipped) {
                document.getElementById('vlReviewMeaning').style.display = 'none';
            }

            document.getElementById('vlReviewCard').addEventListener('click', () => {
                const meaningEl = document.getElementById('vlReviewMeaning');
                if (meaningEl) {
                    isFlipped = !isFlipped;
                    meaningEl.style.display = isFlipped ? 'block' : 'none';
                    const hint = document.querySelector('#vlReviewCard > div:last-child');
                    if (hint) {
                        hint.textContent = isFlipped ? '👆 点击卡片收起' : '👆 点击卡片查看释义';
                    }
                }
            });

            document.getElementById('vlReviewCorrect').addEventListener('click', () => {
                LearningEngine.recordReview(current.word, true);
                correctCount++;
                currentIndex++;
                isFlipped = false;
                renderCard();
            });

            document.getElementById('vlReviewWrong').addEventListener('click', () => {
                LearningEngine.recordReview(current.word, false);
                currentIndex++;
                isFlipped = false;
                renderCard();
            });
        };

        renderCard();
    },

    _showReviewResult(correct, total) {
        const container = document.getElementById('vlHomeContent');
        if (!container) return;

        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

        container.innerHTML = `
            <div class="vl-section-card" style="text-align:center;padding:40px 20px;">
                <div style="font-size:48px;margin-bottom:16px;">
                    ${pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
                </div>
                <div style="font-size:22px;font-weight:700;color:var(--vl-text);margin-bottom:8px;">
                    复习完成！
                </div>
                <div style="font-size:15px;color:var(--vl-text-secondary);margin-bottom:24px;">
                    正确 ${correct} / 共 ${total} (${pct}%)
                </div>
                <div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;margin-bottom:24px;max-width:300px;margin-left:auto;margin-right:auto;">
                    <div style="height:100%;width:${pct}%;background:${pct >= 80 ? 'var(--vl-success)' : pct >= 50 ? 'var(--vl-warning)' : 'var(--vl-primary)'};border-radius:4px;transition:width 0.5s;"></div>
                </div>
                <div style="display:flex;gap:10px;max-width:300px;margin:0 auto;">
                    <button class="vl-action-btn vl-btn-primary vl-btn-sm" id="vlResultBackHome" style="flex:1;">返回首页</button>
                    <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="vlResultContinue" style="flex:1;">继续复习</button>
                </div>
            </div>
        `;

        document.getElementById('vlResultBackHome').addEventListener('click', () => {
            this._renderHomeTab();
        });
        document.getElementById('vlResultContinue').addEventListener('click', () => {
            this._startReview();
        });
    },

    switchTab(tabId) {
        const tabs = document.querySelectorAll('.vl-nav-tab');
        const contents = document.querySelectorAll('.vl-tab-content');

        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        const tabEl = document.querySelector(`.vl-nav-tab[data-tab="${tabId}"]`);
        const contentEl = document.getElementById(`vl${tabId.charAt(0).toUpperCase() + tabId.slice(1)}Content`);

        if (tabEl) tabEl.classList.add('active');
        if (contentEl) contentEl.classList.add('active');

        if (tabId === 'home') this._renderHomeTab();
        else if (tabId === 'words') this._renderWordsTab();
        else if (tabId === 'settings') this._renderSettingsTab();
    },

    _bindEvents() {
        document.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('#vlCloseBtn');
            if (closeBtn) {
                this.hide();
                return;
            }

            const navTab = e.target.closest('.vl-nav-tab');
            if (navTab) {
                this.switchTab(navTab.dataset.tab);
                return;
            }
        });
    }
};

window.VocabLearning = VocabLearning;
