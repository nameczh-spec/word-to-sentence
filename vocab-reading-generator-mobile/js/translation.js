/**
 * 翻译模块
 * 功能：翻译真题句子 + 查看参考译文 + 句子解析
 */
const Translation = (() => {
    let currentPaper = null;
    let currentSectionIndex = 0;
    let onBack = null;
    let translationSections = [];

    const translationDB = {
        "Recent decades have seen science move into a convention where engagement in the subject can only be done through institutions, such as a university. Citizen science provides an opportunity for greater public engagement and the democratisation of science. In the information era, large data sets, small teams and financial restrictions have slowed scientific process.": {
            translation: "近几十年来，科学已经形成了一种惯例，即只有通过大学等机构才能参与这一学科。公民科学为扩大公众参与和实现科学民主化提供了机遇。在信息时代，庞大数据集、小型团队以及资金限制减缓了科学发展的进程。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 拟人化主语句型</strong>："Recent decades have seen..." 是英语中常见的拟人化表达，以时间作主语，see/witness 作谓语，意为"在近几十年中发生了……"。这种表达比 "there have been..." 更生动，是考研翻译高频考点。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. where 引导的定语从句</strong>：where 引导定语从句修饰 convention，说明这一惯例的具体内容。注意 where 在此处 = in which，相当于"在这种惯例下"。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. 并列句结构</strong>：整个段落由三个独立句子构成，通过 "Citizen science provides..." 和 "In the information era..." 进行语义衔接，形成"问题—机遇—挑战"的逻辑链条。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>convention</strong> n. 惯例，常规；大会 <br/>
                        <strong>engagement</strong> n. 参与；订婚；约定 <br/>
                        <strong>democratisation</strong> n. 民主化 <br/>
                        <strong>financial restrictions</strong> 资金限制，财政约束
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "Recent decades have seen" 翻译时将拟人化主语转化为时间状语"近几十年来"，符合中文表达习惯。<br/>
                        2. "move into a convention" 不宜直译为"进入一种惯例"，应译为"形成了一种惯例"更自然。<br/>
                        3. "engagement in the subject" 中 subject 指代 science，翻译时应明确为"参与这一学科/领域"。
                    </div>
                </div>
            `
        },
        "But by utilising the natural curiosity of the general public it is possible to overcome many of these challenges by engaging non-scientists directly in the research process. Anyone can be a citizen scientist, regardless of age, nationality or academic experience. You don't even need any formal training, just an inquisitive mind and the enthusiasm to join one of the thousands of citizen science projects to generate new knowledge and the means to understand a genuine scientific outcome.": {
            translation: "但通过利用公众天生的好奇心，让非科学家直接参与研究过程，就有可能克服其中许多挑战。任何人都可以成为公民科学家，无论年龄、国籍或学术经历如何。你甚至不需要任何正式培训，只需要一颗求知的心和热情，加入成千上万个公民科学项目中的一个，去创造新知识，并找到理解真正科学成果的途径。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 形式主语句型</strong>："it is possible to overcome..." 中 it 为形式主语，真正的主语是不定式短语 to overcome many of these challenges。翻译时常将真正主语提前。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 方式状语的叠加</strong>：句子前后出现两个 by 引导的方式状语（by utilising... 和 by engaging...），翻译时需要理顺逻辑关系，将两个方式状语合并或调整语序。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. regardless of 引导的让步状语</strong>：regardless of 意为"不管，不顾"，后接名词短语，表示让步关系。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>utilise</strong> v. 利用，使用（=utilize） <br/>
                        <strong>curiosity</strong> n. 好奇心，求知欲 <br/>
                        <strong>regardless of</strong> 不管，不顾 <br/>
                        <strong>inquisitive</strong> adj. 好奇的，爱打听的 <br/>
                        <strong>genuine</strong> adj. 真正的，真实的
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. 两个 by 短语的处理：将"by utilising... by engaging..." 译为"通过利用……，让……直接参与"，避免重复使用"通过"。<br/>
                        2. "the means to understand" 中 means 是"方法、途径"，不是"意思"，翻译为"找到理解……的途径"。<br/>
                        3. "inquisitive mind" 译为"求知的心"比"好奇的头脑"更符合中文表达。
                    </div>
                </div>
            `
        },
        "Scientists have employed a variety of ways to engage the general public in their research, such as making data analysis into an online game or sample collection into a smartphone application. They've implored citizens to help with bug counting and categorising cancer cells, and even identifying distant galaxies. This form of accessible science means that great minds are able to join the race to create and develop projects with the potential to change the world. A citizen science-based approach can extend the field of vision and include different ideas and different brains to problem-solve and create, making innovation faster and more effective. The rise of citizen science has grown alongside the rise of do-it-yourself biology laboratories around the world.": {
            translation: "科学家们采用了多种方式让公众参与他们的研究，例如将数据分析变成在线游戏，或将样本收集变成智能手机应用程序。他们呼吁公民帮助计数昆虫、分类癌细胞，甚至识别遥远的星系。这种人人可及的科学形式意味着，伟大的头脑能够加入竞赛，去创造和开发有潜力改变世界的项目。基于公民科学的方法可以拓宽视野，汇集不同的想法和不同的头脑来解决问题和进行创造，从而使创新更快、更有效。公民科学的兴起与世界各地自助生物实验室的兴起同步发展。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. such as 举例结构</strong>：such as 后接两个并列的动名词短语 making... or...，构成平行结构，翻译时注意保持对称。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 宾语从句</strong>："means that..." 引导宾语从句，说明这种科学形式意味着什么。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. 现在分词作结果状语</strong>：句末的 "making innovation faster and more effective" 是现在分词短语作结果状语，表示前面动作导致的自然结果。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>employ</strong> v. 采用，使用；雇用 <br/>
                        <strong>implore</strong> v. 恳求，呼吁 <br/>
                        <strong>categorise</strong> v. 分类（=categorize） <br/>
                        <strong>accessible</strong> adj. 可接近的，可获得的 <br/>
                        <strong>alongside</strong> prep. 与……一起，与……同时
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "making data analysis into an online game" 译为"将数据分析变成在线游戏"，使用"将……变成……"的句式。<br/>
                        2. "great minds" 译为"伟大的头脑"，保留原文的比喻手法。<br/>
                        3. "extend the field of vision" 译为"拓宽视野"，比"扩展视野领域"更简洁自然。<br/>
                        4. "problem-solve and create" 动词名词化处理为"解决问题和进行创造"。
                    </div>
                </div>
            `
        },
        "These groups of people are part of a rapidly expanding biotechnological social movement of citizen scientists and professional scientists seeking to take discovery out of institutions and put it into the hands of anyone with the enthusiasm. There are around 40 official do-it-yourself biology centres across the globe in locations including Paris, London, Sydney, and Tel Aviv.": {
            translation: "这些人群是一场迅速发展的生物技术社会运动的一部分，这场运动由公民科学家和专业科学家组成，他们致力于将发现从机构中带出来，交到任何有热情的人手中。全球约有40个官方自助生物中心，分布在巴黎、伦敦、悉尼和特拉维夫等地。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 现在分词短语作后置定语</strong>："seeking to take discovery..." 是现在分词短语作后置定语，修饰前面的 citizen scientists and professional scientists，相当于 who seek...。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 复杂名词短语</strong>："a rapidly expanding biotechnological social movement of citizen scientists and professional scientists" 是一个多层修饰的名词短语，中心词是 movement。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. take... out of... and put... into...</strong>：并列的动词短语结构，表示"把……从……中带出来，放入……"。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>rapidly expanding</strong> 迅速发展/扩张的 <br/>
                        <strong>biotechnological</strong> adj. 生物技术的 <br/>
                        <strong>seek to</strong> 试图，致力于 <br/>
                        <strong>do-it-yourself</strong> adj. 自助的，自己动手的（DIY） <br/>
                        <strong>across the globe</strong> 全球各地
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. 长名词短语的拆分：将 "a rapidly expanding biotechnological social movement of citizen scientists and professional scientists" 拆译为"一场迅速发展的生物技术社会运动的一部分，这场运动由公民科学家和专业科学家组成"，重复中心词"运动"使句子更通顺。<br/>
                        2. "put it into the hands of anyone" 译为"交到任何有热情的人手中"，形象且符合中文习惯。<br/>
                        3. "in locations including..." 译为"分布在……等地"，比"在包括……的地点"更自然。
                    </div>
                </div>
            `
        },
        "They pool resources, collaborate, think outside the box, and find solutions and ways around obstacles to explore science for the sake of science without the traditional boundaries of working inside a formal setting. So is it time to take the Petri dish out of the laboratory and into the garage?": {
            translation: "他们汇集资源、开展合作、跳出固有思维，找到解决方案和绕过障碍的方法，为科学而探索科学，不受在正式机构中工作的传统边界限制。那么，是时候把培养皿从实验室里拿出来，放到车库里了吗？",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 多个并列谓语</strong>：pool, collaborate, think, find 四个并列谓语动词，构成排比结构，增强语气。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 方式状语 + 目的状语 + 条件状语</strong>：to explore... 为目的状语，for the sake of science 为原因/目的状语，without... 为伴随/条件状语，多个状语叠加，翻译时需要合理排序。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. 反问句结尾</strong>："So is it time to...?" 以反问句收尾，引发读者思考，翻译时保留疑问语气。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>pool</strong> v. 汇集，集中（资源、资金等） <br/>
                        <strong>think outside the box</strong> 跳出框框思考，创新思维（习语） <br/>
                        <strong>obstacle</strong> n. 障碍，阻碍 <br/>
                        <strong>for the sake of</strong> 为了……的缘故 <br/>
                        <strong>boundary</strong> n. 边界，界限 <br/>
                        <strong>Petri dish</strong> 培养皿（生物学实验器具）
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "think outside the box" 是英语习语，译为"跳出固有思维"或"打破常规思维"，保留比喻形象。<br/>
                        2. "ways around obstacles" 译为"绕过障碍的方法"，around 表示"绕过、避开"。<br/>
                        3. "for the sake of science" 译为"为科学而探索科学"，比"为了科学的缘故"更有感染力。<br/>
                        4. "take... out of... and into..." 译为"把……从……里拿出来，放到……里"，保持原文的平行结构。
                    </div>
                </div>
            `
        },

        "They sometimes travel more than sixty miles to find food or water, and are very good at working out where other elephants are — even when they are out of sight. Using tracking devices, researchers have shown that they have \"remarkable spatial acuity.\" When finding their way to waterholes, they headed off in exactly the right direction, on one occasion from a distance of roughly thirty miles. What is more, they almost always seem to choose the nearest waterhole.": {
            translation: `它们有时要跋涉六十多英里寻找食物或水，而且非常善于判断其他大象的位置——即使在视野之外也能做到。通过追踪设备，研究人员表明大象具有"非凡的空间敏锐度"。在寻找水源的路上，它们总能准确地朝正确的方向前进，有一次甚至从大约三十英里外出发。此外，它们似乎几乎总是选择最近的水源。`,
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 并列复合句</strong>：第一个句子由 and 连接两个并列谓语，后接 even when 引导的让步状语从句。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 现在分词作伴随状语</strong>："Using tracking devices" 是现在分词短语作状语，表示研究人员进行研究的方式。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. 宾语从句</strong>：shown that 后接宾语从句，说明研究表明的内容。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>4. 时间状语从句省略</strong>："When finding their way..." = "When they find their way..."，状语从句主语与主句主语一致时可省略主语和be动词。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>work out</strong> 弄清，计算出；解决 <br/>
                        <strong>tracking device</strong> 追踪设备 <br/>
                        <strong>remarkable</strong> adj. 非凡的，显著的 <br/>
                        <strong>spatial acuity</strong> 空间敏锐度 <br/>
                        <strong>waterhole</strong> n. 水坑，水源 <br/>
                        <strong>head off</strong> 出发，前往
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "travel more than sixty miles" 译为"跋涉六十多英里"，体现大象行走的艰辛，比"旅行"更贴切。<br/>
                        2. "working out where other elephants are" 译为"判断其他大象的位置"，比"计算出在哪里"更自然。<br/>
                        3. 破折号后的 "even when they are out of sight" 补充说明，译为"——即使在视野之外也能做到"，增加"也能做到"使语义完整。<br/>
                        4. "on one occasion from a distance of roughly thirty miles" 调整语序译为"有一次甚至从大约三十英里外出发"，符合中文叙事逻辑。
                    </div>
                </div>
            `
        },
        "The researchers are convinced that the elephants always know precisely where they are in relation to all the resources they need, and can therefore take shortcuts, as well as following familiar routes. Although the cues used by African elephants for long-distance navigation are not yet understood, smell may well play a part. Elephants are very choosy eaters, but until recently little was known about how they selected their food.": {
            translation: "研究人员确信，大象总能准确地知道自己相对于所需各种资源的位置，因此既能沿着熟悉的路线行进，也能走捷径。虽然非洲象用于长途导航的信号目前尚不清楚，但嗅觉很可能起到了作用。大象对食物非常挑剔，但直到最近，人们对它们如何选择食物还知之甚少。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 多层从句嵌套</strong>：are convinced that 后接宾语从句，宾语从句中又包含 where 引导的宾语从句和省略了 that 的定语从句 they need。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. as well as 平行结构</strong>："take shortcuts, as well as following familiar routes" 注意 as well as 后接动名词，翻译时可调整为"既能……也能……"的并列结构。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. 让步状语从句</strong>：Although 引导让步状语从句，主句为 smell may well play a part。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>4. 过去分词作定语</strong>："cues used by African elephants" = "cues that are used by African elephants"。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>be convinced that</strong> 确信，坚信 <br/>
                        <strong>precisely</strong> adv. 精确地，准确地 <br/>
                        <strong>in relation to</strong> 关于，相对于 <br/>
                        <strong>take shortcuts</strong> 走捷径 <br/>
                        <strong>cue</strong> n. 提示，信号，线索 <br/>
                        <strong>navigation</strong> n. 导航，航行 <br/>
                        <strong>may well</strong> 很可能 <br/>
                        <strong>choosy</strong> adj. 挑剔的，挑三拣四的
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "where they are in relation to all the resources" 译为"自己相对于所需各种资源的位置"，将介词短语转化为定语结构。<br/>
                        2. "as well as following familiar routes" 调整语序，先讲熟悉路线再讲捷径，符合中文"先常规后特殊"的表达逻辑。<br/>
                        3. "little was known about" 使用被动语态，翻译时补充主语"人们"，译为"人们对……知之甚少"。<br/>
                        4. "may well play a part" 译为"很可能起到了作用"，may well 表示可能性很大。
                    </div>
                </div>
            `
        },
        "One possibility was that they merely used their eyes and tried out the plants they found, but that would probably result in a lot of wasted time and energy, not least because their eyesight is actually not very good.": {
            translation: "一种可能性是，它们仅仅依靠眼睛去尝试发现的植物，但这很可能会导致大量时间和精力的浪费，尤其是因为它们的视力实际上并不好。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 表语从句</strong>："One possibility was that..." 中 that 引导表语从句，说明可能性的具体内容。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 转折并列句</strong>：but 连接两个并列分句，前半句提出一种假设，后半句反驳该假设。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. not least because 引导的原因状语从句</strong>：not least because 意为"尤其因为"，not least 表示强调，相当于"尤其是，相当重要的是"。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>merely</strong> adv. 仅仅，只不过 <br/>
                        <strong>try out</strong> 试验，尝试 <br/>
                        <strong>result in</strong> 导致，结果是 <br/>
                        <strong>not least</strong> 尤其是，相当重要地 <br/>
                        <strong>eyesight</strong> n. 视力
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "tried out the plants they found" 译为"去尝试发现的植物"，补充"去"使动作更连贯。<br/>
                        2. "result in a lot of wasted time and energy" 译为"导致大量时间和精力的浪费"，将名词短语转化为"的"字结构，更符合中文表达。<br/>
                        3. "not least because" 译为"尤其是因为"，突出强调原因的重要性。
                    </div>
                </div>
            `
        },
        "The volatile chemicals produced by plants can be carried a long way, and they are very characteristic: Each plant or tree has its own particular odor signature. What is more, they can be detected even when they are not actually visible. New research suggests that smell is a crucial factor in guiding elephants — and probably other herbivores — to the best food resources. The researchers first established what kinds of plant the elephants preferred either to eat or avoid when foraging freely. They then set up a \"food station\" experiment, in which they gave the elephants a series of choices based only on smell.": {
            translation: `植物产生的挥发性化学物质可以传播很远，而且非常有特点：每一种植物或树木都有自己独特的气味特征。此外，即使在完全看不见的情况下，也能探测到这些化学物质。新研究表明，嗅觉是引导大象——可能还有其他食草动物——找到最佳食物来源的关键因素。研究人员首先确定了大象在自由觅食时喜欢吃或避开哪些种类的植物。然后他们进行了一项"食物站"实验，在实验中让大象仅凭气味做出一系列选择。`,
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 过去分词作定语</strong>："The volatile chemicals produced by plants" 中 produced by plants 是过去分词短语作后置定语。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 冒号引出解释说明</strong>：冒号后的句子对前面的 "very characteristic" 进行具体解释说明。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. 被动语态</strong>："can be carried" 和 "can be detected" 都是情态动词的被动语态。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>4. 插入语</strong>："— and probably other herbivores —" 用破折号引出插入语，补充说明。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>5. "介词 + which" 引导的定语从句</strong>："in which they gave the elephants..." 是非限制性定语从句，修饰 experiment。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>volatile</strong> adj. 挥发性的，易挥发的 <br/>
                        <strong>characteristic</strong> adj. 特有的，典型的 n. 特征 <br/>
                        <strong>odor signature</strong> 气味特征，气味标识 <br/>
                        <strong>detect</strong> v. 探测，察觉 <br/>
                        <strong>crucial</strong> adj. 关键的，至关重要的 <br/>
                        <strong>herbivore</strong> n. 食草动物 <br/>
                        <strong>forage</strong> v. 觅食，搜寻食物
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "be carried a long way" 译为"可以传播很远"，carry 此处表示"传播、扩散"。<br/>
                        2. "odor signature" 译为"气味特征"，signature 在此意为"鲜明特征"。<br/>
                        3. 被动语态翻译："they can be detected" 译为"也能探测到这些化学物质"，转化为主动语态更自然。<br/>
                        4. "what kinds of plant the elephants preferred" 译为"大象喜欢吃或避开哪些种类的植物"，将宾语从句转化为正常语序。
                    </div>
                </div>
            `
        },
        "The experiment showed that elephants may well use smell to identify patches of trees that are good to eat, and secondly to assess the quality of the trees within each patch.": {
            translation: "实验表明，大象很可能利用嗅觉来识别哪些树林适合食用，其次还能评估每片树林中树木的品质。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 宾语从句</strong>：showed that 后接宾语从句，说明实验结果。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 并列的不定式目的状语</strong>：to identify... and secondly to assess... 是两个并列的目的状语，说明大象用嗅觉做的两件事。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. 定语从句</strong>："that are good to eat" 是定语从句，修饰 patches of trees。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>may well</strong> 很可能（可能性较高） <br/>
                        <strong>identify</strong> v. 识别，辨认 <br/>
                        <strong>patch</strong> n. 一片，一块（土地） <br/>
                        <strong>secondly</strong> adv. 其次，第二 <br/>
                        <strong>assess</strong> v. 评估，评价
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "may well use smell" 译为"很可能利用嗅觉"，may well 表推测，语气比 may 更强。<br/>
                        2. "patches of trees that are good to eat" 译为"哪些树林适合食用"，将定语从句的含义融入主句，用"哪些"表达更自然。<br/>
                        3. "secondly to assess" 译为"其次还能评估"，增加"还能"使语义更连贯。<br/>
                        4. "the quality of the trees within each patch" 译为"每片树林中树木的品质"，调整语序符合中文表达习惯。
                    </div>
                </div>
            `
        },

        "AI can also be used to identify the lifestyle choices of customers regarding their hobbies, favourite celebrities, and fashions to provide unique content in marketing messages put out through social media. At the same time AI can also be used to generate content for social media posts and chat sites. The main disadvantage of using AI to respond to customers is that there are concerns about trusting personal interactions to machines, which could lead not only to the subsequent loss of interpersonal connections, but also to a decrease in marketing personnel.": {
            translation: "人工智能还可用于识别客户在爱好、喜爱的名人和时尚方面的生活方式选择，以便在通过社交媒体发布的营销信息中提供独特的内容。同时，人工智能还可用于为社交媒体帖子和聊天网站生成内容。使用人工智能回复客户的主要缺点在于，人们担心将人际互动交给机器，这不仅会导致人际关系随之丧失，还会导致营销人员减少。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 被动语态</strong>："AI can also be used to..." 是被动语态，翻译时常转化为主动语态"人工智能还可用于……"。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 方式/目的分层</strong>：句子结构为 identify... regarding... to provide... in... put out through...，层层修饰，翻译时需要理清逻辑关系。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. 表语从句 + 定语从句</strong>：主句 The main disadvantage... is that... 含表语从句，表语从句后又有 which 引导的非限制性定语从句，修饰前面整句话。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>4. not only... but also... 平行结构</strong>：在定语从句中，lead 后接两个并列的介词宾语 not only to... but also to...。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>identify</strong> v. 识别，确定 <br/>
                        <strong>regarding</strong> prep. 关于，至于 <br/>
                        <strong>celebrity</strong> n. 名人，名流 <br/>
                        <strong>put out</strong> 发布，推出 <br/>
                        <strong>generate</strong> v. 生成，产生 <br/>
                        <strong>concern</strong> n. 担忧，关注 <br/>
                        <strong>subsequent</strong> adj. 随后的，接着的 <br/>
                        <strong>interpersonal</strong> adj. 人际的，人与人之间的
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "regarding their hobbies, favourite celebrities, and fashions" 译为"在爱好、喜爱的名人和时尚方面"，将介词短语转化为"在……方面"的结构。<br/>
                        2. "marketing messages put out through social media" 译为"通过社交媒体发布的营销信息"，将过去分词短语转化为定语。<br/>
                        3. "there are concerns about" 译为"人们担心"，补充主语"人们"使句子更完整。<br/>
                        4. "trusting personal interactions to machines" 译为"将人际互动交给机器"，trust sth. to sb. 表示"把某事托付给某人"。
                    </div>
                </div>
            `
        },
        "Some believe that AI is negatively impacting on the marketer's role by reducing creativity and removing jobs, but they are aware that it is a way of reducing costs and creating new information. By allowing AI to develop content some brand marketers may find that they are losing control over the brand narrative.": {
            translation: "一些人认为，人工智能正在通过削弱创造力和削减工作岗位对营销人员的角色产生负面影响，但他们也意识到，这是降低成本和创造新信息的一种方式。由于让人工智能开发内容，一些品牌营销人员可能会发现自己正在失去对品牌叙事的掌控。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 转折并列句</strong>：but 连接两个并列分句，前句讲负面影响，后句讲积极作用，形成对比。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 宾语从句嵌套</strong>：believe that 后接宾语从句，be aware that 后也接宾语从句。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. by doing 方式状语</strong>："by reducing creativity and removing jobs" 说明产生负面影响的方式。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>4. 现在分词作原因/条件状语</strong>：句首 "By allowing AI to develop content" 作状语，表示原因或条件。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>negatively</strong> adv. 负面地，消极地 <br/>
                        <strong>impact on</strong> 对……产生影响 <br/>
                        <strong>marketer</strong> n. 营销人员，营销商 <br/>
                        <strong>be aware that</strong> 意识到…… <br/>
                        <strong>brand</strong> n. 品牌 <br/>
                        <strong>narrative</strong> n. 叙述，叙事
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "is negatively impacting on" 译为"正在对……产生负面影响"，impact 作动词常与 on 搭配。<br/>
                        2. "reducing creativity and removing jobs" 译为"削弱创造力和削减工作岗位"，remove jobs 译为"削减工作岗位"更准确。<br/>
                        3. "By allowing AI to develop content" 译为"由于让人工智能开发内容"，by 在此处表示原因，译为"由于"比"通过"更通顺。<br/>
                        4. "losing control over the brand narrative" 译为"失去对品牌叙事的掌控"，narrative 译为"叙事"是营销学常用表达。
                    </div>
                </div>
            `
        },
        "Algorithms used to simulate human interactions are creating many of these concerns, especially as no-one is quite sure what the outcomes of using AI to interact with customers will be. For AI to be successful, data needs to be accessible, but the use of personal data is becoming more regulated and the automated sharing of data is becoming more difficult.": {
            translation: "用于模拟人际互动的算法正在引发许多这类担忧，尤其是因为没人能确定使用人工智能与客户互动会产生什么结果。人工智能要想成功，数据必须是可获取的，但个人数据的使用正受到越来越多的监管，数据的自动共享也变得越来越困难。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 过去分词作定语</strong>："Algorithms used to simulate human interactions" 中 used to... 是过去分词短语作后置定语，修饰 algorithms。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. as 引导的原因状语从句</strong>：especially as 意为"尤其是因为"，引导原因状语从句，补充说明为什么产生担忧。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. 宾语从句</strong>：sure 后接 what 引导的宾语从句，注意从句用陈述语序。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>4. For... to do 复合结构</strong>："For AI to be successful" 是不定式的复合结构，作目的/条件状语。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>algorithm</strong> n. 算法，计算程序 <br/>
                        <strong>simulate</strong> v. 模拟，模仿 <br/>
                        <strong>interaction</strong> n. 互动，交流 <br/>
                        <strong>outcome</strong> n. 结果，成果 <br/>
                        <strong>accessible</strong> adj. 可获取的，可接近的 <br/>
                        <strong>regulate</strong> v. 监管，管制；调节 <br/>
                        <strong>automated</strong> adj. 自动化的
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "Algorithms used to simulate human interactions" 译为"用于模拟人际互动的算法"，将定语前置。<br/>
                        2. "creating many of these concerns" 译为"引发许多这类担忧"，create 与 concern 搭配译为"引发担忧"。<br/>
                        3. "For AI to be successful" 译为"人工智能要想成功"，将不定式复合结构转化为条件分句。<br/>
                        4. "becoming more regulated" 译为"正受到越来越多的监管"，转化为被动语态的动态表达。
                    </div>
                </div>
            `
        },
        "If customers are not willing to share data, AI will be starved of essential information and will not be able to function effectively or employ machine learning to improve its marketing content and communication. Therefore, unless customers are prepared to sign release agreements, the use of AI may become somewhat restricted in the future. Not only can AI help to create the marketing content, but it can also provide a non-intrusive way of delivering the content to the target customers. Data can be gathered on where the customer can be engaged, such as location, devices used, website interactions, and sites visited, to display marketing messages in appropriate forms, including emails, social media posts, pop-up advertisements, and banners at an appropriate frequency.": {
            translation: "如果客户不愿分享数据，人工智能将缺乏必要的信息，无法有效运作，也无法运用机器学习来改进其营销内容和沟通。因此，除非客户愿意签署授权协议，否则人工智能的使用在未来可能会受到一定限制。人工智能不仅能帮助创建营销内容，还能提供一种非侵入式的方式将内容投放给目标客户。研究人员可以收集有关客户接触点的数据，如位置、使用的设备、网站互动和访问的网站，以适当的形式展示营销信息，包括电子邮件、社交媒体帖子、弹出式广告和横幅广告，并控制适当的频率。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 条件状语从句</strong>：If 引导条件状语从句，unless 也引导条件状语从句（=if not）。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 并列谓语</strong>：will be starved of... and will not be able to... or employ... 是多个并列的谓语结构。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. not only... but also... 倒装结构</strong>：Not only 置于句首时，第一个分句要部分倒装（助动词提前）。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>4. 复杂目的状语</strong>：to display... including... at an appropriate frequency 是目的状语，包含多个举例成分。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>be starved of</strong> 缺乏，急需 <br/>
                        <strong>essential</strong> adj. 必要的，必不可少的 <br/>
                        <strong>function</strong> v. 运转，运作 <br/>
                        <strong>employ</strong> v. 使用，运用 <br/>
                        <strong>machine learning</strong> 机器学习 <br/>
                        <strong>release agreement</strong> 授权协议，数据使用许可协议 <br/>
                        <strong>somewhat</strong> adv. 有点，稍微 <br/>
                        <strong>restricted</strong> adj. 受限制的 <br/>
                        <strong>non-intrusive</strong> adj. 非侵入性的，不打扰的 <br/>
                        <strong>target customer</strong> 目标客户 <br/>
                        <strong>pop-up advertisement</strong> 弹出式广告 <br/>
                        <strong>banner</strong> n. 横幅广告
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. "be starved of essential information" 译为"缺乏必要的信息"，be starved of 是形象化表达，意为"匮乏"。<br/>
                        2. "unless customers are prepared to sign release agreements" 译为"除非客户愿意签署授权协议"，release agreement 是法律术语，指"数据使用授权协议"。<br/>
                        3. "Not only can AI help..." 倒装结构翻译时保持正常语序"人工智能不仅能帮助……"。<br/>
                        4. "Data can be gathered on where..." 被动语态翻译时补充主语"研究人员"，使句子更自然。
                    </div>
                </div>
            `
        },
        "The non-intrusive delivery of the marketing messages in a way that is sensitive to the needs of target customers is one of the critical challenges to the digital marketer.": {
            translation: "以一种能够体察目标客户需求的方式进行非侵入式的营销信息投放，是数字营销人员面临的关键挑战之一。",
            analysis: `
                <div class="pp-analysis-section">
                    <h4>句型结构</h4>
                    <div class="pp-analysis-item">
                        <strong>1. 长主语结构</strong>：整个句子的主语是 "The non-intrusive delivery... target customers"，中心词是 delivery，前后有多个修饰成分。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>2. 定语从句</strong>："that is sensitive to the needs of target customers" 是定语从句，修饰 way。
                    </div>
                    <div class="pp-analysis-item">
                        <strong>3. 主系表结构</strong>：句子主干是 "The... delivery... is one of the critical challenges"。
                    </div>
                    
                    <h4>重点词汇</h4>
                    <div class="pp-analysis-item">
                        <strong>non-intrusive</strong> adj. 非侵入性的，不干扰的 <br/>
                        <strong>delivery</strong> n. 投放，递送；交付 <br/>
                        <strong>be sensitive to</strong> 对……敏感/体察 <br/>
                        <strong>critical</strong> adj. 关键的，至关重要的 <br/>
                        <strong>digital marketer</strong> 数字营销人员
                    </div>
                    
                    <h4>翻译技巧</h4>
                    <div class="pp-analysis-item">
                        1. 长主语的处理：英文句子主语很长，翻译时需要转化为中文的动宾结构"以……的方式进行……投放"，避免头重脚轻。<br/>
                        2. "sensitive to the needs" 译为"体察……需求"，比"对需求敏感"更符合营销语境。<br/>
                        3. "one of the critical challenges to the digital marketer" 译为"数字营销人员面临的关键挑战之一"，将介词短语 to 转化为"面临的"，更通顺自然。
                    </div>
                </div>
            `
        }
    };

    function render(paper, backCallback) {
        currentPaper = paper;
        onBack = backCallback;
        currentSectionIndex = 0;

        const container = document.getElementById('pastPapersContainer');
        if (!container) return;

        translationSections = paper.sections.filter(s => s.type === 'translation');
        if (translationSections.length === 0) {
            container.innerHTML = `
                <div class="pp-subpage">
                    <div class="pp-subpage-header">
                        <button class="pp-back-btn" id="ppBackBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 12H5"></path>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            返回
                        </button>
                        <h2>${paper.year} ${paper.type}</h2>
                    </div>
                    <div style="padding:40px; text-align:center; color:var(--text-secondary);">
                        暂无翻译题目
                    </div>
                </div>
            `;
            document.getElementById('ppBackBtn').addEventListener('click', onBack);
            return;
        }

        const section = translationSections[0];
        const isSentenceMode = !!section.sentences && section.sentences.length > 0;

        if (isSentenceMode) {
            const totalSentences = section.sentences.length;

            container.innerHTML = `
                <div class="pp-reader">
                    <div class="pp-reader-header">
                        <button class="pp-back-btn" id="ppBackBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 12H5"></path>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            返回
                        </button>
                        <div class="pp-reader-title">
                            <h2>${paper.year} ${paper.type}</h2>
                            <span class="pp-reader-subtitle">翻译</span>
                        </div>
                        <div class="pp-reader-actions">
                        </div>
                    </div>

                    <div class="pp-tab-bar" id="ppTabBar">
                        ${section.sentences.map((s, i) =>
                            `<button class="pp-tab-btn ${i === 0 ? 'active' : ''}" data-index="${i}">句子 ${s.num}</button>`
                        ).join('')}
                    </div>

                    <div class="pp-reader-content" id="ppReaderContent">
                    </div>

                    <div class="pp-translation-nav">
                        <button class="pp-nav-btn" id="ppPrevBtn" disabled>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6"></path>
                            </svg>
                            上一句
                        </button>
                        <span class="pp-nav-info" id="ppNavInfo">第 1 句 / 共 ${totalSentences} 句</span>
                        <button class="pp-nav-btn" id="ppNextBtn" ${totalSentences <= 1 ? 'disabled' : ''}>
                            下一句
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18l6-6-6-6"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('ppBackBtn').addEventListener('click', onBack);

            document.getElementById('ppTabBar').querySelectorAll('.pp-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.index);
                    switchSection(idx);
                });
            });

            document.getElementById('ppPrevBtn').addEventListener('click', () => {
                if (currentSectionIndex > 0) {
                    switchSection(currentSectionIndex - 1);
                }
            });

            document.getElementById('ppNextBtn').addEventListener('click', () => {
                const section = translationSections[0];
                if (currentSectionIndex < section.sentences.length - 1) {
                    switchSection(currentSectionIndex + 1);
                }
            });

            renderSection(0);
        } else {
            container.innerHTML = `
                <div class="pp-reader">
                    <div class="pp-reader-header">
                        <button class="pp-back-btn" id="ppBackBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 12H5"></path>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            返回
                        </button>
                        <div class="pp-reader-title">
                            <h2>${paper.year} ${paper.type}</h2>
                            <span class="pp-reader-subtitle">翻译</span>
                        </div>
                        <div class="pp-reader-actions">
                        </div>
                    </div>

                    <div class="pp-reader-content" id="ppReaderContent">
                    </div>
                </div>
            `;

            document.getElementById('ppBackBtn').addEventListener('click', onBack);
            renderPassage();
        }
    }

    function switchSection(index) {
        const section = translationSections[0];
        if (index < 0 || index >= section.sentences.length) return;

        const buttons = document.querySelectorAll('.pp-tab-btn');
        buttons.forEach((b, i) => {
            b.classList.toggle('active', i === index);
        });

        currentSectionIndex = index;
        renderSection(index);
        updateNavButtons();
    }

    function updateNavButtons() {
        const section = translationSections[0];
        const prevBtn = document.getElementById('ppPrevBtn');
        const nextBtn = document.getElementById('ppNextBtn');
        const navInfo = document.getElementById('ppNavInfo');

        if (prevBtn) {
            prevBtn.disabled = currentSectionIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentSectionIndex === section.sentences.length - 1;
        }
        if (navInfo) {
            navInfo.textContent = `第 ${currentSectionIndex + 1} 句 / 共 ${section.sentences.length} 句`;
        }
    }

    function renderPassage() {
        const section = translationSections[0];
        if (!section) return;

        const content = document.getElementById('ppReaderContent');
        if (!content) return;

        const passageText = section.passage || section.rawText || '';

        content.innerHTML = `
            <div class="pp-translation">
                <div class="pp-translation-article">
                    <h3 class="pp-article-title">原文</h3>
                    <div class="pp-translation-text">${escapeHtml(passageText)}</div>
                </div>

                <div class="pp-translation-accordion">
                    <div class="pp-ls-item">
                        <button class="pp-ls-toggle" id="translationToggle">
                            <span>参考译文</span>
                            <span class="pp-ls-arrow">▼</span>
                        </button>
                        <div class="pp-ls-detail" id="translationDetail" style="display:none;">
                            <div class="pp-translation-chinese">${generatePassageTranslation(passageText)}</div>
                        </div>
                    </div>

                    <div class="pp-ls-item">
                        <button class="pp-ls-toggle" id="analysisToggle">
                            <span>翻译解析</span>
                            <span class="pp-ls-arrow">▼</span>
                        </button>
                        <div class="pp-ls-detail" id="analysisDetail" style="display:none;">
                            ${generatePassageAnalysis(passageText)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const translationToggle = document.getElementById('translationToggle');
        const translationDetail = document.getElementById('translationDetail');
        if (translationToggle && translationDetail) {
            translationToggle.addEventListener('click', () => {
                translationToggle.classList.toggle('open');
                translationDetail.style.display = translationToggle.classList.contains('open') ? 'block' : 'none';
            });
        }

        const analysisToggle = document.getElementById('analysisToggle');
        const analysisDetail = document.getElementById('analysisDetail');
        if (analysisToggle && analysisDetail) {
            analysisToggle.addEventListener('click', () => {
                analysisToggle.classList.toggle('open');
                analysisDetail.style.display = analysisToggle.classList.contains('open') ? 'block' : 'none';
            });
        }
    }

    function renderSection(index) {
        const section = translationSections[0];
        if (!section || !section.sentences) return;

        const sentence = section.sentences[index];
        if (!sentence) return;

        const content = document.getElementById('ppReaderContent');
        if (!content) return;

        const cleanText = sentence.text.replace(/\s*\(\s*$/, '').trim();

        content.innerHTML = `
            <div class="pp-translation">
                <div class="pp-translation-article">
                    <h3 class="pp-article-title">原文（句子 ${sentence.num}）</h3>
                    <div class="pp-translation-text">${escapeHtml(cleanText)}</div>
                </div>

                <div class="pp-translation-accordion">
                    <div class="pp-ls-item">
                        <button class="pp-ls-toggle" id="translationToggle">
                            <span>参考译文</span>
                            <span class="pp-ls-arrow">▼</span>
                        </button>
                        <div class="pp-ls-detail" id="translationDetail" style="display:none;">
                            <div class="pp-translation-chinese">${generateTranslation(sentence.text)}</div>
                        </div>
                    </div>

                    <div class="pp-ls-item">
                        <button class="pp-ls-toggle" id="analysisToggle">
                            <span>句子解析</span>
                            <span class="pp-ls-arrow">▼</span>
                        </button>
                        <div class="pp-ls-detail" id="analysisDetail" style="display:none;">
                            ${generateAnalysis(sentence.text)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const translationToggle = document.getElementById('translationToggle');
        const translationDetail = document.getElementById('translationDetail');
        if (translationToggle && translationDetail) {
            translationToggle.addEventListener('click', () => {
                translationToggle.classList.toggle('open');
                translationDetail.style.display = translationToggle.classList.contains('open') ? 'block' : 'none';
            });
        }

        const analysisToggle = document.getElementById('analysisToggle');
        const analysisDetail = document.getElementById('analysisDetail');
        if (analysisToggle && analysisDetail) {
            analysisToggle.addEventListener('click', () => {
                analysisToggle.classList.toggle('open');
                analysisDetail.style.display = analysisToggle.classList.contains('open') ? 'block' : 'none';
            });
        }
    }

    function findTranslationEntry(text) {
        let normalizedText = text.trim().replace(/\s+/g, ' ');
        normalizedText = normalizedText.replace(/[\s(（]*\d*[\s)）]*\.?$/, '').trim();
        normalizedText = normalizedText.replace(/[""''"]+$/g, '').trim();
        
        for (const [key, value] of Object.entries(translationDB)) {
            const normalizedKey = key.trim().replace(/\s+/g, ' ');
            if (normalizedText === normalizedKey) {
                return { key, value };
            }
        }

        for (const [key, value] of Object.entries(translationDB)) {
            const normalizedKey = key.trim().replace(/\s+/g, ' ');
            if (normalizedText.includes(normalizedKey) || normalizedKey.includes(normalizedText)) {
                const overlap = Math.min(normalizedText.length, normalizedKey.length);
                const similarity = Math.abs(normalizedText.length - normalizedKey.length) / overlap;
                if (similarity < 0.3) {
                    return { key, value };
                }
            }
        }

        return null;
    }

    function generateTranslation(text) {
        const entry = findTranslationEntry(text);
        if (entry) {
            return entry.value.translation;
        }

        return '暂未提供参考译文。建议结合上下文理解句子结构，重点关注划线部分的语法和词汇。';
    }

    function generateAnalysis(text) {
        const entry = findTranslationEntry(text);
        if (entry) {
            return entry.value.analysis;
        }

        return `
            <div class="pp-analysis-section">
                <h4>句子结构分析</h4>
                <p>该句子尚未收录详细解析。建议从以下角度进行分析：</p>
                <div class="pp-analysis-item">
                    <strong>1. 句子类型</strong>：判断是简单句、并列句还是复合句，找出主句和从句。
                </div>
                <div class="pp-analysis-item">
                    <strong>2. 核心成分</strong>：识别主语、谓语、宾语、表语等主要句子成分。
                </div>
                <div class="pp-analysis-item">
                    <strong>3. 修饰成分</strong>：分析定语、状语、补语等修饰成分及其功能。
                </div>
                <div class="pp-analysis-item">
                    <strong>4. 特殊结构</strong>：注意强调句、倒装句、省略句等特殊句式。
                </div>
                <h4>翻译建议</h4>
                <p>建议先理解句子整体意思，再逐句分析语法结构，最后组织成通顺的中文表达。遇到复杂长句时，可以先拆分再整合。</p>
            </div>
        `;
    }

    function generatePassageTranslation(text) {
        const section = translationSections[0];
        if (section && section.translation) {
            return section.translation;
        }
        return '暂未提供参考译文。建议先通读全文理解大意，再逐句翻译，最后通读润色，确保译文通顺自然。';
    }

    function generatePassageAnalysis(text) {
        const section = translationSections[0];
        if (section && section.analysis) {
            return section.analysis;
        }
        return `
            <div class="pp-analysis-section">
                <h4>篇章分析</h4>
                <p>该篇章尚未收录详细解析。建议从以下角度进行分析：</p>
                <div class="pp-analysis-item">
                    <strong>1. 文章主题</strong>：通读全文，把握文章的中心思想和核心话题。
                </div>
                <div class="pp-analysis-item">
                    <strong>2. 段落结构</strong>：分析各段落的功能和逻辑关系，梳理文章的行文脉络。
                </div>
                <div class="pp-analysis-item">
                    <strong>3. 重点词汇</strong>：标记文中的高频词汇、核心术语和固定搭配。
                </div>
                <div class="pp-analysis-item">
                    <strong>4. 长难句</strong>：找出文中的复杂长句，分析其语法结构和翻译要点。
                </div>
                <h4>翻译建议</h4>
                <p>英语二翻译为整篇文章翻译，建议采用"通读—翻译—润色"三步法：先通读全文理解大意，再逐句翻译注意衔接，最后通读润色确保译文流畅自然，符合中文表达习惯。</p>
            </div>
        `;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        render
    };
})();

window.Translation = Translation;
