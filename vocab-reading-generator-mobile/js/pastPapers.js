/**
 * 考研英语真题练习主模块
 * 负责：导航切换、页面路由、三个子功能入口
 */

// ========== 全局画布状态存储（跨模块保留笔记） ==========
window.__canvasStore = window.__canvasStore || {};

function saveCanvasSnapshot(key) {
    const canvas = document.getElementById('ppDrawingCanvas');
    if (!canvas) return;
    window.__canvasStore[key] = canvas.toDataURL();
    if (window.__canvasStore[key] === 'data:,') {
        delete window.__canvasStore[key];
    }
}

function restoreCanvasSnapshot(key) {
    const dataUrl = window.__canvasStore[key];
    if (!dataUrl) return;
    const canvas = document.getElementById('ppDrawingCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
}

// ========== 拖拽工具栏 ==========
function initDrawToolbarDrag(toolbarWrapId) {
    const wrap = document.getElementById(toolbarWrapId);
    if (!wrap) return;

    const toolbar = wrap.querySelector('.pp-draw-toolbar');
    if (!toolbar) return;

    let offsetX = 0, offsetY = 0;
    let isDragging = false;
    let hasMoved = false;
    let startX = 0, startY = 0;

    toolbar.style.cursor = 'grab';

    toolbar.addEventListener('mousedown', (e) => {
        if (e.target.closest('.pp-draw-tool-btn')) return;
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        toolbar.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        if (!hasMoved) {
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            if (dx < 3 && dy < 3) return;
            hasMoved = true;
            const rect = toolbar.getBoundingClientRect();
            offsetX = startX - rect.left;
            offsetY = startY - rect.top;
            toolbar.style.position = 'fixed';
            toolbar.style.zIndex = '1000';
            toolbar.style.left = rect.left + 'px';
            toolbar.style.top = rect.top + 'px';
            wrap.classList.add('draggable');
        }

        toolbar.style.left = (e.clientX - offsetX) + 'px';
        toolbar.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            toolbar.style.cursor = 'grab';
        }
        isDragging = false;
    });
}

// ========== 弹出面板点击外部关闭 ==========
document.addEventListener('click', function closeDrawSettings(e) {
    const penSettings = document.getElementById('ppPenSettings');
    const eraserSettings = document.getElementById('ppEraserSettings');
    if (!penSettings && !eraserSettings) return;

    // 检查点击是否在任意设置面板或工具栏按钮内部
    const target = e.target;
    const insidePen = penSettings && penSettings.contains(target);
    const insideEraser = eraserSettings && eraserSettings.contains(target);
    const insideToolbar = target.closest('.pp-draw-tool-btn');
    const insideSettings = insidePen || insideEraser || insideToolbar;

    if (!insideSettings) {
        if (penSettings && penSettings.style.display !== 'none') {
            penSettings.style.display = 'none';
        }
        if (eraserSettings && eraserSettings.style.display !== 'none') {
            eraserSettings.style.display = 'none';
        }
    }
});

const PastPapers = (() => {
    let isActive = false;
    let currentView = 'home'; // home | reader | cloze | longsentence
    let currentPaper = null;

    function init() {
        const btn = document.getElementById('pastPapersBtn');
        if (btn) {
            btn.addEventListener('click', toggleMode);
        }
    }

    /**
     * 切换真题练习模式
     * 点击当前激活的按钮 → 退出到主界面
     * 点击未激活的按钮 → 关闭其他模块后进入本模块
     */
    function toggleMode() {
        if (isActive) {
            exitMode();
        } else {
            // 模块互斥：关闭其他模块（静默退出，不恢复主界面）
            if (window.VocabLearning && VocabLearning.isActive) {
                VocabLearning.exitMode(true);
            }
            enterMode();
        }
    }

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

        // 创建或显示真题练习容器
        let container = document.getElementById('pastPapersContainer');
        if (!container) {
            container = createContainer();
            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
        } else {
            container.style.display = 'block';
        }

        // 更新顶栏按钮状态
        const btn = document.getElementById('pastPapersBtn');
        if (btn) btn.classList.add('active');

        // 更新标题
        const title = document.querySelector('.nav-title');
        if (title) {
            if (!title.dataset.original) {
                title.dataset.original = title.textContent;
            }
            title.textContent = '真题练习';
        }

        renderHome();
    }

    function exitMode(silent) {
        isActive = false;
        currentView = 'home';
        currentPaper = null;

        const container = document.getElementById('pastPapersContainer');
        if (container) container.style.display = 'none';

        const btn = document.getElementById('pastPapersBtn');
        if (btn) btn.classList.remove('active');

        if (!silent) {
            const sidebar = document.getElementById('sidebarLeft');
            if (sidebar) sidebar.style.display = '';

            const mainContent = document.getElementById('mainContent');
            if (mainContent) mainContent.style.display = '';

            const actionBar = document.querySelector('.action-bar');
            if (actionBar) actionBar.style.display = '';

            const title = document.querySelector('.nav-title');
            if (title && title.dataset.original) {
                title.textContent = title.dataset.original;
            }
        }
    }

    function createContainer() {
        const container = document.createElement('div');
        container.id = 'pastPapersContainer';
        container.className = 'past-papers-container';
        return container;
    }

    /**
     * 渲染首页（功能入口 + 真题列表）
     */
    function renderHome() {
        const container = document.getElementById('pastPapersContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="pp-home">
                <!-- 功能入口 -->
                <div class="pp-home-section">
                    <div class="pp-section-header">
                        <h2 class="pp-section-title">功能入口</h2>
                    </div>
                    <div class="pp-feature-grid">
                        <div class="pp-feature-card" data-feature="reader">
                            <div class="pp-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                            </div>
                            <div class="pp-feature-info">
                                <h3>真题精读</h3>
                                <p>阅读真题原文，点词即查，生词一键加入词单</p>
                            </div>
                        </div>
                        <div class="pp-feature-card" data-feature="cloze">
                            <div class="pp-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <div class="pp-feature-info">
                                <h3>完形填空</h3>
                                <p>交互式做题，自动判分，错题生词一键加入词单</p>
                            </div>
                        </div>
                        <div class="pp-feature-card" data-feature="longsentence">
                            <div class="pp-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 7V4h16v3"></path>
                                    <path d="M9 20h6"></path>
                                    <path d="M12 4v16"></path>
                                </svg>
                            </div>
                            <div class="pp-feature-info">
                                <h3>长难句分析</h3>
                                <p>拆解真题长难句，主干、翻译、语法分析分层查看</p>
                            </div>
                        </div>
                        <div class="pp-feature-card" data-feature="translation">
                            <div class="pp-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div class="pp-feature-info">
                                <h3>翻译练习</h3>
                                <p>翻译真题句子，查看参考译文和详细解析</p>
                            </div>
                        </div>
                        <div class="pp-feature-card" data-feature="writing">
                            <div class="pp-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                            </div>
                            <div class="pp-feature-info">
                                <h3>作文指导</h3>
                                <p>查看作文题目，参考范文和写作技巧</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 真题列表 -->
                <div class="pp-home-section">
                    <div class="pp-section-header">
                        <h2 class="pp-section-title">历年真题</h2>
                        <div class="pp-type-toggle">
                            <button class="pp-type-btn active" data-type="英语一">英语一</button>
                            <button class="pp-type-btn" data-type="英语二">英语二</button>
                        </div>
                    </div>
                    <div class="pp-paper-grid" id="ppPaperGrid">
                        <div class="pp-loading">加载中...</div>
                    </div>
                </div>
            </div>
        `;

        // 绑定功能卡片点击
        container.querySelectorAll('.pp-feature-card').forEach(card => {
            card.addEventListener('click', () => {
                const feature = card.dataset.feature;
                if (feature === 'reader') {
                    currentView = 'reader';
                    showReaderPaperSelect();
                } else if (feature === 'cloze') {
                    currentView = 'cloze';
                    showClozePaperSelect();
                } else if (feature === 'longsentence') {
                    currentView = 'longsentence';
                    showLongSentence();
                } else if (feature === 'translation') {
                    currentView = 'translation';
                    showTranslationPaperSelect();
                } else if (feature === 'writing') {
                    currentView = 'writing';
                    showWritingPaperSelect();
                }
            });
        });

        // 绑定类型切换
        container.querySelectorAll('.pp-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.pp-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadPaperList(btn.dataset.type, 'reader');
            });
        });

        // 默认加载英语一
        loadPaperList('英语一', 'reader');
    }

    /**
     * 加载真题列表
     */
    async function loadPaperList(type, feature) {
        const grid = document.getElementById('ppPaperGrid');
        if (!grid) return;

        try {
            const res = await fetch('vocab-lib/pastpapers/index.json');
            const index = await res.json();

            const filtered = index.filter(p => p.type === type);
            filtered.sort((a, b) => b.year - a.year);

            let html = '';
            filtered.forEach(paper => {
                const paperNum = paper.id.includes('-1') ? '第1套' : (paper.id.includes('-2') ? '第2套' : '');
                const yearNum = parseInt(paper.year);
                const isEarlyExam = yearNum >= 2000 && yearNum <= 2009 && paper.type === '英语一';
                const earlyTag = isEarlyExam ? '<span class="pp-paper-early-tag">早期真题</span>' : '';
                html += `
                    <div class="pp-paper-card" data-paper-id="${paper.id}">
                        <div class="pp-paper-cover">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                        <div class="pp-paper-name">${paper.year} ${paper.type} ${paperNum} ${earlyTag}</div>
                    </div>
                `;
            });

            grid.innerHTML = html;

            grid.querySelectorAll('.pp-paper-card').forEach(card => {
                card.addEventListener('click', () => {
                    const paperId = card.dataset.paperId;
                    openPaper(paperId, feature);
                });
            });
        } catch (e) {
            grid.innerHTML = `<div class="pp-loading">加载失败：${e.message}</div>`;
        }
    }

    function showReaderPaperSelect() {
        const container = document.getElementById('pastPapersContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="pp-subpage">
                <div class="pp-subpage-header">
                    <button class="pp-back-btn" id="ppBackBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5"></path>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        返回
                    </button>
                    <h2>真题精读 - 选择试卷</h2>
                    <div class="pp-type-toggle">
                        <button class="pp-type-btn active" data-type="英语一">英语一</button>
                        <button class="pp-type-btn" data-type="英语二">英语二</button>
                    </div>
                </div>
                <div class="pp-paper-grid" id="ppPaperGrid"></div>
            </div>
        `;

        document.getElementById('ppBackBtn').addEventListener('click', () => {
            currentView = 'home';
            renderHome();
        });

        container.querySelectorAll('.pp-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.pp-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadPaperListForFeature(btn.dataset.type, 'reader');
            });
        });

        loadPaperListForFeature('英语一', 'reader');
    }

    function showClozePaperSelect() {
        const container = document.getElementById('pastPapersContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="pp-subpage">
                <div class="pp-subpage-header">
                    <button class="pp-back-btn" id="ppBackBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5"></path>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        返回
                    </button>
                    <h2>完形填空 - 选择试卷</h2>
                    <div class="pp-type-toggle">
                        <button class="pp-type-btn active" data-type="英语一">英语一</button>
                        <button class="pp-type-btn" data-type="英语二">英语二</button>
                    </div>
                </div>
                <div class="pp-paper-grid" id="ppPaperGrid"></div>
            </div>
        `;

        document.getElementById('ppBackBtn').addEventListener('click', () => {
            currentView = 'home';
            renderHome();
        });

        container.querySelectorAll('.pp-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.pp-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadPaperListForFeature(btn.dataset.type, 'cloze');
            });
        });

        loadPaperListForFeature('英语一', 'cloze');
    }

    async function loadPaperListForFeature(type, feature) {
        const grid = document.getElementById('ppPaperGrid');
        if (!grid) return;

        try {
            const res = await fetch('vocab-lib/pastpapers/index.json');
            const index = await res.json();

            const filtered = index.filter(p => p.type === type);
            filtered.sort((a, b) => b.year - a.year);

            let html = '';
            filtered.forEach(paper => {
                const paperNum = paper.id.includes('-1') ? '第1套' : (paper.id.includes('-2') ? '第2套' : '');
                const yearNum = parseInt(paper.year);
                const isEarlyExam = yearNum >= 2000 && yearNum <= 2009 && paper.type === '英语一';
                const earlyTag = isEarlyExam ? '<span class="pp-paper-early-tag">早期真题</span>' : '';
                html += `
                    <div class="pp-paper-card" data-paper-id="${paper.id}">
                        <div class="pp-paper-cover">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                        <div class="pp-paper-name">${paper.year} ${paper.type} ${paperNum} ${earlyTag}</div>
                    </div>
                `;
            });

            grid.innerHTML = html;

            grid.querySelectorAll('.pp-paper-card').forEach(card => {
                card.addEventListener('click', () => {
                    const paperId = card.dataset.paperId;
                    openPaper(paperId, feature);
                });
            });
        } catch (e) {
            grid.innerHTML = `<div class="pp-loading">加载失败：${e.message}</div>`;
        }
    }

    async function openPaper(paperId, feature) {
        try {
            const res = await fetch(`vocab-lib/pastpapers/${paperId}.json`);
            const paper = await res.json();
            currentPaper = paper;

            if (feature === 'reader') {
                if (window.PastPaperReader) {
                    window.PastPaperReader.render(paper, () => {
                        currentView = 'reader';
                        showReaderPaperSelect();
                    });
                }
            } else if (feature === 'cloze') {
                if (window.ClozeExercise) {
                    window.ClozeExercise.render(paper, () => {
                        currentView = 'cloze';
                        showClozePaperSelect();
                    });
                }
            } else if (feature === 'translation') {
                if (window.Translation) {
                    window.Translation.render(paper, () => {
                        currentView = 'translation';
                        showTranslationPaperSelect();
                    });
                }
            } else if (feature === 'writing') {
                if (window.Writing) {
                    window.Writing.render(paper, () => {
                        currentView = 'writing';
                        showWritingPaperSelect();
                    });
                }
            }
        } catch (e) {
            alert('加载真题失败：' + e.message);
        }
    }

    function showLongSentence() {
        if (window.LongSentence) {
            window.LongSentence.render(() => {
                currentView = 'home';
                renderHome();
            });
        }
    }

    function showTranslationPaperSelect() {
        const container = document.getElementById('pastPapersContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="pp-subpage">
                <div class="pp-subpage-header">
                    <button class="pp-back-btn" id="ppBackBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5"></path>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        返回
                    </button>
                    <h2>翻译练习 - 选择试卷</h2>
                    <div class="pp-type-toggle">
                        <button class="pp-type-btn active" data-type="英语一">英语一</button>
                        <button class="pp-type-btn" data-type="英语二">英语二</button>
                    </div>
                </div>
                <div class="pp-paper-grid" id="ppPaperGrid"></div>
            </div>
        `;

        document.getElementById('ppBackBtn').addEventListener('click', () => {
            currentView = 'home';
            renderHome();
        });

        container.querySelectorAll('.pp-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.pp-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadPaperListForFeature(btn.dataset.type, 'translation');
            });
        });

        loadPaperListForFeature('英语一', 'translation');
    }

    function showWritingPaperSelect() {
        const container = document.getElementById('pastPapersContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="pp-subpage">
                <div class="pp-subpage-header">
                    <button class="pp-back-btn" id="ppBackBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5"></path>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        返回
                    </button>
                    <h2>作文指导 - 选择试卷</h2>
                    <div class="pp-type-toggle">
                        <button class="pp-type-btn active" data-type="英语一">英语一</button>
                        <button class="pp-type-btn" data-type="英语二">英语二</button>
                    </div>
                </div>
                <div class="pp-paper-grid" id="ppPaperGrid"></div>
            </div>
        `;

        document.getElementById('ppBackBtn').addEventListener('click', () => {
            currentView = 'home';
            renderHome();
        });

        container.querySelectorAll('.pp-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.pp-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadPaperListForFeature(btn.dataset.type, 'writing');
            });
        });

        loadPaperListForFeature('英语一', 'writing');
    }

    return {
        init,
        toggleMode,
        enterMode,
        exitMode,
        get isActive() { return isActive; }
    };
})();

// 暴露到 window 对象，供其他模块引用
window.PastPapers = PastPapers;

// DOMContentLoaded 时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PastPapers.init());
} else {
    PastPapers.init();
}
