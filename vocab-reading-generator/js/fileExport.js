/**
 * 文件导出模块 - fileExport.js
 * 贳责本地文件导出、自动命名
 */

const FileExport = {
    /**
     * 导出数据为TXT文件
     * @param {Object} data - 导出数据
     */
    exportToFile(data) {
        const content = this.generateExportContent(data);
        const filename = this.generateFileName(data);
        
        this.downloadFile(content, filename);
    },

    /**
     * 生成导出文件内容
     * @param {Object} data - 数据对象
     * @returns {string} 文件内容
     */
    generateExportContent(data) {
        const date = data.date || DataStore.getTodayDate();
        
        // 在历史模式下，从历史数据中获取准确的词单内容
        let reviewWords, newWords;
        if (data.reviewWords && data.newWords) {
            reviewWords = data.reviewWords;
            newWords = data.newWords;
        } else {
            // 检查是否正在历史只读模式
            if (window.WordManager && WordManager._isReadOnly) {
                const historyData = DataStore.loadHistory(date);
                reviewWords = historyData?.reviewWords || WordManager.wordList.reviewWords;
                newWords = historyData?.newWords || WordManager.wordList.newWords;
            } else {
                reviewWords = WordManager.wordList.reviewWords;
                newWords = WordManager.wordList.newWords;
            }
        }
        
        const text = data.text || TextRenderer.currentText?.rawContent || '';
        const version = data.version || TextRenderer.currentVersion;
        const mode = data.mode || document.getElementById('generateMode').value;
        
        let content = `单词段落生成工具 - 归档文件
生成日期: ${date}
版本: ${version}
生成模式: ${mode === 'english' ? '纯英文段落' : '中文主线叙事'}

========================================
词单信息
========================================

复习词 (${reviewWords.length}个):
${reviewWords.join(', ')}

新词 (${newWords.length}个):
${newWords.join(', ')}

========================================
生成文本
========================================

${text}

========================================
单词状态标记
========================================

`;
        
        // 添加单词状态
        const allWords = [...reviewWords, ...newWords];
        const wordDetails = WordManager.wordList.wordDetails;
        
        for (const word of allWords) {
            const detail = wordDetails[word] || {};
            content += `${word}: ${detail.status || '待复习'}\n`;
        }
        
        return content;
    },

    /**
     * 生成文件名
     * @param {Object} data - 数据对象
     * @returns {string} 文件名
     */
    generateFileName(data) {
        const date = data.date || DataStore.getTodayDate();
        const reviewCount = data.reviewCount || WordManager.wordList.reviewWords.length;
        const newCount = data.newCount || WordManager.wordList.newWords.length;
        const version = data.version || TextRenderer.currentVersion;
        
        return `${date}_复习词${reviewCount}+新词${newCount}_版本${version}.txt`;
    },

    /**
     * 触发文件下载
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     */
    downloadFile(content, filename) {
        // 创建Blob
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        
        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        InteractionManager.showToast(`文件已保存: ${filename}`, 'success');
    },

    /**
     * 导出当前状态
     * 只导出已收藏的页面
     */
    exportCurrent() {
        if (!TextRenderer.currentText || !TextRenderer.currentText.text) {
            InteractionManager.showToast('暂无文本可导出', 'warning');
            return;
        }

        const starredPages = TextRenderer.currentText.starredPages || [];
        const starredIndices = starredPages
            .map((starred, index) => (starred ? index : -1))
            .filter(i => i !== -1);

        if (starredIndices.length === 0) {
            InteractionManager.showToast('请先收藏要保存的页面', 'warning');
            return;
        }

        // 只提取已收藏页面的原文（rawContent 按 \n\n 分割）
        const rawParagraphs = (TextRenderer.currentText.rawContent || '').split(/\n\n+/);
        const starredContent = starredIndices
            .map(i => rawParagraphs[i] || '')
            .filter(p => p.trim())
            .join('\n\n');

        // 同步 starredPages 到 DataStore（保留收藏状态）
        DataStore.saveCurrentText(TextRenderer.currentText);

        const data = {
            date: DataStore.getTodayDate(),
            reviewWords: WordManager.wordList.reviewWords,
            newWords: WordManager.wordList.newWords,
            text: starredContent,
            version: TextRenderer.currentVersion,
            mode: TextRenderer.currentText.mode
        };

        // 同时保存到历史记录（复习用）
        DataStore.addSentenceToHistory(data.date, {
            text: data.text,
            mode: data.mode,
            timestamp: new Date().toISOString()
        });

        this.exportToFile(data);
    },

    /**
     * 导出历史记录
     * @param {string} date - 日期
     * @param {number} version - 版本号
     */
    exportHistory(date, version) {
        const history = DataStore.getHistoryByDate(date);
        
        if (!history) {
            InteractionManager.showToast('未找到历史记录', 'error');
            return;
        }
        
        const versionData = history.versions?.find(v => v.version === version);
        
        if (!versionData) {
            InteractionManager.showToast('未找到该版本', 'error');
            return;
        }
        
        const data = {
            date: date,
            reviewWords: history.reviewWords,
            newWords: history.newWords,
            text: versionData.text,
            version: version,
            mode: versionData.mode
        };
        
        this.exportToFile(data);
    }
};

// 导出模块
window.FileExport = FileExport;