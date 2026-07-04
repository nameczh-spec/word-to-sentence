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
            autoPlayAudio: false
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
        progress.words[word] = {
            ...JSON.parse(JSON.stringify(this.defaultWordState)),
            word: word,
            translations: translations || '',
            phonetic: phonetic || '',
            createdAt: now,
            nextReview: this.calculateNextReview(progress.settings.curveId, 0)
        };
        progress.stats.totalLearned++;
        this.saveProgress(progress);
        return true;
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
                progress.stats.totalMastered = Object.values(progress.words).filter(w => w.status === 'mastered').length;
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
        const todayAdded = [];

        for (const [word, state] of Object.entries(progress.words)) {
            if (state.status === 'new') {
                newWords.push({ word, state });
            }
            if (state.createdAt && state.createdAt.startsWith(today)) {
                todayAdded.push(word);
            }
        }

        const alreadyAddedToday = todayAdded.length;
        const remaining = Math.max(0, count - alreadyAddedToday);

        newWords.sort((a, b) => (a.state.createdAt || '').localeCompare(b.state.createdAt || ''));
        return newWords.slice(0, remaining);
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
