const fs = require("fs");
const path = require("path");

const JSON_DIR = "H:\\IT\\单词化句\\vocab-reading-generator\\vocab-lib\\pastpapers";
const IMG_DIR = "H:\\IT\\单词化句\\vocab-reading-generator\\images\\writing";

const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith(".json") && f !== "index.json");
let validCount = 0, errorCount = 0;
let totalTransSentences = 0, totalWritingSections = 0;
let issues = [];

files.forEach(f => {
    const filePath = path.join(JSON_DIR, f);
    try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        validCount++;

        // Check sections
        if (!data.sections || !Array.isArray(data.sections)) {
            issues.push(`${f}: 缺少sections数组`);
            return;
        }

        // Check translation
        const trans = data.sections.find(s => s.type === "translation");
        if (trans) {
            if (trans.sentences && Array.isArray(trans.sentences)) {
                const total = trans.sentences.length;
                const withTrans = trans.sentences.filter(s => s.translation && s.translation.length > 2).length;
                const withAnalysis = trans.sentences.filter(s => s.analysis && s.analysis.length > 2).length;
                totalTransSentences += total;
                if (withTrans < total) issues.push(`${f}: 翻译有${total-withTrans}句缺译文`);
                if (withAnalysis < total) issues.push(`${f}: 翻译有${total-withAnalysis}句缺解析`);
            }
        }

        // Check writing
        const writing = data.sections.find(s => s.type === "writing");
        if (writing) {
            totalWritingSections++;
            
            // Check partA
            if (writing.partA) {
                if (!writing.partA.samples || writing.partA.samples.length === 0) {
                    issues.push(`${f}: Part A缺范文`);
                }
                if (!writing.partA.tips || Object.keys(writing.partA.tips).length === 0) {
                    issues.push(`${f}: Part A缺写作技巧`);
                }
            }

            // Check partB
            if (writing.partB) {
                if (!writing.partB.samples || writing.partB.samples.length === 0) {
                    issues.push(`${f}: Part B缺范文`);
                }
                if (!writing.partB.tips || Object.keys(writing.partB.tips).length === 0) {
                    issues.push(`${f}: Part B缺写作技巧`);
                }
            }

            // Check image for partB
            const yearKey = f.replace(".json", "");
            const imgFiles = fs.readdirSync(IMG_DIR);
            const hasImage = imgFiles.some(img => img.startsWith(yearKey));
            if (!hasImage && writing.partB && writing.partB.type === "picture") {
                issues.push(`${f}: Part B缺图片(${yearKey})`);
            }
        }

        // Check translation rawText/text format consistency
        if (trans && trans.sentences) {
            trans.sentences.forEach(s => {
                if (s.rawText && typeof s.rawText === "string" && s.rawText.length > 0) {
                    issues.push(`${f}: 存在非标准rawText字段(num=${s.num})`);
                }
            });
        }

    } catch (err) {
        errorCount++;
        issues.push(`${f}: JSON解析错误 - ${err.message}`);
    }
});

// Image check - all years
const allImagePrefixes = fs.readdirSync(IMG_DIR).map(f => f.split("-partB")[0]);
const uniqueImageYears = [...new Set(allImagePrefixes)];

console.log("=== 数据格式检查报告 ===\n");
console.log(`检查文件: ${files.length} 个`);
console.log(`有效JSON: ${validCount} 个`);
console.log(`解析错误: ${errorCount} 个`);
console.log(`翻译句子总数: ${totalTransSentences} 句`);
console.log(`作文模块总数: ${totalWritingSections} 个`);
console.log(`作文图片年份: ${uniqueImageYears.length} 个`);
console.log(`\n${"=".repeat(50)}\n`);

if (issues.length === 0) {
    console.log("✅ 未发现问题 ✓");
} else {
    console.log("❌ 发现以下问题：\n");
    const grouped = {};
    issues.forEach(issue => {
        const key = issue.split(":")[0];
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(issue);
    });
    Object.keys(grouped).forEach(year => {
        console.log(`  ${year}:`);
        grouped[year].forEach(i => console.log(`    - ${i.split(":").slice(1).join(":").trim()}`));
    });
}

console.log(`\n共 ${issues.length} 个问题`);
