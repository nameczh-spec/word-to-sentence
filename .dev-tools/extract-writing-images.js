const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");

const WORD_DIR = "H:\\IT\\单词化句\\语料库\\word版英语真题";
const IMG_DIR = "H:\\IT\\单词化句\\vocab-reading-generator\\images\\writing";
const MOBILE_IMG_DIR = "H:\\IT\\单词化句\\vocab-reading-generator-mobile\\images\\writing";
const WWW_IMG_DIR = "H:\\IT\\单词化句\\vocab-reading-generator-mobile\\www\\images\\writing";

const YEAR_MAP = {
    "1999": "1999-1", "2000": "2000-1", "2001": "2001-1", "2002": "2002-1",
    "2003": "2003-1", "2004": "2004-1", "2005": "2005-1", "2006": "2006-1",
    "2007": "2007-1", "2008": "2008-1", "2009": "2009-1",
    "2010-1": "2010-1-1", "2010-2": "2010-2-2",
    "2011-1": "2011-1-1", "2011-2": "2011-2-2",
    "2012-1": "2012-1-1", "2012-2": "2012-2-2",
    "2013-1": "2013-1-1", "2013-2": "2013-2-2",
    "2014-1": "2014-1-1", "2014-2": "2014-2-2",
    "2015-1": "2015-1-1", "2015-2": "2015-2-2",
    "2016-1": "2016-1-1", "2016-2": "2016-2-2",
    "2017-1": "2017-1-1", "2017-2": "2017-2-2",
    "2018-1": "2018-1-1", "2018-2": "2018-2-2",
    "2019-1": "2019-1-1", "2019-2": "2019-2-2",
    "2020-1": "2020-1-1", "2020-2": "2020-2-2",
    "2021-1": "2021-1-1", "2021-2": "2021-2-2",
    "2022-1": "2022-1-1", "2022-2": "2022-2-2",
    "2023-1": "2023-1-1", "2023-2": "2023-2-2",
    "2024-1": "2024-1-1", "2024-2": "2024-2-2",
    "2025-1": "2025-1-1", "2025-2": "2025-2-2"
};

async function extractImagesFromDocx(docxPath, prefix) {
    const images = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(docxPath)
            .pipe(unzipper.Parse())
            .on("entry", function(entry) {
                const fileName = entry.path;
                if (fileName.startsWith("word/media/") &&
                    (fileName.endsWith(".png") || fileName.endsWith(".jpeg") ||
                     fileName.endsWith(".jpg") || fileName.endsWith(".gif"))) {
                    const ext = path.extname(fileName).substring(1);
                    const imgIndex = images.length;
                    const suffix = imgIndex === 0 ? "" : "-" + imgIndex;
                    const outName = prefix + "-partB" + suffix + "." + ext;
                    entry.buffer().then(buffer => {
                        images.push({ fileName: outName, buffer: buffer });
                    });
                } else {
                    entry.autodrain();
                }
            })
            .on("close", () => resolve(images))
            .on("error", reject);
    });
}

function saveImage(imageData, targetDir) {
    const filePath = path.join(targetDir, imageData.fileName);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(filePath, imageData.buffer);
    return filePath;
}

function imageExists(prefix, targetDir) {
    const files = fs.existsSync(targetDir) ? fs.readdirSync(targetDir) : [];
    return files.some(f => f.startsWith(prefix));
}

async function main() {
    console.log("开始从Word文档提取作文图片...\n");
    const docxFiles = fs.readdirSync(WORD_DIR).filter(f => f.endsWith(".docx"));
    let totalExtracted = 0;
    let skipped = 0;

    for (const docxFile of docxFiles) {
        const yearKey = docxFile.replace(".docx", "");
        const prefix = YEAR_MAP[yearKey];
        if (!prefix) {
            console.log("跳过未知年份: " + docxFile);
            continue;
        }
        if (imageExists(prefix, IMG_DIR)) {
            skipped++;
            continue;
        }
        console.log("提取中: " + yearKey + "...");
        try {
            const docxPath = path.join(WORD_DIR, docxFile);
            const images = await extractImagesFromDocx(docxPath, prefix);
            if (images.length > 0) {
                console.log("  找到 " + images.length + " 张图片");
                for (const img of images) {
                    saveImage(img, IMG_DIR);
                    saveImage(img, MOBILE_IMG_DIR);
                    saveImage(img, WWW_IMG_DIR);
                    console.log("    保存: " + img.fileName);
                    totalExtracted++;
                }
            } else {
                console.log("  未找到图片");
            }
        } catch (err) {
            console.log("  解析失败: " + err.message);
        }
    }
    console.log("\n完成！共提取 " + totalExtracted + " 张图片，跳过 " + skipped + " 个");
}

main().catch(console.error);
