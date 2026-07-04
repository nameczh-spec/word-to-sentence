const fs = require("fs");
const path = require("path");

const MD_DIR = "H:\\IT\\单词化句\\语料库";
const JSON_DIR = "h:\\IT\\单词化句\\vocab-reading-generator\\vocab-lib\\pastpapers";

// Parse md file to get translation data
function parseMdTranslation(mdPath) {
    const content = fs.readFileSync(mdPath, "utf-8");
    const data = {};
    
    // Find translationDB section
    const tMatch = content.match(/sentences:\s*\[([\s\S]*?)\]\s*\}/);
    if (!tMatch) return data;
    
    const sentencesStr = tMatch[1];
    // Match each sentence object
    const regex = /\{\s*num:\s*(\d+),\s*original:\s*"([^"]*)",\s*translation:\s*"([^"]*)",\s*analysis:\s*`([^`]*)`\s*\}/g;
    let match;
    while ((match = regex.exec(sentencesStr)) !== null) {
        data[parseInt(match[1])] = {
            original: match[2],
            translation: match[3],
            analysis: match[4]
        };
    }
    return data;
}

function fixMissingTranslations(jsonPath, mdPath) {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const mdData = parseMdTranslation(mdPath);
    if (Object.keys(mdData).length === 0) return false;
    
    let fixed = false;
    const transSection = jsonData.sections.find(s => s.type === "translation");
    if (!transSection || !transSection.sentences) return false;
    
    transSection.sentences.forEach(s => {
        const mdEntry = mdData[s.num];
        if (!mdEntry) return;
        
        // Fix missing translation
        if ((!s.translation || s.translation.length < 3) && mdEntry.translation.length > 0) {
            s.translation = mdEntry.translation;
            fixed = true;
        }
        // Fix missing analysis
        if ((!s.analysis || s.analysis.length < 3) && mdEntry.analysis.length > 0) {
            s.analysis = mdEntry.analysis;
            fixed = true;
        }
    });
    
    if (fixed) {
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), "utf-8");
    }
    return fixed;
}

const yearsToFix = [
    { json: "2019-1.json", md: "2019-1.md" },
    { json: "2011-1.json", md: "2011-1.md" },
    { json: "2005.json", md: "2005-1.md" },
    { json: "2001.json", md: "2001-1.md" },
    { json: "2000.json", md: "2000-1.md" },
    { json: "2006.json", md: "2006-1.md" }
];

const targets = [
    "h:\\IT\\单词化句\\vocab-reading-generator\\vocab-lib\\pastpapers",
    "h:\\IT\\单词化句\\vocab-reading-generator-mobile\\vocab-lib\\pastpapers",
    "h:\\IT\\单词化句\\vocab-reading-generator-mobile\\www\\vocab-lib\\pastpapers"
];

let totalFixed = 0;
yearsToFix.forEach(({json, md}) => {
    const mdPath = path.join(MD_DIR, md);
    if (!fs.existsSync(mdPath)) {
        console.log(`MD文件不存在: ${md}`);
        return;
    }
    
    targets.forEach(dir => {
        const jsonPath = path.join(dir, json);
        if (fixMissingTranslations(jsonPath, mdPath)) {
            totalFixed++;
        }
    });
});

console.log(`修复完成：影响 ${totalFixed} 个JSON文件`);
