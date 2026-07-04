const fs = require('fs');
const path = require('path');
const base = 'h:/IT/单词化句/vocab-reading-generator';

console.log('=== Round 2: Cross-module API Consistency ===\n');

let pass = true;

// 1. Check vocabLearning cross-module references
const vl = fs.readFileSync(base + '/js/vocabLearning.js', 'utf8');
const refs = [
    ['DictationPractice.init', 'DictationPractice.init'],
    ['DictationPractice.start', 'DictationPractice.start'],
    ['DictationPractice.getSettingsForDictation', 'DictationPractice.getSettingsForDictation'],
    ['PracticeModes.init', 'PracticeModes.init'],
    ['PracticeModes.start', 'PracticeModes.start'],
    ['LearningEngine.getWordList', 'LearningEngine.getWordList'],
    ['VocabDictionary', 'VocabDictionary']
];
for (const [pattern, label] of refs) {
    if (!vl.includes(pattern)) {
        console.log('FAIL: vocabLearning missing ' + label);
        pass = false;
    }
}
console.log('PASS: vocabLearning cross-module references');

// 2. Check dictationPractice
const dp = fs.readFileSync(base + '/js/dictationPractice.js', 'utf8');
if (dp.includes('LearningEngine')) console.log('PASS: dictationPractice uses LearningEngine');
else { console.log('FAIL: dictationPractice missing LearningEngine'); pass = false; }

// 3. Check vocabDictionary
const vd = fs.readFileSync(base + '/js/vocabDictionary.js', 'utf8');
if (vd.includes('VocabSearch')) console.log('PASS: vocabDictionary uses VocabSearch');
else { console.log('FAIL: vocabDictionary missing VocabSearch'); pass = false; }

// 4. Check app.js
const app = fs.readFileSync(base + '/js/app.js', 'utf8');
const inits = ['LearningEngine.init', 'VocabLearning.init', 'VocabDictionary.init'];
for (const init of inits) {
    if (!app.includes(init)) {
        console.log('FAIL: app.js missing ' + init);
        pass = false;
    }
}
console.log('PASS: app.js has all initializations');

// 5. Check script ordering in HTML
const html = fs.readFileSync(base + '/index.html', 'utf8');
const scriptPattern = /src="js\/(\w+)\.js"/g;
let match;
const scripts = [];
while ((match = scriptPattern.exec(html)) !== null) {
    scripts.push(match[1]);
}

const expectedOrder = [
    'userManager', 'config', 'dataStore', 'vocabSearch', 'wordManage',
    'apiRequest', 'textRender', 'interaction', 'fileExport', 'localGenerator',
    'templateManager', 'vocabBook', 'dataManager', 'settingsManager',
    'pastPapers', 'translation', 'writing', 'pastPaperReader', 'clozeExercise',
    'longSentence', 'learningEngine', 'vocabLearning', 'dictationPractice',
    'practiceModes', 'vocabDictionary', 'app'
];

let orderOk = true;
let lastIdx = -1;
for (const expected of expectedOrder) {
    const foundIdx = scripts.indexOf(expected);
    if (foundIdx === -1) {
        console.log('FAIL: missing script ' + expected + '.js');
        orderOk = false;
    } else if (foundIdx < lastIdx) {
        console.log('ORDER FAIL: ' + expected + '.js at position ' + foundIdx + ' but expected after ' + scripts[lastIdx] + '.js at ' + lastIdx);
        orderOk = false;
    } else {
        lastIdx = foundIdx;
    }
}
if (orderOk) console.log('PASS: script loading order is correct (' + scripts.length + ' scripts)');

if (pass && orderOk) {
    console.log('\n✓ Round 2 passed! All cross-module dependencies verified.');
} else {
    console.log('\n✗ Round 2 failed!');
    process.exit(1);
}
