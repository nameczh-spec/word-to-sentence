/**
 * 用户管理模块 - userManager.js
 * 负责多用户支持、登录/登出、数据隔离前缀
 */

const UserManager = {
    STORAGE_KEY: 'vocab_users',
    CURRENT_USER_KEY: 'vocab_current_user',

    /**
     * 获取所有用户列表
     * @returns {Array} 用户数组 [{name, id, createdAt}]
     */
    getUsers() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    /**
     * 保存用户列表
     * @param {Array} users - 用户数组
     */
    saveUsers(users) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users)); } catch (e) {}
    },

    /**
     * 获取当前登录用户ID
     * @returns {string} 用户ID或空字符串
     */
    getCurrentUserId() {
        return localStorage.getItem(this.CURRENT_USER_KEY) || '';
    },

    /**
     * 设置当前登录用户ID
     * @param {string} userId - 用户ID
     */
    setCurrentUser(userId) {
        localStorage.setItem(this.CURRENT_USER_KEY, userId);
    },

    /**
     * 获取当前登录用户信息
     * @returns {Object|null} 用户对象 {name, id, createdAt}
     */
    getCurrentUser() {
        const id = this.getCurrentUserId();
        if (!id) return null;
        const users = this.getUsers();
        return users.find(u => u.id === id) || null;
    },

    /**
     * 检查是否已登录
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!this.getCurrentUserId() && !!this.getCurrentUser();
    },

    /**
     * 生成唯一10位数字ID
     * @returns {string} 10位数字ID
     */
    generateUniqueId() {
        const users = this.getUsers();
        const existingIds = new Set(users.map(u => u.id));
        let id;
        do {
            id = String(Math.floor(1000000000 + Math.random() * 9000000000));
        } while (existingIds.has(id));
        return id;
    },

    /**
     * 创建新用户并自动登录
     * @param {string} name - 用户名
     * @returns {Object} {name, id}
     */
    createUser(name) {
        const users = this.getUsers();
        const id = this.generateUniqueId();
        users.push({ name, id, createdAt: new Date().toISOString() });
        this.saveUsers(users);
        this.setCurrentUser(id);
        return { name, id };
    },

    /**
     * 登录已有用户
     * @param {string} userId - 用户ID
     */
    login(userId) {
        this.setCurrentUser(userId);
    },

    /**
     * 退出登录
     */
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    },

    /**
     * 获取用户头像显示文字
     * @param {string} name - 用户名
     * @returns {string} 首字母或首个汉字
     */
    getInitials(name) {
        if (!name) return '?';
        if (/[\u4e00-\u9fff]/.test(name)) return name.charAt(0);
        return name.substring(0, 2).toUpperCase();
    },

    /**
     * 迁移旧的无前缀数据到当前用户
     * 在首次登录时调用，将旧数据从 vocab_xxx 迁移到 vocab_xxx_userId
     */
    migrateOldData() {
        const userId = this.getCurrentUserId();
        if (!userId) return;

        // 检查是否已迁移过（版本号变更时重新迁移）
        const migrationKey = 'vocab_migrated_' + userId;
        const currentVersion = 'v2'; // 修改此值触发重新迁移
        if (localStorage.getItem(migrationKey) === currentVersion) return;

        const oldKeys = [
            'vocab_words',
            'vocab_history',
            'vocab_current_text',
            'vocab_config',
            'vocab_wordbooks',
            'vocab_query_history'
        ];

        let migrated = 0;
        for (const oldKey of oldKeys) {
            const newKey = oldKey + '_' + userId;
            const oldData = localStorage.getItem(oldKey);
            const newData = localStorage.getItem(newKey);

            if (!oldData) continue; // 旧键不存在，跳过

            // 判断新数据是否为空/无意义
            const isNewEmpty = this._isNewDataEmpty(oldKey, newData);

            if (!newData || isNewEmpty) {
                // 新键不存在或为空，用旧数据覆盖
                localStorage.setItem(newKey, oldData);
                migrated++;
            }
            // 无论是否迁移，都删除旧的无前缀键
            localStorage.removeItem(oldKey);
        }

        // 标记迁移完成（带版本号）
        localStorage.setItem(migrationKey, currentVersion);

        if (migrated > 0) {
            console.log(`已迁移 ${migrated} 项旧数据到用户 ${userId}`);
        }
    },

    /**
     * 判断新数据是否为空/无意义
     */
    _isNewDataEmpty(key, data) {
        if (!data) return true;
        try {
            const parsed = JSON.parse(data);
            // vocab_words: 检查是否有单词
            if (key === 'vocab_words') {
                return (!parsed.reviewWords || parsed.reviewWords.length === 0)
                    && (!parsed.newWords || parsed.newWords.length === 0);
            }
            // vocab_history: 检查是否有记录
            if (key === 'vocab_history') {
                return !parsed.records || parsed.records.length === 0;
            }
            // vocab_current_text: 检查是否有文本
            if (key === 'vocab_current_text') {
                return !parsed.text || parsed.text.trim() === '';
            }
            // vocab_config: 检查是否只有默认值
            if (key === 'vocab_config') {
                return Object.keys(parsed).length <= 2; // 只有 apiProvider 和 apiKey 等少量默认字段
            }
            // vocab_wordbooks: 检查是否有词本
            if (key === 'vocab_wordbooks') {
                return !parsed.books || parsed.books.length === 0;
            }
            // vocab_query_history: 检查是否有记录
            if (key === 'vocab_query_history') {
                return !Array.isArray(parsed) || parsed.length === 0;
            }
        } catch (e) {
            return true; // 解析失败视为空
        }
        return false;
    }
};

window.UserManager = UserManager;
