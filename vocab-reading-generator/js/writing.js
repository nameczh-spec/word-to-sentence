/**
 * 作文模块
 * 功能：查看作文题目 + 参考范文 + 写作技巧 + AI批改
 */
const Writing = (() => {
    let currentPaper = null;
    let currentPartA = null;
    let currentPartB = null;
    let userAnswerA = '';
    let userAnswerB = '';
    let onBack = null;

    // 范文数据库（按年份和类型存储）
    const sampleData = {
        '2025-1': {
            partA: {
                title: '回复同学关于校园手工艺展示的邮件',
                translation: '假设你是大学生李明，你的同学Paul发来邮件询问校园手工艺展示活动的相关事宜。请给他回一封约100词的邮件，内容包括：活动的时间地点、青年工匠将展示的传统手工艺项目，以及需要帮忙的具体事项。',
                samples: [
                    {
                        text: `Dear Paul,

I was delighted to hear that you're organizing a craft demonstration event on campus! Here's what I can share about the arrangements so far.

The event will feature young craftsmen showcasing traditional Chinese crafts such as paper cutting, calligraphy, and pottery making. They will also bring some of their handmade works for display and explain the cultural significance behind each craft.

Regarding preparation, I wonder if you could help with setting up tables and chairs in the exhibition hall? It would be great if you could arrive at 9 a.m. this Saturday. Additionally, if you know anyone with photography skills, we'd appreciate some help documenting the event for our school website.

Looking forward to your reply!

Yours,
Li Ming`,
                        note: '范文一：标准书信格式，内容完整，建议事项明确'
                    },
                    {
                        text: `Dear Paul,

Thank you for your interest in our campus craft demonstration! I'm excited to share the details with you.

The event, titled "Young Craftsmen on Campus," will take place in the Main Hall this Saturday from 10 a.m. to 4 p.m. Our guests will demonstrate innovative craft-making techniques, including paper cutting, knotting, and ceramic art. Visitors will have the opportunity to try their hand at these crafts under expert guidance.

Your assistance with venue preparation would be most valuable. Could you kindly help arrange seating for approximately 100 guests and set up a small photography station near the main display area?

Please let me know if you need any further information.

Best regards,
Li Ming`,
                        note: '范文二：细节丰富，语言地道，要点全面'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '开头：表达感谢/兴趣',
                        '说明活动详情（时间、地点、内容）',
                        '回应对方意愿，提供具体帮助事项',
                        '结尾：期待回复'
                    ],
                    commonPhrases: [
                        'I was delighted/excited to hear that...',
                        'Thank you for your interest in...',
                        'Regarding... / As for...',
                        'I wonder if you could help with...',
                        'Looking forward to your reply.'
                    ],
                    notes: '注意书信的正式格式，区分Dear和Yours的用法，保持语气友好且专业'
                }
            },
            partB: {
                title: '图表作文：全国居民耐用消费品拥有量变化',
                translation: '根据下表，简要描述2014年至2023年全国居民每百户耐用消费品拥有量的变化，并说明其意义，最后给出你的评论。',
                type: 'table',
                samples: [
                    {
                        text: `The table illustrates the changes in the ownership of major durable consumer goods per 100 urban households in China from 2014 to 2023.

Overall, air conditioners showed the most remarkable increase, rising from 75.2 units in 2014 to 145.9 units in 2023, nearly doubling. Washing machines and refrigerators also increased steadily, reaching 98.2 and 103.4 units respectively by 2023.

Several factors contribute to this trend. First, the sustained economic growth has significantly improved people's living standards, making household appliances more affordable. Second, technological advancements have reduced production costs, enabling manufacturers to offer products at more competitive prices. Additionally, the booming e-commerce industry has made shopping for these items more convenient than ever before.

Looking ahead, with continuing urbanization and the increasing demand for smart home technologies, the ownership of durable consumer goods is expected to maintain its upward trajectory. This trend reflects the successful outcome of China's economic development policies and indicates a promising future for household consumption.`,
                        note: '范文：结构清晰，分析到位，数据引用恰当'
                    }
                ],
                tips: {
                    type: 'table',
                    structure: [
                        '第一段：描述表格主题和总体趋势',
                        '第二段：具体描述数据变化（选取关键数据点）',
                        '第三段：分析原因（2-3个方面）',
                        '第四段：总结预测'
                    ],
                    keyExpressions: [
                        'The table illustrates/shows/depicts...',
                        '...showed/experienced a significant increase/decrease',
                        'Several factors contribute to this trend.',
                        'First/Second/Finally...',
                        'Looking ahead/In the future...'
                    ],
                    notes: '图表作文要紧扣数据，选取有代表性的数据点进行描述，避免罗列所有数字'
                }
            }
        },
        '2024-1': {
            partA: {
                title: '回复国际学生关于中国古代科学家口头报告的建议',
                translation: '假设你是李明，你的国际同学Paul需要完成一份关于中国古代科学家的口头报告任务，向你寻求建议。请给他回一封约100词的邮件，内容包括：推荐适合介绍的中国古代科学家、准备报告的方法、以及可靠的资料来源。',
                samples: [
                    {
                        text: `Dear Paul,

Thank you for reaching out about your oral report on an ancient Chinese scientist. I'd be happy to share some suggestions.

First, I recommend choosing a well-known figure such as Cai Lun (inventor of paper), Shen Kuo (polymath), or Li Shizhen (author of Compendium of Materia Medica). Their stories are fascinating and well-documented.

To prepare effectively, you might: 1) Research the scientist's major contributions and historical context; 2) Find one or two interesting anecdotes to make your presentation engaging; 3) Prepare visual aids if possible.

For sources, I'd suggest checking our university library's database and reliable websites like Britannica or specialized history platforms.

Feel free to let me know if you need any further assistance!

Best regards,
Li Ming`,
                        note: '范文：建议具体实用，格式规范，表达地道'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '开头：表达愿意帮助',
                        '提供具体建议（人物选择、准备方法、资料来源）',
                        '结尾：表示愿意进一步帮助'
                    ],
                    notes: '这是一封帮助性邮件，语气要热情友好，内容要实用具体'
                }
            },
            partB: {
                title: '图画+图表作文',
                translation: '根据下面的图画和图表，写一篇160-200词的短文。描述图画和图表内容，揭示其深层含义，并给出你的评论。',
                type: 'picture+chart',
                samples: [],
                tips: {
                    type: 'picture+chart',
                    structure: [
                        '第一段：描述图画和图表内容',
                        '第二段：揭示深层含义',
                        '第三段：给出评论'
                    ],
                    notes: '需要同时处理图画描述和图表分析，两个元素要有逻辑联系'
                }
            }
        }
    };

    // 获取默认范文（当没有特定数据时使用）
    function getDefaultSamples(part, year, type) {
        const key = year + '-' + (type === '英语一' ? '1' : '2');
        const data = sampleData[key];

        if (data) {
            return data[part]?.samples || [];
        }
        return [];
    }

    // 获取默认技巧
    function getDefaultTips(part, year, type) {
        const key = year + '-' + (type === '英语一' ? '1' : '2');
        const data = sampleData[key];

        if (data) {
            return data[part]?.tips || getGenericTips(part);
        }
        return getGenericTips(part);
    }

    function getGenericTips(part) {
        if (part === 'partA') {
            return {
                type: 'email',
                structure: ['开头寒暄', '正文说明', '结尾期待'],
                commonPhrases: ['I am delighted to...', 'Regarding your inquiry...', 'I hope this helps.'],
                notes: '应用文写作注意格式规范，要点齐全'
            };
        } else {
            return {
                type: 'essay',
                structure: ['描述现象/数据', '分析原因', '表达观点'],
                keyExpressions: ['It can be seen from... that...', 'Several factors lead to...', 'In my opinion...'],
                notes: '议论文写作注意逻辑清晰，论据充分'
            };
        }
    }

    function render(paper, backCallback) {
        currentPaper = paper;
        onBack = backCallback;

        const container = document.getElementById('pastPapersContainer');
        if (!container) return;

        const writingSections = paper.sections.filter(s => s.type === 'writing');
        if (writingSections.length === 0) {
            container.innerHTML = `
                <div class="pp-writing">
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
                            <span class="pp-reader-subtitle">作文</span>
                        </div>
                        <div class="pp-reader-actions"></div>
                    </div>
                    <div style="padding:40px; text-align:center; color:var(--text-secondary);">
                        暂无作文题目
                    </div>
                </div>
            `;
            document.getElementById('ppBackBtn').addEventListener('click', onBack);
            return;
        }

        const section = writingSections[0];
        const parsed = parseWritingContent(section.content, paper.year);

        currentPartA = parsed.partA;
        currentPartB = parsed.partB;

        const hasPartA = currentPartA.raw && currentPartA.raw.trim().length > 20;
        const hasPartB = currentPartB.raw && currentPartB.raw.trim().length > 20;

        const savedAnswerA = localStorage.getItem(`writing_${paper.id}_partA`);
        const savedAnswerB = localStorage.getItem(`writing_${paper.id}_partB`);
        userAnswerA = savedAnswerA || '';
        userAnswerB = savedAnswerB || '';

        let partAHtml = '';
        if (hasPartA) {
            partAHtml = `
                    <div class="pp-writing-section">
                        <h3 class="pp-writing-title">Part A - 应用文（10分）</h3>
                        <div class="pp-writing-question">${currentPartA.display}</div>

                        <div class="pp-ls-accordion" style="margin-top:16px;">
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="sample-a">
                                    <span>参考范文</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingSampleA" style="display:none;">
                                    ${generatePartASamplesHtml()}
                                </div>
                            </div>
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="tips-a">
                                    <span>写作技巧</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingTipsA" style="display:none;">
                                    ${generatePartATipsHtml()}
                                </div>
                            </div>
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="answer-a">
                                    <span>答题区域</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingAnswerA" style="display:none;">
                                    <div class="pp-writing-answer-area">
                                        <textarea id="ppAnswerA" class="pp-writing-textarea pp-writing-textarea-a" placeholder="请在这里输入你的作文..." rows="10">${userAnswerA}</textarea>
                                        <div class="pp-writing-stats">
                                            <span id="ppAnswerACount">${userAnswerA.length}</span> 字符
                                            <span class="pp-writing-target">（约100词）</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
`;
        }

        container.innerHTML = `
            <div class="pp-writing">
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
                        <span class="pp-reader-subtitle">作文指导</span>
                    </div>
                    <div class="pp-reader-actions"></div>
                </div>

                <div class="pp-writing-content">
                    ${partAHtml}
                    <div class="pp-writing-section">
                        <h3 class="pp-writing-title">Part B - 短文写作（20分）</h3>
                        <div class="pp-writing-question" id="ppWritingQuestionB">${currentPartB.display}</div>

                        <div class="pp-ls-accordion" style="margin-top:16px;">
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="sample-b">
                                    <span>参考范文</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingSampleB" style="display:none;">
                                    ${generatePartBSamplesHtml()}
                                </div>
                            </div>
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="tips-b">
                                    <span>写作技巧</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingTipsB" style="display:none;">
                                    ${generatePartBTipsHtml()}
                                </div>
                            </div>
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="answer-b">
                                    <span>答题区域</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingAnswerB" style="display:none;">
                                    <div class="pp-writing-answer-area">
                                        <textarea id="ppAnswerB" class="pp-writing-textarea pp-writing-textarea-b" placeholder="请在这里输入你的作文..." rows="20">${userAnswerB}</textarea>
                                        <div class="pp-writing-stats">
                                            <span id="ppAnswerBCount">${userAnswerB.length}</span> 字符
                                            <span class="pp-writing-target">（160-200词）</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="ai-check">
                                    <span>AI智能批改</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingAiCheck" style="display:none;">
                                    ${generateAICheckHtml()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('ppBackBtn').addEventListener('click', onBack);

        // 绑定手风琴点击
        document.querySelectorAll('.pp-ls-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const detailId = 'ppWriting' + target.charAt(0).toUpperCase() + target.slice(1).replace(/-([a-z])/g, (m, c) => c.toUpperCase());
                const detail = document.getElementById(detailId);
                if (!detail) return;

                const isVisible = detail.style.display !== 'none';

                const accordion = btn.closest('.pp-ls-accordion');
                if (accordion) {
                    accordion.querySelectorAll('.pp-ls-detail').forEach(d => d.style.display = 'none');
                    accordion.querySelectorAll('.pp-ls-toggle').forEach(b => b.classList.remove('open'));
                }

                if (!isVisible) {
                    detail.style.display = 'block';
                    btn.classList.add('open');
                }
            });
        });

        // 尝试加载Part A和Part B题目图片
        if (hasPartA) {
            loadWritingImage(paper.id, paper.year, paper.type, 'partA');
        }
        if (hasPartB) {
            loadWritingImage(paper.id, paper.year, paper.type, 'partB');
        }

        // 绑定答题区域事件
        bindAnswerEvents();
    }

    // 加载作文题目图片
    function loadWritingImage(paperId, year, type, part) {
        const typeNum = type === '英语一' ? '1' : '2';
        const partLower = part.toLowerCase();
        const extensions = ['png', 'jpg', 'jpeg', 'webp'];
        
        const partLetter = partLower === 'parta' ? 'A' : 'B';
        const questionEl = document.getElementById(`ppWritingQuestion${partLetter}`);
        if (!questionEl) return;

        let loaded = false;
        
        const pathFormats = [
            `images/writing/${paperId}-${partLower}`,
            `images/writing/${year}-${typeNum}-${partLower}`,
            `images/writing/${year}-${typeNum}-1-${partLower}`,
            `images/writing/${year}-${typeNum}-2-${partLower}`
        ];
        
        const allPaths = [];
        pathFormats.forEach(fmt => {
            extensions.forEach(ext => {
                allPaths.push(`${fmt}.${ext}`);
            });
        });
        
        let pathIndex = 0;
        
        function tryNextPath() {
            if (loaded || pathIndex >= allPaths.length) return;
            
            const imgPath = allPaths[pathIndex];
            pathIndex++;
            
            const img = new Image();
            img.onload = () => {
                if (loaded) return;
                loaded = true;
                
                const imgContainer = document.createElement('div');
                imgContainer.className = 'pp-writing-image-container';
                imgContainer.innerHTML = `
                    <img src="${imgPath}" alt="${year} ${type} Part ${partLetter}" class="pp-writing-question-image">
                `;
                
                const originalContent = questionEl.innerHTML;
                questionEl.innerHTML = '';
                questionEl.appendChild(imgContainer);
                
                const descDiv = document.createElement('div');
                descDiv.className = 'pp-writing-question-desc';
                descDiv.innerHTML = originalContent;
                questionEl.appendChild(descDiv);
            };
            img.onerror = tryNextPath;
            img.src = imgPath;
        }
        
        tryNextPath();
    }

    // 解析作文内容
    function parseWritingContent(content, year) {
        const result = {
            partA: { raw: '', display: '', type: 'email', hasEmail: false, email: null, hasPicture: false, hasTable: false, directions: '' },
            partB: { raw: '', display: '', type: 'essay', hasPicture: false, hasTable: false, hasPictureChart: false, directions: '' }
        };

        if (!content) {
            result.partA.display = '<div class="pp-writing-empty">暂无内容</div>';
            result.partB.display = '<div class="pp-writing-empty">暂无内容</div>';
            return result;
        }

        content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const hasPartA = /Part\s*A/i.test(content);
        const hasPartB = /Part\s*B/i.test(content);

        let partAContent = '';
        if (hasPartA) {
            if (hasPartB) {
                const match = content.match(/Part\s*A[\s\S]*?(?=Part\s*B)/i);
                partAContent = match ? match[0] : content;
            } else {
                const match = content.match(/Part\s*A[\s\S]*$/i);
                partAContent = match ? match[0] : content;
            }
        }

        let partBContent = '';
        if (hasPartB) {
            const match = content.match(/Part\s*B[\s\S]*$/i);
            partBContent = match ? match[0] : '';
        }

        if (partAContent) {
            result.partA.raw = partAContent;
            
            const dirMatch = partAContent.match(/(?:Part\s*A\s*\d+\.\s*)?Directions:?\s*([\s\S]*?)(?=\n\s*\d+\.|\n\s*[A-Z][a-z]+\s+|$)/i);
            let directionsText = '';
            let bodyContent = partAContent;
            
            if (dirMatch && dirMatch[1].trim()) {
                directionsText = dirMatch[1].trim();
                result.partA.directions = directionsText;
                bodyContent = partAContent.replace(/(?:Part\s*A\s*\d+\.\s*)?Directions:?\s*[\s\S]*?(?=\n\s*\d+\.|\n\s*[A-Z][a-z]+\s+|$)/i, '').trim();
            }
            
            bodyContent = bodyContent
                .replace(/Part\s*A\s*\d+\.\s*/gi, '')
                .replace(/^\d+\.\s*/, '')
                .trim();

            const emailMatch = bodyContent.match(/(Dear\s+[\w\s]+,[\s\S]*?(?:Yours[,]?\s*\n|Sincerely[,]?\s*\n|Best\s+regards[,]?\s*\n|Li\s*Ming\s*$))/i);
            
            let html = '';
            
            if (directionsText) {
                html += `<div class="pp-writing-directions"><span class="pp-writing-directions-label">Directions:</span><div class="pp-writing-directions-text">${formatQuestionText(directionsText)}</div></div>`;
            }
            
            if (emailMatch) {
                result.partA.hasEmail = true;
                result.partA.email = emailMatch[1].trim();
                const remainingContent = bodyContent.replace(/Dear\s+[\w\s]+,[\s\S]*?(?:Yours[,]?\s*\n|Sincerely[,]?\s*\n|Best\s+regards[,]?\s*\n|Li\s*Ming\s*$)/i, '').trim();
                if (remainingContent) {
                    html += `<div class="pp-writing-email-question">${formatQuestionText(remainingContent)}</div>`;
                }
                html += `<div class="pp-writing-email-sample"><div class="pp-writing-email-title">原文邮件：</div><div class="pp-writing-email-body">${formatQuestionText(emailMatch[1].trim())}</div></div>`;
            } else {
                html += `<div class="pp-writing-question">${formatQuestionText(bodyContent)}</div>`;
            }
            
            result.partA.display = html;
        }

        if (partBContent) {
            result.partB.raw = partBContent;
            
            const dirMatch = partBContent.match(/(?:Part\s*B\s*\d+\.\s*)?Directions:?\s*([\s\S]*?)(?=\n\s*\d+\.|\n\s*(?:The\s+|According|Below|下图|如下|表格|图表|根据)|$)/i);
            let directionsText = '';
            let bodyContent = partBContent;
            
            if (dirMatch && dirMatch[1].trim()) {
                directionsText = dirMatch[1].trim();
                result.partB.directions = directionsText;
                bodyContent = partBContent.replace(/(?:Part\s*B\s*\d+\.\s*)?Directions:?\s*[\s\S]*?(?=\n\s*\d+\.|\n\s*(?:The\s+|According|Below|下图|如下|表格|图表|根据)|$)/i, '').trim();
            }
            
            bodyContent = bodyContent
                .replace(/Part\s*B\s*\d+\.\s*/gi, '')
                .replace(/^\d+\.\s*/, '')
                .trim();

            const hasTableData = /\d{4}[\s\d.]+\s+\d+/.test(bodyContent) && 
                                  (/\b(?:空调|洗衣机|电冰箱|电视|电脑|手机)\b/i.test(bodyContent) || 
                                   /\b(?:air\s*conditioner|washing\s*machine|refrigerator|television|computer)\b/i.test(bodyContent));
            
            const hasPictureKeyword = /\b(?:picture|photo|image|下图|图画|图片)\b/i.test(bodyContent);
            const hasChartKeyword = /\b(?:chart|graph|table|图表|表格)\b/i.test(bodyContent);

            const tablePattern = /(\d{4}\s+[\d.]+\s*)+/;
            const hasNumericTable = tablePattern.test(bodyContent);

            let html = '';
            
            if (directionsText) {
                html += `<div class="pp-writing-directions"><span class="pp-writing-directions-label">Directions:</span><div class="pp-writing-directions-text">${formatQuestionText(directionsText)}</div></div>`;
            }

            if (hasTableData || hasNumericTable) {
                result.partB.hasTable = true;
                result.partB.type = 'table';
                html += formatTableContent(bodyContent);
            } else if (hasPictureKeyword && hasChartKeyword) {
                result.partB.hasPictureChart = true;
                result.partB.type = 'picture+chart';
                html += formatPictureChartContent(bodyContent);
            } else if (hasPictureKeyword) {
                result.partB.hasPicture = true;
                result.partB.type = 'picture';
                html += formatPictureContent(bodyContent);
            } else {
                html += `<div class="pp-writing-essay-question">${formatQuestionText(bodyContent)}</div>`;
            }
            
            result.partB.display = html;
        }

        return result;
    }

    // 格式化问题文本 - 改进段落和换行处理
    function formatQuestionText(text) {
        if (!text) return '';
        
        text = text.trim();
        
        if (/\d{4}[\s\d.]+\s+\d+/.test(text) && /\b(?:空调|洗衣机|电冰箱|电视|电脑)\b/.test(text)) {
            return text;
        }
        
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        text = text.replace(/\n{3,}/g, '\n\n');
        
        const lines = text.split('\n');
        const paragraphs = [];
        let currentParagraph = '';
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            if (!line) {
                if (currentParagraph.trim()) {
                    paragraphs.push(currentParagraph.trim());
                    currentParagraph = '';
                }
                continue;
            }
            
            const isNumbered = /^\d+\.\s+/.test(line) || /^\d+\)\s+/.test(line);
            const isLettered = /^[A-Z]\.\s+/.test(line);
            const isBullet = /^[•\-\*]\s+/.test(line);
            const isListItem = isNumbered || isLettered || isBullet;
            
            const startsWithCapital = /^[A-Z]/.test(line) && !isListItem;
            const endsWithPeriod = /[.!?。！？]$/.test(line);
            
            if (isListItem) {
                if (currentParagraph.trim()) {
                    paragraphs.push(currentParagraph.trim());
                }
                currentParagraph = line;
            } else if (!currentParagraph) {
                currentParagraph = line;
            } else if (startsWithCapital && endsWithPeriod) {
                paragraphs.push(currentParagraph.trim());
                currentParagraph = line;
            } else if (startsWithCapital && !endsWithPeriod) {
                if (currentParagraph.length > 60) {
                    paragraphs.push(currentParagraph.trim());
                    currentParagraph = line;
                } else {
                    currentParagraph += ' ' + line;
                }
            } else {
                currentParagraph += ' ' + line;
            }
        }
        
        if (currentParagraph.trim()) {
            paragraphs.push(currentParagraph.trim());
        }
        
        if (paragraphs.length === 0) {
            return `<p>${text}</p>`;
        }
        
        return paragraphs.map((p, idx) => {
            p = p.replace(/\s+/g, ' ').trim();
            if (!p) return '';
            p = p.replace(/\\n/g, '<br>');
            return `<p class="pp-question-paragraph">${p}</p>`;
        }).join('');
    }

    // 格式化表格内容 - 正确解析并生成HTML表格
    function formatTableContent(text) {
        if (!text) return '';
        
        let html = '<div class="pp-writing-chart-question">';
        
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        const hasYearData = /\d{4}[\s\d.]+\s+\d{2,}/.test(text);
        
        if (hasYearData) {
            const lines = text.split('\n').filter(l => l.trim());
            
            let tableStartIdx = -1;
            let headers = [];
            let dataRows = [];
            
            const headerKeywords = ['年份', '空调', '洗衣机', '电冰箱', '电视', '电脑', '手机', '汽车', '城镇居民', '农村居民'];
            const headerKeywordsEn = ['year', 'air conditioner', 'washing machine', 'refrigerator', 'television', 'computer', 'mobile phone', 'car', 'urban', 'rural'];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                const hasHeader = headerKeywords.some(k => line.includes(k)) || 
                                  headerKeywordsEn.some(k => line.toLowerCase().includes(k));
                
                if (hasHeader && tableStartIdx === -1) {
                    tableStartIdx = i;
                    
                    const parts = line.split(/\s{2,}|\t/).filter(p => p.trim());
                    if (parts.length <= 1) {
                        const allParts = line.split(/\s+/).filter(p => p.trim());
                        headers = allParts.filter(p => {
                            return !/^\d{4}$/.test(p) && !/^[\d.]+$/.test(p);
                        });
                    } else {
                        headers = parts.filter(p => {
                            return !/^\d{4}$/.test(p) && !/^[\d.]+$/.test(p);
                        });
                    }
                }
                
                const yearMatch = line.match(/^(\d{4})\s+([\d.\s]+)/);
                if (yearMatch) {
                    const year = yearMatch[1];
                    const values = yearMatch[2].trim().split(/\s+/).filter(v => v);
                    dataRows.push({ year, values });
                }
            }
            
            if (dataRows.length > 0) {
                const colCount = dataRows[0]?.values.length || 3;
                
                if (headers.length === 0) {
                    const defaultHeaders = ['空调', '洗衣机', '电冰箱', '彩色电视机', '家用电脑'];
                    headers = defaultHeaders.slice(0, colCount);
                } else {
                    headers = headers.map(h => h.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '').trim()).filter(h => h);
                    while (headers.length < colCount) {
                        headers.push('项目' + (headers.length + 1));
                    }
                    headers = headers.slice(0, colCount);
                }
                
                html += '<div class="pp-writing-table-wrapper">';
                html += '<table class="pp-writing-table">';
                
                html += '<thead><tr><th>年份</th>';
                headers.forEach(h => {
                    html += `<th>${h}</th>`;
                });
                html += '</tr></thead>';
                
                html += '<tbody>';
                dataRows.forEach(row => {
                    html += `<tr><td>${row.year}</td>`;
                    row.values.slice(0, colCount).forEach(val => {
                        html += `<td>${val}</td>`;
                    });
                    for (let i = row.values.length; i < colCount; i++) {
                        html += '<td>—</td>';
                    }
                    html += '</tr>';
                });
                html += '</tbody></table></div>';
            }
            
            const descPatterns = [
                /近年来[^。\n]*[。.]?/,
                /全国居民[^。\n]*[。.]?/,
                /根据下表[^。\n]*[。.]?/,
                /the\s+table\s+shows[^。\n]*[.]?/i,
                /the\s+chart\s+illustrates[^。\n]*[.]?/i
            ];
            
            let descText = '';
            for (const pattern of descPatterns) {
                const match = text.match(pattern);
                if (match && match[0].length > 2) {
                    descText = match[0].trim();
                    break;
                }
            }
            
            if (!descText) {
                const nonTableLines = lines.filter(l => !/^\d{4}\s+[\d.]/.test(l.trim()) && !headerKeywords.some(k => l.includes(k)));
                if (nonTableLines.length > 0) {
                    descText = nonTableLines.slice(0, 2).join(' ').trim();
                }
            }
            
            if (descText) {
                html += `<div class="pp-writing-desc">${formatQuestionText(descText)}</div>`;
            }
            
            const requirementPatterns = [
                /请根据[^。]*[。！？]/,
                /write\s+an\s+essay[^.]*\./i,
                /描述[^。]*说明[^。]*评论[^。]*[。]/
            ];
            
            let requirement = '';
            for (const pattern of requirementPatterns) {
                const match = text.match(pattern);
                if (match) {
                    requirement = match[0];
                    break;
                }
            }
            
            if (!requirement) {
                const lastLines = lines.slice(-3);
                const lastText = lastLines.join(' ').trim();
                if (lastText.length > 20 && !/^\d{4}\s+[\d.]/.test(lastText)) {
                    requirement = lastText;
                }
            }
            
            if (requirement) {
                html += `<div class="pp-writing-requirement">${formatQuestionText(requirement)}</div>`;
            }
        } else {
            html += formatQuestionText(text);
        }
        
        html += '</div>';
        return html;
    }
    
    // 格式化图画内容
    function formatPictureContent(text) {
        if (!text) return '';
        
        let html = '<div class="pp-writing-picture-question">';
        
        // 统一换行符
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // 清理文本
        text = text.replace(/Part\s*B\s*\d+\.\s*Directions:?\s*/gi, '').trim();
        
        // 提取图画描述（查找"如下图"之类的内容）
        const picturePatterns = [
            /根据下图[^。]*。/,
            /如下图[^。]*。/,
            /the\s+picture\s+shows[^。]*\./i,
            /as\s+shown\s+in\s+the\s+picture[^。]*\./i
        ];
        
        let hasPicture = false;
        for (const pattern of picturePatterns) {
            if (pattern.test(text)) {
                hasPicture = true;
                break;
            }
        }
        
        if (hasPicture) {
            // 添加图片占位符
            html += '<div class="pp-writing-picture-placeholder">';
            html += '<div class="pp-writing-picture-icon">🖼️</div>';
            html += '<div class="pp-writing-picture-text">请查看原版试题图片</div>';
            html += '</div>';
            
            // 添加描述文字
            html += '<div class="pp-writing-text-content">';
            html += formatQuestionText(text);
            html += '</div>';
        } else {
            html += formatQuestionText(text);
        }
        
        html += '</div>';
        return html;
    }
    
    // 格式化图画+图表内容
    function formatPictureChartContent(text) {
        if (!text) return '';
        
        let html = '<div class="pp-writing-picturechart-question">';
        
        // 统一换行符
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // 清理文本
        text = text.replace(/Part\s*B\s*\d+\.\s*Directions:?\s*/gi, '').trim();
        
        // 添加图片占位符
        html += '<div class="pp-writing-picture-placeholder">';
        html += '<div class="pp-writing-picture-icon">🖼️</div>';
        html += '<div class="pp-writing-picture-text">请查看原版试题图片和图表</div>';
        html += '</div>';
        
        // 添加描述文字
        html += '<div class="pp-writing-text-content">';
        html += formatQuestionText(text);
        html += '</div>';
        
        html += '</div>';
        return html;
    }

    // 绑定答题区域事件
    function bindAnswerEvents() {
        const answerA = document.getElementById('ppAnswerA');
        const answerB = document.getElementById('ppAnswerB');
        const countA = document.getElementById('ppAnswerACount');
        const countB = document.getElementById('ppAnswerBCount');

        if (answerA && countA) {
            answerA.addEventListener('input', () => {
                const text = answerA.value;
                countA.textContent = text.length;
                localStorage.setItem(`writing_${currentPaper.id}_partA`, text);
                userAnswerA = text;
            });
        }

        if (answerB && countB) {
            answerB.addEventListener('input', () => {
                const text = answerB.value;
                countB.textContent = text.length;
                localStorage.setItem(`writing_${currentPaper.id}_partB`, text);
                userAnswerB = text;
            });
        }

        // AI批改按钮
        const aiCheckBtn = document.getElementById('ppAiCheckBtn');
        if (aiCheckBtn) {
            aiCheckBtn.addEventListener('click', handleAICheck);
        }

        // AI批改标签页切换
        document.querySelectorAll('.pp-ai-tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.pp-ai-tab-btn').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    // 处理AI批改
    function handleAICheck() {
        const resultDiv = document.getElementById('ppAiResult');
        if (!resultDiv) return;

        const activeTab = document.querySelector('.pp-ai-tab-btn.active');
        const part = activeTab?.dataset.part || 'partB';
        const answer = part === 'partA' ? userAnswerA : userAnswerB;

        if (!answer || answer.trim().length < 50) {
            resultDiv.innerHTML = `
                <div class="pp-ai-warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>请先完成作文内容后再提交批改（至少50个字符）</span>
                </div>
            `;
            return;
        }

        resultDiv.innerHTML = `
            <div class="pp-ai-loading">
                <div class="pp-ai-spinner"></div>
                <p>正在提交批改请求...</p>
            </div>
        `;

        // 禁用提交按钮
        const submitBtn = document.getElementById('ppAiCheckBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
        }

        // 构建prompt
        const question = part === 'partA' ? currentPartA.raw : currentPartB.raw;
        const prompt = buildAIPrompt(question, answer, part);

        // 检查是否有API密钥
        const apiKey = localStorage.getItem('apiKey');
        if (!apiKey) {
            resultDiv.innerHTML = `
                <div class="pp-ai-warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <div class="pp-ai-warning-text">
                        <strong>AI批改功能需要API密钥才能使用</strong>
                        <span>请在设置中配置API密钥后再试</span>
                    </div>
                </div>
            `;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
            return;
        }

        // 模拟API调用（实际使用时需要替换为真实API调用）
        setTimeout(() => {
            resultDiv.innerHTML = `
                <div class="pp-ai-result-content">
                    <div class="pp-ai-score-section">
                        <div class="pp-ai-score-main">
                            <span class="pp-ai-score-label">预估得分</span>
                            <span class="pp-ai-score-value">待API接入后显示</span>
                        </div>
                        <div class="pp-ai-score-detail">
                            <div class="pp-ai-score-item">
                                <span class="pp-ai-score-item-label">内容切题</span>
                                <span class="pp-ai-score-item-value">-</span>
                            </div>
                            <div class="pp-ai-score-item">
                                <span class="pp-ai-score-item-label">结构完整</span>
                                <span class="pp-ai-score-item-value">-</span>
                            </div>
                            <div class="pp-ai-score-item">
                                <span class="pp-ai-score-item-label">语言表达</span>
                                <span class="pp-ai-score-item-value">-</span>
                            </div>
                        </div>
                    </div>
                    <div class="pp-ai-divider"></div>
                    <div class="pp-ai-feedback-section">
                        <h4 class="pp-ai-feedback-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            批改说明
                        </h4>
                        <p class="pp-ai-feedback-desc">请配置API密钥后，AI将根据以下提示词进行批改：</p>
                        <pre class="pp-ai-prompt">${prompt.substring(0, 500)}...</pre>
                    </div>
                </div>
            `;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        }, 1500);
    }

    // 构建AI批改prompt
    function buildAIPrompt(question, answer, part) {
        const partType = part === 'partA' ? '应用文（邮件）' : '短文写作';
        const wordCount = part === 'partA' ? '约100词' : '160-200词';

        return `你是一位专业的考研英语作文批改老师。请对以下${partType}进行详细批改。

【题目要求】
${question}

【学生作答】
${answer}

【批改要求】
1. 首先给出预估得分（满分${part === 'partA' ? '10' : '20'}分）
2. 分析文章结构是否清晰合理
3. 指出语法错误和用词问题
4. 评价内容是否切题
5. 给出具体的改进建议
6. 提供一篇高质量的范文参考

请用中文进行批改。`;
    }

    // 生成Part A范文HTML
    function generatePartASamplesHtml() {
        const samples = getDefaultSamples('partA', currentPaper.year, currentPaper.type);
        if (samples.length === 0) {
            return '<p class="pp-no-sample">暂无范文</p>';
        }

        let html = '<div class="pp-samples-list">';
        samples.forEach((sample, index) => {
            html += `
                <div class="pp-sample-item">
                    <div class="pp-sample-text">${sample.text.replace(/\n/g, '<br>')}</div>
                    ${sample.note ? `<div class="pp-sample-note">${sample.note}</div>` : ''}
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    // 生成Part B范文HTML
    function generatePartBSamplesHtml() {
        const samples = getDefaultSamples('partB', currentPaper.year, currentPaper.type);
        if (samples.length === 0) {
            return '<p class="pp-no-sample">暂无范文</p>';
        }

        let html = '<div class="pp-samples-list">';
        samples.forEach((sample, index) => {
            html += `
                <div class="pp-sample-item">
                    <div class="pp-sample-text">${sample.text.replace(/\n/g, '<br>')}</div>
                    ${sample.note ? `<div class="pp-sample-note">${sample.note}</div>` : ''}
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    // 生成Part A技巧HTML
    function generatePartATipsHtml() {
        const tips = getDefaultTips('partA', currentPaper.year, currentPaper.type);
        let html = '<div class="pp-writing-tips">';

        if (tips.structure && tips.structure.length > 0) {
            html += '<h4>📌 文章结构</h4><ul>';
            tips.structure.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        }

        if (tips.commonPhrases && tips.commonPhrases.length > 0) {
            html += '<h4>📝 常用表达</h4><ul>';
            tips.commonPhrases.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        }

        if (tips.notes) {
            html += `<div class="pp-tips-note">💬 ${tips.notes}</div>`;
        }

        html += '</div>';
        return html;
    }

    // 生成Part B技巧HTML
    function generatePartBTipsHtml() {
        const tips = getDefaultTips('partB', currentPaper.year, currentPaper.type);
        let html = '<div class="pp-writing-tips">';

        if (tips.type === 'table') {
            html += '<h4>📊 图表作文写作要点</h4>';
        } else if (tips.type === 'picture') {
            html += '<h4>🎨 图画作文写作要点</h4>';
        } else if (tips.type === 'picture+chart') {
            html += '<h4>📊 图画+图表作文写作要点</h4>';
        } else {
            html += '<h4>📝 短文写作要点</h4>';
        }

        if (tips.structure && tips.structure.length > 0) {
            html += '<ul>';
            tips.structure.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        }

        if (tips.keyExpressions && tips.keyExpressions.length > 0) {
            html += '<h4>🔑 关键表达</h4><ul>';
            tips.keyExpressions.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        }

        if (tips.notes) {
            html += `<div class="pp-tips-note">💬 ${tips.notes}</div>`;
        }

        html += '</div>';
        return html;
    }

    // 生成AI批改HTML
    function generateAICheckHtml() {
        return `
            <div class="pp-ai-check-area">
                <div class="pp-ai-header">
                    <h3 class="pp-ai-title">AI智能批改</h3>
                    <p class="pp-ai-subtitle">基于人工智能的作文评分与改进建议</p>
                </div>
                
                <div class="pp-ai-tab-bar">
                    <button class="pp-ai-tab-btn active" data-part="partA">Part A</button>
                    <button class="pp-ai-tab-btn" data-part="partB">Part B</button>
                </div>
                
                <div class="pp-ai-content">
                    <div class="pp-ai-submit-section">
                        <button id="ppAiCheckBtn" class="pp-ai-check-btn">
                            提交批改
                        </button>
                        <p class="pp-ai-hint">请先在答题区域完成作文后再提交</p>
                    </div>
                    
                    <div id="ppAiResult" class="pp-ai-result-area"></div>
                </div>
                
                <div class="pp-ai-footer">
                    <span class="pp-ai-footer-text">批改结果仅供参考，实际得分以官方标准为准</span>
                </div>
            </div>
        `;
    }

    // 旧版兼容函数（保持API兼容）
    function extractPartA(content) {
        const parsed = parseWritingContent(content, '');
        return parsed.partA.display.replace(/<\/?[^>]+>/g, '').replace(/<br>/g, '\n');
    }

    function extractPartB(content) {
        const parsed = parseWritingContent(content, '');
        return parsed.partB.display.replace(/<\/?[^>]+>/g, '').replace(/<br>/g, '\n');
    }

    function formatQuestionText_OLD(text) {
        return formatQuestionText(text);
    }

    function generatePartASample() {
        const samples = getDefaultSamples('partA', currentPaper?.year || '2025', currentPaper?.type || '英语一');
        return samples[0]?.text || '';
    }

    function generatePartBSample() {
        const samples = getDefaultSamples('partB', currentPaper?.year || '2025', currentPaper?.type || '英语一');
        return samples[0]?.text || '';
    }

    function generatePartATips() {
        return generatePartATipsHtml();
    }

    function generatePartBTips() {
        return generatePartBTipsHtml();
    }

    return {
        render,
        extractPartA,
        extractPartB
    };
})();

window.Writing = Writing;
