const fs = require("fs");

function findMissingSentences(jsonPath) {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const trans = data.sections.find(s => s.type === "translation");
    const missing = [];
    if (trans && trans.sentences) {
        trans.sentences.forEach(s => {
            if (!s.translation || s.translation.length < 3) missing.push({num: s.num, field: "translation"});
            if (!s.analysis || s.analysis.length < 3) missing.push({num: s.num, field: "analysis"});
        });
    }
    return missing;
}

const years = ["2019-1", "2011-1", "2005", "2001", "2000"];
const JSON_DIR = "h:\\IT\\单词化句\\vocab-reading-generator\\vocab-lib\\pastpapers";

years.forEach(y => {
    const missing = findMissingSentences(`${JSON_DIR}\\${y}.json`);
    if (missing.length > 0) {
        console.log(`${y}:`);
        missing.forEach(m => console.log(`  sentence ${m.num} - missing ${m.field}`));
    }
});
