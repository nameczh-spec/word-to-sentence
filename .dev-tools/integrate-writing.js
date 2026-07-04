/**
 * 整合md文件中的sampleData到writing.js
 *
 * 源文件：语料库/*.md 的"## 二、作文模块"部分
 * 目标文件：3个writing.js的sampleData对象（第14-153行）
 *
 * 策略：
 *   1. 从每个md提取sampleData代码块（原始文本）
 *   2. 用 new Function 求值验证语法正确性
 *   3. 验证数据完整性（partA/partB结构、samples非空、tips存在）
 *   4. 拼接所有年份代码块，保留原始格式
 *   5. 替换writing.js的sampleData部分（第14-153行）
 *   6. 同步到3个writing.js文件
 */

const fs = require('fs');
const path = require('path');

const MD_DIR = 'H:\\IT\\单词化句\\语料库';
const WRITING_JS_FILES = [
    'h:\\IT\\单词化句\\vocab-reading-generator\\js\\writing.js',
    'h:\\IT\\单词化句\\vocab-reading-generator-mobile\\js\\writing.js',
    'h:\\IT\\单词化句\\vocab-reading-generator-mobile\\www\\js\\writing.js'
];

// 年份顺序：从新到旧（与现有writing.js一致）
const YEARS = [
    '2025-2', '2025-1',
    '2024-2', '2024-1',
    '2023-2', '2023-1',
    '2022-2', '2022-1',
    '2021-2', '2021-1',
    '2020-2', '2020-1',
    '2019-2', '2019-1',
    '2018-2', '2018-1',
    '2017-2', '2017-1',
    '2016-2', '2016-1',
    '2015-2', '2015-1',
    '2014-2', '2014-1',
    '2013-2', '2013-1',
    '2012-2', '2012-1',
    '2011-2', '2011-1',
    '2010-2', '2010-1',
    '2009-1', '2008-1', '2007-1', '2006-1', '2005-1',
    '2004-1', '2003-1', '2002-1', '2001-1', '2000-1'
];

/**
 * 从md文件提取sampleData代码块原始文本
 */
function extractSampleDataCode(mdPath) {
    const content = fs.readFileSync(mdPath, 'utf-8');
    const marker = '## 二、作文模块';
    const markerIdx = content.indexOf(marker);
    if (markerIdx === -1) return { error: '缺少作文模块标记' };

    // 找到 ```javascript
    const codeStart = content.indexOf('```javascript', markerIdx);
    if (codeStart === -1) return { error: '缺少javascript代码块' };

    // 代码内容开始（```javascript 之后换行）
    const codeContentStart = content.indexOf('\n', codeStart) + 1;

    // 找到闭合的 ```
    const codeEnd = content.indexOf('\n```', codeContentStart);
    if (codeEnd === -1) return { error: '代码块未闭合' };

    const code = content.substring(codeContentStart, codeEnd).trim();
    return { code };
}

/**
 * 求值代码块为JS对象（验证语法）
 */
function evalSampleData(code) {
    try {
        const obj = new Function('return { ' + code + ' }')();
        return { data: obj };
    } catch (err) {
        return { error: err.message };
    }
}

/**
 * 验证单个年份的数据完整性
 */
function validateYearData(yearKey, yearData) {
    const issues = [];

    if (!yearData) {
        return ['数据为空'];
    }

    // 至少要有partA或partB
    if (!yearData.partA && !yearData.partB) {
        return ['缺少partA和partB'];
    }

    // 检查partA
    if (yearData.partA) {
        const pa = yearData.partA;
        if (!pa.title) issues.push('partA缺title');
        if (!pa.translation) issues.push('partA缺translation');
        if (!pa.samples || pa.samples.length === 0) {
            issues.push('partA缺samples');
        } else {
            pa.samples.forEach((s, i) => {
                if (!s.text || s.text.length < 20) issues.push(`partA sample[${i}] text过短`);
                if (!s.note) issues.push(`partA sample[${i}] 缺note`);
            });
        }
        if (!pa.tips) {
            issues.push('partA缺tips');
        } else {
            if (!pa.tips.type) issues.push('partA tips缺type');
            if (!pa.tips.structure || pa.tips.structure.length === 0) issues.push('partA tips缺structure');
            if (!pa.tips.commonPhrases || pa.tips.commonPhrases.length === 0) issues.push('partA tips缺commonPhrases');
            if (!pa.tips.notes) issues.push('partA tips缺notes');
        }
    }

    // 检查partB
    if (yearData.partB) {
        const pb = yearData.partB;
        if (!pb.title) issues.push('partB缺title');
        if (!pb.translation) issues.push('partB缺translation');
        if (!pb.type) issues.push('partB缺type');
        if (!pb.samples || pb.samples.length === 0) {
            issues.push('partB缺samples');
        } else {
            pb.samples.forEach((s, i) => {
                if (!s.text || s.text.length < 20) issues.push(`partB sample[${i}] text过短`);
                if (!s.note) issues.push(`partB sample[${i}] 缺note`);
            });
        }
        if (!pb.tips) {
            issues.push('partB缺tips');
        } else {
            if (!pb.tips.type) issues.push('partB tips缺type');
            if (!pb.tips.structure || pb.tips.structure.length === 0) issues.push('partB tips缺structure');
            if (!pb.tips.keyExpressions || pb.tips.keyExpressions.length === 0) issues.push('partB tips缺keyExpressions');
            if (!pb.tips.notes) issues.push('partB tips缺notes');
        }
    }

    return issues;
}

/**
 * 主流程
 */
function main() {
    console.log('=== 作文sampleData整合脚本 ===\n');

    const collected = []; // {year, yearKey, code, data, issues}
    const failed = [];

    // 1. 提取并验证所有md
    YEARS.forEach(year => {
        const mdPath = path.join(MD_DIR, `${year}.md`);
        if (!fs.existsSync(mdPath)) {
            failed.push({ year, error: 'md文件不存在' });
            return;
        }

        const extractResult = extractSampleDataCode(mdPath);
        if (extractResult.error) {
            failed.push({ year, error: extractResult.error });
            return;
        }

        const evalResult = evalSampleData(extractResult.code);
        if (evalResult.error) {
            failed.push({ year, error: '语法错误: ' + evalResult.error });
            return;
        }

        const data = evalResult.data;
        const yearKeys = Object.keys(data);
        if (yearKeys.length === 0) {
            failed.push({ year, error: '空对象' });
            return;
        }

        const yearKey = yearKeys[0];
        const yearData = data[yearKey];
        const issues = validateYearData(yearKey, yearData);

        collected.push({
            year,
            yearKey,
            code: extractResult.code,
            data: yearData,
            issues
        });
    });

    // 2. 输出提取结果
    console.log(`提取结果: 成功 ${collected.length} / ${YEARS.length}，失败 ${failed.length}\n`);

    if (failed.length > 0) {
        console.log('❌ 失败列表:');
        failed.forEach(f => console.log(`  ${f.year}: ${f.error}`));
        console.log('');
    }

    // 3. 输出验证问题
    const withIssues = collected.filter(c => c.issues.length > 0);
    if (withIssues.length > 0) {
        console.log('⚠️ 数据完整性问题:');
        withIssues.forEach(c => {
            console.log(`  ${c.year}:`);
            c.issues.forEach(i => console.log(`    - ${i}`));
        });
        console.log('');
    }

    // 4. 如果有失败，停止
    if (failed.length > 0) {
        console.log('❌ 存在失败项，停止处理。请先修复失败的md文件。');
        return;
    }

    // 5. 生成新的sampleData代码
    // 注意：反引号字符串内部的行不能加缩进，否则会破坏字符串内容
    let newCode = '    const sampleData = {\n';
    collected.forEach((item) => {
        const lines = item.code.split('\n');
        let inBacktick = false;
        lines.forEach(line => {
            const backtickCount = (line.match(/`/g) || []).length;
            if (inBacktick) {
                // 在反引号字符串内部，保持原样不加缩进
                newCode += line + '\n';
                if (backtickCount % 2 === 1) {
                    inBacktick = false;
                }
            } else {
                // 不在反引号字符串内部，加8空格缩进
                newCode += '        ' + line + '\n';
                if (backtickCount % 2 === 1) {
                    inBacktick = true;
                }
            }
        });
    });
    newCode += '    };';

    // 6. 验证生成的代码语法
    try {
        new Function('const Writing = (() => {\n' + newCode + '\n return {}; });')();
        console.log('✅ 生成的sampleData语法验证通过\n');
    } catch (err) {
        console.log('❌ 生成的sampleData语法错误: ' + err.message);
        return;
    }

    // 7. 替换3个writing.js文件
    WRITING_JS_FILES.forEach(jsPath => {
        if (!fs.existsSync(jsPath)) {
            console.log(`⚠️ 文件不存在: ${jsPath}`);
            return;
        }

        const content = fs.readFileSync(jsPath, 'utf-8');
        const lines = content.split('\n');

        // 找到 sampleData 开始和结束
        const startLineIdx = lines.findIndex(l => l.includes('const sampleData = {'));
        if (startLineIdx === -1) {
            console.log(`❌ ${jsPath}: 找不到 sampleData 声明`);
            return;
        }

        // 找到对应的 };
        let endLineIdx = -1;
        let braceCount = 0;
        for (let i = startLineIdx; i < lines.length; i++) {
            const line = lines[i];
            for (const ch of line) {
                if (ch === '{') braceCount++;
                else if (ch === '}') braceCount--;
            }
            if (braceCount === 0 && i > startLineIdx) {
                endLineIdx = i;
                break;
            }
        }

        if (endLineIdx === -1) {
            console.log(`❌ ${jsPath}: 找不到 sampleData 结束`);
            return;
        }

        // 替换
        const before = lines.slice(0, startLineIdx).join('\n');
        const after = lines.slice(endLineIdx + 1).join('\n');
        const newContent = before + '\n' + newCode + '\n' + after;

        fs.writeFileSync(jsPath, newContent, 'utf-8');
        console.log(`✅ 已更新: ${jsPath} (替换第${startLineIdx + 1}-${endLineIdx + 1}行)`);
    });

    // 8. 统计
    console.log('\n=== 整合统计 ===');
    console.log(`总年份数: ${collected.length}`);
    console.log(`有partA: ${collected.filter(c => c.data.partA).length}`);
    console.log(`有partB: ${collected.filter(c => c.data.partB).length}`);
    console.log(`数据完整(无issues): ${collected.filter(c => c.issues.length === 0).length}`);
    console.log(`有issues: ${collected.filter(c => c.issues.length > 0).length}`);
}

main();
