const VocabAdvanced = {
    _phrases: {},

    init() {
        this._loadPhrases();
        console.log('[VocabAdvanced] 高级功能模块已初始化');
    },

    _loadPhrases() {
        this._phrases = {
            'take': ['take action 采取行动', 'take care 照顾', 'take place 发生', 'take part 参与', 'take advantage 利用'],
            'make': ['make decision 做决定', 'make effort 努力', 'make progress 取得进步', 'make sense 有意义', 'make sure 确保'],
            'get': ['get along 相处', 'get ready 准备好', 'get rid 摆脱', 'get used 习惯', 'get involved 参与'],
            'give': ['give up 放弃', 'give in 让步', 'give out 分发', 'give away 赠送', 'give back 归还'],
            'come': ['come up 出现', 'come from 来自', 'come out 出来', 'come across 偶然遇到', 'come true 实现'],
            'go': ['go on 继续', 'go through 经历', 'go over 复习', 'go ahead 开始', 'go back 返回'],
            'look': ['look for 寻找', 'look forward 期待', 'look after 照顾', 'look up 查阅', 'look into 调查'],
            'turn': ['turn on 打开', 'turn off 关闭', 'turn up 出现', 'turn down 拒绝', 'turn into 变成'],
            'put': ['put on 穿上', 'put off 推迟', 'put up 举起', 'put forward 提出', 'put out 扑灭'],
            'set': ['set up 建立', 'set out 出发', 'set off 出发', 'set aside 留出', 'set about 开始']
        };
    },

    getPhrasesForWord(word) {
        const lower = word.toLowerCase();
        if (this._phrases[lower]) {
            return this._phrases[lower];
        }
        for (const [key, phrases] of Object.entries(this._phrases)) {
            for (const p of phrases) {
                if (p.startsWith(lower + ' ') || p.includes(' ' + lower + ' ')) {
                    return [p];
                }
            }
        }
        return [];
    },

    getCollocationsSection(word, meaning) {
        const phrases = this.getPhrasesForWord(word);
        if (phrases.length === 0) return '';

        let html = `<div class="qs-collocations">`;
        html += `<div class="qs-colloc-title">词组搭配</div>`;
        html += `<div class="qs-colloc-list">`;
        for (const p of phrases) {
            const highlighted = p.replace(
                new RegExp(`\\b${word}\\b`, 'gi'),
                match => `<strong style="color:var(--accent-color,#007AFF);">${match}</strong>`
            );
            html += `<span class="qs-colloc-item">${highlighted}</span>`;
        }
        html += `</div></div>`;
        return html;
    },

    startTTSPlayer(container, words) {
        if (!container || !words || words.length === 0) return;

        let currentIndex = 0;
        let isPlaying = false;

        const speak = (word) => {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.85;
            window.speechSynthesis.speak(utterance);
        };

        const render = () => {
            const current = words[currentIndex];
            const w = current.word || current;
            const meaning = current.translations || current.meaning || current.state?.translations || '';
            const total = words.length;

            container.innerHTML = `
                <div class="tts-player">
                    <div class="tts-progress">${currentIndex + 1} / ${total}</div>
                    <div class="tts-card">
                        <div class="tts-word">${w}</div>
                        <div class="tts-meaning">${meaning || ''}</div>
                    </div>
                    ${this.getCollocationsSection(w, meaning)}
                    <div class="tts-controls">
                        <button class="tts-btn" id="ttsPrevBtn" ${currentIndex === 0 ? 'disabled' : ''}>⏮</button>
                        <button class="tts-btn tts-btn-play ${isPlaying ? 'tts-active' : ''}" id="ttsPlayBtn">
                            ${isPlaying ? '⏸' : '▶'}
                        </button>
                        <button class="tts-btn" id="ttsNextBtn" ${currentIndex >= total - 1 ? 'disabled' : ''}>⏭</button>
                    </div>
                    <div class="tts-mode-labels">
                        <label class="tts-mode-label"><input type="checkbox" id="ttsWordCheck" checked> 单词</label>
                        <label class="tts-mode-label"><input type="checkbox" id="ttsMeaningCheck"> 释义</label>
                    </div>
                    <button class="vl-action-btn vl-btn-secondary vl-btn-sm" id="ttsBackBtn" style="margin-top:8px;">返回</button>
                </div>
            `;

            document.getElementById('ttsPrevBtn').addEventListener('click', () => {
                if (currentIndex > 0) { currentIndex--; render(); speak(w); }
            });
            document.getElementById('ttsNextBtn').addEventListener('click', () => {
                if (currentIndex < total - 1) { currentIndex++; render(); speak(w); }
            });
            document.getElementById('ttsPlayBtn').addEventListener('click', () => {
                isPlaying = !isPlaying;
                if (isPlaying) {
                    speak(w);
                    if (document.getElementById('ttsMeaningCheck')?.checked) {
                        setTimeout(() => {
                            if (meaning) speak(meaning);
                        }, 1500);
                    }
                } else {
                    window.speechSynthesis.cancel();
                }
                render();
            });
            document.getElementById('ttsBackBtn').addEventListener('click', () => VocabLearning._renderHomeTab());
        };

        render();
    },

    addDictionarySourceSwitcher(panel) {
        const section = panel.querySelector('#dictMeaningsSection');
        if (!section) return;

        const sources = [
            { id: 'all', name: '全部', color: '#007AFF' },
            { id: 'kaoyan', name: '考研', color: '#FF3B30' },
            { id: 'cet6', name: '六级', color: '#34C759' },
            { id: 'cet4', name: '四级', color: '#FF9500' }
        ];

        const filterBar = document.createElement('div');
        filterBar.style.cssText = 'display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap;';
        filterBar.innerHTML = sources.map(s =>
            `<button class="dict-source-btn" data-source="${s.id}"
                style="font-size:11px;padding:2px 10px;border:1px solid var(--border-color,rgba(0,0,0,0.06));border-radius:10px;
                background:${s.id === 'all' ? 'var(--accent-color,#007AFF)' : 'transparent'};
                color:${s.id === 'all' ? 'white' : 'var(--text-secondary,#86868B)'};
                cursor:pointer;transition:all 0.15s;font-family:inherit;">${s.name}</button>`
        ).join('');
        section.parentNode.insertBefore(filterBar, section);
    }
};

window.VocabAdvanced = VocabAdvanced;
