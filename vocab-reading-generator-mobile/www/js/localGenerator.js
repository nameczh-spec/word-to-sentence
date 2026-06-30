/**
 * localGenerator.js - 本地文本生成器
 * 基于词库POS信息和用户导入的单词，本地生成考研英语风格阅读段落
 * 
 * 功能：
 * 1. 从vocab-lib JSON文件构建POS词典
 * 2. 250+考研英语风格句子骨架
 * 3. 按用户单词词性填充槽位
 * 4. 动词变形（过去式、分词、第三人称）
 * 5. 按主题分组段落（科技、社会、经济等10个主题）
 * 6. 过渡词连接
 * 7. 纯英文 / 中文主线两种模式
 * 
 * Export: window.LocalGenerator
 * API: generate(wordsArray, mode) => { success, text, words }
 */

(function () {
    'use strict';

    // ============================================================
    // 1. 不规则动词变化表（过去式 / 完成/被动分词 / 第三人称 / 进行时）
    // ============================================================
    var IRREGULAR_VERBS = {
        // 原形 → [过去式, 过去分词, 第三人称单数, 现在分词]
        'be': ['was/were', 'been', 'is', 'being'],
        'become': ['became', 'become', 'becomes', 'becoming'],
        'begin': ['began', 'begun', 'begins', 'beginning'],
        'break': ['broke', 'broken', 'breaks', 'breaking'],
        'bring': ['brought', 'brought', 'brings', 'bringing'],
        'build': ['built', 'built', 'builds', 'building'],
        'buy': ['bought', 'bought', 'buys', 'buying'],
        'catch': ['caught', 'caught', 'catches', 'catching'],
        'choose': ['chose', 'chosen', 'chooses', 'choosing'],
        'come': ['came', 'come', 'comes', 'coming'],
        'cost': ['cost', 'cost', 'costs', 'costing'],
        'cut': ['cut', 'cut', 'cuts', 'cutting'],
        'deal': ['dealt', 'dealt', 'deals', 'dealing'],
        'do': ['did', 'done', 'does', 'doing'],
        'draw': ['drew', 'drawn', 'draws', 'drawing'],
        'drink': ['drank', 'drunk', 'drinks', 'drinking'],
        'drive': ['drove', 'driven', 'drives', 'driving'],
        'eat': ['ate', 'eaten', 'eats', 'eating'],
        'fall': ['fell', 'fallen', 'falls', 'falling'],
        'feel': ['felt', 'felt', 'feels', 'feeling'],
        'find': ['found', 'found', 'finds', 'finding'],
        'fly': ['flew', 'flown', 'flies', 'flying'],
        'forget': ['forgot', 'forgotten', 'forgets', 'forgetting'],
        'get': ['got', 'got/gotten', 'gets', 'getting'],
        'give': ['gave', 'given', 'gives', 'giving'],
        'go': ['went', 'gone', 'goes', 'going'],
        'grow': ['grew', 'grown', 'grows', 'growing'],
        'have': ['had', 'had', 'has', 'having'],
        'hold': ['held', 'held', 'holds', 'holding'],
        'keep': ['kept', 'kept', 'keeps', 'keeping'],
        'know': ['knew', 'known', 'knows', 'knowing'],
        'lead': ['led', 'led', 'leads', 'leading'],
        'leave': ['left', 'left', 'leaves', 'leaving'],
        'lend': ['lent', 'lent', 'lends', 'lending'],
        'let': ['let', 'let', 'lets', 'letting'],
        'lie': ['lay', 'lain', 'lies', 'lying'],
        'lose': ['lost', 'lost', 'loses', 'losing'],
        'make': ['made', 'made', 'makes', 'making'],
        'mean': ['meant', 'meant', 'means', 'meaning'],
        'meet': ['met', 'met', 'meets', 'meeting'],
        'pay': ['paid', 'paid', 'pays', 'paying'],
        'put': ['put', 'put', 'puts', 'putting'],
        'read': ['read', 'read', 'reads', 'reading'],
        'rise': ['rose', 'risen', 'rises', 'rising'],
        'run': ['ran', 'run', 'runs', 'running'],
        'say': ['said', 'said', 'says', 'saying'],
        'see': ['saw', 'seen', 'sees', 'seeing'],
        'sell': ['sold', 'sold', 'sells', 'selling'],
        'send': ['sent', 'sent', 'sends', 'sending'],
        'set': ['set', 'set', 'sets', 'setting'],
        'show': ['showed', 'shown', 'shows', 'showing'],
        'shut': ['shut', 'shut', 'shuts', 'shutting'],
        'sit': ['sat', 'sat', 'sits', 'sitting'],
        'speak': ['spoke', 'spoken', 'speaks', 'speaking'],
        'spend': ['spent', 'spent', 'spends', 'spending'],
        'stand': ['stood', 'stood', 'stands', 'standing'],
        'take': ['took', 'taken', 'takes', 'taking'],
        'teach': ['taught', 'taught', 'teaches', 'teaching'],
        'tell': ['told', 'told', 'tells', 'telling'],
        'think': ['thought', 'thought', 'thinks', 'thinking'],
        'understand': ['understood', 'understood', 'understands', 'understanding'],
        'write': ['wrote', 'written', 'writes', 'writing'],
        'draw': ['drew', 'drawn', 'draws', 'drawing'],
        'overcome': ['overcame', 'overcome', 'overcomes', 'overcoming'],
        'undertake': ['undertook', 'undertaken', 'undertakes', 'undertaking'],
        'withdraw': ['withdrew', 'withdrawn', 'withdraws', 'withdrawing'],
        'arise': ['arose', 'arisen', 'arises', 'arising'],
        'awake': ['awoke', 'awoken', 'awakes', 'awaking'],
        'bear': ['bore', 'borne', 'bears', 'bearing'],
        'beat': ['beat', 'beaten', 'beats', 'beating'],
        'bend': ['bent', 'bent', 'bends', 'bending'],
        'bind': ['bound', 'bound', 'binds', 'binding'],
        'bite': ['bit', 'bitten', 'bites', 'biting'],
        'blow': ['blew', 'blown', 'blows', 'blowing'],
        'cast': ['cast', 'cast', 'casts', 'casting'],
        'cling': ['clung', 'clung', 'clings', 'clinging'],
        'creep': ['crept', 'crept', 'creeps', 'creeping'],
        'dig': ['dug', 'dug', 'digs', 'digging'],
        'dive': ['dove/dived', 'dived', 'dives', 'diving'],
        'hang': ['hung', 'hung', 'hangs', 'hanging'],
        'hide': ['hid', 'hidden', 'hides', 'hiding'],
        'hurt': ['hurt', 'hurt', 'hurts', 'hurting'],
        'lay': ['laid', 'laid', 'lays', 'laying'],
        'learn': ['learned/learnt', 'learned/learnt', 'learns', 'learning'],
        'light': ['lit', 'lit', 'lights', 'lighting'],
        'mistake': ['mistook', 'mistaken', 'mistakes', 'mistaking'],
        'prove': ['proved', 'proved/proven', 'proves', 'proving'],
        'quit': ['quit', 'quit', 'quits', 'quitting'],
        'ride': ['rode', 'ridden', 'rides', 'riding'],
        'ring': ['rang', 'rung', 'rings', 'ringing'],
        'seek': ['sought', 'sought', 'seeks', 'seeking'],
        'shake': ['shook', 'shaken', 'shakes', 'shaking'],
        'shine': ['shone', 'shone', 'shines', 'shining'],
        'sing': ['sang', 'sung', 'sings', 'singing'],
        'sink': ['sank', 'sunk', 'sinks', 'sinking'],
        'slide': ['slid', 'slid', 'slides', 'sliding'],
        'spread': ['spread', 'spread', 'spreads', 'spreading'],
        'strike': ['struck', 'struck/stricken', 'strikes', 'striking'],
        'swear': ['swore', 'sworn', 'swears', 'swearing'],
        'swim': ['swam', 'swum', 'swims', 'swimming'],
        'swing': ['swung', 'swung', 'swings', 'swinging'],
        'tear': ['tore', 'torn', 'tears', 'tearing'],
        'throw': ['threw', 'thrown', 'throws', 'throwing'],
        'wake': ['woke', 'woken', 'wakes', 'waking'],
        'wear': ['wore', 'worn', 'wears', 'wearing'],
        'weave': ['wove', 'woven', 'weaves', 'weaving'],
        'win': ['won', 'won', 'wins', 'winning'],
        'wind': ['wound', 'wound', 'winds', 'winding'],
        'withstand': ['withstood', 'withstood', 'withstands', 'withstanding']
    };

    // ============================================================
    // 2. 过渡词表（按位置和使用场景）
    // ============================================================
    var TRANSITIONS = {
        // 段落开头
        paragraphStart: [
            'In recent years,', 'Over the past few decades,', 'It is widely acknowledged that',
            'A growing body of evidence suggests that', 'There is a prevailing view that',
            'In the contemporary era,', 'Historically,', 'From a broad perspective,',
            'An increasing number of researchers argue that', 'It has become increasingly clear that'
        ],
        // 句间递进
        additive: [
            'Furthermore,', 'Moreover,', 'In addition,', 'Additionally,',
            'Not only that, but also', 'Equally important,', 'What is more,'
        ],
        // 转折
        contrast: [
            'However,', 'Nevertheless,', 'On the contrary,', 'In contrast,',
            'Conversely,', 'On the other hand,', 'Yet,', 'Nonetheless,',
            'Despite this,', 'In spite of these considerations,'
        ],
        // 因果
        causal: [
            'Therefore,', 'Consequently,', 'As a result,', 'Thus,',
            'Hence,', 'For this reason,', 'Accordingly,', 'It follows that,'
        ],
        // 举例
        exemplifying: [
            'For instance,', 'For example,', 'To illustrate,', 'A case in point is',
            'This can be exemplified by', 'Specifically,'
        ],
        // 结论
        concluding: [
            'In conclusion,', 'To summarize,', 'Overall,', 'In sum,',
            'Taking all these factors into consideration,', 'In the final analysis,'
        ],
        // 让步
        concession: [
            'Admittedly,', 'It is true that', 'To be sure,',
            'Granted,', 'While this may be the case,'
        ],
        // 强调
        emphasis: [
            'Indeed,', 'In fact,', 'As a matter of fact,',
            'Undoubtedly,', 'Without a doubt,', 'Clearly,'
        ]
    };

    // 过渡词按使用顺序（句子在段落中的位置）
    var TRANSITION_ORDER = [
        'paragraphStart',
        'additive', 'exemplifying', 'contrast', 'causal',
        'additive', 'exemplifying', 'contrast',
        'concession', 'emphasis',
        'concluding'
    ];

    // ============================================================
    // 3. 默认/中性词（当用户没有对应词性的单词时使用）
    // ============================================================
    var DEFAULT_WORDS = {
        'n': [
            'phenomenon', 'factor', 'issue', 'perspective', 'approach',
            'concept', 'system', 'process', 'development', 'impact',
            'context', 'framework', 'structure', 'aspect', 'implication',
            'tendency', 'mechanism', 'foundation', 'dimension', 'component'
        ],
        'v': [
            'affect', 'influence', 'contribute', 'demonstrate', 'indicate',
            'suggest', 'involve', 'require', 'emerge', 'undergo',
            'promote', 'facilitate', 'enhance', 'undermine', 'generate',
            'reflect', 'constitute', 'characterize', 'underline', 'reinforce'
        ],
        'adj': [
            'significant', 'substantial', 'remarkable', 'considerable', 'fundamental',
            'crucial', 'critical', 'essential', 'notable', 'underlying',
            'prevailing', 'prominent', 'widespread', 'inevitable', 'profound',
            'controversial', 'sophisticated', 'comprehensive', 'innovative', 'compelling'
        ],
        'adv': [
            'significantly', 'substantially', 'remarkably', 'considerably', 'fundamentally',
            'increasingly', 'predominantly', 'notably', 'essentially', 'particularly',
            'gradually', 'inevitably', 'profoundly', 'overwhelmingly', 'consequently',
            'broadly', 'closely', 'readily', 'roughly', 'virtually'
        ],
        // 专有名词默认库（用于 {Name} 占位符回退）
        // 注意：所有词必须是单个词（不含空格），确保能直接替换占位符
        'Name': [
            'Harvard', 'Oxford', 'NASA', 'UNESCO', 'MIT', 'Stanford', 'Cambridge',
            'Congress', 'Parliament', 'Senate', 'Pentagon', 'Kremlin',
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis',
            'Amazon', 'Google', 'Tesla', 'Intel', 'Nvidia'
        ],
        // 专业术语默认库（用于 {term} 占位符回退）
        // 注意：所有词必须是单个词（不含空格），确保能直接替换占位符
        'term': [
            'globalization', 'biodiversity', 'sustainability', 'urbanization',
            'digitalization', 'automation', 'algorithm', 'encryption',
            'ecosystem', 'infrastructure', 'bureaucracy', 'demographics',
            'jurisdiction', 'legislation', 'sovereignty', 'diplomacy',
            'hypothesis', 'methodology', 'paradigm', 'empirical', 'theoretical'
        ]
    };

    // ============================================================
    // 4. 句子骨架 - 改为从 templates/ 目录动态加载
    //    用户可添加自定义 JSON 模板文件到 templates/ 目录
    //    格式说明请参考 templates/README.md
    // ============================================================

    var SKELETONS = [];
    var TEMPLATES_LOADED = false;

    // 内置中文骨架保底（当 templates/chinese.json 不存在时使用）
    var BUILTIN_CHINESE_SKELETONS = [
        {
            text: '近年来，{n}领域的研究取得了{adj}进展，{v}了人们对{term}的{adj}认知。',
            slots: [{pos:'n'}, {pos:'adj'}, {pos:'v', form:'past'}, {pos:'term'}, {pos:'adj'}]
        },
        {
            text: '从多维度来看，{Name}提出的{n}理论{v}了传统{term}的局限性。',
            slots: [{pos:'Name'}, {pos:'n'}, {pos:'v', form:'past'}, {pos:'term'}]
        },
        {
            text: '值得注意的是，{adj}的{n}不仅{v}了{term}，还{v}了{n}的{adj}发展。',
            slots: [{pos:'adj'}, {pos:'n'}, {pos:'v', form:'past'}, {pos:'term'}, {pos:'v', form:'past'}, {pos:'n'}, {pos:'adj'}]
        },
        {
            text: '研究表明，{n}与{term}之间存在{adj}关联，这一发现{v}了现有{n}。',
            slots: [{pos:'n'}, {pos:'term'}, {pos:'adj'}, {pos:'v', form:'past'}, {pos:'n'}]
        },
        {
            text: '尽管存在争议，但{adj}证据表明，{Name}的{n}确实{v}了{term}的{adj}变化。',
            slots: [{pos:'adj'}, {pos:'Name'}, {pos:'n'}, {pos:'v', form:'past'}, {pos:'term'}, {pos:'adj'}]
        },
        {
            text: '究其原因，{n}的{adj}特性{v}了{term}在{n}中的广泛应用。',
            slots: [{pos:'n'}, {pos:'adj'}, {pos:'v', form:'past'}, {pos:'term'}, {pos:'n'}]
        },
        {
            text: '从长远来看，{term}的发展将{v}整个{n}领域的{adj}变革。',
            slots: [{pos:'term'}, {pos:'v', form:'base'}, {pos:'n'}, {pos:'adj'}]
        },
        {
            text: '具体而言，{adj}的{n}通过{v} {term}，{v}了{n}的{adj}效率。',
            slots: [{pos:'adj'}, {pos:'n'}, {pos:'v', form:'gerund'}, {pos:'term'}, {pos:'v', form:'past'}, {pos:'n'}, {pos:'adj'}]
        }
    ];

    /**
     * 从 templates/ 目录加载所有模板文件
     * 先加载 _files.json 获取文件列表，再逐个加载
     */
    function loadTemplates() {
        if (TEMPLATES_LOADED) return;

        var loadedCount = 0;
        var fileList = [];

        try {
            // 1. 尝试加载文件清单 _files.json
            var manifestReq = new XMLHttpRequest();
            manifestReq.open('GET', './templates/_files.json', false);
            manifestReq.overrideMimeType('application/json');
            manifestReq.send(null);

            if (manifestReq.status === 200 || manifestReq.status === 0) {
                var manifestData = JSON.parse(manifestReq.responseText);
                if (Array.isArray(manifestData) && manifestData.length > 0) {
                    fileList = manifestData;
                }
            }
        } catch (e) {
            // _files.json 不存在或解析失败，继续自动扫描
        }

        // 2. 如果 _files.json 无效，自动扫描 templates/ 目录
        if (fileList.length === 0) {
            fileList = autoScanTemplates();
        }

        // 3. 加载所有模板文件
        for (var fi = 0; fi < fileList.length; fi++) {
            try {
                var req = new XMLHttpRequest();
                req.open('GET', './templates/' + fileList[fi], false);
                req.overrideMimeType('application/json');
                req.send(null);

                if (req.status === 200 || req.status === 0) {
                    var data = JSON.parse(req.responseText);
                    if (data && Array.isArray(data.skeletons)) {
                        var topic = data.topic || fileList[fi].replace('.json', '');
                        for (var si = 0; si < data.skeletons.length; si++) {
                            var sk = data.skeletons[si];
                            SKELETONS.push({
                                text: sk.text,
                                slots: sk.slots || [],
                                topic: topic
                            });
                        }
                        loadedCount += data.skeletons.length;
                    }
                }
            } catch (e) {
                // 跳过加载失败的模板文件
            }
        }

        TEMPLATES_LOADED = true;
    }

    /**
     * 自动扫描 templates/ 目录下的 .json 文件
     * 通过尝试加载常见文件名来发现模板
     */
    function autoScanTemplates() {
        var knownTopics = [
            'science', 'technology', 'society', 'economics', 'education',
            'environment', 'law', 'culture', 'health', 'psychology',
            'general', 'chinese', 'history', 'politics', 'art',
            'business', 'medicine', 'philosophy', 'literature'
        ];
        var found = [];
        for (var i = 0; i < knownTopics.length; i++) {
            try {
                var req = new XMLHttpRequest();
                req.open('HEAD', './templates/' + knownTopics[i] + '.json', false);
                req.send(null);
                if (req.status === 200 || req.status === 0) {
                    found.push(knownTopics[i] + '.json');
                }
            } catch (e) {
                // 文件不存在，跳过
            }
        }
        return found;
    }

    /**
     * 回退方案：当 _files.json 加载失败时，尝试加载已知的模板文件
     */
    function fallbackLoadTemplates() {
        if (TEMPLATES_LOADED) return;

        var knownTopics = [
            'science', 'technology', 'society', 'economics', 'education',
            'environment', 'law', 'culture', 'health', 'psychology',
            'general', 'chinese'
        ];

        for (var ft = 0; ft < knownTopics.length; ft++) {
            try {
                var req = new XMLHttpRequest();
                req.open('GET', './templates/' + knownTopics[ft] + '.json', false);
                req.overrideMimeType('application/json');
                req.send(null);

                if (req.status === 200 || req.status === 0) {
                    var data = JSON.parse(req.responseText);
                    if (data && Array.isArray(data.skeletons)) {
                        for (var si2 = 0; si2 < data.skeletons.length; si2++) {
                            var sk2 = data.skeletons[si2];
                            SKELETONS.push({
                                text: sk2.text,
                                slots: sk2.slots || [],
                                topic: knownTopics[ft]
                            });
                        }
                    }
                }
            } catch (e) {
                // 跳过
            }
        }

        TEMPLATES_LOADED = true;
    }

    // 立即加载模板（文件 + localStorage）
    loadTemplates();
    // 合并从网页导入的 localStorage 模板
    try {
        var customSkels = window.TemplateManager && window.TemplateManager.getAllSkeletons();
        if (customSkels && customSkels.length > 0) {
            for (var sk_i = 0; sk_i < customSkels.length; sk_i++) {
                SKELETONS.push(customSkels[sk_i]);
            }
        }
    } catch (e) {
        // localStorage 不可用时忽略
    }

    // ============================================================
    // 5. POS词典构建（从vocab-lib JSON读入并缓存）
    // ============================================================

    var POS_DICT = { n: [], v: [], adj: [], adv: [] };
    var POS_LOADED = false;

    /**
     * 从单词对象中提取词性
     * @param {Object} wordEntry - 词库条目 { word, translations: [{translation, type}] }
     * @returns {Array} 词性数组 ['n', 'v', ...]
     */
    function extractPosTypes(wordEntry) {
        var types = [];
        if (!wordEntry || !wordEntry.translations) return types;
        for (var i = 0; i < wordEntry.translations.length; i++) {
            var t = wordEntry.translations[i];
            if (t && t.type && types.indexOf(t.type) === -1) {
                types.push(t.type);
            }
        }
        return types;
    }

    /**
     * 加载并解析vocab JSON文件，构建POS词典
     */
    function buildPosDict() {
        if (POS_LOADED) return;
        var loaded = false;

        // 尝试从vocab-lib加载考研词库
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', './vocab-lib/5-考研-顺序.json', false); // 同步请求
            xhr.overrideMimeType('application/json');
            xhr.send(null);

            if (xhr.status === 200 || xhr.status === 0) {
                var data = JSON.parse(xhr.responseText);
                if (Array.isArray(data)) {
                    for (var i = 0; i < data.length; i++) {
                        var entry = data[i];
                        var word = entry.word || '';
                        if (!word) continue;
                        var posTypes = extractPosTypes(entry);
                        for (var j = 0; j < posTypes.length; j++) {
                            var pos = posTypes[j];
                            if (pos === 'n' || pos === 'v' || pos === 'adj' || pos === 'adv') {
                                if (POS_DICT[pos].indexOf(word) === -1) {
                                    POS_DICT[pos].push(word);
                                }
                            }
                        }
                    }
                    loaded = true;
                }
            }
        } catch (e) {
            // fallback: 尝试通过fetch加载
        }

        // 如果同步XHR失败，尝试异步fetch（同步回退时已记录）
        if (!loaded) {
            try {
                var url = './vocab-lib/5-考研-顺序.json';
                var req = new XMLHttpRequest();
                req.open('GET', url, false);
                req.overrideMimeType('application/json');
                req.send(null);
                if (req.status === 200 || req.status === 0) {
                    var data2 = JSON.parse(req.responseText);
                    if (Array.isArray(data2)) {
                        for (var i2 = 0; i2 < data2.length; i2++) {
                            var entry2 = data2[i2];
                            var word2 = entry2.word || '';
                            if (!word2) continue;
                            var posTypes2 = extractPosTypes(entry2);
                            for (var j2 = 0; j2 < posTypes2.length; j2++) {
                                var pos2 = posTypes2[j2];
                                if (pos2 === 'n' || pos2 === 'v' || pos2 === 'adj' || pos2 === 'adv') {
                                    if (POS_DICT[pos2].indexOf(word2) === -1) {
                                        POS_DICT[pos2].push(word2);
                                    }
                                }
                            }
                        }
                        loaded = true;
                    }
                }
            } catch (e2) {
                // 完全回退：使用硬编码的默认词表
            }
        }

        // 如果JSON加载失败，使用默认词表补充
        if (!loaded) {
            // 从DEFAULT_WORDS中提取一些词作为基础（仅标准词性 n/v/adj/adv）
            var stdPosKeys = ['n', 'v', 'adj', 'adv'];
            for (var pi = 0; pi < stdPosKeys.length; pi++) {
                var pos3 = stdPosKeys[pi];
                var dwList = DEFAULT_WORDS[pos3];
                if (!dwList) continue;
                for (var k = 0; k < dwList.length; k++) {
                    var w = dwList[k];
                    if (POS_DICT[pos3].indexOf(w) === -1) {
                        POS_DICT[pos3].push(w);
                    }
                }
            }
        }

        POS_LOADED = true;
    }

    // ============================================================
    // 6. 动词变形辅助函数
    // ============================================================

    /**
     * 获取不规则动词的变形
     * @param {string} word - 动词原形
     * @returns {Object|null} { past, pp, s, ing } 或 null
     */
    function getIrregularForm(word) {
        var lower = word.toLowerCase();
        var entry = IRREGULAR_VERBS[lower];
        if (entry) {
            return {
                past: entry[0],
                pp: entry[1],
                s: entry[2],
                ing: entry[3]
            };
        }
        return null;
    }

    /**
     * 动词变形
     * @param {string} word - 动词原形
     * @param {string} form - 变形形式: 'past'(过去式), 'pp'(过去分词), '3sg'(第三人称), 'gerund'(现在分词), 'base'(原形)
     * @returns {string} 变形后的词
     */
    function conjugate(word, form) {
        if (!form || form === 'base') return word;

        // 兼容简写格式：ing→gerund, 3→3sg
        if (form === 'ing') form = 'gerund';
        if (form === '3') form = '3sg';

        var lower = word.toLowerCase();
        var irregular = getIrregularForm(word);

        switch (form) {
            case 'past':
                if (irregular) return irregular.past;
                // 规则变化：以e结尾 → +d (e.g. demonstrate→demonstrated)
                if (lower.match(/e$/)) return word + 'd';
                if (lower.match(/[^aeiou]y$/)) return word.slice(0, -1) + 'ied';
                // 双写末尾辅音 (CVC模式)，仅限短单词 (<=4字母)
                if (word.length <= 4 && lower.match(/[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/)) {
                    return word + word.slice(-1) + 'ed';
                }
                return word + 'ed';

            case 'pp':
                if (irregular) return irregular.pp;
                // 规则过去分词与过去式相同
                if (lower.match(/e$/)) return word + 'd';
                if (lower.match(/[^aeiou]y$/)) return word.slice(0, -1) + 'ied';
                // 双写末尾辅音 (CVC模式)，仅限短单词 (<=4字母)
                if (word.length <= 4 && lower.match(/[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/)) {
                    return word + word.slice(-1) + 'ed';
                }
                return word + 'ed';

            case '3sg':
                if (irregular) return irregular.s;
                if (lower.match(/(s|ss|sh|ch|x|o)$/)) return word + 'es';
                if (lower.match(/[^aeiou]y$/)) return word.slice(0, -1) + 'ies';
                return word + 's';

            case 'gerund':
                if (irregular) return irregular.ing;
                // Drop trailing 'e' before -ing (e.g. make→making, undermine→undermining)
                if (lower.match(/[^e]e$/)) return word.slice(0, -1) + 'ing';
                // Double final consonant for CVC pattern (e.g. run→running), short words only (<=4 letters)
                if (word.length <= 4 && lower.match(/[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/)) {
                    return word + word.slice(-1) + 'ing';
                }
                return word + 'ing';

            default:
                return word;
        }
    }

    // ============================================================
    // 7. 本地生成器主模块
    // ============================================================

    var LocalGenerator = {

        // POS字典（按词性分组的单词列表）
        _posDict: null,

        // 是否已初始化
        _initialized: false,

        /**
         * 初始化生成器
         * 加载词库并构建POS字典
         */
        init: function () {
            if (this._initialized) return;
            buildPosDict();
            this._posDict = {
                n: POS_DICT.n.slice(),
                v: POS_DICT.v.slice(),
                adj: POS_DICT.adj.slice(),
                adv: POS_DICT.adv.slice()
            };
            this._initialized = true;
        },

        /**
         * 主入口：生成阅读段落
         * @param {Array} wordsArray - 用户单词列表（可以是字符串数组或对象数组）
         * @param {string} mode - 生成模式: 'english'(纯英文) | 'chinese'(中文主线)
         * @returns {Object} { success, text, words }
         */
        generate: function (wordsArray, mode) {
            var startTime = Date.now();

            // 确保已初始化
            this.init();

            // 规范化输入
            if (!Array.isArray(wordsArray)) {
                wordsArray = [];
            }
            mode = mode || 'english';

            // 解析用户单词
            var userWords = this._parseUserWords(wordsArray);

            // 按词性分组用户单词
            var userByPos = this._groupByPos(userWords);

            // 收集使用到的单词（全局，去重）
            var usedWords = [];
            
            // 记录已使用的骨架模板，避免重复
            var usedSkeletonTexts = {};

            // 生成段落 — 确保每个句子至少包含一个用户单词
            var paragraphs = [];
            var allSkeletons = this._getAllSkeletons(mode);
            
            // 计算需要的句子数：每个句子至少包含1个用户单词
            var minSentences = Math.max(3, Math.ceil(userWords.length / 2));
            var maxSentences = Math.min(15, allSkeletons.length);
            var targetCount = Math.min(Math.max(minSentences, 5), maxSentences);
            
            // 打乱骨架顺序
            var shuffled = this._pickRandom(allSkeletons, allSkeletons.length);
            
            var sentences = [];
            for (var si = 0; si < shuffled.length && sentences.length < targetCount; si++) {
                var skel = shuffled[si];
                var skelKey = skel.text;
                
                // 跳过已使用过的骨架模板（每个模板最多用1次）
                if (usedSkeletonTexts[skelKey]) continue;
                usedSkeletonTexts[skelKey] = true;
                
                var result = this._fillSkeleton(skel, userByPos, mode, usedWords);
                
                // 确保每个句子至少包含一个用户单词
                if (result.usedWords.length > 0) {
                    sentences.push(result.text);
                    // 记录使用的词
                    for (var wi = 0; wi < result.usedWords.length; wi++) {
                        if (usedWords.indexOf(result.usedWords[wi]) === -1) {
                            usedWords.push(result.usedWords[wi]);
                        }
                    }
                }
            }

            // 如果句子太少，补充简单骨架（简单骨架可以重复使用，但结构不同）
            while (sentences.length < Math.min(3, targetCount)) {
                var simpleSkel = this._getSimpleSkeleton();
                var simpleResult = this._fillSkeleton(simpleSkel, userByPos, mode, usedWords);
                if (simpleResult.usedWords.length > 0) {
                    sentences.push(simpleResult.text);
                    for (var swi = 0; swi < simpleResult.usedWords.length; swi++) {
                        if (usedWords.indexOf(simpleResult.usedWords[swi]) === -1) {
                            usedWords.push(simpleResult.usedWords[swi]);
                        }
                    }
                } else {
                    break; // 避免无限循环
                }
            }

            // 将句子分组成段落，每3-4句一个段落，恢复分页
            var sentencesPerPara = 3;
            for (var pi = 0; pi < sentences.length; pi += sentencesPerPara) {
                var paraSentences = sentences.slice(pi, pi + sentencesPerPara);
                var paragraph = this._assembleParagraph(paraSentences, pi / sentencesPerPara, Math.ceil(sentences.length / sentencesPerPara), mode);
                paragraphs.push(paragraph);
            }

            // 组装最终文本
            var text = paragraphs.join('\n\n');

            // ============================================================
            // 强制包含所有用户导入的单词
            // 将未被骨架使用到的单词追加到生成的文本中
            // ============================================================
            var allUserWords = this._parseUserWords(wordsArray);
            var unusedWords = [];
            for (var uw = 0; uw < allUserWords.length; uw++) {
                var wl = allUserWords[uw];
                if (usedWords.indexOf(wl) === -1 && text.toLowerCase().indexOf(wl) === -1) {
                    unusedWords.push(wl);
                }
            }
            if (unusedWords.length > 0) {
                text = this._insertUnusedWords(text, unusedWords, mode);
                console.log('[LocalGenerator] 已插入 ' + unusedWords.length + ' 个未使用的单词: ' + unusedWords.join(', '));
            }

            var elapsed = Date.now() - startTime;
            if (elapsed > 100) {
                console.warn('[LocalGenerator] 生成耗时超过100ms:', elapsed + 'ms');
            }

            return {
                success: true,
                text: text,
                words: usedWords
            };
        },

        // ============================================================
        // 内部辅助方法
        // ============================================================

        /**
         * 解析用户输入的单词列表
         * @param {Array} wordsArray
         * @returns {Array} 单词字符串数组
         */
        _parseUserWords: function (wordsArray) {
            var result = [];
            for (var i = 0; i < wordsArray.length; i++) {
                var item = wordsArray[i];
                if (typeof item === 'string') {
                    result.push(item.trim().toLowerCase());
                } else if (item && typeof item === 'object') {
                    // 支持 { word: 'xxx' } 对象格式
                    var w = item.word || item.name || '';
                    if (w) {
                        result.push(w.trim().toLowerCase());
                    }
                }
            }
            return result;
        },

        /**
         * 将用户单词按词性分组
         * @param {Array} userWords - 用户单词数组
         * @returns {Object} { n: [...], v: [...], adj: [...], adv: [...] }
         */
        _groupByPos: function (userWords) {
            var result = { n: [], v: [], adj: [], adv: [] };
            var seen = { n: {}, v: {}, adj: {}, adv: {} };

            for (var i = 0; i < userWords.length; i++) {
                var word = userWords[i];
                var pos = this._lookupPos(word);
                if (pos && result[pos] && !seen[pos][word]) {
                    result[pos].push(word);
                    seen[pos][word] = true;
                }
            }

            return result;
        },

        /**
         * 在POS词典中查找单词的词性，支持后缀推断
         * @param {string} word
         * @returns {string|null} 'n', 'v', 'adj', 'adv' 或 null
         */
        _lookupPos: function (word) {
            if (!word) return null;
            var lower = word.toLowerCase();

            // 1. 在已加载的POS字典中查找
            if (this._posDict) {
                var order = ['v', 'n', 'adj', 'adv'];
                for (var i = 0; i < order.length; i++) {
                    var pos = order[i];
                    if (this._posDict[pos]) {
                        for (var j = 0; j < this._posDict[pos].length; j++) {
                            if (this._posDict[pos][j].toLowerCase() === lower) {
                                return pos;
                            }
                        }
                    }
                }
            }

            // 2. 通过后缀规则推断词性（当词库未命中时）
            return this._inferPosBySuffix(lower);
        },

        /**
         * 通过单词后缀推断词性
         * @param {string} word - 小写单词
         * @returns {string|null} 'n', 'v', 'adj', 'adv' 或 null
         */
        _inferPosBySuffix: function (word) {
            // 名词后缀
            var nounSuffixes = ['tion', 'sion', 'ness', 'ment', 'ity', 'ty', 'ism', 'ist', 'er', 'or', 'ar', 'age', 'ance', 'ence', 'dom', 'ee', 'ery', 'hood', 'ing', 'ure'];
            // 形容词后缀
            var adjSuffixes = ['ful', 'ous', 'ive', 'able', 'ible', 'al', 'ial', 'ical', 'less', 'ish', 'like', 'ly', 'some', 'ward', 'worthy', 'y'];
            // 副词后缀
            var advSuffixes = ['ly', 'ward', 'wards'];
            // 动词后缀
            var verbSuffixes = ['ize', 'ise', 'ify', 'fy', 'en'];

            // 优先检查更具体的后缀（长的优先）
            for (var ni = 0; ni < nounSuffixes.length; ni++) {
                if (word.length > nounSuffixes[ni].length && word.endsWith(nounSuffixes[ni])) return 'n';
            }
            for (var vi = 0; vi < verbSuffixes.length; vi++) {
                if (word.length > verbSuffixes[vi].length && word.endsWith(verbSuffixes[vi])) return 'v';
            }
            for (var ai = 0; ai < adjSuffixes.length; ai++) {
                if (word.length > adjSuffixes[ai].length && word.endsWith(adjSuffixes[ai])) return 'adj';
            }
            for (var adi = 0; adi < advSuffixes.length; adi++) {
                if (word.length > advSuffixes[adi].length && word.endsWith(advSuffixes[adi])) return 'adv';
            }

            return null;
        },

        /**
         * 按主题获取句子骨架
         * @param {string} topic
         * @returns {Array} 骨架数组
         */
        _getSkeletonsByTopic: function (topic) {
            var result = [];
            for (var i = 0; i < SKELETONS.length; i++) {
                if (SKELETONS[i].topic === topic) {
                    result.push(SKELETONS[i]);
                }
            }
            return result;
        },

        /**
         * 获取所有中文叙事骨架（含内置保底）
         * @returns {Array}
         */
        _getChineseSkeletons: function () {
            var result = [];
            for (var i = 0; i < SKELETONS.length; i++) {
                if (SKELETONS[i].topic === 'chinese') {
                    result.push(SKELETONS[i]);
                }
            }
            // 如果没有外部中文模板，使用内置保底
            if (result.length === 0) {
                for (var bi = 0; bi < BUILTIN_CHINESE_SKELETONS.length; bi++) {
                    result.push({
                        text: BUILTIN_CHINESE_SKELETONS[bi].text,
                        slots: BUILTIN_CHINESE_SKELETONS[bi].slots,
                        topic: 'chinese'
                    });
                }
            }
            return result;
        },

        /**
         * 填充句子骨架 - 智能语义匹配模式
         * 占位符语义身份：
         *   {n}     → 普通名词（任意名词）
         *   {v}     → 动词（支持变形）
         *   {adj}   → 形容词
         *   {adv}   → 副词
         *   {Name}  → 专有名词（人名/地名/机构名）— 优先选大写/长词
         *   {term}  → 专业术语（高分学术词）— 优先选较长单词（≥8字母）
         *   {num}   → 数字（直接生成，不消耗单词）
         * @param {Object} skeleton - { text, slots, topic }
         * @param {Object} userByPos - { n: [], v: [], adj: [], adv: [] }
         * @param {string} mode - 'english' or 'chinese'
         * @returns {Object} { text: string, usedWords: Array }
         */
        _fillSkeleton: function (skeleton, userByPos, mode, globalUsedWords) {
            var text = skeleton.text;
            var slots = skeleton.slots || [];
            globalUsedWords = globalUsedWords || [];

            // 从slots中提取form映射（仅对需要变形的词性：v）
            // Name/term/num 不需要变形，不参与form计数
            var formMap = { n: {}, v: {}, adj: {}, adv: {} };
            var formCount = { n: 0, v: 0, adj: 0, adv: 0 };
            for (var si = 0; si < slots.length; si++) {
                var sp = slots[si].pos;
                // 只有标准词性需要form计数，Name/term/num 跳过
                if (sp === 'Name' || sp === 'term' || sp === 'num') continue;
                formCount[sp]++;
                if (slots[si].form && slots[si].form !== 'base') {
                    formMap[sp][formCount[sp]] = slots[si].form;
                }
            }
            // 重置计数（用于实际替换时）
            formCount = { n: 0, v: 0, adj: 0, adv: 0 };

            var usedWords = [];

            // === 统一匹配所有占位符（从右到左替换）===
            // 匹配顺序：标准格式优先，然后扩展格式
            var allPattern = /\{(n|v|adj|adv|Name|term|num)\}/g;
            var allMatches = [];
            var m;
            while ((m = allPattern.exec(text)) !== null) {
                allMatches.push({ type: m[1], index: m.index, len: m[0].length });
            }

            for (var i = allMatches.length - 1; i >= 0; i--) {
                var type = allMatches[i].type;
                var replacement;

                if (type === 'num') {
                    // {num} → 随机数字
                    replacement = String(Math.floor(Math.random() * 90) + 10);
                } else if (type === 'Name') {
                    // {Name} → 专有名词：优先选大写开头或较长的词
                    replacement = this._pickSemanticWord(userByPos, 'Name', usedWords, globalUsedWords);
                } else if (type === 'term') {
                    // {term} → 专业术语：优先选较长单词（≥8字母）
                    replacement = this._pickSemanticWord(userByPos, 'term', usedWords, globalUsedWords);
                } else if (type === 'n' || type === 'v' || type === 'adj' || type === 'adv') {
                    // 标准词性 — 优先选未在全局使用过的词
                    formCount[type]++;
                    var form = formMap[type][formCount[type]] || 'base';
                    var word = this._pickWord(userByPos, type, globalUsedWords);
                    if (!word) word = this._getDefaultWord(type, form);
                    replacement = word;
                    if (type === 'v') replacement = conjugate(word, form);
                    var lower = word.toLowerCase();
                    if (usedWords.indexOf(lower) === -1) usedWords.push(lower);
                    if (globalUsedWords.indexOf(lower) === -1) globalUsedWords.push(lower);
                }

                text = text.substring(0, allMatches[i].index) + replacement + text.substring(allMatches[i].index + allMatches[i].len);
            }

            return {
                text: text,
                usedWords: usedWords
            };
        },

        /**
         * 将未使用的单词插入到生成的文本中
         * 按词性选择语法合适的插入点，保持语义流畅
         * @param {string} text - 已生成的文本
         * @param {Array} unusedWords - 未使用的单词数组
         * @param {string} mode - 'english' or 'chinese'
         * @returns {string} 插入后的文本
         */
        _insertUnusedWords: function (text, unusedWords, mode) {
            if (!text || unusedWords.length === 0) return text;

            // 按段落分割（英文段落通常以 \n\n 分隔）
            var paragraphs = text.split(/\n\n/);
            var insertions = [];

            for (var i = 0; i < unusedWords.length; i++) {
                var word = unusedWords[i];
                var pos = this._lookupPos(word);
                // 将未使用的单词均匀分配到各段落
                var paraIdx = i % paragraphs.length;
                var paragraph = paragraphs[paraIdx];

                if (mode === 'chinese') {
                    // 中文模式：直接在段落末尾添加"（指[word]）"
                    paragraphs[paraIdx] = paragraph + '（指' + word + '）';
                } else {
                    // 英文模式：按词性选择不同的插入方式
                    if (pos === 'adj') {
                        // 形容词：添加到段落末尾
                        paragraphs[paraIdx] = paragraph + ' This is ' + word + '.';
                    } else if (pos === 'adv') {
                        // 副词：添加到段落末尾
                        paragraphs[paraIdx] = paragraph + ' It works ' + word + '.';
                    } else if (pos === 'v') {
                        // 动词：添加为动名词/不定式从句
                        var gerund = word.endsWith('e') ? word.slice(0, -1) + 'ing' : word + 'ing';
                        paragraphs[paraIdx] = paragraph + ' Including ' + gerund + ' is important.';
                    } else {
                        // 名词或其他：以括号补充说明的形式添加
                        paragraphs[paraIdx] = paragraph + ' (' + word + ')';
                    }
                }
            }

            return paragraphs.join('\n\n');
        },

        /**
         * 按语义身份挑选单词
         * @param {Object} userByPos - 用户单词按词性分组
         * @param {string} semanticType - 'Name' 或 'term'
         * @param {Array} usedWords - 已使用的单词（避免重复）
         * @returns {string} 选中的单词
         */
        _pickSemanticWord: function (userByPos, semanticType, usedWords, globalUsedWords) {
            var candidates = userByPos.n || [];
            globalUsedWords = globalUsedWords || [];
            var filtered = [];

            // 过滤掉已使用的词（不修改原数组，仅过滤）
            for (var i = 0; i < candidates.length; i++) {
                var lower = candidates[i].toLowerCase();
                if (usedWords.indexOf(lower) === -1 && globalUsedWords.indexOf(lower) === -1) {
                    filtered.push(candidates[i]);
                }
            }
            // 如果全局过滤后为空，回退到仅过滤当前句子已使用的
            if (filtered.length === 0) {
                for (var fi = 0; fi < candidates.length; fi++) {
                    if (usedWords.indexOf(candidates[fi].toLowerCase()) === -1) {
                        filtered.push(candidates[fi]);
                    }
                }
            }

            if (semanticType === 'Name') {
                // 专有名词：优先选大写开头（暗示专有名词）或长度适中的词（5-12字母）
                var nameCandidates = [];
                for (var ni = 0; ni < filtered.length; ni++) {
                    var w = filtered[ni];
                    // 大写开头 = 很可能是专有名词
                    if (w[0] >= 'A' && w[0] <= 'Z') {
                        nameCandidates.push(w);
                    }
                }
                // 如果没有大写词，选长度适中的
                if (nameCandidates.length === 0) {
                    for (var nj = 0; nj < filtered.length; nj++) {
                        var len = filtered[nj].length;
                        if (len >= 5 && len <= 12) {
                            nameCandidates.push(filtered[nj]);
                        }
                    }
                }
                if (nameCandidates.length > 0) {
                    var idx = Math.floor(Math.random() * nameCandidates.length);
                    var picked = nameCandidates[idx];
                    usedWords.push(picked.toLowerCase());
                    return picked;
                }
            } else if (semanticType === 'term') {
                // 专业术语：优先选较长单词（≥8字母），体现学术属性
                var termCandidates = [];
                for (var ti = 0; ti < filtered.length; ti++) {
                    if (filtered[ti].length >= 8) {
                        termCandidates.push(filtered[ti]);
                    }
                }
                // 如果没有长词，选≥6字母的
                if (termCandidates.length === 0) {
                    for (var tj = 0; tj < filtered.length; tj++) {
                        if (filtered[tj].length >= 6) {
                            termCandidates.push(filtered[tj]);
                        }
                    }
                }
                if (termCandidates.length > 0) {
                    var tIdx = Math.floor(Math.random() * termCandidates.length);
                    var tPicked = termCandidates[tIdx];
                    usedWords.push(tPicked.toLowerCase());
                    return tPicked;
                }
            }

            // 回退到默认库
            var defaultList = DEFAULT_WORDS[semanticType];
            if (defaultList && defaultList.length > 0) {
                var dIdx = Math.floor(Math.random() * defaultList.length);
                return defaultList[dIdx];
            }
            return 'concept';
        },

        /**
         * 为用户挑选合适的单词
         * @param {Object} userByPos - 用户单词按词性分组
         * @param {string} pos - 词性
         * @param {Array} globalUsedWords - 全局已使用的单词（避免跨句子重复）
         * @returns {string|null}
         */
        _pickWord: function (userByPos, pos, globalUsedWords) {
            var candidates = userByPos[pos];
            globalUsedWords = globalUsedWords || [];
            if (candidates && candidates.length > 0) {
                // 优先选未在全局使用过的词
                var unused = [];
                for (var ui = 0; ui < candidates.length; ui++) {
                    if (globalUsedWords.indexOf(candidates[ui].toLowerCase()) === -1) {
                        unused.push(candidates[ui]);
                    }
                }
                // 如果所有词都已使用，回退到全部候选
                var pool = unused.length > 0 ? unused : candidates;
                var idx = Math.floor(Math.random() * pool.length);
                var word = pool[idx];
                // 从原数组中移除（避免同一段落重复使用）
                var originalIdx = candidates.indexOf(word);
                if (originalIdx > -1) {
                    candidates.splice(originalIdx, 1);
                }
                return word;
            }
            return null;
        },

        /**
         * 获取默认词
         * @param {string} pos
         * @param {string} form
         * @returns {string}
         */
        _getDefaultWord: function (pos, form) {
            var list = DEFAULT_WORDS[pos];
            if (!list || list.length === 0) return 'it';
            var idx = Math.floor(Math.random() * list.length);
            var word = list[idx];
            return word;
        },

        /**
         * 将句子组装为段落，加入过渡词
         * @param {Array} sentences - 句子数组
         * @param {number} paraIndex - 段落索引
         * @param {number} totalParas - 总段落数
         * @param {string} mode - 'english' 或 'chinese'
         * @returns {string} 段落文本
         */
        _assembleParagraph: function (sentences, paraIndex, totalParas, mode) {
            if (sentences.length === 0) return '';
            mode = mode || 'english';

            if (mode === 'chinese') {
                return this._assembleChineseParagraph(sentences, paraIndex);
            }

            var result = '';

            for (var i = 0; i < sentences.length; i++) {
                var sentence = sentences[i];

                // 首句大写
                if (i === 0) {
                    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
                }

                // 确保句号结尾
                if (!sentence.match(/[.!?]$/)) {
                    sentence += '.';
                }

                // 添加过渡词
                if (i === 0) {
                    var startTrans = TRANSITIONS.paragraphStart[
                        Math.floor(Math.random() * TRANSITIONS.paragraphStart.length)
                    ];
                    result = startTrans + ' ' + sentence;
                } else if (i < sentences.length - 1) {
                    var transTypes = ['additive', 'exemplifying', 'contrast', 'causal', 'emphasis'];
                    var transType = transTypes[i % transTypes.length];
                    var transList = TRANSITIONS[transType];
                    var trans = transList[Math.floor(Math.random() * transList.length)];
                    // 仅当首字母是小写时才小写化（保护专有名词）
                    var firstChar = sentence.charAt(0);
                    var lowered = (firstChar >= 'a' && firstChar <= 'z') ? firstChar.toLowerCase() : firstChar;
                    result += ' ' + trans + ' ' + lowered + sentence.slice(1);
                } else {
                    var endTrans = TRANSITIONS.concluding[
                        Math.floor(Math.random() * TRANSITIONS.concluding.length)
                    ];
                    // 仅当首字母是小写时才小写化（保护专有名词）
                    var firstChar2 = sentence.charAt(0);
                    var lowered2 = (firstChar2 >= 'a' && firstChar2 <= 'z') ? firstChar2.toLowerCase() : firstChar2;
                    result += ' ' + endTrans + ' ' + lowered2 + sentence.slice(1);
                }
            }

            return result;
        },

        /**
         * 中文模式段落组装
         * @param {Array} sentences
         * @param {number} paraIndex
         * @returns {string}
         */
        _assembleChineseParagraph: function (sentences, paraIndex) {
            if (sentences.length === 0) return '';

            var CHINESE_START = [
                '近年来，', '在当代学术领域中，', '从多维度来看，',
                '值得关注的是，', '研究表明，', '纵观全局，'
            ];

            var CHINESE_MID = [
                '此外，', '与此同时，', '另一方面，',
                '值得注意的是，', '具体而言，', '究其原因，',
                '然而，', '尽管如此，', '相对而言，'
            ];

            var CHINESE_END = [
                '综上所述，', '总体而言，', '由此可见，',
                '归根结底，', '从长远来看，'
            ];

            var result = '';

            for (var i = 0; i < sentences.length; i++) {
                var sentence = sentences[i];

                // 确保中文标点结尾
                if (!sentence.match(/[。！？，；]$/)) {
                    sentence += '。';
                }

                if (i === 0) {
                    var startTrans = CHINESE_START[
                        Math.floor(Math.random() * CHINESE_START.length)
                    ];
                    result = startTrans + sentence;
                } else if (i < sentences.length - 1) {
                    var midTrans = CHINESE_MID[
                        Math.floor(Math.random() * CHINESE_MID.length)
                    ];
                    result += midTrans + sentence;
                } else {
                    var endTrans = CHINESE_END[
                        Math.floor(Math.random() * CHINESE_END.length)
                    ];
                    result += endTrans + sentence;
                }
            }

            return result;
        },

        /**
         * 从数组中随机选取若干元素
         * @param {Array} arr
         * @param {number} n
         * @returns {Array}
         */
        _pickRandom: function (arr, n) {
            if (arr.length === 0) return [];
            var shuffled = arr.slice();
            for (var i = shuffled.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = shuffled[i];
                shuffled[i] = shuffled[j];
                shuffled[j] = temp;
            }
            return shuffled.slice(0, Math.min(n, shuffled.length));
        },

        /**
         * 获取所有骨架（不分主题）
         * @param {string} mode - 'english' or 'chinese'
         * @returns {Array} 骨架数组
         */
        _getAllSkeletons: function (mode) {
            var result = [];
            if (mode === 'chinese') {
                result = this._getChineseSkeletons();
                if (result.length === 0) {
                    result = this._getSkeletonsByTopic('general');
                }
            } else {
                // 英文模式：获取所有主题的骨架
                var topics = ['science', 'technology', 'society', 'economics', 'education',
                              'environment', 'law', 'culture', 'health', 'psychology', 'general'];
                for (var ti = 0; ti < topics.length; ti++) {
                    var skels = this._getSkeletonsByTopic(topics[ti]);
                    for (var si = 0; si < skels.length; si++) {
                        result.push(skels[si]);
                    }
                }
            }
            return result;
        },

        /**
         * 获取一个简单骨架（用于补充句子）
         * @returns {Object} 骨架对象
         */
        _getSimpleSkeleton: function () {
            // 返回一个包含多个占位符的简单骨架，确保能填入用户单词
            var simpleTexts = [
                { text: 'The {n} {v} the {n}.', slots: [{pos:'n'}, {pos:'v'}, {pos:'n'}] },
                { text: 'A {adj} {n} {v} {adv}.', slots: [{pos:'adj'}, {pos:'n'}, {pos:'v'}, {pos:'adv'}] },
                { text: '{Name} {v} the {n} {adv}.', slots: [{pos:'Name'}, {pos:'v'}, {pos:'n'}, {pos:'adv'}] },
                { text: 'The {n} is {adj} and {v}.', slots: [{pos:'n'}, {pos:'adj'}, {pos:'v'}] },
                { text: 'It is {adj} to {v} the {n}.', slots: [{pos:'adj'}, {pos:'v'}, {pos:'n'}] }
            ];
            var idx = Math.floor(Math.random() * simpleTexts.length);
            return simpleTexts[idx];
        },

        /**
         * 获取加载状态
         * @returns {boolean}
         */
        isLoaded: function () {
            return this._initialized;
        }
    };

    // ============================================================
    // 导出到全局
    // ============================================================
    window.LocalGenerator = LocalGenerator;

})();