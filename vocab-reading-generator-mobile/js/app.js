/**
 * 主应用入口 - app.js
 * 负责初始化所有模块和绑定主要事件
 */

const App = {
    /**
     * 初始化应用（入口）
     */
    async init() {
        // 检查登录状态
        if (!UserManager.isLoggedIn()) {
            this.showLoginScreen();
            return;
        }

        // 已登录，迁移旧数据并初始化所有模块
        UserManager.migrateOldData();
        await this.initAfterLogin();
        this.initUserAvatar();
    },

    /**
     * 登录后初始化所有模块
     */
    async initAfterLogin() {
        DataStore.init();
        ConfigManager.initConfigUI();
        WordManager.init();
        TextRenderer.init();
        InteractionManager.init();
        InteractionManager.renderHistoryList();

        // 初始化词库检索模块
        await VocabSearch.init();

        // 初始化学习引擎
        LearningEngine.init();
        VocabLearning.init();

        // 绑定主要事件
        this.bindMainEvents();

        console.log('单词段落生成工具已初始化');
    },

    // ==================== 用户登录管理 ====================

    /**
     * 显示登录界面
     */
    showLoginScreen() {
        const overlay = document.getElementById('loginOverlay');
        overlay.style.display = 'flex';

        // 隐藏主应用
        const appContainer = document.querySelector('.app-container');
        if (appContainer) appContainer.classList.add('hidden');

        // 隐藏导航栏
        const navBar = document.querySelector('.nav-bar');
        if (navBar) navBar.style.display = 'none';

        // 为新用户生成随机ID
        document.getElementById('loginUserId').value = UserManager.generateUniqueId();

        // 显示已有账号
        this.renderLoginUsers();

        // 绑定登录事件（仅绑定一次）
        if (!this._loginEventsBound) {
            document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
            document.getElementById('loginUsername').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
            this._loginEventsBound = true;
        }
    },

    /**
     * 处理新用户登录
     */
    async handleLogin() {
        const name = document.getElementById('loginUsername').value.trim();
        if (!name) {
            InteractionManager.showToast('请输入用户名', 'warning');
            return;
        }

        const user = UserManager.createUser(name);

        // 迁移旧数据到新用户
        UserManager.migrateOldData();

        // 隐藏登录界面，显示主应用
        document.getElementById('loginOverlay').style.display = 'none';
        document.querySelector('.app-container').classList.remove('hidden');
        document.querySelector('.nav-bar').style.display = '';

        // 初始化应用
        await this.initAfterLogin();
        this.initUserAvatar();

        InteractionManager.showToast(`欢迎，${user.name}！`, 'success');
    },

    /**
     * 快速登录已有用户
     * @param {string} userId - 用户ID
     */
    async handleQuickLogin(userId) {
        UserManager.login(userId);

        // 迁移旧数据到该用户
        UserManager.migrateOldData();

        document.getElementById('loginOverlay').style.display = 'none';
        document.querySelector('.app-container').classList.remove('hidden');
        document.querySelector('.nav-bar').style.display = '';

        await this.initAfterLogin();
        this.initUserAvatar();

        const user = UserManager.getCurrentUser();
        InteractionManager.showToast(`欢迎回来，${user.name}！`, 'success');
    },

    /**
     * 渲染登录界面的已有账号列表
     */
    renderLoginUsers() {
        const users = UserManager.getUsers();
        const container = document.getElementById('loginUsers');
        const list = document.getElementById('loginUsersList');

        if (users.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = '';
        list.innerHTML = users.map(u => `
            <div class="login-user-chip" data-id="${u.id}">
                <span class="chip-avatar">${UserManager.getInitials(u.name)}</span>
                <span>${u.name}</span>
            </div>
        `).join('');

        list.querySelectorAll('.login-user-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.handleQuickLogin(chip.dataset.id);
            });
        });
    },

    /**
     * 初始化用户头像按钮和弹窗
     */
    initUserAvatar() {
        const user = UserManager.getCurrentUser();
        if (!user) return;

        const avatarBtn = document.getElementById('userAvatarBtn');
        const popover = document.getElementById('userPopover');

        avatarBtn.textContent = UserManager.getInitials(user.name);
        avatarBtn.style.display = 'flex';

        document.getElementById('popoverAvatar').textContent = UserManager.getInitials(user.name);
        document.getElementById('popoverName').textContent = user.name;
        document.getElementById('popoverId').textContent = `编号: ${user.id}`;

        // 更新设置面板头像
        const settingsAvatar = document.querySelector('.settings-user-avatar .avatar-circle');
        const settingsLabel = document.querySelector('.settings-user-avatar .avatar-label');
        if (settingsAvatar) {
            settingsAvatar.textContent = UserManager.getInitials(user.name);
        }
        if (settingsLabel) {
            settingsLabel.textContent = user.name;
        }

        // 仅绑定一次事件（避免切换账号时重复绑定）
        if (!this._avatarEventsBound) {
            // 切换弹窗显示
            avatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = popover.style.display !== 'none';
                popover.style.display = isVisible ? 'none' : '';
            });

            // 点击外部关闭弹窗
            document.addEventListener('click', (e) => {
                if (!popover.contains(e.target) && e.target !== avatarBtn) {
                    popover.style.display = 'none';
                }
            });

            // 切换账号按钮
            document.getElementById('popoverSwitchUser').addEventListener('click', () => {
                popover.style.display = 'none';
                this.showLoginScreen();
            });

            // 退出登录按钮
            document.getElementById('popoverLogout').addEventListener('click', () => {
                UserManager.logout();
                popover.style.display = 'none';
                this.showLoginScreen();
            });

            this._avatarEventsBound = true;
        }
    },

    /**
     * 绑定主要事件
     */
    bindMainEvents() {
        // 单词学习导航
        document.getElementById('vocabLearningBtn').addEventListener('click', () => {
            VocabLearning.show();
        });

        // 批量导入
        document.getElementById('batchImportBtn').addEventListener('click', () => {
            const input = document.getElementById('batchInput').value;
            // 优先使用批量导入区可见的分组选择器
            const checkedRadio = document.querySelector('input[name="batchGroup"]:checked');
            const group = checkedRadio ? checkedRadio.value : document.getElementById('importGroup').value;
            
            const result = WordManager.batchImport(input, group);
            
            if (result.success) {
                InteractionManager.showToast(result.message, 'success');
                document.getElementById('batchInput').value = '';
            } else {
                InteractionManager.showToast(result.message, 'warning');
            }
        });
        
        // 复制提示词
        const copyPromptBtn = document.getElementById('copyPromptBtn');
        if (copyPromptBtn) {
            copyPromptBtn.addEventListener('click', () => {
                const prompt = `[使用说明：以下文字是用户操作说明，AI请忽略此部分内容，直接从 === 之后执行提取指令]

使用方法：将本提示词连同截图/文件一起发给豆包，豆包会按格式返回单词列表，把返回结果粘贴到上方文本框点击批量导入即可。

========================================

请从图片/文件中提取所有英文单词，按以下格式输出，每行一个单词：

纯单词：
database

或带释义：
database /ˈdeɪtəbeɪs/ n. 数据库；资料库

格式规则：
- 单词 + 空格 + /音标/（可选）+ 空格 + 词性. + 释义
- 多个释义用"；"分隔
- 只输出单词列表，不要其他说明`;
                navigator.clipboard.writeText(prompt).then(() => {
                    InteractionManager.showToast('提示词已复制，去豆包粘贴吧', 'success');
                }).catch(() => {
                    InteractionManager.showToast('复制失败，请手动复制', 'error');
                });
            });
        }
        
        // 单个添加（使用词库检索）
        document.getElementById('singleAddBtn').addEventListener('click', () => {
            const wordData = VocabSearch.getSelectedWordData();
            const group = document.getElementById('importGroup').value;
            
            if (!wordData) {
                InteractionManager.showToast('请先选择单词和释义', 'warning');
                return;
            }
            
            const result = WordManager.addWordWithDetails(wordData, group);
            
            if (result.success) {
                DataStore.saveWordList(WordManager.wordList);
                WordManager.renderWordList();
                WordManager.updateStats();
                InteractionManager.showToast(`已添加单词: ${wordData.word}`, 'success');
                VocabSearch.clearSelection();
            } else {
                InteractionManager.showToast(result.message, 'warning');
            }
        });
        
        // 清空词单
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            if (confirm('确定要清空当日词单吗？')) {
                WordManager.clearAll();
                TextRenderer.clearText();
                InteractionManager.showToast('词单已清空', 'success');
            }
        });
        
        // 生成文本
        document.getElementById('generateBtn').addEventListener('click', async () => {
            await this.generateText();
        });
        
        // 重新生成
        document.getElementById('regenerateBtn').addEventListener('click', async () => {
            await this.generateText(true);
        });
        
        // 复制文本
        document.getElementById('copyTextBtn').addEventListener('click', () => {
            TextRenderer.copyText();
        });
        
        // 保存归档
        document.getElementById('saveArchiveBtn').addEventListener('click', () => {
            FileExport.exportCurrent();
        });
        
        // 分页控制
        document.getElementById('prevPageBtn').addEventListener('click', () => {
            TextRenderer.prevPage();
        });
        
        document.getElementById('nextPageBtn').addEventListener('click', () => {
            TextRenderer.nextPage();
        });
        
        // 生成引擎切换
        document.getElementById('generateEngine').addEventListener('change', () => {
            ConfigManager.setDefaultEngine(document.getElementById('generateEngine').value);
        });

        // 输出格式切换
        document.getElementById('generateMode').addEventListener('change', () => {
            ConfigManager.setDefaultMode(document.getElementById('generateMode').value);
        });
    },

    /**
     * 生成文本
     * @param {boolean} isRegenerate - 是否是重新生成
     */
    async generateText(isRegenerate = false) {
        // 确定单词来源
        let words;
        if (window.InteractionManager && window.InteractionManager._currentSource === 'custom' && window.InteractionManager._selectedCustomBook) {
            words = window.InteractionManager._selectedCustomBook.words.map(w => w.word);
        } else {
            words = WordManager.getAllWords();
            // 如果通过词源切换选择了 custom 但未选词本，回退到导入词单
            if (window.InteractionManager && window.InteractionManager._currentSource === 'custom') {
                window.InteractionManager._currentSource = 'daily';
                document.querySelectorAll('.source-toggle-btn').forEach(btn => btn.classList.remove('active'));
                const dailyBtn = document.querySelector('.source-toggle-btn[data-source="daily"]');
                if (dailyBtn) dailyBtn.classList.add('active');
            }
        }
        
        if (words.length === 0) {
            InteractionManager.showToast('词单为空，请先导入单词', 'warning');
            return;
        }
        
        const engine = document.getElementById('generateEngine').value;
        const mode = document.getElementById('generateMode').value;
        
        // 检查API配置（仅 AI 模式需要）
        if (engine === 'api') {
            const apiConfig = ConfigManager.getApiConfig();
            if (!apiConfig.key) {
                InteractionManager.showToast('请先配置API密钥', 'warning');
                return;
            }
        }
        
        // 显示加载
        InteractionManager.showLoading(engine === 'local' ? '极速模式生成中...' : 'AI正在生成文本...');
        
        // 如果是重新生成，累加版本号
        if (isRegenerate) {
            TextRenderer.incrementVersion();
        } else {
            TextRenderer.currentVersion = 1;
        }
        
        try {
            const result = await ApiRequest.generateText(words, mode, engine);
            
            InteractionManager.hideLoading();
            
            if (result.success) {
                var text, rareWords, rawContent;
                
                if (engine === 'local') {
                    // 极速模式：LocalGenerator 返回 { success, text, words }
                    text = result.text;
                    rareWords = [];
                    rawContent = result.text;
                } else {
                    // AI模式：API 返回 { success, data: { rawContent } }
                    rawContent = result.data.rawContent;
                    var parsed = ApiRequest.parseContent(rawContent);
                    text = parsed.text;
                    rareWords = parsed.rareWords;
                    
                    // 更新单词释义
                    var mappings = ApiRequest.extractWordMappings(rawContent);
                    for (var word in mappings) {
                        if (WordManager.wordList.wordDetails[word]) {
                            WordManager.wordList.wordDetails[word] = {
                                ...WordManager.wordList.wordDetails[word],
                                ...mappings[word]
                            };
                        }
                    }
                    DataStore.saveWordList(WordManager.wordList);
                    WordManager.renderWordList();
                }
                
                // 保存并渲染文本
                TextRenderer.saveCurrentText(
                    text,
                    rareWords,
                    mode,
                    rawContent
                );
                TextRenderer.renderText(text, rareWords);
                
                // 更新历史记录列表
                InteractionManager.renderHistoryList();
                
                InteractionManager.showToast('文本生成成功（版本' + TextRenderer.currentVersion + '）', 'success');
            } else {
                InteractionManager.showToast(result.error, 'error');
            }
        } catch (e) {
            InteractionManager.hideLoading();
            InteractionManager.showToast('生成失败，请重试', 'error');
            console.error('生成文本失败:', e);
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// ============================================================
// 退出自动归档（支持多种事件，确保移动端也能触发）
// ============================================================

/**
 * 执行归档（供各事件统一调用）
 */
function _safeArchive() {
    if (window.WordManager && !WordManager._isReadOnly) {
        const pureTodayList = DataStore.loadWordList();
        if (pureTodayList.date === DataStore.getTodayDate()) {
            DataStore.archiveToday();
        }
    }
}

// 1. beforeunload — 桌面浏览器关闭标签页
window.addEventListener('beforeunload', _safeArchive);

// 2. pagehide — 移动端切换页面/返回桌面时触发（比 beforeunload 更可靠）
window.addEventListener('pagehide', _safeArchive);

// 3. visibilitychange — 页面可见性变化（切换后台/锁屏）
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        _safeArchive();
    }
});

// 4. Capacitor App 状态变化（Android/iOS 原生应用切换后台）
try {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.addListener('appStateChange', (state) => {
            if (!state.isActive) {
                _safeArchive();
            }
        });
    }
} catch (e) {
    console.warn('[App] Capacitor App 插件不可用，跳过原生事件监听');
}

// 导出模块
window.App = App;