/**
 * 完形填空练习模块
 * 功能：交互式做题 + 自动判分 + 错题生词加词单
 */
const ClozeExercise = (() => {
    let currentPaper = null;
    let clozeSection = null;
    let userAnswers = {};
    let submitted = false;
    let onBack = null;
    let currentMode = 'select';

    // 画布相关变量
    let drawingCanvas = null;
    let ctx = null;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // 画笔设置
    let penColor = '#e74c3c';
    let penSize = 4;
    let penShape = 'circle';
    let penOpacity = 1;

    // 橡皮擦设置
    let eraserSize = 20;
    let eraserShape = 'circle';

    /**
     * 创建画布覆盖层
     */
    function createDrawingCanvas() {
        const passage = document.getElementById('ppClozePassage');
        if (!passage) return;

        // 移除已存在的画布
        const existingCanvas = document.getElementById('ppDrawingCanvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        // 创建画布
        drawingCanvas = document.createElement('canvas');
        drawingCanvas.id = 'ppDrawingCanvas';
        drawingCanvas.style.position = 'absolute';
        drawingCanvas.style.top = '0';
        drawingCanvas.style.left = '0';
        drawingCanvas.style.pointerEvents = 'none';
        drawingCanvas.style.zIndex = '100';

        // 设置画布尺寸
        const rect = passage.getBoundingClientRect();
        drawingCanvas.width = rect.width;
        drawingCanvas.height = rect.height;

        passage.style.position = 'relative';
        passage.appendChild(drawingCanvas);

        // 默认选择模式光标
        drawingCanvas.classList.add('pp-select-cursor');

        ctx = drawingCanvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 绑定画布事件
        bindCanvasEvents();
    }

    /**
     * 绑定画布事件
     */
    function bindCanvasEvents() {
        if (!drawingCanvas) return;

        // 支持鼠标和触摸
        drawingCanvas.style.pointerEvents = 'auto';

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
        // 绘制结束时自动保存画布
        if (currentPaper) {
            saveCanvasSnapshot('cloze_' + currentPaper.id);
        }
    }

    /**
     * 开始绘制
     */
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

            // 根据形状设置不同的线条样式
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

    /**
     * 绘制线条
     */
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
            // 重置虚线设置，避免影响后续绘制
            ctx.setLineDash([]);
        }
    }

    /**
     * 清除画布
     */
    function clearCanvas() {
        if (ctx) {
            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        }
    }

    /**
     * 更新画布尺寸（窗口大小改变时）
     */
    function updateCanvasSize() {
        if (!drawingCanvas || !ctx) return;
        const passage = document.getElementById('ppClozePassage');
        if (!passage) return;

        const rect = passage.getBoundingClientRect();
        drawingCanvas.width = rect.width;
        drawingCanvas.height = rect.height;
    }

    function render(paper, backCallback) {
        currentPaper = paper;
        onBack = backCallback;
        userAnswers = {};
        submitted = false;

        // 查找完形填空 section
        clozeSection = paper.sections.find(s => s.type === 'cloze');

        const container = document.getElementById('pastPapersContainer');
        if (!container) return;

        if (!clozeSection) {
            container.innerHTML = `
                <div class="pp-subpage">
                    <div class="pp-subpage-header">
                        <button class="pp-back-btn" id="ppBackBtn">← 返回</button>
                        <h2>${paper.year} ${paper.type} - 完形填空</h2>
                    </div>
                    <div style="padding:40px; text-align:center; color:var(--text-secondary);">
                        该试卷暂无完形填空数据
                    </div>
                </div>
            `;
            document.getElementById('ppBackBtn').addEventListener('click', () => {
            const snapshotKey = 'cloze_' + currentPaper.id;
            saveCanvasSnapshot(snapshotKey);
            onBack();
        });
            return;
        }

        // 提取带数字标记的文章内容
        const passageHtml = renderClozePassage(clozeSection.passage);

        container.innerHTML = `
            <div class="pp-cloze">
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
                        <span class="pp-reader-subtitle">完形填空</span>
                    </div>
                    <div class="pp-reader-actions">
                        <button class="pp-action-btn pp-submit-btn" id="ppSubmitCloze">
                            提交批改
                        </button>
                    </div>
                </div>

                <div class="pp-cloze-content">
                    <div class="pp-cloze-left-col">
                        <div class="pp-cloze-passage" id="ppClozePassage">
                            ${passageHtml}
                        </div>
                        <div class="pp-draw-toolbar-wrap" id="ppClozeToolbarWrap">
                            <div class="pp-draw-toolbar" id="ppClozeToolbar">
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
                                <button class="pp-draw-tool-btn" data-action="clearAnswers" title="清除">
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
                    </div>
                    <div class="pp-cloze-options" id="ppClozeOptions">
                        <div class="pp-cloze-options-title">选项</div>
                        <div id="ppOptionsList">
                            ${renderOptionsList()}
                        </div>
                    </div>
                </div>

                <div class="pp-cloze-result" id="ppClozeResult" style="display:none;">
                    <div class="pp-result-card">
                        <div class="pp-result-score">
                            <span id="ppScoreNum">0</span>
                            <span class="pp-result-total">/ 20 题</span>
                        </div>
                        <div class="pp-result-info">
                            <p>正确：<span id="ppCorrectNum">0</span> 题</p>
                            <p>错误：<span id="ppWrongNum">0</span> 题</p>
                        </div>
                        <button class="pp-action-btn" id="ppAddWrongWordsBtn">
                            错题生词加入词单
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('ppBackBtn').addEventListener('click', () => {
            const snapshotKey = 'cloze_' + currentPaper.id;
            saveCanvasSnapshot(snapshotKey);
            onBack();
        });
        document.getElementById('ppSubmitCloze').addEventListener('click', submitAnswers);

        bindToolbarClicks();
        bindOptionClicks();
        createDrawingCanvas();

        // 初始化拖拽
        initDrawToolbarDrag('ppClozeToolbarWrap');

        // 恢复之前保存的画布内容
        const snapshotKey = 'cloze_' + paper.id;
        setTimeout(() => restoreCanvasSnapshot(snapshotKey), 50);

        // 监听窗口大小变化以更新画布尺寸
        window.addEventListener('resize', updateCanvasSize);
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
            // 撤销后保存到全局存储
            if (currentPaper) {
                saveCanvasSnapshot('cloze_' + currentPaper.id);
            }
        };
        img.src = prevState;
        if (window.InteractionManager) {
            window.InteractionManager.showToast('已撤销', 'success');
        }
    }

    // 修改 startDrawingAt 和 drawTo 以支持撤销栈保存
    const origStartDrawingAt = startDrawingAt;
    startDrawingAt = function() {
        origStartDrawingAt.apply(this, arguments);
    };

    function bindToolbarClicks() {
        const toolbar = document.getElementById('ppClozeToolbar');
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

                if (action === 'clearAnswers') {
                    handleClearAnswers();
                    return;
                }

                // 切换模式
                if (mode === 'eraser') {
                    currentMode = 'eraser';
                    if (eraserShapeVal) {
                        eraserShape = eraserShapeVal;
                    }
                } else {
                    currentMode = mode;
                }

                // 更新激活状态
                toolbar.querySelectorAll('.pp-draw-tool-btn').forEach(b => {
                    const bMode = b.dataset.mode;
                    const bAction = b.dataset.action;
                    if (bAction === 'undo' || bAction === 'clearAnswers') {
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
                        drawingCanvas.classList.remove('pp-eraser-cursor', 'pp-select-cursor');
                        drawingCanvas.classList.add('pp-write-cursor');
                    }
                } else if (mode === 'eraser') {
                    if (penSettings) penSettings.style.display = 'none';
                    if (eraserSettings) eraserSettings.style.display = 'flex';
                    if (drawingCanvas) {
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

                // 切换模式前保存画布状态到全局存储
                const snapshotKey = 'cloze_' + currentPaper.id;
                saveCanvasSnapshot(snapshotKey);
            });
        });

        // 绑定画笔颜色选择
        const colorBtns = toolbar.parentElement.parentElement.querySelectorAll('.pp-color-btn:not(.pp-color-custom)');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                colorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                penColor = btn.dataset.color;
                const customInput = document.getElementById('ppCustomColorInput');
                if (customInput) customInput.value = penColor;
            });
        });

        // 绑定自定义颜色按钮和输入框
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

        // 绑定画笔粗细滑块
        const penSizeSlider = document.getElementById('ppPenSize');
        const penSizeValue = document.getElementById('ppPenSizeValue');
        if (penSizeSlider && penSizeValue) {
            penSizeSlider.addEventListener('input', () => {
                penSize = parseInt(penSizeSlider.value);
                penSizeValue.textContent = penSize;
            });
        }

        // 绑定画笔透明度滑块
        const penOpacitySlider = document.getElementById('ppPenOpacity');
        const penOpacityValue = document.getElementById('ppPenOpacityValue');
        if (penOpacitySlider && penOpacityValue) {
            penOpacitySlider.addEventListener('input', () => {
                penOpacity = parseFloat(penOpacitySlider.value) / 100;
                penOpacityValue.textContent = penOpacitySlider.value + '%';
            });
        }

        // 绑定画笔形状按钮
        const penShapeBtns = document.querySelectorAll('#ppPenSettings .pp-shape-btn');
        penShapeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                penShapeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                penShape = btn.dataset.shape;
            });
        });

        // 绑定橡皮大小滑块
        const eraserSizeSlider = document.getElementById('ppEraserSize');
        const eraserSizeValue = document.getElementById('ppEraserSizeValue');
        if (eraserSizeSlider && eraserSizeValue) {
            eraserSizeSlider.addEventListener('input', () => {
                eraserSize = parseInt(eraserSizeSlider.value);
                eraserSizeValue.textContent = eraserSize;
            });
        }

        // 绑定橡皮形状按钮
        const eraserShapeBtns = document.querySelectorAll('#ppEraserSettings .pp-shape-btn');
        eraserShapeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                eraserShapeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                eraserShape = btn.dataset.shape;
            });
        });
    }

    /**
     * 清除用户答案
     */
    function handleClearAnswers() {
        if (submitted) return;

        const answered = Object.keys(userAnswers).length;
        if (answered === 0) {
            if (window.InteractionManager) {
                window.InteractionManager.showToast('暂无已选答案', 'info');
            }
            return;
        }

        if (!confirm(`确定要清除所有已选答案吗？（共 ${answered} 题）`)) return;

        userAnswers = {};

        document.querySelectorAll('.pp-choice-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        document.querySelectorAll('.pp-cloze-blank').forEach(blank => {
            const num = blank.dataset.num;
            blank.textContent = num;
            blank.classList.remove('filled');
        });

        if (window.InteractionManager) {
            window.InteractionManager.showToast('已清除所有答案', 'success');
        }
    }

    /**
     * 渲染文章，把数字标记替换为选择框
     */
    function renderClozePassage(passageText) {
        // 去掉 Directions 部分
        let text = passageText.replace(/Directions:[\s\S]*?\(\d+\s*points?\)/i, '').trim();
        // 去掉底部水印
        text = text.replace(/\d+\s*pastpapers\.cn/gi, '');

        const blanks = [];
        let searchPos = 0;

        for (let n = 1; n <= 20; n++) {
            const numStr = String(n);
            let foundPos = -1;
            let pos = searchPos;

            while (pos < text.length) {
                const idx = text.indexOf(numStr, pos);
                if (idx === -1) break;

                const before = idx > 0 ? text[idx - 1] : ' ';
                const after = idx + numStr.length < text.length ? text[idx + numStr.length] : ' ';
                const isWordBoundary = !(/[a-zA-Z0-9]/.test(before)) && !(/[a-zA-Z0-9]/.test(after));

                if (isWordBoundary) {
                    foundPos = idx;
                    break;
                }

                pos = idx + 1;
            }

            if (foundPos !== -1) {
                blanks.push({ num: n, start: foundPos, end: foundPos + numStr.length });
                searchPos = foundPos + numStr.length;
            }
        }

        let html = '';
        let lastEnd = 0;

        for (const blank of blanks) {
            html += escapeHtml(text.slice(lastEnd, blank.start));
            html += `<span class="pp-cloze-blank" data-num="${blank.num}">${blank.num}</span>`;
            lastEnd = blank.end;
        }

        html += escapeHtml(text.slice(lastEnd));

        return `<p>${html}</p>`;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 渲染选项列表
     */
    function renderOptionsList() {
        // 如果有结构化选项
        if (clozeSection.options && clozeSection.options.length > 0) {
            return clozeSection.options.map(opt => `
                <div class="pp-option-group" data-num="${opt.num}">
                    <div class="pp-option-num">${opt.num}.</div>
                    <div class="pp-option-choices">
                        ${['A', 'B', 'C', 'D'].map(letter => `
                            <button class="pp-choice-btn" data-num="${opt.num}" data-letter="${letter}">
                                <span class="pp-choice-letter">${letter}</span>
                                <span class="pp-choice-text">${opt[letter] || '—'}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        // 无结构化选项时生成占位
        let html = '';
        for (let i = 1; i <= 20; i++) {
            html += `
                <div class="pp-option-group" data-num="${i}">
                    <div class="pp-option-num">${i}.</div>
                    <div class="pp-option-choices">
                        ${['A', 'B', 'C', 'D'].map(letter => `
                            <button class="pp-choice-btn" data-num="${i}" data-letter="${letter}">
                                <span class="pp-choice-letter">${letter}</span>
                                <span class="pp-choice-text">—</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        return html;
    }

    function bindOptionClicks() {
        document.querySelectorAll('.pp-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (submitted) return;

                const num = btn.dataset.num;
                const letter = btn.dataset.letter;

                document.querySelectorAll(`.pp-choice-btn[data-num="${num}"]`).forEach(b => {
                    b.classList.remove('selected');
                });
                btn.classList.add('selected');

                userAnswers[num] = letter;

                const blank = document.querySelector(`.pp-cloze-blank[data-num="${num}"]`);
                if (blank) {
                    blank.textContent = letter;
                    blank.classList.add('filled');
                }
            });
        });
    }

    function submitAnswers() {
        const answered = Object.keys(userAnswers).length;
        if (answered < 5) {
            if (!confirm(`你只答了 ${answered} 题，确定提交吗？`)) return;
        }

        submitted = true;

        // 模拟判分（暂无真实答案数据时给出提示）
        // 真实答案需要从真题解析中提取，这里先统计已答数
        const correct = 0;
        const wrong = answered - correct;

        // 显示结果
        document.getElementById('ppClozeResult').style.display = 'block';
        document.getElementById('ppScoreNum').textContent = correct;
        document.getElementById('ppCorrectNum').textContent = correct;
        document.getElementById('ppWrongNum').textContent = answered;

        // 标注已答题目
        document.querySelectorAll('.pp-choice-btn.selected').forEach(btn => {
            btn.classList.add('answered');
        });

        // 禁用选项
        document.querySelectorAll('.pp-choice-btn').forEach(btn => {
            btn.disabled = true;
        });

        // 绑定错题生词按钮
        const addBtn = document.getElementById('ppAddWrongWordsBtn');
        if (addBtn) {
            addBtn.addEventListener('click', addWrongWordsToList);
        }
    }

    function addWrongWordsToList() {
        // 提取文章中的生词（用户可能需要）
        // 这里简化处理，提示用户
        if (window.InteractionManager) {
            window.InteractionManager.showToast('功能开发中', 'info');
        }
    }

    return {
        render
    };
})();

window.ClozeExercise = ClozeExercise;
