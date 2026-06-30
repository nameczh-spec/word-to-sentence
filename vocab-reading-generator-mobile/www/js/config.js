/**
 * 配置管理模块 - config.js
 * 负责全局配置的读写、API配置、样式配置持久化
 */

const ConfigManager = {
    // 模型预设
    MODEL_PRESETS: {
        deepseek: {
            name: 'DeepSeek',
            url: 'https://api.deepseek.com/v1/chat/completions',
            model: 'deepseek-chat'
        },
        zhipu: {
            name: '智谱清言 (GLM-4.7-Flash)',
            url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            model: 'glm-4.7-flash'
        }
    },

    // 默认配置
    defaultConfig: {
        api: {
            url: 'https://api.deepseek.com/v1/chat/completions',
            key: '',
            timeout: 30000,
            modelPreset: 'deepseek',
            model: 'deepseek-chat'
        },
        theme: 'light',
        highlightStyle: 'background',
        savePath: '',
        queryHistoryLimit: 200,
        defaultMode: 'english',
        defaultEngine: 'local',
        lastSettings: {},
        enableNonImportedWordLookup: false
    },

    // 存储键名
    STORAGE_KEY: 'vocab_config',

    /**
     * 获取带用户ID前缀的存储键
     * @returns {string} 带前缀的键名
     */
    _getKey() {
        const userId = typeof UserManager !== 'undefined' ? UserManager.getCurrentUserId() : '';
        return userId ? `${this.STORAGE_KEY}_${userId}` : this.STORAGE_KEY;
    },

    /**
     * 从localStorage加载全局配置
     * @returns {Object} 配置对象
     */
    loadConfig() {
        try {
            const stored = localStorage.getItem(this._getKey());
            if (stored) {
                const config = JSON.parse(stored);
                // 合并默认配置，确保所有字段存在
                return { ...this.defaultConfig, ...config };
            }
        } catch (e) {
            console.error('加载配置失败:', e);
        }
        return this.defaultConfig;
    },

    /**
     * 保存配置项到localStorage
     * @param {string} key - 配置键名
     * @param {*} value - 配置值
     */
    saveConfig(key, value) {
        try {
            const config = this.loadConfig();
            config[key] = value;
            localStorage.setItem(this._getKey(), JSON.stringify(config));
        } catch (e) {
            console.error('保存配置失败:', e);
        }
    },

    /**
     * 保存完整配置
     * @param {Object} config - 配置对象
     */
    saveFullConfig(config) {
        try {
            localStorage.setItem(this._getKey(), JSON.stringify(config));
        } catch (e) {
            console.error('保存配置失败:', e);
        }
    },

    /**
     * 获取API配置
     * @returns {Object} API配置对象
     */
    getApiConfig() {
        const config = this.loadConfig();
        return config.api;
    },

    /**
     * 设置API配置
     * @param {Object} apiConfig - API配置对象
     */
    setApiConfig(apiConfig) {
        const config = this.loadConfig();
        config.api = { ...config.api, ...apiConfig };
        this.saveFullConfig(config);
    },

    /**
     * 切换模型预设
     * @param {string} presetKey - 预设键名 ('deepseek' | 'zhipu')
     */
    switchModelPreset(presetKey) {
        const preset = this.MODEL_PRESETS[presetKey];
        if (!preset) return;

        const config = this.loadConfig();
        config.api.modelPreset = presetKey;
        config.api.url = preset.url;
        config.api.model = preset.model;
        this.saveFullConfig(config);
        return preset;
    },

    /**
     * 获取当前主题
     * @returns {string} 主题名称
     */
    getTheme() {
        return this.loadConfig().theme;
    },

    /**
     * 设置主题
     * @param {string} theme - 主题名称 ('light' | 'dark')
     */
    setTheme(theme) {
        this.saveConfig('theme', theme);
        this.applyTheme(theme);
    },

    /**
     * 应用主题到页面
     * @param {string} theme - 主题名称
     */
    applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
    },

    /**
     * 获取高亮样式设置
     * @returns {string} 高亮样式名称
     */
    getHighlightStyle() {
        return this.loadConfig().highlightStyle;
    },

    /**
     * 设置高亮样式
     * @param {string} style - 高亮样式名称 ('bold' | 'background' | 'color')
     */
    setHighlightStyle(style) {
        this.saveConfig('highlightStyle', style);
    },

    /**
     * 获取保存路径
     * @returns {string} 保存路径
     */
    getSavePath() {
        return this.loadConfig().savePath;
    },

    /**
     * 设置保存路径
     * @param {string} path - 保存路径
     */
    setSavePath(path) {
        this.saveConfig('savePath', path);
    },

    /**
     * 获取查询历史上限
     * @returns {number}
     */
    getQueryHistoryLimit() {
        return this.loadConfig().queryHistoryLimit || 200;
    },

    /**
     * 设置查询历史上限
     * @param {number} limit
     */
    setQueryHistoryLimit(limit) {
        this.saveConfig('queryHistoryLimit', limit);
    },

    /**
     * 获取默认生成模式
     * @returns {string} 生成模式
     */
    getDefaultMode() {
        return this.loadConfig().defaultMode;
    },

    /**
     * 设置默认生成模式
     * @param {string} mode - 生成模式 ('english' | 'chinese')
     */
    setDefaultMode(mode) {
        this.saveConfig('defaultMode', mode);
    },

    /**
     * 获取默认生成引擎
     * @returns {string} 'local' | 'api'
     */
    getDefaultEngine() {
        return this.loadConfig().defaultEngine;
    },

    /**
     * 设置默认生成引擎
     * @param {string} engine - 'local' | 'api'
     */
    setDefaultEngine(engine) {
        this.saveConfig('defaultEngine', engine);
    },

    /**
     * 测试API连接可用性
     * @returns {Promise<Object>} 测试结果
     */
    async testApiConnection() {
        const apiConfig = this.getApiConfig();
        
        if (!apiConfig.key) {
            return { success: false, message: '请先输入API密钥' };
        }

        try {
            const response = await fetch(apiConfig.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiConfig.key}`
                },
                body: JSON.stringify({
                    model: apiConfig.model || 'deepseek-chat',
                    messages: [
                        { role: 'user', content: 'test' }
                    ],
                    max_tokens: 10
                }),
                signal: AbortSignal.timeout(10000)
            });

            if (response.ok) {
                return { success: true, message: 'API连接成功' };
            } else if (response.status === 401) {
                return { success: false, message: 'API密钥无效' };
            } else if (response.status === 429) {
                return { success: false, message: '请求过于频繁(429)，请稍后再试或检查API额度' };
            } else {
                // 尝试读取错误详情
                let errorDetail = '';
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.error?.message || errorData.message || '';
                } catch (e) {}
                return { success: false, message: `API返回错误 ${response.status}${errorDetail ? ': ' + errorDetail : ''}` };
            }
        } catch (e) {
            if (e.name === 'TimeoutError') {
                return { success: false, message: '连接超时' };
            }
            return { success: false, message: '网络连接失败' };
        }
    },

    /**
     * 初始化配置界面
     */
    initConfigUI() {
        const config = this.loadConfig();
        
        // 应用主题
        this.applyTheme(config.theme);
        
        // 设置API配置输入框
        document.getElementById('apiUrl').value = config.api.url;
        document.getElementById('apiKey').value = config.api.key;
        document.getElementById('apiTimeout').value = config.api.timeout;
        document.getElementById('modelPreset').value = config.api.modelPreset || 'deepseek';
        
        // 设置主题按钮状态
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === config.theme);
        });
        
        // 设置高亮样式按钮状态
        document.querySelectorAll('.highlight-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === config.highlightStyle);
        });
        
        // 设置保存路径
        document.getElementById('savePath').value = config.savePath;
        
        // 设置默认生成模式
        document.getElementById('generateMode').value = config.defaultMode;
        // 设置默认生成引擎
        if (document.getElementById('generateEngine')) {
            document.getElementById('generateEngine').value = config.defaultEngine;
        }
    }
};

// 导出模块
window.ConfigManager = ConfigManager;