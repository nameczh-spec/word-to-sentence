const fs = require("fs");
const path = require("path");

const MD_DIR = "H:\\IT\\单词化句\\语料库";
const JSON_DIRS = [
    "h:\\IT\\单词化句\\vocab-reading-generator\\vocab-lib\\pastpapers",
    "h:\\IT\\单词化句\\vocab-reading-generator-mobile\\vocab-lib\\pastpapers",
    "h:\\IT\\单词化句\\vocab-reading-generator-mobile\\www\\vocab-lib\\pastpapers"
];

// Robust parser for md translation sentences
function extractFromMd(mdPath) {
    const content = fs.readFileSync(mdPath, "utf-8");
    const results = {};
    
    // Find the sentences array using JavaScript evaluation-like approach
    const startIdx = content.indexOf("sentences: [");
    if (startIdx === -1) return results;
    
    // Find the end of the array (matching brace depth)
    let braceDepth = 0;
    let inString = false;
    let inTemplate = false;
    let arrayStart = startIdx + 11; // after "sentences: ["
    let arrayEnd = arrayStart;
    
    // Parse the sentences array
    const sentencesMatch = content.match(/sentences:\s*\[([\s\S]*?)\]\s*\}/);
    if (!sentencesMatch) return results;
    
    const sentencesStr = sentencesMatch[1];
    
    // Find all sentence objects by matching num:
    const parts = sentencesStr.split(/\{\s*num:\s*/);
    
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        const numMatch = part.match(/^(\d+)/);
        if (!numMatch) continue;
        
        const num = parseInt(numMatch[1]);
        let rest = part.substring(numMatch[0].length);
        
        // Extract original - between "original": " and ",
        const origMatch = rest.match(/,?\s*original:\s*"((?:[^"\\]|\\.)*)"/);
        if (!origMatch) continue;
        
        // Extract translation - between "translation": " and ",
        const transMatch = rest.match(/,?\s*translation:\s*"((?:[^"\\]|\\.)*)"/);
        if (!transMatch) continue;
        
        // Extract analysis - between analysis: ` and `
        // Find the position of `analysis: ``
        const anaStart = rest.indexOf("analysis: `");
        if (anaStart === -1) continue;
        
        const anaContentStart = anaStart + 10; // skip "analysis: `"
        const anaEnd = rest.indexOf("`", anaContentStart);
        if (anaEnd === -1) continue;
        
        results[num] = {
            original: origMatch[1],
            translation: transMatch[1],
            analysis: rest.substring(anaContentStart, anaEnd)
        };
    }
    
    return results;
}

function fixJson(jsonPath, mdData) {
    try {
        const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
        const trans = data.sections.find(s => s.type === "translation");
        if (!trans || !trans.sentences) return false;
        
        let fixed = false;
        trans.sentences.forEach(s => {
            const md = mdData[s.num];
            if (!md) return;
            
            if ((!s.translation || s.translation.length < 2) && md.translation && md.translation.length > 0) {
                s.translation = md.translation;
                fixed = true;
            }
            if ((!s.analysis || s.analysis.length < 2) && md.analysis && md.analysis.length > 0) {
                s.analysis = md.analysis;
                fixed = true;
            }
        });
        
        if (fixed) {
            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");
            return true;
        }
        return false;
    } catch(e) {
        console.log(`  Error ${jsonPath}: ${e.message}`);
        return false;
    }
}

// Process all years
const years = [
    { json: "2019-1.json", md: "2019-1.md" },
    { json: "2011-1.json", md: "2011-1.md" },
    { json: "2005.json", md: "2005-1.md" },
    { json: "2001.json", md: "2001-1.md" },
    { json: "2000.json", md: "2000-1.md" }
];

let fixedCount = 0;
years.forEach(({json, md}) => {
    const mdPath = path.join(MD_DIR, md);
    if (!fs.existsSync(mdPath)) {
        console.log(`MD不存在: ${md}`);
        return;
    }
    
    const mdData = extractFromMd(mdPath);
    console.log(`${md}: found ${Object.keys(mdData).length} sentences`);
    
    JSON_DIRS.forEach(dir => {
        const jsonPath = path.join(dir, json);
        if (fixJson(jsonPath, mdData)) {
            fixedCount++;
            console.log(`  Fixed: ${dir}\\${json}`);
        }
    });
});

console.log(`\n共修复 ${fixedCount} 个JSON文件`);
