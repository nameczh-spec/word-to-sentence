const fs = require("fs");

// Fix 2001.json - escape Chinese quotes in translation field
let content = fs.readFileSync("h:\\IT\\单词化句\\vocab-reading-generator\\vocab-lib\\pastpapers\\2001.json", "utf-8");

// Find and fix sentence 34's translation field
// Original: "但皮尔森指出，这个突破仅仅是人机一体化的开始："它是人机一体化漫长之路的第一步，最终会使人们在下世纪末之前就研制出完全电子化的仿真人。""
// Fix: escape inner ASCII double quotes

const oldText = '"但皮尔森指出，这个突破仅仅是人机一体化的开始："它是人机一体化漫长之路的第一步，最终会使人们在下世纪末之前就研制出完全电子化的仿真人。""';
const newText = '"但皮尔森指出，这个突破仅仅是人机一体化的开始：\\"它是人机一体化漫长之路的第一步，最终会使人们在下世纪末之前就研制出完全电子化的仿真人。\\""';

content = content.replace(oldText, newText);

fs.writeFileSync("h:\\IT\\单词化句\\vocab-reading-generator\\vocab-lib\\pastpapers\\2001.json", content, "utf-8");

try {
    JSON.parse(content);
    console.log("2001.json: ✓ FIXED!");
} catch(e) {
    console.log("Still broken:", e.message);
}

// Also sync to mobile and www
const targets = [
    "h:\\IT\\单词化句\\vocab-reading-generator-mobile\\vocab-lib\\pastpapers",
    "h:\\IT\\单词化句\\vocab-reading-generator-mobile\\www\\vocab-lib\\pastpapers"
];

targets.forEach(dir => {
    // Fix 2006.json
    let c2006 = fs.readFileSync(dir + "\\2006.json", "utf-8");
    c2006 = c2006.substring(0, 1603) + ' \\"There has to be 20 of programs. What\'s needed is a package deal.\\"' + c2006.substring(1654);
    fs.writeFileSync(dir + "\\2006.json", c2006, "utf-8");
    
    // Fix 2001.json  
    let c2001 = fs.readFileSync(dir + "\\2001.json", "utf-8");
    c2001 = c2001.replace(oldText, newText);
    fs.writeFileSync(dir + "\\2001.json", c2001, "utf-8");
    
    console.log("Synced " + dir);
});
