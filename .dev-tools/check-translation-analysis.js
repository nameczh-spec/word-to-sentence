const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'vocab-reading-generator', 'vocab-lib', 'pastpapers');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

let totalMissing = 0;
let totalSentences = 0;
const missingByYear = [];
const noTranslation = [];

files.forEach(file => {
    const paper = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    const translationSection = paper.sections ? paper.sections.find(s => s.type === 'translation') : null;
    if (translationSection && translationSection.sentences) {
        const sentences = translationSection.sentences;
        const missing = sentences.filter(s => !s.analysis || s.analysis.trim() === '');
        totalSentences += sentences.length;
        totalMissing += missing.length;
        if (missing.length > 0) {
            missingByYear.push({
                file: file,
                total: sentences.length,
                missing: missing.length,
                missingNums: missing.map(s => s.num)
            });
        }
    } else {
        noTranslation.push(file);
    }
});

console.log('=== 翻译analysis完整性检查 ===');
console.log('总文件数:', files.length);
console.log('有翻译的文件数:', files.length - noTranslation.length);
console.log('总句子数:', totalSentences);
console.log('缺失analysis的句子数:', totalMissing);
console.log('');

if (noTranslation.length > 0) {
    console.log('没有翻译部分的年份:');
    noTranslation.forEach(f => console.log('  ' + f));
    console.log('');
}

if (missingByYear.length > 0) {
    console.log('缺失analysis的年份:');
    missingByYear.forEach(item => {
        console.log('  ' + item.file + ': ' + item.missing + '/' + item.total + ' 句缺失, 编号: [' + item.missingNums.join(', ') + ']');
    });
} else {
    console.log('✅ 所有翻译analysis都已填充');
}
