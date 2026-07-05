const DictationPractice = {
    _settings: null,
    _words: [],
    _results: [],
    _currentIndex: 0,
    _startTime: null,
    _container: null,
    _canvasCtx: null,
    _canvasElement: null,
    _strokeHistory: [],
    _isDrawing: false,
    _mode: 'dictation',

    init(container, options) {
        this._container = container;
        this._settings = {
            inputMode: options.inputMode || 'keyboard',
            mode: options.mode || 'word',
            wordCount: options.wordCount || 20,
            bookId: options.bookId || 'all',
            autoCheck: options.autoCheck !== false
        };
        this._words = options.words || [];
        this._results = [];
        this._currentIndex = 0;
        this._startTime = Date.now();
    },

    start() {
        this._showDictationPage();
    },

    _showDictationPage() {
        if (!this._container) return;
        const total = this._words.length;
        this._container.innerHTML = `
            <div style="margin-bottom:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <span style="font-size:13px;color:var(--vl-text-secondary);">
                        ${this._settings.inputMode === 'keyboard' ? '⌨️ 键盘模式' : '✍️ 手写模式'} · 
                        ${this._settings.mode === 'word' ? '默写单词' : this._settings.mode === 'meaning' ? '默写释义' : '默写音标'}
                    </span>
                    <span style="font-size:13px;color:var(--vl-text-secondary);">1 / ${total}</span>
                </div>
                <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">
                    <div style="height:100%;width:${(1 / total) * 100}%;background:var(--vl-primary);border-radius:2px;transition:width 0.3s;" id="dictProgressBar"></div>
                </div>
            </div>
            <div id="dictWordList"></div>
            <button class="vl-action-btn vl-btn-primary" id="dictSubmitAllBtn" style="margin-top:16px;">📋 交卷并查看结果</button>
        `;
        this._renderAllCards();
        document.getElementById('dictSubmitAllBtn').addEventListener('click', () => this._submitAll());
    },

    _renderAllCards() {
        const list = document.getElementById('dictWordList');
        if (!list) return;
        let html = '';
        this._words.forEach((wordData, index) => {
            html += this._renderCard(wordData, index);
        });
        list.innerHTML = html;
        this._bindCardEvents();
        this._initCanvasEvents();
    },

    _renderCard(wordData, index) {
        const word = wordData.word || wordData;
        const meaning = wordData.translations || wordData.meaning || '';
        const phonetic = wordData.phonetic || wordData.state?.phonetic || '';

        if (this._settings.inputMode === 'keyboard') {
            return this._renderKeyboardCard(word, meaning, phonetic, index);
        }
        return this._renderHandwritingCard(word, meaning, phonetic, index);
    },

    _renderKeyboardCard(word, meaning, phonetic, index) {
        const mode = this._settings.mode;
        let leftContent, rightContent, placeholder;

        if (mode === 'word') {
            leftContent = meaning || phonetic;
            placeholder = '填写单词';
        } else if (mode === 'meaning') {
            leftContent = word;
            placeholder = '填写释义';
        } else {
            leftContent = word;
            placeholder = '填写音标';
        }

        return `
            <div class="dict-card dict-keyboard" data-index="${index}">
                <div class="dict-card-left">${leftContent || word}</div>
                <div class="dict-card-divider"></div>
                <div class="dict-card-right">
                    <div class="dict-input-wrapper">
                        <input type="text" class="dict-input" data-index="${index}"
                            placeholder="${placeholder}" autocomplete="off" spellcheck="false"
                            ${index === 0 ? 'autofocus' : ''}>
                        <span class="dict-check-result" id="dictCheck${index}"></span>
                    </div>
                    <div class="dict-card-actions">
                        <button class="dict-show-btn" data-index="${index}">显示</button>
                        <button class="dict-skip-btn" data-index="${index}">跳过</button>
                    </div>
                </div>
            </div>
        `;
    },

    _renderHandwritingCard(word, meaning, phonetic, index) {
        const mode = this._settings.mode;
        let leftContent, rightContent;

        if (mode === 'word') {
            leftContent = meaning || phonetic;
            rightContent = word;
        } else if (mode === 'meaning') {
            leftContent = word;
            rightContent = meaning;
        } else {
            leftContent = word;
            rightContent = phonetic;
        }

        return `
            <div class="dict-card dict-handwriting" data-index="${index}">
                <div class="dict-card-left">${leftContent || word}</div>
                <div class="dict-card-divider"></div>
                <div class="dict-card-right">
                    <div class="dict-canvas-wrapper">
                        <canvas class="dict-canvas" data-index="${index}"
                            width="280" height="80"></canvas>
                        <div class="dict-canvas-tools">
                            <button class="dict-tool-btn dict-eraser-btn" data-index="${index}" title="橡皮擦">🧹</button>
                            <button class="dict-tool-btn dict-undo-btn" data-index="${index}" title="撤销">↩️</button>
                            <button class="dict-tool-btn dict-clear-btn" data-index="${index}" title="清空">🗑️</button>
                        </div>
                    </div>
                    <div class="dict-answer-toggle">
                        <button class="dict-show-answer-btn" data-index="${index}">👁️ 对照答案</button>
                        <div class="dict-answer-display" id="dictAnswer${index}" style="display:none;">
                            <span style="color:var(--vl-primary);font-weight:500;">${rightContent}</span>
                        </div>
                    </div>
                    <div class="dict-result-marker">
                        <button class="dict-mark-btn dict-mark-correct" data-index="${index}">✓ 我写对了</button>
                        <button class="dict-mark-btn dict-mark-wrong" data-index="${index}">✗ 我写错了</button>
                    </div>
                </div>
                <div class="dict-card-actions">
                    <button class="dict-skip-btn" data-index="${index}">跳过</button>
                </div>
            </div>
        `;
    },

    _bindCardEvents() {
        if (this._settings.inputMode === 'keyboard') {
            document.querySelectorAll('.dict-input').forEach(input => {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const index = parseInt(input.dataset.index);
                        this._checkKeyboardAnswer(index);
                        const nextInput = document.querySelector(`.dict-input[data-index="${index + 1}"]`);
                        if (nextInput) nextInput.focus();
                    }
                });
                input.addEventListener('blur', (e) => {
                    const index = parseInt(input.dataset.index);
                    if (input.value.trim()) {
                        this._checkKeyboardAnswer(index);
                    }
                });
            });

            document.querySelectorAll('.dict-show-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(btn.dataset.index);
                    this._showAnswer(index);
                });
            });
        }

        if (this._settings.inputMode === 'handwriting') {
            document.querySelectorAll('.dict-show-answer-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(btn.dataset.index);
                    const answerDisplay = document.getElementById(`dictAnswer${index}`);
                    if (answerDisplay) {
                        const isVisible = answerDisplay.style.display !== 'none';
                        answerDisplay.style.display = isVisible ? 'none' : 'block';
                        btn.textContent = isVisible ? '👁️ 对照答案' : '🙈 隐藏答案';
                    }
                });
            });

            document.querySelectorAll('.dict-mark-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(btn.dataset.index);
                    const isCorrect = btn.classList.contains('dict-mark-correct');
                    this._markHandwritingResult(index, isCorrect);
                });
            });
        }

        document.querySelectorAll('.dict-skip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.index);
                this._skipWord(index);
            });
        });
    },

    _checkKeyboardAnswer(index) {
        const input = document.querySelector(`.dict-input[data-index="${index}"]`);
        const checkEl = document.getElementById(`dictCheck${index}`);
        if (!input || !checkEl) return;

        const userAnswer = input.value.trim();
        const wordData = this._words[index];
        const word = wordData.word || wordData;
        const mode = this._settings.mode;

        let correctAnswer;
        if (mode === 'word') {
            correctAnswer = word;
        } else if (mode === 'meaning') {
            correctAnswer = wordData.translations || wordData.meaning || '';
        } else {
            correctAnswer = wordData.phonetic || wordData.state?.phonetic || '';
        }

        let isCorrect = false;
        if (userAnswer) {
            if (mode === 'word') {
                isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
            } else {
                const normUser = userAnswer.replace(/[，。、；：！？\s,.!?;:]/g, '');
                const normCorrect = correctAnswer.replace(/[，。、；：！？\s,.!?;:]/g, '');
                isCorrect = normUser === normCorrect || normCorrect.includes(normUser) || normUser.includes(normCorrect);
            }
        }

        const card = document.querySelector(`.dict-card[data-index="${index}"]`);
        if (card) {
            card.classList.remove('dict-correct', 'dict-wrong');
            card.classList.add(isCorrect ? 'dict-correct' : 'dict-wrong');
        }

        checkEl.textContent = isCorrect ? '✓' : '✗';
        checkEl.className = 'dict-check-result ' + (isCorrect ? 'dict-check-correct' : 'dict-check-wrong');

        if (!this._results[index]) {
            this._results[index] = { word, correctAnswer, userAnswer, isCorrect, mode, skipped: false };
        } else {
            this._results[index].userAnswer = userAnswer;
            this._results[index].isCorrect = isCorrect;
            this._results[index].skipped = false;
        }
    },

    _showAnswer(index) {
        const wordData = this._words[index];
        const word = wordData.word || wordData;
        const input = document.querySelector(`.dict-input[data-index="${index}"]`);
        if (!input) return;

        const mode = this._settings.mode;
        let correctAnswer;
        if (mode === 'word') {
            correctAnswer = word;
        } else if (mode === 'meaning') {
            correctAnswer = wordData.translations || wordData.meaning || '';
        } else {
            correctAnswer = wordData.phonetic || wordData.state?.phonetic || '';
        }

        input.value = correctAnswer;
        this._checkKeyboardAnswer(index);

        const card = document.querySelector(`.dict-card[data-index="${index}"]`);
        if (card) {
            card.classList.add('dict-showing-answer');
        }
    },

    _skipWord(index) {
        const wordData = this._words[index];
        const word = wordData.word || wordData;

        const card = document.querySelector(`.dict-card[data-index="${index}"]`);
        if (card) {
            card.classList.add('dict-skipped');
        }

        this._results[index] = { word, correctAnswer: '', userAnswer: '', isCorrect: false, skipped: true };
    },

    _markHandwritingResult(index, isCorrect) {
        const wordData = this._words[index];
        const word = wordData.word || wordData;

        const card = document.querySelector(`.dict-card[data-index="${index}"]`);
        if (card) {
            card.classList.remove('dict-correct', 'dict-wrong');
            card.classList.add(isCorrect ? 'dict-correct' : 'dict-wrong');
        }

        if (!this._results[index]) {
            const mode = this._settings.mode;
            let correctAnswer;
            if (mode === 'word') {
                correctAnswer = word;
            } else if (mode === 'meaning') {
                correctAnswer = wordData.translations || wordData.meaning || '';
            } else {
                correctAnswer = wordData.phonetic || wordData.state?.phonetic || '';
            }
            this._results[index] = { word, correctAnswer, userAnswer: '', isCorrect, mode, skipped: false };
        } else {
            this._results[index].isCorrect = isCorrect;
            this._results[index].skipped = false;
        }
    },

    _initCanvasEvents() {
        if (this._settings.inputMode !== 'handwriting') return;

        document.querySelectorAll('.dict-canvas').forEach(canvas => {
            this._setupCanvas(canvas);
        });
    },

    _setupCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const index = parseInt(canvas.dataset.index);
        let strokeHistory = [];
        let isDrawing = false;

        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#eaeaea';

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            if (e.touches) {
                return {
                    x: (e.touches[0].clientX - rect.left) * scaleX,
                    y: (e.touches[0].clientY - rect.top) * scaleY
                };
            }
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        const startDrawing = (e) => {
            e.preventDefault();
            isDrawing = true;
            const pos = getPos(e);
            strokeHistory.push([]);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            strokeHistory[strokeHistory.length - 1].push({ x: pos.x, y: pos.y, type: 'move' });
        };

        const draw = (e) => {
            e.preventDefault();
            if (!isDrawing) return;
            const pos = getPos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            strokeHistory[strokeHistory.length - 1].push({ x: pos.x, y: pos.y, type: 'line' });
        };

        const stopDrawing = (e) => {
            isDrawing = false;
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        const eraserBtn = document.querySelector(`.dict-eraser-btn[data-index="${index}"]`);
        const undoBtn = document.querySelector(`.dict-undo-btn[data-index="${index}"]`);
        const clearBtn = document.querySelector(`.dict-clear-btn[data-index="${index}"]`);

        if (eraserBtn) {
            eraserBtn.addEventListener('click', () => {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.arc(140, 40, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            });
        }

        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                if (strokeHistory.length > 0) {
                    strokeHistory.pop();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.beginPath();
                    for (const stroke of strokeHistory) {
                        for (const point of stroke) {
                            if (point.type === 'move') {
                                ctx.moveTo(point.x, point.y);
                            } else {
                                ctx.lineTo(point.x, point.y);
                            }
                        }
                        ctx.stroke();
                        ctx.beginPath();
                    }
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                strokeHistory = [];
            });
        }
    },

    _submitAll() {
        const total = this._words.length;
        let correctCount = 0;
        let wrongCount = 0;
        let skippedCount = 0;
        let wrongWords = [];
        const duration = Math.round((Date.now() - this._startTime) / 1000);

        this._results.forEach((result, index) => {
            if (!result) {
                const wordData = this._words[index];
                const word = wordData.word || wordData;
                this._results[index] = {
                    word,
                    correctAnswer: '',
                    userAnswer: '',
                    isCorrect: false,
                    skipped: true
                };
                skippedCount++;
                wrongWords.push({ word, status: 'skipped' });
            } else if (result.skipped) {
                skippedCount++;
                wrongWords.push({ word: result.word, status: 'skipped' });
            } else if (result.isCorrect) {
                correctCount++;
            } else {
                wrongCount++;
                wrongWords.push({ word: result.word, status: 'wrong' });
            }
        });

        wrongWords.forEach(({ word }) => {
            LearningEngine.recordReview(word, false);
        });

        const correctWords = this._results
            .filter(r => r && r.isCorrect && !r.skipped)
            .map(r => r.word);
        correctWords.forEach(word => {
            LearningEngine.recordReview(word, true);
        });

        this._showResult({ total, correct: correctCount, wrong: wrongCount, skipped: skippedCount, wrongWords, duration });
    },

    _showResult(result) {
        if (!this._container) return;
        const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
        const mins = Math.floor(result.duration / 60);
        const secs = result.duration % 60;

        let wrongListHtml = '';
        result.wrongWords.forEach(({ word, status }) => {
            const resultData = this._results.find(r => r.word === word);
            const correctAnswer = resultData ? resultData.correctAnswer : '';
            wrongListHtml += `
                <div class="dict-result-item ${status === 'skipped' ? 'dict-result-skipped' : 'dict-result-wrong'}">
                    <span class="dict-result-word">${word}</span>
                    <span class="dict-result-status">${status === 'skipped' ? '跳过' : '错误'}</span>
                    ${correctAnswer ? `<span class="dict-result-answer">正确: ${correctAnswer}</span>` : ''}
                </div>
            `;
        });

        this._container.innerHTML = `
            <div class="vl-section-card" style="text-align:center;padding:32px 20px;margin-bottom:16px;">
                <div style="font-size:48px;margin-bottom:12px;">
                    ${pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
                </div>
                <div style="font-size:22px;font-weight:700;color:var(--vl-text);margin-bottom:4px;">
                    默写完成！
                </div>
                <div style="font-size:15px;color:var(--vl-text-secondary);margin-bottom:16px;">
                    ${this._settings.inputMode === 'keyboard' ? '⌨️ 键盘模式' : '✍️ 手写模式'} · ${mins}分${secs}秒
                </div>
                <div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;max-width:300px;margin:0 auto 16px;">
                    <div style="height:100%;width:${pct}%;background:${pct >= 80 ? 'var(--vl-success)' : pct >= 50 ? 'var(--vl-warning)' : 'var(--vl-primary)'};border-radius:4px;transition:width 0.5s;"></div>
                </div>
                <div style="display:flex;gap:16px;justify-content:center;font-size:14px;color:var(--vl-text);">
                    <span>✅ 正确 <strong>${result.correct}</strong></span>
                    <span>❌ 错误 <strong>${result.wrong}</strong></span>
                    <span>⏭️ 跳过 <strong>${result.skipped}</strong></span>
                </div>
            </div>
            ${wrongListHtml ? `
            <div class="vl-section-title">❌ 错误单词</div>
            <div class="dict-result-list">${wrongListHtml}</div>
            ` : ''}
            <div style="display:flex;gap:10px;margin-top:16px;">
                <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="dictResultBack" style="flex:1;">返回学习首页</button>
                <button class="vl-action-btn vl-btn-primary vl-btn-sm" id="dictResultRetry" style="flex:1;">重新默写</button>
            </div>
        `;

        document.getElementById('dictResultBack').addEventListener('click', () => {
            VocabLearning._renderHomeTab();
        });
        document.getElementById('dictResultRetry').addEventListener('click', () => {
            VocabLearning._startDictation();
        });
    },

    getSettingsForDictation() {
        const settings = LearningEngine.getSettings();
        return {
            inputMode: 'keyboard',
            mode: 'word',
            wordCount: Math.min(20, settings.dailyReviewLimit),
            autoCheck: true
        };
    },

    destroy() {
        this._container = null;
        this._words = [];
        this._results = [];
        this._currentIndex = 0;
        this._startTime = null;
    }
};

window.DictationPractice = DictationPractice;
