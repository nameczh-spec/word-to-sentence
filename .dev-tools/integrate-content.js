/**
 * 整合md文件中的翻译和作文数据到JSON文件
 * 
 * 源文件：语料库/*.md
 * 目标文件：vocab-lib/pastpapers/*.json（3个位置）
 */

const fs = require('fs');
const path = require('path');

// 路径配置
const MD_DIR = 'H:\\IT\\单词化句\\语料库';
const JSON_DIRS = [
    'h:\\IT\\单词化句\\vocab-reading-generator\\vocab-lib\\pastpapers',
    'h:\\IT\\单词化句\\vocab-reading-generator-mobile\\vocab-lib\\pastpapers',
    'h:\\IT\\单词化句\\vocab-reading-generator-mobile\\www\\vocab-lib\\pastpapers'
];

// 年份列表
const YEARS = [
    '2000-1', '2001-1', '2002-1', '2003-1', '2004-1', '2005-1', '2006-1', '2007-1', '2008-1', '2009-1',
    '2010-1', '2010-2', '2011-1', '2011-2', '2012-1', '2012-2', '2013-1', '2013-2', '2014-1', '2014-2',
    '2015-1', '2015-2', '2016-1', '2016-2', '2017-1', '2017-2', '2018-1', '2018-2', '2019-1', '2019-2',
    '2020-1', '2020-2', '2021-1', '2021-2', '2022-1', '2022-2', '2023-1', '2023-2', '2024-1', '2024-2',
    '2025-1', '2025-2'
];

/**
 * 解析md文件，提取翻译和作文数据
 */
function parseMdFile(mdPath) {
    const content = fs.readFileSync(mdPath, 'utf-8');
    
    // 提取翻译数据
    const translationMatch = content.match(/translationDB\s*=\s*\{[^}]*"([^"]+)"[^}]*sentences:\s*\[([\s\S]*?)\]\s*\}/);
    const translationData = [];
    
    if (translationMatch) {
        const sentencesStr = translationMatch[2];
        // 解析每个句子
        const sentenceRegex = /\{\s*num:\s*(\d+),\s*original:\s*"([^"]+)",\s*translation:\s*"([^"]+)",\s*analysis:\s*`([^`]+)`\s*\}/g;
        let match;
        while ((match = sentenceRegex.exec(sentencesStr)) !== null) {
            translationData.push({
                num: parseInt(match[1]),
                original: match[2],
                translation: match[3],
                analysis: match[4]
            });
        }
    }
    
    // 提取作文数据
    const writingMatch = content.match(/'([^']+)':\s*\{([\s\S]*?)\},\s*`/);
    const writingData = { partA: null, partB: null };
    
    if (writingMatch) {
        const writingStr = writingMatch[2];
        
        // 解析Part A
        const partAMatch = writingStr.match(/partA:\s*\{([^}]*samples:\s*\[\{[^}]*text:\s*`([^`]+)`[^}]*note:\s*'([^']*)'[^}]*\}\][^}]*tips:\s*\{[^}]*\}[^}]*)\}/);
        if (partAMatch) {
            const partAContent = partAMatch[1];
            const titleMatch = partAContent.match(/title:\s*'([^']+)'/);
            const transMatch = partAContent.match(/translation:\s*'([^']+)'/);
            const tipsMatch = partAContent.match(/tips:\s*\{([^}]+)\}/);
            
            writingData.partA = {
                title: titleMatch ? titleMatch[1] : '',
                translation: transMatch ? transMatch[1] : '',
                samples: [{
                    text: partAMatch[2],
                    note: partAMatch[3]
                }],
                tips: tipsMatch ? parseTips(tipsMatch[1]) : {}
            };
        }
        
        // 解析Part B
        const partBMatch = writingStr.match(/partB:\s*\{([^}]*samples:\s*\[\{[^}]*text:\s*`([^`]+)`[^}]*note:\s*'([^']*)'[^}]*\}\][^}]*tips:\s*\{[^}]*\}[^}]*)\}/);
        if (partBMatch) {
            const partBContent = partBMatch[1];
            const titleMatch = partBContent.match(/title:\s*'([^']+)'/);
            const transMatch = partBContent.match(/translation:\s*'([^']+)'/);
            const typeMatch = partBContent.match(/type:\s*'([^']+)'/);
            const tipsMatch = partBContent.match(/tips:\s*\{([^}]+)\}/);
            
            writingData.partB = {
                title: titleMatch ? titleMatch[1] : '',
                translation: transMatch ? transMatch[1] : '',
                type: typeMatch ? typeMatch[1] : 'picture',
                samples: [{
                    text: partBMatch[2],
                    note: partBMatch[3]
                }],
                tips: tipsMatch ? parseTips(tipsMatch[1]) : {}
            };
        }
    }
    
    return { translationData, writingData };
}

/**
 * 解析tips对象
 */
function parseTips(tipsStr) {
    const tips = {};
    
    const typeMatch = tipsStr.match(/type:\s*'([^']+)'/);
    if (typeMatch) tips.type = typeMatch[1];
    
    const structureMatch = tipsStr.match(/structure:\s*\[([^\]]+)\]/);
    if (structureMatch) {
        tips.structure = structureMatch[1].split(',').map(s => s.trim().replace(/'/g, '').replace(/"/g, ''));
    }
    
    const phrasesMatch = tipsStr.match(/commonPhrases:\s*\[([^\]]+)\]/);
    if (phrasesMatch) {
        tips.commonPhrases = phrasesMatch[1].split(',').map(s => s.trim().replace(/'/g, '').replace(/"/g, ''));
    }
    
    const exprMatch = tipsStr.match(/keyExpressions:\s*\[([^\]]+)\]/);
    if (exprMatch) {
        tips.keyExpressions = exprMatch[1].split(',').map(s => s.trim().replace(/'/g, '').replace(/"/g, ''));
    }
    
    const notesMatch = tipsStr.match(/notes:\s*'([^']+)'/);
    if (notesMatch) tips.notes = notesMatch[1];
    
    return tips;
}

/**
 * 更新JSON文件
 */
function updateJsonFile(jsonPath, translationData, writingData) {
    try {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        
        // 更新翻译数据
        if (translationData.length > 0) {
            const translationSection = jsonData.sections.find(s => s.type === 'translation');
            if (translationSection && translationSection.sentences) {
                translationSection.sentences.forEach(sentence => {
                    const matchData = translationData.find(t => t.num === sentence.num);
                    if (matchData) {
                        sentence.translation = matchData.translation;
                        sentence.analysis = matchData.analysis;
                    }
                });
            }
        }
        
        // 更新作文数据
        if (writingData.partA || writingData.partB) {
            const writingSection = jsonData.sections.find(s => s.type === 'writing');
            if (writingSection) {
                if (writingData.partA) {
                    writingSection.partA = writingData.partA;
                }
                if (writingData.partB) {
                    writingSection.partB = writingData.partB;
                }
            }
        }
        
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
        return true;
    } catch (err) {
        console.error(`Error updating ${jsonPath}:`, err.message);
        return false;
    }
}

// 年份映射：md文件名 -> JSON文件名
const YEAR_MAP = {
    '2000-1': '2000',
    '2001-1': '2001',
    '2002-1': '2002',
    '2003-1': '2003',
    '2004-1': '2004',
    '2005-1': '2005',
    '2006-1': '2006',
    '2007-1': '2007',
    '2008-1': '2008',
    '2009-1': '2009'
};

// 获取JSON文件名
function getJsonFileName(mdYear) {
    return YEAR_MAP[mdYear] || mdYear;
}

// 主流程
console.log('开始整合数据...');
let successCount = 0;
let failCount = 0;

YEARS.forEach(year => {
    const mdPath = path.join(MD_DIR, `${year}.md`);
    const jsonFileName = getJsonFileName(year);
    
    if (!fs.existsSync(mdPath)) {
        console.log(`MD文件不存在: ${mdPath}`);
        return;
    }
    
    const { translationData, writingData } = parseMdFile(mdPath);
    
    if (translationData.length === 0 && !writingData.partA && !writingData.partB) {
        console.log(`文件无数据: ${year}`);
        return;
    }
    
    console.log(`处理 ${year}(${jsonFileName}): 翻译${translationData.length}句, 作文PartA=${!!writingData.partA}, PartB=${!!writingData.partB}`);
    
    JSON_DIRS.forEach(jsonDir => {
        const jsonPath = path.join(jsonDir, `${jsonFileName}.json`);
        if (fs.existsSync(jsonPath)) {
            if (updateJsonFile(jsonPath, translationData, writingData)) {
                successCount++;
            } else {
                failCount++;
            }
        } else {
            console.log(`JSON文件不存在: ${jsonPath}`);
        }
    });
});

console.log(`\n处理完成: 成功${successCount}个, 失败${failCount}个`);