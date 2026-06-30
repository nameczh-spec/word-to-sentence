/**
 * 词书管理和数据导出导入功能测试
 * TDD: 测试驱动开发
 */

const VocabBookManager = require('../vocabBook.js');
const DataManager = require('../dataManager.js');

describe('词书导入功能', () => {
    let vocabBookManager;

    beforeEach(() => {
        // 模拟 localStorage
        const store = {};
        global.localStorage = {
            getItem: (key) => store[key] || null,
            setItem: (key, value) => { store[key] = value; },
            removeItem: (key) => { delete store[key]; }
        };

        // 创建 VocabBookManager 实例
        vocabBookManager = new VocabBookManager();
    });

    test('导入有效的 JSON 词书', () => {
        const content = JSON.stringify({
            name: '雅思词汇',
            words: [
                { word: 'abandon', meaning: '放弃' },
                { word: 'ability', meaning: '能力' }
            ]
        });

        const result = vocabBookManager.importBook(content, 'ielts.json');

        expect(result.success).toBe(true);
        expect(result.book.name).toBe('雅思词汇');
        expect(result.book.wordCount).toBe(2);
        expect(result.book.source).toBe('ielts.json');
    });

    test('导入缺少名称的词书应该失败', () => {
        const content = JSON.stringify({
            words: [{ word: 'test' }]
        });

        const result = vocabBookManager.importBook(content, 'test.json');

        expect(result.success).toBe(false);
        expect(result.error).toContain('词书名称不能为空');
    });

    test('导入空的单词列表应该失败', () => {
        const content = JSON.stringify({
            name: '空词书',
            words: []
        });

        const result = vocabBookManager.importBook(content, 'empty.json');

        expect(result.success).toBe(false);
        expect(result.error).toContain('单词列表不能为空');
    });

    test('导入格式错误的 JSON 应该失败', () => {
        const content = '{ invalid json';

        const result = vocabBookManager.importBook(content, 'bad.json');

        expect(result.success).toBe(false);
        expect(result.error).toContain('JSON 格式错误');
    });

    test('导入后标签列表应该更新', () => {
        const content = JSON.stringify({
            name: '托福词汇',
            words: [{ word: 'apple' }]
        });

        vocabBookManager.importBook(content, 'toefl.json');
        const tags = vocabBookManager.getAllTags();

        expect(tags).toContain('托福词汇');
        expect(tags).toContain('全部');
        expect(tags).toContain('考研');
    });

    test('删除词书', () => {
        const content = JSON.stringify({
            name: 'GRE词汇',
            words: [{ word: 'abate' }]
        });

        const importResult = vocabBookManager.importBook(content, 'gre.json');
        const bookId = importResult.book.id;

        const deleteResult = vocabBookManager.deleteBook(bookId);
        expect(deleteResult.success).toBe(true);
        expect(vocabBookManager.books.length).toBe(0);
    });

    test('数据持久化到 localStorage', () => {
        const content = JSON.stringify({
            name: '测试词书',
            words: [{ word: 'test' }]
        });

        vocabBookManager.importBook(content, 'test.json');

        const stored = JSON.parse(localStorage.getItem('vocabBooks'));
        expect(stored.length).toBe(1);
        expect(stored[0].name).toBe('测试词书');
    });

    test('下载模板功能', () => {
        // 模拟 URL.createObjectURL 和 DOM 操作
        global.URL = {
            createObjectURL: () => 'blob:test',
            revokeObjectURL: () => {}
        };
        global.document = {
            createElement: () => ({
                click: () => {},
                style: {}
            }),
            body: {
                appendChild: () => {},
                removeChild: () => {}
            }
        };
        global.Blob = class Blob {
            constructor(parts) { this.parts = parts; }
        };

        // 不应该抛出错误
        expect(() => vocabBookManager.downloadTemplate()).not.toThrow();
    });
});

describe('数据导出导入功能', () => {
    let dataManager;

    beforeEach(() => {
        const store = {
            'wordList': JSON.stringify([{ word: 'hello', status: 'new' }]),
            'reviewHistory': JSON.stringify([{ date: '2024-01-01', words: ['hello'] }]),
            'userSettings': JSON.stringify({ theme: 'light' })
        };

        global.localStorage = {
            getItem: (key) => store[key] || null,
            setItem: (key, value) => { store[key] = value; },
            removeItem: (key) => { delete store[key]; }
        };

        dataManager = new DataManager();
    });

    test('导出数据包含所有内容', () => {
        const result = dataManager.exportData();

        expect(result.success).toBe(true);
        expect(result.filename).toContain('vocab_backup_');

        const data = JSON.parse(result.data);
        expect(data.wordList).toEqual([{ word: 'hello', status: 'new' }]);
        expect(data.reviewHistory).toEqual([{ date: '2024-01-01', words: ['hello'] }]);
        expect(data.settings).toEqual({ theme: 'light' });
    });

    test('导出时设置密码', () => {
        const result = dataManager.exportData('mypassword');

        expect(result.success).toBe(true);
        // 加密后的内容应该是 Base64
        expect(() => atob(result.data)).not.toThrow();
    });

    test('导入数据覆盖本地', () => {
        const exportResult = dataManager.exportData();

        // 清空本地数据
        localStorage.setItem('wordList', '[]');

        const importResult = dataManager.importData(exportResult.data, null, 'overwrite');

        expect(importResult.success).toBe(true);
        const wordList = JSON.parse(localStorage.getItem('wordList'));
        expect(wordList.length).toBe(1);
    });

    test('导入加密数据需要密码', () => {
        const exportResult = dataManager.exportData('secret123');

        // 不用密码导入应该失败
        const importResult = dataManager.importData(exportResult.data, null, 'overwrite');
        expect(importResult.success).toBe(false);

        // 用正确密码导入应该成功
        const importResult2 = dataManager.importData(exportResult.data, 'secret123', 'overwrite');
        expect(importResult2.success).toBe(true);
    });

    test('本地有数据时提示合并', () => {
        const exportResult = dataManager.exportData();

        const importResult = dataManager.importData(exportResult.data, null, 'prompt');

        expect(importResult.needsMerge).toBe(true);
    });

    test('合并数据时去重', () => {
        const exportData = {
            version: '1.0',
            wordList: [{ word: 'hello', status: 'review' }, { word: 'world', status: 'new' }],
            reviewHistory: [{ date: '2024-01-01', words: ['hello'] }]
        };

        dataManager.importData(JSON.stringify(exportData), null, 'merge');

        const wordList = JSON.parse(localStorage.getItem('wordList'));
        // hello 应该只出现一次（去重）
        const helloCount = wordList.filter(w => w.word === 'hello').length;
        expect(helloCount).toBe(1);
    });
});
