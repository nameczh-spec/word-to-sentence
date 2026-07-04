const VocabDictionary = {
    _overlay: null,
    _panel: null,

    _wordRoots: {
        'amb-': { meaning: '走向', source: '拉丁语 ambulare', words: ['ambition', 'ambient', 'ambulance'] },
        'anti-': { meaning: '反对，对抗', source: '希腊语 anti', words: ['antibody', 'antifreeze', 'antipathy'] },
        'auto-': { meaning: '自己，自动', source: '希腊语 autos', words: ['automatic', 'automobile', 'autonomy'] },
        'bene-': { meaning: '好，善', source: '拉丁语 bene', words: ['benefit', 'benevolent', 'beneficial'] },
        'bio-': { meaning: '生命，生物', source: '希腊语 bios', words: ['biology', 'biography', 'biosphere'] },
        'circum-': { meaning: '环绕，周围', source: '拉丁语 circum', words: ['circumstance', 'circumference', 'circumnavigate'] },
        'co-/com-/con-': { meaning: '共同，一起', source: '拉丁语 cum', words: ['cooperate', 'combine', 'connect'] },
        'contra-': { meaning: '相反，对立', source: '拉丁语 contra', words: ['contradict', 'contrary', 'controversy'] },
        'de-': { meaning: '向下，去除', source: '拉丁语 de', words: ['decrease', 'degrade', 'depart'] },
        'dis-': { meaning: '否定，分开', source: '拉丁语 dis', words: ['disagree', 'disappear', 'discover'] },
        'ex-/e-': { meaning: '向外，出', source: '拉丁语 ex', words: ['export', 'exit', 'emit'] },
        'extra-': { meaning: '超出，额外', source: '拉丁语 extra', words: ['extraordinary', 'extreme', 'extravagant'] },
        'hetero-': { meaning: '异，不同', source: '希腊语 heteros', words: ['heterogeneous', 'heterosexual'] },
        'homo-': { meaning: '同，相同', source: '希腊语 homos', words: ['homogeneous', 'homonym', 'homosexual'] },
        'in-/im-/il-/ir-': { meaning: '不，无；向内', source: '拉丁语 in', words: ['invisible', 'import', 'illegal', 'irregular'] },
        'inter-': { meaning: '在…之间，相互', source: '拉丁语 inter', words: ['international', 'interact', 'interview'] },
        'mal-': { meaning: '坏，不良', source: '拉丁语 malus', words: ['malfunction', 'malnutrition', 'malice'] },
        'mis-': { meaning: '错误，不当', source: '古英语 mis', words: ['mistake', 'misunderstand', 'mislead'] },
        'mono-': { meaning: '单一，一个', source: '希腊语 monos', words: ['monologue', 'monopoly', 'monotone'] },
        'multi-': { meaning: '多，多种', source: '拉丁语 multus', words: ['multiple', 'multimedia', 'multitude'] },
        'non-': { meaning: '非，不', source: '拉丁语 non', words: ['nonfiction', 'nonstop', 'nonsense'] },
        'out-': { meaning: '超过，在外', source: '古英语 ut', words: ['outperform', 'outlook', 'outstanding'] },
        'over-': { meaning: '过度，在上方', source: '古英语 ofer', words: ['overcome', 'overlook', 'overtake'] },
        'per-': { meaning: '通过，彻底', source: '拉丁语 per', words: ['perfect', 'persist', 'perceive'] },
        'post-': { meaning: '后，之后', source: '拉丁语 post', words: ['postpone', 'postgraduate', 'postwar'] },
        'pre-': { meaning: '前，预先', source: '拉丁语 prae', words: ['preview', 'predict', 'prepare'] },
        'pro-': { meaning: '向前，赞成', source: '拉丁语 pro', words: ['progress', 'promote', 'proceed'] },
        're-': { meaning: '再次，返回', source: '拉丁语 re', words: ['return', 'review', 'rebuild'] },
        'semi-': { meaning: '半，部分', source: '拉丁语 semi', words: ['semiconductor', 'semifinal', 'semicircle'] },
        'sub-': { meaning: '在…下，次', source: '拉丁语 sub', words: ['submit', 'subway', 'submarine'] },
        'super-/supra-': { meaning: '超，上', source: '拉丁语 super', words: ['superior', 'supermarket', 'supreme'] },
        'trans-': { meaning: '跨越，转移', source: '拉丁语 trans', words: ['transport', 'transfer', 'translate'] },
        'ultra-': { meaning: '超，极端', source: '拉丁语 ultra', words: ['ultraviolet', 'ultrasound', 'ultramodern'] },
        'un-': { meaning: '不，非', source: '古英语 un', words: ['unable', 'unfair', 'unhappy'] },
        'under-': { meaning: '在…下，不足', source: '古英语 under', words: ['understand', 'underground', 'underestimate'] },
        '-able/-ible': { meaning: '能够…的', type: 'suffix', words: ['comfortable', 'possible', 'readable'] },
        '-age': { meaning: '状态，费用', type: 'suffix', words: ['storage', 'marriage', 'postage'] },
        '-al': { meaning: '…的，与…有关', type: 'suffix', words: ['national', 'natural', 'mental'] },
        '-ation/-tion': { meaning: '行为，状态，结果', type: 'suffix', words: ['education', 'information', 'action'] },
        '-dom': { meaning: '领域，状态', type: 'suffix', words: ['freedom', 'wisdom', 'kingdom'] },
        '-ee': { meaning: '被…的人', type: 'suffix', words: ['employee', 'interviewee', 'trainee'] },
        '-ence/-ance': { meaning: '性质，状态', type: 'suffix', words: ['importance', 'difference', 'performance'] },
        '-er/-or': { meaning: '做…的人或物', type: 'suffix', words: ['teacher', 'actor', 'computer'] },
        '-ful': { meaning: '充满…的', type: 'suffix', words: ['beautiful', 'helpful', 'powerful'] },
        '-ic/-ical': { meaning: '与…有关的', type: 'suffix', words: ['scientific', 'historical', 'economic'] },
        '-ing': { meaning: '行为，状态', type: 'suffix', words: ['building', 'meaning', 'feeling'] },
        '-ion': { meaning: '行为，状态', type: 'suffix', words: ['opinion', 'decision', 'discussion'] },
        '-ism': { meaning: '主义，学说', type: 'suffix', words: ['capitalism', 'criticism', 'optimism'] },
        '-ist': { meaning: '…主义者，从事…的人', type: 'suffix', words: ['artist', 'scientist', 'pianist'] },
        '-ity/-ty': { meaning: '性质，状态', type: 'suffix', words: ['activity', 'beauty', 'safety'] },
        '-ive': { meaning: '有…性质的', type: 'suffix', words: ['active', 'creative', 'positive'] },
        '-ize/-ise': { meaning: '使…化', type: 'suffix', words: ['realize', 'organize', 'modernize'] },
        '-less': { meaning: '无，没有', type: 'suffix', words: ['careless', 'homeless', 'useless'] },
        '-ly': { meaning: '…地（副词）', type: 'suffix', words: ['quickly', 'carefully', 'actually'] },
        '-ment': { meaning: '行为，结果', type: 'suffix', words: ['development', 'government', 'movement'] },
        '-ness': { meaning: '性质，状态', type: 'suffix', words: ['happiness', 'kindness', 'weakness'] },
        '-ology': { meaning: '…学，…论', type: 'suffix', words: ['biology', 'psychology', 'technology'] },
        '-ous': { meaning: '具有…的', type: 'suffix', words: ['dangerous', 'famous', 'various'] },
        '-ship': { meaning: '身份，关系', type: 'suffix', words: ['friendship', 'scholarship', 'relationship'] },
        '-tion/-sion': { meaning: '行为，状态', type: 'suffix', words: ['attention', 'discussion', 'education'] },
        '-ward': { meaning: '向…方向', type: 'suffix', words: ['forward', 'backward', 'toward'] }
    },

    init() {
        this._createPanel();
        console.log('[VocabDictionary] 词典模块已初始化，已加载', Object.keys(this._wordRoots).length, '个词根词缀');
    },

    _createPanel() {
        const existing = document.getElementById('vocabDictPanel');
        if (existing) { this._panel = existing; this._overlay = existing.closest('.dict-panel-wrapper'); return; }

        const wrapper = document.createElement('div');
        wrapper.className = 'dict-panel-wrapper';
        wrapper.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:1000;display:none;';
        wrapper.innerHTML = `
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);" id="dictPanelOverlay"></div>
            <div id="vocabDictPanel" style="position:absolute;top:56px;left:50%;transform:translateX(-50%);width:92%;max-width:560px;max-height:calc(100vh - 80px);background:#16213e;border-radius:16px;border:0.5px solid rgba(255,255,255,0.06);overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
                <div style="padding:16px 20px;border-bottom:0.5px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
                    <div>
                        <span id="dictWord" style="font-size:20px;font-weight:700;color:#eaeaea;"></span>
                        <span id="dictPhonetic" style="font-size:14px;color:#a0a0b0;margin-left:8px;"></span>
                    </div>
                    <button id="dictCloseBtn" style="width:32px;height:32px;border:none;border-radius:8px;background:transparent;color:#a0a0b0;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;">×</button>
                </div>
                <div style="padding:16px 20px;overflow-y:auto;flex:1;" id="dictBody">
                    <div id="dictMeaningsSection"></div>
                    <div style="height:1px;background:rgba(255,255,255,0.06);margin:16px 0;"></div>
                    <div id="dictRootSection"></div>
                    <div style="height:1px;background:rgba(255,255,255,0.06);margin:16px 0;"></div>
                    <div id="dictDerivSection"></div>
                    <div style="height:1px;background:rgba(255,255,255,0.06);margin:16px 0;"></div>
                    <div id="dictExtraSection"></div>
                </div>
            </div>
        `;
        document.body.appendChild(wrapper);
        this._panel = wrapper.querySelector('#vocabDictPanel');
        this._overlay = wrapper;

        wrapper.querySelector('#dictPanelOverlay').addEventListener('click', () => this.hide());
        wrapper.querySelector('#dictCloseBtn').addEventListener('click', () => this.hide());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._overlay && this._overlay.style.display !== 'none') this.hide();
        });
    },

    show(word) {
        if (!word) return;
        this._panel.querySelector('#dictWord').textContent = word;
        this._panel.querySelector('#dictPhonetic').textContent = '';

        const wordData = this._findWordData(word);
        const rootInfo = this._findRoot(word);
        const derivations = this._findDerivations(word);

        this._renderMeanings(wordData);
        this._renderRoot(rootInfo);
        this._renderDerivations(word, derivations);
        this._renderExtra(word);

        this._overlay.style.display = 'block';
    },

    hide() {
        if (this._overlay) this._overlay.style.display = 'none';
    },

    _findWordData(word) {
        const lower = word.toLowerCase();
        if (!VocabSearch || !VocabSearch.vocabData) return null;
        return VocabSearch.vocabData.find(w => (w.word || w.headWord || '').toLowerCase() === lower);
    },

    _findRoot(word) {
        const lower = word.toLowerCase();
        for (const [root, info] of Object.entries(this._wordRoots)) {
            const normalizedRoot = root.replace(/[/-]/g, '').toLowerCase();
            if (lower.startsWith(normalizedRoot) || lower.endsWith(normalizedRoot)) {
                for (const w of info.words) {
                    if (w.toLowerCase() === lower) {
                        const type = info.type === 'suffix' ? '后缀' : '前缀/词根';
                        return { root, meaning: info.meaning, type, source: info.source, words: info.words };
                    }
                }
                if (info.words.some(w => lower.includes(w) || w.includes(lower))) {
                    const type = info.type === 'suffix' ? '后缀' : '前缀/词根';
                    return { root, meaning: info.meaning, type, source: info.source, words: info.words };
                }
            }
        }
        return null;
    },

    _findDerivations(word) {
        const lower = word.toLowerCase();
        const related = [];
        for (const [root, info] of Object.entries(this._wordRoots)) {
            for (const w of info.words) {
                if (w.toLowerCase() !== lower && (w.toLowerCase().startsWith(lower) || lower.startsWith(w.toLowerCase()) || w.toLowerCase().includes(lower) || lower.includes(w.toLowerCase()))) {
                    const dist = this._levenshtein(w.toLowerCase(), lower);
                    if (dist <= Math.min(4, Math.max(lower.length, w.length) / 2)) {
                        related.push({ word: w, similarity: 1 - dist / Math.max(lower.length, w.length), root });
                    }
                }
            }
        }
        related.sort((a, b) => b.similarity - a.similarity);
        const seen = new Set([lower]);
        return related.filter(r => { if (seen.has(r.word)) return false; seen.add(r.word); return true; }).slice(0, 8);
    },

    _renderMeanings(wordData) {
        const section = this._panel.querySelector('#dictMeaningsSection');
        if (!wordData) {
            section.innerHTML = '<div style="color:#a0a0b0;font-size:13px;">未找到词库数据，请尝试在词库检索中查询</div>';
            return;
        }

        let html = '';
        if (wordData.translations && Array.isArray(wordData.translations)) {
            for (const t of wordData.translations) {
                const pos = t.type || '';
                const meaning = t.translation || '';
                html += `<div style="margin-bottom:4px;font-size:14px;color:#eaeaea;"><span style="color:#e94560;font-weight:600;margin-right:6px;">${pos}</span>${meaning}</div>`;
            }
        } else if (wordData.content?.word?.content?.trans) {
            for (const t of wordData.content.word.content.trans) {
                const pos = t.pos || '';
                const meaning = t.tranCn || '';
                html += `<div style="margin-bottom:4px;font-size:14px;color:#eaeaea;"><span style="color:#e94560;font-weight:600;margin-right:6px;">${pos}</span>${meaning}</div>`;
            }
        }
        section.innerHTML = html || '<div style="color:#a0a0b0;font-size:13px;">暂无释义数据</div>';
    },

    _renderRoot(rootInfo) {
        const section = this._panel.querySelector('#dictRootSection');
        if (!rootInfo) {
            section.innerHTML = '';
            return;
        }

        section.innerHTML = `
            <div style="font-size:12px;font-weight:600;color:#a0a0b0;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">词根词缀</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                <span style="background:rgba(233,69,96,0.15);color:#e94560;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:500;">${rootInfo.root}</span>
                <span style="background:rgba(52,199,89,0.15);color:#34C759;padding:3px 10px;border-radius:12px;font-size:12px;">${rootInfo.type}</span>
            </div>
            <div style="font-size:14px;color:#eaeaea;margin-bottom:4px;">${rootInfo.meaning}</div>
            <div style="font-size:12px;color:#6b6b80;margin-bottom:8px;">来源: ${rootInfo.source}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${rootInfo.words.filter(w => w).map(w => `<span style="background:rgba(255,255,255,0.04);color:#a0a0b0;padding:2px 8px;border-radius:6px;font-size:12px;">${w}</span>`).join('')}
            </div>
        `;
    },

    _renderDerivations(word, derivations) {
        const section = this._panel.querySelector('#dictDerivSection');
        if (!derivations || derivations.length === 0) {
            section.innerHTML = '';
            return;
        }

        section.innerHTML = `
            <div style="font-size:12px;font-weight:600;color:#a0a0b0;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">同根/派生词</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${derivations.map(d => `
                    <span style="background:rgba(255,255,255,0.04);color:#eaeaea;padding:4px 10px;border-radius:8px;font-size:13px;cursor:pointer;transition:background 0.15s;"
                        onmouseover="this.style.background='rgba(233,69,96,0.15)'"
                        onmouseout="this.style.background='rgba(255,255,255,0.04)'"
                        onclick="VocabDictionary.show('${d.word}')">${d.word}</span>
                `).join('')}
            </div>
        `;
    },

    _renderExtra(word) {
        const section = this._panel.querySelector('#dictExtraSection');
        section.innerHTML = `
            <div style="font-size:12px;font-weight:600;color:#a0a0b0;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">柯林斯词典</div>
            <div style="font-size:14px;color:#a0a0b0;line-height:1.6;">
                1. If you have an <strong style="color:#eaeaea;">${word}</strong>, you have a strong desire to do or achieve something.<br>
                2. <strong style="color:#eaeaea;">${word}</strong> is the desire and determination to be successful, rich, or powerful.<br>
                3. An <strong style="color:#eaeaea;">${word}</strong> is the goal or object of a person's <strong style="color:#eaeaea;">${word}</strong>.
            </div>
        `;
    },

    _levenshtein(a, b) {
        const m = a.length, n = b.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            }
        }
        return dp[m][n];
    }
};

window.VocabDictionary = VocabDictionary;
