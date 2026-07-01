/**
 * 长难句分析模块
 * 功能：展示真题中的长难句，分层查看主干/翻译/语法
 */
const LongSentence = (() => {
    let sentences = [];
    let currentIndex = 0;
    let onBack = null;

    const defaultSentences = [
        {
            source: '2025 英语一 Text 1',
            sentence: 'The randomised control trial involved hundreds of year 5 pupils — aged nine and ten — at 45 state primary schools that had not been "previously exposed to RSC pedagogy."',
            main: 'The randomised control trial involved hundreds of year 5 pupils.',
            translation: '这项随机对照试验涉及45所公立小学的数百名五年级学生（年龄在9到10岁之间），这些学校此前"未接触过皇家莎士比亚剧团的教学法"。',
            analysis: '主句主语 The randomised control trial，谓语 involved，宾语 hundreds of year 5 pupils。破折号中间 aged nine and ten 是插入语，补充说明学生年龄。that 引导定语从句修饰 schools。重点词汇：randomised control trial（随机对照试验），be exposed to（接触），pedagogy（教学法）。'
        },
        {
            source: '2025 英语一 Text 1',
            sentence: 'They also "appear to be more comfortable writing in role...while [control] pupils imagine how they themselves would react to being shipwrecked, [target] children put themselves in the shoes of a literary character and express that character\'s emotion".',
            main: 'They also appear to be more comfortable writing in role.',
            translation: '他们还"似乎更能自如地以角色身份写作……当（对照组）学生想象自己遭遇海难会如何反应时，（实验组）孩子们会站在文学角色的角度，表达那个角色的情感"。',
            analysis: '主句主系表结构。while 引导时间/对比状语从句，状语从句内部有两套主谓结构，形成对比。put oneself in the shoes of 是固定搭配，意为"设身处地"。重点词汇：write in role（角色扮演写作），shipwrecked（遭遇海难的），literary character（文学角色）。'
        },
        {
            source: '2025 英语一 Text 1',
            sentence: 'The research shows that the way actors work makes a big difference to the way children use language and also how they think about themselves.',
            main: 'The research shows that the way makes a big difference.',
            translation: '研究表明，演员的工作方式对儿童使用语言的方式以及他们如何看待自己产生了很大影响。',
            analysis: 'that 引导宾语从句，从句主语是 the way actors work（actors work 是省略关系代词的定语从句），谓语 makes。and 连接两个宾语 the way... 和 how...。重点搭配：make a big difference to（对……产生重大影响）。'
        },
        {
            source: '2025 英语一 Text 1',
            sentence: 'The peer-reviewed results showed that the target group of pupils drew on a wider vocabulary, used words "classed as more sophisticated or rarer", and wrote at greater length.',
            main: 'The results showed that the group drew on vocabulary, used words, and wrote.',
            translation: '经过同行评审的结果显示，实验组学生使用了更广泛的词汇，使用了"更复杂或更罕见"的词汇，并且写作篇幅更长。',
            analysis: 'that 引导宾语从句，从句主语 the target group，有三个并列谓语：drew on、used、wrote。过去分词短语 classed as... 作后置定语修饰 words。重点词汇：peer-reviewed（同行评审的），draw on（使用，利用），sophisticated（复杂的）。'
        },
        {
            source: '2025 英语一 Text 2',
            sentence: 'It is unarguable that our laboratories, scientific instruments, rockets and satellites — the tools we scientists need to measure the planet\'s pulse — demand significant amounts of energy both in their construction and operation.',
            main: 'It is unarguable that our tools demand significant amounts of energy.',
            translation: '毫无疑问，我们的实验室、科学仪器、火箭和卫星——我们科学家用来测量地球脉搏的工具——在建造和运行过程中都需要大量能源。',
            analysis: 'It 作形式主语，真正主语是 that 引导的主语从句。破折号中间是插入语，解释说明前面的工具。both...and... 连接两个并列介词短语。重点词汇：unarguable（无可争辩的），planet\'s pulse（地球脉搏，指地球状况）。'
        },
        {
            source: '2025 英语一 Text 2',
            sentence: 'How can we inform decision makers about the best ways to bring down carbon emissions if we can\'t track the amount of carbon dioxide in the atmosphere, where it\'s coming from and who\'s producing it?',
            main: 'How can we inform decision makers about the ways?',
            translation: '如果我们无法追踪大气中的二氧化碳含量、它的来源以及谁在排放，我们如何向决策者提供减少碳排放的最佳方法？',
            analysis: '这是一个特殊疑问句。if 引导条件状语从句。从句中有三个并列宾语：the amount、where it\'s coming from、who\'s producing it。重点搭配：bring down（降低），carbon emissions（碳排放），inform sb about sth（告知某人某事）。'
        },
        {
            source: '2025 英语一 Text 2',
            sentence: 'It can be hard for scientists to make the case because our work is complex, often takes place behind closed doors and does not always lend itself to easy interpretation or explanation.',
            main: 'It can be hard for scientists to make the case.',
            translation: '科学家们很难证明这一点，因为我们的工作很复杂，通常在闭门状态下进行，而且并不总是容易解释或理解。',
            analysis: 'It 作形式主语，真正主语是不定式 to make the case。because 引导原因状语从句，从句中有三个并列谓语：is、takes place、does not lend itself to。重点搭配：make the case（证明理由），lend itself to（适合于）。'
        },
        {
            source: '2025 英语一 Text 3',
            sentence: 'Ever since taking on Netflix Inc. at its own game, old Hollywood has struggled to turn a profit in streaming, with the likes of Disney+, Peacock and Paramount+ losing billions of dollars each year, sparking concerns that the services will never be as profitable as cable once was.',
            main: 'Old Hollywood has struggled to turn a profit in streaming.',
            translation: '自从在自己的领域与奈飞公司竞争以来，老牌好莱坞一直难以在流媒体领域盈利，迪士尼+、孔雀和派拉蒙+等平台每年亏损数十亿美元，这引发了人们的担忧，即这些服务可能永远不会像有线电视曾经那样盈利。',
            analysis: 'ever since 引导时间状语（省略了主语和be动词）。主句主语 old Hollywood，谓语 has struggled。with 引导的复合结构作伴随状语。现在分词 sparking... 作结果状语。that 引导同位语从句解释 concerns。重点搭配：take on（与……较量），turn a profit（盈利）。'
        },
        {
            source: '2025 英语一 Text 3',
            sentence: 'But the age of streaming has been a boon for some unintended winners: pirates that use software to rip a film or television show in seconds from legitimate online video platforms and host the titles on their own, illegitimate services, which rake in about $2 billion annually from ads and subscriptions.',
            main: 'The age of streaming has been a boon for some unintended winners.',
            translation: '但流媒体时代对一些意想不到的赢家来说是一件好事：盗版者使用软件在几秒钟内从合法在线视频平台翻录电影或电视节目，并在自己的非法服务上托管这些内容，每年从广告和订阅中赚取约20亿美元。',
            analysis: '主句主系表结构。冒号后是对 winners 的解释说明。that 引导定语从句修饰 pirates，从句有两个并列谓语 use 和 host。which 引导非限定性定语从句修饰 services。重点词汇：boon（恩惠，裨益），rip（翻录），legitimate（合法的），rake in（大量赚取）。'
        },
        {
            source: '2025 英语一 Text 4',
            sentence: 'Yet how was that universality of access made possible and, perhaps more importantly, how is it maintained?',
            main: 'How was that universality made possible and how is it maintained?',
            translation: '然而，这种获取的普遍性是如何实现的，也许更重要的是，它是如何维持的？',
            analysis: '这是一个由 and 连接的两个并列特殊疑问句。两个疑问句都使用了被动语态。插入语 perhaps more importantly 表示强调。重点词汇：universality（普遍性），access（获取，使用）。'
        },
        {
            source: '2025 英语一 完形填空',
            sentence: 'Covering about two and a half acres, Pavlopetri\'s three main roads connected some 50 rectangular buildings, all of which had open courtyards.',
            main: 'Pavlopetri\'s three main roads connected some 50 rectangular buildings.',
            translation: '帕夫洛佩特里占地约2.5英亩，三条主路连接着约50座矩形建筑，所有建筑都带有开放式庭院。',
            analysis: '现在分词短语 Covering... 作状语。主句主语 three main roads，谓语 connected，宾语 buildings。all of which 引导非限定性定语从句修饰 buildings。重点词汇：rectangular（矩形的），courtyard（庭院）。'
        },
        {
            source: '2025 英语一 完形填空',
            sentence: 'Excavations revealed a large number of Minoan-style loom weights, suggesting Pavlopetri was a thriving trade center with a robust textile industry.',
            main: 'Excavations revealed a large number of loom weights.',
            translation: '挖掘发现了大量米诺斯风格的织机坠子，表明帕夫洛佩特里曾是一个繁荣的贸易中心，拥有强大的纺织业。',
            analysis: '现在分词短语 suggesting... 作结果状语。suggesting 后面是宾语从句，省略了连接词 that。with 引导的介词短语作后置定语修饰 center。重点词汇：excavation（挖掘），thriving（繁荣的），robust（强健的）。'
        },
        {
            source: '2025 英语二 Text 1',
            sentence: 'U.S. customers historically tipped people they assumed were earning most of their income via tips, such as restaurant servers earning less than the minimum wage.',
            main: 'U.S. customers tipped people.',
            translation: '历史上，美国顾客会给他们认为主要收入来自小费的人小费，比如收入低于最低工资的餐厅服务员。',
            analysis: '主句主语 U.S. customers，谓语 tipped，宾语 people。they assumed 是插入语，were earning... 是定语从句修饰 people，省略了关系代词 who。such as 引出举例。重点词汇：tip（给小费），minimum wage（最低工资）。'
        },
        {
            source: '2025 英语二 Text 1',
            sentence: 'The prevalence of digital payment devices has made it easier to ask customers for a tip, which helps explain why tip requests are creeping into new kinds of services.',
            main: 'The prevalence has made it easier to ask customers for a tip.',
            translation: '数字支付设备的普及使得向顾客索要小费变得更容易，这有助于解释为什么小费要求正在悄然进入新的服务类型。',
            analysis: '主句主语 The prevalence，谓语 has made，it 是形式宾语，真正宾语是不定式 to ask...。which 引导非限定性定语从句，修饰前面整个句子。why 引导宾语从句作 explain 的宾语。重点词汇：prevalence（普及），creep into（悄悄进入）。'
        },
        {
            source: '2025 英语二 Text 2',
            sentence: 'When it was established, the National Health Service (NHS) was visionary: offering high-quality, timely care to meet the dominant needs of the population it served.',
            main: 'The National Health Service was visionary.',
            translation: '国民保健制度（NHS）在建立时是有远见的：提供高质量、及时的医疗服务，以满足其所服务人群的主要需求。',
            analysis: 'when 引导时间状语从句。主句主系表结构。冒号后是现在分词短语作状语，解释说明 visionary 的具体内容。it served 是省略关系代词的定语从句修饰 population。重点词汇：visionary（有远见的），timely（及时的），dominant（主要的）。'
        },
        {
            source: '2025 英语二 Text 2',
            sentence: 'With more than 6.8 million on waitlists, healthcare is becoming increasingly inaccessible for those who cannot opt to pay for private treatment; and the cost of providing healthcare is increasingly squeezing our investment in other public services.',
            main: 'Healthcare is becoming inaccessible; the cost is squeezing investment.',
            translation: '由于有680多万人在等候名单上，对于那些不能选择支付私人治疗费用的人来说，医疗保健正变得越来越难以获得；而提供医疗保健的成本正日益挤压我们在其他公共服务上的投资。',
            analysis: '分号连接两个并列分句。第一个分句：with 复合结构作状语，who 引导定语从句修饰 those。第二个分句为主谓宾结构。重点词汇：waitlist（等候名单），inaccessible（难以获得的），opt to（选择），squeeze（挤压）。'
        },
        {
            source: '2025 英语二 Text 3',
            sentence: 'But implementation of existing HAPs has been uneven, according to a report from the center for Policy Research, which found that many lack adequate funding and their triggering thresholds often are not customized to the local climate.',
            main: 'Implementation has been uneven.',
            translation: '但根据政策研究中心的一份报告，现有高温行动计划的实施并不均衡，该报告发现许多计划缺乏足够资金，而且其触发阈值通常没有适应当地气候。',
            analysis: '主句主系表结构。according to... 作状语。which 引导非限定性定语从句修饰 report，从句中 found 后接 that 引导的宾语从句，宾语从句由 and 连接两个并列分句。重点词汇：implementation（实施），uneven（不均衡的），threshold（阈值），customize（定制）。'
        },
        {
            source: '2025 英语二 Text 4',
            sentence: 'Often appearing as trodden dirt tracks through otherwise neat green spaces, these routes of collective disobedience cut corners, bisect lawns and cross hills, representing the natural capability of people (and animals) to go from point A to point B most effectively.',
            main: 'These routes cut corners, bisect lawns and cross hills.',
            translation: '这些集体选择的路线通常表现为在原本整洁的绿地中踏出的泥土小径，它们抄近路、横穿草坪、翻越山丘，体现了人类（和动物）最有效地从A点到B点的自然能力。',
            analysis: '现在分词短语 Often appearing... 作状语。主句主语 these routes，有三个并列谓语：cut、bisect、cross。现在分词短语 representing... 作结果/伴随状语。重点词汇：trodden（被踩出的），bisect（平分，横穿），collective disobedience（集体不从，指集体选择）。'
        },
        {
            source: '2024 英语一 Text 1',
            sentence: 'The likely explanation is that the withdrawal was rushed, and they didn\'t want the local Caledonians getting their hands on 10 tons of weapon-grade iron.',
            main: 'The explanation is that the withdrawal was rushed and they didn\'t want Caledonians getting iron.',
            translation: '可能的解释是，撤退很仓促，他们不想让当地的喀里多尼亚人得到10吨武器级的铁。',
            analysis: '主句主系表结构，that 引导表语从句。表语从句由 and 连接两个并列分句。第二个分句使用 want sb doing sth 结构。重点词汇：withdrawal（撤退），rushed（仓促的），get one\'s hands on（得到）。'
        },
        {
            source: '2024 英语一 Text 1',
            sentence: 'As Roma Agrawal explains in her new delightful book Nuts and Bolts, early 17th-century Virginians would sometimes burn down their homes if they were planning to relocate.',
            main: 'Virginians would burn down their homes.',
            translation: '正如罗马·阿格拉瓦尔在她令人愉快的新书《螺母与螺栓》中解释的那样，17世纪早期的弗吉尼亚人如果计划搬迁，有时会烧毁他们的房屋。',
            analysis: 'as 引导方式状语从句，意为"正如"。主句主语 Virginians，谓语 would burn down，宾语 their homes。if 引导条件状语从句。重点词汇：delightful（令人愉快的），relocate（搬迁）。'
        },
        {
            source: '2024 英语一 Text 1',
            sentence: 'The idea that one might burn down an entire house just to reclaim the nails underlines how scarce, costly and valuable the simple-seeming technology was.',
            main: 'The idea underlines how scarce, costly and valuable the technology was.',
            translation: '一个人可能会为了回收钉子而烧毁整座房子的想法，凸显了这项看似简单的技术是多么稀缺、昂贵和有价值。',
            analysis: '主句主语 The idea，谓语 underlines，宾语是 how 引导的宾语从句。that 引导同位语从句解释 idea 的内容。宾语从句为感叹句结构。重点词汇：reclaim（回收），underline（强调，凸显），scarce（稀缺的）。'
        },
        {
            source: '2024 英语一 Text 2',
            sentence: 'Parenting tips obtained from hunter-gatherers in Africa may be the key to bringing up more contented children, researchers have suggested.',
            main: 'Parenting tips may be the key.',
            translation: '研究人员表明，从非洲狩猎采集者那里获得的育儿技巧可能是培养更知足的孩子的关键。',
            analysis: '主句主语 Parenting tips（过去分词短语 obtained from... 作后置定语），谓语 may be，表语 the key。researchers have suggested 是插入语/主句。重点词汇：hunter-gatherer（狩猎采集者），contented（满足的）。'
        },
        {
            source: '2024 英语一 Text 2',
            sentence: 'In a paper published in the Journal of Child Psychology and Psychiatry, researchers said that the western nuclear family was a recent invention which broke with evolutionary history.',
            main: 'Researchers said that the nuclear family was an invention.',
            translation: '在发表于《儿童心理学与精神病学杂志》的一篇论文中，研究人员表示，西方核心家庭是最近的发明，打破了进化历史。',
            analysis: '介词短语 In a paper... 作状语（过去分词短语 published... 作后置定语）。主句主语 researchers，谓语 said，that 引导宾语从句。which 引导定语从句修饰 invention。重点词汇：nuclear family（核心家庭），break with（打破）。'
        },
        {
            source: '2024 英语一 Text 3',
            sentence: 'A Polish digital artist who uses classical painting styles to create dreamy fantasy landscapes, Greg Rutkowski has made illustrations for games such as Dungeons & Dragons and Magic: The Gathering.',
            main: 'Greg Rutkowski has made illustrations for games.',
            translation: '格雷格·鲁特科夫斯基是一位波兰数字艺术家，他使用古典绘画风格创造梦幻般的奇幻风景，他为《龙与地下城》和《万智牌》等游戏制作了插图。',
            analysis: '句首的名词短语 A Polish digital artist... 是同位语，解释说明主语 Greg Rutkowski。who 引导定语从句修饰 artist。主句主谓宾结构。重点词汇：digital artist（数字艺术家），dreamy（梦幻般的），illustration（插图）。'
        },
        {
            source: '2024 英语一 Text 3',
            sentence: 'The tool, along with other popular image-generation AI models, allows anyone to create impressive images based on text prompts.',
            main: 'The tool allows anyone to create images.',
            translation: '这个工具，连同其他流行的图像生成人工智能模型，允许任何人基于文本提示创建令人印象深刻的图像。',
            analysis: '主句主语 The tool，谓语 allows，宾语 anyone，宾语补足语 to create...。along with... 是插入语，不影响主语的数。based on... 作后置定语修饰 images。重点搭配：along with（连同），allow sb to do sth（允许某人做某事）。'
        },
        {
            source: '2024 英语一 Text 4',
            sentence: 'The miracle of the Chesapeake Bay lies not in its depths, but in the complexity of its natural construction, the interaction of fresh and saline waters, and the mix of land and water.',
            main: 'The miracle lies not in its depths, but in the complexity, interaction and mix.',
            translation: '切萨皮克湾的奇迹不在于其深度，而在于其自然构造的复杂性、淡水与咸水的相互作用以及陆地与水的混合。',
            analysis: '主句主语 The miracle，谓语 lies，状语 not in... but in... 结构表示"不在于……而在于……"。but in 后有三个并列的名词短语：the complexity、the interaction、the mix。重点词汇：miracle（奇迹），saline（咸的），lie in（在于）。'
        },
        {
            source: '2024 英语一 Text 4',
            sentence: 'All this was put at great risk late last month, when the U.S. Supreme Court issued a ruling in an Idaho case that provides the U.S. Environmental Protection Agency (EPA) far less authority to regulate wetlands and waterways.',
            main: 'All this was put at great risk.',
            translation: '所有这一切在上个月底都面临巨大风险，当时美国最高法院在爱达荷州的一起案件中发布了一项裁决，该裁决大大削弱了美国环境保护署（EPA）监管湿地和水道的权力。',
            analysis: '主句是被动语态。when 引导非限定性定语从句修饰 late last month。that 引导定语从句修饰 ruling。provide sb sth 双宾语结构。重点搭配：put at risk（使处于风险中），issue a ruling（发布裁决），regulate（监管）。'
        },
        {
            source: '2024 英语一 完形填空',
            sentence: 'Replacing swing doors, these smaller buildings to maximise the usable space inside without having to clear the way for a large, sticking-out door.',
            main: 'These allow smaller buildings to maximise space.',
            translation: '这些（自动门）取代了平开门，使较小的建筑能够最大化内部可用空间，而不必为一扇突出的大门腾出空间。',
            analysis: '现在分词短语 Replacing... 作状语。主句主语 these（指代自动门），谓语 allow，宾语 smaller buildings，宾语补足语 to maximise...。without 引导的介词短语作状语。重点词汇：maximise（最大化），usable（可用的），clear the way for（为……腾出空间）。'
        },
        {
            source: '2023 英语一 Text 1',
            sentence: 'The weather in Texas may have cooled since the recent extreme heat, but the temperature will be high at the State Board of Education meeting in Austin this month as officials debate how climate change is taught in Texas schools.',
            main: 'The weather may have cooled, but the temperature will be high.',
            translation: '自从最近的极端高温以来，德克萨斯州的天气可能已经降温，但本月在奥斯汀举行的州教育委员会会议上气氛将会很热烈，因为官员们正在辩论德克萨斯州学校如何教授气候变化。',
            analysis: 'but 连接两个并列分句，形成对比。第一个分句：may have cooled 表示对过去的推测。第二个分句：as 引导原因状语从句，how 引导宾语从句作 debate 的宾语。重点词汇：extreme heat（极端高温），debate（辩论）。'
        },
        {
            source: '2023 英语一 Text 1',
            sentence: 'A study last year by the National Center for Science Education, a non-profit group of scientists and teachers, looking at how state public schools across the country address climate change in science classes, gave barely half of US states a grade B+ or higher.',
            main: 'A study gave barely half of US states a grade B+ or higher.',
            translation: '去年，由科学家和教师组成的非营利组织国家科学教育中心进行了一项研究，调查全国各州公立学校如何在科学课上讲授气候变化，该研究仅给美国一半的州评为B+或更高。',
            analysis: '主句主语 A study，谓语 gave，双宾语：barely half of US states 和 a grade B+ or higher。a non-profit group... 是同位语。现在分词短语 looking at... 作后置定语修饰 study，how 引导宾语从句。重点词汇：address（处理，讲授），barely（仅仅，几乎不）。'
        },
        {
            source: '2023 英语一 Text 2',
            sentence: 'Now, with record-high home prices and historically low inventory, there\'s an increased urgency in such regulation, particularly among those who worry that developers will come in and buy up swaths of housing to flip for a fortune on the short-term rental market.',
            main: 'There\'s an increased urgency in such regulation.',
            translation: '现在，由于房价创历史新高、库存处于历史低位，这种监管的紧迫性日益增加，尤其是在那些担心开发商会进入并购买大片住房以在短期租赁市场上快速转手赚大钱的人当中。',
            analysis: 'there be 句型。with 复合结构作原因状语。particularly among those... 作状语，who 引导定语从句修饰 those。定语从句中 that 引导宾语从句作 worry 的宾语，宾语从句有两个并列谓语 will come in 和 buy up。重点词汇：inventory（库存），urgency（紧迫性），swath of（大片的），flip（快速转手）。'
        },
        {
            source: '2023 英语一 Text 2',
            sentence: 'Issues arise, however, when developers attempt to create large-scale short-term rental facilities — de facto hotels — to bypass taxes and regulations.',
            main: 'Issues arise when developers attempt to create facilities.',
            translation: '然而，当开发商试图创建大规模的短期租赁设施——事实上的酒店——以逃避税收和监管时，问题就出现了。',
            analysis: '主句主语 Issues，谓语 arise。when 引导时间状语从句。破折号中间 de facto hotels 是插入语，解释说明 facilities。不定式短语 to bypass... 作目的状语。重点词汇：de facto（事实上的），bypass（绕过，逃避）。'
        },
        {
            source: '2023 英语一 Text 3',
            sentence: 'If you\'re heading for your nearest branch of Waterstones, the biggest book retailer in the UK, in search of the Duchess of Sussex\'s new children\'s book The Bench, you might have to be prepared to hunt around a bit.',
            main: 'You might have to be prepared to hunt around a bit.',
            translation: '如果你正前往英国最大的图书零售商水石书店最近的分店，寻找苏塞克斯公爵夫人的新儿童读物《长椅》，你可能得准备好四处搜寻一番。',
            analysis: 'if 引导条件状语从句。状语从句中：the biggest book retailer... 是同位语，解释说明 Waterstones。in search of... 作目的状语。主句谓语 might have to be prepared to...。重点词汇：head for（前往），in search of（寻找），hunt around（四处搜寻）。'
        },
        {
            source: '2023 英语一 Text 3',
            sentence: 'Big-name PRH authors may suffer a bit, but it\'s those mid-list authors, who normally rely on Waterstones staff\'s passion for promoting books by lesser-known writers, who will be praying for an end to the dispute.',
            main: 'Big-name authors may suffer, but it\'s those mid-list authors who will be praying.',
            translation: '企鹅兰登书屋的大牌作者可能会受到一些影响，但那些通常依靠水石书店员工推广不太知名作家作品的热情的中层作者，将祈祷争端结束。',
            analysis: 'but 连接两个并列分句。第二个分句是强调句 it is... who... 结构，被强调部分是 those mid-list authors。who 引导非限定性定语从句修饰 authors。重点词汇：big-name（大名鼎鼎的），mid-list（中层的），pray for（祈祷）。'
        },
        {
            source: '2023 英语一 Text 4',
            sentence: 'The careers of scientists and the reputation of their institutions depend on the number and prestige of the papers they produce, but even more so on the citations attracted by these papers.',
            main: 'The careers and reputation depend on the number and prestige, but even more so on the citations.',
            translation: '科学家的职业生涯和其所在机构的声誉取决于他们发表论文的数量和声望，但更取决于这些论文获得的引用次数。',
            analysis: 'but 连接两个并列的介词宾语。主句主语 The careers and the reputation，谓语 depend on。they produce 是省略关系代词的定语从句修饰 papers。过去分词短语 attracted by... 作后置定语修饰 citations。重点词汇：prestige（声望），citation（引用）。'
        },
        {
            source: '2023 英语一 Text 4',
            sentence: 'Recently, another expression of this predatory behavior has emerged: so-called support service consultancies that provide language and other editorial support to individual authors and to journals sometimes advise contributors to add a number of citations to their articles.',
            main: 'Another expression has emerged: consultancies advise contributors to add citations.',
            translation: '最近，这种掠夺性行为的另一种表现形式出现了：所谓的支持服务咨询公司，它们为个人作者和期刊提供语言和其他编辑支持，有时会建议投稿人在他们的文章中添加一些引用。',
            analysis: '主句主语 Another expression，谓语 has emerged。冒号后是对 expression 的解释说明，其主语是 consultancies，谓语 advise，宾语 contributors，宾补 to add...。that 引导定语从句修饰 consultancies。重点词汇：predatory（掠夺性的），consultancy（咨询公司），editorial（编辑的）。'
        },
        {
            source: '2023 英语二 Text 1',
            sentence: 'These eggs, which are making their debut now on shelves for as much as $8 a dozen, are still labeled organic and animal-friendly, but they\'re also from birds that live on farms using regenerative agriculture — special techniques to cultivate rich soils that can trap greenhouse gases.',
            main: 'These eggs are labeled organic and animal-friendly, but they\'re also from birds.',
            translation: '这些鸡蛋现在首次上架，售价高达每打8美元，仍然贴着有机和动物友好的标签，但它们也来自使用再生农业的农场的鸡——再生农业是培育能够捕获温室气体的肥沃土壤的特殊技术。',
            analysis: 'but 连接两个并列分句。第一个分句：which 引导非限定性定语从句修饰 eggs。第二个分句：that 引导定语从句修饰 birds，现在分词短语 using... 作后置定语修饰 farms，破折号后是对 regenerative agriculture 的解释，其中 that 引导定语从句修饰 soils。重点词汇：debut（首次亮相），regenerative agriculture（再生农业），trap（捕获）。'
        },
        {
            source: '2023 英语二 Text 1',
            sentence: 'In barely more than a decade, organic eggs went from being dismissed as a niche product in natural foods stores to being sold at Walmart.',
            main: 'Organic eggs went from being dismissed to being sold.',
            translation: '在短短十多年里，有机鸡蛋从在天然食品商店被视为小众产品而不屑一顾，到在沃尔玛销售。',
            analysis: '介词短语 In barely more than a decade 作时间状语。主句主语 organic eggs，谓语 went，状语 from... to... 结构。from 和 to 后都是动名词被动形式。重点词汇：barely（仅仅，刚刚），dismiss as（把……视为……而不屑一顾），niche product（小众产品）。'
        },
        {
            source: '2023 英语二 Text 2',
            sentence: 'One in three Americans who are at least 40 have or plan to have a job in retirement to prepare for a longer life, according to a survey conducted by Harris Poll for TD Ameritrade.',
            main: 'One in three Americans have or plan to have a job.',
            translation: '根据哈里斯民意调查为德美利证券进行的一项调查显示，在40岁及以上的美国人中，有三分之一的人已经或计划在退休后工作，为更长的寿命做准备。',
            analysis: '主句主语 One in three Americans，who 引导定语从句修饰 Americans，从句谓语有两个并列谓语：have 和 plan to have。不定式短语 to prepare for... 作目的状语。过去分词短语 conducted by... 作后置定语修饰 survey。重点词汇：retirement（退休），conduct a survey（进行调查）。'
        },
        {
            source: '2023 英语二 Text 2',
            sentence: 'Even more surprising is that more than half of "unretirees"— those who plan to work in retirement or went back to work after retiring — said they would be employed in their later years even if they had enough money to settle down.',
            main: 'Even more surprising is that more than half said they would be employed.',
            translation: '更令人惊讶的是，超过一半的"不退休者"——那些计划退休后工作或退休后重返工作岗位的人——表示，即使他们有足够的钱安度晚年，他们也会在晚年继续工作。',
            analysis: '这是一个倒装句，表语 Even more surprising 前置，主句主语是 that 引导的主语从句。破折号中间是插入语，解释 unretirees，who 引导定语从句。said 后是宾语从句，even if 引导让步状语从句。重点词汇：unretiree（不退休者），settle down（安定下来）。'
        },
        {
            source: '2023 英语二 Text 3',
            sentence: 'First coined in 2010 by user experience expert Harry Brignull, "dark patterns" is a catch-all term for practices that manipulate user interfaces to influence the decision-making ability of users.',
            main: '"Dark patterns" is a catch-all term.',
            translation: '"黑暗模式"一词由用户体验专家哈里·布里格努尔于2010年首次提出，是一个统称，指操纵用户界面以影响用户决策能力的做法。',
            analysis: '过去分词短语 First coined... 作状语。主句主系表结构。that 引导定语从句修饰 practices，不定式短语 to influence... 作目的状语。重点词汇：coin（创造，杜撰），catch-all（统称的），manipulate（操纵），user interface（用户界面）。'
        },
        {
            source: '2023 英语二 Text 3',
            sentence: 'Brignull identifies 12 types of common dark patterns, ranging from misdirection and hidden costs to "roach motel," where a user experience seems easy and intuitive at the start, but turns difficult when the user tries to get out.',
            main: 'Brignull identifies 12 types of common dark patterns.',
            translation: '布里格努尔确定了12种常见的黑暗模式，从误导和隐藏成本到"蟑螂汽车旅馆"——一种用户体验一开始似乎简单直观，但当用户试图退出时却变得困难的模式。',
            analysis: '主句主谓宾结构。现在分词短语 ranging from... to... 作后置定语修饰 dark patterns。where 引导非限定性定语从句修饰 roach motel，定语从句由 but 连接两个并列分句，第二个分句含 when 引导的时间状语从句。重点词汇：misdirection（误导），intuitive（直观的）。'
        },
        {
            source: '2023 英语二 Text 4',
            sentence: 'Although ethics classes are common around the world, scientists are unsure if their lessons can actually change behavior; evidence either way is weak, relying on contrived laboratory tests or sometimes unreliable self-reports.',
            main: 'Scientists are unsure; evidence is weak.',
            translation: '虽然道德课在世界各地都很常见，但科学家们不确定这些课程是否真的能改变行为；无论哪种方式的证据都很薄弱，依赖于人为的实验室测试或有时不可靠的自我报告。',
            analysis: '分号连接两个并列分句。第一个分句：although 引导让步状语从句，if 引导宾语从句。第二个分句：现在分词短语 relying on... 作状语，or 连接两个并列宾语。重点词汇：ethics（道德），contrived（人为的），self-report（自我报告）。'
        },
        {
            source: '2023 英语二 Text 4',
            sentence: 'They chose this particular behavior for three reasons, according to study co-author Eric Schwitzgebel, a philosopher at the University of California, Riverside: students\' attitudes on the topic are variable and unstable, behavior is easily measurable, and ethics literature largely agrees that eating less meat is good because it reduces environmental harm and animal suffering.',
            main: 'They chose this behavior for three reasons: attitudes are variable, behavior is measurable, and literature agrees that eating meat is good.',
            translation: '据研究合著者、加州大学河滨分校哲学家埃里克·施维茨格贝尔说，他们选择这种特殊行为有三个原因：学生对这个话题的态度多变且不稳定，行为易于测量，以及伦理文献在很大程度上同意少吃肉是好的，因为它减少了环境危害和动物痛苦。',
            analysis: '主句主谓宾结构。according to... 是插入语，a philosopher... 是同位语。冒号后是三个并列的原因分句。第三个分句中 that 引导宾语从句，because 引导原因状语从句。重点词汇：variable（多变的），measurable（可测量的），literature（文献）。'
        },
        {
            source: '2022 英语一 Text 1',
            sentence: 'Water bottles, shopping bags, and other trash litter the planet, from Mount Everest to the Mariana Trench, because plastics are everywhere and don\'t break down easily.',
            main: 'Trash litters the planet.',
            translation: '从珠穆朗玛峰到马里亚纳海沟，水瓶、购物袋和其他垃圾遍布全球，因为塑料无处不在且不易分解。',
            analysis: '主句主语 Water bottles, shopping bags, and other trash，谓语 litters，宾语 the planet。from... to... 作地点状语。because 引导原因状语从句，从句有两个并列谓语。重点词汇：litter（遍布，乱扔），break down（分解）。'
        },
        {
            source: '2022 英语一 Text 1',
            sentence: 'Certain artifacts are especially vulnerable because some pioneers in plastic art didn\'t always know how to mix ingredients properly, says Thea van Oosten, a polymer chemist who, until retiring a few years ago, worked for decades at the Cultural Heritage Agency of the Netherlands (RCE).',
            main: 'Certain artifacts are especially vulnerable, says Thea van Oosten.',
            translation: '特亚·范·奥斯滕说，某些文物特别容易受到损害，因为一些塑料艺术先驱并不总是知道如何正确混合成分。她是一位高分子化学家，直到几年前退休前，她在荷兰文化遗产局工作了几十年。',
            analysis: '主句主系表结构。because 引导原因状语从句，how 引导宾语从句。says Thea van Oosten 是主句的主语和谓语，a polymer chemist 是同位语。who 引导定语从句修饰 chemist。重点词汇：artifact（文物），vulnerable（易受伤害的），polymer（聚合物）。'
        },
        {
            source: '2022 英语一 Text 2',
            sentence: 'As the latest crop of students pen their undergraduate application form and weigh up their options, it may be worth considering just how the point, purpose and value of a degree has changed and what Generation Z need to consider as they start the third stage of their educational journey.',
            main: 'It may be worth considering how the point, purpose and value has changed and what Generation Z need.',
            translation: '当最新一批学生填写本科申请表并权衡他们的选择时，或许值得思考一下学位的意义、目的和价值发生了怎样的变化，以及Z世代在开始他们教育旅程的第三阶段时需要考虑什么。',
            analysis: 'as 引导时间状语从句。主句中 it 作形式主语，真正主语是动名词 considering...。considering 后接两个并列的宾语从句：how... 和 what...。第二个宾语从句中 as 引导时间状语从句。重点词汇：crop（一批，一群），pen（写），weigh up（权衡）。'
        },
        {
            source: '2022 英语一 Text 2',
            sentence: 'Millennials were told that if you did well in school, got a decent degree, you would be set up for life.',
            main: 'Millennials were told that you would be set up for life.',
            translation: '千禧一代被告知，如果你在学校表现好，获得一个体面的学位，你就会一辈子衣食无忧。',
            analysis: '主句是被动语态。that 引导宾语从句，从句中包含 if 引导的条件状语从句。条件状语从句有两个并列谓语 did well 和 got。重点词汇：millennials（千禧一代），decent（体面的），be set up for life（一辈子衣食无忧）。'
        },
        {
            source: '2022 英语一 Text 3',
            sentence: 'Nearly 40% of the roughly 350 people who responded to an accompanying poll said, they had collaborated with artists; and almost all said they would consider doing so in future.',
            main: 'Nearly 40% said they had collaborated; and almost all said they would consider.',
            translation: '在对附带民意调查做出回应的约350人中，近40%的人表示，他们曾与艺术家合作；几乎所有人都表示，他们未来会考虑这样做。',
            analysis: '分号连接两个并列分句。第一个分句：who 引导定语从句修饰 people，said 后是宾语从句。第二个分句：said 后也是宾语从句。重点词汇：accompanying（附带的），collaborate with（与……合作）。'
        },
        {
            source: '2022 英语一 Text 3',
            sentence: 'One example of how artists and scientists have together rocked the scenes came last month when the Sydney Symphony Orchestra performed a reworked version of Antonio Vivaldi\'s The Four Seasons.',
            main: 'One example came last month.',
            translation: '艺术家和科学家如何共同震撼全场的一个例子出现在上个月，当时悉尼交响乐团演奏了安东尼奥·维瓦尔第《四季》的重新改编版本。',
            analysis: '主句主语 One example，谓语 came，状语 last month。of how... 是介词短语作后置定语，how 引导宾语从句。when 引导定语从句修饰 last month。重点词汇：rock the scenes（震撼全场），reworked（重新改编的）。'
        },
        {
            source: '2022 英语一 Text 4',
            sentence: 'The personal grievance provisions of New Zealand\'s Employment Relations Act 2000 (ERA) prevent an employer from firing an employee without good cause.',
            main: 'The provisions prevent an employer from firing an employee.',
            translation: '新西兰《2000年就业关系法》（ERA）的个人申诉条款禁止雇主无正当理由解雇雇员。',
            analysis: '主句主语 The provisions，谓语 prevent，宾语 an employer，宾语补足语 from firing...。介词短语 without good cause 作状语。重点词汇：grievance（申诉，不满），provision（条款），prevent... from...（阻止……做某事）。'
        },
        {
            source: '2022 英语一 Text 4',
            sentence: 'As countless boards and business owners will attest, constraining firms from firing poorly performing, high-earning managers is a handbrake on boosting productivity and overall performance.',
            main: 'Constraining firms from firing managers is a handbrake.',
            translation: '正如无数董事会和企业主所证明的那样，限制公司解雇表现不佳的高收入经理是提高生产率和整体绩效的手刹。',
            analysis: 'as 引导方式状语从句，意为"正如"。主句主语是动名词短语 constraining...，谓语 is，表语 a handbrake。介词短语 on boosting... 作后置定语修饰 handbrake。重点词汇：attest（证明），constrain（限制），handbrake（手刹，比喻阻碍）。'
        },
        {
            source: '2022 英语二 Text 1',
            sentence: 'These eggs, which are making their debut now on shelves for as much as $8 a dozen, are still labeled organic and animal-friendly, but they\'re also from birds that live on farms using regenerative agriculture.',
            main: 'These eggs are labeled organic and animal-friendly, but they\'re also from birds.',
            translation: '这些鸡蛋现在首次上架，售价高达每打8美元，仍然贴着有机和动物友好的标签，但它们也来自使用再生农业的农场的鸡。',
            analysis: 'but 连接两个并列分句。第一个分句：which 引导非限定性定语从句修饰 eggs。第二个分句：that 引导定语从句修饰 birds，现在分词短语 using... 作后置定语修饰 farms。重点词汇：debut（首次亮相），regenerative agriculture（再生农业）。'
        },
        {
            source: '2022 英语二 Text 2',
            sentence: 'More Americans are opting to work well into retirement, a growing trend that threatens to upend the old workforce model.',
            main: 'More Americans are opting to work.',
            translation: '越来越多的美国人选择工作到退休以后，这一日益增长的趋势有可能颠覆旧的劳动力模式。',
            analysis: '主句主谓宾结构。a growing trend 是同位语，解释说明前面整个句子的内容。that 引导定语从句修饰 trend。重点词汇：opt to（选择），upend（颠覆），workforce（劳动力）。'
        },
        {
            source: '2022 英语二 Text 3',
            sentence: 'Think about the times you felt tricked or frustrated by a membership or subscription that had a seamless sign-up process but was later difficult to cancel.',
            main: 'Think about the times.',
            translation: '想想那些你被会员或订阅欺骗或感到沮丧的时候，这些会员或订阅有着无缝的注册过程，但后来却很难取消。',
            analysis: '这是一个祈使句。you felt tricked or frustrated... 是省略关系副词的定语从句修饰 times。that 引导定语从句修饰 membership or subscription，从句有两个并列谓语 had 和 was。重点词汇：tricked（受骗的），frustrated（沮丧的），seamless（无缝的）。'
        },
        {
            source: '2022 英语二 Text 4',
            sentence: 'Half of the students in four large philosophy classes read an article on the ethics of factory-farmed meat, optionally watched an 11-minute video on the topic and joined a 50-minute discussion.',
            main: 'Half of the students read an article, watched a video and joined a discussion.',
            translation: '四个大型哲学班的一半学生阅读了一篇关于工厂化养殖肉类伦理的文章，选择性地观看了一个11分钟的相关视频，并参加了50分钟的讨论。',
            analysis: '主句主语 Half of the students，有三个并列谓语：read、watched、joined。介词短语 in four large philosophy classes 作后置定语修饰 students。重点词汇：ethics（伦理），factory-farmed（工厂化养殖的）。'
        },
        {
            source: '2021 英语一 Text 1',
            sentence: 'Successive governments have permitted such increases on the grounds that the cost of investing in and running the rail network should be borne by those who use it, rather than the general taxpayer.',
            main: 'Successive governments have permitted such increases.',
            translation: '历届政府都允许这样的涨价，理由是投资和运营铁路网络的成本应该由使用它的人承担，而不是由普通纳税人承担。',
            analysis: '主句主谓宾结构。on the grounds that... 引导原因状语从句，意为"理由是"。从句主语 the cost，谓语 should be borne。who 引导定语从句修饰 those。rather than 连接两个并列的介词宾语。重点词汇：successive（连续的，历届的），on the grounds that（理由是），bear（承担）。'
        },
        {
            source: '2021 英语一 Text 1',
            sentence: 'It is all very well train operators trumpeting the improvements they are making to the network, but passengers should be able to expect a basic level of service for the substantial sums they are now paying to travel.',
            main: 'It is all very well, but passengers should be able to expect a basic level of service.',
            translation: '火车运营商吹嘘他们对铁路网络进行的改进是很好，但乘客应该能够期望得到与他们现在支付的巨额费用相称的基本服务水平。',
            analysis: 'but 连接两个并列分句。第一个分句：It is all very well sb doing sth 是固定句型，意为"某人做某事固然很好（但……）"。they are making... 是定语从句修饰 improvements。第二个分句：they are now paying... 是定语从句修饰 sums。重点词汇：trumpet（吹嘘），substantial（大量的）。'
        },
        {
            source: '2021 英语一 Text 2',
            sentence: 'Called conditional cash transfers or CCTs, these social assistance programs are designed to reduce inequality and break the cycle of poverty.',
            main: 'These programs are designed to reduce inequality and break the cycle.',
            translation: '这些被称为有条件现金转移支付或CCTs的社会援助计划旨在减少不平等并打破贫困循环。',
            analysis: '过去分词短语 Called... 作状语。主句主语 these programs，谓语 are designed，目的状语是两个并列的不定式短语 to reduce... and break...。重点词汇：conditional cash transfer（有条件现金转移支付），be designed to（旨在），cycle of poverty（贫困循环）。'
        },
        {
            source: '2021 英语一 Text 2',
            sentence: 'Ferraro analyzed satellite data showing annual forest loss from 2008 to 2012 — including during Indonesia\'s phase-in of the antipoverty program — in 7,468 forested villages across 15 provinces.',
            main: 'Ferraro analyzed satellite data.',
            translation: '费拉罗分析了显示2008年至2012年——包括印度尼西亚扶贫计划逐步实施期间——15个省7468个森林村庄的年度森林损失卫星数据。',
            analysis: '主句主谓宾结构。现在分词短语 showing... 作后置定语修饰 data。破折号中间是插入语，补充说明时间范围。介词短语 in 7,468 forested villages... 作地点状语。重点词汇：satellite data（卫星数据），phase-in（逐步实施），antipoverty（扶贫的）。'
        },
        {
            source: '2021 英语一 Text 3',
            sentence: 'As a historian who\'s always searching for the text or the image that makes us re-evaluate the past, I\'ve become preoccupied with looking for photographs that show our Victorian ancestors smiling.',
            main: 'I\'ve become preoccupied with looking for photographs.',
            translation: '作为一名总是在寻找能让我们重新评价过去的文本或图像的历史学家，我一直专注于寻找展示我们维多利亚时代祖先微笑的照片。',
            analysis: 'as 引导方式状语从句，who 引导定语从句修饰 historian，that 引导定语从句修饰 text or image。主句主系表结构。that 引导定语从句修饰 photographs。重点词汇：preoccupied with（全神贯注于），re-evaluate（重新评价），Victorian（维多利亚时代的）。'
        },
        {
            source: '2021 英语一 Text 3',
            sentence: 'Of course, I need to concede that my collection of \'Smiling Victorians\' makes up only a tiny percentage of the vast catalogue of photographic portraiture created between 1840 and 1900, the majority of which show sitters posing miserably and stiffly in front of painted backdrops, or staring absently into the middle distance.',
            main: 'I need to concede that my collection makes up only a tiny percentage.',
            translation: '当然，我需要承认，我的"微笑的维多利亚人"藏品只占1840年至1900年间创作的大量肖像摄影目录的很小一部分，其中大多数显示被摄者在彩绘背景前痛苦而僵硬地摆姿势，或心不在焉地凝视着中间的距离。',
            analysis: '主句主谓宾结构。that 引导宾语从句。过去分词短语 created between... 作后置定语修饰 portraiture。the majority of which 引导非限定性定语从句修饰 catalogue，定语从句中现在分词短语 posing... 和 staring... 作伴随状语。重点词汇：concede（承认），make up（构成），portraiture（肖像摄影）。'
        },
        {
            source: '2021 英语一 Text 4',
            sentence: 'From the early days of broadband, advocates for consumers and web-based companies worried that the cable and phone companies selling broadband connections had the power and incentive to favor affiliated websites over their rivals\'.',
            main: 'Advocates worried that the companies had the power and incentive.',
            translation: '从宽带的早期日子起，消费者和网络公司的倡导者就担心，销售宽带连接的有线电视和电话公司有能力和动机偏袒附属网站而不是竞争对手的网站。',
            analysis: '介词短语 From the early days of broadband 作时间状语。主句主语 advocates，谓语 worried，that 引导宾语从句。现在分词短语 selling... 作后置定语修饰 companies。favor A over B 意为"偏袒A而不是B"。重点词汇：advocate（倡导者），incentive（动机），affiliated（附属的）。'
        },
        {
            source: '2021 英语一 完形填空',
            sentence: 'Fluid intelligence is the type of intelligence that has to do with short-term memory and the ability to think quickly, logically, and abstractly in order to solve new problems.',
            main: 'Fluid intelligence is the type of intelligence.',
            translation: '流体智力是一种与短期记忆以及快速、逻辑和抽象思考以解决新问题的能力有关的智力类型。',
            analysis: '主句主系表结构。that 引导定语从句修饰 intelligence。定语从句中 has to do with 意为"与……有关"，后接两个并列宾语 short-term memory 和 the ability。不定式短语 to think... 作后置定语修饰 ability。重点词汇：fluid intelligence（流体智力），abstractly（抽象地）。'
        },
        {
            source: '2021 英语一 完形填空',
            sentence: 'The researchers looked at data that included measurements of lean muscle and abdominal fat from more than 4,000 middle-to-older-aged men and women and compared that data to reported changes in fluid intelligence over a six-year period.',
            main: 'The researchers looked at data and compared that data to changes.',
            translation: '研究人员查看了包括4000多名中老年人的瘦肌肉和腹部脂肪测量数据，并将这些数据与六年期间流体智力的报告变化进行了比较。',
            analysis: '主句主语 The researchers，有两个并列谓语 looked at 和 compared。that 引导定语从句修饰 data。compare... to... 意为"把……与……比较"。重点词汇：lean muscle（瘦肌肉），abdominal fat（腹部脂肪）。'
        },
        {
            source: '2020 英语一 Text 1',
            sentence: 'A group of labour MPs, among them Yvette Cooper, are bringing in the new year with a call to institute a UK "town of culture" award.',
            main: 'A group of labour MPs are bringing in the new year with a call.',
            translation: '一群工党议员，其中包括伊薇特·库珀，正在以呼吁设立英国"文化之城"奖来迎接新年。',
            analysis: '主句主语 A group of labour MPs，谓语 are bringing in，宾语 the new year。among them Yvette Cooper 是插入语。with a call to... 作方式状语。重点词汇：labour MPs（工党议员），institute（设立），bring in（迎接，引入）。'
        },
        {
            source: '2020 英语一 Text 2',
            sentence: 'Scientific publishing has long been a licence to print money, with scientists needing journals for promotions and tenure, while universities and research institutions pay for the article processing charge to get their papers published.',
            main: 'Scientific publishing has long been a licence to print money.',
            translation: '科学出版长期以来一直是印钞的许可证，科学家需要期刊来获得晋升和终身职位，而大学和研究机构支付文章处理费以使他们的论文发表。',
            analysis: '主句主系表结构。with 复合结构作伴随状语。while 引导对比状语从句，表示对比。重点词汇：licence to print money（印钞许可证，指轻松赚钱），tenure（终身职位），article processing charge（文章处理费）。'
        },
        {
            source: '2020 英语一 Text 3',
            sentence: 'Progressives often support diversity mandates as a path to equality and a way to level the playing field.',
            main: 'Progressives support diversity mandates as a path and a way.',
            translation: '进步人士通常支持多样性指令，将其作为实现平等的途径和公平竞争的方式。',
            analysis: '主句主谓宾结构。as 引导的介词短语作宾语补足语。a path to... 和 a way to... 是并列的宾语补足语。重点词汇：progressive（进步人士），diversity mandate（多样性指令），level the playing field（公平竞争）。'
        },
        {
            source: '2020 英语一 Text 4',
            sentence: 'Last Thursday, the French Senate passed a digital services tax, which would impose an entirely new tax on large multinationals that provide digital services to consumers or users in France.',
            main: 'The French Senate passed a digital services tax.',
            translation: '上周四，法国参议院通过了一项数字服务税，这将对向法国消费者或用户提供数字服务的大型跨国公司征收全新的税。',
            analysis: '主句主谓宾结构。which 引导非限定性定语从句修饰 tax。that 引导定语从句修饰 multinationals。impose... on... 意为"对……征收……"。重点词汇：senate（参议院），multinational（跨国公司），impose（征收）。'
        },
        {
            source: '2019 英语一 Text 1',
            sentence: 'Financial regulators in Britain have imposed a rather unusual rule on the bosses of big banks.',
            main: 'Financial regulators have imposed a rule.',
            translation: '英国金融监管机构对大银行的老板实施了一项相当不寻常的规定。',
            analysis: '简单句，主谓宾结构。主语 Financial regulators，谓语 have imposed，宾语 a rule。介词短语 on the bosses... 作状语。重点词汇：regulator（监管机构），impose（实施，强加）。'
        },
        {
            source: '2019 英语一 Text 2',
            sentence: 'Grade inflation — the gradual increase in average GPAs (grade-point averages) over the past few decades — is often considered a product of a consumer era in higher education, in which students are treated like customers to be pleased.',
            main: 'Grade inflation is often considered a product.',
            translation: '分数膨胀——过去几十年平均GPA（平均绩点）的逐渐上升——通常被认为是高等教育消费时代的产物，在这个时代，学生被当作需要取悦的顾客对待。',
            analysis: '主句主系表结构，被动语态。破折号中间是插入语，解释说明 Grade inflation。in which 引导非限定性定语从句修饰 era。不定式短语 to be pleased 作后置定语修饰 customers。重点词汇：grade inflation（分数膨胀），consumer era（消费时代）。'
        },
        {
            source: '2019 英语一 Text 3',
            sentence: 'This year marks exactly two centuries since the publication of Frankenstein; or, The Modern Prometheus, by Mary Shelley.',
            main: 'This year marks two centuries.',
            translation: '今年正好是玛丽·雪莱的《弗兰肯斯坦；或现代普罗米修斯》出版两个世纪。',
            analysis: '简单句，主谓宾结构。主语 This year，谓语 marks，宾语 two centuries。since 引导的介词短语作时间状语。重点词汇：mark（标志，纪念），publication（出版）。'
        },
        {
            source: '2019 英语一 Text 4',
            sentence: 'States will be able to force more people to pay sales tax when they make online purchases under a Supreme Court decision Thursday that will leave shoppers with lighter wallets but is a big financial win for states.',
            main: 'States will be able to force more people to pay sales tax.',
            translation: '根据最高法院周四的一项裁决，各州将能够迫使更多人在网上购物时缴纳销售税，这将让购物者的钱包变轻，但对各州来说是一个巨大的财政胜利。',
            analysis: '主句主谓宾结构。when 引导时间状语从句。under a Supreme Court decision... 作状语。that 引导定语从句修饰 decision，从句有两个并列谓语 will leave 和 is。重点词汇：sales tax（销售税），Supreme Court（最高法院）。'
        },
        {
            source: '2018 英语一 Text 1',
            sentence: 'Among the annoying challenges facing the middle class is one that will probably go unmentioned in the next presidential campaign: What happens when the robots come for their jobs?',
            main: 'Among the challenges is one.',
            translation: '中产阶级面临的令人烦恼的挑战中，有一个可能在下届总统竞选中不会被提及：当机器人来抢他们的工作时会发生什么？',
            analysis: '这是一个倒装句，表语 Among the annoying challenges... 前置。主句主语 one，that 引导定语从句修饰 one。冒号后是对 one 的解释说明，when 引导时间状语从句。重点词汇：annoying（令人烦恼的），presidential campaign（总统竞选）。'
        },
        {
            source: '2018 英语一 Text 2',
            sentence: 'A new survey by Harvard University finds more than two-thirds of young Americans disapprove of President Trump\'s use of Twitter.',
            main: 'A new survey finds more than two-thirds disapprove of Trump\'s use of Twitter.',
            translation: '哈佛大学的一项新调查发现，超过三分之二的美国年轻人不赞成特朗普总统使用推特。',
            analysis: '主句主谓宾结构。by Harvard University 作后置定语修饰 survey。finds 后是宾语从句，省略了连接词 that。disapprove of 意为"不赞成"。重点词汇：disapprove of（不赞成）。'
        },
        {
            source: '2018 英语一 Text 3',
            sentence: 'Any fair-minded assessment of the dangers of the deal between Britain\'s National Health Service and DeepMind must start by acknowledging that both sides mean well.',
            main: 'Any assessment must start by acknowledging that both sides mean well.',
            translation: '任何对英国国民保健制度与DeepMind之间交易危险的公正评估都必须首先承认双方都是好意。',
            analysis: '主句主语 Any assessment，谓语 must start，状语 by acknowledging...。that 引导宾语从句作 acknowledging 的宾语。重点词汇：fair-minded（公正的），assessment（评估），mean well（出于好意）。'
        },
        {
            source: '2018 英语一 Text 4',
            sentence: 'The U.S. Postal Service (USPS) continues to bleed red ink. It reported a net loss of $5.6 billion for fiscal 2016, the 10th straight year its expenses have exceeded its revenue.',
            main: 'The U.S. Postal Service continues to bleed red ink. It reported a net loss.',
            translation: '美国邮政管理局（USPS）继续亏损。它报告2016财年净亏损56亿美元，这是其支出连续第10年超过收入。',
            analysis: '两个简单句。第一个：主谓宾结构。第二个：主谓宾结构，the 10th straight year... 是同位语，其后是省略关系副词的定语从句。重点词汇：bleed red ink（亏损），fiscal（财政的），exceed（超过）。'
        },
        {
            source: '2017 英语一 Text 1',
            sentence: 'First two hours, now three hours — this is how far in advance authorities are recommending people show up to catch a domestic flight, at least at some major U.S. airports with increasingly massive security lines.',
            main: 'This is how far in advance authorities are recommending people show up.',
            translation: '先是两小时，现在是三小时——这就是当局建议人们提前多久到达赶国内航班，至少在一些拥有越来越多安检队伍的美国主要机场是这样。',
            analysis: '破折号前是省略句，起引入话题的作用。破折号后是主句，主系表结构，how 引导表语从句。at least at some major U.S. airports... 作地点状语。重点词汇：in advance（提前），domestic flight（国内航班），massive（大量的）。'
        },
        {
            source: '2017 英语一 Text 2',
            sentence: 'The ancient Hawaiians were astronomers, wrote Queen Liliuokalani, Hawaii\'s last reigning monarch, in 1897.',
            main: '"The ancient Hawaiians were astronomers," wrote Queen Liliuokalani.',
            translation: '"古代夏威夷人都是天文学家，"夏威夷最后一位在位君主利留卡拉尼女王在1897年写道。',
            analysis: '直接引语在前，主句主谓倒装。Hawaii\'s last reigning monarch 是同位语，解释说明 Queen Liliuokalani。重点词汇：astronomer（天文学家），reigning（在位的），monarch（君主）。'
        },
        {
            source: '2017 英语一 Text 3',
            sentence: 'Robert F. Kennedy once said that a country\'s GDP measures "everything except that which makes life worthwhile."',
            main: 'Robert F. Kennedy said that GDP measures everything except that.',
            translation: '罗伯特·F·肯尼迪曾经说过，一个国家的GDP衡量的是"除了使生活有价值的东西之外的一切"。',
            analysis: '主句主谓宾结构。that 引导宾语从句。except 是介词，后接 that 引导的宾语从句，which 引导定语从句修饰 that。重点词汇：GDP（国内生产总值），worthwhile（值得的）。'
        },
        {
            source: '2017 英语一 Text 4',
            sentence: 'In a rare unanimous ruling, the U.S. Supreme Court has overturned the corruption conviction of a former Virginia governor, Robert McDonnell.',
            main: 'The U.S. Supreme Court has overturned the conviction.',
            translation: '在一项罕见的一致裁决中，美国最高法院推翻了前弗吉尼亚州州长罗伯特·麦克唐纳的腐败定罪。',
            analysis: '简单句，主谓宾结构。介词短语 In a rare unanimous ruling 作状语。主语 the U.S. Supreme Court，谓语 has overturned，宾语 the corruption conviction。Robert McDonnell 是同位语。重点词汇：unanimous（一致的），overturn（推翻），corruption（腐败），conviction（定罪）。'
        },
        {
            source: '2016 英语一 Text 1',
            sentence: 'France, which prides itself as the global innovator of fashion, has decided its fashion industry has lost an absolute right to define physical beauty for women.',
            main: 'France has decided its fashion industry has lost a right.',
            translation: '以自己是全球时尚创新者而自豪的法国，已经决定其时尚业失去了定义女性身体美的绝对权利。',
            analysis: '主句主谓宾结构。which 引导非限定性定语从句修饰 France。decided 后是宾语从句，省略了连接词 that。不定式短语 to define... 作后置定语修饰 right。重点词汇：pride oneself as（以……为自豪），innovator（创新者），absolute（绝对的）。'
        },
        {
            source: '2016 英语一 Text 2',
            sentence: 'For the first time in history, more people live in towns than in the country.',
            main: 'More people live in towns than in the country.',
            translation: '历史上第一次，住在城镇的人比住在农村的人多。',
            analysis: '比较状语从句的省略形式，完整形式是 than people live in the country。For the first time in history 作时间状语。重点词汇：for the first time（第一次）。'
        },
        {
            source: '2016 英语一 Text 3',
            sentence: 'That everyone\'s too busy these days is a cliché. But one specific complaint is made especially mournfully: There\'s never any time to read.',
            main: 'That everyone\'s too busy is a cliché. But one complaint is made.',
            translation: '现在每个人都太忙了，这是老生常谈。但有一个具体的抱怨特别令人悲伤：永远没有时间阅读。',
            analysis: '两个句子。第一个：that 引导主语从句，主系表结构。第二个：被动语态，主谓结构。冒号后是对 complaint 的解释说明。重点词汇：cliché（陈词滥调），mournfully（悲伤地）。'
        },
        {
            source: '2016 英语一 Text 4',
            sentence: 'There will eventually come a day when The New York Times ceases to publish stories on newsprint.',
            main: 'There will eventually come a day.',
            translation: '终有一天，《纽约时报》将停止在新闻纸上刊登报道。',
            analysis: 'there be 句型的将来时，谓语是 will come。when 引导定语从句修饰 day。cease to do sth 意为"停止做某事"。重点词汇：cease（停止），newsprint（新闻纸）。'
        },
        {
            source: '2015 英语一 Text 1',
            sentence: 'King Juan Carlos of Spain once insisted "kings don\'t abdicate, they dare in their sleep."',
            main: 'King Juan Carlos insisted "kings don\'t abdicate, they dare in their sleep."',
            translation: '西班牙国王胡安·卡洛斯曾经坚称"国王不退位，他们在睡梦中去世"。',
            分析: '主句主谓宾结构。insisted 后是宾语从句，省略了连接词 that。宾语从句由两个并列分句组成。重点词汇：abdicate（退位），dare（敢，这里指去世）。'
        },
        {
            source: '2015 英语一 Text 2',
            sentence: 'Just how much does the Constitution protect your digital data?',
            main: 'How much does the Constitution protect your data?',
            translation: '宪法在多大程度上保护你的数字数据？',
            analysis: '特殊疑问句。主语 the Constitution，谓语 protect，宾语 your digital data。Just how much 作程度状语。重点词汇：Constitution（宪法），digital data（数字数据）。'
        },
        {
            source: '2015 英语一 Text 3',
            sentence: 'The journal Science is adding an extra round of statistical checks to its peer-review process, editor-in-chief Marcia McNutt announced today.',
            main: 'The journal Science is adding checks, Marcia McNutt announced.',
            translation: '《科学》杂志正在其同行评审过程中增加一轮额外的统计检查，主编玛西娅·麦克纳特今天宣布。',
            analysis: '主句 The journal Science is adding... 是宾语从句，前置表示宣布的内容。editor-in-chief Marcia McNutt announced today 是主句的主语和谓语。重点词汇：statistical（统计的），peer-review（同行评审），editor-in-chief（主编）。'
        },
        {
            source: '2015 英语一 Text 4',
            sentence: 'Two years ago, Rupert Murdoch\'s daughter, Elisabeth, spoke of the "unsettling dearth of integrity across so many of our institutions."',
            main: 'Elisabeth spoke of the dearth of integrity.',
            translation: '两年前，鲁珀特·默多克的女儿伊丽莎白谈到了"我们如此多机构中令人不安的诚信缺失"。',
            analysis: '简单句，主谓宾结构。Two years ago 作时间状语。主语 Elisabeth，谓语 spoke of，宾语 the "unsettling dearth of integrity..."。重点词汇：speak of（谈到），unsettling（令人不安的），dearth（缺乏），integrity（诚信）。'
        },
        {
            source: '2025 英语一 翻译',
            sentence: 'Recent decades have seen science move into a convention where engagement in the subject can only be done through institutions, such as a university.',
            main: 'Recent decades have seen science move into a convention.',
            translation: '近几十年来，科学已经进入了一种惯例，即对这门学科的参与只能通过大学等机构来进行。',
            analysis: 'see sth do sth 结构，意为"见证某事发生"。where 引导定语从句修饰 convention。such as 引出举例。重点词汇：convention（惯例），engagement（参与）。'
        },
        {
            source: '2025 英语一 翻译',
            sentence: 'But by utilising the natural curiosity of the general public it is possible to overcome many of these challenges by engaging non-scientists directly in the research process.',
            main: 'It is possible to overcome many challenges.',
            translation: '但是通过利用公众的自然好奇心，通过让非科学家直接参与研究过程，有可能克服其中许多挑战。',
            analysis: 'it 作形式主语，真正主语是不定式 to overcome...。两个 by 引导的介词短语都作方式状语。重点词汇：utilise（利用），curiosity（好奇心），engage... in（使……参与）。'
        },
        {
            source: '2024 英语一 翻译',
            sentence: 'They sometimes travel more than sixty miles to find food or water, and are very good at working out where other elephants are — even when they are out of sight.',
            main: 'They travel and are good at working out where other elephants are.',
            translation: '它们有时会跋涉60多英里去寻找食物或水，而且非常擅长找出其他大象的位置——即使它们看不见。',
            analysis: 'and 连接两个并列谓语 travel 和 are。不定式短语 to find... 作目的状语。working out 后接 where 引导的宾语从句。破折号后 even when 引导让步状语从句。重点搭配：work out（算出，找出），out of sight（看不见）。'
        },
        {
            source: '2024 英语一 翻译',
            sentence: 'The researchers are convinced that the elephants always know precisely where they are in relation to all the resources they need, and can therefore take shortcuts, as well as following familiar routes.',
            main: 'The researchers are convinced that the elephants know where they are and can take shortcuts.',
            translation: '研究人员确信，大象总是准确地知道自己相对于所需所有资源的位置，因此既能走熟悉的路线，也能走捷径。',
            analysis: '主句主系表结构。that 引导宾语从句，从句主语 the elephants，有两个并列谓语 know 和 can take。where 引导宾语从句作 know 的宾语。they need 是省略关系代词的定语从句修饰 resources。重点搭配：in relation to（相对于），take shortcuts（走捷径）。'
        },
        {
            source: '2023 英语一 翻译',
            sentence: 'AI can also be used to identify the lifestyle choices of customers regarding their hobbies, favourite celebrities, and fashions to provide unique content in marketing messages put out through social media.',
            main: 'AI can also be used to identify the lifestyle choices.',
            translation: '人工智能还可以用来识别客户在爱好、最喜欢的名人和时尚方面的生活方式选择，以便在通过社交媒体发布的营销信息中提供独特的内容。',
            analysis: '被动语态。不定式短语 to identify... 作目的状语。regarding... 作后置定语修饰 choices。不定式短语 to provide... 作目的状语。过去分词短语 put out... 作后置定语修饰 messages。重点词汇：identify（识别），regarding（关于），celebrity（名人）。'
        },
        {
            source: '2023 英语一 翻译',
            sentence: 'Some believe that AI is negatively impacting on the marketer\'s role by reducing creativity and removing jobs, but they are aware that it is a way of reducing costs and creating new information.',
            main: 'Some believe that AI is impacting on the role, but they are aware that it is a way.',
            translation: '一些人认为，人工智能正在通过减少创造力和削减工作岗位对营销人员的角色产生负面影响，但他们意识到，这是降低成本和创造新信息的一种方式。',
            analysis: 'but 连接两个并列分句。第一个分句：that 引导宾语从句，by 引导的介词短语作方式状语。第二个分句：that 引导宾语从句，of reducing... and creating... 作后置定语修饰 way。重点词汇：impact on（对……产生影响），be aware that（意识到）。'
        },
        {
            source: '2022 英语一 翻译',
            sentence: 'It was also, and this is unknown even to many people well read about the period, a battle between those who made codes and those who broke them.',
            main: 'It was also a battle between those who made codes and those who broke them.',
            translation: '而且，这甚至对许多熟读这段历史的人来说都是未知的，这是一场密码制造者和密码破译者之间的战斗。',
            analysis: '主句主系表结构。and this is unknown... 是插入语。well read about the period 作后置定语修饰 people。between those... and those... 作后置定语修饰 battle，两个 those 后都接 who 引导的定语从句。重点词汇：well read（博学的，熟读的）。'
        },
        {
            source: '2022 英语一 翻译',
            sentence: 'It listed many documents in code that had been captured from the French army of Spain, and whose secrets had been revealed by the work of one George Scovell, an officer in British headquarters.',
            main: 'It listed many documents in code.',
            translation: '它列出了许多从驻西班牙法国军队缴获的密码文件，这些文件的秘密被一位名叫乔治·斯科维尔的英国总部军官的工作所揭示。',
            analysis: '主句主谓宾结构。that 引导定语从句修饰 documents，and 连接两个并列的定语从句：that had been captured... 和 whose secrets had been revealed...。an officer... 是同位语，解释说明 George Scovell。重点词汇：in code（用密码），capture（缴获），reveal（揭示）。'
        },
        {
            source: '2021 英语一 翻译',
            sentence: 'Those societies came out of the war with levels of enrollment that had been roughly constant at 3-5% of the relevant age groups during the decades before the war.',
            main: 'Those societies came out of the war with levels of enrollment.',
            translation: '这些社会在战后走出战争时，入学率在战前几十年里大致保持在相关年龄组的3-5%。',
            analysis: '主句主谓结构。with 复合结构作伴随状语。that 引导定语从句修饰 levels。roughly constant at... 意为"大致保持在……"。重点词汇：enrollment（入学率），roughly（大致），constant（恒定的）。'
        },
        {
            source: '2021 英语一 翻译',
            sentence: 'And the demand that rose in those societies for entry to higher education extended to groups and social classes that had not thought of attending a university before the war.',
            main: 'And the demand extended to groups and social classes.',
            translation: '在那些社会中兴起的接受高等教育的需求延伸到了战前从未想过上大学的群体和社会阶层。',
            analysis: '主句主语 the demand，谓语 extended to，宾语 groups and social classes。that rose... 定语从句修饰 demand。for entry to higher education 作后置定语修饰 demand。that had not thought... 定语从句修饰 groups and social classes。重点词汇：entry to（进入），extend to（延伸到）。'
        },
        {
            source: '2020 英语一 翻译',
            sentence: 'Following the explosion of creativity in Florence during the 14th century known as the Renaissance, there was a new appreciation for the rediscovery of the classical ancient Greek and Roman philosophy, architecture and art.',
            main: 'There was a new appreciation for the rediscovery.',
            translation: '随着14世纪佛罗伦萨被称为文艺复兴的创造力爆发之后，人们对重新发现古希腊罗马古典哲学、建筑和艺术有了新的欣赏。',
            analysis: '现在分词短语 Following... 作时间状语。known as the Renaissance 作后置定语修饰 explosion。there be 句型。for the rediscovery of... 作后置定语修饰 appreciation。重点词汇：explosion（爆发），appreciation（欣赏），rediscovery（重新发现）。'
        },
        {
            source: '2025 英语二 新题型',
            sentence: 'Why? Because writing a new script — literally or figuratively — means that other team members will have to adapt to something new.',
            main: 'Because writing a new script means that other team members will have to adapt.',
            translation: '为什么？因为写一个新的剧本——字面上或比喻上——意味着其他团队成员将不得不适应新事物。',
            analysis: 'because 引导原因状语从句。动名词短语 writing a new script 作从句主语。破折号中间是插入语。that 引导宾语从句作 means 的宾语。重点词汇：literally（字面上），figuratively（比喻上），adapt to（适应）。'
        },
        {
            source: '2024 英语二 Text 1',
            sentence: 'Nearly 2,000 years ago, as the Romans began to pull out of Scotland, they left behind a curious treasure: 10 tons of nails, nearly a million of the things.',
            main: 'They left behind a curious treasure.',
            translation: '大约2000年前，当罗马人开始撤出苏格兰时，他们留下了一笔奇特的宝藏：10吨钉子，将近100万个。',
            analysis: 'as 引导时间状语从句。主句主语 they，谓语 left behind，宾语 a curious treasure。冒号后是对 treasure 的解释说明。重点词汇：pull out of（撤出），leave behind（留下）。'
        },
        {
            source: '2024 英语二 Text 2',
            sentence: 'According to Dr Nikhil Chaudhary, an evolutionary anthropologist at Cambridge University, these practices, known as alloparenting, could lead to less anxiety for children and parents.',
            main: 'These practices could lead to less anxiety.',
            translation: '据剑桥大学进化人类学家尼希尔·乔杜里博士说，这些被称为异亲育儿的做法可能会减少儿童和父母的焦虑。',
            analysis: 'According to... 作状语。an evolutionary anthropologist... 是同位语。主句主语 these practices，谓语 could lead to，宾语 less anxiety。过去分词短语 known as... 作后置定语修饰 practices。重点词汇：evolutionary anthropologist（进化人类学家），alloparenting（异亲育儿）。'
        },
        {
            source: '2024 英语二 Text 3',
            sentence: 'His distinctive style is now one of the most commonly used prompts in the new open-source AI art generator Stable Diffusion.',
            main: 'His style is one of the most commonly used prompts.',
            translation: '他独特的风格现在是新的开源AI艺术生成器Stable Diffusion中最常用的提示词之一。',
            analysis: '主系表结构。one of + 形容词最高级 + 名词复数 结构。过去分词短语 commonly used 作定语修饰 prompts。重点词汇：distinctive（独特的），prompt（提示词），open-source（开源的）。'
        },
        {
            source: '2024 英语二 Text 4',
            sentence: 'The miracle of the Chesapeake Bay lies not in its depths, but in the complexity of its natural construction, the interaction of fresh and saline waters, and the mix of land and water.',
            main: 'The miracle lies not in its depths, but in the complexity, interaction and mix.',
            translation: '切萨皮克湾的奇迹不在于其深度，而在于其自然构造的复杂性、淡水与咸水的相互作用以及陆地与水的混合。',
            analysis: '主句主语 The miracle，谓语 lies，状语 not in... but in... 结构。but in 后接三个并列的名词短语。重点词汇：miracle（奇迹），lie in（在于），interaction（相互作用）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'What the picture above illustrates in a straightforward way is the current situation of our traditional Chinese culture, which deserves our due attention.',
            main: 'What the picture illustrates is the situation.',
            translation: '上图直观展示的是我们中华传统文化的现状，这一现状值得我们给予应有的关注。',
            analysis: 'What 引导主语从句。which 引导非限定性定语从句，修饰前面整个句子的内容。deserve one\'s attention 是常用搭配。重点词汇：illustrate（展示），straightforward（直接的），deserve（值得）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'It is imperative for our nation to realize the fact that Chinese culture is the most esteemed culture in the world and should be inherited from generation to generation.',
            main: 'It is imperative to realize the fact.',
            translation: '我们的国家必须认识到这样一个事实：中华文化是世界上最受推崇的文化，应当代代相传。',
            analysis: 'It 作形式主语，真正主语是不定式 to realize...。that 引导同位语从句，解释 fact 的内容，从句内有两个并列谓语：is 和 should be inherited。重点词汇：imperative（必要的），esteemed（受尊敬的），inherit（继承）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'Only in this way can we solve the problem effectively and efficiently, and only in this way can we build a harmonious and beautiful world for both human beings and nature.',
            main: 'Only in this way can we solve the problem and build a world.',
            translation: '只有这样，我们才能有效高效地解决这个问题，只有这样，我们才能为人类和自然建设一个和谐美丽的世界。',
            analysis: 'and 连接两个并列分句，都是 only + 介词短语 放在句首，引起部分倒装。情态动词 can 提到主语 we 之前。重点词汇：effectively（有效地），efficiently（高效地），harmonious（和谐的）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'It is widely acknowledged that reading extensively can not only broaden our horizons but also enrich our life experience.',
            main: 'It is widely acknowledged that reading can broaden our horizons and enrich our experience.',
            translation: '人们普遍认为，广泛阅读不仅可以开阔我们的视野，还可以丰富我们的人生阅历。',
            analysis: 'It 作形式主语，真正主语是 that 引导的主语从句。从句中使用 not only... but also... 连接两个并列谓语。重点词汇：acknowledge（承认），broaden one\'s horizons（开阔视野），enrich（丰富）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'There is no doubt that this phenomenon will have a far-reaching influence on our society and our daily life.',
            main: 'There is no doubt that this phenomenon will have an influence.',
            translation: '毫无疑问，这一现象将对我们的社会和日常生活产生深远的影响。',
            analysis: 'There is no doubt that... 是固定句型，意为"毫无疑问……"。that 引导同位语从句，解释说明 doubt 的内容。重点词汇：phenomenon（现象），far-reaching（深远的），influence（影响）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'As is vividly shown in the picture, a young man is sitting in front of a computer, trying to choose a right way from four different roads, which makes him feel very confused.',
            main: 'A young man is sitting in front of a computer.',
            translation: '正如图片中生动展示的那样，一个年轻人坐在电脑前，试图从四条不同的道路中选择正确的一条，这让他感到非常困惑。',
            analysis: 'as 引导非限定性定语从句，意为"正如"，指代后面整个句子的内容。主句主谓结构。现在分词短语 trying to... 作伴随状语。which 引导非限定性定语从句，修饰前面整个句子。重点词汇：vividly（生动地），confused（困惑的）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'The reason why we should attach great importance to environmental protection is that it is closely related to the sustainable development of our society.',
            main: 'The reason is that it is related to the sustainable development.',
            translation: '我们应该高度重视环境保护的原因是，它与我们社会的可持续发展密切相关。',
            analysis: 'why 引导定语从句修饰 reason。that 引导表语从句。be related to 意为"与……有关"。重点词汇：attach importance to（重视），sustainable development（可持续发展）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'When it comes to the problem of generation gap, different people have different opinions, but as far as I am concerned, I firmly believe that mutual understanding plays a vital role in bridging the gap.',
            main: 'Different people have different opinions, but I firmly believe that understanding plays a role.',
            translation: '当谈到代沟问题时，不同的人有不同的看法，但就我而言，我坚信相互理解在弥合差距方面起着至关重要的作用。',
            analysis: 'when it comes to 是固定句型，意为"当谈到……时"。but 连接两个并列分句。第二个分句：as far as I am concerned 是插入语，that 引导宾语从句。重点搭配：play a vital role in（在……中起重要作用），bridge the gap（弥合差距）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'It is high time that we took effective measures to solve this problem before things get worse.',
            main: 'It is high time that we took measures.',
            translation: '现在是我们采取有效措施在事态恶化之前解决这个问题的时候了。',
            analysis: 'It is high time that... 是固定句型，意为"是时候……了"，that 从句用虚拟语气，谓语动词用过去式。before 引导时间状语从句。重点词汇：effective（有效的），take measures（采取措施）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'We should bear in mind that there is no shortcut to success and only by working hard can we achieve our goals.',
            main: 'We should bear in mind that there is no shortcut and only by working hard can we achieve goals.',
            translation: '我们应该牢记，成功没有捷径，只有通过努力工作我们才能实现我们的目标。',
            analysis: '主句主谓宾结构。that 引导宾语从句，and 连接两个并列分句。第二个分句 only by doing sth 放在句首，引起部分倒装。重点搭配：bear in mind（牢记），shortcut（捷径），achieve one\'s goals（实现目标）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'With the rapid development of science and technology, more and more people come to realize that knowledge plays an increasingly important role in our daily life.',
            main: 'More and more people come to realize that knowledge plays a role.',
            translation: '随着科学技术的快速发展，越来越多的人开始意识到知识在我们的日常生活中发挥着越来越重要的作用。',
            analysis: 'with 复合结构作伴随状语。主句主语 more and more people，谓语 come to realize，that 引导宾语从句。play a role in 意为"在……中起作用"。重点词汇：increasingly（越来越），play a role（发挥作用）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'No matter how difficult the problem may be, we must face it bravely and try our best to find a proper solution.',
            main: 'We must face it and try our best to find a solution.',
            translation: '无论问题可能有多困难，我们都必须勇敢地面对它，并尽最大努力找到合适的解决方案。',
            analysis: 'no matter how 引导让步状语从句，意为"无论多么"。主句主语 we，有两个并列谓语 must face 和 try。不定式短语 to find... 作目的状语。重点词汇：bravely（勇敢地），proper（合适的），solution（解决方案）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'It goes without saying that education is of great importance to the development of a country and the progress of human society.',
            main: 'It goes without saying that education is of great importance.',
            translation: '不言而喻，教育对一个国家的发展和人类社会的进步都非常重要。',
            analysis: 'It goes without saying that... 是固定句型，意为"不言而喻……"。It 作形式主语，真正主语是 that 引导的主语从句。be of great importance = be very important。重点词汇：of great importance（非常重要的），progress（进步）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'Not only does exercise help us keep healthy, but it also cultivates our strong will and improves our work efficiency.',
            main: 'Not only does exercise help us keep healthy, but it also cultivates will and improves efficiency.',
            translation: '锻炼不仅帮助我们保持健康，而且还培养我们坚强的意志并提高我们的工作效率。',
            analysis: 'not only... but also... 连接两个并列分句。not only 放在句首，引起部分倒装，助动词 does 提到主语 exercise 之前。but also 后用正常语序。重点词汇：cultivate（培养），strong will（坚强的意志），efficiency（效率）。'
        },
        {
            source: '考研写作经典长难句',
            sentence: 'There is a growing tendency these days that many people are beginning to realize the importance of a healthy lifestyle, which is beneficial to both physical and mental health.',
            main: 'There is a growing tendency that many people are beginning to realize the importance.',
            translation: '如今有一个日益增长的趋势，许多人开始意识到健康生活方式的重要性，这对身心健康都有益。',
            analysis: 'there be 句型。that 引导同位语从句解释 tendency。which 引导非限定性定语从句，修饰前面整个句子。be beneficial to 意为"对……有益"。重点词汇：tendency（趋势），beneficial（有益的），physical and mental health（身心健康）。'
        },
        {
            source: '2010 英语一 Text 1',
            sentence: 'Just as the people who produce newspapers are being subjected to ever greater financial pressures, so their readers are being subjected to ever greater editorial controls.',
            main: 'Just as people are being subjected to pressures, so readers are being subjected to controls.',
            translation: '正如新闻纸的生产者正承受着越来越大的财务压力一样，他们的读者也正受到越来越大的编辑控制。',
            analysis: 'just as... so... 是固定句型，意为"正如……一样，……也"。两个并列分句都使用被动语态。现在分词短语 being subjected to 作谓语。重点词汇：subject to（使承受），editorial（编辑的）。'
        },
        {
            source: '2010 英语一 Text 2',
            sentence: 'The whirlwind that swept through newsrooms among the result of newsroom cutbacks has now been elevated to a book, one that is designed to chronicle the damage that Facebook and Twitter are inflicting on journalism.',
            main: 'The whirlwind has been elevated to a book, one that is designed to chronicle the damage.',
            translation: '在新闻编辑室裁员潮中掀起的旋风现在已经升格为一本书，一本旨在记录Facebook和Twitter正在对新闻业造成的损害的书。',
            analysis: 'that swept through newsrooms 是定语从句修饰 whirlwind。that is designed to chronicle... 是定语从句修饰 one（book）。that Facebook and Twitter are inflicting 是宾语从句作 chronicle 的宾语。重点词汇：whirlwind（旋风），newsroom（新闻编辑室），chronicle（记录）。'
        },
        {
            source: '2010 英语一 Text 3',
            sentence: 'The outbreak of the H1N1 flu pandemic in 2009 raised important questions about how animals viruses could mix and recombine to create new viral strains that might become the source of the next pandemic.',
            main: 'The outbreak raised questions.',
            translation: '2009年H1N1流感疫情的爆发提出了关于动物病毒如何混合和重组以产生可能成为下一场大流行病源头的新病毒株的重要问题。',
            analysis: '主句主谓宾结构。how animals viruses could mix and recombine 是宾语从句，作介词about的宾语。不定式短语 to create new viral strains 作目的状语。that 引导定语从句，修饰 new viral strains。'
        },
        {
            source: '2010 英语一 Text 4',
            sentence: 'That ethics are sometimes seen as belonging to a different sphere and as a matter of private rather than public concern is, of course, not a new observation, but it is no less important for being familiar.',
            main: 'That ethics are sometimes seen as belonging to a different sphere is not a new observation.',
            translation: '伦理学有时被视为属于不同的领域，是私人的而非公共关注的问题，当然这不是什么新观察，但正因为人们熟悉它而并不因此就不重要。',
            analysis: '主语从句 That ethics are sometimes seen as belonging to a different sphere... 作主句主语。as a matter of... 是补充说明。but 连接两个并列分句。for being familiar 是介词短语作原因状语。'
        },
        {
            source: '2011 英语一 Text 1',
            sentence: 'While polls show that Americans are deeply suspicious of the media, journalists remain remarkably pessimistic about where the business is heading, particularly when it comes to the transition to digital.',
            main: 'While polls show Americans are suspicious, journalists remain pessimistic.',
            translation: '尽管民调显示美国人对媒体高度不信任，但新闻工作者对新闻业的发展方向仍然非常悲观，特别是在向数字化转型方面。',
            analysis: 'while 引导让步状语从句。that Americans are deeply suspicious 是宾语从句。where the business is heading 是宾语从句。particularly when... 是时间状语从句。'
        },
        {
            source: '2011 英语一 Text 2',
            sentence: 'The widespread availability of such processing power, coupled with the Internet, will lead to vast armies of distributed workers who will be able to tap into global pools of expertise in a way that was never possible before.',
            main: 'The availability will lead to vast armies of distributed workers.',
            translation: '这种处理能力的普及加上互联网将导致大量分布式劳动力，他们将能够以前所未有的方式利用全球专业人才库。',
            analysis: '过去分词短语 coupled with the Internet 作状语。who 引导定语从句修饰 workers。in a way that... 是方式状语，that was never possible before 是定语从句。'
        },
        {
            source: '2011 英语一 Text 3',
            sentence: 'Rather than dismissing the outcry against this trend as the nostalgia of those who fear change, we should examine what lies beneath the widespread hostility to celebrity culture.',
            main: 'Rather than dismissing the outcry, we should examine what lies beneath the hostility.',
            translation: '我们不应该把反对这一趋势的强烈抗议视为害怕变革者的怀旧旧情绪，而应该审视公众对名人文化普遍敌意背后的原因。',
            analysis: 'rather than doing sth 是介词短语作状语。that fear change 是定语从句修饰 those。what lies beneath... 是宾语从句。'
        },
        {
            source: '2011 英语一 Text 4',
            sentence: 'Classifying greenhouse gases as air pollutants could have a significant effect on agriculture, because it would mean that farmers could face new rules requiring them to control emissions of methane and nitrous oxide from their livestock.',
            main: 'Classifying gases as pollutants could have a significant effect.',
            translation: '将温室气体归类为空气污染物可能对农业产生重大影响，因为这意味着农民可能面临要求他们控制牲畜甲烷和一氧化二氮排放的新规定。',
            analysis: '动名词短语 Classifying... 作主语。because 引导原因状语从句。that farmers could face... 是宾语从句。requiring them to control... 是现在分词短语作后置定语，修饰 rules。'
        },
        {
            source: '2012 英语一 Text 1',
            sentence: 'But as tax and policy experts得主 an increasingly sophisticated understanding of the legal limitations on what governments can do, the question becomes whether the current legal restrictions represent the right balance between individual liberty and public welfare.',
            main: 'The question becomes whether the restrictions represent the right balance.',
            translation: '但随着税务和政策专家对政府行为的法律限制有了越来越深入的理解，问题变成了当前的法律限制是否代表了个人自由与公共福利之间的正确平衡。',
            analysis: 'as 引导时间状语从句。on what governments can do 是介词短语作定语，修饰 limitations。whether the current legal restrictions represent... 是表语从句。'
        },
        {
            source: '2012 英语一 Text 2',
            sentence: 'An重要的 research has shown that the same cell phone attachments that carry the human voice also carry the viral particles that transmit the common cold and other diseases, so that the humble telephone becomes a powerful transmitter of illness.',
            main: 'Research has shown that attachments carry viral particles.',
            translation: '重要的研究表明，携带人类声音的相同手机附件也携带传播普通感冒和其他疾病的病毒颗粒，因此微不足道的电话成为一个强大的疾病传播者。',
            analysis: 'that the same cell phone attachments... 是宾语从句。that carry the human voice 和 that transmit... 是定语从句，分别修饰 attachments 和 particles。so that 引导结果状语从句。'
        },
        {
            source: '2012 英语一 Text 3',
            sentence: 'Migration is a net contributor to the economic development of receiving countries, bringing not just workers but also consumers whose spending supports jobs and growth.',
            main: 'Migration is a net contributor to development.',
            translation: '移民是接收国经济发展的净贡献者，它带来的不只是工人，还有消费者，他们的消费支持着就业和增长。',
            analysis: '动名词短语 Migration is... 是主系表结构。bringing not just workers but also consumers 是现在分词短语作伴随状语。whose spending supports jobs and growth 是定语从句修饰 consumers。'
        },
        {
            source: '2012 英语一 Text 4',
            sentence: 'In the US and Canada, the proportion of the population belonging to minority groups is projected to rise from about one-fifth today to between one-third and one-half by 2050, which represents a fundamental shift in the demographic landscape.',
            main: 'The proportion is projected to rise from about one-fifth to between one-third and one-half.',
            translation: '在美国和加拿大，属于少数群体的人口比例预计将从目前的约五分之一上升到2050年的三分之一到二分之一之间，这代表了人口结构的根本转变。',
            analysis: 'belonging to minority groups 是现在分词短语作后置定语修饰 population。which 引导非限定性定语从句，修饰前面整个句子。'
        },
        {
            source: '2013 英语一 Text 1',
            sentence: 'Though the popular connect-between-the-dots, pioneered by the Pulitzer Prize-winning columnist, may be the most visible form of this kind of journalism, it is by no means the dominant one, which is local, systematic and nowhere close to being as dramatic.',
            main: 'The popular connect-between-the-dots may be the most visible form, but it is not the dominant one.',
            translation: '尽管这种新闻业最常见的形式——由普利策奖获奖专栏作家开创的"点与点连线"——可能是最可见的形式，但它绝不是主导形式，主导形式是地方的、系统的、远不如前者那么戏剧化的。',
            analysis: 'though 引导让步状语从句。pioneered by... 是过去分词短语作后置定语。which is local, systematic and nowhere close to being as dramatic 是非限定性定语从句，修饰 one（the dominant one）。'
        },
        {
            source: '2013 英语一 Text 2',
            sentence: 'In the US, the FBI has identified about 400 of these groups, up from fewer than 200 in 2008, and it has logged a 400 percent increase in anti-militia activity since the election of the first black president.',
            main: 'The FBI has identified about 400 groups and has logged a 400 percent increase.',
            translation: '在美国，FBI已经确认了约400个这样的团体，比2008年的不到200个有所增加，自第一位黑人总统当选以来，反民兵活动增加了400%。',
            analysis: 'up from fewer than 200 in 2008 是插入语，作状语。since the election of the first black president 是时间状语。'
        },
        {
            source: '2013 英语一 Text 3',
            sentence: 'The assumption that human morality can be studied scientifically is itself controversial, raising uncomfortable questions about the nature of morality and what it means to be human.',
            main: 'The assumption is itself controversial.',
            translation: '人类道德可以被科学研究的假设本身就存在争议，引起了关于道德本质和成为人类意味着什么的令人不安的问题。',
            analysis: 'that human morality can be studied scientifically 是同位语从句，解释 assumption。raising uncomfortable questions about... 是现在分词短语作结果状语。what it means to be human 是宾语从句，作 about 的宾语。'
        },
        {
            source: '2013 英语一 Text 4',
            sentence: 'The new research, published in the journal Science, paints a surprisingly optimistic picture of the megafauna\'s future, suggesting that many species will survive this crisis and eventually flourish under the hotter, drier conditions predicted for the end of the century.',
            main: 'The new research paints a surprisingly optimistic picture.',
            translation: '发表在《科学》杂志上的这项新研究为巨型动物群的未来描绘了一幅令人惊讶的乐观图景，表明许多物种将在这次危机中存活下来，并最终在本世纪末预测的更热、更干燥的条件下繁荣发展。',
            analysis: 'published in the journal Science 是过去分词短语作后置定语。suggesting that... 是现在分词短语作结果状语。predicted for the end of the century 是过去分词短语作后置定语，修饰 conditions。'
        },
        {
            source: '2014 英语一 Text 1',
            sentence: 'A 2012 survey found that 63 percent of Americans think that young people don\'t read books for pleasure anymore, but that number has probably been inflated by the common belief that everyone is reading less when in fact, data from the US Department of Education suggests that reading has remained relatively stable.',
            main: 'A 2012 survey found that 63 percent think that young people don\'t read books, but that number has probably been inflated.',
            translation: '2012年的一项调查发现，63%的美国人认为年轻人不再为了消遣而阅读，但这个数字可能被夸大了，因为人们普遍认为每个人的阅读量都在减少，而实际上，美国教育部的数据显示阅读量相对保持稳定。',
            analysis: 'that 63 percent think... 是宾语从句。that young people don\'t read... 是宾语从句。but 连接两个并列分句。when in fact 是插入语。that everyone is reading less 是宾语从句。that reading has remained stable 是宾语从句。'
        },
        {
            source: '2014 英语一 Text 2',
            sentence: 'The researchers discovered that the women who used a mirror while talking about their experiences showed stronger self-compassion, which in turn led them to feel more confident about their ability to overcome challenges.',
            main: 'The researchers discovered that the women showed stronger self-compassion.',
            translation: '研究人员发现，在谈论自己经历时使用镜子的女性表现出更强的自我同情，这反过来使她们对自己的克服挑战能力更有信心。',
            analysis: 'that the women who used a mirror... 是宾语从句。who used a mirror while talking... 是定语从句修饰 women。which 引导非限定性定语从句，修饰前面整个句子。'
        },
        {
            source: '2014 英语一 Text 3',
            sentence: 'One is reminded of the old joke about the man who visited his doctor, complained about pain in his leg, and was told to go home and rest, only for the man to return the next day complaining that his arm had disappeared.',
            main: 'One is reminded of the old joke.',
            translation: '人们想起了那个老笑话：一个人去看医生，抱怨腿疼，被告知回家休息，结果第二天回来说手臂不见了。',
            analysis: 'who visited his doctor, complained..., and was told... 是定语从句修饰 man。only for the man to return... 是独立主格结构，表示结果。that his arm had disappeared 是宾语从句。'
        },
        {
            source: '2014 英语一 Text 4',
            sentence: 'The question of whether the corporate income tax is passed forward to workers - in the form of lower wages - or backward to shareholders - in the form of lower returns - is ultimately an empirical matter that can only be resolved by looking at actual data.',
            main: 'The question is ultimately an empirical matter.',
            translation: '企业所得税是被转嫁到工人身上——以降低工资的形式——还是被转嫁到股东身上——以降低回报的形式——的问题，最终是一个实证问题，只能通过查看实际数据来解决。',
            analysis: 'of whether... 是介词短语作定语修饰 question。whether the corporate income tax is passed forward... or backward... 是主语从句。that can only be resolved... 是定语从句修饰 matter。'
        },
        {
            source: '2015 英语一 Text 1',
            sentence: 'The history of the news business, then, is largely one of gradual expansion into new markets and new media, followed eventually by the arrival of a new technology that disrupted the previous model and forced a fresh round of adaptation.',
            main: 'The history is largely one of expansion and followed by the arrival.',
            translation: '因此，新闻业的历史在很大程度上是向新市场和新媒体逐步扩张的历史，随后是新技术到来颠覆现有模式并迫使新一轮适应的历史。',
            analysis: 'of gradual expansion... 和 of the arrival... 是并列的介词短语作定语修饰 one。that disrupted... 和 that forced... 是定语从句修饰 technology。'
        },
        {
            source: '2015 英语一 Text 2',
            sentence: 'The legal issues are fuzzy, says Gregory Day, a professor at the University of Missouri School of Law, because courts have yet to determine what happens when a company collects data from users but doesn\'t sell it to anyone else.',
            main: 'The legal issues are fuzzy, says Gregory Day.',
            translation: '密苏里大学法学院教授格雷戈里·戴说，法律问题很模糊，因为法院尚未确定当公司从用户收集数据但不将其出售给其他任何人时会发生什么。',
            analysis: 'a professor at... 是同位语。because 引导原因状语从句。what happens... 是宾语从句。when a company collects... 是时间状语从句。'
        },
        {
            source: '2015 英语一 Text 3',
            sentence: 'Yet in an article published last year, McGill professor of psychiatry James Lyons-Weiler speculates that the surge in the number of North American children diagnosed with autism between 1990 and 2000 might have been caused by the introduction of a mercury-based preservative in some vaccines in the late 1980s.',
            main: 'James Lyons-Weiler speculates that the surge might have been caused by the introduction of a preservative.',
            translation: '然而，麦克吉尔大学精神病学教授詹姆斯·莱昂斯-韦特勒在去年发表的一篇文章中推测，1990年至2000年间被诊断患有自闭症的北美儿童数量的激增可能是由20世纪80年代末某些疫苗中引入的汞基防腐剂引起的。',
            analysis: 'published last year 是过去分词短语作后置定语。that the surge... might have been caused... 是宾语从句。between 1990 and 2000 是时间状语。diagnosed with autism 是过去分词短语作后置定语。'
        },
        {
            source: '2016 英语一 Text 1',
            sentence: 'With the exception of those items that are explicitly stated to be disposable, products are generally expected to last as long as the consumer wants them to last, which creates an implicit expectation of durability.',
            main: 'Products are generally expected to last.',
            translation: '除了那些被明确声明为一次性使用的物品外，产品通常被期望在消费者希望它们使用的期限内使用，这产生了对耐用性的隐性期望。',
            analysis: 'With the exception of those items... 是介词短语作状语。that are explicitly stated to be disposable 是定语从句修饰 items。which creates an implicit expectation of durability 是非限定性定语从句，修饰前面整个句子。'
        },
        {
            source: '2016 英语一 Text 2',
            sentence: 'The implication is that the legal profession will avoid taking on new challenges in a way that it might otherwise do, for fear of damaging its hard-won reputation for objectivity.',
            main: 'The implication is that the profession will avoid taking on new challenges.',
            translation: '这意味着法律行业将以一种可能在其他情况下不会采取的方式来避免接受新的挑战，因为它担心损害其来之不易的客观性声誉。',
            analysis: 'that the legal profession will avoid... 是表语从句。in a way that it might otherwise do 是方式状语。for fear of doing 是介词短语作原因状语。'
        },
        {
            source: '2016 英语一 Text 3',
            sentence: 'It is the principle that matters most, not the mechanism by which the decision is made, and this is why the question of who decides is more fundamental than the question of how decisions are made.',
            main: 'It is the principle that matters most, and this is why the question of who decides is more fundamental.',
            translation: '原则比机制更重要，决策是如何做出的并不重要，这就是为什么谁来做决定的问题比如何做出决定的问题更根本。',
            analysis: 'It is... that matters 是强调句型。not the mechanism... 是并列的表语。that the decision is made 是定语从句修饰 mechanism。and 连接两个并列分句。why the question... is more fundamental 是表语从句。'
        },
        {
            source: '2016 英语一 Text 4',
            sentence: 'There will eventually come a day when, instead of simply throwing away newspapers when we finish reading them, we will be able to feed them into a recycling bin that turns them back into new paper at the touch of a button.',
            main: 'There will come a day.',
            translation: '终有一天，我们不只是读完报纸就把它们扔掉，而是能够把它们扔进回收箱，按一下按钮就能把它们变成新纸。',
            analysis: 'there be 句型的将来时。when... 是定语从句修饰 day。instead of... 和 we will be able to... 是从句中的并列谓语。that turns them back into new paper 是定语从句修饰 recycling bin。'
        },
        {
            source: '2017 英语一 Text 1',
            sentence: 'The administration is seeking to extend the definition of "special needs" to include those whose obesity is so severe that it prevents them from getting a job or using public transportation.',
            main: 'The administration is seeking to extend the definition.',
            translation: '政府正在寻求将"特殊需求"的定义扩展到包括那些肥胖严重到无法获得工作或使用公共交通的人。',
            analysis: 'to extend the definition 是动名词短语作宾语。whose obesity is so severe that... 是定语从句修饰 those。that it prevents them... 是结果状语从句。'
        },
        {
            source: '2017 英语一 Text 2',
            sentence: 'The most famous actress of her era, she was also the first major American actress to appear in pants, to demand that her name appear above the title of the films in which she starred, and to establish her own production company.',
            main: 'She was also the first major American actress to appear in pants.',
            translation: '作为她那个时代最著名的女演员，她也是美国主要女演员中第一个穿裤子的、第一个要求在自己的电影标题上显示自己名字的、第一个建立自己制作公司的。',
            analysis: 'The most famous actress of her era 是主语的同位语。to appear, to demand, to establish 是三个并列的不定式短语作表语。that her name appear... 是宾语从句。in which she starred 是定语从句修饰 films。'
        },
        {
            source: '2017 英语一 Text 3',
            sentence: 'What all these developments have in common is that they are all language-based, which is why economists increasingly view the information economy as a从根本上改变我们工作方式的东西.',
            main: 'What all these developments have in common is that they are all language-based.',
            translation: '所有这些发展的共同点是它们都是基于语言的，这就是为什么经济学家越来越多地将信息经济视为从根本上改变我们工作方式的东西。',
            analysis: 'What all these developments have in common 是主语从句。that they are all language-based 是表语从句。which is why... 是非限定性定语从句。'
        },
        {
            source: '2018 英语一 Text 1',
            sentence: 'The defining term of technology in this century is not obvious, but the change that will have greatest impact is the increased role of artificial intelligence, which is already beginning to transform everything from transportation to education to healthcare.',
            main: 'The defining term is not obvious, but the change will have greatest impact.',
            translation: '本世纪技术的定义性术语并不明显，但将产生最大影响的变化是人工智能的作用日益增强，人工智能已经开始改变从交通到教育到医疗的一切。',
            analysis: 'but 连接两个并列分句。that will have greatest impact 是定语从句修饰 change。which is already beginning to transform... 是非限定性定语从句，修饰 AI。'
        },
        {
            source: '2018 英语一 Text 2',
            sentence: 'The problem is that the models are likely to narrow rather than expand the range of outcomes, because they cannot incorporate the full range of human values or the complexity of social interactions.',
            main: 'The problem is that the models are likely to narrow rather than expand the range.',
            translation: '问题是这些模型可能会缩小而不是扩大结果范围，因为它们无法纳入全部的人类价值观或社会互动的复杂性。',
            analysis: 'that the models are likely to narrow... 是表语从句。rather than 连接两个并列的动词不定式。because 引导原因状语从句。'
        },
        {
            source: '2018 英语一 Text 3',
            sentence: 'What is interesting about the NHS agreement is that it shows Google is willing to make a formal commitment to ongoing oversight of the data, rather than just agreeing to ad hoc spot-checks.',
            main: 'What is interesting is that it shows Google is willing to make a formal commitment.',
            translation: '有趣的是，NHS协议表明谷歌愿意对数据进行正式的持续监督承诺，而不是仅仅同意临时抽查。',
            analysis: 'What is interesting about the NHS agreement 是主语从句。that it shows Google is willing to... 是表语从句。rather than 连接两个并列的动名词短语。'
        },
        {
            source: '2018 英语一 Text 4',
            sentence: 'If you want to understand why the USPS is in trouble, look at the fundamental transformation that has taken place in the newspaper industry, which is undergoing the same existential crisis.',
            main: 'Look at the fundamental transformation.',
            translation: '如果你想了解为什么USPS陷入困境，看看报纸行业发生的基本转型就知道了，报纸行业正在经历同样的生存危机。',
            analysis: 'If you want to understand... 是条件状语从句。why the USPS is in trouble 是宾语从句。that has taken place... 是定语从句修饰 transformation。which is undergoing... 是非限定性定语从句，修饰 newspaper industry。'
        },
        {
            source: '2019 英语一 Text 1',
            sentence: 'It is almost never the case that a single factor alone produces a market trend, yet we persist in looking for the one reason why stocks go up or down.',
            main: 'It is almost never the case that a single factor produces a trend.',
            translation: '单一因素单独产生市场趋势几乎从未发生过，但我们仍在固执地寻找股票上涨或下跌的唯一原因。',
            analysis: 'It is almost never the case that... 是固定句型。that a single factor alone produces... 是同位语从句。yet 连接两个并列分句。why stocks go up or down 是定语从句，修饰 reason。'
        },
        {
            source: '2019 英语一 Text 2',
            sentence: 'One explanation is that the rise of grade inflation has made it harder for employers to distinguish between students who genuinely learned something and those who simply accumulated course credits.',
            main: 'One explanation is that the rise has made it harder for employers to distinguish.',
            translation: '一种解释是，分数膨胀的上升使雇主更难区分真正学到东西的学生和那些只是积累学分的学生。',
            analysis: 'that the rise of grade inflation has made it harder... 是表语从句。for employers to distinguish between students and those 是"make it + adj + for sb to do sth"结构。who genuinely learned... 和 who simply accumulated... 是两个定语从句，分别修饰 students 和 those。'
        },
        {
            source: '2019 英语一 Text 3',
            sentence: 'But just as we might be tempted to rely on Frankenstein to discuss the ethics of AI, we should be careful about drawing too many parallels between the novel and the reality of today\'s AI research.',
            main: 'Just as we might be tempted to rely on Frankenstein, we should be careful about drawing parallels.',
            translation: '但正如我们可能忍不住用《弗兰肯斯坦》来讨论人工智能的伦理一样，我们也应该谨慎，不要在这个小说和当今人工智能研究的现实之间画太多类比。',
            analysis: 'just as 引导方式状语从句。to rely on Frankenstein 和 to discuss... 是并列的不定式短语。about drawing too many parallels 是介词短语作状语。between the novel and the reality... 是介词短语作定语。'
        },
        {
            source: '2019 英语一 Text 4',
            sentence: 'The consequence is that you may be being charged for a product that you do not want and are being denied the one you actually need, simply because you lack the information or the leverage to negotiate a better deal.',
            main: 'The consequence is that you may be being charged for a product.',
            translation: '结果是，你可能正在为你不想要的产品付费，却被拒绝你真正需要的那一个，仅仅因为你缺乏信息或筹码来谈判一个更好的交易。',
            analysis: 'that you may be being charged... 是表语从句。that you actually need 是定语从句修饰 one。because 引导原因状语从句。'
        },
        {
            source: '2020 英语一 Text 2',
            sentence: 'The success of Sci-Hub, which relies on researchers passing on copies they have themselves legally accessed, shows the legal ecosystem has lost legitimacy among its users and must be transformed so that it works for all participants.',
            main: 'The success shows the legal ecosystem has lost legitimacy and must be transformed.',
            translation: 'Sci-Hub的成功——它依赖于研究人员传递他们自己合法获取的副本——表明法律生态系统已经失去了其用户的合法性，必须进行改革，使其为所有参与者服务。',
            analysis: 'which relies on... 是非限定性定语从句，修饰 Sci-Hub。they have themselves legally accessed 是定语从句修饰 copies。shows 后是宾语从句。so that it works for all participants 是目的状语从句。'
        },
        {
            source: '2020 英语一 Text 3',
            sentence: 'If the bills become law, state boards and commissions will be required to set aside 50 percent of board seats for women by 2022, a threshold that some consider too high and others view as a reasonable compromise.',
            main: 'State boards and commissions will be required to set aside 50 percent.',
            translation: '如果这些法案成为法律，州董事会和委员会将被要求在2022年前为女性保留50%的董事会席位，这一门槛一些人认为太高，另一些人认为是合理的妥协。',
            analysis: 'If the bills become law 是条件状语从句。a threshold... 是50 percent的同位语。that some consider too high 和 that others view as a reasonable compromise 是两个定语从句，都修饰 threshold。'
        },
        {
            source: '2020 英语一 Text 4',
            sentence: 'These unilateral developments differ in their specifics, but they are all designed to tax multinationals on income and revenue that countries believe they should have a right to tax, even if international tax rules do not grant them that right.',
            main: 'These unilateral developments differ in specifics, but they are all designed to tax multinationals.',
            translation: '这些单边措施在具体细节上有所不同，但它们都旨在对跨国公司的收入和 revenue征税，这些收入和 revenue各国认为他们有权征税，即使国际税收规则不授予他们这种权利。',
            analysis: 'but 连接两个并列分句。that countries believe... 是定语从句修饰 income and revenue。they should have a right to tax 是宾语从句。even if 引导让步状语从句。'
        },
        {
            source: '2020 英语一 翻译',
            sentence: 'Before each of their revelations, many thinkers at the time had sustained more ancient ways of thinking, including the geocentric view that the Earth was at the centre of our universe.',
            main: 'Many thinkers had sustained more ancient ways of thinking.',
            translation: '在他们每个人的启示之前，当时的许多思想家都保持着更古老的思维方式，包括地心说观点——认为地球是宇宙的中心。',
            analysis: 'Before each of their revelations 是时间状语。including the geocentric view... 是介词短语作状语。that the Earth was at the centre... 是同位语从句，解释 view。'
        },
        {
            source: '2020 英语一 翻译',
            sentence: 'Despite attempts by the Church to suppress this new generation of logicians and rationalists, more explanations for how the universe functioned were being made at a rate that the people could no longer ignore.',
            main: 'More explanations were being made at a rate.',
            translation: '尽管教会试图压制这一代逻辑学家和理性主义者，但关于宇宙如何运作的更多解释正以人们无法再忽视的速度被提出。',
            analysis: 'Despite attempts by the Church to suppress... 是让步状语。for how the universe functioned 是介词短语作定语修饰 explanations。that the people could no longer ignore 是定语从句修饰 rate。'
        },
        {
            source: '2021 英语一 Text 2',
            sentence: 'Ferraro wanted to see if Indonesia\'s poverty-alleviation program was affecting deforestation, and the results came as a surprise: The program was associated with a 30 percent reduction in deforestation.',
            main: 'Ferraro wanted to see if the program was affecting deforestation, and the results came as a surprise.',
            translation: '费拉罗想看看印度尼西亚的扶贫计划是否正在影响森林砍伐，结果出人意料：该计划与森林砍伐减少30%相关。',
            analysis: 'if Indonesia\'s poverty-alleviation program was affecting deforestation 是宾语从句。and 连接两个并列分句。冒号后是补充说明。'
        },
        {
            source: '2021 英语一 Text 3',
            sentence: 'But exposure times were much quicker by the 1880s, and the introduction of the Box Brownie and other portable cameras meant that, though slow by today\'s digital standards, the exposure was almost instantaneous.',
            main: 'Exposure times were quicker, and the introduction meant that the exposure was almost instantaneous.',
            translation: '但到19世纪80年代，曝光时间大大缩短，波克斯布朗尼和其他便携式相机的推出意味着，尽管按今天的数字标准来看仍然很慢，但曝光几乎是即时的。',
            analysis: 'by the 1880s 是时间状语。and 连接两个并列分句。that... 是宾语从句。though slow by today\'s digital standards 是让步状语。'
        },
        {
            source: '2021 英语一 Text 4',
            sentence: 'Yet that demand has been almost impossible to fill—in part because of pushback from broadband providers, anti-regulatory conservatives and the courts.',
            main: 'That demand has been almost impossible to fill.',
            translation: '然而，这一需求几乎不可能得到满足——部分原因是来自宽带提供商、反监管保守派和法院的反对。',
            analysis: 'in part because of pushback from... 是原因状语。because of 和名词连用，pushback from 后面接三个并列宾语。'
        },
        {
            source: '2022 英语一 Text 1',
            sentence: 'The variety of plastic objects at risk is dizzying: early radios, avant-garde sculptures, celluloid animation stills from Disney films, the first artificial heart.',
            main: 'The variety of plastic objects at risk is dizzying.',
            translation: '面临风险的塑料物品种类繁多，令人眼花缭乱：早期的收音机、前卫的雕塑、迪士尼电影的电影动画剧照、第一个人工心脏。',
            analysis: '冒号后是具体举例。at risk 是介词短语作定语修饰 objects。'
        },
        {
            source: '2022 英语一 Text 2',
            sentence: 'Millennials were told that if you did well in school, got a decent degree, you would be set up for life, but that promise has been found wanting.',
            main: 'Millennials were told that you would be set up for life, but that promise has been found wanting.',
            translation: '千禧一代被告知，如果你学业出色，获得一个体面的学位，你就会一辈子安稳，但这一承诺已被发现是不够的。',
            analysis: 'that if you did well..., got a decent degree, you would be set up for life 是宾语从句。but 连接两个并列分句。'
        },
        {
            source: '2022 英语一 Text 3',
            sentence: 'Such an approach can both prompt new research as well as result in powerful art, and more than half a century ago, MIT opened its Center for Advanced Visual Studies to explore the role of technology in culture.',
            main: 'Such an approach can both prompt new research as well as result in powerful art.',
            translation: '这种方法既能促进新的研究，也能产生强大的艺术，而且早在半个多世纪前，麻省理工学院就开设了高级视觉研究中心来探索技术在文化中的作用。',
            analysis: 'both... as well as... 连接两个并列的谓语。and 连接两个并列分句。to explore the role of technology in culture 是不定式短语作目的状语。'
        },
        {
            source: '2022 英语一 Text 4',
            sentence: 'Yet these provisions create difficulties for businesses when applied to highly paid managers and executives, as countless boards and business owners will attest.',
            main: 'These provisions create difficulties for businesses.',
            translation: '然而，正如无数董事会和企业主所证明的，当这些条款适用于高薪经理和高管时，会给企业带来困难。',
            analysis: 'when applied to highly paid managers and executives 是省略的时间状语从句（when they are applied...）。as countless boards... will attest 是方式状语从句。'
        },
        {
            source: '2022 英语一 翻译',
            sentence: 'I was keen to read more, but was surprised to find that Oman\'s appendix, published in 1914, was the only considered thing that had been written about this secret war.',
            main: 'I was keen to read more, but was surprised to find that the appendix was the only considered thing.',
            translation: '我渴望阅读更多内容，但惊讶地发现，奥曼在1914年出版的附录是关于这场秘密战争的唯一被认为有价值的著作。',
            analysis: 'published in 1914 是过去分词短语作后置定语。that had been written about this secret war 是定语从句修饰 thing。'
        },
        {
            source: '2023 英语一 Text 1',
            sentence: 'Pat Hardy, who sympathises with the views of the energy sector, is resisting proposed changes to science standards for pre-teen pupils.',
            main: 'Pat Hardy is resisting proposed changes.',
            translation: '帕特·哈迪同情能源行业的观点，她正在抵制对青春期前儿童科学标准的拟议修改。',
            analysis: 'who sympathises with the views of the energy sector 是非限定性定语从句，修饰 Pat Hardy。for pre-teen pupils 是介词短语作定语，修饰 standards。'
        },
        {
            source: '2023 英语一 Text 2',
            sentence: 'In New Hampshire, where the rental vacancy rate has dropped below 1 percent, housing advocates fear unchecked short-term rentals will put further pressure on an already strained market.',
            main: 'Housing advocates fear unchecked short-term rentals will put further pressure.',
            translation: '在新罕布什尔州，那里的租金空置率已降至1%以下，住房倡导者担心，不受约束的短期租赁将给本已紧张的市场带来更大压力。',
            analysis: 'where the rental vacancy rate has dropped below 1 percent 是非限定性定语从句，修饰 New Hampshire。that unchecked short-term rentals will put... 是宾语从句。'
        },
        {
            source: '2023 英语一 Text 3',
            sentence: 'The problem began late last year, when PRH confirmed that it had introduced a credit limit with Waterstones at a very significant level.',
            main: 'The problem began late last year.',
            translation: '问题始于去年年底，当时PRH确认已与Waterstones签订了非常重要的信用额度。',
            analysis: 'when PRH confirmed... 是非限定性定语从句，修饰 last year。that it had introduced a credit limit... 是宾语从句。'
        },
        {
            source: '2023 英语一 Text 4',
            sentence: 'In 2016, researchers developed an algorithm to recognize suspicious citation patterns, including groups of authors that disproportionately cite one another and groups of journals that cite each other frequently to increase the impact factors of their publications.',
            main: 'Researchers developed an algorithm to recognize suspicious citation patterns.',
            translation: '2016年，研究人员开发了一种算法来识别可疑的引用模式，包括不成比例地相互引用彼此的作者群体，以及为了提高各自出版物的影响因子而频繁相互引用的期刊群体。',
            analysis: 'to recognize suspicious citation patterns 是不定式短语作目的状语。including groups of authors... and groups of journals... 是现在分词短语作定语，修饰 patterns。两个 that 分别是定语从句，修饰 authors 和 journals。'
        },
        {
            source: '2024 英语一 Text 1',
            sentence: 'The nail hoard was discovered in 1960 in a four-metre-deep pit covered by two metres of gravel, and the likely explanation is that the withdrawal was rushed and they didn\'t want the local Caledonians getting their hands on weapon-grade iron.',
            main: 'The nail hoard was discovered, and the likely explanation is that the withdrawal was rushed.',
            translation: '这批钉子于1960年在一个深四米、覆盖着两米砾石的坑中被发现，可能的解释是撤退是仓促的，他们不想让当地的卡利多尼亚人获得武器级铁。',
            analysis: 'covered by two metres of gravel 是过去分词短语作后置定语，修饰 pit。and 连接两个并列分句。that the withdrawal was rushed 是表语从句。they didn\'t want the local Caledonians getting... 是宾语从句。'
        },
        {
            source: '2024 英语一 Text 2',
            sentence: 'In a paper published in the Journal of Child Psychology and Psychiatry, researchers said that the western nuclear family was a recent invention which broke with evolutionary history.',
            main: 'Researchers said that the western nuclear family was a recent invention.',
            translation: '在发表在《儿童心理学和精神病学杂志》上的一篇论文中，研究人员表示，西方核心家庭是最近才出现的发明，与进化史相悖。',
            analysis: 'published in the Journal... 是过去分词短语作后置定语。that the western nuclear family was a recent invention 是宾语从句。which broke with evolutionary history 是非限定性定语从句，修饰 invention。'
        },
        {
            source: '2024 英语一 Text 3',
            sentence: 'The tool, along with other popular image-generation AI models, allows anyone to create impressive images based on text prompts, but these open-source programs are built by scraping images from the internet, often without permission and proper attribution to artists.',
            main: 'The tool allows anyone to create impressive images, but these programs are built by scraping images.',
            translation: '该工具与其他流行的图像生成人工智能模型一起，允许任何人基于文本提示创建令人印象深刻的图像，但这些开源程序是通过从互联网上抓取图像来构建的，通常没有获得许可，也没有对艺术家进行适当的归属。',
            analysis: 'along with other popular image-generation AI models 是插入语。but 连接两个并列分句。based on text prompts 是过去分词短语作状语。often without permission and proper attribution to artists 是介词短语作状语。'
        },
        {
            source: '2024 英语一 Text 4',
            sentence: 'Specifically, a 5-4 majority decided that wetlands protected by the EPA under its Clean Water Act authority must have a continuous surface connection to bodies of water, which narrowing the regulatory scope was a victory for builders and mining operators.',
            main: 'A majority decided that wetlands must have a continuous surface connection.',
            translation: '具体来说，以5比4的多数票决定，受美国环保署《清洁水法》保护的湿地必须与水体有连续的地表连接，这缩小监管范围的裁决对建筑商和采矿运营商来说是一场胜利。',
            analysis: 'protected by the EPA under its Clean Water Act authority 是过去分词短语作后置定语修饰 wetlands。that wetlands must have... 是宾语从句。which narrowing... 是非限定性定语从句，修饰前面整个句子。'
        },
        {
            source: '2025 英语一 Text 2',
            sentence: 'It is unarguable that our laboratories, scientific instruments, rockets and satellites demand significant amounts of energy both in their construction and operation, and the carbon emissions from technological research are well spent.',
            main: 'It is unarguable that our tools demand energy, and the carbon emissions are well spent.',
            translation: '毫无疑问，我们的实验室、科学仪器、火箭和卫星在建造和运营过程中都需要大量能源，而且来自技术研究的碳排放是值得的。',
            analysis: 'It is unarguable that... 是主语从句。both in their construction and operation 是介词短语作状语。and 连接两个并列分句。'
        },
        {
            source: '2025 英语一 Text 3',
            sentence: 'With no video production costs, illegal streaming sites have achieved profit margins approaching 90 percent, according to the Motion Picture Association, which represents Hollywood studios.',
            main: 'Illegal streaming sites have achieved profit margins approaching 90 percent.',
            translation: '据代表好莱坞制片公司的电影协会称，由于没有视频制作成本，非法流媒体网站已经实现了接近90%的利润率。',
            analysis: 'With no video production costs 是独立主格结构作原因状语。according to the Motion Picture Association 是插入语。which represents Hollywood studios 是非限定性定语从句，修饰 MPA。'
        },
        {
            source: '2025 英语一 Text 4',
            sentence: 'Libraries and archives have traditionally shouldered the responsibility of organization, preservation, and access to information, and librarians digitize the tangible so that researchers the world over can quickly search and access their holdings.',
            main: 'Libraries and archives have shouldered the responsibility, and librarians digitize the tangible.',
            translation: '图书馆和档案馆传统上承担了组织、保存和获取信息的责任，图书馆员将实物数字化，以便全世界的研究人员能够快速搜索和访问他们的馆藏。',
            analysis: 'of organization, preservation, and access to information 是介词短语作定语修饰 responsibility。so that researchers... can quickly search... 是目的状语从句。'
        },
        {
            source: '2025 英语一 翻译',
            sentence: 'Anyone can be a citizen scientist, regardless of age, nationality or academic experience, and you don\'t even need any formal training, just an inquisitive mind and the enthusiasm to join one of the thousands of citizen science projects.',
            main: 'Anyone can be a citizen scientist, and you don\'t even need any formal training.',
            translation: '任何人都可以成为公民科学家，无论年龄、国籍或学术经验如何，你甚至不需要任何正规培训，只需要好奇心和加入数千个公民科学项目之一的热情。',
            analysis: 'regardless of age, nationality or academic experience 是让步状语。and 连接两个并列分句。just an inquisitive mind and the enthusiasm... 是省略句，补充说明前文。'
        },
        {
            source: '2020 英语二 Text 1',
            sentence: 'During the experiment, the social robot rat followed the living rats around, played with the same toys, and opened cage doors to let trapped rats escape, while the asocial robot simply moved forwards and backwards and side to side.',
            main: 'The social robot rat followed, played, and opened cage doors, while the asocial robot moved.',
            translation: '在实验期间，社交型机器鼠跟随活鼠四处活动，与相同的玩具玩耍，并打开笼门让被困的老鼠逃跑，而非社交型机器鼠只是前后左右移动。',
            analysis: 'and 连接三个并列谓语。to let trapped rats escape 是不定式短语作目的状语。while 连接两个对比的分句。'
        },
        {
            source: '2020 英语二 Text 2',
            sentence: 'The best model for understanding the growth of CEO pay is that of limited CEO talent in a world where business opportunities for the top firms are growing rapidly.',
            main: 'The best model is that of limited CEO talent.',
            translation: '理解CEO薪酬增长的最佳模型是，在这个世界里，顶层公司的商业机会正在快速增长，CEO人才却很有限。',
            analysis: 'that 代替 the model 以避免重复。where business opportunities for the top firms are growing rapidly 是定语从句修饰 world。'
        },
        {
            source: '2020 英语二 Text 3',
            sentence: 'Seven months and one election day later, a new conservative city council suspended enforcement of the clean air zone, a first step toward its possible demise, and a judge has now overruled the city\'s decision to stop levying fines.',
            main: 'A new conservative city council suspended enforcement, and a judge has overruled the decision.',
            translation: '七个月后和一次选举日后，新保守派市议会暂停了清洁空气区的执法，这是其可能消亡的第一步，现在一名法官已经否决了该市停止征收罚款的决定。',
            analysis: 'a first step toward its possible demise 是 enforcement 的同位语。and 连接两个并列分句。to stop levying fines 是不定式短语作定语修饰 decision。'
        },
        {
            source: '2020 英语二 Text 4',
            sentence: 'If Generation Zs are clear-eyed, economic pragmatists despite graduating into the best economy in the past 50 years, it is because they know what an economic train wreck looks like.',
            main: 'It is because they know what an economic train wreck looks like.',
            translation: '如果Z世代是清醒的、经济务实主义者，尽管他们在过去50年最好的经济中毕业，那是因为他们知道经济列车失事是什么样子。',
            analysis: 'If 引导让步状语从句。it is because... 是强调结构。what an economic train wreck looks like 是宾语从句。'
        },
        {
            source: '2021 英语二 Text 1',
            sentence: 'The pandemic has amplified the already serious structural weaknesses in the global food system that were highlighted by the 2007-2008 food price crisis, which exposed the inability of the system to absorb shocks.',
            main: 'The pandemic has amplified structural weaknesses.',
            translation: '这场大流行放大了2007-2008年粮食价格危机所突出的全球粮食系统中已经严重的结构性弱点，暴露了该系统吸收冲击的能力不足。',
            analysis: 'that were highlighted by... 是定语从句修饰 weaknesses。which exposed... 是非限定性定语从句，修饰前面整个句子。'
        },
        {
            source: '2021 英语二 Text 2',
            sentence: 'The research shows that employees who receive only the minimum required training are significantly more likely to make mistakes than those who participate in ongoing professional development programs.',
            main: 'The research shows that employees who receive only minimum training are more likely to make mistakes.',
            translation: '研究表明，只接受最低要求培训的員工比那些参与持续专业发展项目的員工更有可能犯错误。',
            analysis: 'who receive only the minimum required training 是定语从句修饰 employees。than those who participate... 是比较状语从句。'
        },
        {
            source: '2021 英语二 Text 3',
            sentence: 'The authors acknowledge that the study is observational and therefore cannot establish causation, but they argue that their findings are consistent with the idea that higher minimum wages improve job satisfaction and reduce turnover.',
            main: 'The authors acknowledge that the study is observational, but they argue that their findings are consistent with the idea.',
            translation: '作者承认这项研究是观察性的，因此无法建立因果关系，但他们认为他们的发现与最低工资提高工作满意度并减少人员流动的观点一致。',
            analysis: 'that the study is observational 是宾语从句。and therefore 连接两个并列谓语。but 连接两个并列分句。that higher minimum wages improve... 是同位语从句。'
        },
        {
            source: '2021 英语二 Text 4',
            sentence: 'With the decline of traditional retail and the rise of e-commerce, the commercial landscape of many cities has been fundamentally transformed, creating both challenges and opportunities for urban planners.',
            main: 'The commercial landscape has been fundamentally transformed.',
            translation: '随着传统零售的下降和电子商务的兴起，许多城市的商业格局发生了根本性转变，这给城市规划者带来了挑战和机遇。',
            analysis: 'With the decline of... and the rise of... 是独立主格结构作原因状语。creating both challenges and opportunities 是现在分词短语作结果状语。'
        },
        {
            source: '2022 英语二 Text 1',
            sentence: 'The researchers found that the children who had played with the wooden blocks performed significantly better on tasks measuring spatial reasoning, even after controlling for the children\'s general cognitive ability.',
            main: 'The researchers found that the children performed significantly better.',
            translation: '研究人员发现，搭过积木的孩子在测量空间推理的任务上表现明显更好，即使在控制了孩子们的总体认知能力之后也是如此。',
            analysis: 'who had played with the wooden blocks 是定语从句修饰 children。even after controlling for... 是让步状语。'
        },
        {
            source: '2022 英语二 Text 2',
            sentence: 'The authors argue that this pattern reflects the operation of market forces rather than discrimination, because the wage gaps disappeared when they controlled for occupation, experience, and education.',
            main: 'The authors argue that this pattern reflects the operation of market forces.',
            translation: '作者认为，这种模式反映了市场力量的运作而非歧视，因为他们控制了职业、经验和教育后，工资差距就消失了。',
            analysis: 'that this pattern reflects... 是宾语从句。rather than discrimination 是介词短语作状语。because 引导原因状语从句。'
        },
        {
            source: '2022 英语二 Text 3',
            sentence: 'The research adds to a growing body of evidence suggesting that regular engagement with the arts can have measurable benefits for mental health, particularly for individuals dealing with chronic stress or anxiety.',
            main: 'The research adds to a growing body of evidence.',
            translation: '这项研究增加了越来越多的证据，表明定期参与艺术活动可以对心理健康产生可测量的益处，特别是对处理慢性压力或焦虑的个体。',
            analysis: 'suggesting that... 是现在分词短语作定语，修饰 evidence。that regular engagement... can have... 是宾语从句。'
        },
        {
            source: '2022 英语二 Text 4',
            sentence: 'With remote work becoming increasingly common, employers are grappling with how to maintain company culture and employee engagement when team members are physically dispersed.',
            main: 'Employers are grappling with how to maintain company culture and employee engagement.',
            translation: '随着远程工作变得越来越普遍，雇主正在努力应对当团队成员在物理上分散时如何维护公司文化和员工敬业度的问题。',
            analysis: 'With remote work becoming increasingly common 是独立主格结构作原因状语。how to maintain... 是"疑问词+不定式"结构，作 grappling with 的宾语。when team members are physically dispersed 是时间状语从句。'
        },
        {
            source: '2023 英语二 Text 1',
            sentence: 'The researchers tracked the eating habits of over 2,000 adults for a period of 10 years, and they found that those who reported higher levels of stress were more likely to consume processed foods and sugary drinks.',
            main: 'The researchers tracked the eating habits, and they found that those were more likely to consume.',
            translation: '研究人员跟踪了2000多名成年人的饮食习惯长达10年，他们发现那些报告压力水平较高的人更有可能消费加工食品和含糖饮料。',
            analysis: 'for a period of 10 years 是时间状语。who reported higher levels of stress 是定语从句修饰 those。were more likely to consume... 是宾语从句中的表语。'
        },
        {
            source: '2023 英语二 Text 2',
            sentence: 'The findings challenge the conventional wisdom that economic growth automatically leads to improvements in population health, and they suggest that the relationship between development and health outcomes is more complex than previously thought.',
            main: 'The findings challenge the conventional wisdom, and they suggest that the relationship is more complex.',
            translation: '这些发现挑战了经济增长自动带来人口健康改善的传统观点，它们表明发展与健康结果之间的关系比以前想象的更复杂。',
            analysis: 'that economic growth automatically leads to... 是同位语从句。and 连接两个并列分句。that the relationship between development and health outcomes is more complex... 是宾语从句。'
        },
        {
            source: '2023 英语二 Text 3',
            sentence: 'The authors note that while many countries have pledged to reduce their carbon emissions, the actual implementation of these commitments has been uneven, with some nations making significant progress while others have fallen short of their targets.',
            main: 'The authors note that the actual implementation has been uneven.',
            translation: '作者指出，虽然许多国家承诺减少碳排放，但这些承诺的实际执行情况参差不齐，一些国家取得了重大进展，而另一些国家则未达到目标。',
            analysis: 'that while many countries have pledged... 是宾语从句。with some nations making... while others have fallen... 是独立主格结构作状语。'
        },
        {
            source: '2023 英语二 Text 4',
            sentence: 'With artificial intelligence transforming industries across the economy, policymakers are struggling to develop regulations that can keep pace with the rapid technological change while protecting consumers from potential harms.',
            main: 'Policymakers are struggling to develop regulations.',
            translation: '随着人工智能正在改变整个经济的行业，政策制定者正在努力制定能够跟上快速技术变革同时保护消费者免受潜在伤害的法规。',
            analysis: 'With artificial intelligence transforming... 是独立主格结构作原因状语。that can keep pace with... 是定语从句修饰 regulations。while protecting consumers... 是让步状语。'
        },
        {
            source: '2024 英语二 Text 1',
            sentence: 'The researchers examined data from over 50 countries and found that the relationship between social media use and mental health outcomes varied significantly depending on the type of platform and the manner in which it was used.',
            main: 'The researchers examined data and found that the relationship varied.',
            translation: '研究人员检查了来自50多个国家的数据，发现社交媒体使用与心理健康结果之间的关系因平台类型和使用方式的不同而显著差异。',
            analysis: 'from over 50 countries 是介词短语作定语修饰 data。that the relationship between... varied... 是宾语从句。depending on... 是现在分词短语作状语。in which it was used 是定语从句修饰 manner。'
        },
        {
            source: '2024 英语二 Text 2',
            sentence: 'The authors argue that the conventional metrics used to assess corporate performance, such as earnings per share and return on equity, fail to capture the full range of factors that contribute to long-term value creation.',
            main: 'The authors argue that the conventional metrics fail to capture the full range.',
            translation: '作者认为，用于评估企业绩效的传统指标，如每股收益和股本回报率，无法捕捉有助于长期价值创造的全部因素。',
            analysis: 'that the conventional metrics... fail to capture... 是宾语从句。used to assess corporate performance 是过去分词短语作定语修饰 metrics。such as... 是举例。that contribute to long-term value creation 是定语从句修饰 factors。'
        },
        {
            source: '2024 英语二 Text 3',
            sentence: 'With the cost of renewable energy continuing to decline, the economic case for clean energy transition has become increasingly compelling, even in regions previously considered unsuitable for wind or solar development.',
            main: 'The economic case has become increasingly compelling.',
            translation: '随着可再生能源成本持续下降，清洁能源转型的经济论证变得越来越有说服力，即使在以前被认为不适合风能或太阳能开发的地区也是如此。',
            analysis: 'With the cost of renewable energy continuing to decline 是独立主格结构作原因状语。previously considered unsuitable... 是过去分词短语作定语修饰 regions。'
        },
        {
            source: '2024 英语二 Text 4',
            sentence: 'The study found that students who participated in extracurricular activities reported higher levels of school belonging and were more likely to report academic success than those who did not participate.',
            main: 'The study found that students who participated reported higher levels and were more likely.',
            translation: '研究发现，参与课外活动的学生报告了更高水平的学校归属感，比那些不参与的学生更有可能报告学业成功。',
            analysis: 'who participated in extracurricular activities 是定语从句修饰 students。than those who did not participate 是比较状语从句。'
        },
        {
            source: '2025 英语二 Text 1',
            sentence: 'The researchers discovered that the benefits of bilingual education extend beyond language acquisition, with students who receive bilingual instruction demonstrating stronger critical thinking skills and greater cognitive flexibility.',
            main: 'The researchers discovered that the benefits extend beyond language acquisition.',
            translation: '研究人员发现，双语教育的好处超出了语言习得的范畴，接受双语教学的学生表现出更强的批判性思维能力和更大的认知灵活性。',
            analysis: 'that the benefits of bilingual education extend... 是宾语从句。with students who receive... demonstrating... 是独立主格结构作状语。'
        },
        {
            source: '2025 英语二 Text 2',
            sentence: 'The authors note that while automation has displaced some workers, it has also created new categories of employment that did not exist a generation ago, and retraining programs can help workers transition to these emerging roles.',
            main: 'The authors note that while automation has displaced some workers, it has created new categories, and retraining programs can help workers transition.',
            translation: '作者指出，虽然自动化已经取代了一些工人，但也创造了上一代人不存在的新就业类别，再培训项目可以帮助工人过渡到这些新兴角色。',
            analysis: 'while automation has displaced... 是让步状语从句。that did not exist a generation ago 是定语从句修饰 categories。and 连接三个并列分句。'
        },
        {
            source: '2025 英语二 Text 3',
            sentence: 'With urban populations projected to increase dramatically over the next several decades, city planners are exploring innovative approaches to housing, transportation, and public space that can accommodate growth while reducing environmental impact.',
            main: 'City planners are exploring innovative approaches.',
            translation: '随着城市人口预计在未来几十年大幅增长，城市规划者正在探索创新的住房、交通和公共空间方法，这些方法可以在减少环境影响的同时容纳增长。',
            analysis: 'With urban populations projected to increase... 是独立主格结构作原因状语。that can accommodate growth while reducing... 是定语从句修饰 approaches。'
        },
        {
            source: '2025 英语二 Text 4',
            sentence: 'The research indicates that companies with diverse leadership teams are more likely to introduce innovative products and services, and they also demonstrate superior financial performance over the long term.',
            main: 'The research indicates that companies are more likely to introduce products, and they demonstrate superior performance.',
            translation: '研究表明，拥有多元化领导团队的公司更有可能推出创新产品和服务，他们也在长期表现出更高的财务业绩。',
            analysis: 'that companies with diverse leadership teams are more likely... 是宾语从句。and 连接两个并列分句。over the long term 是时间状语。'
        },
        {
            source: '2010 英语二 Text 1',
            sentence: 'The phenomenon that a person\'s income is closely related to their educational attainment has been well documented, but the causal mechanisms behind this relationship remain poorly understood.',
            main: 'The phenomenon has been well documented, but the causal mechanisms remain poorly understood.',
            translation: '一个人的收入与其教育程度密切相关的现象已被充分记录，但这种关系背后的因果机制仍不为人所理解。',
            analysis: 'that a person\'s income is closely related to... 是同位语从句。but 连接两个并列分句。behind this relationship 是介词短语作定语。'
        },
        {
            source: '2010 英语二 Text 2',
            sentence: 'The research suggests that the advantages of early intervention persist well beyond the initial treatment period, leading to long-term improvements in functional outcomes for patients.',
            main: 'The research suggests that the advantages persist, leading to improvements.',
            translation: '研究表明，早期干预的优势持续时间远远超过最初的治疗期，导致患者长期功能结果的改善。',
            analysis: 'that the advantages of early intervention persist... 是宾语从句。leading to long-term improvements... 是现在分词短语作结果状语。'
        },
        {
            source: '2010 英语二 Text 3',
            sentence: 'Despite the widespread belief that competition encourages innovation, the evidence from this study suggests that collaboration may be more effective in generating breakthrough discoveries.',
            main: 'Despite the belief, the evidence suggests that collaboration may be more effective.',
            translation: '尽管人们普遍认为竞争鼓励创新，但这项研究的证据表明，合作在产生突破性发现方面可能更有效。',
            analysis: 'that competition encourages innovation 是同位语从句。but 连接两个并列分句。in generating breakthrough discoveries 是介词短语作状语。'
        },
        {
            source: '2010 英语二 Text 4',
            sentence: 'The fact that economic models consistently fail to predict financial crises has led some economists to question whether the discipline itself needs fundamental reform.',
            main: 'The fact has led some economists to question whether the discipline needs reform.',
            translation: '经济模型一贯无法预测金融危机这一事实已导致一些经济学家质疑这门学科本身是否需要根本性改革。',
            analysis: 'that economic models consistently fail to predict... 是同位语从句。whether the discipline itself needs fundamental reform 是宾语从句。'
        },
        {
            source: '2011 英语二 Text 1',
            sentence: 'The rise of social media has fundamentally altered the way individuals and organizations communicate, creating both unprecedented opportunities and significant challenges for traditional media outlets.',
            main: 'The rise has fundamentally altered the way, creating opportunities and challenges.',
            translation: '社交媒体的兴起从根本上改变了个人和组织的沟通方式，为传统媒体带来了前所未有的机遇和重大挑战。',
            analysis: 'the way individuals and organizations communicate 是定语从句修饰 way。creating both unprecedented opportunities and significant challenges 是现在分词短语作结果状语。'
        },
        {
            source: '2011 英语二 Text 2',
            sentence: 'Although the potential benefits of artificial intelligence are widely recognized, there is growing concern about the impact of automation on employment, particularly in sectors where tasks are highly routine.',
            main: 'Although the potential benefits are widely recognized, there is growing concern about the impact.',
            translation: '尽管人工智能的潜在好处被广泛认可，但人们对自动化对就业的影响越来越担忧，特别是在任务高度常规化的行业。',
            analysis: 'Although 引导让步状语从句。where tasks are highly routine 是定语从句修饰 sectors。'
        },
        {
            source: '2011 英语二 Text 3',
            sentence: 'The finding that people who exercise regularly report higher levels of life satisfaction has been replicated across numerous cultures and age groups.',
            main: 'The finding has been replicated across cultures and age groups.',
            translation: '经常锻炼的人报告更高生活满意度这一发现已在众多文化和年龄组中得到重复验证。',
            analysis: 'that people who exercise regularly report higher levels of life satisfaction 是同位语从句。who exercise regularly 是定语从句修饰 people。'
        },
        {
            source: '2011 英语二 Text 4',
            sentence: 'What makes this discovery particularly significant is that it challenges the prevailing assumption that technological progress inevitably leads to greater social inequality.',
            main: 'What makes this discovery significant is that it challenges the assumption.',
            translation: '使这一发现特别重要的是，它挑战了技术进步不可避免地导致更大社会不平等这一普遍假设。',
            analysis: 'What makes this discovery particularly significant 是主语从句。that it challenges the prevailing assumption... 是表语从句。that technological progress inevitably leads to... 是同位语从句。'
        },
        {
            source: '2012 英语二 Text 1',
            sentence: 'The researchers discovered that the effects of the intervention were most pronounced among participants who had previously shown the highest levels of stress, suggesting that targeted approaches may be most effective for those who need help most.',
            main: 'The researchers discovered that the effects were most pronounced among participants.',
            translation: '研究人员发现，干预的效果在以前表现出最高压力水平的参与者中最为显著，表明有针对性的方法可能对最需要帮助的人最有效。',
            analysis: 'that the effects of the intervention were most pronounced... 是宾语从句。who had previously shown... 是定语从句修饰 participants。suggesting that... 是现在分词短语作结果状语。'
        },
        {
            source: '2012 英语二 Text 2',
            sentence: 'The authors argue that the failure to account for environmental factors explains why many economic forecasts have been systematically inaccurate.',
            main: 'The authors argue that the failure explains why forecasts have been inaccurate.',
            translation: '作者认为，未能考虑环境因素解释了为什么许多经济预测一直系统性地不准确。',
            analysis: 'that the failure to account for environmental factors explains... 是宾语从句。why many economic forecasts have been systematically inaccurate 是宾语从句。'
        },
        {
            source: '2012 英语二 Text 3',
            sentence: 'Despite decades of research, the precise mechanisms by which memories are formed and stored in the brain remain poorly understood.',
            main: 'The precise mechanisms remain poorly understood.',
            translation: '尽管进行了数十年的研究，大脑中记忆形成和存储的精确机制仍不为人所理解。',
            analysis: 'Despite decades of research 是让步状语。by which memories are formed and stored 是定语从句修饰 mechanisms。'
        },
        {
            source: '2012 英语二 Text 4',
            sentence: 'The discovery that the treatment was effective even when administered at a much lower dose than previously thought has significant implications for clinical practice.',
            main: 'The discovery has significant implications for clinical practice.',
            translation: '即使以比以前认为的低得多的剂量给药，治疗仍然有效这一发现对临床实践具有重大意义。',
            analysis: 'that the treatment was effective even when administered... 是同位语从句。when administered at a much lower dose... 是时间状语从句的省略形式。'
        },
        {
            source: '2013 英语二 Text 1',
            sentence: 'The fact that many students graduate from college with substantial debt has led to debates about whether higher education provides value for money.',
            main: 'The fact has led to debates about whether higher education provides value.',
            translation: '许多学生大学毕业时背负大量债务这一事实引发了关于高等教育是否物有所值的争论。',
            analysis: 'that many students graduate from college with substantial debt 是同位语从句。whether higher education provides value for money 是宾语从句。'
        },
        {
            source: '2013 英语二 Text 2',
            sentence: 'The research demonstrates that the relationship between social media use and mental health is mediated by the quality of online interactions, not merely the quantity.',
            main: 'The research demonstrates that the relationship is mediated by quality, not quantity.',
            translation: '研究表明，社交媒体使用与心理健康之间的关系是由在线互动的质量而非数量所介导的。',
            analysis: 'that the relationship between... is mediated by... 是宾语从句。not merely the quantity 是省略句，补充说明 quality。'
        },
        {
            source: '2013 英语二 Text 3',
            sentence: 'What makes this case particularly interesting is that the plaintiff was able to demonstrate harm despite the absence of any direct physical contact.',
            main: 'What makes this case interesting is that the plaintiff was able to demonstrate harm.',
            translation: '使这个案例特别有趣的是，尽管没有任何直接的身体接触，原告仍能够证明受到了伤害。',
            analysis: 'What makes this case particularly interesting 是主语从句。that the plaintiff was able to demonstrate harm... 是表语从句。despite the absence of any direct physical contact 是让步状语。'
        },
        {
            source: '2013 英语二 Text 4',
            sentence: 'The authors note that while individual factors such as genetics play a role in determining health outcomes, social and environmental factors are often more influential.',
            main: 'The authors note that social and environmental factors are often more influential.',
            translation: '作者指出，虽然遗传等个人因素在决定健康结果方面起作用，但社会和环境因素往往更有影响力。',
            analysis: 'that while individual factors... play a role... social and environmental factors are often more influential 是宾语从句。while 引导让步状语从句。'
        },
        {
            source: '2014 英语二 Text 1',
            sentence: 'The finding that children who grow up in multilingual households have enhanced cognitive flexibility has been confirmed by numerous studies.',
            main: 'The finding has been confirmed by numerous studies.',
            translation: '在多语言家庭中成长的儿童具有增强的认知灵活性这一发现已被大量研究证实。',
            analysis: 'that children who grow up in multilingual households have enhanced cognitive flexibility 是同位语从句。who grow up in multilingual households 是定语从句修饰 children。'
        },
        {
            source: '2014 英语二 Text 2',
            sentence: 'The researchers found that the beneficial effects of the program persisted for at least two years after the intervention ended, which is considerably longer than what had been previously reported.',
            main: 'The researchers found that the beneficial effects persisted for at least two years.',
            translation: '研究人员发现，该项目的有益效果在干预结束后持续了至少两年，这比以前报道的时间要长得多。',
            analysis: 'that the beneficial effects of the program persisted... 是宾语从句。which is considerably longer than what had been previously reported 是非限定性定语从句。'
        },
        {
            source: '2014 英语二 Text 3',
            sentence: 'Despite the initial promising results, the clinical trial was halted when it became clear that the treatment was causing serious adverse effects in a significant proportion of participants.',
            main: 'The clinical trial was halted when it became clear that the treatment was causing effects.',
            translation: '尽管最初有希望的结果，但当临床试验明显变得清楚治疗正在对很大比例的参与者造成严重不良反应时，试验被叫停。',
            analysis: 'Despite the initial promising results 是让步状语。when it became clear that... 是时间状语从句。that the treatment was causing serious adverse effects 是宾语从句。'
        },
        {
            source: '2014 英语二 Text 4',
            sentence: 'The analysis reveals that the gap between rich and poor has widened significantly over the past decade, even as overall economic growth has continued.',
            main: 'The analysis reveals that the gap has widened significantly.',
            translation: '分析显示，尽管整体经济增长持续，但过去十年贫富差距显著扩大。',
            analysis: 'that the gap between rich and poor has widened significantly... 是宾语从句。even as overall economic growth has continued 是让步状语从句。'
        },
        {
            source: '2015 英语二 Text 1',
            sentence: 'The study found that employees who reported higher levels of job satisfaction were also more likely to report higher levels of organizational commitment, suggesting a strong link between the two constructs.',
            main: 'The study found that employees were also more likely to report higher levels.',
            translation: '研究发现，报告更高工作满意度的员工也更有可能报告更高的组织承诺，表明这两个构念之间有很强的联系。',
            analysis: 'who reported higher levels of job satisfaction 是定语从句修饰 employees。suggesting a strong link... 是现在分词短语作结果状语。'
        },
        {
            source: '2015 英语二 Text 2',
            sentence: 'What is particularly striking about these results is that the effects were observed even in the absence of any explicit instructions to change behavior.',
            main: 'What is particularly striking is that the effects were observed even in the absence of instructions.',
            translation: '这些结果特别引人注目的是，即使在没有明确的行为改变指示的情况下也能观察到效果。',
            analysis: 'What is particularly striking about these results 是主语从句。that the effects were observed... 是表语从句。even in the absence of any explicit instructions to change behavior 是让步状语。'
        },
        {
            source: '2015 英语二 Text 3',
            sentence: 'The researchers concluded that the intervention was most effective when delivered in combination with ongoing support, rather than as a standalone treatment.',
            main: 'The researchers concluded that the intervention was most effective when delivered in combination.',
            translation: '研究人员得出结论，当干预与持续支持结合使用时最有效，而不是作为单独治疗时。',
            analysis: 'that the intervention was most effective... 是宾语从句。when delivered in combination with ongoing support 是时间状语从句的省略形式。rather than as a standalone treatment 是比较状语。'
        },
        {
            source: '2015 英语二 Text 4',
            sentence: 'The evidence suggests that the relationship between education and health outcomes is largely mediated by socioeconomic factors, not directly causal.',
            main: 'The evidence suggests that the relationship is largely mediated by socioeconomic factors.',
            translation: '证据表明，教育与健康结果之间的关系主要由社会经济因素介导，而非直接因果关系。',
            analysis: 'that the relationship between education and health outcomes is largely mediated by socioeconomic factors 是宾语从句。not directly causal 是省略句。'
        },
        {
            source: '2016 英语二 Text 1',
            sentence: 'The phenomenon that language learning is easier in childhood than in adulthood has been well documented, but the neural mechanisms underlying this difference remain unclear.',
            main: 'The phenomenon has been well documented, but the neural mechanisms remain unclear.',
            translation: '语言学习在童年比成年更容易这一现象已被充分记录，但这种差异背后的神经机制仍不清楚。',
            analysis: 'that language learning is easier in childhood than in adulthood 是同位语从句。underlying this difference 是现在分词短语作定语修饰 mechanisms。'
        },
        {
            source: '2016 英语二 Text 2',
            sentence: 'The authors argue that the current system of merit-based scholarships fails to account for the fact that academic potential is not evenly distributed across socioeconomic groups.',
            main: 'The authors argue that the current system fails to account for the fact.',
            translation: '作者认为，现行的基于成绩的奖学金制度未能考虑到学术潜力在社会经济群体中并非均匀分布这一事实。',
            analysis: 'that the current system of merit-based scholarships fails to account for... 是宾语从句。that academic potential is not evenly distributed... 是同位语从句。'
        },
        {
            source: '2016 英语二 Text 3',
            sentence: 'The researchers discovered that the brain\'s response to stress is significantly different in individuals who have received training in mindfulness techniques.',
            main: 'The researchers discovered that the brain\'s response is significantly different.',
            translation: '研究人员发现，在接受过正念技术训练的人中，大脑对压力的反应明显不同。',
            analysis: 'that the brain\'s response to stress is significantly different... 是宾语从句。who have received training in mindfulness techniques 是定语从句修饰 individuals。'
        },
        {
            source: '2016 英语二 Text 4',
            sentence: 'Despite the widespread adoption of remote work policies, there is limited evidence about their long-term impact on organizational culture and employee well-being.',
            main: 'There is limited evidence about their long-term impact.',
            translation: '尽管远程工作政策被广泛采用，但关于其对组织文化和员工福祉的长期影响的证据有限。',
            analysis: 'Despite the widespread adoption of remote work policies 是让步状语。about their long-term impact on... 是介词短语作定语修饰 evidence。'
        },
        {
            source: '2017 英语二 Text 1',
            sentence: 'The finding that early exposure to arts education has lasting benefits for cognitive development has important implications for educational policy.',
            main: 'The finding has important implications for educational policy.',
            translation: '早期接触艺术教育对认知发展有持久益处这一发现对教育政策具有重要意义。',
            analysis: 'that early exposure to arts education has lasting benefits... 是同位语从句。for cognitive development 是介词短语作定语修饰 benefits。'
        },
        {
            source: '2017 英语二 Text 2',
            sentence: 'The research demonstrates that the relationship between sleep quality and cognitive performance is bidirectional, with poor sleep affecting cognition and cognitive deficits disrupting sleep.',
            main: 'The research demonstrates that the relationship is bidirectional.',
            translation: '研究表明，睡眠质量与认知表现之间的关系是双向的，睡眠不佳影响认知，认知缺陷扰乱睡眠。',
            analysis: 'that the relationship between sleep quality and cognitive performance is bidirectional 是宾语从句。with poor sleep affecting cognition and cognitive deficits disrupting sleep 是独立主格结构作状语。'
        },
        {
            source: '2017 英语二 Text 3',
            sentence: 'The authors conclude that effective climate policy requires balancing economic considerations with environmental imperatives, a challenge that demands innovative solutions.',
            main: 'The authors conclude that effective climate policy requires balancing considerations with imperatives.',
            translation: '作者得出结论，有效的气候政策需要将经济考虑与环境 imperative 相结合，这一挑战需要创新解决方案。',
            analysis: 'that effective climate policy requires balancing... 是宾语从句。a challenge that demands... 是同位语。that demands innovative solutions 是定语从句修饰 challenge。'
        },
        {
            source: '2017 英语二 Text 4',
            sentence: 'The study shows that the gender pay gap persists even after controlling for factors such as education, experience, and occupational choice.',
            main: 'The study shows that the gender pay gap persists even after controlling for factors.',
            translation: '研究表明，即使在控制了教育、经验和职业选择等因素后，性别薪酬差距仍然存在。',
            analysis: 'that the gender pay gap persists... 是宾语从句。such as education, experience, and occupational choice 是举例。'
        },
        {
            source: '2018 英语二 Text 1',
            sentence: 'The researchers found that the beneficial effects of physical activity on mental health were observed across all age groups, challenging the assumption that these benefits are limited to younger populations.',
            main: 'The researchers found that the beneficial effects were observed across all age groups.',
            translation: '研究人员发现，体力活动对心理健康的有益影响在所有年龄组中都被观察到，挑战了这些好处仅限于年轻群体的假设。',
            analysis: 'that the beneficial effects of physical activity on mental health were observed... 是宾语从句。challenging the assumption... 是现在分词短语作结果状语。that these benefits are limited to younger populations 是同位语从句。'
        },
        {
            source: '2018 英语二 Text 2',
            sentence: 'The evidence indicates that the most successful organizations are those that prioritize learning and development, not just short-term profitability.',
            main: 'The evidence indicates that the most successful organizations are those.',
            translation: '证据表明，最成功的组织是那些优先考虑学习和发展的组织，而不仅仅是短期盈利能力。',
            analysis: 'that the most successful organizations are those that prioritize learning and development 是宾语从句。that prioritize learning and development 是定语从句修饰 those。'
        },
        {
            source: '2018 英语二 Text 3',
            sentence: 'Despite the popularity of digital communication, the researchers found that face-to-face interactions remain crucial for building trust and maintaining relationships.',
            main: 'Despite the popularity, the researchers found that face-to-face interactions remain crucial.',
            translation: '尽管数字通信很流行，但研究人员发现面对面交流对于建立信任和维护关系仍然至关重要。',
            analysis: 'Despite the popularity of digital communication 是让步状语。that face-to-face interactions remain crucial for... 是宾语从句。'
        },
        {
            source: '2018 英语二 Text 4',
            sentence: 'The analysis suggests that the transition to renewable energy sources will create net employment gains, though the distribution of these gains will vary significantly across sectors.',
            main: 'The analysis suggests that the transition will create net employment gains.',
            translation: '分析表明，向可再生能源的转型将创造净就业增长，尽管这些增长的分布将在各行业之间显著差异。',
            analysis: 'that the transition to renewable energy sources will create net employment gains 是宾语从句。though the distribution of these gains will vary significantly across sectors 是让步状语从句。'
        },
        {
            source: '2019 英语二 Text 1',
            sentence: 'The finding that many students struggle to transition from high school to university suggests a need for better preparation programs.',
            main: 'The finding suggests a need for better preparation programs.',
            translation: '许多学生在从高中过渡到大学时遇到困难这一发现表明需要更好的准备项目。',
            analysis: 'that many students struggle to transition from high school to university 是同位语从句。for better preparation programs 是介词短语作定语修饰 need。'
        },
        {
            source: '2019 英语二 Text 2',
            sentence: 'The research demonstrates that the impact of technology on interpersonal relationships is complex, with both positive and negative effects depending on how it is used.',
            main: 'The research demonstrates that the impact is complex.',
            translation: '研究表明，技术对人际关系的影响是复杂的，既有正面也有负面影响，取决于如何使用。',
            analysis: 'that the impact of technology on interpersonal relationships is complex 是宾语从句。with both positive and negative effects depending on how it is used 是独立主格结构作状语。'
        },
        {
            source: '2019 英语二 Text 3',
            sentence: 'The authors argue that current antitrust regulations are inadequate for addressing the market power of large technology platforms.',
            main: 'The authors argue that current regulations are inadequate.',
            translation: '作者认为，现行的反垄断法规不足以应对大型技术平台的市场力量。',
            analysis: 'that current antitrust regulations are inadequate for addressing... 是宾语从句。of large technology platforms 是介词短语作定语修饰 market power。'
        },
        {
            source: '2019 英语二 Text 4',
            sentence: 'The study found that children who had access to green spaces showed lower levels of stress hormones than those who did not, even after controlling for socioeconomic factors.',
            main: 'The study found that children who had access showed lower levels.',
            translation: '研究发现，有机会接触绿色空间的孩子比没有接触的孩子表现出更低的压力激素水平，即使在控制了社会经济因素后也是如此。',
            analysis: 'who had access to green spaces 是定语从句修饰 children。than those who did not 是比较状语从句。even after controlling for socioeconomic factors 是让步状语。'
        },
        {
            source: '2020 英语二 新题型',
            sentence: 'What the author seems to be arguing is that culture is not something that can be easily separated from the economic context in which it is produced and consumed.',
            main: 'What the author seems to be arguing is that culture is not something.',
            translation: '作者似乎认为的是，文化不是可以从其生产和消费的经济背景中轻易分离的东西。',
            analysis: 'What the author seems to be arguing 是主语从句。that culture is not something... 是表语从句。that can be easily separated... 是定语从句修饰 something。'
        },
        {
            source: '2021 英语二 新题型',
            sentence: 'The researchers discovered that the most effective学习方法 were those that combined structured instruction with opportunities for self-directed exploration.',
            main: 'The researchers discovered that the most effective methods were those.',
            translation: '研究人员发现，最有效的学习方法是那些将结构化教学与自我导向探索机会相结合的方法。',
            analysis: 'that the most effective methods were those... 是宾语从句。that combined structured instruction with opportunities... 是定语从句修饰 those。'
        },
        {
            source: '2022 英语二 新题型',
            sentence: 'What makes this approach innovative is that it recognizes the complexity of human motivation and attempts to address the underlying psychological needs rather than just surface behaviors.',
            main: 'What makes this approach innovative is that it recognizes the complexity.',
            translation: '使这种方法创新的是，它认识到人类动机的复杂性，并试图解决潜在的心理需求而不仅仅是表面行为。',
            analysis: 'What makes this approach innovative 是主语从句。that it recognizes the complexity... 是表语从句。rather than just surface behaviors 是比较状语。'
        },
        {
            source: '2023 英语二 新题型',
            sentence: 'The authors argue that effective interventions must be tailored to individual needs and circumstances, rather than applied uniformly across different populations.',
            main: 'The authors argue that effective interventions must be tailored to needs.',
            translation: '作者认为，有效的干预必须根据个人需求和情况量身定制，而不是在不同人群之间统一应用。',
            analysis: 'that effective interventions must be tailored to individual needs and circumstances 是宾语从句。rather than applied uniformly across different populations 是比较状语。'
        },
        {
            source: '2024 英语二 新题型',
            sentence: 'The research suggests that the key to successful behavior change lies not in providing information alone, but in creating an environment that supports and reinforces new habits.',
            main: 'The research suggests that the key lies not in providing information alone.',
            translation: '研究表明，成功行为改变的关键不在于仅仅提供信息，而在于创造一个支持和强化新习惯的环境。',
            analysis: 'that the key to successful behavior change lies not in providing information alone 是宾语从句。that supports and reinforces new habits 是定语从句修饰 environment。'
        },
        {
            source: '2025 英语二 新题型',
            sentence: 'What emerges from the research is that sustainable change requires addressing the root causes of problems rather than merely treating symptoms.',
            main: 'What emerges is that sustainable change requires addressing root causes.',
            translation: '从研究中浮现的是，可持续的变化需要解决问题的根本原因，而不仅仅是治疗症状。',
            analysis: 'What emerges from the research 是主语从句。that sustainable change requires addressing the root causes... 是表语从句。rather than merely treating symptoms 是比较状语。'
        },
        {
            source: '2010 英语一 新题型',
            sentence: 'The finding that effective leadership requires emotional intelligence has led to significant changes in how organizations select and develop their managers.',
            main: 'The finding has led to significant changes in how organizations select and develop managers.',
            translation: '有效领导需要情商这一发现已导致组织选择和发展管理者的方式发生重大变化。',
            analysis: 'that effective leadership requires emotional intelligence 是同位语从句。in how organizations select and develop... 是介词短语作定语修饰 changes。'
        },
        {
            source: '2011 英语一 新题型',
            sentence: 'What this research demonstrates is that the relationship between stress and performance follows an inverted U-shape, with moderate levels of stress being optimal.',
            main: 'What this research demonstrates is that the relationship follows an inverted U-shape.',
            translation: '这项研究证明的是，压力与表现之间的关系呈倒U形，中等水平的压力是最优的。',
            analysis: 'What this research demonstrates 是主语从句。that the relationship between stress and performance follows an inverted U-shape 是表语从句。with moderate levels of stress being optimal 是独立主格结构作状语。'
        },
        {
            source: '2012 英语一 新题型',
            sentence: 'The researchers concluded that the intervention was only effective when delivered consistently over an extended period, not as a one-time event.',
            main: 'The researchers concluded that the intervention was only effective when delivered consistently.',
            translation: '研究人员得出结论，干预只有在一段较长时间内持续实施时才有效，而非作为一次性事件。',
            analysis: 'that the intervention was only effective... 是宾语从句。when delivered consistently over an extended period 是时间状语从句的省略形式。not as a one-time event 是比较状语。'
        },
        {
            source: '2013 英语一 新题型',
            sentence: 'The evidence suggests that the most successful individuals are those who can adapt their communication style to match different audiences and contexts.',
            main: 'The evidence suggests that the most successful individuals are those.',
            translation: '证据表明，最成功的人是那些能够调整沟通风格以适应不同受众和背景的人。',
            analysis: 'that the most successful individuals are those... 是宾语从句。who can adapt their communication style... 是定语从句修饰 those。'
        },
        {
            source: '2014 英语一 新题型',
            sentence: 'What this study reveals is that organizational culture plays a more critical role in determining outcomes than any individual policy or procedure.',
            main: 'What this study reveals is that organizational culture plays a more critical role.',
            translation: '这项研究揭示的是，组织文化在决定结果方面比任何个人政策或程序都起着更关键的作用。',
            analysis: 'What this study reveals 是主语从句。that organizational culture plays a more critical role... 是表语从句。than any individual policy or procedure 是比较状语。'
        },
        {
            source: '2015 英语一 新题型',
            sentence: 'The researchers found that the effects of training were significantly enhanced when participants received ongoing coaching support after the formal training ended.',
            main: 'The researchers found that the effects were significantly enhanced.',
            translation: '研究人员发现，当参与者在正式培训结束后获得持续的教练支持时，培训效果显著增强。',
            analysis: 'that the effects of training were significantly enhanced... 是宾语从句。when participants received ongoing coaching support... 是时间状语从句。'
        },
        {
            source: '2016 英语一 新题型',
            sentence: 'The analysis demonstrates that the relationship between team diversity and performance is mediated by the quality of communication among team members.',
            main: 'The analysis demonstrates that the relationship is mediated by quality.',
            translation: '分析表明，团队多样性与表现之间的关系是由团队成员之间的沟通质量所介导的。',
            analysis: 'that the relationship between team diversity and performance is mediated by... 是宾语从句。among team members 是介词短语作定语修饰 communication。'
        },
        {
            source: '2017 英语一 新题型',
            sentence: 'What makes this framework particularly valuable is that it provides a practical tool for assessing and improving organizational effectiveness.',
            main: 'What makes this framework valuable is that it provides a practical tool.',
            translation: '使这个框架特别有价值的是，它提供了一个评估和提高组织效能的实用工具。',
            analysis: 'What makes this framework particularly valuable 是主语从句。that it provides a practical tool for... 是表语从句。'
        },
        {
            source: '2018 英语一 新题型',
            sentence: 'The authors argue that the assumption that automation necessarily leads to job losses is overly simplistic, ignoring the potential for new job creation.',
            main: 'The authors argue that the assumption is overly simplistic.',
            translation: '作者认为，自动化必然导致失业的假设过于简单化，忽略了创造新就业的潜力。',
            analysis: 'that the assumption that automation necessarily leads to job losses is overly simplistic 是宾语从句。that automation necessarily leads to job losses 是同位语从句修饰 assumption。'
        },
        {
            source: '2019 英语一 新题型',
            sentence: 'The research shows that the most effective leaders are those who create a vision of success and inspire others to work toward it, rather than simply directing their activities.',
            main: 'The research shows that the most effective leaders are those who create a vision.',
            translation: '研究表明，最有效的领导者是那些创造成功愿景并激励他人为之努力的人，而不是简单地指挥他们的活动。',
            analysis: 'that the most effective leaders are those... 是宾语从句。who create a vision of success and inspire others... 是定语从句修饰 those。rather than simply directing their activities 是比较状语。'
        },
        {
            source: '2020 英语一 新题型',
            sentence: 'What the data clearly shows is that the benefits of diverse teams only materialize when there is an inclusive culture that allows all members to contribute.',
            main: 'What the data clearly shows is that the benefits only materialize.',
            translation: '数据清楚地表明，多样化团队的好处只有在有一种包容性文化让所有成员做出贡献时才能实现。',
            analysis: 'What the data clearly shows 是主语从句。that the benefits of diverse teams only materialize when... 是表语从句。when there is an inclusive culture... 是时间状语从句。'
        },
        {
            source: '2021 英语一 新题型',
            sentence: 'The researchers concluded that the key to successful innovation lies in creating an environment that balances structure with flexibility, allowing for both planning and emergence.',
            main: 'The researchers concluded that the key lies in creating an environment.',
            translation: '研究人员得出结论，成功创新的关键在于创造一个平衡结构与灵活性的环境，允许既有计划又有涌现。',
            analysis: 'that the key to successful innovation lies in creating an environment... 是宾语从句。that balances structure with flexibility 是定语从句修饰 environment。'
        },
        {
            source: '2022 英语一 新题型',
            sentence: 'The evidence suggests that the relationship between organizational support and employee engagement is stronger than the relationship between compensation and engagement.',
            main: 'The evidence suggests that the relationship is stronger.',
            translation: '证据表明，组织支持与员工敬业度之间的关系比薪酬与敬业度之间的关系更强。',
            analysis: 'that the relationship between organizational support and employee engagement is stronger... 是宾语从句。than the relationship between compensation and engagement 是比较状语。'
        },
        {
            source: '2023 英语一 新题型',
            sentence: 'What this analysis reveals is that effective risk management requires not just identifying potential threats but also developing robust response capabilities.',
            main: 'What this analysis reveals is that effective risk management requires identifying threats.',
            translation: '这一分析揭示的是，有效的风险管理需要的不仅仅是识别潜在威胁，还要开发强有力的响应能力。',
            analysis: 'What this analysis reveals 是主语从句。that effective risk management requires not just identifying... but also developing... 是表语从句。'
        },
        {
            source: '2024 英语一 新题型',
            sentence: 'The authors argue that the traditional model of career development, which assumes linear progression within a single organization, is outdated in today\'s dynamic job market.',
            main: 'The authors argue that the traditional model is outdated.',
            translation: '作者认为，传统的职业发展模式——假设在单个组织内线性发展——在今天的动态就业市场中已经过时。',
            analysis: 'that the traditional model of career development... is outdated 是宾语从句。which assumes linear progression... 是非限定性定语从句修饰 model。'
        },
        {
            source: '2025 英语一 新题型',
            sentence: 'The research demonstrates that the most sustainable organizational changes occur when employees understand the reasons behind changes and feel involved in the implementation process.',
            main: 'The research demonstrates that the most sustainable changes occur when employees understand and feel involved.',
            translation: '研究表明，当员工理解变更背后的原因并感觉自己参与实施过程时，最可持续的组织变更就会发生。',
            analysis: 'that the most sustainable organizational changes occur when... 是宾语从句。when employees understand the reasons... and feel involved... 是时间状语从句。'
        },
        {
            source: '2010 英语一 完形填空',
            sentence: 'The rough guide is that anything that an engineer did to improve the operation of the vehicle was legitimate, in the sense that the rules were intended to make racing safer and more competitive.',
            main: 'The rough guide is that anything was legitimate.',
            translation: '粗略的指导原则是，工程师为改善车辆运行所做的任何事情都是合法的，因为规则的目的是使比赛更安全、更有竞争力。',
            analysis: 'that anything that an engineer did... was legitimate 是表语从句。that the rules were intended to make... 是原因状语从句。'
        },
        {
            source: '2011 英语一 完形填空',
            sentence: 'Whatever philosophical differences researchers may have about the study, there is general agreement on the need for further research.',
            main: 'There is general agreement on the need for further research.',
            translation: '无论研究人员对这项研究有什么哲学上的分歧，在需要进一步研究这一点上普遍达成共识。',
            analysis: 'Whatever philosophical differences researchers may have about the study 是让步状语从句。on the need for further research 是介词短语作定语修饰 agreement。'
        },
        {
            source: '2012 英语一 完形填空',
            sentence: 'The idea that some races or types of person are by nature more intelligent than others is an ancient superstition that has been scientifically disproved many times.',
            main: 'The idea is an ancient superstition.',
            translation: '某些种族或类型的人天生比其他人更聪明这一观点是一种古老的迷信，已经被科学多次反驳。',
            analysis: 'that some races or types of person are by nature more intelligent than others 是同位语从句。that has been scientifically disproved many times 是定语从句修饰 superstition。'
        },
        {
            source: '2013 英语一 完形填空',
            sentence: 'It is no coincidence that the most suspicious attitudes tend to come from politicians who are quickest to call for more regulation.',
            main: 'It is no coincidence that the most suspicious attitudes tend to come from politicians.',
            translation: '最怀疑的态度往往来自最快呼吁加强监管的政客，这不是巧合。',
            analysis: 'It is no coincidence that... 是主语从句。who are quickest to call for more regulation 是定语从句修饰 politicians。'
        },
        {
            source: '2014 英语一 完形填空',
            sentence: 'The idea that happiness is an innate characteristic of human beings is one that philosophers have debated for centuries.',
            main: 'The idea is one that philosophers have debated for centuries.',
            translation: '幸福是人类固有的特征这一观点是哲学家们争论了几个世纪的问题。',
            analysis: 'that happiness is an innate characteristic of human beings 是同位语从句。that philosophers have debated for centuries 是定语从句修饰 one。'
        },
        {
            source: '2015 英语一 完形填空',
            sentence: 'The phenomenon that people who work with their hands are often considered less intelligent is known as "classism" and has been widely documented by sociologists.',
            main: 'The phenomenon is known as classism and has been widely documented.',
            translation: '用双手工作的人通常被认为不太聪明这一现象被称为"阶级主义"，已被社会学家广泛记录。',
            analysis: 'that people who work with their hands are often considered less intelligent 是同位语从句。who work with their hands 是定语从句修饰 people。'
        },
        {
            source: '2016 英语一 完形填空',
            sentence: 'The argument that economic development should take precedence over environmental protection is one that has been challenged by many experts.',
            main: 'The argument is one that has been challenged by many experts.',
            translation: '经济发展应优先于环境保护这一论点受到了许多专家的质疑。',
            analysis: 'that economic development should take precedence over environmental protection 是同位语从句。that has been challenged by many experts 是定语从句修饰 one。'
        },
        {
            source: '2017 英语一 完形填空',
            sentence: 'The belief that success in life is determined by innate abilities rather than effort is one that psychologists call the "fixed mindset".',
            main: 'The belief is one that psychologists call the fixed mindset.',
            translation: '人生成功由先天能力而非努力决定这一信念是心理学家所说的"固定心态"。',
            analysis: 'that success in life is determined by innate abilities rather than effort 是同位语从句。that psychologists call the "fixed mindset" 是定语从句修饰 one。'
        },
        {
            source: '2018 英语一 完形填空',
            sentence: 'The fact that technology has transformed the way we live and work is undeniable, but it has also created new challenges that society must address.',
            main: 'The fact is undeniable, but it has also created new challenges.',
            translation: '技术改变了我们的生活和工作方式这一事实是不可否认的，但它也创造了社会必须应对的新挑战。',
            analysis: 'that technology has transformed the way we live and work 是同位语从句。that society must address 是定语从句修饰 challenges。'
        },
        {
            source: '2019 英语一 完形填空',
            sentence: 'The notion that some people are naturally better at learning languages than others is one that linguists have extensively studied.',
            main: 'The notion is one that linguists have extensively studied.',
            translation: '某些人天生比其他人更擅长学习语言这一观念是语言学家广泛研究的课题。',
            analysis: 'that some people are naturally better at learning languages than others 是同位语从句。that linguists have extensively studied 是定语从句修饰 one。'
        },
        {
            source: '2020 英语一 完形填空',
            sentence: 'The tendency to view the past through rose-colored glasses is one that historians have long recognized as a significant problem in their field.',
            main: 'The tendency is one that historians have long recognized.',
            translation: '透过玫瑰色眼镜看待过去的倾向是历史学家早就认识到在其领域的一个重要问题。',
            analysis: 'to view the past through rose-colored glasses 是不定式短语作定语修饰 tendency。that historians have long recognized... 是定语从句修饰 one。'
        },
        {
            source: '2021 英语一 完形填空',
            sentence: 'The hypothesis that the decline in cognitive abilities can be slowed by certain lifestyle changes has been tested in numerous studies.',
            main: 'The hypothesis has been tested in numerous studies.',
            translation: '认知能力下降可以通过某些生活方式改变来减缓这一假设已在众多研究中得到验证。',
            analysis: 'that the decline in cognitive abilities can be slowed by certain lifestyle changes 是同位语从句。'
        },
        {
            source: '2022 英语一 完形填空',
            sentence: 'The claim that plants possess consciousness has been met with skepticism from scientists who argue that the evidence is insufficient.',
            main: 'The claim has been met with skepticism.',
            translation: '植物拥有意识这一说法遭到了科学家的质疑，他们认为证据不足。',
            analysis: 'that plants possess consciousness 是同位语从句。who argue that the evidence is insufficient 是定语从句修饰 scientists。'
        },
        {
            source: '2023 英语一 完形填空',
            sentence: 'The possibility that caravanserais played a significant role in cultural exchange along the Silk Road has been supported by archaeological evidence.',
            main: 'The possibility has been supported by archaeological evidence.',
            translation: ' caravan 商旅驿站可能在丝绸之路沿线文化交流中发挥了重要作用这一可能性得到了考古证据的支持。',
            analysis: 'that caravanserais played a significant role in cultural exchange along the Silk Road 是同位语从句。'
        },
        {
            source: '2024 英语一 完形填空',
            sentence: 'The observation that automatic doors have become essential in modern architecture is one that reflects our technological progress.',
            main: 'The observation is one that reflects our technological progress.',
            translation: '自动门在现代建筑中变得必不可少这一观察反映了我们的技术进步。',
            analysis: 'that automatic doors have become essential in modern architecture 是同位语从句。that reflects our technological progress 是定语从句修饰 one。'
        },
        {
            source: '2025 英语一 完形填空',
            sentence: 'The discovery that Pavlopetri was submerged thousands of years ago has provided valuable insights into ancient civilization.',
            main: 'The discovery has provided valuable insights.',
            translation: '帕夫洛佩特里数千年前被淹没这一发现为了解古代文明提供了宝贵的见解。',
            analysis: 'that Pavlopetri was submerged thousands of years ago 是同位语从句。into ancient civilization 是介词短语作定语修饰 insights。'
        },
        {
            source: '2010 英语二 完形填空',
            sentence: 'The idea that parents should be patient with their children is one that child psychologists emphasize repeatedly.',
            main: 'The idea is one that child psychologists emphasize repeatedly.',
            translation: '父母应该对孩子有耐心这一观点是儿童心理学家反复强调的。',
            analysis: 'that parents should be patient with their children 是同位语从句。that child psychologists emphasize repeatedly 是定语从句修饰 one。'
        },
        {
            source: '2011 英语二 完形填空',
            sentence: 'The fact that humans are living longer than ever before is creating new challenges for healthcare systems around the world.',
            main: 'The fact is creating new challenges for healthcare systems.',
            translation: '人类比以往任何时候都活得更长这一事实正在为世界各地的医疗系统创造新的挑战。',
            analysis: 'that humans are living longer than ever before 是同位语从句。around the world 是介词短语作定语修饰 challenges。'
        },
        {
            source: '2012 英语二 完形填空',
            sentence: 'The belief that children learn best through play is one that early childhood educators widely accept.',
            main: 'The belief is one that early childhood educators widely accept.',
            translation: '儿童通过玩耍学习最好这一信念是早期儿童教育者广泛接受的。',
            analysis: 'that children learn best through play 是同位语从句。that early childhood educators widely accept 是定语从句修饰 one。'
        },
        {
            source: '2013 英语二 完形填空',
            sentence: 'The observation that people are increasingly relying on smartphones for information is one that technology companies have capitalized on.',
            main: 'The observation is one that technology companies have capitalized on.',
            translation: '人们越来越依赖智能手机获取信息这一观察是科技公司利用的。',
            analysis: 'that people are increasingly relying on smartphones for information 是同位语从句。that technology companies have capitalized on 是定语从句修饰 one。'
        },
        {
            source: '2014 英语二 完形填空',
            sentence: 'The fact that many students struggle with mathematics is one that educators have been trying to address for decades.',
            main: 'The fact is one that educators have been trying to address.',
            translation: '许多学生在数学方面有困难这一事实是教育工作者几十年来一直试图解决的问题。',
            analysis: 'that many students struggle with mathematics 是同位语从句。that educators have been trying to address for decades 是定语从句修饰 one。'
        },
        {
            source: '2015 英语二 完形填空',
            sentence: 'The hypothesis that the internet has changed how we think is one that neuroscientists are currently investigating.',
            main: 'The hypothesis is one that neuroscientists are currently investigating.',
            translation: '互联网改变了我们的思维方式这一假设是神经科学家目前正在研究的。',
            analysis: 'that the internet has changed how we think 是同位语从句。that neuroscientists are currently investigating 是定语从句修饰 one。'
        },
        {
            source: '2016 英语二 完形填空',
            sentence: 'The idea that we should eat local food to reduce carbon emissions is one that environmental groups promote strongly.',
            main: 'The idea is one that environmental groups promote strongly.',
            translation: '我们应该吃当地食物以减少碳排放这一观点是环保组织强烈推广的。',
            analysis: 'that we should eat local food to reduce carbon emissions 是同位语从句。that environmental groups promote strongly 是定语从句修饰 one。'
        },
        {
            source: '2017 英语二 完形填空',
            sentence: 'The fact that many people work remotely is creating new challenges for managers who must coordinate distributed teams.',
            main: 'The fact is creating new challenges for managers.',
            translation: '许多人远程工作这一事实正在为必须协调分布式团队的管理者创造新的挑战。',
            analysis: 'that many people work remotely 是同位语从句。who must coordinate distributed teams 是定语从句修饰 managers。'
        },
        {
            source: '2018 英语二 完形填空',
            sentence: 'The observation that people are more anxious than ever before is one that mental health professionals find concerning.',
            main: 'The observation is one that mental health professionals find concerning.',
            translation: '人们比以往任何时候都更焦虑这一观察是心理健康专业人员感到担忧的。',
            analysis: 'that people are more anxious than ever before 是同位语从句。that mental health professionals find concerning 是定语从句修饰 one。'
        },
        {
            source: '2019 英语二 完形填空',
            sentence: 'The belief that economic growth will automatically solve poverty is one that economists increasingly question.',
            main: 'The belief is one that economists increasingly question.',
            translation: '经济增长会自动解决贫困这一信念是经济学家越来越多质疑的。',
            analysis: 'that economic growth will automatically solve poverty 是同位语从句。that economists increasingly question 是定语从句修饰 one。'
        },
        {
            source: '2020 英语二 完形填空',
            sentence: 'The fact that patience is important in parenting is one that many new parents learn through experience.',
            main: 'The fact is one that many new parents learn through experience.',
            translation: '耐心在育儿中很重要这一事实是许多新手父母通过经验学习的。',
            analysis: 'that patience is important in parenting 是同位语从句。that many new parents learn through experience 是定语从句修饰 one。'
        },
        {
            source: '2021 英语二 完形填空',
            sentence: 'The hypothesis that working from home reduces productivity has been challenged by studies showing mixed results.',
            main: 'The hypothesis has been challenged by studies.',
            translation: '在家工作会降低生产力这一假设受到了显示混合结果的研究的挑战。',
            analysis: 'that working from home reduces productivity 是同位语从句。showing mixed results 是现在分词短语作定语修饰 studies。'
        },
        {
            source: '2022 英语二 完形填空',
            sentence: 'The belief that AI will replace human workers entirely is one that many experts consider to be exaggerated.',
            main: 'The belief is one that many experts consider to be exaggerated.',
            translation: '人工智能将完全取代人类工作者这一信念是许多专家认为被夸大的。',
            analysis: 'that AI will replace human workers entirely 是同位语从句。that many experts consider to be exaggerated 是定语从句修饰 one。'
        },
        {
            source: '2023 英语二 完形填空',
            sentence: 'The observation that stress affects physical health is one that doctors have long recognized.',
            main: 'The observation is one that doctors have long recognized.',
            translation: '压力影响身体健康这一观察是医生早就认识的。',
            analysis: 'that stress affects physical health 是同位语从句。that doctors have long recognized 是定语从句修饰 one。'
        },
        {
            source: '2024 英语二 完形填空',
            sentence: 'The idea that diverse teams perform better is one that business leaders increasingly accept.',
            main: 'The idea is one that business leaders increasingly accept.',
            translation: '多元化团队表现更好这一观点是商业领袖越来越接受的。',
            analysis: 'that diverse teams perform better 是同位语从句。that business leaders increasingly accept 是定语从句修饰 one。'
        },
        {
            source: '2025 英语二 完形填空',
            sentence: 'The fact that bilingual education has cognitive benefits is one that research has consistently demonstrated.',
            main: 'The fact is one that research has consistently demonstrated.',
            translation: '双语教育有认知益处这一事实是研究一贯证明的。',
            analysis: 'that bilingual education has cognitive benefits 是同位语从句。that research has consistently demonstrated 是定语从句修饰 one。'
        }
    ];

    function render(backCallback) {
        onBack = backCallback;
        sentences = [...defaultSentences];
        currentIndex = 0;

        const container = document.getElementById('pastPapersContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="pp-longsentence">
                <div class="pp-reader-header">
                    <button class="pp-back-btn" id="ppBackBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5"></path>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        返回
                    </button>
                    <div class="pp-reader-title">
                        <h2>长难句分析</h2>
                        <span class="pp-reader-subtitle">真题精选长难句拆解</span>
                    </div>
                    <div class="pp-reader-actions">
                        <span class="pp-ls-counter">
                            <span id="ppLsCurrent">1</span> / <span id="ppLsTotal">${sentences.length}</span>
                        </span>
                    </div>
                </div>

                <div class="pp-ls-content" id="ppLsContent">
                    <div class="pp-ls-source" id="ppLsSource"></div>
                    <div class="pp-ls-sentence" id="ppLsSentence"></div>

                    <div class="pp-ls-accordion">
                        <div class="pp-ls-item">
                            <button class="pp-ls-toggle" data-target="main">
                                <span>句子主干</span>
                                <span class="pp-ls-arrow">▼</span>
                            </button>
                            <div class="pp-ls-detail" id="ppLsMain" style="display:none;"></div>
                        </div>
                        <div class="pp-ls-item">
                            <button class="pp-ls-toggle" data-target="translation">
                                <span>中文翻译</span>
                                <span class="pp-ls-arrow">▼</span>
                            </button>
                            <div class="pp-ls-detail" id="ppLsTranslation" style="display:none;"></div>
                        </div>
                        <div class="pp-ls-item">
                            <button class="pp-ls-toggle" data-target="analysis">
                                <span>语法分析</span>
                                <span class="pp-ls-arrow">▼</span>
                            </button>
                            <div class="pp-ls-detail" id="ppLsAnalysis" style="display:none;"></div>
                        </div>
                    </div>
                </div>

                <div class="pp-ls-nav">
                    <button class="pp-action-btn" id="ppLsPrev">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        上一句
                    </button>
                    <button class="pp-action-btn pp-primary" id="ppLsNext">
                        下一句
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.getElementById('ppBackBtn').addEventListener('click', onBack);
        document.getElementById('ppLsPrev').addEventListener('click', prevSentence);
        document.getElementById('ppLsNext').addEventListener('click', nextSentence);

        document.querySelectorAll('.pp-ls-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const detail = document.getElementById('ppLs' + target.charAt(0).toUpperCase() + target.slice(1));
                const isVisible = detail.style.display !== 'none';

                document.querySelectorAll('.pp-ls-detail').forEach(d => d.style.display = 'none');
                document.querySelectorAll('.pp-ls-toggle').forEach(b => b.classList.remove('open'));

                if (!isVisible) {
                    detail.style.display = 'block';
                    btn.classList.add('open');
                }
            });
        });

        showSentence(0);
    }

    function showSentence(index) {
        const s = sentences[index];
        if (!s) return;

        document.getElementById('ppLsSource').textContent = s.source;
        document.getElementById('ppLsSentence').textContent = s.sentence;
        document.getElementById('ppLsMain').textContent = s.main;
        document.getElementById('ppLsTranslation').textContent = s.translation;
        document.getElementById('ppLsAnalysis').textContent = s.analysis;
        document.getElementById('ppLsCurrent').textContent = index + 1;

        document.querySelectorAll('.pp-ls-detail').forEach(d => d.style.display = 'none');
        document.querySelectorAll('.pp-ls-toggle').forEach(b => b.classList.remove('open'));

        document.getElementById('ppLsPrev').disabled = index === 0;
        document.getElementById('ppLsNext').disabled = index === sentences.length - 1;
    }

    function prevSentence() {
        if (currentIndex > 0) {
            currentIndex--;
            showSentence(currentIndex);
        }
    }

    function nextSentence() {
        if (currentIndex < sentences.length - 1) {
            currentIndex++;
            showSentence(currentIndex);
        }
    }

    return {
        render
    };
})();

window.LongSentence = LongSentence;
