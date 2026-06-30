/**
 * TemplateManager - 模板导入管理器
 * 允许用户在设置中导入/删除自定义模板 JSON 文件
 * 导入的模板保存在 localStorage，刷新不丢失
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'vocabtool_custom_templates';

    var TemplateManager = {
        /**
         * 获取所有已导入的模板
         * @returns {Array} [{ topic, description, skeletons }]
         */
        getAll: function () {
            try {
                var raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                return [];
            }
        },

        /**
         * 获取所有已导入骨架（扁平数组，用于合并到 SKELETONS）
         * @returns {Array} [{ text, slots, topic }]
         */
        getAllSkeletons: function () {
            var templates = this.getAll();
            var result = [];
            for (var i = 0; i < templates.length; i++) {
                var t = templates[i];
                if (t.skeletons && Array.isArray(t.skeletons)) {
                    for (var j = 0; j < t.skeletons.length; j++) {
                        result.push({
                            text: t.skeletons[j].text,
                            slots: t.skeletons[j].slots || [],
                            topic: t.topic || 'custom'
                        });
                    }
                }
            }
            return result;
        },

        /**
         * 验证并导入模板
         * @param {Object} data - 解析后的 JSON 对象
         * @param {boolean} skipConfirm - 是否跳过覆盖确认（批量导入时使用）
         * @returns {Object} { success, error, isDuplicate }
         */
        import: function (data, skipConfirm) {
            // 验证基本结构
            if (!data || typeof data !== 'object') {
                return { success: false, error: '无效的 JSON 格式' };
            }
            if (!data.topic || typeof data.topic !== 'string') {
                return { success: false, error: '缺少 "topic" 字段，或格式不正确' };
            }
            if (!data.skeletons || !Array.isArray(data.skeletons) || data.skeletons.length === 0) {
                return { success: false, error: '缺少 "skeletons" 数组，或为空' };
            }

            // 验证每条骨架
            for (var i = 0; i < data.skeletons.length; i++) {
                var sk = data.skeletons[i];
                if (!sk.text || typeof sk.text !== 'string') {
                    return { success: false, error: '第 ' + (i + 1) + ' 条骨架缺少 "text" 字段' };
                }
                if (!sk.slots || !Array.isArray(sk.slots) || sk.slots.length === 0) {
                    return { success: false, error: '第 ' + (i + 1) + ' 条骨架缺少 "slots" 数组' };
                }
                for (var j = 0; j < sk.slots.length; j++) {
                    if (!sk.slots[j].pos || !sk.slots[j].pos.match(/^(n|v|adj|adv|Name|term|num)$/)) {
                        return { success: false, error: '第 ' + (i + 1) + ' 条骨架 slots[' + j + '].pos 格式错误（应为 n/v/adj/adv/Name/term/num）' };
                    }
                    // 验证 form 值（兼容简写：ing, 3）
                    if (sk.slots[j].form && !sk.slots[j].form.match(/^(base|past|pp|3sg|gerund|ing|3)$/)) {
                        return { success: false, error: '第 ' + (i + 1) + ' 条骨架 slots[' + j + '].form 值无效（应为 base/past/pp/3sg/gerund/ing/3）' };
                    }
                }
            }

            // 验证通过，导入
            var existing = this.getAll();

            // 检查是否已存在同名主题
            var dupIndex = -1;
            for (var k = 0; k < existing.length; k++) {
                if (existing[k].topic === data.topic) {
                    dupIndex = k;
                    break;
                }
            }

            if (dupIndex !== -1) {
                // 覆盖确认（批量导入时跳过，由上层统一处理）
                if (!skipConfirm && !confirm('模板主题 "' + data.topic + '" 已存在，是否覆盖？')) {
                    return { success: false, error: '用户取消', isDuplicate: true };
                }
                existing[dupIndex] = data;
            } else {
                existing.push(data);
            }

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
            } catch (e) {
                return { success: false, error: '存储失败（localStorage 可能已满）' };
            }

            this.refreshUI();
            return { success: true, count: data.skeletons.length, isDuplicate: dupIndex !== -1 };
        },

        /**
         * 删除一个导入的模板
         * @param {string} topic - 主题名称
         */
        remove: function (topic) {
            var existing = this.getAll();
            var filtered = [];
            for (var i = 0; i < existing.length; i++) {
                if (existing[i].topic !== topic) {
                    filtered.push(existing[i]);
                }
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            this.refreshUI();
        },

        /**
         * 刷新界面上的模板列表
         */
        refreshUI: function () {
            var templates = this.getAll();
            var section = document.getElementById('importedTemplatesSection');
            var list = document.getElementById('importedTemplateList');
            var emptyHint = document.getElementById('templateListEmptyHint');

            if (!list) return;

            if (templates.length === 0) {
                if (section) section.style.display = 'none';
                return;
            }

            if (section) section.style.display = '';
            if (emptyHint) emptyHint.style.display = 'none';

            list.innerHTML = '';
            for (var i = 0; i < templates.length; i++) {
                var t = templates[i];
                var item = document.createElement('div');
                item.className = 'imported-template-item';
                item.innerHTML =
                    '<div class="template-item-info">' +
                        '<span class="template-item-name">' + this._escapeHtml(t.topic) + '</span>' +
                        '<span class="template-item-count">' + (t.skeletons ? t.skeletons.length : 0) + ' 条骨架</span>' +
                    '</div>' +
                    '<button class="template-item-delete" data-topic="' + this._escapeHtml(t.topic) + '">删除</button>';
                list.appendChild(item);
            }

            // 绑定删除事件
            var delBtns = list.querySelectorAll('.template-item-delete');
            for (var j = 0; j < delBtns.length; j++) {
                delBtns[j].addEventListener('click', function () {
                    if (confirm('确定删除模板 "' + this.getAttribute('data-topic') + '" 吗？')) {
                        TemplateManager.remove(this.getAttribute('data-topic'));
                    }
                });
            }
        },

        _escapeHtml: function (str) {
            var div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        }
    };

    // 暴露到全局
    window.TemplateManager = TemplateManager;

    // 页面加载后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTemplateManager);
    } else {
        initTemplateManager();
    }

    function initTemplateManager() {
        // 导入按钮
        var importBtn = document.getElementById('importTemplateBtn');
        var fileInput = document.getElementById('templateFileInput');

        if (importBtn && fileInput) {
            importBtn.addEventListener('click', function () {
                fileInput.click();
            });

            fileInput.addEventListener('change', function (e) {
                var files = e.target.files;
                if (!files || files.length === 0) return;

                var totalSuccess = 0;
                var totalSkels = 0;
                var errors = [];
                var duplicates = []; // 收集重复项
                var skipped = []; // 跳过的非模板文件

                // 过滤掉非模板文件（以下划线开头的是系统文件，如 _files.json）
                var validFiles = [];
                for (var fi = 0; fi < files.length; fi++) {
                    var fName = files[fi].name;
                    if (fName.charAt(0) === '_' || fName === '_files.json') {
                        skipped.push(fName);
                    } else {
                        validFiles.push(files[fi]);
                    }
                }

                if (validFiles.length === 0) {
                    var skipMsg = '没有可导入的模板文件。';
                    skipMsg += '\n\n注意：以下划线 "_" 开头的文件（如 _files.json）是系统文件，不会导入。';
                    skipMsg += '\n请选择主题模板文件（如 science.json, technology.json 等）。';
                    alert(skipMsg);
                    fileInput.value = '';
                    return;
                }

                var remaining = validFiles.length;

                for (var fi2 = 0; fi2 < validFiles.length; fi2++) {
                    (function (file) {
                        var reader = new FileReader();
                        reader.onload = function (ev) {
                            try {
                                var data = JSON.parse(ev.target.result);
                                // 先验证，不导入（跳过确认）
                                var result = TemplateManager.import(data, true);
                                if (result.success) {
                                    totalSuccess++;
                                    totalSkels += result.count;
                                    if (result.isDuplicate) {
                                        duplicates.push(data.topic);
                                    }
                                } else if (result.isDuplicate) {
                                    // 重复但用户可能想确认，记录下来
                                    duplicates.push(data.topic);
                                } else {
                                    errors.push(file.name + ': ' + result.error);
                                }
                            } catch (parseErr) {
                                errors.push(file.name + ': JSON解析失败');
                            }
                            remaining--;
                            if (remaining === 0) {
                                // 所有文件处理完毕
                                var msg = '导入完成：成功 ' + totalSuccess + ' 个文件，共 ' + totalSkels + ' 条骨架';
                                if (duplicates.length > 0) {
                                    msg += '\n\n以下主题已存在并覆盖：' + duplicates.join(', ');
                                }
                                if (skipped.length > 0) {
                                    msg += '\n\n跳过 ' + skipped.length + ' 个系统文件：' + skipped.join(', ');
                                }
                                if (errors.length > 0) {
                                    msg += '\n\n失败 ' + errors.length + ' 个：\n' + errors.join('\n');
                                }
                                alert(msg);
                            }
                        };
                        reader.readAsText(file);
                    })(validFiles[fi2]);
                }

                // 重置 input 以便重复选择
                fileInput.value = '';
            });
        }

        // 加载已有的模板
        TemplateManager.refreshUI();
    }

})();
