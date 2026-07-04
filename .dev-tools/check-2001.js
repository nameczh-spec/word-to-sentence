const fs = require("fs");

const content = fs.readFileSync("H:\\IT\\单词化句\\语料库\\2001-1.md", "utf-8");

// Show analysis for sentences 31-35
const anaStart = content.indexOf("analysis: `");
while (anaStart !== -1) {
    const aStart = anaStart + 10; // after "analysis: `"
    const aEnd = content.indexOf("`", aStart);
    if (aEnd === -1) break;
    const ana = content.substring(aStart, aEnd);
    
    // Find which sentence number
    const before = content.substring(Math.max(0, anaStart - 100), anaStart);
    const numMatch = before.match(/num:\s*(\d+)/);
    const num = numMatch ? numMatch[1] : "?";
    
    console.log(`Sentence ${num} analysis (${ana.length} chars):`);
    console.log(ana.substring(0, 200));
    console.log("---");
    
    // Find next
    const nextStart = content.indexOf("analysis: `", aEnd);
    if (nextStart === -1 || nextStart > anaStart + 2000) break;
}
