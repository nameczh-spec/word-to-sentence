const PracticeModes = {
    _container: null,
    _words: [],
    _currentIndex: 0,
    _correctCount: 0,
    _mode: null,
    _results: [],
    _startTime: null,

    init(container, options) {
        this._container = container;
        this._words = options.words || [];
        this._mode = options.mode || 'spelling';
        this._currentIndex = 0;
        this._correctCount = 0;
        this._results = [];
        this._startTime = Date.now();
    },

    start() {
        if (!this._container || this._words.length === 0) return;

        if (this._mode === 'spelling') this._showSpellingPage();
        else if (this._mode === 'context') this._showContextPage();
        else if (this._mode === 'matching') this._showMatchingPage();
    },

    _showSpellingPage() {
        this._renderProgressHeader();
        this._renderSpellingCard();
    },

    _renderProgressHeader() {
        const total = this._words.length;
        this._container.innerHTML = `
            <div style="margin-bottom:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <span style="font-size:13px;color:var(--vl-text-secondary);">🔤 拼写练习</span>
                    <span style="font-size:13px;color:var(--vl-text-secondary);" id="pPracticeProgress">1 / ${total}</span>
                </div>
                <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">
                    <div style="height:100%;width:${(1 / total) * 100}%;background:var(--vl-primary);border-radius:2px;transition:width 0.3s;" id="pPracticeBar"></div>
                </div>
            </div>
            <div id="pPracticeCard"></div>
        `;
    },

    _renderSpellingCard() {
        if (this._currentIndex >= this._words.length) {
            this._showResult();
            return;
        }

        const card = document.getElementById('pPracticeCard');
        if (!card) return;

        const current = this._words[this._currentIndex];
        const word = current.word || current;
        const meaning = current.translations || current.meaning || current.state?.translations || '';
        const phonetic = current.phonetic || current.state?.phonetic || '';

        card.innerHTML = `
            <div class="ps-card">
                <div class="ps-hint">请拼写以下单词</div>
                <div class="ps-meaning">${meaning || '（暂无释义）'}</div>
                ${phonetic ? `<div class="ps-phonetic">${phonetic}</div>` : ''}
                <div class="ps-input-area">
                    <input type="text" class="ps-input" id="psInput"
                        placeholder="输入英文单词" autocomplete="off" spellcheck="false" autofocus>
                </div>
                <div class="ps-result" id="psResult"></div>
                <div class="ps-actions">
                    <button class="ps-btn ps-btn-hint" id="psHintBtn">💡 提示</button>
                    <button class="ps-btn ps-btn-skip" id="psSkipBtn">⏭️ 跳过</button>
                </div>
            </div>
        `;

        document.getElementById('psInput').focus();
        document.getElementById('psInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this._checkSpelling(word);
            }
        });
        document.getElementById('psHintBtn').addEventListener('click', () => {
            const input = document.getElementById('psInput');
            if (input) {
                const hint = word.substring(0, Math.ceil(word.length / 3));
                input.value = hint;
                input.focus();
            }
        });
        document.getElementById('psSkipBtn').addEventListener('click', () => {
            this._results.push({ word, isCorrect: false, skipped: true });
            this._currentIndex++;
            this._updateProgress();
            this._renderSpellingCard();
        });
    },

    _checkSpelling(correctWord) {
        const input = document.getElementById('psInput');
        const result = document.getElementById('psResult');
        if (!input || !result) return;

        const userAnswer = input.value.trim().toLowerCase();
        const correct = correctWord.toLowerCase().trim();
        const isCorrect = userAnswer === correct;
        const isClose = !isCorrect && (
            this._levenshtein(userAnswer, correct) <= 2 ||
            (userAnswer.length > 3 && correct.startsWith(userAnswer))
        );

        if (isCorrect) {
            result.innerHTML = `<span class="ps-correct">✓ 正确！</span>`;
            this._correctCount++;
            this._results.push({ word: correctWord, userAnswer, isCorrect: true, skipped: false });

            input.disabled = true;
            document.getElementById('psHintBtn').disabled = true;
            document.getElementById('psSkipBtn').disabled = true;

            setTimeout(() => {
                this._currentIndex++;
                this._updateProgress();
                this._renderSpellingCard();
            }, 1200);
        } else {
            const msg = isClose ? `接近！正确答案是: ${correctWord}` : `✗ 错误，正确答案是: ${correctWord}`;
            result.innerHTML = `<span class="ps-wrong">${msg}</span>`;
            this._results.push({ word: correctWord, userAnswer, isCorrect: false, skipped: false });

            if (typeof LearningEngine !== 'undefined') {
                LearningEngine.recordReview(correctWord, 'wrong');
            }

            input.disabled = true;
            document.getElementById('psHintBtn').disabled = true;
            document.getElementById('psSkipBtn').disabled = true;

            setTimeout(() => {
                input.value = '';
                input.disabled = false;
                result.innerHTML = '';
                input.focus();
                document.getElementById('psHintBtn').disabled = false;
                document.getElementById('psSkipBtn').disabled = false;
            }, 1200);
        }
    },

    _showContextPage() {
        this._renderProgressHeader();
        this._renderContextCard();
    },

    _renderContextCard() {
        if (this._currentIndex >= this._words.length) {
            this._showResult();
            return;
        }

        const card = document.getElementById('pPracticeCard');
        if (!card) return;

        const current = this._words[this._currentIndex];
        const correctWord = current.word || current;
        const meaning = current.translations || current.meaning || current.state?.translations || '';

        const distractors = this._getDistractors(correctWord, 3);
        const options = this._shuffle([correctWord, ...distractors]);

        const contextSentences = [
            `The scientist made a _____ discovery that changed the world.`,
            `It is important to _____ your knowledge through practice.`,
            `The _____ of the research was published in a leading journal.`,
            `She demonstrated great _____ in solving the complex problem.`,
            `The professor asked the students to _____ the main ideas.`
        ];
        const sentence = contextSentences[this._currentIndex % contextSentences.length];

        card.innerHTML = `
            <div class="ps-card">
                <div class="ps-hint">选择正确的单词完成句子</div>
                <div class="ps-sentence">"${sentence.replace('_____', `<span class="ps-blank">______</span>`)}"</div>
                <div class="ps-meaning" style="margin-bottom:12px;">提示释义: ${meaning || '（暂无释义）'}</div>
                <div class="ps-options" id="psOptions">
                    ${options.map((opt, i) => `
                        <button class="ps-option-btn" data-word="${opt}">
                            ${String.fromCharCode(65 + i)}. ${opt}
                        </button>
                    `).join('')}
                </div>
                <div class="ps-result" id="psResult"></div>
                <button class="ps-btn ps-btn-skip" id="psCtxSkipBtn" style="margin-top:8px;">⏭️ 跳过</button>
            </div>
        `;

        document.querySelectorAll('.ps-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const selected = btn.dataset.word;
                const isCorrect = selected === correctWord;

                document.querySelectorAll('.ps-option-btn').forEach(b => b.disabled = true);
                btn.classList.add(isCorrect ? 'ps-option-correct' : 'ps-option-wrong');

                if (!isCorrect) {
                    document.querySelectorAll('.ps-option-btn').forEach(b => {
                        if (b.dataset.word === correctWord) {
                            b.classList.add('ps-option-correct');
                        }
                    });
                }

                const result = document.getElementById('psResult');
                if (result) {
                    result.innerHTML = isCorrect
                        ? `<span class="ps-correct">✓ 正确！${correctWord}: ${meaning}</span>`
                        : `<span class="ps-wrong">✗ 错误，正确答案是: ${correctWord}</span>`;
                }

                if (isCorrect) this._correctCount++;
                this._results.push({ word: correctWord, userAnswer: selected, isCorrect, skipped: false });

                document.getElementById('psCtxSkipBtn').disabled = true;
                setTimeout(() => {
                    this._currentIndex++;
                    this._updateProgress();
                    this._renderContextCard();
                }, 1500);
            });
        });

        document.getElementById('psCtxSkipBtn').addEventListener('click', () => {
            this._results.push({ word: correctWord, userAnswer: '', isCorrect: false, skipped: true });
            this._currentIndex++;
            this._updateProgress();
            this._renderContextCard();
        });
    },

    _showMatchingPage() {
        if (this._words.length < 4) {
            if (this._container) {
                this._container.innerHTML = `<div class="vl-empty"><div class="vl-empty-icon">📝</div><div class="vl-empty-text">至少需要4个单词才能进行配对练习</div></div>`;
            }
            return;
        }

        const matchWords = this._shuffle([...this._words]).slice(0, Math.min(8, this._words.length));
        const leftItems = matchWords.map(w => ({ id: this._uid(), text: w.word || w, type: 'word', pair: w.word || w }));
        const rightItems = this._shuffle([...matchWords]).map(w => ({
            id: this._uid(),
            text: w.translations || w.meaning || w.state?.translations || w.word,
            type: 'meaning',
            pair: w.word || w
        }));

        let matchedPairs = 0;
        let selectedLeft = null;

        this._container.innerHTML = `
            <div style="margin-bottom:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <span style="font-size:13px;color:var(--vl-text-secondary);">🔗 单词配对</span>
                    <span style="font-size:13px;color:var(--vl-text-secondary);" id="pMatchProgress">0 / ${matchWords.length}</span>
                </div>
            </div>
            <div class="pm-grid" id="pmGrid">
                <div class="pm-column" id="pmLeft">
                    ${leftItems.map(item => `
                        <div class="pm-item" data-id="${item.id}" data-pair="${item.pair}">
                            <span class="pm-text">${item.text}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="pm-column" id="pmRight">
                    ${rightItems.map(item => `
                        <div class="pm-item" data-id="${item.id}" data-pair="${item.pair}">
                            <span class="pm-text">${item.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="margin-top:16px;">
                <button class="vl-action-btn vl-btn-primary vl-btn-sm" id="pmFinishBtn">📋 完成配对</button>
                <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="pmBackBtn" style="margin-top:8px;">返回</button>
            </div>
        `;

        document.querySelectorAll('#pmLeft .pm-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('#pmLeft .pm-item').forEach(i => i.classList.remove('pm-selected'));
                item.classList.add('pm-selected');
                selectedLeft = item;
            });
        });

        document.querySelectorAll('#pmRight .pm-item').forEach(item => {
            item.addEventListener('click', () => {
                if (!selectedLeft) return;
                if (item.classList.contains('pm-matched')) return;

                if (item.dataset.pair === selectedLeft.dataset.pair) {
                    item.classList.add('pm-matched');
                    selectedLeft.classList.add('pm-matched');
                    selectedLeft.classList.remove('pm-selected');
                    matchedPairs++;
                    document.getElementById('pMatchProgress').textContent = `${matchedPairs} / ${matchWords.length}`;

                    if (matchedPairs === matchWords.length) {
                        this._correctCount = matchedPairs;
                        this._showResult();
                    }
                } else {
                    item.classList.add('pm-wrong');
                    selectedLeft.classList.add('pm-wrong');
                    setTimeout(() => {
                        item.classList.remove('pm-wrong');
                        selectedLeft.classList.remove('pm-wrong');
                        selectedLeft.classList.remove('pm-selected');
                    }, 600);
                }
                selectedLeft = null;
            });
        });

        document.getElementById('pmFinishBtn').addEventListener('click', () => {
            this._correctCount = matchedPairs;
            this._showResult();
        });

        document.getElementById('pmBackBtn').addEventListener('click', () => {
            VocabLearning._renderHomeTab();
        });
    },

    _getDistractors(correctWord, count) {
        const pool = this._words.filter(w => (w.word || w) !== correctWord);
        const candidates = pool.map(w => w.word || w).filter(w => w !== correctWord);
        const result = [];
        const used = new Set([correctWord]);
        for (const w of candidates) {
            if (result.length >= count) break;
            if (!used.has(w)) {
                result.push(w);
                used.add(w);
            }
        }
        while (result.length < count) {
            const filler = ['significant', 'important', 'different', 'necessary', 'possible'];
            for (const f of filler) {
                if (result.length >= count) break;
                if (!used.has(f)) {
                    result.push(f);
                    used.add(f);
                }
            }
        }
        return result;
    },

    _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    _uid() {
        return 'pm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    },

    _levenshtein(a, b) {
        const m = a.length, n = b.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                );
            }
        }
        return dp[m][n];
    },

    _updateProgress() {
        const total = this._words.length;
        const progress = document.getElementById('pPracticeProgress');
        const bar = document.getElementById('pPracticeBar');
        if (progress) progress.textContent = `${Math.min(this._currentIndex + 1, total)} / ${total}`;
        if (bar) bar.style.width = `${((this._currentIndex + 1) / total) * 100}%`;
    },

    _showResult() {
        if (!this._container) return;
        const total = this._words.length > 0 ? this._words.length : this._correctCount;
        const pct = total > 0 ? Math.round((this._correctCount / total) * 100) : 0;

        const modeNames = { spelling: '拼写练习', context: '语境选择', matching: '单词配对' };

        this._container.innerHTML = `
            <div class="vl-section-card" style="text-align:center;padding:32px 20px;">
                <div style="font-size:48px;margin-bottom:12px;">${pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
                <div style="font-size:22px;font-weight:700;color:var(--vl-text);margin-bottom:4px;">${modeNames[this._mode] || '练习'}完成！</div>
                <div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;max-width:300px;margin:16px auto;">
                    <div style="height:100%;width:${pct}%;background:${pct >= 80 ? 'var(--vl-success)' : pct >= 50 ? 'var(--vl-warning)' : 'var(--vl-primary)'};border-radius:4px;transition:width 0.5s;"></div>
                </div>
                <div style="font-size:15px;color:var(--vl-text-secondary);">
                    正确 ${this._correctCount} / 共 ${total} (${pct}%)
                </div>
            </div>
            <div style="display:flex;gap:10px;margin-top:16px;">
                <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="pmResultBack" style="flex:1;">返回首页</button>
                <button class="vl-action-btn vl-btn-primary vl-btn-sm" id="pmResultRetry" style="flex:1;">再练一次</button>
            </div>
        `;

        document.getElementById('pmResultBack').addEventListener('click', () => {
            VocabLearning._renderHomeTab();
        });
        document.getElementById('pmResultRetry').addEventListener('click', () => {
            this._currentIndex = 0;
            this._correctCount = 0;
            this._results = [];
            this._startTime = Date.now();
            this.start();
        });
    },

    destroy() {
        this._container = null;
        this._words = [];
        this._results = [];
        this._currentIndex = 0;
        this._correctCount = 0;
    }
};

window.PracticeModes = PracticeModes;
