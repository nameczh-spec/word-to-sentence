/**
 * 数据管理器
 * 支持导出/导入用户数据（本地文件方式）
 */
class DataManager {
    constructor() {
        this.version = '1.0';
    }

    /**
     * 导出所有数据
     * @param {string} password - 可选的密码
     * @returns {Object} { success: boolean, data: string, filename: string }
     */
    exportData(password) {
        const data = {
            version: this.version,
            exportDate: new Date().toISOString(),
            wordList: this.getStorageItem('wordList'),
            reviewHistory: this.getStorageItem('reviewHistory'),
            settings: this.getStorageItem('userSettings'),
            vocabBooks: this.getStorageItem('vocabBooks'),
            queryHistory: this.getStorageItem('queryHistory')
        };

        let exportContent = JSON.stringify(data, null, 2);

        // 如果设置了密码，简单加密
        if (password) {
            exportContent = this.simpleEncrypt(exportContent, password);
        }

        return {
            success: true,
            data: exportContent,
            filename: `vocab_backup_${new Date().toISOString().slice(0, 10)}.json`
        };
    }

    /**
     * 导入数据
     * @param {string} content - 文件内容
     * @param {string} password - 可选的密码
     * @param {string} mergeStrategy - 合并策略：'overwrite' | 'merge' | 'prompt'
     * @returns {Object} { success: boolean, error?: string, needsMerge?: boolean, data?: Object }
     */
    importData(content, password, mergeStrategy = 'overwrite') {
        try {
            let data;

            // 尝试解密
            if (password) {
                const decrypted = this.simpleDecrypt(content, password);
                data = JSON.parse(decrypted);
            } else {
                data = JSON.parse(content);
            }

            // 校验版本
            if (!data.version) {
                return { success: false, error: '无效的数据文件' };
            }

            // 检查本地是否有数据
            const hasLocalData = this.hasLocalData();

            if (hasLocalData && mergeStrategy === 'prompt') {
                return {
                    success: false,
                    needsMerge: true,
                    data: data
                };
            }

            // 根据策略处理
            if (mergeStrategy === 'overwrite') {
                this.overwriteData(data);
            } else if (mergeStrategy === 'merge') {
                this.mergeData(data);
            }

            return { success: true };
        } catch (e) {
            return { success: false, error: '导入失败：' + e.message };
        }
    }

    /**
     * 检查本地是否有数据
     * @returns {boolean}
     */
    hasLocalData() {
        const wordList = this.getStorageItem('wordList');
        return wordList && wordList.length > 0;
    }

    /**
     * 覆盖本地数据
     * @param {Object} data - 导入的数据
     */
    overwriteData(data) {
        if (data.wordList !== undefined) {
            this.setStorageItem('wordList', data.wordList);
        }
        if (data.reviewHistory !== undefined) {
            this.setStorageItem('reviewHistory', data.reviewHistory);
        }
        if (data.settings !== undefined) {
            this.setStorageItem('userSettings', data.settings);
        }
        if (data.vocabBooks !== undefined) {
            this.setStorageItem('vocabBooks', data.vocabBooks);
        }
        if (data.queryHistory !== undefined) {
            this.setStorageItem('queryHistory', data.queryHistory);
        }
    }

    /**
     * 合并数据（智能去重）
     * @param {Object} data - 导入的数据
     */
    mergeData(data) {
        // 合并单词列表（去重）
        if (data.wordList) {
            const local = this.getStorageItem('wordList') || [];
            const merged = [...local];
            data.wordList.forEach(word => {
                if (!merged.find(w => w.word === word.word)) {
                    merged.push(word);
                }
            });
            this.setStorageItem('wordList', merged);
        }

        // 合并复习历史（按日期去重）
        if (data.reviewHistory) {
            const local = this.getStorageItem('reviewHistory') || [];
            const merged = [...local, ...data.reviewHistory];
            const seen = new Set();
            const unique = merged.filter(item => {
                if (seen.has(item.date)) return false;
                seen.add(item.date);
                return true;
            });
            this.setStorageItem('reviewHistory', unique);
        }

        // 合并词书（同名覆盖）
        if (data.vocabBooks) {
            const local = this.getStorageItem('vocabBooks') || [];
            const merged = [...local];
            data.vocabBooks.forEach(book => {
                const index = merged.findIndex(b => b.name === book.name);
                if (index !== -1) {
                    merged[index] = book;
                } else {
                    merged.push(book);
                }
            });
            this.setStorageItem('vocabBooks', merged);
        }

        // 合并查询历史（去重）
        if (data.queryHistory) {
            const local = this.getStorageItem('queryHistory') || [];
            const merged = [...local];
            data.queryHistory.forEach(item => {
                if (!merged.find(q => q.word === item.word)) {
                    merged.push(item);
                }
            });
            this.setStorageItem('queryHistory', merged);
        }

        // 设置合并（导入的覆盖本地的）
        if (data.settings) {
            const local = this.getStorageItem('userSettings') || {};
            this.setStorageItem('userSettings', { ...local, ...data.settings });
        }
    }

    /**
     * 简单加密（XOR + Base64）
     * @param {string} text - 明文
     * @param {string} password - 密码
     * @returns {string} 密文
     */
    simpleEncrypt(text, password) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ password.charCodeAt(i % password.length)
            );
        }
        return btoa(result);
    }

    /**
     * 解密
     * @param {string} encrypted - 密文
     * @param {string} password - 密码
     * @returns {string} 明文
     */
    simpleDecrypt(encrypted, password) {
        const text = atob(encrypted);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ password.charCodeAt(i % password.length)
            );
        }
        return result;
    }

    /**
     * 获取 localStorage 项
     * @param {string} key - 键名
     * @returns {any} 解析后的值
     */
    getStorageItem(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * 设置 localStorage 项
     * @param {string} key - 键名
     * @param {any} value - 值
     */
    setStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('保存数据失败:', e);
        }
    }

    /**
     * 触发文件下载
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     */
    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 清除所有用户数据（保留账号登录信息）
     * @returns {Object} { success: boolean, message: string }
     */
    clearAllData() {
        try {
            // 获取当前用户信息（保留）
            const currentUser = localStorage.getItem('currentUser');
            const userId = localStorage.getItem('userId');
            
            // 需要清除的数据键前缀
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                // 保留用户登录相关键
                if (key && key !== 'currentUser' && key !== 'userId' && 
                    !key.startsWith('user_') && !key.startsWith('login_')) {
                    keysToRemove.push(key);
                }
            }
            
            // 执行清除
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // 恢复用户信息
            if (currentUser) localStorage.setItem('currentUser', currentUser);
            if (userId) localStorage.setItem('userId', userId);
            
            return {
                success: true,
                message: `已清除 ${keysToRemove.length} 项数据，账号信息已保留`
            };
        } catch (e) {
            return {
                success: false,
                message: '清除数据失败：' + e.message
            };
        }
    }
}

// 导出为全局变量（兼容浏览器和Node.js测试环境）
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
