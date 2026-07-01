/**
 * 设置面板管理器
 * 处理词书管理和数据导出/导入的UI交互
 */
class SettingsManager {
    constructor() {
        this.vocabBookManager = new VocabBookManager();
        this.dataManager = new DataManager();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderVocabBookList();
    }

    bindEvents() {
        // 词书管理
        const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
        const importVocabBookBtn = document.getElementById('importVocabBookBtn');
        const vocabBookFileInput = document.getElementById('vocabBookFileInput');

        if (downloadTemplateBtn) {
            downloadTemplateBtn.addEventListener('click', () => {
                this.vocabBookManager.downloadTemplate();
                this.showToast('模板已下载');
            });
        }

        if (importVocabBookBtn && vocabBookFileInput) {
            importVocabBookBtn.addEventListener('click', () => {
                vocabBookFileInput.click();
            });

            vocabBookFileInput.addEventListener('change', (e) => {
                this.handleVocabBookImport(e);
            });
        }

        // 数据管理
        const exportDataBtn = document.getElementById('exportDataBtn');
        const importDataBtn = document.getElementById('importDataBtn');
        const dataFileInput = document.getElementById('dataFileInput');

        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.handleDataExport();
            });
        }

        if (importDataBtn && dataFileInput) {
            importDataBtn.addEventListener('click', () => {
                dataFileInput.click();
            });

            dataFileInput.addEventListener('change', (e) => {
                this.handleDataImport(e);
            });
        }

        // 清除所有数据
        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                this.handleClearAllData();
            });
        }
    }

    /**
     * 处理词书导入
     */
    handleVocabBookImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const result = this.vocabBookManager.importBook(content, file.name);

            if (result.success) {
                this.showToast(`词书「${result.book.name}」导入成功，共 ${result.book.wordCount} 个单词`);
                this.renderVocabBookList();
                // 更新侧边栏标签
                this.updateSidebarTags();
            } else {
                this.showToast(`导入失败：${result.error}`, 'error');
            }
        };
        reader.readAsText(file);

        // 清空 input，允许重复导入同一文件
        event.target.value = '';
    }

    /**
     * 渲染词书列表
     */
    renderVocabBookList() {
        const container = document.getElementById('vocabBookList');
        if (!container) return;

        const books = this.vocabBookManager.getUserBooks();

        if (books.length === 0) {
            container.innerHTML = '<div class="vocab-book-empty">暂无导入的词书</div>';
            return;
        }

        container.innerHTML = books.map(book => `
            <div class="vocab-book-item" data-book-id="${book.id}">
                <div class="vocab-book-info">
                    <div class="vocab-book-name">${this.escapeHtml(book.name)}</div>
                    <div class="vocab-book-meta">${book.wordCount} 个单词 · ${this.formatDate(book.importDate)}</div>
                </div>
                <button class="vocab-book-delete" title="删除词书" data-book-id="${book.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `).join('');

        // 绑定删除事件
        container.querySelectorAll('.vocab-book-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookId = e.currentTarget.dataset.bookId;
                this.deleteVocabBook(bookId);
            });
        });
    }

    /**
     * 删除词书
     */
    deleteVocabBook(bookId) {
        if (!confirm('确定要删除这个词书吗？删除后无法恢复。')) return;

        const result = this.vocabBookManager.deleteBook(bookId);
        if (result.success) {
            this.showToast('词书已删除');
            this.renderVocabBookList();
            this.updateSidebarTags();
        } else {
            this.showToast('删除失败：' + result.error, 'error');
        }
    }

    /**
     * 更新侧边栏标签
     */
    updateSidebarTags() {
        // 触发全局事件，通知侧边栏更新标签
        window.dispatchEvent(new CustomEvent('vocabBooksUpdated', {
            detail: { tags: this.vocabBookManager.getAllTags() }
        }));
    }

    /**
     * 处理数据导出
     */
    handleDataExport() {
        // 询问是否设置密码
        const usePassword = confirm('是否设置密码保护？\n\n设置密码后，导入时需要输入相同密码才能解密。');
        let password = null;
        if (usePassword) {
            password = prompt('请输入密码（至少4位）：');
            if (!password || password.length < 4) {
                this.showToast('密码太短，已取消密码保护', 'warning');
                password = null;
            }
        }

        const result = this.dataManager.exportData(password);
        if (result.success) {
            this.dataManager.downloadFile(result.data, result.filename);
            this.showToast(`数据已导出：${result.filename}`);
        } else {
            this.showToast('导出失败', 'error');
        }
    }

    /**
     * 处理数据导入
     */
    handleDataImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;

            // 询问是否有密码
            let password = null;
            if (confirm('这个文件是否设置了密码保护？')) {
                password = prompt('请输入密码：');
            }

            // 先尝试导入，检查是否需要合并
            let result = this.dataManager.importData(content, password, 'prompt');

            if (result.needsMerge) {
                // 弹出合并选项
                this.showMergeDialog(result.data, password);
            } else if (result.success) {
                this.showToast('数据导入成功');
                // 刷新页面以应用新数据
                setTimeout(() => location.reload(), 1500);
            } else {
                this.showToast('导入失败：' + result.error, 'error');
            }
        };
        reader.readAsText(file);

        // 清空 input
        event.target.value = '';
    }

    /**
     * 处理清除所有数据
     */
    handleClearAllData() {
        const confirmed = confirm(
            '⚠️ 警告：此操作将清除所有学习数据\n\n' +
            '包括：\n' +
            '• 所有导入的单词\n' +
            '• 历史学习记录\n' +
            '• 收藏的内容\n' +
            '• 应用设置\n\n' +
            '但会保留您的账号信息。\n\n' +
            '确定要清除吗？'
        );

        if (!confirmed) return;

        const result = this.dataManager.clearAllData();
        if (result.success) {
            this.showToast(result.message, 'success');
            // 刷新页面以应用清空后的状态
            setTimeout(() => location.reload(), 1500);
        } else {
            this.showToast(result.message, 'error');
        }
    }

    /**
     * 显示合并选项对话框
     */
    showMergeDialog(data, password) {
        const choice = confirm(
            '当前设备已有学习数据，请选择处理方式：\n\n' +
            '【确定】新数据覆盖旧数据（推荐）\n' +
            '【取消】智能合并（保留所有不重复的数据）'
        );

        const strategy = choice ? 'overwrite' : 'merge';
        const result = this.dataManager.importData(
            JSON.stringify(data),
            password,
            strategy
        );

        if (result.success) {
            this.showToast(strategy === 'overwrite' ? '数据已覆盖' : '数据已合并');
            setTimeout(() => location.reload(), 1500);
        } else {
            this.showToast('导入失败：' + result.error, 'error');
        }
    }

    /**
     * 显示 Toast 提示
     */
    showToast(message, type = 'success') {
        // 使用项目中已有的 Toast 系统，或创建简单的提示
        if (window.InteractionManager && window.InteractionManager.showToast) {
            window.InteractionManager.showToast(message, type);
        } else if (window.showToast) {
            window.showToast(message, type);
        } else {
            // 简单的 fallback
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 60px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'error' ? '#f5222d' : type === 'warning' ? '#faad14' : '#52c41a'};
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    }

    /**
     * HTML 转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 格式化日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});
