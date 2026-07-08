/**
 * 真题精读模块
 * 功能：阅读真题原文 + 点词即查 + 生词一键加词单
 */
const PastPaperReader = (() => {
    let currentPaper = null;
    let currentSectionIndex = 0;
    let onBack = null;
    let currentMode = 'select';
    let sectionAnswers = {};

    let drawingCanvas = null;
    let ctx = null;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    let penColor = '#e74c3c';
    let penSize = 4;
    let penShape = 'circle';
    let penOpacity = 1;

    let eraserSize = 20;
    let eraserShape = 'circle';

    /**
     * 渲染精读页面
     * @param {Object} paper - 真题数据
     * @param {Function} backCallback - 返回回调
     */
    function render(paper, backCallback) {
        currentPaper = paper;
        onBack = backCallback;
        currentSectionIndex = 0;
        currentMode = 'select';
        sectionAnswers = {};

        const container = document.getElementById('pastPapersContainer');
        if (!container) return;

        const readingSections = paper.sections.filter(s => s.type === 'reading');
        if (readingSections.length === 0) {
            container.innerHTML = `
                <div class="pp-subpage">
                    <div class="pp-subpage-header">
                        <button class="pp-back-btn" id="ppBackBtn">← 返回</button>
                        <h2>${paper.year} ${paper.type}</h2>
                    </div>
                    <div style="padding:40px; text-align:center; color:var(--text-secondary);">
                        暂无可精读的阅读文章
                    </div>
                </div>
            `;
            document.getElementById('ppBackBtn').addEventListener('click', () => {
            const snapshotKey = 'reader_' + currentPaper.id;
            saveCanvasSnapshot(snapshotKey);
            onBack();
        });
            return;
        }

        const sectionTabs = readingSections.map((s, i) =>
            `<button class="pp-tab-btn ${i === 0 ? 'active' : ''}" data-index="${i}">${s.title}</button>`
        ).join('');

        container.innerHTML = `
            <div class="pp-reader">
                <div class="pp-reader-header">
                    <button class="pp-back-btn" id="ppBackBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5"></path>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        返回
                    </button>
                    <div class="pp-reader-title">
                        <h2>${paper.year} ${paper.type}</h2>
                        <span class="pp-reader-subtitle">真题精读</span>
                    </div>
                    <div class="pp-reader-actions">
                        <button class="pp-action-btn" id="ppAddAllWordsBtn" title="将本篇生词加入词单">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14"></path>
                                <path d="M5 12h14"></path>
                            </svg>
                            加入词单
                        </button>
                    </div>
                </div>

                <div class="pp-tab-bar">
                    ${sectionTabs}
                </div>

                <div class="pp-reader-content" id="ppReaderContent">
                    <!-- 文章内容 -->
                </div>
            </div>
        `;

        document.getElementById('ppBackBtn').addEventListener('click', onBack);

        // Tab 切换
        container.querySelectorAll('.pp-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                switchSection(idx);
            });
        });

        // 初始渲染第一篇
        renderSection(0);

        window.addEventListener('resize', updateCanvasSize);
    }

    function switchSection(index) {
        // 切换前保存当前画布
        saveCanvasSnapshot('reader_' + currentPaper.id);

        const buttons = document.querySelectorAll('.pp-tab-btn');
        buttons.forEach((b, i) => {
            b.classList.toggle('active', i === index);
        });
        currentSectionIndex = index;
        renderSection(index);
    }

    function renderSection(index) {
        const readingSections = currentPaper.sections.filter(s => s.type === 'reading');
        const section = readingSections[index];
        if (!section) {
            console.error('[PastPaperReader] Section not found at index:', index, 'Total reading sections:', readingSections.length);
            return;
        }

        const content = document.getElementById('ppReaderContent');
        if (!content) return;

        if (!section.article || typeof section.article !== 'string') {
            console.warn('[PastPaperReader] Section article is missing or not a string:', index, section);
            content.innerHTML = `
                <div class="pp-article">
                    <h3 class="pp-article-title">${section.title || '文章'}</h3>
                    <div style="padding:40px; text-align:center; color:var(--text-secondary);">
                        文章内容暂不可用
                    </div>
                </div>
            `;
            return;
        }

        const paragraphs = section.article.split(/(?<=[.!?])\s+/).filter(p => p.trim());

        content.innerHTML = `
            <div class="pp-article">
                <h3 class="pp-article-title">${section.title}</h3>
                <div class="pp-article-text" id="ppArticleText">
                    ${paragraphs.map(p => `<p class="pp-paragraph">${wrapWords(p)}</p>`).join('')}
                </div>
                <div class="pp-draw-toolbar-wrap" id="ppReaderToolbarWrap">
                    <div class="pp-draw-toolbar" id="ppReaderToolbar">
                        <button class="pp-draw-tool-btn" data-action="undo" title="撤销">
                            <svg viewBox="0 0 24 24"><path d="M3 10h13a4 4 0 0 1 0 8H7"/><polyline points="7 6 3 10 7 14"/></svg>
                        </button>
                        <button class="pp-draw-tool-btn" data-mode="eraser" data-eraser-shape="circle" title="圆形橡皮擦">
                            <svg viewBox="0 0 24 24"><path d="M20 20H7L3 16c-1-1-1-2.5 0-3.5l9-9c1-1 2.5-1 3.5 0l5 5c1 1 1 2.5 0 3.5L12 20"/><path d="M18 13L9 4"/></svg>
                        </button>
                        <button class="pp-draw-tool-btn" data-mode="write" title="书写">
                            <svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                        <button class="pp-draw-tool-btn active" data-mode="select" title="选择">
                            <svg viewBox="0 0 24 24"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>
                        </button>
                        <button class="pp-draw-tool-btn" data-mode="eraser" data-eraser-shape="square" title="方形橡皮擦">
                            <svg viewBox="0 0 24 24"><path d="M17 3L3 17l4 4h6l8-8-4-4z"/><path d="M11 11l2-2"/></svg>
                        </button>
                        <button class="pp-draw-tool-btn" data-action="clearAll" title="清除">
                            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                    </div>
                    <div class="pp-draw-settings" id="ppPenSettings" style="display:none;">
                        <div class="pp-draw-settings-row">
                            <span class="pp-draw-settings-label">颜色</span>
                            <div class="pp-pen-colors">
                                <button class="pp-color-btn active" data-color="#e74c3c" style="background:#e74c3c"></button>
                                <button class="pp-color-btn" data-color="#3498db" style="background:#3498db"></button>
                                <button class="pp-color-btn" data-color="#2ecc71" style="background:#2ecc71"></button>
                                <button class="pp-color-btn" data-color="#f1c40f" style="background:#f1c40f"></button>
                                <button class="pp-color-btn" data-color="#2c3e50" style="background:#2c3e50"></button>
                                <button class="pp-color-btn pp-color-custom" id="ppCustomColorBtn" title="自定义颜色">
                                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                                </button>
                                <input type="color" id="ppCustomColorInput" value="#e74c3c" style="display:none;">
                            </div>
                        </div>
                        <div class="pp-draw-settings-row">
                            <div class="pp-slider-group">
                                <label class="pp-slider-label">
                                    <span>粗细</span>
                                    <span class="pp-slider-value" id="ppPenSizeValue">4</span>
                                </label>
                                <input type="range" class="pp-slider" id="ppPenSize" min="1" max="20" value="4">
                            </div>
                            <div class="pp-slider-group">
                                <label class="pp-slider-label">
                                    <span>透明度</span>
                                    <span class="pp-slider-value" id="ppPenOpacityValue">100%</span>
                                </label>
                                <input type="range" class="pp-slider" id="ppPenOpacity" min="10" max="100" value="100">
                            </div>
                            <div class="pp-shape-btns">
                                <button class="pp-shape-btn active" data-shape="circle" title="圆形">
                                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor"/></svg>
                                </button>
                                <button class="pp-shape-btn" data-shape="square" title="方形">
                                    <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" fill="currentColor"/></svg>
                                </button>
                                <button class="pp-shape-btn" data-shape="marker" title="荧光笔">
                                    <svg viewBox="0 0 24 24"><path d="M4 20L20 4" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                                </button>
                                <button class="pp-shape-btn" data-shape="dashed" title="虚线">
                                    <svg viewBox="0 0 24 24"><path d="M4 12h4M10 12h4M16 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="pp-draw-settings" id="ppEraserSettings" style="display:none;">
                        <div class="pp-draw-settings-row">
                            <span class="pp-draw-settings-label">大小</span>
                            <div class="pp-slider-group" style="min-width:120px;">
                                <label class="pp-slider-label">
                                    <span class="pp-slider-value" id="ppEraserSizeValue">20</span>
                                </label>
                                <input type="range" class="pp-slider" id="ppEraserSize" min="5" max="50" value="20">
                            </div>
                            <div class="pp-shape-btns pp-eraser-shape-btns">
                                <button class="pp-shape-btn active" data-shape="circle" title="圆形">
                                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor"/></svg>
                                </button>
                                <button class="pp-shape-btn" data-shape="square" title="方形">
                                    <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" fill="currentColor"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                ${section.questions && section.questions.length > 0 ? `
                <div class="pp-questions-section">
                    <h4 class="pp-questions-title">题目</h4>
                    <div class="pp-questions-list" id="ppQuestionsList">
                        ${section.questions.map((q, i) => `
                            <div class="pp-question-item">
                                <div class="pp-question-num">${q.num}.</div>
                                <div class="pp-question-body">
                                    <p class="pp-question-text">${q.question}</p>
                                    <div class="pp-question-options" data-question-num="${q.num}">
                                        ${['A', 'B', 'C', 'D'].map(letter => `
                                            <div class="pp-option-item" data-option="${letter}">
                                                <span class="pp-option-letter">${letter}</span>
                                                <span class="pp-option-text">${q[letter] || ''}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        // 绑定点词即查
        bindWordClick();

        // 绑定工具栏和题目选项点击
        bindReaderToolbar();
        bindOptionClick();

        // 创建画布
        createDrawingCanvas();

        // 初始化拖拽
        initDrawToolbarDrag('ppReaderToolbarWrap');

        // 恢复画布内容
        setTimeout(() => restoreCanvasSnapshot('reader_' + currentPaper.id), 50);

        // 应用当前模式
        applyCurrentMode();
    }

    /**
     * 绑定题目选项点击事件
     */
    function bindOptionClick() {
        const questionsList = document.getElementById('ppQuestionsList');
        if (!questionsList) return;

        questionsList.addEventListener('click', (e) => {
            const optionEl = e.target.closest('.pp-option-item');
            if (!optionEl) return;

            const optionsContainer = optionEl.parentElement;
            const questionNum = optionsContainer.dataset.questionNum;
            const selectedOption = optionEl.dataset.option;

            optionsContainer.querySelectorAll('.pp-option-item').forEach(opt => {
                opt.classList.remove('selected');
            });

            optionEl.classList.add('selected');

            if (!sectionAnswers[currentSectionIndex]) {
                sectionAnswers[currentSectionIndex] = {};
            }
            sectionAnswers[currentSectionIndex][questionNum] = selectedOption;
        });
    }

    // 撤销栈
    let undoStack = [];
    const MAX_UNDO = 20;

    function saveCanvasState() {
        if (!ctx || !drawingCanvas) return;
        const dataUrl = drawingCanvas.toDataURL();
        undoStack.push(dataUrl);
        if (undoStack.length > MAX_UNDO) {
            undoStack.shift();
        }
    }

    function undoCanvas() {
        if (undoStack.length === 0) {
            if (window.InteractionManager) {
                window.InteractionManager.showToast('没有可撤销的操作', 'info');
            }
            return;
        }
        const prevState = undoStack.pop();
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            ctx.drawImage(img, 0, 0);
            if (currentPaper) {
                saveCanvasSnapshot('reader_' + currentPaper.id);
            }
        };
        img.src = prevState;
        if (window.InteractionManager) {
            window.InteractionManager.showToast('已撤销', 'success');
        }
    }

    function bindReaderToolbar() {
        const toolbar = document.getElementById('ppReaderToolbar');
        if (!toolbar) return;

        toolbar.querySelectorAll('.pp-draw-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                const action = btn.dataset.action;
                const eraserShapeVal = btn.dataset.eraserShape;

                if (action === 'undo') {
                    undoCanvas();
                    return;
                }

                if (action === 'clearAll') {
                    saveCanvasState();
                    clearCanvas();
                    if (window.InteractionManager) {
                        window.InteractionManager.showToast('已清除涂鸦', 'success');
                    }
                    return;
                }

                if (mode === 'eraser') {
                    currentMode = 'eraser';
                    if (eraserShapeVal) {
                        eraserShape = eraserShapeVal;
                    }
                } else {
                    currentMode = mode;
                }

                toolbar.querySelectorAll('.pp-draw-tool-btn').forEach(b => {
                    const bMode = b.dataset.mode;
                    const bAction = b.dataset.action;
                    if (bAction === 'undo' || bAction === 'clearAll') {
                        b.classList.remove('active');
                        return;
                    }
                    if (bMode === 'eraser' && mode === 'eraser') {
                        b.classList.toggle('active', b.dataset.eraserShape === eraserShape);
                    } else {
                        b.classList.toggle('active', bMode === mode);
                    }
                });

                const penSettings = document.getElementById('ppPenSettings');
                const eraserSettings = document.getElementById('ppEraserSettings');

                if (mode === 'write') {
                    if (penSettings) penSettings.style.display = 'flex';
                    if (eraserSettings) eraserSettings.style.display = 'none';
                    if (drawingCanvas) {
                        drawingCanvas.style.pointerEvents = 'auto';
                        drawingCanvas.classList.remove('pp-eraser-cursor', 'pp-select-cursor');
                        drawingCanvas.classList.add('pp-write-cursor');
                    }
                } else if (mode === 'eraser') {
                    if (penSettings) penSettings.style.display = 'none';
                    if (eraserSettings) eraserSettings.style.display = 'flex';
                    if (drawingCanvas) {
                        drawingCanvas.style.pointerEvents = 'auto';
                        drawingCanvas.classList.remove('pp-write-cursor', 'pp-select-cursor');
                        drawingCanvas.classList.add('pp-eraser-cursor');
                    }
                } else {
                    if (penSettings) penSettings.style.display = 'none';
                    if (eraserSettings) eraserSettings.style.display = 'none';
                    if (drawingCanvas) {
                        drawingCanvas.style.pointerEvents = 'none';
                        drawingCanvas.classList.remove('pp-write-cursor', 'pp-eraser-cursor');
                        drawingCanvas.classList.add('pp-select-cursor');
                    }
                }

                restoreSectionAnswers();

                // 保存画布状态
                saveCanvasSnapshot('reader_' + currentPaper.id);
            });
        });

        const colorBtns = document.querySelectorAll('.pp-color-btn:not(.pp-color-custom)');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                colorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                penColor = btn.dataset.color;
                const customInput = document.getElementById('ppCustomColorInput');
                if (customInput) customInput.value = penColor;
            });
        });

        const customColorBtn = document.getElementById('ppCustomColorBtn');
        const customColorInput = document.getElementById('ppCustomColorInput');
        if (customColorBtn && customColorInput) {
            customColorBtn.addEventListener('click', () => {
                customColorInput.click();
            });
            customColorInput.addEventListener('input', () => {
                penColor = customColorInput.value;
                colorBtns.forEach(b => b.classList.remove('active'));
                customColorBtn.style.background = penColor;
                customColorBtn.classList.add('active');
            });
        }

        const penSizeSlider = document.getElementById('ppPenSize');
        const penSizeValue = document.getElementById('ppPenSizeValue');
        if (penSizeSlider && penSizeValue) {
            penSizeSlider.addEventListener('input', () => {
                penSize = parseInt(penSizeSlider.value);
                penSizeValue.textContent = penSize;
            });
        }

        const penOpacitySlider = document.getElementById('ppPenOpacity');
        const penOpacityValue = document.getElementById('ppPenOpacityValue');
        if (penOpacitySlider && penOpacityValue) {
            penOpacitySlider.addEventListener('input', () => {
                penOpacity = parseFloat(penOpacitySlider.value) / 100;
                penOpacityValue.textContent = penOpacitySlider.value + '%';
            });
        }

        const penShapeBtns = document.querySelectorAll('#ppPenSettings .pp-shape-btn');
        penShapeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                penShapeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                penShape = btn.dataset.shape;
            });
        });

        const eraserSizeSlider = document.getElementById('ppEraserSize');
        const eraserSizeValue = document.getElementById('ppEraserSizeValue');
        if (eraserSizeSlider && eraserSizeValue) {
            eraserSizeSlider.addEventListener('input', () => {
                eraserSize = parseInt(eraserSizeSlider.value);
                eraserSizeValue.textContent = eraserSize;
            });
        }

        const eraserShapeBtns = document.querySelectorAll('#ppEraserSettings .pp-shape-btn');
        eraserShapeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                eraserShapeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                eraserShape = btn.dataset.shape;
            });
        });
    }

    function restoreSectionAnswers() {
        const answers = sectionAnswers[currentSectionIndex];
        if (!answers) return;

        Object.keys(answers).forEach(questionNum => {
            const optionsContainer = document.querySelector(`.pp-question-options[data-question-num="${questionNum}"]`);
            if (!optionsContainer) return;

            const selectedOption = answers[questionNum];
            const optionEl = optionsContainer.querySelector(`.pp-option-item[data-option="${selectedOption}"]`);
            if (optionEl) {
                optionEl.classList.add('selected');
            }
        });
    }

    function applyCurrentMode() {
        const toolbar = document.getElementById('ppReaderToolbar');
        if (toolbar) {
            toolbar.querySelectorAll('.pp-toolbar-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === currentMode);
            });
        }

        const questionsSection = document.querySelector('.pp-questions-section');
        const penSettings = document.getElementById('ppPenSettings');
        const eraserSettings = document.getElementById('ppEraserSettings');

        if (currentMode === 'write') {
            if (penSettings) penSettings.style.display = 'flex';
            if (eraserSettings) eraserSettings.style.display = 'none';
            if (questionsSection) {
                questionsSection.classList.remove('pp-write-mode');
            }
            if (drawingCanvas) {
                drawingCanvas.style.pointerEvents = 'auto';
                drawingCanvas.classList.remove('pp-eraser-cursor');
                drawingCanvas.classList.add('pp-write-cursor');
            }
        } else if (currentMode === 'eraser') {
            if (penSettings) penSettings.style.display = 'none';
            if (eraserSettings) eraserSettings.style.display = 'flex';
            if (questionsSection) {
                questionsSection.classList.remove('pp-write-mode');
            }
            if (drawingCanvas) {
                drawingCanvas.style.pointerEvents = 'auto';
                drawingCanvas.classList.remove('pp-write-cursor', 'pp-select-cursor');
                drawingCanvas.classList.add('pp-eraser-cursor');
            }
        } else {
            if (penSettings) penSettings.style.display = 'none';
            if (eraserSettings) eraserSettings.style.display = 'none';
            if (questionsSection) {
                questionsSection.classList.remove('pp-write-mode');
            }
            if (drawingCanvas) {
                drawingCanvas.style.pointerEvents = 'none';
                drawingCanvas.classList.remove('pp-write-cursor', 'pp-eraser-cursor');
                drawingCanvas.classList.add('pp-select-cursor');
            }
        }

        restoreSectionAnswers();
    }

    /**
     * 把段落中的单词包上 span，用于点击
     */
    function wrapWords(text) {
        return text.replace(/([a-zA-Z]+(?:'[a-zA-Z]+)?)/g, '<span class="pp-word">$1</span>');
    }

    /**
     * 绑定点词事件
     */
    function bindWordClick() {
        const container = document.getElementById('ppArticleText');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const wordEl = e.target.closest('.pp-word');
            if (!wordEl) return;

            const word = wordEl.textContent.trim().toLowerCase();
            if (word.length < 2) return;

            // 高亮当前点击的词
            container.querySelectorAll('.pp-word.active').forEach(w => w.classList.remove('active'));
            wordEl.classList.add('active');

            // 查询释义
            lookupWord(word, wordEl);
        });
    }

    function createDrawingCanvas() {
        const articleText = document.getElementById('ppArticleText');
        if (!articleText) return;

        const existingCanvas = document.getElementById('ppDrawingCanvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        drawingCanvas = document.createElement('canvas');
        drawingCanvas.id = 'ppDrawingCanvas';
        drawingCanvas.style.position = 'absolute';
        drawingCanvas.style.top = '0';
        drawingCanvas.style.left = '0';
        drawingCanvas.style.pointerEvents = 'none';
        drawingCanvas.style.zIndex = '100';

        const rect = articleText.getBoundingClientRect();
        drawingCanvas.width = rect.width;
        drawingCanvas.height = rect.height;

        articleText.style.position = 'relative';
        articleText.appendChild(drawingCanvas);

        // 默认选择模式光标
        drawingCanvas.classList.add('pp-select-cursor');

        ctx = drawingCanvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        bindCanvasEvents();
    }

    function bindCanvasEvents() {
        if (!drawingCanvas) return;

        drawingCanvas.addEventListener('mousedown', startDrawing);
        drawingCanvas.addEventListener('mousemove', draw);
        drawingCanvas.addEventListener('mouseup', stopDrawing);
        drawingCanvas.addEventListener('mouseleave', stopDrawing);

        drawingCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        drawingCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        drawingCanvas.addEventListener('touchend', stopDrawing);
    }

    function handleTouchStart(e) {
        e.preventDefault();
        saveCanvasState();
        const touch = e.touches[0];
        const rect = drawingCanvas.getBoundingClientRect();
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
        isDrawing = true;
        startDrawingAt(lastX, lastY);
    }

    function handleTouchMove(e) {
        e.preventDefault();
        if (!isDrawing) return;
        const touch = e.touches[0];
        const rect = drawingCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        drawTo(x, y);
        lastX = x;
        lastY = y;
    }

    function startDrawing(e) {
        saveCanvasState();
        const rect = drawingCanvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        isDrawing = true;
        startDrawingAt(lastX, lastY);
    }

    function draw(e) {
        if (!isDrawing) return;
        const rect = drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        drawTo(x, y);
        lastX = x;
        lastY = y;
    }

    function stopDrawing() {
        isDrawing = false;
        if (currentPaper) {
            saveCanvasSnapshot('reader_' + currentPaper.id);
        }
    }

    function startDrawingAt(x, y) {
        if (currentMode === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            if (eraserShape === 'square') {
                const halfSize = eraserSize / 2;
                ctx.fillRect(x - halfSize, y - halfSize, eraserSize, eraserSize);
            } else {
                ctx.arc(x, y, eraserSize / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (currentMode === 'write') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.strokeStyle = penColor;
            ctx.globalAlpha = penOpacity;
            ctx.lineWidth = penSize;

            if (penShape === 'dashed') {
                ctx.setLineDash([penSize * 2, penSize * 2]);
            } else if (penShape === 'marker') {
                ctx.globalAlpha = penOpacity * 0.5;
                ctx.lineWidth = penSize * 3;
                ctx.lineCap = 'square';
            } else {
                ctx.lineCap = penShape === 'square' ? 'square' : 'round';
            }
        }
    }

    function drawTo(x, y) {
        if (currentMode === 'eraser') {
            ctx.beginPath();
            if (eraserShape === 'square') {
                const halfSize = eraserSize / 2;
                ctx.fillRect(x - halfSize, y - halfSize, eraserSize, eraserSize);
            } else {
                ctx.arc(x, y, eraserSize / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (currentMode === 'write') {
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function clearCanvas() {
        if (ctx) {
            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        }
    }

    function updateCanvasSize() {
        if (!drawingCanvas || !ctx) return;
        const articleText = document.getElementById('ppArticleText');
        if (!articleText) return;

        const rect = articleText.getBoundingClientRect();
        drawingCanvas.width = rect.width;
        drawingCanvas.height = rect.height;
    }

    /**
     * 查询单词释义（复用 vocabSearch）
     */
    async function lookupWord(word, element) {
        if (!window.VocabSearch) {
            showWordPopup(word, '查询功能不可用', element);
            return;
        }

        const localResult = window.VocabSearch.searchWords(word);
        if (localResult && localResult.length > 0) {
            const firstMatch = localResult[0];
            let meaning = '';
            if (firstMatch.data && firstMatch.data.length > 0) {
                const data = firstMatch.data[0];
                if (data.entries && data.entries.length > 0) {
                    for (const entry of data.entries) {
                        if (entry.partOfSpeech) {
                            meaning += entry.partOfSpeech + ' ';
                        }
                        if (entry.definitions && entry.definitions.length > 0) {
                            meaning += entry.definitions.map(d => d.definition).join('；') + '；';
                        }
                    }
                } else if (data.meaning) {
                    meaning = data.meaning;
                }
            } else if (firstMatch.phonetic) {
                meaning = firstMatch.phonetic;
            }
            showWordPopup(word, meaning || '暂无释义', element);
            return;
        }

        const enableNonImportedLookup = localStorage.getItem('enableNonImportedLookup') === 'true';
        if (!enableNonImportedLookup) {
            showWordPopup(word, '非导入词在线查询未开启', element);
            return;
        }

        if (typeof window.VocabSearch.lookupWordOnline === 'function') {
            try {
                const result = await window.VocabSearch.lookupWordOnline(word);
                if (result && result.entries && result.entries.length > 0) {
                    let meaning = '';
                    if (result.phonetic) {
                        meaning += '[' + result.phonetic + '] ';
                    }
                    for (const entry of result.entries) {
                        if (entry.partOfSpeech) {
                            meaning += entry.partOfSpeech + ' ';
                        }
                        if (entry.definitions && entry.definitions.length > 0) {
                            meaning += entry.definitions.map(d => d.definition).join('；') + '；';
                        }
                    }
                    showWordPopup(word, meaning || '暂无释义', element);
                } else {
                    showWordPopup(word, '暂无释义', element);
                }
            } catch (error) {
                console.error(`[lookupWord] 在线查询失败: ${error.message}`);
                showWordPopup(word, '查询失败，请检查代理服务', element);
            }
            return;
        }

        showWordPopup(word, '查询功能不可用', element);
    }

    /**
     * 显示单词释义弹窗
     */
    function showWordPopup(word, meaning, element) {
        // 移除已有弹窗
        const existing = document.querySelector('.pp-word-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.className = 'pp-word-popup';
        popup.innerHTML = `
            <div class="pp-word-popup-header">
                <span class="pp-word-popup-word">${word}</span>
                <button class="pp-word-popup-add" title="加入词单">+ 词单</button>
                <button class="pp-word-popup-close" title="关闭">×</button>
            </div>
            <div class="pp-word-popup-meaning">${meaning}</div>
        `;

        document.body.appendChild(popup);

        // 定位到元素附近
        const rect = element.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();

        let top = rect.bottom + 8 + window.scrollY;
        let left = rect.left + window.scrollX;

        // 防止超出右边界
        if (left + popupRect.width > window.innerWidth) {
            left = window.innerWidth - popupRect.width - 10;
        }

        popup.style.top = top + 'px';
        popup.style.left = left + 'px';

        // 关闭按钮
        popup.querySelector('.pp-word-popup-close').addEventListener('click', () => {
            popup.remove();
            document.querySelectorAll('.pp-word.active').forEach(w => w.classList.remove('active'));
        });

        // 加入词单
        popup.querySelector('.pp-word-popup-add').addEventListener('click', () => {
            addToWordList(word, meaning);
            popup.querySelector('.pp-word-popup-add').textContent = '已添加';
            popup.querySelector('.pp-word-popup-add').disabled = true;
        });

        // 点击外部关闭
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!popup.contains(e.target) && !e.target.classList.contains('pp-word')) {
                    popup.remove();
                    document.querySelectorAll('.pp-word.active').forEach(w => w.classList.remove('active'));
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 10);
    }

    /**
     * 加入词单
     */
    function addToWordList(word, meaning) {
        if (window.WordManager && typeof window.WordManager.addWord === 'function') {
            window.WordManager.addWord({
                word: word,
                meaning: meaning || '',
                source: '真题精读'
            });
            if (window.InteractionManager) {
                window.InteractionManager.showToast(`已添加「${word}」到词单`, 'success');
            }
        } else if (window.DataStore) {
            // fallback 直接操作
            const list = window.DataStore.loadWordList();
            if (!list.newWords.find(w => w.word === word)) {
                list.newWords.push({ word, meaning: meaning || '', date: new Date().toISOString() });
                window.DataStore.saveWordList(list);
            }
            alert(`已添加「${word}」到词单`);
        }
    }

    return {
        render
    };
})();

window.PastPaperReader = PastPaperReader;
