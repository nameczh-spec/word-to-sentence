/**
 * 单词学习模块 - 模仿"不背单词"App
 * 功能：首页任务卡片、学习/复习卡片翻转、结果统计、单词本
 * 切换逻辑与真题练习模块保持一致
 */
const VocabLearning = (() => {
    let isActive = false;
    let currentView = 'home'; // home | study | result | words
    let studyWords = [];
    let studyIndex = 0;
    let studyCorrect = 0;
    let studyTotal = 0;
    let isCardFlipped = false;
    let flippedBy = ''; // '' | 'card' | 'correct'  翻转方式：点击卡片 / 点击认识按钮
    let _initialized = false;
    let _voicesReady = false;
    let _englishVoice = null;

    function initVoices() {
        if (_voicesReady) return;
        if (typeof speechSynthesis === 'undefined') return;

        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) return;

        const enVoices = voices.filter(v => /en[-_]/i.test(v.lang) || v.lang === 'en');
        if (enVoices.length > 0) {
            _englishVoice = enVoices.find(v => /en[-_]us/i.test(v.lang)) || enVoices[0];
        }
        _voicesReady = true;
    }

    function speakWord(word) {
        if (!word || typeof speechSynthesis === 'undefined') return;

        if (!_voicesReady) {
            initVoices();
        }

        try {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;

            if (_englishVoice) {
                utterance.voice = _englishVoice;
            }

            if (speechSynthesis.paused) {
                speechSynthesis.resume();
            }

            speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('语音播放失败:', e);
        }
    }

    function init() {
        if (_initialized) return;
        _bindEvents();
        _initialized = true;

        if (typeof speechSynthesis !== 'undefined') {
            initVoices();
            speechSynthesis.onvoiceschanged = initVoices;
        }

        console.log('[VocabLearning] 学习模块已初始化');
    }

    /**
     * 切换显示/隐藏（统一入口）
     * 点击当前激活的按钮 → 退出到主界面
     * 点击未激活的按钮 → 关闭其他模块后进入本模块
     */
    function toggleMode() {
        if (isActive) {
            exitMode();
        } else {
            // 模块互斥：关闭其他模块（静默退出，不恢复主界面）
            if (window.PastPapers && PastPapers.isActive) {
                PastPapers.exitMode(true);
            }
            enterMode();
        }
    }

    /**
     * 进入单词学习模式
     */
    function enterMode() {
        isActive = true;
        currentView = 'home';

        // 隐藏侧边栏
        const sidebar = document.getElementById('sidebarLeft');
        if (sidebar) sidebar.style.display = 'none';

        // 隐藏主内容区
        const mainContent = document.getElementById('mainContent');
        if (mainContent) mainContent.style.display = 'none';

        // 隐藏底部操作栏
        const actionBar = document.querySelector('.action-bar');
        if (actionBar) actionBar.style.display = 'none';

        // 显示学习页面
        const root = document.getElementById('vocabLearningRoot');
        if (root) root.classList.add('active');

        // 激活导航按钮
        const btn = document.getElementById('vocabLearningBtn');
        if (btn) btn.classList.add('active');

        // 更新标题
        const title = document.querySelector('.nav-title');
        if (title) {
            if (!title.dataset.original) {
                title.dataset.original = title.textContent;
            }
            title.textContent = '单词学习';
        }

        // 渲染首页
        renderHome();
    }

    /**
     * 退出单词学习模式
     * @param {boolean} silent - 静默退出（模块切换时使用，不恢复主界面元素）
     */
    function exitMode(silent) {
        isActive = false;
        currentView = 'home';
        studyWords = [];
        studyIndex = 0;

        // 隐藏学习页面
        const root = document.getElementById('vocabLearningRoot');
        if (root) root.classList.remove('active');

        // 取消导航按钮激活
        const btn = document.getElementById('vocabLearningBtn');
        if (btn) btn.classList.remove('active');

        if (!silent) {
            // 恢复侧边栏
            const sidebar = document.getElementById('sidebarLeft');
            if (sidebar) sidebar.style.display = '';

            // 恢复主内容区
            const mainContent = document.getElementById('mainContent');
            if (mainContent) mainContent.style.display = '';

            // 恢复底部操作栏
            const actionBar = document.querySelector('.action-bar');
            if (actionBar) actionBar.style.display = '';

            // 恢复标题
            const title = document.querySelector('.nav-title');
            if (title) {
                title.textContent = title.dataset.original || '单词化句';
            }
        }

        // 关闭设置面板
        closeSettings();
    }

    /**
     * 渲染首页
     */
    function renderHome() {
        switchView('home');

        const stats = LearningEngine.getStats();
        const dueCount = LearningEngine.getDueCount();
        const newCount = LearningEngine.getTodayNewWords().length;
        const learningCount = LearningEngine.getLearningCount();
        const masteredCount = LearningEngine.getMasteredCount();

        // 更新今日任务
        const newEl = document.getElementById('vlNewCount');
        const reviewEl = document.getElementById('vlReviewCount');
        if (newEl) newEl.textContent = newCount;
        if (reviewEl) reviewEl.textContent = dueCount;

        // 更新日期
        const dateEl = document.getElementById('vlTodayDate');
        if (dateEl) {
            const now = new Date();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            dateEl.textContent = `${month}月${day}日`;
        }

        // 更新统计
        const totalEl = document.getElementById('vlTotalLearned');
        const masteredEl = document.getElementById('vlMasteredCount');
        const streakEl = document.getElementById('vlStreakDays');
        if (totalEl) totalEl.textContent = stats.totalLearned;
        if (masteredEl) masteredEl.textContent = masteredCount;
        if (streakEl) streakEl.textContent = stats.streak;
    }

    /**
     * 开始学习/复习
     */
    async function startStudy() {
        const settings = LearningEngine.getSettings();
        const selectedBookId = settings?.selectedBookId;

        if (!selectedBookId) {
            if (window.InteractionManager) {
                InteractionManager.showToast('请先选择词书', 'info');
            }
            return;
        }

        // 加载词书单词到缓存
        let bookWords = _bookCache[selectedBookId];
        if (!bookWords) {
            const book = BUILTIN_BOOKS.find(b => b.id === selectedBookId);
            if (book) {
                bookWords = await loadBookWords(book.path);
                _bookCache[selectedBookId] = bookWords;
            }
        }

        if (!bookWords || bookWords.length === 0) {
            if (window.InteractionManager) {
                InteractionManager.showToast('词书加载失败', 'error');
            }
            return;
        }

        // 补充今日新词到学习队列
        const dailyNew = settings.dailyNewWords || 20;
        LearningEngine.supplementNewWords(bookWords, dailyNew);

        // 获取今日需要学习/复习的单词
        const reviewWords = LearningEngine.getTodayReviewWords();
        const newWords = LearningEngine.getTodayNewWords();
        studyWords = [...reviewWords, ...newWords];

        if (studyWords.length === 0) {
            if (window.InteractionManager) {
                InteractionManager.showToast('暂无可学习的单词', 'info');
            }
            return;
        }

        studyIndex = 0;
        studyCorrect = 0;
        studyTotal = studyWords.length;
        isCardFlipped = false;

        switchView('study');
        renderCard();
    }

    /**
     * 渲染当前卡片
     */
    function renderCard() {
        if (studyIndex >= studyTotal) {
            showResult();
            return;
        }

        const current = studyWords[studyIndex];
        const progress = ((studyIndex + 1) / studyTotal) * 100;

        const fillEl = document.getElementById('vlProgressFill');
        const textEl = document.getElementById('vlProgressText');
        if (fillEl) fillEl.style.width = progress + '%';
        if (textEl) textEl.textContent = `${studyIndex + 1}/${studyTotal}`;

        const cardArea = document.getElementById('vlCardArea');
        if (!cardArea) return;

        const word = current.word || '';
        const phonetic = current.state?.phonetic || '';
        const translations = current.state?.translations || [];
        const phrases = current.state?.phrases || [];

        function buildMeaningHtml(trans) {
            if (Array.isArray(trans) && trans.length > 0) {
                return trans.map(t => {
                    const type = t.type ? `<span class="vl-pos">${t.type}.</span>` : '';
                    const text = t.translation || t || '';
                    return `<div class="vl-meaning-item">${type}<span class="vl-meaning-text">${text}</span></div>`;
                }).join('');
            } else if (typeof trans === 'string' && trans) {
                return `<div class="vl-meaning-item"><span class="vl-meaning-text">${trans}</span></div>`;
            }
            return '<div class="vl-meaning-item"><span class="vl-meaning-text">暂无释义</span></div>';
        }

        function buildPhrasesHtml(phraseList) {
            if (!phraseList || phraseList.length === 0) return '';
            const items = phraseList.slice(0, 5).map(p => `
                <div class="vl-phrase-item">
                    <div class="vl-phrase-en">${p.phrase || ''}</div>
                    <div class="vl-phrase-cn">${p.translation || ''}</div>
                </div>
            `).join('');
            return `
                <div class="vl-phrases-section">
                    <div class="vl-phrases-title">常用短语</div>
                    ${items}
                </div>
            `;
        }

        const meaningHtml = buildMeaningHtml(translations);
        const phrasesHtml = buildPhrasesHtml(phrases);

        const speakerSvg = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
        `;

        cardArea.innerHTML = `
            <div class="vl-word-card" id="vlWordCard">
                <div class="vl-card-front">
                    <div class="vl-word-text">${word}</div>
                    ${phonetic ? `
                    <div class="vl-phonetic-row">
                        <span class="vl-word-phonetic">${phonetic}</span>
                        <button class="vl-speaker-btn" id="vlSpeakerBtn" title="发音">${speakerSvg}</button>
                    </div>` : ''}
                    <div class="vl-card-hint">点击卡片查看释义</div>
                </div>
                <div class="vl-card-back">
                    <div class="vl-word-text vl-back-word">${word}</div>
                    ${phonetic ? `
                    <div class="vl-phonetic-row">
                        <span class="vl-word-phonetic">${phonetic}</span>
                        <button class="vl-speaker-btn" id="vlSpeakerBtnBack" title="发音">${speakerSvg}</button>
                    </div>` : ''}
                    <div class="vl-word-meaning">${meaningHtml}</div>
                    ${phrasesHtml}
                </div>
            </div>
        `;

        renderStudyActions();

        isCardFlipped = false;
        flippedBy = '';

        const card = document.getElementById('vlWordCard');
        if (card) {
            card.addEventListener('click', handleCardClick);
        }

        const speakerBtn = document.getElementById('vlSpeakerBtn');
        if (speakerBtn) {
            speakerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                speakWord(word);
            });
        }

        const speakerBtnBack = document.getElementById('vlSpeakerBtnBack');
        if (speakerBtnBack) {
            speakerBtnBack.addEventListener('click', (e) => {
                e.stopPropagation();
                speakWord(word);
            });
        }

        const settings = LearningEngine.getSettings();
        if (settings?.autoPlayAudio) {
            setTimeout(() => speakWord(word), 300);
        }
    }

    /**
     * 渲染学习操作按钮
     */
    function renderStudyActions() {
        const actionsEl = document.getElementById('vlCardActions');
        if (!actionsEl) return;

        if (!isCardFlipped) {
            actionsEl.innerHTML = `
                <button class="vl-action-btn vl-btn-correct" id="vlCorrectBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>认识</span>
                </button>
            `;

            const correctBtn = document.getElementById('vlCorrectBtn');
            if (correctBtn) correctBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleCorrect();
            });
        } else if (flippedBy === 'card') {
            actionsEl.innerHTML = `
                <button class="vl-action-btn vl-btn-next" id="vlNextBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"></path>
                    </svg>
                    <span>下一个单词</span>
                </button>
            `;

            const nextBtn = document.getElementById('vlNextBtn');
            if (nextBtn) nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                nextWord();
            });
        } else if (flippedBy === 'correct') {
            actionsEl.innerHTML = `
                <button class="vl-action-btn vl-btn-next" id="vlNextBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"></path>
                    </svg>
                    <span>下一个</span>
                </button>
                <button class="vl-action-btn vl-btn-mistake" id="vlMistakeBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>记错了</span>
                </button>
            `;

            const nextBtn = document.getElementById('vlNextBtn');
            if (nextBtn) nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleConfirmCorrect();
            });

            const mistakeBtn = document.getElementById('vlMistakeBtn');
            if (mistakeBtn) mistakeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleMistake();
            });
        }
    }

    /**
     * 处理卡片点击
     */
    function handleCardClick() {
        if (!isCardFlipped) {
            flippedBy = 'card';
            flipCard();
            LearningEngine.recordReview(studyWords[studyIndex].word, false);
            renderStudyActions();
        }
    }

    /**
     * 处理"认识"按钮点击
     */
    function handleCorrect() {
        flippedBy = 'correct';
        flipCard();
        renderStudyActions();
    }

    /**
     * 确认认识（点击下一个）
     */
    function handleConfirmCorrect() {
        LearningEngine.recordReview(studyWords[studyIndex].word, true);
        studyCorrect++;
        nextWord();
    }

    /**
     * 处理"记错了"
     */
    function handleMistake() {
        LearningEngine.recordReview(studyWords[studyIndex].word, false);
        nextWord();
    }

    /**
     * 翻转卡片
     */
    function flipCard() {
        const card = document.getElementById('vlWordCard');
        if (!card) return;
        isCardFlipped = !isCardFlipped;
        if (isCardFlipped) {
            card.classList.add('flipped');
        } else {
            card.classList.remove('flipped');
        }
    }

    /**
     * 下一个单词
     */
    function nextWord() {
        studyIndex++;
        isCardFlipped = false;
        renderCard();
    }

    /**
     * 记录答题结果
     */
    function recordAnswer(isCorrect) {
        const current = studyWords[studyIndex];
        if (!current) return;

        LearningEngine.recordReview(current.word, isCorrect);

        if (isCorrect) {
            studyCorrect++;
        }

        studyIndex++;
        isCardFlipped = false;
        renderCard();
    }

    /**
     * 显示学习结果
     */
    function showResult() {
        switchView('result');

        const pct = studyTotal > 0 ? Math.round((studyCorrect / studyTotal) * 100) : 0;
        const wrongCount = studyTotal - studyCorrect;

        const iconClass = pct >= 80 ? 'success' : 'normal';
        const titleText = pct >= 80 ? '太棒了！' : pct >= 50 ? '继续加油！' : '需要努力';
        const descText = `正确率 ${pct}%`;

        const resultCard = document.getElementById('vlResultCard');
        if (!resultCard) return;

        resultCard.innerHTML = `
            <div class="vl-result-icon ${iconClass}">
                ${pct >= 80 ?
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' :
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
                }
            </div>
            <div class="vl-result-title">${titleText}</div>
            <div class="vl-result-desc">${descText}</div>
            <div class="vl-result-stats">
                <div class="vl-result-stat">
                    <div class="vl-result-stat-num correct">${studyCorrect}</div>
                    <div class="vl-result-stat-label">认识</div>
                </div>
                <div class="vl-result-stat">
                    <div class="vl-result-stat-num wrong">${wrongCount}</div>
                    <div class="vl-result-stat-label">不认识</div>
                </div>
                <div class="vl-result-stat">
                    <div class="vl-result-stat-num">${studyTotal}</div>
                    <div class="vl-result-stat-label">总数</div>
                </div>
            </div>
            <div class="vl-result-actions">
                <button class="vl-result-btn vl-result-btn-secondary" id="vlResultHomeBtn">返回首页</button>
                <button class="vl-result-btn vl-result-btn-primary" id="vlResultContinueBtn">继续学习</button>
            </div>
        `;

        const homeBtn = document.getElementById('vlResultHomeBtn');
        if (homeBtn) homeBtn.addEventListener('click', renderHome);

        const continueBtn = document.getElementById('vlResultContinueBtn');
        if (continueBtn) continueBtn.addEventListener('click', startStudy);
    }

    /**
     * 内置词书列表
     */
    const BUILTIN_BOOKS = [
        { id: 'kaoyan', name: '考研', path: './vocab-lib/5-考研-顺序.json', type: 'kaoyan', icon: 'kaoyan' },
        { id: 'cet4', name: '四级', path: './vocab-lib/3-CET4-顺序.json', type: 'cet4', icon: 'cet4' },
        { id: 'cet6', name: '六级', path: './vocab-lib/4-CET6-顺序.json', type: 'cet6', icon: 'cet6' }
    ];

    /**
     * 词书单词缓存（避免重复加载）
     */
    const _bookCache = {};

    /**
     * 渲染单词本（仪表盘）
     */
    function renderWords() {
        switchView('words');
        renderDashboard();
    }

    /**
     * 渲染仪表盘
     */
    function renderDashboard() {
        const settings = LearningEngine.getSettings();
        const selectedBookId = settings?.selectedBookId;
        const stats = LearningEngine.getStats();

        // 渲染正在学习的词书
        const booksRow = document.getElementById('vlLearningBooksRow');
        if (booksRow) {
            let html = '';
            if (selectedBookId) {
                const book = BUILTIN_BOOKS.find(b => b.id === selectedBookId);
                if (book) {
                    const cached = _bookCache[selectedBookId];
                    const count = cached ? cached.length : '...';
                    html += `
                        <div class="vl-learning-book-card" data-book-id="${book.id}">
                            <div class="vl-learning-book-cover ${book.type}">${book.name}</div>
                            <div class="vl-learning-book-name">${book.name}词汇</div>
                        </div>
                    `;
                }
            } else {
                html += `
                    <div class="vl-learning-book-add" id="vlAddBookCard">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>添加词书</span>
                    </div>
                `;
            }
            booksRow.innerHTML = html;

            // 绑定事件
            const addCard = document.getElementById('vlAddBookCard');
            if (addCard) {
                addCard.addEventListener('click', openBookModal);
            }
        }

        // 渲染进度条
        const progressFill = document.getElementById('vlBookProgressFill');
        const learnedEl = document.getElementById('vlBookLearned');
        const totalEl = document.getElementById('vlBookTotal');
        if (selectedBookId) {
            const cached = _bookCache[selectedBookId];
            const total = cached ? cached.length : 0;
            const totalLearned = stats?.totalLearned || 0;
            const progress = total > 0 ? Math.min(100, (totalLearned / total) * 100) : 0;
            if (progressFill) progressFill.style.width = progress + '%';
            if (learnedEl) learnedEl.textContent = '已学习 ' + totalLearned;
            if (totalEl) totalEl.textContent = total;
        } else {
            if (progressFill) progressFill.style.width = '0%';
            if (learnedEl) learnedEl.textContent = '已学习 0';
            if (totalEl) totalEl.textContent = '0';
        }

        // 渲染概览统计
        const statToday = document.getElementById('vlStatToday');
        const statTotal = document.getElementById('vlStatTotal');
        const statTodayTime = document.getElementById('vlStatTodayTime');
        const statTotalTime = document.getElementById('vlStatTotalTime');
        if (statToday) statToday.textContent = stats?.todayLearned || 0;
        if (statTotal) statTotal.textContent = stats?.totalLearned || 0;
        if (statTodayTime) statTodayTime.textContent = '0';
        if (statTotalTime) statTotalTime.textContent = '0';

        // 渲染日历
        renderCalendar();

        // 预加载词书
        if (selectedBookId && !_bookCache[selectedBookId]) {
            const book = BUILTIN_BOOKS.find(b => b.id === selectedBookId);
            if (book) {
                loadBookWords(book.path).then(words => {
                    _bookCache[selectedBookId] = words;
                    if (currentView === 'words') renderDashboard();
                });
            }
        }
    }

    /**
     * 渲染本周日历
     */
    function renderCalendar() {
        const calEl = document.getElementById('vlCalendar');
        const streakEl = document.getElementById('vlStreakDays');
        if (!calEl) return;

        const stats = LearningEngine.getStats();
        const streak = stats?.streak || 0;
        if (streakEl) streakEl.textContent = streak;

        const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        let html = '';
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - mondayOffset + i);
            const dateNum = date.getDate();
            const isToday = i === mondayOffset;
            const isFuture = date > today;
            const isChecked = !isFuture && i < mondayOffset + 1;

            html += `
                <div class="vl-calendar-weekday">${weekdays[i]}</div>
            `;
        }
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - mondayOffset + i);
            const dateNum = date.getDate();
            const isToday = i === mondayOffset;
            const isFuture = date > today;
            const isChecked = !isFuture && i < mondayOffset + 1;

            let cls = 'vl-calendar-day';
            if (isToday) cls += ' today';
            if (isFuture) cls += ' future';
            if (isChecked && !isFuture) cls += ' checked';

            html += `
                <div class="${cls}">${dateNum}</div>
            `;
        }
        calEl.innerHTML = html;
    }

    /**
     * 打开换本词书弹窗
     */
    function openBookModal() {
        const modal = document.getElementById('vlBookModal');
        if (modal) modal.style.display = 'flex';
        renderBookModalList();
    }

    /**
     * 关闭换本词书弹窗
     */
    function closeBookModal() {
        const modal = document.getElementById('vlBookModal');
        if (modal) modal.style.display = 'none';
    }

    /**
     * 渲染词书选择列表
     */
    function renderBookModalList() {
        const listEl = document.getElementById('vlBookModalList');
        if (!listEl) return;

        const settings = LearningEngine.getSettings();
        const selectedBookId = settings?.selectedBookId;

        listEl.innerHTML = BUILTIN_BOOKS.map(book => {
            const isSelected = book.id === selectedBookId;
            const cached = _bookCache[book.id];
            const count = cached ? cached.length : '...';
            return `
                <div class="vl-book-modal-item ${isSelected ? 'selected' : ''}" data-book-id="${book.id}">
                    <div class="vl-book-modal-item-cover ${book.type}">${book.name}</div>
                    <div class="vl-book-modal-item-info">
                        <div class="vl-book-modal-item-name">${book.name}词汇</div>
                        <div class="vl-book-modal-item-count">${count} 词</div>
                    </div>
                    <div class="vl-book-modal-item-check">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </div>
            `;
        }).join('');

        // 绑定点击事件
        listEl.querySelectorAll('.vl-book-modal-item').forEach(item => {
            item.addEventListener('click', async () => {
                await selectWordBook(item.dataset.bookId);
                closeBookModal();
                renderDashboard();
            });
        });

        // 预加载词书数量
        BUILTIN_BOOKS.forEach(book => {
            if (!_bookCache[book.id]) {
                loadBookWords(book.path).then(words => {
                    _bookCache[book.id] = words;
                    if (document.getElementById('vlBookModal')?.style.display === 'flex') {
                        renderBookModalList();
                    }
                });
            }
        });
    }

    /**
     * 异步加载词书单词
     */
    async function loadBookWords(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error('加载失败');
            const data = await response.json();
            return data;
        } catch (e) {
            console.error('[VocabLearning] 加载词书失败:', path, e);
            return [];
        }
    }

    /**
     * 选择词书（清空旧进度，只记录选中状态）
     */
    async function selectWordBook(bookId) {
        const book = BUILTIN_BOOKS.find(b => b.id === bookId);
        if (!book) return;

        // 显示加载提示
        if (window.InteractionManager) {
            InteractionManager.showToast('正在切换词书...', 'info');
        }

        // 加载词书单词到内存缓存
        let words = _bookCache[bookId];
        if (!words) {
            words = await loadBookWords(book.path);
            _bookCache[bookId] = words;
        }

        if (words.length === 0) {
            if (window.InteractionManager) {
                InteractionManager.showToast('词书加载失败', 'error');
            }
            return;
        }

        // 清空旧的学习进度，避免旧数据污染
        LearningEngine.clearWords();

        // 保存选中的词书ID
        LearningEngine.updateSettings({ selectedBookId: bookId });

        // 刷新界面
        renderDashboard();

        if (window.InteractionManager) {
            InteractionManager.showToast(`已切换到「${book.name}」词书，共 ${words.length} 词`, 'success');
        }
    }

    /**
     * 打开设置面板
     */
    function openSettings() {
        const panel = document.getElementById('vlSettingsPanel');
        if (panel) panel.classList.add('active');
        renderSettings();
    }

    /**
     * 关闭设置面板
     */
    function closeSettings() {
        const panel = document.getElementById('vlSettingsPanel');
        if (panel) panel.classList.remove('active');
    }

    /**
     * 渲染设置内容
     */
    function renderSettings() {
        const body = document.getElementById('vlSettingsBody');
        if (!body) return;

        const settings = LearningEngine.getSettings();
        const curves = LearningEngine.CURVES;

        let curveOptions = '';
        for (const [id, curve] of Object.entries(curves)) {
            const selected = id === settings.curveId ? 'selected' : '';
            curveOptions += `<option value="${id}" ${selected}>${curve.name}</option>`;
        }

        body.innerHTML = `
            <div class="vl-settings-section">
                <div class="vl-settings-section-title">学习计划</div>
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
                    <select class="vl-select" id="vlCurveSelect">${curveOptions}</select>
                </div>
                <div class="vl-settings-row">
                    <div>
                        <div class="vl-settings-label">自动播放发音</div>
                        <div class="vl-settings-desc">学习时自动朗读单词</div>
                    </div>
                    <button class="vl-toggle ${settings.autoPlayAudio ? 'on' : ''}" id="vlAutoAudioToggle"></button>
                </div>
                <div class="vl-settings-row">
                    <div>
                        <div class="vl-settings-label">三级评价模式</div>
                        <div class="vl-settings-desc">认识/模糊/不认识 三档评价</div>
                    </div>
                    <button class="vl-toggle ${settings.threeLevelReview ? 'on' : ''}" id="vlThreeLevelToggle"></button>
                </div>
                <div class="vl-settings-row">
                    <div>
                        <div class="vl-settings-label">拼写练习模式</div>
                        <div class="vl-settings-desc">学习后进行单词拼写测试</div>
                    </div>
                    <button class="vl-toggle ${settings.dictationMode ? 'on' : ''}" id="vlDictationToggle"></button>
                </div>
            </div>
            <div class="vl-settings-section">
                <div class="vl-settings-section-title">数据管理</div>
                <div class="vl-settings-actions">
                    <button class="vl-settings-btn" id="vlExportBtn">导出数据</button>
                    <button class="vl-settings-btn" id="vlImportBtn">导入数据</button>
                </div>
                <div class="vl-settings-actions" style="margin-top:8px;">
                    <button class="vl-settings-btn danger" id="vlResetBtn">重置所有数据</button>
                </div>
            </div>
        `;

        // 绑定保存事件
        const dailyInput = document.getElementById('vlDailyNewWords');
        const reviewInput = document.getElementById('vlDailyReviewLimit');
        const curveSelect = document.getElementById('vlCurveSelect');

        const saveSettings = () => {
            const dailyNewWords = parseInt(dailyInput.value) || 20;
            const dailyReviewLimit = parseInt(reviewInput.value) || 50;
            const curveId = curveSelect.value;
            LearningEngine.updateSettings({ dailyNewWords, dailyReviewLimit, curveId });
            if (window.InteractionManager) {
                InteractionManager.showToast('设置已保存', 'success');
            }
        };

        if (dailyInput) dailyInput.addEventListener('change', saveSettings);
        if (reviewInput) reviewInput.addEventListener('change', saveSettings);
        if (curveSelect) curveSelect.addEventListener('change', saveSettings);

        const toggle = document.getElementById('vlAutoAudioToggle');
        if (toggle) {
            toggle.addEventListener('click', function () {
                const isOn = this.classList.toggle('on');
                LearningEngine.updateSettings({ autoPlayAudio: isOn });
            });
        }

        const threeLevelToggle = document.getElementById('vlThreeLevelToggle');
        if (threeLevelToggle) {
            threeLevelToggle.addEventListener('click', function () {
                const isOn = this.classList.toggle('on');
                LearningEngine.updateSettings({ threeLevelReview: isOn });
            });
        }

        const dictationToggle = document.getElementById('vlDictationToggle');
        if (dictationToggle) {
            dictationToggle.addEventListener('click', function () {
                const isOn = this.classList.toggle('on');
                LearningEngine.updateSettings({ dictationMode: isOn });
            });
        }

        const exportBtn = document.getElementById('vlExportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
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
        }

        const importBtn = document.getElementById('vlImportBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
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
                            if (window.InteractionManager) {
                                InteractionManager.showToast('导入成功，请刷新页面', 'success');
                            }
                        } catch (err) {
                            if (window.InteractionManager) {
                                InteractionManager.showToast('导入失败：数据格式错误', 'error');
                            }
                        }
                    };
                    reader.readAsText(file);
                });
                input.click();
            });
        }

        const resetBtn = document.getElementById('vlResetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('确定要重置所有学习数据吗？此操作不可撤销！')) {
                    localStorage.removeItem(LearningEngine._getKey());
                    if (window.InteractionManager) {
                        InteractionManager.showToast('学习数据已重置', 'info');
                    }
                    renderHome();
                }
            });
        }
    }

    /**
     * 切换视图
     */
    function switchView(viewName) {
        currentView = viewName;

        // 隐藏所有视图
        document.querySelectorAll('.vl-view').forEach(v => v.classList.remove('active'));

        // 显示目标视图
        const viewMap = {
            'home': 'vlHomeView',
            'study': 'vlStudyView',
            'result': 'vlResultView',
            'words': 'vlWordsView'
        };

        const targetView = document.getElementById(viewMap[viewName]);
        if (targetView) targetView.classList.add('active');

        // 更新底部导航栏
        document.querySelectorAll('.vl-tabbar-item').forEach(tab => tab.classList.remove('active'));
        const tabMap = {
            'home': 'vlTabHome',
            'words': 'vlTabWords',
            'study': null,
            'result': null
        };
        if (tabMap[viewName]) {
            const tab = document.getElementById(tabMap[viewName]);
            if (tab) tab.classList.add('active');
        }
    }

    /**
     * 绑定事件
     */
    function _bindEvents() {
        // 开始学习按钮
        const startBtn = document.getElementById('vlStartBtn');
        if (startBtn) {
            startBtn.addEventListener('click', startStudy);
        }

        // 底部导航栏
        document.querySelectorAll('.vl-tabbar-item').forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.dataset.view;
                if (view === 'home') renderHome();
                else if (view === 'words') renderWords();
                else if (view === 'settings') openSettings();
            });
        });

        // 设置面板关闭
        const settingsClose = document.getElementById('vlSettingsClose');
        if (settingsClose) {
            settingsClose.addEventListener('click', closeSettings);
        }
        const settingsMask = document.getElementById('vlSettingsMask');
        if (settingsMask) {
            settingsMask.addEventListener('click', closeSettings);
        }

        // 换本词书按钮
        const changeBookBtn = document.getElementById('vlChangeBookBtn');
        if (changeBookBtn) {
            changeBookBtn.addEventListener('click', openBookModal);
        }

        // 换本词书弹窗关闭
        const bookModalClose = document.getElementById('vlBookModalClose');
        if (bookModalClose) {
            bookModalClose.addEventListener('click', closeBookModal);
        }
        const bookModalMask = document.getElementById('vlBookModalMask');
        if (bookModalMask) {
            bookModalMask.addEventListener('click', closeBookModal);
        }
    }

    return {
        init,
        toggleMode,
        enterMode,
        exitMode,
        renderHome,
        get isActive() { return isActive; },
        startStudy
    };
})();

window.VocabLearning = VocabLearning;
