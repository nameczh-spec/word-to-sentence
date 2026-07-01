/**
 * 词书管理器
 * 支持导入自定义词书、动态标签、数据持久化
 */
class VocabBookManager {
    constructor() {
        this.books = [];
        this.systemTags = ['全部', '考研', '四级', '六级'];
        this.loadFromStorage();
    }

    /**
     * 导入词书
     * @param {string} fileContent - 文件内容
     * @param {string} fileName - 文件名
     * @returns {Object} { success: boolean, book?: Object, error?: string }
     */
    importBook(fileContent, fileName) {
        const book = this.parseBook(fileContent, fileName);
        if (book.error) {
            return { success: false, error: book.error };
        }

        // 检查是否已存在同名词书
        const existingIndex = this.books.findIndex(b => b.name === book.name);
        if (existingIndex !== -1) {
            // 覆盖已存在的词书
            this.books[existingIndex] = book;
        } else {
            this.books.push(book);
        }

        this.saveToStorage();
        return { success: true, book };
    }

    /**
     * 解析词书文件
     * @param {string} content - 文件内容
     * @param {string} fileName - 文件名
     * @returns {Object} 词书对象或错误对象
     */
    parseBook(content, fileName) {
        try {
            const data = JSON.parse(content);

            // 校验必需字段
            if (!data.name || typeof data.name !== 'string') {
                return { error: '词书名称不能为空' };
            }
            if (!Array.isArray(data.words) || data.words.length === 0) {
                return { error: '单词列表不能为空' };
            }

            // 校验每个单词
            for (let i = 0; i < data.words.length; i++) {
                const word = data.words[i];
                if (!word.word || typeof word.word !== 'string') {
                    return { error: `第 ${i + 1} 个单词格式错误：缺少 word 字段` };
                }
            }

            return {
                id: 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: data.name,
                words: data.words,
                wordCount: data.words.length,
                importDate: new Date().toISOString(),
                source: fileName
            };
        } catch (e) {
            return { error: 'JSON 格式错误：' + e.message };
        }
    }

    /**
     * 删除词书
     * @param {string} bookId - 词书ID
     * @returns {Object} { success: boolean, error?: string }
     */
    deleteBook(bookId) {
        const index = this.books.findIndex(b => b.id === bookId);
        if (index === -1) {
            return { success: false, error: '词书不存在' };
        }

        this.books.splice(index, 1);
        this.saveToStorage();
        return { success: true };
    }

    /**
     * 获取所有标签（系统标签 + 用户标签）
     * @returns {string[]} 标签列表
     */
    getAllTags() {
        const userTags = this.books.map(b => b.name);
        return [...this.systemTags, ...userTags];
    }

    /**
     * 获取用户标签（仅导入的词书）
     * @returns {Object[]} 词书列表
     */
    getUserBooks() {
        return this.books.map(book => ({
            id: book.id,
            name: book.name,
            wordCount: book.wordCount,
            importDate: book.importDate
        }));
    }

    /**
     * 根据标签获取单词列表
     * @param {string} tag - 标签名称
     * @returns {Object[]} 单词列表
     */
    getWordsByTag(tag) {
        if (tag === '全部') {
            // 返回所有单词（包括系统词书和用户词书）
            const allWords = [];
            this.books.forEach(book => {
                allWords.push(...book.words);
            });
            return allWords;
        }

        const book = this.books.find(b => b.name === tag);
        return book ? book.words : [];
    }

    /**
     * 保存到 localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('vocabBooks', JSON.stringify(this.books));
        } catch (e) {
            console.error('保存词书失败:', e);
        }
    }

    /**
     * 从 localStorage 加载
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem('vocabBooks');
            if (data) {
                this.books = JSON.parse(data);
            }
        } catch (e) {
            console.error('加载词书失败:', e);
            this.books = [];
        }
    }

    /**
     * 下载词书模板
     */
    downloadTemplate() {
        const template = {
            name: '我的词书',
            words: [
                {
                    word: 'example',
                    meaning: '例子',
                    phonetic: '/ɪɡˈzæmpl/',
                    example: 'This is an example sentence.'
                },
                {
                    word: 'template',
                    meaning: '模板',
                    phonetic: '/ˈtempleɪt/',
                    example: 'Please follow this template.'
                }
            ]
        };

        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vocab_book_template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 导出为全局变量（兼容浏览器和Node.js测试环境）
if (typeof window !== 'undefined') {
    window.VocabBookManager = VocabBookManager;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VocabBookManager;
}
