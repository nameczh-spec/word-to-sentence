const LearningEngine = {
    STORAGE_KEY: 'vocab_learning_progress',

    CURVES: {
        ebbinghaus: { id: 'ebbinghaus', name: '艾宾浩斯遗忘曲线', intervals: [1, 2, 4, 7, 15, 30] },
        simple: { id: 'simple', name: '简易间隔', intervals: [1, 2, 4, 7] },
        challenge: { id: 'challenge', name: '挑战模式', intervals: [1, 3, 7, 14, 30, 60] }
    },

    defaultWordState: {
        status: 'new',
        curveId: 'ebbinghaus',
        currentStage: 0,
        nextReview: null,
        reviewCount: 0,
        mastery: 0,
        errorCount: 0,
        isDifficult: false,
        lastReview: null,
        createdAt: null,
        dictationRecords: []
    },

    _getKey() {
        const userId = typeof UserManager !== 'undefined' ? UserManager.getCurrentUserId() : '';
        return userId ? `${this.STORAGE_KEY}_${userId}` : this.STORAGE_KEY;
    },

    loadProgress() {
        try {
            const stored = localStorage.getItem(this._getKey());
            if (stored) {
                const data = JSON.parse(stored);
                if (!data.words) data.words = {};
                if (!data.stats) {
                    data.stats = this._createEmptyStats();
                }
                if (!data.settings) {
                    data.settings = this._defaultSettings();
                }
                if (!data.history) data.history = [];
                return data;
            }
        } catch (e) {
            console.error('[LearningEngine] 加载学习进度失败:', e);
        }
        return this._createEmptyProgress();
    },

    saveProgress(progress) {
        try {
            localStorage.setItem(this._getKey(), JSON.stringify(progress));
        } catch (e) {
            console.error('[LearningEngine] 保存学习进度失败:', e);
        }
    },

    _createEmptyProgress() {
        return {
            words: {},
            stats: this._createEmptyStats(),
            settings: this._defaultSettings(),
            history: []
        };
    },

    _createEmptyStats() {
        return {
            totalLearned: 0,
            totalMastered: 0,
            todayNew: 0,
            todayReviewed: 0,
            streak: 0,
            lastActiveDate: null
        };
    },

    _defaultSettings() {
        return {
            dailyNewWords: 20,
            dailyReviewLimit: 50,
            curveId: 'ebbinghaus',
            autoPlayAudio: false,
            threeLevelReview: false,
            dictationMode: false
        };
    },

    getCurve(curveId) {
        return this.CURVES[curveId] || this.CURVES.ebbinghaus;
    },

    calculateNextReview(curveId, currentStage) {
        const curve = this.getCurve(curveId);
        if (currentStage >= curve.intervals.length) {
            return null;
        }
        const intervalDays = curve.intervals[currentStage];
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + intervalDays);
        return nextDate.toISOString().split('T')[0];
    },

    addWord(word, translations, phonetic) {
        const progress = this.loadProgress();
        if (progress.words[word]) {
            return false;
        }
        const now = new Date().toISOString();
        const state = { ...this.defaultWordState, createdAt: now };
        progress.words[word] = {
            ...state,
            word,
            translations: translations || '',
            phonetic: phonetic || ''
        };
        progress.stats.totalLearned++;
        this.saveProgress(progress);
        return true;
    },

    clearWords() {
        const progress = this.loadProgress();
        progress.words = {};
        progress.stats = this._createEmptyStats();
        this.saveProgress(progress);
    },

    /**
     * 批量添加单词（一次IO，避免卡死）
     * @param {Array} words - 单词数组 [{word, translations, phonetic}]
     * @returns {number} 实际添加的数量
     */
    addWordsBatch(words) {
        if (!words || words.length === 0) return 0;
        const progress = this.loadProgress();
        const now = new Date().toISOString();
        const nextReview = this.calculateNextReview(progress.settings.curveId, 0);
        let added = 0;
        for (const w of words) {
            const wordText = w.word || '';
            if (!wordText || progress.words[wordText]) continue;
            progress.words[wordText] = {
                ...JSON.parse(JSON.stringify(this.defaultWordState)),
                word: wordText,
                translations: w.translations || '',
                phonetic: w.phonetic || '',
                createdAt: now,
                nextReview: nextReview
            };
            added++;
        }
        progress.stats.totalLearned += added;
        this.saveProgress(progress);
        return added;
    },

    /**
     * 从词书补充今日新词（仅加入学习队列，不算已学）
     * @param {Array} bookWords - 词书单词列表
     * @param {number} count - 需要补充的数量
     * @returns {number} 实际补充的数量
     */
    supplementNewWords(bookWords, count) {
        if (!bookWords || bookWords.length === 0 || count <= 0) return 0;
        const progress = this.loadProgress();
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        // 计算今天已添加的新词数
        const todayAddedCount = Object.values(progress.words).filter(w => {
            return w.status === 'new' && w.createdAt && w.createdAt.startsWith(today);
        }).length;

        const remaining = Math.max(0, count - todayAddedCount);
        if (remaining === 0) return 0;

        let added = 0;
        for (const w of bookWords) {
            if (added >= remaining) break;
            const wordText = w.word || '';
            if (!wordText || progress.words[wordText]) continue;
            // 提取翻译文本
            let transText = '';
            if (Array.isArray(w.translations)) {
                transText = w.translations.map(t => typeof t === 'string' ? t : (t.translation || '')).join('；');
            } else if (typeof w.translations === 'string') {
                transText = w.translations;
            }
            progress.words[wordText] = {
                ...JSON.parse(JSON.stringify(this.defaultWordState)),
                word: wordText,
                translations: transText,
                phonetic: w.phonetic || '',
                createdAt: now,
                nextReview: null  // 新词不需要nextReview，学过之后才设置
            };
            added++;
        }
        // 注意：不增加 totalLearned，这些词还没学
        this.saveProgress(progress);
        return added;
    },

    addWordsFromVocabBook(bookId) {
        const bookData = DataStore.getWordBook(bookId);
        if (!bookData || !bookData.words) return 0;
        let addedCount = 0;
        for (const w of bookData.words) {
            if (this.addWord(w.word, w.meanings || w.translation || '', w.phonetic || '')) {
                addedCount++;
            }
        }
        return addedCount;
    },

    addWordsFromVocabLib(words) {
        let addedCount = 0;
        for (const w of words) {
            const wordText = typeof w === 'string' ? w : (w.word || w.headWord || '');
            const trans = w.translations || w.meaning || '';
            let phonetic = w.phonetic || '';
            if (!phonetic && w.content?.word?.content?.phone) {
                phonetic = w.content.word.content.phone;
            }
            if (wordText && this.addWord(wordText, trans, phonetic)) {
                addedCount++;
            }
        }
        return addedCount;
    },

    recordReview(word, isCorrect) {
        const progress = this.loadProgress();
        const wordState = progress.words[word];
        if (!wordState) return;

        const settings = progress.settings;
        const wasNew = wordState.status === 'new';
        wordState.lastReview = new Date().toISOString();

        if (isCorrect) {
            wordState.currentStage = Math.min(
                wordState.currentStage + 1,
                this.getCurve(wordState.curveId).intervals.length - 1
            );
            wordState.reviewCount++;
            wordState.mastery = Math.min(1, wordState.mastery + 0.15);
            if (wordState.currentStage >= this.getCurve(wordState.curveId).intervals.length - 1) {
                wordState.status = 'mastered';
            } else {
                wordState.status = 'reviewing';
            }
        } else {
            wordState.errorCount++;
            wordState.currentStage = Math.max(0, wordState.currentStage - 1);
            wordState.mastery = Math.max(0, wordState.mastery - 0.2);
            wordState.status = 'learning';
            if (wordState.errorCount >= 3) {
                wordState.isDifficult = true;
            }
        }

        wordState.nextReview = this.calculateNextReview(wordState.curveId, wordState.currentStage);

        // 如果是从 new 状态第一次学习，增加 totalLearned
        if (wasNew) {
            progress.stats.totalLearned++;
        }

        // 更新已掌握数
        progress.stats.totalMastered = Object.values(progress.words).filter(w => w.status === 'mastered').length;

        this._updateTodayStats(progress);
        this.saveProgress(progress);
    },

    getTodayReviewWords(progress) {
        if (!progress) progress = this.loadProgress();
        const today = new Date().toISOString().split('T')[0];
        const reviewWords = [];

        for (const [word, state] of Object.entries(progress.words)) {
            if (state.status === 'new') continue;
            if (state.nextReview && state.nextReview <= today && state.status !== 'mastered') {
                reviewWords.push({ word, state });
            }
        }

        reviewWords.sort((a, b) => {
            if (a.state.isDifficult && !b.state.isDifficult) return -1;
            if (!a.state.isDifficult && b.state.isDifficult) return 1;
            return (a.state.nextReview || '').localeCompare(b.state.nextReview || '');
        });

        return reviewWords;
    },

    getTodayNewWords(progress, count) {
        if (!progress) progress = this.loadProgress();
        count = count || progress.settings.dailyNewWords;
        const today = new Date().toISOString().split('T')[0];
        const newWords = [];

        // 收集状态为 'new' 的单词，优先今天添加的
        for (const [word, state] of Object.entries(progress.words)) {
            if (state.status === 'new') {
                newWords.push({ word, state });
            }
        }

        // 排序：今天添加的优先，然后按创建时间排序
        newWords.sort((a, b) => {
            const aIsToday = a.state.createdAt && a.state.createdAt.startsWith(today) ? 0 : 1;
            const bIsToday = b.state.createdAt && b.state.createdAt.startsWith(today) ? 0 : 1;
            if (aIsToday !== bIsToday) return aIsToday - bIsToday;
            return (a.state.createdAt || '').localeCompare(b.state.createdAt || '');
        });

        return newWords.slice(0, count);
    },

    getWordsForReview(progress) {
        if (!progress) progress = this.loadProgress();
        const reviewWords = this.getTodayReviewWords(progress);
        const newWords = this.getTodayNewWords(progress);
        return { review: reviewWords, new: newWords };
    },

    _updateTodayStats(progress) {
        const today = new Date().toISOString().split('T')[0];
        if (progress.stats.lastActiveDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            if (progress.stats.lastActiveDate === yesterdayStr) {
                progress.stats.streak++;
            } else if (progress.stats.lastActiveDate !== today) {
                progress.stats.streak = 1;
            }
            progress.stats.todayNew = 0;
            progress.stats.todayReviewed = 0;
            progress.stats.lastActiveDate = today;
        }

        const todayNew = Object.values(progress.words).filter(w => {
            return w.createdAt && w.createdAt.startsWith(today);
        }).length;
        progress.stats.todayNew = todayNew;

        const todayReviewed = Object.values(progress.words).filter(w => {
            return w.lastReview && w.lastReview.startsWith(today);
        }).length;
        progress.stats.todayReviewed = todayReviewed;
    },

    getSettings() {
        return this.loadProgress().settings;
    },

    updateSettings(newSettings) {
        const progress = this.loadProgress();
        progress.settings = { ...progress.settings, ...newSettings };
        this.saveProgress(progress);
    },

    getWordState(word) {
        const progress = this.loadProgress();
        return progress.words[word] || null;
    },

    getStats() {
        const progress = this.loadProgress();
        this._updateTodayStats(progress);
        return progress.stats;
    },

    getDueCount() {
        const progress = this.loadProgress();
        return this.getTodayReviewWords(progress).length;
    },

    getLearningCount() {
        const progress = this.loadProgress();
        return Object.values(progress.words).filter(w => w.status === 'learning' || w.status === 'reviewing').length;
    },

    getMasteredCount() {
        const progress = this.loadProgress();
        return Object.values(progress.words).filter(w => w.status === 'mastered').length;
    },

    getWordList() {
        const progress = this.loadProgress();
        return Object.entries(progress.words).map(([word, state]) => ({
            word,
            ...state
        }));
    },

    resetWord(word) {
        const progress = this.loadProgress();
        if (progress.words[word]) {
            progress.words[word] = {
                ...JSON.parse(JSON.stringify(this.defaultWordState)),
                word: word,
                translations: progress.words[word].translations,
                phonetic: progress.words[word].phonetic,
                createdAt: progress.words[word].createdAt,
                nextReview: this.calculateNextReview(progress.settings.curveId, 0)
            };
            this.saveProgress(progress);
        }
    },

    removeWord(word) {
        const progress = this.loadProgress();
        if (progress.words[word]) {
            delete progress.words[word];
            this.saveProgress(progress);
            return true;
        }
        return false;
    },

    init() {
        const progress = this.loadProgress();
        this._updateTodayStats(progress);
        this.saveProgress(progress);
        console.log('[LearningEngine] 学习引擎初始化完成，总单词数:', Object.keys(progress.words).length);
    }
};

window.LearningEngine = LearningEngine;
