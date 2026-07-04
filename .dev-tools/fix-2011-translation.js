const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'vocab-reading-generator', 'vocab-lib', 'pastpapers', '2011-1.json');

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const translationSection = data.sections.find(s => s.type === 'translation');

translationSection.rawText = 'Part C Directions: Read the following text carefully and then translate the underlined segments into Chinese. Your translation should be written neatly on ANSWER SHEET 2. (10 points) With its theme that "Mind is the master weaver," creating our inner character and outer circumstances, the book As a Man Thinketh by James Allen is an in-depth exploration of the central idea of self-help writing. (46) Allen\'s contribution was to take an assumption we all share – that because we are not robots we therefore control our thoughts – and reveal its erroneous nature. Because most of us believe that mind is separate from matter, we think that thoughts can be hidden and made powerless; this allows us to think one way and act another. However, Allen believed that the unconscious mind generates as much action as the conscious mind, and (47) while we may be able to sustain the illusion of control through the conscious mind alone, in reality we are continually faced with a question: "Why cannot I make myself do this or achieve that?" Since desire and will are damaged by the presence of thoughts that do not accord with desire, Allen concluded: "We do not attract what we want, but what we are." Achievement happens because you as a person embody the external achievement; you don\'t "get" success but become it. There is no gap between mind and matter. Part of the fame of Allen\'s book is its contention that "Circumstances do not make a person, they reveal him." (48) This seems a justification for neglect of those in need, and a rationalization of exploitation, of the superiority of those at the top and the inferiority of those at the bottom. This, however, would be a knee-jerk reaction to a subtle argument. Each set of circumstances, however bad, offers a unique opportunity for growth. If circumstances always determined the life and prospects of people, then humanity would never have progressed. In fact, (49) circumstances seem to be designed to bring out the best in us, and if we feel that we have been "wronged" then we are unlikely to begin a conscious effort to escape from our situation. Nevertheless, as any biographer knows, a person\'s early life and its conditions are often the greatest gift to an individual. The sobering aspect of Allen\'s book is that we have no one else to blame for our present condition except ourselves. (50) The upside is the possibilities contained in knowing that everything is up to us; where before we were experts in the array of limitations, now we become authorities of what is possible.';

translationSection.sentences = [
    {
        num: 46,
        text: "Allen's contribution was to take an assumption we all share – that because we are not robots we therefore control our thoughts – and reveal its erroneous nature.",
        translation: "艾伦的贡献在于，他拿出了\"因为我们不是机器人，所以我们能控制自己的思想\"这一共识，并揭示了其错误的本质。",
        analysis: '<p><strong>句型结构：</strong></p>\n<ol><li>主句为"Allen\'s contribution was to take...and reveal..."。</li><li>不定式短语"to take...and reveal..."作表语，两个并列不定式。</li><li>"we all share"为省略that的定语从句，修饰assumption。</li><li>破折号间"that because...we therefore control our thoughts"为同位语从句，解释assumption的内容。</li><li>because在同位语从句中引导原因状语。</li></ol>\n<p><strong>重点词汇：</strong></p>\n<ul><li><strong>contribution</strong>：n. 贡献。</li><li><strong>assumption</strong>：n. 假设，假定。</li><li><strong>erroneous</strong>：adj. 错误的。</li><li><strong>reveal</strong>：v. 揭示，揭露。</li></ul>\n<p><strong>翻译技巧：</strong></p>\n<ol><li>"take an assumption we all share"译为"拿出了……这一共识"，将定语从句"we all share"译为"共识"，更简洁。</li><li>同位语从句用破折号引出，与原文结构保持一致。</li><li>"erroneous nature"译为"错误的本质"，准确传达原意。</li></ol>'
    },
    {
        num: 47,
        text: "while we may be able to sustain the illusion of control through the conscious mind alone, in reality we are continually faced with a question: \"Why cannot I make myself do this or achieve that?\"",
        translation: "虽然我们或许能够仅通过有意识的思维来维持控制的错觉，但实际上我们却不断面临这样一个问题：\"为什么我不能让自己做到这个或者实现那个？\"",
        analysis: '<p><strong>句型结构：</strong></p>\n<ol><li>"while we may be able to..."为让步状语从句。</li><li>主句为"we are continually faced with a question"。</li><li>"through the conscious mind alone"为方式状语。</li><li>冒号后为直接引语，是question的具体内容。</li><li>"make myself do this or achieve that"为"make + 宾语 + 不带to的不定式"结构。</li></ol>\n<p><strong>重点词汇：</strong></p>\n<ul><li><strong>sustain</strong>：v. 维持，保持。</li><li><strong>illusion</strong>：n. 错觉，幻想。</li><li><strong>conscious mind</strong>：有意识的思维，意识。</li><li><strong>in reality</strong>：实际上，事实上。</li><li><strong>continually</strong>：adv. 不断地。</li><li><strong>be faced with</strong>：面临，面对。</li></ul>\n<p><strong>翻译技巧：</strong></p>\n<ol><li>"while"译为"虽然"，引导让步状语。</li><li>"through the conscious mind alone"译为"仅通过有意识的思维"，alone译为"仅"。</li><li>直接引语保留原格式，用引号标出。</li></ol>'
    },
    {
        num: 48,
        text: "This seems a justification for neglect of those in need, and a rationalization of exploitation, of the superiority of those at the top and the inferiority of those at the bottom.",
        translation: "这似乎是在为忽视贫困者的行为辩护，为剥削、为上层人群的优越和底层人群的卑微找理由。",
        analysis: '<p><strong>句型结构：</strong></p>\n<ol><li>主句为"This seems a justification...and a rationalization..."，两个并列表语。</li><li>"for neglect of those in need"为介词短语修饰justification。</li><li>"of exploitation, of the superiority...and the inferiority..."为介词短语修饰rationalization。</li><li>"of those at the top"和"(of) those at the bottom"分别修饰superiority和inferiority。</li></ol>\n<p><strong>重点词汇：</strong></p>\n<ul><li><strong>justification</strong>：n. 正当理由，辩护。</li><li><strong>neglect</strong>：n. 忽视，忽略。</li><li><strong>those in need</strong>：贫困者，有需要的人。</li><li><strong>rationalization</strong>：n. 合理化，找理由。</li><li><strong>exploitation</strong>：n. 剥削。</li><li><strong>superiority</strong>：n. 优越，优等。</li><li><strong>inferiority</strong>：n. 卑微，劣等。</li></ul>\n<p><strong>翻译技巧：</strong></p>\n<ol><li>"a justification for neglect of those in need"译为"为忽视贫困者的行为辩护"，将名词justification转为动词"辩护"。</li><li>"a rationalization of exploitation"译为"为剥削……找理由"，rationalization同样转译为动词。</li><li>"those at the top"和"those at the bottom"译为"上层人群"和"底层人群"，比"顶端的人"和"底部的人"更自然。</li></ol>'
    },
    {
        num: 49,
        text: "circumstances seem to be designed to bring out the best in us, and if we feel that we have been \"wronged\" then we are unlikely to begin a conscious effort to escape from our situation.",
        translation: "环境似乎是为了激发我们的最大潜能而设；如果我们觉得自己遭受了\"不公\"，那么我们就不太可能开始有意识地努力去摆脱自己的处境。",
        analysis: '<p><strong>句型结构：</strong></p>\n<ol><li>and连接两个并列分句。</li><li>前一分句"circumstances seem to be designed to..."为被动语态。</li><li>"to bring out the best in us"为不定式短语作目的状语。</li><li>后一分句含"if...then..."条件状语从句。</li><li>"that we have been wronged"为feel的宾语从句。</li><li>"to escape from our situation"为不定式短语作后置定语修饰effort。</li></ol>\n<p><strong>重点词汇：</strong></p>\n<ul><li><strong>bring out the best in us</strong>：激发我们最好的一面，激发我们的潜能。</li><li><strong>wronged</strong>：adj. 被冤枉的，被不公平对待的。</li><li><strong>be unlikely to</strong>：不太可能。</li><li><strong>conscious effort</strong>：有意识的努力。</li><li><strong>escape from</strong>：摆脱，逃离。</li></ul>\n<p><strong>翻译技巧：</strong></p>\n<ol><li>"be designed to bring out the best in us"译为"为了激发我们的最大潜能而设"，将被动转为主动。</li><li>"wronged"加引号译为"不公"，与原文"wronged"的引用意味对应。</li><li>"begin a conscious effort to escape"译为"开始有意识地努力去摆脱"，effort转译为副词"有意识地"修饰"努力"。</li></ol>'
    },
    {
        num: 50,
        text: "The upside is the possibilities contained in knowing that everything is up to us; where before we were experts in the array of limitations, now we become authorities of what is possible.",
        translation: "积极的一面在于，既然万事都取决于我们自己，那么就有了无限可能；以前我们是应对各种局限的行家，如今我们成了掌控可能性的权威。",
        analysis: '<p><strong>句型结构：</strong></p>\n<ol><li>分号连接两个并列分句。</li><li>前一分句"The upside is the possibilities..."，表语为possibilities。</li><li>"contained in knowing that..."为过去分词短语作后置定语修饰possibilities。</li><li>"that everything is up to us"为knowing的宾语从句。</li><li>后一分句为"where before...now..."的对比结构，where引导比较/让步从句。</li><li>"what is possible"为of的宾语从句。</li></ol>\n<p><strong>重点词汇：</strong></p>\n<ul><li><strong>upside</strong>：n. 积极方面，好处。</li><li><strong>contained in</strong>：包含在……之中。</li><li><strong>be up to us</strong>：取决于我们。</li><li><strong>array of limitations</strong>：一系列局限。</li><li><strong>authorities</strong>：n. 权威，专家。</li></ul>\n<p><strong>翻译技巧：</strong></p>\n<ol><li>"The upside is the possibilities contained in knowing that..."译为"积极的一面在于，既然……那么就有了无限可能"，将过去分词短语的被动含义转为主动逻辑。</li><li>"where before...now..."译为"以前……如今……"，用对仗结构体现对比。</li><li>"experts in the array of limitations"译为"应对各种局限的行家"，补充"应对"使译文更通顺。</li></ol>'
    }
];

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('2011-1.json translation section updated successfully.');
console.log('Sentences:', translationSection.sentences.length);
translationSection.sentences.forEach(s => {
    console.log(`num ${s.num}: hasTranslation=${!!s.translation}, hasAnalysis=${!!s.analysis}, analysisLen=${(s.analysis||'').length}`);
});
