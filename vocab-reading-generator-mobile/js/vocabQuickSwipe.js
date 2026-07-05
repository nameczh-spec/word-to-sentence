const VocabQuickSwipe = {
    _container: null,
    _words: [],
    _currentIndex: 0,
    _isAnimating: false,

    init(container, words) {
        this._container = container;
        this._words = words || [];
        this._currentIndex = 0;
        this._isAnimating = false;
    },

    start() {
        if (!this._container || this._words.length === 0) return;
        this._render();
        this._bindSwipeEvents();
        this._speakCurrent();
    },

    _render() {
        const current = this._words[this._currentIndex];
        const word = current.word || current;
        const meaning = current.translations || current.meaning || current.state?.translations || '';
        const phonetic = current.phonetic || current.state?.phonetic || '';
        const total = this._words.length;

        this._container.innerHTML = `
            <div class="qs-container">
                <div class="qs-progress">${this._currentIndex + 1} / ${total}</div>
                <div class="qs-card" id="qsCard">
                    <div class="qs-word">${word}</div>
                    ${phonetic ? `<div class="qs-phonetic">${phonetic}</div>` : ''}
                    <div class="qs-meaning" id="qsMeaning" style="opacity:0.4;">${meaning || '暂无释义'}</div>
                </div>
                <div class="qs-hint">👆 点击显示释义 · 下滑下一个 · 上滑上一个</div>
                <div class="qs-controls">
                    <button class="qs-btn" id="qsPrevBtn">⬆ 上一个</button>
                    <button class="qs-btn qs-btn-primary" id="qsSpeakBtn">🔊 朗读</button>
                    <button class="qs-btn" id="qsNextBtn">⬇ 下一个</button>
                </div>
                <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="qsBackBtn" style="margin-top:8px;">返回</button>
            </div>
        `;

        document.getElementById('qsPrevBtn').addEventListener('click', () => this._prev());
        document.getElementById('qsNextBtn').addEventListener('click', () => this._next());
        document.getElementById('qsSpeakBtn').addEventListener('click', () => this._speakCurrent());

        const card = document.getElementById('qsCard');
        if (card) {
            card.addEventListener('click', () => {
                const meaningEl = document.getElementById('qsMeaning');
                if (meaningEl) {
                    const currentOpacity = meaningEl.style.opacity;
                    meaningEl.style.opacity = currentOpacity === '1' ? '0.4' : '1';
                }
            });
        }

        const backBtn = document.getElementById('qsBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => VocabLearning._renderHomeTab());
        }
    },

    _bindSwipeEvents() {
        const container = this._container;
        if (!container) return;

        let startY = 0;
        let startX = 0;

        container.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            if (this._isAnimating) return;
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const deltaY = startY - endY;
            const deltaX = Math.abs(endX - startX);

            if (Math.abs(deltaY) < 50 || deltaX > Math.abs(deltaY)) return;

            if (deltaY > 0) {
                this._next();
            } else {
                this._prev();
            }
        }, { passive: true });

        container.addEventListener('wheel', (e) => {
            if (this._isAnimating) return;
            if (e.deltaY > 0) {
                this._next();
            } else {
                this._prev();
            }
        }, { passive: true });

        document.addEventListener('keydown', this._keyHandler = (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                this._next();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                this._prev();
            } else if (e.key === ' ') {
                e.preventDefault();
                this._speakCurrent();
            }
        });
    },

    _next() {
        if (this._currentIndex < this._words.length - 1) {
            this._currentIndex++;
            this._animateTransition('slide-up');
            this._speakCurrent();
        }
    },

    _prev() {
        if (this._currentIndex > 0) {
            this._currentIndex--;
            this._animateTransition('slide-down');
            this._speakCurrent();
        }
    },

    _animateTransition(direction) {
        this._isAnimating = true;
        const card = document.getElementById('qsCard');
        if (card) {
            card.style.transition = 'transform 0.2s, opacity 0.2s';
            card.style.transform = direction === 'slide-up' ? 'translateY(-20px)' : 'translateY(20px)';
            card.style.opacity = '0';
        }

        setTimeout(() => {
            this._render();
            const newCard = document.getElementById('qsCard');
            if (newCard) {
                newCard.style.transition = 'transform 0.25s, opacity 0.25s';
                newCard.style.transform = direction === 'slide-up' ? 'translateY(20px)' : 'translateY(-20px)';
                newCard.style.opacity = '0';
                requestAnimationFrame(() => {
                    newCard.style.transform = 'translateY(0)';
                    newCard.style.opacity = '1';
                });
            }
            this._isAnimating = false;
        }, 200);
    },

    _speakCurrent() {
        const current = this._words[this._currentIndex];
        const word = current.word || current;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.85;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    },

    destroy() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
        }
        this._container = null;
        this._words = [];
        this._currentIndex = 0;
    }
};

window.VocabQuickSwipe = VocabQuickSwipe;
