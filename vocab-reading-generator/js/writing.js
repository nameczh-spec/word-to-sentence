/**
 * 作文模块
 * 功能：查看作文题目 + 参考范文 + 写作技巧 + AI批改
 */
const Writing = (() => {
    let currentPaper = null;
    let currentPartA = null;
    let currentPartB = null;
    let userAnswerA = '';
    let userAnswerB = '';
    let onBack = null;

    // 范文数据库（按年份和类型存储）
    const sampleData = {
        '2025-2': {
            partA: {
                title: '回复朋友关于改编中国古典小说短剧的邮件',
                translation: '假设你正在策划一部基于中国古典小说的短剧。请给你的朋友John写一封邮件，介绍这部短剧并邀请他参加演出。',
                samples: [
                    {
                        text: `Dear John,

I hope this email finds you well. I am writing to share an exciting project with you.

I am currently planning a short play adapted from Journey to the West, one of the four great classical novels of Chinese literature. The play will focus on the story of the Monkey King's rebellion against the Heavenly Palace, featuring vivid characters and humorous dialogues. It will be performed at the International Culture Festival next month, lasting about fifteen minutes.

Given your passion for acting and your understanding of Chinese culture, I sincerely invite you to join the cast. I believe your participation would add great charm to the performance. We are going to hold the first rehearsal this Saturday afternoon in the Drama Studio. Would you be available?

I am looking forward to your reply.

Yours,
Li Ming`,
                        note: '范文结构清晰：首段引入话题；中段详细介绍短剧的原著、剧情焦点、演出场合和时长；末段结合对方特长发出邀请，并给出具体排练信息。语言得体，信息完整，符合邮件写作规范。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：问候并引入话题',
                        '中段：介绍短剧的基本信息（原著、剧情、演出场合）',
                        '末段：发出邀请，说明排练安排，期待回复'
                    ],
                    commonPhrases: [
                        'I hope this email finds you well.',
                        'I am writing to share...with you.',
                        'Given your passion for...',
                        'I sincerely invite you to...',
                        'Would you be available?',
                        'I am looking forward to your reply.'
                    ],
                    notes: '邀请信注意：1）介绍活动要具体，让对方了解参与内容；2）说明邀请理由，体现对对方的了解；3）给出明确的时间地点信息，便于对方安排。'
                }
            },
            partB: {
                title: '某社区老年人主要休闲活动调查',
                translation: '根据以下柱状图，写一篇约150词的短文。图表显示了某社区老年人主要休闲活动的分布情况。',
                type: 'chart',
                samples: [
                    {
                        text: `The bar chart clearly illustrates the distribution of major leisure activities among elderly residents in a certain community. As can be seen from the data, watching TV ranks first at 38%, followed by walking at 25% and gardening at 15%. Reading and playing chess account for 12% and 10% respectively.

Several factors may explain these preferences. First, watching TV remains the most popular activity because it requires minimal physical effort and provides diverse entertainment options. Second, walking and gardening are favored by health-conscious seniors who wish to maintain an active lifestyle. These outdoor activities not only benefit physical health but also offer opportunities for social interaction within the community.

From my perspective, while watching TV is a convenient pastime, the elderly should be encouraged to engage in more outdoor and social activities. Communities could organize group exercises, reading clubs, and cultural events to enrich seniors' leisure lives and promote their overall well-being.`,
                        note: '范文采用"描述数据—分析原因—提出建议"的三段式结构。首段概述柱状图各项数据及排名；中段从身体条件和健康意识两方面分析原因；末段提出建议，体现社会责任感。数据描述简洁，逻辑连贯。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述图表数据，指出各项活动的占比及排名',
                        '中段：分析老年人偏好这些活动的原因（身体、心理、社会因素）',
                        '末段：提出建议或评论，如鼓励户外活动、社区组织等'
                    ],
                    keyExpressions: [
                        'The bar chart clearly illustrates...',
                        'As can be seen from the data,...',
                        '...ranks first at...%, followed by...',
                        'Several factors may explain these preferences.',
                        'From my perspective,...',
                        '...should be encouraged to...'
                    ],
                    notes: '柱状图作文注意：1）数据描述要按从高到低或分类别进行，条理清晰；2）分析原因要结合老年人群体的特殊性；3）建议要切实可行，不要过于宏大。'
                }
            }
        },
        '2025-1': {
            partA: {
                title: '回复同学关于校园手工艺展示活动的邮件',
                translation: '假设你的同学Paul来信询问你即将邀请年轻手工艺人到校园展示创新手工艺的活动详情，并表示愿意帮忙。请给他写一封回信，介绍活动内容并告知他可以如何协助准备工作。',
                samples: [
                    {
                        text: `Dear Paul,

Thank you for your enthusiasm about the upcoming crafts-making event. I am more than happy to share the details with you.

The event, scheduled for next Saturday in the Student Center, will feature five young craftsmen demonstrating traditional techniques with modern twists, including paper-cutting, pottery, and bamboo weaving. Visitors will also have the chance to try their hands at some of the crafts.

As for your kind offer to help, I would greatly appreciate it if you could assist with the venue arrangement and the promotion work. Specifically, help me set up the display tables on Friday afternoon and post the event notice on the department's social media account.

Looking forward to working with you on this!

Yours,
Li Ming`,
                        note: '本范文采用典型的三段式结构：首段感谢并引入话题；中段介绍活动的时间、地点、内容和互动环节；末段具体说明对方可承担的工作。语言得体，信息完整，符合书信写作规范。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：感谢来信，表明回信目的',
                        '中段：介绍活动的具体信息（时间、地点、内容）',
                        '末段：说明对方可如何协助，并表达期待'
                    ],
                    commonPhrases: [
                        'Thank you for your enthusiasm/interest about...',
                        'I am more than happy to share the details with you.',
                        'The event is scheduled for...',
                        'I would greatly appreciate it if you could...',
                        'Looking forward to working with you!'
                    ],
                    notes: '回复邮件需注意：1）回应对方来信中的每个问题；2）信息具体明确，避免笼统；3）语气友好热情但不过度客套。'
                }
            },
            partB: {
                title: '2014—2023年居民家庭耐用消费品拥有量变化',
                translation: '根据以下表格，写一篇160-200词的短文。表格显示了2014年至2023年中国居民家庭每百户耐用消费品拥有量的变化情况（电冰箱、空调、洗衣机）。',
                type: 'table',
                samples: [
                    {
                        text: `The table presents the changes in the number of durable consumer goods owned per 100 households in China from 2014 to 2023, covering three categories: refrigerators, air conditioners, and washing machines.

As is clearly shown, all three items have witnessed a steady increase over the decade. The ownership of refrigerators rose from 88.5 to 102.3, while that of washing machines climbed from 83.7 to 98.6. Notably, air conditioners experienced the most dramatic growth, surging from 75.2 to 128.4, overtaking the other two categories by 2023.

Several factors may account for this trend. First, the continuous rise in residents' disposable income has significantly enhanced their purchasing power. Second, the acceleration of urbanization has brought modern lifestyles to more households. Third, technological progress has made these appliances more affordable and energy-efficient, further stimulating consumption.

In conclusion, the data reflects the remarkable improvement in Chinese residents' living standards. It is reasonable to predict that with sustained economic growth, the ownership of durable goods will continue to rise, indicating an ever-higher quality of life.`,
                        note: '范文遵循"描述数据—分析原因—总结评论"的三段式结构。首段概述表格内容；中段选取关键数据进行对比分析，并从收入、城市化、技术进步三个角度解释原因；末段总结趋势并展望。句式多样，逻辑清晰。'
                    }
                ],
                tips: {
                    type: 'table',
                    structure: [
                        '首段：概述表格主题和总体趋势',
                        '中段：选取典型数据进行对比分析，解释变化原因（经济、社会、技术等）',
                        '末段：总结观点，适当展望或提出建议'
                    ],
                    keyExpressions: [
                        'As is clearly shown/indicated in the table...',
                        '...has witnessed a steady/dramatic increase/decrease.',
                        'Several factors may account for this trend.',
                        'First,... Second,... Third,...',
                        'In conclusion,...',
                        'It is reasonable to predict that...'
                    ],
                    notes: '图表作文注意：1）数据描述要选取有代表性的数值，不必面面俱到；2）分析原因要结合社会现实，避免空泛；3）首段描述与中段分析要有区分，不要重复。'
                }
            }
        },
        '2024-2': {
            partA: {
                title: '关于古镇老屋保护调查的计划邮件',
                translation: '假设你和朋友Jack将要对古镇老屋保护情况进行调研。请写一封邮件，提出你的调研计划并征求他的意见。',
                samples: [
                    {
                        text: `Dear Jack,

I am writing to share my preliminary plan for our upcoming survey on the protection of old houses in the ancient town, and I would love to hear your thoughts.

My plan is as follows. First, we could conduct on-site visits to the town over the weekend to observe and photograph the current condition of the old houses. Second, we might interview local residents and cultural heritage experts to gather their perspectives on preservation challenges and solutions. Third, it would be beneficial to collect data from local government archives regarding renovation policies and funding.

I would appreciate it if you could review this plan and offer any suggestions. Perhaps you have ideas on additional research methods or contacts we could reach out to?

Looking forward to your reply.

Yours,
Li Ming`,
                        note: '范文结构清晰：首段表明写信目的；中段从实地考察、采访居民与专家、查阅政府档案三个层面提出具体计划；末段征求意见并保持开放态度。计划具体可行，语气合作友好。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：说明写信目的，引出调研计划',
                        '中段：分点提出具体计划（实地考察、访谈、资料收集）',
                        '末段：征求意见，表达期待合作'
                    ],
                    commonPhrases: [
                        'I am writing to share my preliminary plan for...',
                        'I would love to hear your thoughts.',
                        'My plan is as follows.',
                        'I would appreciate it if you could...',
                        'Looking forward to your reply.'
                    ],
                    notes: '计划+征求意见型邮件注意：1）计划要具体、有步骤；2）明确征求对方意见，不要只是单方面通知；3）保持合作语气，体现团队精神。'
                }
            },
            partB: {
                title: '某高校学生劳动实践课程收获调查',
                translation: '根据以下柱状图写一篇约150词的短文。图表显示了某高校学生劳动实践课程的主要收获调查结果：学习相关知识91.30%，提高动手能力84.80%，心情愉悦54.40%，增强合作精神32.60%。',
                type: 'chart',
                samples: [
                    {
                        text: `The bar chart presents a survey on the main gains from labor practice courses at a certain university. According to the data, learning relevant knowledge ranks the highest at 91.30%, followed closely by improving hands-on ability at 84.80%. Feeling relieved accounts for 54.40%, while enhancing collaborative skills takes the lowest share at 32.60%.

The data reveals that labor practice courses serve a dual purpose: they impart theoretical knowledge while cultivating practical skills. The high percentages in the top two categories suggest that students value both intellectual and physical development. The relatively lower figure for collaborative skills, however, indicates that teamwork-oriented elements in these courses could be further strengthened.

In conclusion, labor practice courses play a vital role in holistic education. Universities should maintain the strengths of these programs while incorporating more collaborative activities to foster students' teamwork spirit and interpersonal skills.`,
                        note: '范文遵循"描述数据—分析含义—提出建议"的三段式结构。首段按数据大小顺序描述各项收获；中段分析双重教育目的并指出合作精神培养的不足；末段总结并提出改进建议。逻辑清晰，分析深入。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述图表数据，按大小顺序或分类呈现',
                        '中段：分析数据反映的现象或趋势，指出亮点与不足',
                        '末段：总结观点，提出建议或展望'
                    ],
                    keyExpressions: [
                        'The bar chart presents a survey on...',
                        'According to the data,...ranks the highest at...%',
                        '...accounts for...%',
                        'The data reveals that...',
                        'In conclusion,...',
                        'Universities should...while...'
                    ],
                    notes: '柱状图作文注意：1）数据描述要按一定逻辑排序（从高到低或分类别）；2）分析不仅要说"是什么"，更要说"为什么"；3）建议要与分析结论相呼应。'
                }
            }
        },
        '2024-1': {
            partA: {
                title: '回复留学生关于中国古代科学家口头报告的建议邮件',
                translation: '假设你收到一封来自留学生的邮件，对方需要做一个关于中国古代科学家的口头报告，但不知如何准备。请写一封回信，给出建议。',
                samples: [
                    {
                        text: `Dear Paul,

I am delighted to know that you are preparing a report on an ancient Chinese scientist. Here are some suggestions that might be helpful.

First, I would recommend choosing a well-known figure, such as Zhang Heng, who invented the world's first seismograph, or Shen Kuo, the author of Dream Pool Essays. Selecting a scientist with remarkable achievements will make your report more engaging. Second, you could structure your report by introducing the scientist's background, major contributions, and historical significance. Visual aids like slides with pictures or diagrams would also enhance your presentation. Third, practicing your oral delivery in advance is essential—pay attention to your pace and clarity.

I hope these suggestions will be of some use to you. Please do not hesitate to reach out if you need further assistance.

Yours,
Li Ming`,
                        note: '范文采用"总—分—总"结构：首段引入话题；中段从选题、报告结构、演讲练习三个层面给出具体建议，层次清晰；末段表达祝愿并保持开放态度。建议具体可操作，语气亲切得体。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：表达高兴之情，引出建议话题',
                        '中段：分点给出具体建议（选题、结构、表达技巧）',
                        '末段：表达祝愿，表示愿意进一步帮助'
                    ],
                    commonPhrases: [
                        'I am delighted to know that...',
                        'Here are some suggestions that might be helpful.',
                        'I would recommend...',
                        'Please do not hesitate to reach out if...',
                        'I hope these suggestions will be of some use to you.'
                    ],
                    notes: '建议信注意：1）建议要具体、可操作，避免空泛；2）分点陈述，逻辑清晰；3）语气友好鼓励，不要居高临下。'
                }
            },
            partB: {
                title: '家门口的市民公园——城市公园建设与居民生活',
                translation: '根据以下图画和图表写一篇160-200词的短文。左图漫画：一位居民感叹家门口的市民公园越来越方便，公园绿地中有人在长跑锻炼。右图数据表：2020—2022年某市公园数量从406个增加到670个。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture on the left depicts a resident expressing gratitude for the convenience of the community park nearby, where people are jogging and exercising on the green lawns. The chart on the right reveals that the number of parks in a certain city increased dramatically from 406 in 2020 to 670 in 2022. Together, these two visuals convey a clear message: urban park construction has significantly improved residents' quality of life.

Several factors contribute to this positive trend. To begin with, the government has attached great importance to ecological civilization and invested heavily in public green spaces. Moreover, as living standards rise, citizens are increasingly aware of the importance of physical fitness and outdoor recreation. The growing number of parks meets this growing demand perfectly.

In my view, the construction of community parks is a commendable initiative that benefits both individuals and society. It not only provides convenient venues for exercise but also enhances the urban environment. I believe this trend will continue, bringing health and happiness to more people.`,
                        note: '范文融合图画描述与数据分析，结构严谨：首段分别描述左右两图并提炼主题；中段从政府政策和居民需求两个角度分析原因；末段表达个人观点并展望。注意图画+图表结合题型需兼顾两种信息的描述。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：分别描述图画和图表内容，提炼共同主题',
                        '中段：分析现象背后的原因（政策支持、健康意识、城市化等）',
                        '末段：表达个人观点，适当展望或提出建议'
                    ],
                    keyExpressions: [
                        'The picture/chart depicts/reveals that...',
                        'Together, these visuals convey a clear message...',
                        'Several factors contribute to this positive trend.',
                        'To begin with,... Moreover,...',
                        'In my view,...',
                        'I believe this trend will continue...'
                    ],
                    notes: '图画+图表结合题型注意：1）两种视觉信息都要描述，不可遗漏；2）找出图画与图表之间的逻辑关联；3）分析原因要具体，避免泛泛而谈。'
                }
            }
        },
        '2023-2': {
            partA: {
                title: '回复朋友关于参观艺术展或机器人展览的建议邮件',
                translation: '假设周日将同时举办一场艺术展和一场机器人展，你的朋友David问你他应该去哪一个。请给他写一封邮件，提出建议并说明理由。',
                samples: [
                    {
                        text: `Dear David,

I am glad to hear that you are interested in both the art exhibition and the robot show. If I were you, I would choose the art exhibition.

My reasons are as follows. First, the art exhibition features works by renowned contemporary Chinese artists, which offers a rare opportunity to appreciate their creativity up close. Second, as you have always been passionate about culture and aesthetics, I believe this exhibition will resonate with you deeply. Third, the robot show is likely to tour other cities, so you may have another chance to attend it in the future.

I hope my suggestion is helpful. Whatever you decide, I am sure you will have a wonderful time.

Yours,
Li Ming`,
                        note: '范文采用建议信的经典结构：首段表明建议；中段从展览内容、个人兴趣、未来机会三个角度说明理由；末段表达祝愿。理由充分且个性化，体现对朋友的了解。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：表明来信收到，直接给出建议',
                        '中段：分点说明建议理由（内容、兴趣匹配、时间安排等）',
                        '末段：表达祝愿，尊重对方最终决定'
                    ],
                    commonPhrases: [
                        'I am glad to hear that...',
                        'If I were you, I would...',
                        'My reasons are as follows.',
                        'I hope my suggestion is helpful.',
                        'Whatever you decide,...'
                    ],
                    notes: '建议信注意：1）建议要明确，不要模棱两可；2）理由要具体且有针对性；3）尊重对方选择，不要过于强势。'
                }
            },
            partB: {
                title: '2012—2021年我国居民健康素养水平变化',
                translation: '根据以下折线图写一篇约150词的短文。图表显示了2012年至2021年我国居民健康素养水平的变化趋势。',
                type: 'chart',
                samples: [
                    {
                        text: `The line chart illustrates the changes in health literacy levels among Chinese residents from 2012 to 2021. As can be seen, the figure rose steadily from 8.80% in 2012 to 25.40% in 2021, nearly tripling over the decade. Notably, the growth accelerated after 2018, with the rate jumping from 17.06% to 25.40% in just three years.

Several factors may explain this upward trend. To begin with, the government has launched nationwide health education campaigns, particularly after the COVID-19 pandemic heightened public awareness of health issues. Additionally, the rapid development of digital media has made health information more accessible to the general public. Moreover, improvements in living standards have encouraged people to pay more attention to healthy lifestyles.

In conclusion, the significant improvement in health literacy reflects the success of public health initiatives. It is reasonable to expect this positive trend to continue as health education becomes more widespread and effective.`,
                        note: '范文遵循"描述数据—分析原因—总结展望"的三段式结构。首段描述折线图的总体趋势和关键数据点；中段从政策、媒体、生活水平三个角度分析原因；末段总结并展望。数据描述精准，逻辑清晰。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述折线图的总体趋势和关键数据',
                        '中段：分析上升趋势的原因（政策、技术、社会因素）',
                        '末段：总结趋势，适当展望'
                    ],
                    keyExpressions: [
                        'The line chart illustrates...',
                        'As can be seen,...',
                        '...rose steadily from...to...',
                        'Notably,...',
                        'Several factors may explain this upward trend.',
                        'In conclusion,...'
                    ],
                    notes: '折线图作文注意：1）要描述总体趋势（上升/下降/波动）；2）选取起点、终点和转折点的数据；3）分析原因要结合社会现实。'
                }
            }
        },
        '2023-1': {
            partA: {
                title: '为教授研究项目招募学生助手的通知',
                translation: '假设你要为一位教授关于校园体育活动的研究项目招募学生助手。请写一份通知，说明助手的工作职责和要求。',
                samples: [
                    {
                        text: `NOTICE

December 20, 2022

Student Research Assistants Wanted

Professor Wang from the Department of Physical Education is conducting a research project on campus sports activities and is looking for two student assistants to join the team.

The responsibilities of the assistants include: collecting and organizing survey data, conducting interviews with students, and assisting with the analysis of research findings. Candidates should have a strong sense of responsibility, excellent communication skills, and be proficient in Microsoft Office. Prior research experience is preferred but not required.

Interested students are welcome to submit their resumes to the Department Office (Room 302, Teaching Building A) before December 30. For further information, please contact Professor Wang at wangpe@university.edu.cn.

Department of Physical Education`,
                        note: '范文采用通知的标准格式：标题、日期、正文、落款。正文包含招募原因、工作职责、任职要求和联系方式，信息完整。语言正式简洁，符合通知文体要求。'
                    }
                ],
                tips: {
                    type: 'notice',
                    structure: [
                        '标题：NOTICE + 日期',
                        '首段：说明招募背景和目的',
                        '中段：列出工作职责和任职要求',
                        '末段：报名方式、截止日期和联系方式'
                    ],
                    commonPhrases: [
                        'Student Research Assistants Wanted',
                        'is looking for...to join the team',
                        'The responsibilities include...',
                        'Candidates should have...',
                        'Interested students are welcome to...',
                        'For further information, please contact...'
                    ],
                    notes: '通知写作注意：1）格式要规范（标题、日期、落款）；2）信息要完整（职责、要求、联系方式）；3）语言正式简洁，避免口语化。'
                }
            },
            partB: {
                title: '传承传统文化——龙舟赛',
                translation: '根据以下图画写一篇160-200词的短文。图画描绘了龙舟赛的场景，越来越多人重视传统文化。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture vividly depicts a dragon boat race on a river, with teams of rowers paddling vigorously to the rhythm of drums. Spectators line the riverbank, cheering enthusiastically. The scene conveys a clear message: traditional Chinese culture is experiencing a remarkable revival, attracting growing numbers of participants and spectators alike.

Several factors account for this encouraging trend. First, the government has implemented a series of policies to protect and promote intangible cultural heritage, including traditional festivals like the Dragon Boat Festival. Second, the media has played a crucial role in raising public awareness of the value of traditional culture through documentaries, TV programs, and social media campaigns. Third, younger generations are increasingly proud of their cultural roots and eager to connect with their heritage.

In my opinion, this trend is highly positive. Traditional culture is not merely a relic of the past but a living source of identity and inspiration. By participating in activities like dragon boat racing, people not only preserve ancient customs but also strengthen community bonds and cultivate a sense of national pride.`,
                        note: '范文采用"描述图画—分析原因—表达观点"的三段式结构。首段生动描绘龙舟赛场景并点明主题；中段从政策、媒体、青年意识三个角度分析传统文化复兴的原因；末段表达积极观点。句式多样，用词丰富。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：描述图画内容，提炼主题（传统文化复兴）',
                        '中段：分析原因（政策支持、媒体传播、青年意识觉醒）',
                        '末段：表达个人观点，展望或建议'
                    ],
                    keyExpressions: [
                        'The picture vividly depicts...',
                        'The scene conveys a clear message...',
                        'Several factors account for this encouraging trend.',
                        'First,... Second,... Third,...',
                        'In my opinion,...',
                        'Traditional culture is not merely...but...'
                    ],
                    notes: '传统文化类图画作文注意：1）描述要生动具体，不要泛泛而谈；2）分析原因要多角度；3）观点要积极正面，体现文化自信。'
                }
            }
        },
        '2022-2': {
            partA: {
                title: '邀请留学生参加校园美食节的邮件',
                translation: '假设你正在策划一场校园美食节。请给校内留学生写一封邮件，介绍美食节并邀请他们参加。',
                samples: [
                    {
                        text: `Dear International Students,

I am pleased to announce that our university will host a Campus Food Festival on December 15th, and I am writing to warmly invite you all to participate.

The festival will feature a diverse array of traditional Chinese dishes from different regions, including Sichuan hotpot, Cantonese dim sum, and Beijing roast duck. In addition to tasting these delicacies, you will have the opportunity to learn how to make dumplings and other Chinese specialties through hands-on cooking workshops. There will also be cultural performances and interactive games throughout the day.

The event will be held in the Student Activity Center from 10:00 AM to 4:00 PM. Admission is free for all students. We believe this festival will not only satisfy your taste buds but also deepen your understanding of Chinese food culture.

We look forward to seeing you there!

Student Union`,
                        note: '范文采用通知+邀请的混合格式：首段宣布活动并发出邀请；中段详细介绍美食种类、互动环节和文化表演；末段说明时间地点并表达期待。信息丰富，语言热情友好。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：宣布活动，发出邀请',
                        '中段：介绍活动内容（美食、互动、文化体验）',
                        '末段：说明时间地点，表达期待'
                    ],
                    commonPhrases: [
                        'I am pleased to announce that...',
                        'I am writing to warmly invite you to...',
                        'The festival will feature...',
                        'In addition to...,...',
                        'We look forward to seeing you there!'
                    ],
                    notes: '邀请留学生参加活动的邮件注意：1）介绍要具体，让对方了解能体验什么；2）强调文化交流的意义；3）语言热情但不过度。'
                }
            },
            partB: {
                title: '我国快递业务量变化',
                translation: '根据以下柱状图写一篇约150词的短文。图表显示了2018-2020年我国快递业务总量及农村地区快递量的变化情况。',
                type: 'chart',
                samples: [
                    {
                        text: `The bar chart clearly illustrates the changes in China's express delivery volume from 2018 to 2020, covering both the national total and rural areas. As can be seen, the total volume rose dramatically from approximately 50.7 billion parcels in 2018 to 83.4 billion in 2020. Notably, rural express delivery also witnessed significant growth, climbing from 12 billion to 30 billion over the same period.

Several factors may account for this remarkable increase. First, the rapid expansion of e-commerce platforms has driven the demand for express delivery services. Second, government policies supporting rural revitalization have improved logistics infrastructure in rural areas, making online shopping more accessible to farmers. Third, the COVID-19 pandemic has accelerated the shift from offline to online consumption.

In conclusion, the booming express delivery industry reflects China's economic vitality and the growing integration of urban and rural markets. This trend is expected to continue as digital economy further develops.`,
                        note: '范文遵循"描述数据—分析原因—总结展望"的三段式结构。首段描述柱状图的关键数据；中段从电商发展、政策支持、疫情推动三个角度分析原因；末段总结趋势并展望。数据选取有代表性，分析全面。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述柱状图数据，指出总体和农村地区的增长趋势',
                        '中段：分析增长原因（电商、政策、疫情等）',
                        '末段：总结趋势，展望未来'
                    ],
                    keyExpressions: [
                        'The bar chart clearly illustrates...',
                        'As can be seen,...',
                        'Notably,...',
                        'Several factors may account for...',
                        'In conclusion,...',
                        'This trend is expected to continue...'
                    ],
                    notes: '柱状图作文注意：1）如果有两组数据（如总体和农村），要分别描述；2）分析原因要结合社会热点；3）结论要积极正面。'
                }
            }
        },
        '2022-1': {
            partA: {
                title: '邀请英国大学教授组织国际创新竞赛团队的邮件',
                translation: '假设你要写一封邮件给一所英国大学的教授，邀请他/她组织一个团队参加在你校举办的国际创新竞赛。',
                samples: [
                    {
                        text: `Dear Professor Smith,

I am writing on behalf of the International Innovation Committee at Peking University to cordially invite you to organize a team for the International Innovation Competition to be held at our university next May.

The competition aims to bring together talented students from around the world to collaborate on innovative projects addressing global challenges. We would be honored if you could lead a team from your university to participate. The event will include workshops, presentations, and networking sessions over three days.

We will cover all travel and accommodation expenses for your team. Should you require any further information, please do not hesitate to contact me.

We sincerely hope you will accept this invitation.

Yours sincerely,
Li Ming`,
                        note: '范文采用邀请信的标准格式：首段表明身份和邀请目的；中段介绍竞赛主题、内容和安排；末段说明费用安排并表达期待。语言正式得体，信息完整。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：自我介绍，说明写信目的（邀请）',
                        '中段：介绍活动详情（主题、内容、时间安排）',
                        '末段：说明后勤安排，表达期待'
                    ],
                    commonPhrases: [
                        'I am writing on behalf of...to cordially invite you to...',
                        'We would be honored if you could...',
                        'Should you require any further information,...',
                        'We sincerely hope you will accept this invitation.'
                    ],
                    notes: '邀请信注意：1）身份和目的要明确；2）活动介绍要具体；3）语气要正式礼貌，体现尊重。'
                }
            },
            partB: {
                title: '学习的功利性与真正求知',
                translation: '根据以下图画写一篇160-200词的短文。图画描绘了学习中的功利性现象。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture depicts a thought-provoking scene: a student is reading a book with a calculator beside him, apparently calculating the financial returns of his education. The image vividly illustrates the utilitarian approach to learning that has become increasingly prevalent in modern society.

Several factors contribute to this phenomenon. First, the fierce competition in the job market has driven students to view education primarily as a means to secure well-paying jobs. Second, the rising cost of higher education has led families to expect tangible returns on their investment. Third, the emphasis on standardized testing and quantifiable outcomes has narrowed the purpose of learning to mere grade-chasing.

However, this utilitarian mindset is misguided. True education is not merely about acquiring marketable skills but about cultivating critical thinking, broadening one's horizons, and developing a lifelong love of learning. As the saying goes, "Education is not the filling of a pail, but the lighting of a fire." We should rediscover the intrinsic value of learning and pursue knowledge for its own sake.`,
                        note: '范文采用"描述图画—分析原因—表达观点"的三段式结构。首段描述图画并点明主题；中段从就业压力、教育成本、考试制度三个角度分析功利性学习的原因；末段引用名言，强调教育的内在价值。论证有力，观点鲜明。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：描述图画内容，提炼主题（学习功利性）',
                        '中段：分析现象原因（就业、成本、制度等）',
                        '末段：表达观点，引用名言增强说服力'
                    ],
                    keyExpressions: [
                        'The picture depicts a thought-provoking scene...',
                        'Several factors contribute to this phenomenon.',
                        'However, this...mindset is misguided.',
                        'As the saying goes,...',
                        'We should rediscover the intrinsic value of...'
                    ],
                    notes: '批判性图画作文注意：1）描述要准确，不要过度解读；2）分析原因要客观；3）观点要积极正面，提出建设性意见。'
                }
            }
        },
        '2021-2': {
            partA: {
                title: '回复同学关于参加英语演讲比赛的建议邮件',
                translation: '假设你的同学来信询问是否应该参加英语演讲比赛，请给他写一封回信，给出建议并说明理由。',
                samples: [
                    {
                        text: `Dear Wang Lei,

I am glad to hear that you are considering entering the English Speech Contest. I would strongly encourage you to go for it.

My reasons are as follows. First, participating in a speech contest is an excellent opportunity to improve your public speaking skills, which will benefit you greatly in your future career. Second, the preparation process will push you to refine your language proficiency and deepen your thinking on various topics. Third, even if you don't win, the experience itself will boost your confidence and broaden your horizons.

I suggest you start by choosing a topic you are passionate about and practicing your delivery in front of friends. If you need any help reviewing your speech, I am always here for you.

Yours,
Li Ming`,
                        note: '范文采用建议信结构：首段表明鼓励态度；中段从技能提升、语言精进、信心培养三个角度说明理由；末段给出具体建议并提供帮助。理由充分，语气积极鼓励。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：表明态度（鼓励参加）',
                        '中段：分点说明理由（技能、语言、信心等）',
                        '末段：给出准备建议，提供帮助'
                    ],
                    commonPhrases: [
                        'I am glad to hear that...',
                        'I would strongly encourage you to go for it.',
                        'My reasons are as follows.',
                        'I suggest you start by...',
                        'I am always here for you.'
                    ],
                    notes: '鼓励型建议信注意：1）态度要积极正面；2）理由要具体有说服力；3）给出可操作的准备建议。'
                }
            },
            partB: {
                title: '某市居民体育锻炼方式调查',
                translation: '根据以下柱状图写一篇约150词的短文。图表显示了某市居民体育锻炼方式的调查结果。',
                type: 'chart',
                samples: [
                    {
                        text: `The bar chart presents a survey on the exercise preferences of residents in a certain city. According to the data, jogging ranks first at 35%, followed by ball games at 25% and swimming at 20%. Yoga and gym training account for 12% and 8% respectively.

The data reveals several interesting trends. First, jogging remains the most popular form of exercise, likely because it requires minimal equipment and can be done anywhere. Second, ball games and swimming are favored by those who prefer social or full-body workouts. The relatively lower figures for yoga and gym training suggest that these activities may be less accessible or less familiar to the general public.

In my opinion, cities should invest in more public sports facilities and organize community fitness programs to encourage residents to adopt diverse and regular exercise habits. A healthy population contributes to a vibrant and productive society.`,
                        note: '范文遵循"描述数据—分析趋势—提出建议"的三段式结构。首段按排名描述各项锻炼方式的占比；中段分析受欢迎程度的原因；末段提出建议。逻辑清晰，建议切实可行。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述柱状图数据，按排名呈现各项锻炼方式',
                        '中段：分析各项运动受欢迎的原因',
                        '末段：提出建议，展望健康生活'
                    ],
                    keyExpressions: [
                        'The bar chart presents a survey on...',
                        'According to the data,...ranks first at...%',
                        'The data reveals several interesting trends.',
                        'In my opinion,...',
                        'A healthy population contributes to...'
                    ],
                    notes: '调查类柱状图作文注意：1）数据描述要按排名或分类进行；2）分析原因要结合实际；3）建议要具体可行。'
                }
            }
        },
        '2021-1': {
            partA: {
                title: '给外国朋友推荐一个中国城市旅游',
                translation: '假设你的外国朋友想来中国旅游，请给他写一封邮件，推荐一个城市并说明理由。',
                samples: [
                    {
                        text: `Dear Tom,

I am thrilled to know that you are planning a trip to China. I would highly recommend Xi'an as your first destination.

As one of the oldest cities in China, Xi'an boasts a history of over 3,000 years. The Terracotta Warriors, a UNESCO World Heritage Site, is an absolute must-see that will leave you in awe. Besides, the Ancient City Wall offers a wonderful cycling experience with panoramic views of the city. The Muslim Quarter is also worth visiting for its vibrant street food scene, where you can taste authentic local delicacies such as roujiamo and biangbiang noodles.

I suggest you allocate at least three days for Xi'an to fully appreciate its rich cultural heritage. If you need any help with your itinerary, feel free to reach out.

Yours,
Li Ming`,
                        note: '范文采用推荐信的结构：首段表达高兴并直接推荐；中段从历史古迹、城市体验、美食三个角度详细介绍；末段给出时间建议并提供帮助。推荐理由充分，信息实用。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：表达高兴，直接推荐目标城市',
                        '中段：从多个角度介绍城市特色（历史、风景、美食等）',
                        '末段：给出旅行建议，表示愿意帮助'
                    ],
                    commonPhrases: [
                        'I am thrilled to know that...',
                        'I would highly recommend...as your first destination.',
                        '...is an absolute must-see that will leave you in awe.',
                        '...is also worth visiting for...',
                        'If you need any help with..., feel free to reach out.'
                    ],
                    notes: '推荐信注意：1）推荐要具体，有名有实；2）介绍要生动，激发对方兴趣；3）给出实用建议（时间、路线等）。'
                }
            },
            partB: {
                title: '不要爬那么高——适度与过度',
                translation: '根据以下图画写一篇160-200词的短文。图画描绘了一个人在爬梯子，旁边有人说"不用爬那么高"。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture presents a thought-provoking scene: a person is climbing a ladder, striving to reach greater heights, while a bystander comments, "You don't need to climb that high." This image reflects a common phenomenon in society—some people discourage others from pursuing ambitious goals.

On the one hand, the bystander's advice may stem from genuine concern. Overexertion without proper preparation can lead to burnout or failure. It is wise to set realistic goals and progress step by step. On the other hand, excessive caution can stifle ambition and prevent people from realizing their full potential. History has shown that many great achievements were made by those who dared to climb higher than others thought necessary.

In my view, while prudence is valuable, it should not become an excuse for mediocrity. We should encourage one another to pursue excellence while maintaining a healthy balance between ambition and well-being. After all, as Robert Browning wrote, "A man's reach should exceed his grasp, or what's a heaven for?"`,
                        note: '范文采用"描述图画—辩证分析—表达观点"的结构。首段描述图画并点明现象；中段从正反两面分析"适度"与"过度"的关系；末段引用诗句，表达积极进取的人生态度。论证辩证，观点深刻。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：描述图画内容，提炼主题（适度与过度、进取与保守）',
                        '中段：辩证分析——一方面理解谨慎的理由，另一方面指出过度保守的危害',
                        '末段：表达个人观点，引用名言增强说服力'
                    ],
                    keyExpressions: [
                        'The picture presents a thought-provoking scene...',
                        'On the one hand,... On the other hand,...',
                        'In my view,...',
                        '...should not become an excuse for...',
                        'As...wrote, "..."'
                    ],
                    notes: '辩证型图画作文注意：1）要兼顾正反两面，不要片面；2）个人观点要明确，不要模棱两可；3）引用名言可以提升文章档次。'
                }
            }
        },
        '2020-2': {
            partA: {
                title: '给教授写邮件询问研究项目问题',
                translation: '假设你要给一位教授写邮件，询问关于一个研究项目的问题。',
                samples: [
                    {
                        text: `Dear Professor Johnson,

I hope this email finds you well. I am Li Ming, a third-year student in the Department of Economics. I am writing to inquire about your research project on sustainable urban development.

Having read your recent publication on green infrastructure, I am deeply impressed by your findings and would love the opportunity to contribute to your research. I would be grateful if you could let me know whether there are any positions available for student assistants. Additionally, I would appreciate it if you could share some preliminary reading materials so that I can better prepare myself.

Thank you very much for your time. I look forward to your reply.

Yours sincerely,
Li Ming`,
                        note: '范文采用询问邮件的标准格式：首段自我介绍并说明写信目的；中段表达兴趣并提出具体问题；末段致谢并期待回复。语言正式礼貌，问题具体明确。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：自我介绍，说明写信目的',
                        '中段：表达兴趣，提出具体问题',
                        '末段：致谢，期待回复'
                    ],
                    commonPhrases: [
                        'I hope this email finds you well.',
                        'I am writing to inquire about...',
                        'I would be grateful if you could...',
                        'I would appreciate it if you could...',
                        'I look forward to your reply.'
                    ],
                    notes: '学术询问邮件注意：1）自我介绍要简洁；2）问题要具体明确；3）语气要正式礼貌。'
                }
            },
            partB: {
                title: '大学生使用手机的主要用途调查',
                translation: '根据以下饼状图写一篇约150词的短文。图表显示了某高校学生使用手机的主要用途：学习60%，获取资料17%，娱乐和其他23%。',
                type: 'chart',
                samples: [
                    {
                        text: `The pie chart clearly illustrates the main purposes of mobile phone usage among college students at a certain university. According to the data, studying accounts for the largest proportion at 60%, followed by obtaining materials at 17%. Entertainment and other purposes together make up the remaining 23%.

The data indicates that the majority of students use their phones primarily for academic purposes. This may be attributed to the widespread adoption of online learning platforms and educational applications, which have made mobile phones essential tools for modern education. The relatively low proportion of entertainment usage suggests that most students have a responsible attitude toward their phone usage.

However, it is worth noting that nearly a quarter of phone usage is still devoted to non-academic activities. Universities should guide students to make better use of their phones by promoting high-quality educational resources and developing more engaging learning applications.`,
                        note: '范文遵循"描述数据—分析原因—提出建议"的三段式结构。首段描述饼状图各项占比；中段分析学习用途占主导的原因；末段针对非学术用途提出建议。分析客观，建议具体。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述饼状图各项占比及排名',
                        '中段：分析占比最大的项的原因',
                        '末段：针对不足提出建议'
                    ],
                    keyExpressions: [
                        'The pie chart clearly illustrates...',
                        'According to the data,...accounts for the largest proportion at...%',
                        'This may be attributed to...',
                        'However, it is worth noting that...',
                        'Universities should guide students to...'
                    ],
                    notes: '饼状图作文注意：1）数据描述要按占比大小排列；2）分析要结合大学生群体特点；3）建议要针对数据反映的问题。'
                }
            }
        },
        '2020-1': {
            partA: {
                title: '通知：学生合唱团招新',
                translation: '假设你是学生会主席，请写一份通知，告知国际学生活动中心关于学校合唱团招新的事宜。',
                samples: [
                    {
                        text: `NOTICE

December 22, 2019

The University Choir is recruiting new members!

Our university choir, which has won numerous awards at national and international competitions, is looking for passionate singers to join us for the upcoming spring semester. No prior professional training is required—just a love for music and a willingness to learn.

Rehearsals are held every Tuesday and Thursday evening from 7:00 to 9:00 PM in the Music Building, Room 201. Auditions will take place on January 5th and 6th. All students, including international students, are welcome to participate.

For registration and further details, please visit the Student Union Office (Room 101, Student Center) or contact us at choir@university.edu.cn.

Student Union`,
                        note: '范文采用通知的标准格式：标题、日期、正文、落款。正文包含合唱团简介、招新要求、排练时间和 audition 安排、联系方式，信息完整。'
                    }
                ],
                tips: {
                    type: 'notice',
                    structure: [
                        '标题：NOTICE + 日期',
                        '首段：说明招新目的和合唱团简介',
                        '中段：说明招新要求和排练安排',
                        '末段：报名方式和联系方式'
                    ],
                    commonPhrases: [
                        'is recruiting new members',
                        'No prior professional training is required',
                        'All students are welcome to participate',
                        'For registration and further details, please...'
                    ],
                    notes: '通知写作注意：1）格式规范；2）信息完整（时间、地点、要求、联系方式）；3）语言简洁正式。'
                }
            },
            partB: {
                title: '坚持与风景——山顶的对话',
                translation: '根据以下图画写一篇160-200词的短文。图画描绘了两个人在山顶，一人说"好累啊"，另一人说"风景真美"。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture presents a striking contrast between two people standing on a mountain peak. One of them, exhausted from the climb, sighs, "How tired I am!" The other, gazing at the magnificent scenery below, exclaims, "What a beautiful view!" This image conveys a profound message: our attitude determines how we experience life's journey.

The two figures represent two different mindsets. The first focuses on the hardships endured along the way, overlooking the rewards that await at the top. The second appreciates the beauty that perseverance has brought, understanding that the struggle itself is part of the experience. In life, challenges and rewards are inseparable—those who persist through difficulties are often the ones who enjoy the most breathtaking views.

This picture reminds us that success requires both effort and a positive outlook. As the saying goes, "The best view comes after the hardest climb." We should learn to embrace challenges with optimism, for it is through overcoming obstacles that we truly grow and appreciate the beauty of life.`,
                        note: '范文采用"描述图画—分析寓意—总结启示"的三段式结构。首段描述两人对比并点明主题；中段分析两种心态的差异；末段引用名言升华主题。论证深刻，语言优美。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：描述图画中的对比，提炼主题（态度决定体验）',
                        '中段：分析两种心态的差异及其影响',
                        '末段：总结启示，引用名言升华'
                    ],
                    keyExpressions: [
                        'The picture presents a striking contrast...',
                        'This image conveys a profound message...',
                        'In life, challenges and rewards are inseparable.',
                        'As the saying goes,...',
                        'We should learn to embrace challenges with optimism.'
                    ],
                    notes: '对比型图画作文注意：1）描述要突出对比；2）分析要深入，不要停留在表面；3）结论要积极向上。'
                }
            }
        },
        '2019-2': {
            partA: {
                title: '回复留学生关于参加学术会议的邮件',
                translation: '假设你正在为"援助乡村小学"项目工作，请给教授写邮件介绍项目并寻求建议。',
                samples: [
                    {
                        text: `Dear Professor Wang,

I hope this email finds you well. I am writing to introduce the "Aiding Rural Primary School" project organized by our university and to seek your advice.

The project aims to provide educational support to rural primary schools in underdeveloped areas. Our team of 20 volunteers will spend two weeks in July teaching English, math, and art to local children. We also plan to donate books and stationery to the schools.

As an expert in rural education, your insights would be invaluable to us. Could you kindly advise us on how to better design our teaching curriculum and engage the students effectively? We would also appreciate any suggestions on preparing the volunteers for the cultural differences they may encounter.

Thank you for your time and guidance.

Yours sincerely,
Li Ming`,
                        note: '范文结构清晰：首段说明写信目的；中段介绍项目详情；末段具体请教问题并致谢。语言正式，问题具体。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：说明写信目的',
                        '中段：介绍项目/活动详情',
                        '末段：提出具体问题，致谢'
                    ],
                    commonPhrases: [
                        'I am writing to introduce...and to seek your advice.',
                        'Could you kindly advise us on...?',
                        'We would also appreciate any suggestions on...',
                        'Thank you for your time and guidance.'
                    ],
                    notes: '学术咨询邮件注意：1）介绍要简洁明了；2）问题要具体；3）语气要尊重。'
                }
            },
            partB: {
                title: '某高校2013年和2018年本科毕业生去向统计',
                translation: '根据以下柱状图写一篇约150词的短文。图表显示了某高校2013年和2018年本科毕业生去向的变化情况。',
                type: 'chart',
                samples: [
                    {
                        text: `The bar chart compares the career choices of college graduates at a certain university between 2013 and 2018. As can be seen, the proportion of graduates pursuing further education rose significantly from 26% to 35%, while employment decreased from 68% to 60%. The percentage of those who remained unemployed also dropped slightly from 6% to 5%.

Several factors may explain these changes. First, the increasingly competitive job market has motivated more students to pursue advanced degrees to enhance their qualifications. Second, the expansion of postgraduate enrollment has provided more opportunities for further study. Third, some graduates may choose to delay employment to explore entrepreneurship or personal development.

In conclusion, the shift toward further education reflects the evolving aspirations of young people and the changing demands of the job market. Universities should provide better career guidance to help students make informed decisions about their future.`,
                        note: '范文遵循"描述数据—分析原因—总结建议"的三段式结构。首段对比两年的数据变化；中段从就业竞争、扩招、个人发展三个角度分析原因；末段总结趋势并提出建议。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：对比描述两个年份的数据变化',
                        '中段：分析变化原因',
                        '末段：总结趋势，提出建议'
                    ],
                    keyExpressions: [
                        'The bar chart compares...between...and...',
                        'As can be seen,...',
                        'Several factors may explain these changes.',
                        'In conclusion,...',
                        'Universities should provide...'
                    ],
                    notes: '对比型柱状图注意：1）要突出两年间的变化趋势；2）分析原因要结合社会背景；3）建议要针对趋势提出。'
                }
            }
        },
        '2019-1': {
            partA: {
                title: '为国际学术会议招募志愿者的通知',
                translation: '假设你是学生会成员，请写一份通知，为一场国际学术会议招募志愿者。',
                samples: [
                    {
                        text: `NOTICE

December 23, 2018

Volunteers Wanted for International Academic Conference

The 5th International Conference on Artificial Intelligence will be held at our university from January 10th to 12th, 2019. We are looking for 30 student volunteers to assist with the conference.

Volunteers will be responsible for guiding guests, providing translation services, and assisting with registration and venue arrangements. Applicants should have strong communication skills and a good command of English. Prior volunteer experience is preferred.

Selected volunteers will receive a certificate of participation and free access to all conference sessions. Interested students are requested to submit their applications to the Student Union Office before January 3rd.

Student Union`,
                        note: '范文采用通知格式，包含会议信息、志愿者职责、要求和报名方式，信息完整。'
                    }
                ],
                tips: {
                    type: 'notice',
                    structure: [
                        '标题：NOTICE + 日期',
                        '首段：说明会议信息和招募目的',
                        '中段：列出职责和要求',
                        '末段：说明福利和报名方式'
                    ],
                    commonPhrases: [
                        'We are looking for...volunteers to...',
                        'Volunteers will be responsible for...',
                        'Applicants should have...',
                        'Interested students are requested to...'
                    ],
                    notes: '招募通知要信息完整：会议名称、时间、职责、要求、福利、报名截止日期。'
                }
            },
            partB: {
                title: '坚持——一步一个脚印',
                translation: '根据以下图画写一篇160-200词的短文。图画描绘了一名登山者奋力攀登的场景。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture depicts a mountain climber persevering through steep and rocky terrain, with clouds obscuring the summit above and a winding path stretching below. The caption reads: "Reaching the top in one step is impossible, but one step at a time will get you there." This image conveys a timeless truth about the value of persistence and steady effort.

In an era of instant gratification, many people seek shortcuts to success. However, true achievement rarely comes without sustained effort and patience. History is filled with examples of individuals who succeeded through incremental progress—scientists who spent years in laboratories, athletes who trained day after day, and entrepreneurs who built their businesses step by step.

As students preparing for the postgraduate entrance examination, we can draw great inspiration from this image. The journey may be long and arduous, but every small step brings us closer to our goal. Let us embrace the process, stay focused, and trust that consistent effort will ultimately lead to success.`,
                        note: '范文采用"描述图画—分析寓意—联系实际"的三段式结构。首段描述登山场景并点明主题；中段从社会现象角度分析坚持的价值；末段联系考研实际，鼓舞人心。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：描述图画内容，提炼主题（坚持、脚踏实地）',
                        '中段：分析坚持的价值，举实例论证',
                        '末段：联系实际（如考研），表达决心'
                    ],
                    keyExpressions: [
                        'The picture depicts...',
                        'This image conveys a timeless truth about...',
                        'In an era of instant gratification,...',
                        'History is filled with examples of...',
                        'Let us embrace the process...'
                    ],
                    notes: '励志型图画作文注意：1）描述要生动；2）论证要有实例支撑；3）结尾要联系实际，增强感染力。'
                }
            }
        },
        '2018-2': {
            partA: {
                title: '回复澳大利亚教授关于参加学术会议的邮件',
                translation: '假设你收到一封来自澳大利亚教授的邮件，询问关于参加学术会议的事宜。请写一封回信。',
                samples: [
                    {
                        text: `Dear Professor Williams,

Thank you for your email. I am delighted to learn that you are interested in attending the International Conference on Environmental Science at our university.

The conference will be held from March 15th to 17th. I would be happy to assist you with the registration process and hotel arrangements. Regarding your question about the presentation schedule, each speaker will be allotted 20 minutes for their talk, followed by a 10-minute Q&A session.

I have attached the conference program and registration form for your reference. Should you need any further information, please do not hesitate to contact me.

I look forward to meeting you at the conference.

Yours sincerely,
Li Ming`,
                        note: '范文结构清晰：首段致谢并确认信息；中段回答具体问题；末段提供附件并期待见面。语言正式得体。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：致谢，确认对方的询问',
                        '中段：回答具体问题',
                        '末段：提供附加信息，期待见面'
                    ],
                    commonPhrases: [
                        'Thank you for your email.',
                        'I am delighted to learn that...',
                        'I would be happy to assist you with...',
                        'Should you need any further information,...',
                        'I look forward to meeting you.'
                    ],
                    notes: '回复邮件注意：1）逐一回答对方的问题；2）提供有用的附加信息；3）语气热情正式。'
                }
            },
            partB: {
                title: '消费者选择餐厅时关注因素调查',
                translation: '根据以下饼状图写一篇约150词的短文。图表显示了消费者选择餐厅时关注的主要因素。',
                type: 'chart',
                samples: [
                    {
                        text: `The pie chart illustrates the factors that consumers consider when choosing a restaurant. According to the data, specialty ranks first at 36.3%, followed by service at 26.8% and environment at 23.8%. Price accounts for only 8.4%, with other factors making up the remaining 4.7%.

The data reveals that consumers increasingly prioritize the quality of food and dining experience over cost. This shift may be attributed to rising living standards and changing consumer preferences. As people's incomes grow, they are willing to pay more for distinctive cuisine and excellent service rather than simply seeking the cheapest option.

From the restaurant's perspective, these findings suggest that businesses should focus on developing unique dishes, improving service quality, and creating pleasant dining environments to attract and retain customers. Simply competing on price alone is no longer sufficient in today's market.`,
                        note: '范文遵循"描述数据—分析原因—提出建议"的三段式结构。首段按占比描述各项因素；中段分析消费升级的原因；末段对餐厅经营者提出建议。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述饼状图各项因素的占比',
                        '中段：分析消费者偏好变化的原因',
                        '末段：对相关方提出建议'
                    ],
                    keyExpressions: [
                        'The pie chart illustrates...',
                        'According to the data,...ranks first at...%',
                        'This shift may be attributed to...',
                        'From...perspective,...',
                        'Simply competing on...alone is no longer sufficient.'
                    ],
                    notes: '饼状图作文注意：1）数据描述要按占比排序；2）分析要结合消费升级背景；3）建议要针对数据反映的趋势。'
                }
            }
        },
        '2018-1': {
            partA: {
                title: '回复留学生关于选课的建议邮件',
                translation: '假设你的美国朋友Alex来信询问选课建议，请给他写一封回信。',
                samples: [
                    {
                        text: `Dear Alex,

I am glad to hear that you are planning to take some elective courses next semester. I would like to offer a few suggestions.

First, I recommend "Introduction to Chinese Culture," which covers traditional philosophy, art, and festivals. It will help you understand Chinese society better and enrich your study-abroad experience. Second, "Business Chinese" would be practical if you plan to work in a Chinese-speaking environment after graduation. The course focuses on professional communication skills.

I suggest you visit the university's course registration website for detailed schedules and prerequisites. If you need any help, feel free to contact me.

Yours,
Li Ming`,
                        note: '范文结构清晰：首段引入话题；中段推荐两门课程并说明理由；末段提供实用信息。推荐具体，理由充分。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：引入话题，表明写信目的',
                        '中段：推荐课程并说明理由',
                        '末段：提供实用信息，表示愿意帮助'
                    ],
                    commonPhrases: [
                        'I am glad to hear that...',
                        'I would like to offer a few suggestions.',
                        'I recommend...which...',
                        'It will help you...',
                        'Feel free to contact me.'
                    ],
                    notes: '选课建议信注意：1）课程名称要具体；2）推荐理由要结合对方需求；3）提供实用信息。'
                }
            },
            partB: {
                title: '选课——"有书"与"读书"',
                translation: '根据以下图画写一篇160-200词的短文。图画描绘了"有书"与"读书"的对比。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture presents a thought-provoking contrast between two individuals. On the left, a person sits surrounded by a vast collection of books but shows no interest in reading any of them. On the right, another person, owning only a few books, has made a detailed reading plan and is actively engaged in study. The image highlights the difference between merely possessing knowledge and truly pursuing it.

This phenomenon is not uncommon in modern society. Many people accumulate books or online courses but never actually dedicate time to learning. They mistake possession for understanding, and acquisition for mastery. True education requires active engagement, critical thinking, and consistent effort—not just a shelf full of unread books.

As the Chinese saying goes, "Having books is not the same as reading them." We should shift our focus from accumulating resources to making genuine use of them. Only through dedicated study can we transform knowledge into wisdom and capability.`,
                        note: '范文采用"描述对比—分析现象—引用名言"的三段式结构。首段描述图画中的对比；中段分析"拥有"与"真正学习"的区别；末段引用名言，强调学以致用。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：描述图画中的对比，提炼主题',
                        '中段：分析现象原因（拥有vs真正学习）',
                        '末段：引用名言，提出建议'
                    ],
                    keyExpressions: [
                        'The picture presents a thought-provoking contrast...',
                        'This phenomenon is not uncommon in modern society.',
                        'They mistake possession for understanding.',
                        'As the Chinese saying goes,...',
                        'We should shift our focus from...to...'
                    ],
                    notes: '对比型图画作文注意：1）描述要突出两个图的差异；2）分析要深入到本质；3）引用名言增强说服力。'
                }
            }
        },
        '2017-2': {
            partA: {
                title: '回复教授关于论文选题的建议邮件',
                translation: '假设你正在写一篇关于中国文化的论文，教授来信询问进展。请写一封回信，告知选题并寻求建议。',
                samples: [
                    {
                        text: `Dear Professor Chen,

Thank you for your email. I am writing to update you on my thesis progress and to seek your guidance.

I have decided to focus my research on the development of Chinese tea culture and its influence on social customs. I plan to examine how tea ceremonies have evolved from ancient rituals to modern social practices, and how they reflect changes in Chinese society.

I would be grateful if you could recommend some key references on this topic. Additionally, I would appreciate your advice on the research methodology I should adopt.

I look forward to your feedback.

Yours sincerely,
Li Ming`,
                        note: '范文简洁明了：首段说明目的；中段介绍选题方向；末段请求指导。问题具体，语气尊重。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：致谢，说明写信目的',
                        '中段：介绍选题方向和研究计划',
                        '末段：请求具体指导，期待反馈'
                    ],
                    commonPhrases: [
                        'I am writing to update you on...and to seek your guidance.',
                        'I have decided to focus my research on...',
                        'I would be grateful if you could...',
                        'I look forward to your feedback.'
                    ],
                    notes: '学术进度汇报邮件注意：1）选题要明确具体；2）问题要针对需要帮助的方面；3）语气要尊重专业。'
                }
            },
            partB: {
                title: '博物馆数量及参观人数增长',
                translation: '根据以下折线图写一篇约150词的短文。图表显示了2013-2015年中国博物馆数量及参观人数的变化趋势。',
                type: 'chart',
                samples: [
                    {
                        text: `The line chart illustrates the changes in the number of museums and museum visitors in China from 2013 to 2015. Both metrics showed a steady upward trend during this period. The number of museums rose from approximately 4,165 to 4,692, while total visitor numbers climbed from 700 million to 900 million.

Several factors may account for this growth. First, the government has increased investment in cultural infrastructure, making museums more accessible to the public. Second, rising living standards have fueled people's desire for cultural enrichment and leisure activities. Third, many museums have introduced innovative programs and digital exhibits to attract younger audiences.

This trend is encouraging and reflects China's commitment to cultural development. To sustain this momentum, museums should continue to diversify their offerings and strengthen community outreach programs.`,
                        note: '范文遵循"描述数据—分析原因—总结建议"的三段式结构。首段描述折线图趋势和关键数据；中段分析增长原因；末段提出建议。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述折线图的总体趋势和关键数据',
                        '中段：分析增长原因（政策、经济、创新等）',
                        '末段：总结趋势，提出建议'
                    ],
                    keyExpressions: [
                        'The line chart illustrates...',
                        'Both metrics showed a steady upward trend.',
                        'Several factors may account for this growth.',
                        'This trend is encouraging and reflects...',
                        'To sustain this momentum,...'
                    ],
                    notes: '双线折线图注意：1）两条线的趋势都要描述；2）可以分别分析也可以综合分析；3）结论要积极正面。'
                }
            }
        },
        '2017-1': {
            partA: {
                title: '推荐书评网站给外国朋友的邮件',
                translation: '假设你的外国朋友Jim来信询问如何提高中文阅读能力，请写一封回信，推荐一个书评网站。',
                samples: [
                    {
                        text: `Dear Jim,

I am glad to hear that you are working on improving your Chinese reading skills. I would like to recommend a website called "Douban Reading" (www.douban.com), which I believe will be very helpful.

Douban Reading is one of China's most popular platforms for book reviews and recommendations. You can find reviews of both Chinese and translated works, covering literature, history, philosophy, and more. The reviews are written by ordinary readers, which makes them accessible and authentic. Reading these reviews will not only improve your Chinese but also give you insights into Chinese culture and contemporary society.

I suggest you start with books you are already familiar with, so you can focus on the language rather than the content. I hope you find this helpful!

Yours,
Li Ming`,
                        note: '范文结构清晰：首段引入推荐；中段详细介绍网站特点和使用方法；末段给出建议。推荐具体，实用性强。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：引入话题，表明推荐目的',
                        '中段：详细介绍推荐对象的特点和优势',
                        '末段：给出使用建议'
                    ],
                    commonPhrases: [
                        'I would like to recommend...',
                        'which I believe will be very helpful.',
                        'Reading...will not only...but also...',
                        'I suggest you start with...',
                        'I hope you find this helpful!'
                    ],
                    notes: '推荐邮件注意：1）推荐对象要具体；2）介绍要详细说明优势；3）给出实用的使用建议。'
                }
            },
            partB: {
                title: '读书——有目标与无目标',
                translation: '根据以下图画写一篇160-200词的短文。图画描绘了两种不同的读书方式。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture illustrates two contrasting approaches to reading. One person reads aimlessly, picking up whatever book comes to hand without any plan or purpose. The other reads with a clear goal, selecting books strategically and taking notes diligently. The message is clear: purposeful reading leads to genuine intellectual growth.

In today's information age, we are bombarded with an overwhelming amount of content. Without a clear reading plan, we risk wasting time on trivial materials while missing works that could truly broaden our horizons. Goal-oriented reading helps us build systematic knowledge, develop critical thinking, and achieve deeper understanding.

As students, we should cultivate the habit of purposeful reading. This means setting clear learning objectives, choosing books that align with our goals, and reflecting on what we have read. As Francis Bacon famously wrote, "Some books are to be tasted, others to be swallowed, and some few to be chewed and digested." Let us read with purpose and transform knowledge into wisdom.`,
                        note: '范文采用"描述对比—分析意义—联系实际"的结构。首段描述两种读书方式的对比；中段分析有目标读书的重要性；末段引用培根名言，提出建议。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：描述图画中的对比，提炼主题',
                        '中段：分析有目标读书的重要性',
                        '末段：联系实际，引用名言，提出建议'
                    ],
                    keyExpressions: [
                        'The picture illustrates two contrasting approaches...',
                        'The message is clear:...',
                        "In today's information age,...",
                        'As...famously wrote,...',
                        'Let us read with purpose...'
                    ],
                    notes: '读书类图画作文是考研英语一常见主题，要注意结合实际，引用名言增强说服力。'
                }
            }
        },
        '2016-2': {
            partA: {
                title: '回复朋友关于旅游目的地的建议邮件',
                translation: '假设你的朋友来信询问暑假旅游目的地的建议。请写一封回信，推荐一个地方并说明理由。',
                samples: [
                    {
                        text: `Dear Zhang Wei,

I am glad to hear that you are planning a summer trip. I would highly recommend Yunnan Province as your destination.

Yunnan is known for its stunning natural landscapes, diverse ethnic cultures, and pleasant climate. You can visit the ancient town of Lijiang, explore the Tiger Leaping Gorge, and experience the unique customs of the Bai and Naxi people. The local cuisine, especially crossing-the-bridge noodles, is also not to be missed.

I suggest you allocate at least a week for the trip to fully enjoy the province's rich offerings. If you need any help with your itinerary, feel free to contact me.

Yours,
Li Ming`,
                        note: '范文结构清晰：首段直接推荐；中段从自然风光、民族文化、美食三个角度介绍；末段给出时间建议。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：直接推荐目的地',
                        '中段：从多个角度介绍推荐理由',
                        '末段：给出旅行建议，表示愿意帮助'
                    ],
                    commonPhrases: [
                        'I would highly recommend...as your destination.',
                        '...is known for...',
                        '...is also not to be missed.',
                        'I suggest you allocate...for the trip.'
                    ],
                    notes: '旅游推荐信要具体生动，激发对方兴趣。'
                }
            },
            partB: {
                title: '某高校学生旅游目的调查',
                translation: '根据以下饼状图写一篇约150词的短文。图表显示了某高校学生旅游目的的调查结果。',
                type: 'chart',
                samples: [
                    {
                        text: `The pie chart presents the results of a survey on the travel purposes of college students at a certain university. According to the data, appreciating scenery ranks first at 37%, followed by relieving stress at 33%. Making friends accounts for 20%, with other purposes taking up the remaining 10%.

The data reveals that the majority of students travel primarily for relaxation and enjoyment. This is understandable, given the academic pressure they face during the semester. Travel offers a valuable opportunity to unwind, explore new places, and broaden one's horizons.

Universities could consider organizing group travel programs or offering travel subsidies to encourage students to explore different regions. Such initiatives would not only help students relieve stress but also promote cultural exchange and personal growth.`,
                        note: '范文遵循"描述数据—分析原因—提出建议"的三段式结构。首段描述饼状图各项占比；中段分析学生旅游的动机；末段提出建议。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述饼状图各项占比及排名',
                        '中段：分析学生旅游动机',
                        '末段：提出建议'
                    ],
                    keyExpressions: [
                        'The pie chart presents the results of a survey on...',
                        'According to the data,...ranks first at...%',
                        'This is understandable, given...',
                        'Universities could consider...'
                    ],
                    notes: '饼状图作文注意数据描述要按排名进行，分析要结合学生群体特点。'
                }
            }
        },
        '2016-1': {
            partA: {
                title: '通知：关于图书馆服务改进',
                translation: '假设你是图书馆管理员，请写一份通知，告知读者图书馆服务的改进措施。',
                samples: [
                    {
                        text: `NOTICE

December 20, 2015

Improvements to Library Services

We are pleased to announce several improvements to our library services, effective from January 2016.

First, the library will extend its opening hours from 8:00 AM to 10:00 PM on weekdays, providing students with more study time. Second, we have added 200 new computers to the digital reading room to meet the growing demand for online resources. Third, a new mobile app has been launched, allowing readers to search for books, reserve study rooms, and check their borrowing records conveniently.

We welcome your feedback and suggestions. Please visit the library information desk or email us at library@university.edu.cn.

Library Administration`,
                        note: '范文采用通知格式，列出三项具体改进措施，信息完整明确。'
                    }
                ],
                tips: {
                    type: 'notice',
                    structure: [
                        '标题：NOTICE + 日期',
                        '首段：宣布改进措施及生效日期',
                        '中段：分点列出具体改进内容',
                        '末段：欢迎反馈，提供联系方式'
                    ],
                    commonPhrases: [
                        'We are pleased to announce...',
                        'effective from...',
                        'We welcome your feedback and suggestions.'
                    ],
                    notes: '服务改进通知要具体明确，列出可感知的变化。'
                }
            },
            partB: {
                title: '学生选课——实用 vs 兴趣',
                translation: '根据以下图画写一篇160-200词的短文。图画描绘了大学生选课时的两种不同态度。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture depicts two college students discussing their course selections. One student chooses courses based purely on practical considerations—whether the course is easy to pass and will help with future employment. The other student selects courses based on genuine interest and intellectual curiosity. This contrast reflects a common dilemma faced by university students.

In today's competitive society, many students prioritize practical outcomes over intellectual exploration. They view education as a means to secure employment rather than as an opportunity for personal growth. While practical considerations are understandable, an exclusively utilitarian approach to education may limit students' intellectual development and creativity.

I believe a balanced approach is ideal. Students should certainly consider their career goals when selecting courses, but they should also make room for courses that spark their curiosity and broaden their horizons. After all, the most fulfilling education is one that combines practical skills with a genuine love of learning.`,
                        note: '范文采用"描述图画—分析现象—表达观点"的结构。首段描述两种选课态度；中段分析功利选课的原因和弊端；末段提出平衡的建议。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：描述图画中的对比，点明选课主题',
                        '中段：分析功利选课的原因和弊端',
                        '末段：提出平衡的观点和建议'
                    ],
                    keyExpressions: [
                        'The picture depicts...',
                        'This contrast reflects a common dilemma...',
                        'While...are understandable,...',
                        'I believe a balanced approach is ideal.',
                        'After all,...'
                    ],
                    notes: '选课类图画作文是考研英语一常见主题，要注意辩证分析，不要完全否定功利性。'
                }
            }
        },
        '2015-2': {
            partA: {
                title: '回复教授关于参加学术会议的邀请邮件',
                translation: '假设你收到一封教授的邮件，邀请你参加一个学术研讨会。请写一封回信确认参加并询问细节。',
                samples: [
                    {
                        text: `Dear Professor Liu,

Thank you very much for inviting me to the seminar on sustainable development. I am delighted to confirm my attendance.

I would be grateful if you could provide me with some additional details. Specifically, I would like to know the exact date and venue of the seminar, as well as whether I need to prepare any materials in advance. I am also wondering if there will be an opportunity for participants to present their own research.

I am very much looking forward to this event and to the opportunity to learn from distinguished scholars like yourself.

Yours sincerely,
Li Ming`,
                        note: '范文简洁得体：首段致谢并确认参加；中段提出具体问题；末段表达期待。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：致谢，确认参加',
                        '中段：提出具体问题',
                        '末段：表达期待'
                    ],
                    commonPhrases: [
                        'Thank you very much for inviting me to...',
                        'I am delighted to confirm my attendance.',
                        'I would be grateful if you could...',
                        'I am very much looking forward to...'
                    ],
                    notes: '确认邮件注意：1）明确确认参加；2）问题要具体；3）语气要热情正式。'
                }
            },
            partB: {
                title: '居民春节假期花销比例',
                translation: '根据以下饼状图写一篇约150词的短文。图表显示了居民春节假期的主要花销比例。',
                type: 'chart',
                samples: [
                    {
                        text: `The pie chart illustrates how residents allocate their spending during the Spring Festival holiday. According to the data, New Year gifts and food take up the largest share at 40%, followed by transportation at 20%. Entertainment and cultural activities account for 15%, while clothing and other expenses make up the remaining 25%.

The data reflects the traditional importance of family reunions and social connections during the Spring Festival. The high proportion spent on gifts and food underscores the cultural significance of sharing meals and exchanging presents with family and friends. Transportation costs are also substantial, as many people travel long distances to return to their hometowns.

As living standards improve, it is likely that spending on entertainment and cultural activities will increase. This shift would reflect a more diversified approach to holiday celebrations, moving beyond purely traditional customs to include more leisure and recreational activities.`,
                        note: '范文遵循"描述数据—分析文化含义—展望趋势"的三段式结构。首段描述花销比例；中段分析春节消费的文化意义；末段展望趋势。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述饼状图各项花销比例',
                        '中段：分析消费结构的文化含义',
                        '末段：展望趋势或提出建议'
                    ],
                    keyExpressions: [
                        'The pie chart illustrates how...',
                        'According to the data,...take up the largest share at...%',
                        'The data reflects...',
                        'As living standards improve,...'
                    ],
                    notes: '春节消费类饼状图要注意结合文化背景分析，不要仅仅描述数据。'
                }
            }
        },
        '2015-1': {
            partA: {
                title: '给新入学的外国留学生写一封欢迎信',
                translation: '假设你是学生会主席，请给新入学的外国留学生写一封欢迎信。',
                samples: [
                    {
                        text: `Dear New International Students,

On behalf of the Student Union, I would like to extend a warm welcome to all of you who have joined our university this semester.

We understand that adjusting to a new country and a new academic environment can be challenging. To help you settle in, we have organized a series of orientation activities, including a campus tour, a cultural exchange party, and a Chinese language workshop. These events will take place during the first two weeks of the semester.

We also have a buddy program where each international student will be paired with a Chinese student who can help you with daily life and academic matters. If you are interested, please sign up at the Student Union Office.

We hope you will enjoy your time here and make the most of this exciting journey.

Student Union`,
                        note: '范文采用欢迎信格式，包含欢迎词、活动介绍和实用信息，热情友好。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：代表组织表示欢迎',
                        '中段：介绍帮助新生融入的活动和项目',
                        '末段：表达祝愿，提供联系方式'
                    ],
                    commonPhrases: [
                        'On behalf of..., I would like to extend a warm welcome...',
                        'We understand that...can be challenging.',
                        'To help you settle in,...',
                        'We hope you will enjoy your time here.'
                    ],
                    notes: '欢迎信要热情友好，提供实用的帮助信息。'
                }
            },
            partB: {
                title: '手机时代的聚会',
                translation: '根据以下图画写一篇160-200词的短文。图画描绘了人们在聚会时各自玩手机的场景。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture depicts a thought-provoking scene: a group of friends are sitting together at a dinner table, yet each one is absorbed in their smartphone, barely acknowledging the presence of others. The irony is striking—they are physically together but mentally in different worlds.

This phenomenon has become increasingly common in the smartphone era. While technology has made it easier to connect with distant friends, it has paradoxically weakened our connections with those sitting right beside us. The constant urge to check notifications, scroll through social media, and respond to messages has eroded the quality of face-to-face interactions.

We should be mindful of the impact of technology on our relationships. True connection requires our full presence and attention. The next time you are at a gathering, consider putting your phone away and engaging fully with the people around you. After all, the most meaningful moments are those shared with others, not with screens.`,
                        note: '范文采用"描述图画—分析现象—提出建议"的结构。首段描述图画中的讽刺场景；中段分析手机对人际关系的影响；末段提出建议。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：描述图画中的讽刺场景',
                        '中段：分析手机对社交的影响',
                        '末段：提出建议，呼吁回归真实交流'
                    ],
                    keyExpressions: [
                        'The picture depicts a thought-provoking scene...',
                        'The irony is striking...',
                        'This phenomenon has become increasingly common...',
                        'We should be mindful of...',
                        'After all,...'
                    ],
                    notes: '手机/科技类图画作文是考研英语一常见主题，要注意辩证分析，不要完全否定科技。'
                }
            }
        },
        '2014-2': {
            partA: {
                title: '回复教授关于论文进展的邮件',
                translation: '假设你的导师来信询问论文进展。请写一封回信，汇报进展并寻求指导。',
                samples: [
                    {
                        text: `Dear Professor Wang,

Thank you for your email. I am writing to update you on my thesis progress.

I have completed the literature review and the first draft of the methodology section. Currently, I am working on data collection through surveys and interviews. I expect to finish the data analysis by the end of next month.

However, I have encountered some difficulties with the statistical analysis. I would be very grateful if you could spare some time to discuss this with me. Could we arrange a meeting at your convenience?

Thank you for your continued guidance.

Yours sincerely,
Li Ming`,
                        note: '范文简洁明了：首段说明目的；中段汇报进展；末段提出具体问题并请求指导。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：致谢，说明写信目的',
                        '中段：汇报进展情况',
                        '末段：提出问题，请求指导'
                    ],
                    commonPhrases: [
                        'I am writing to update you on...',
                        'I have completed...Currently, I am working on...',
                        'I would be very grateful if you could...',
                        'Could we arrange a meeting at your convenience?'
                    ],
                    notes: '论文进展汇报要具体，问题要明确。'
                }
            },
            partB: {
                title: '城镇化与乡村人口变化',
                translation: '根据以下柱状图写一篇约150词的短文。图表显示了中国城镇化率和乡村人口的变化趋势。',
                type: 'chart',
                samples: [
                    {
                        text: `The bar chart illustrates the changes in China's urbanization rate and rural population over a certain period. As can be seen, the urbanization rate has been steadily increasing, while the rural population has been declining correspondingly.

This trend reflects the rapid pace of China's urbanization process. Millions of people have migrated from rural areas to cities in search of better employment opportunities, education, and living conditions. While urbanization brings economic growth and improved infrastructure, it also poses challenges such as overcrowding in cities and the decline of rural communities.

To address these challenges, the government should implement balanced development policies that promote rural revitalization while supporting sustainable urban growth. This would help ensure that the benefits of modernization are shared by all citizens, regardless of where they live.`,
                        note: '范文遵循"描述数据—分析原因—提出建议"的三段式结构。首段描述城镇化趋势；中段分析原因和挑战；末段提出政策建议。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述图表中的变化趋势',
                        '中段：分析原因和带来的挑战',
                        '末段：提出政策建议'
                    ],
                    keyExpressions: [
                        'The bar chart illustrates...',
                        'As can be seen,...',
                        'This trend reflects...',
                        'To address these challenges,...'
                    ],
                    notes: '城镇化类图表作文要注意辩证分析利弊。'
                }
            }
        },
        '2014-1': {
            partA: {
                title: '给外国留学生推荐中国文化的建议信',
                translation: '假设你的外国朋友想了解中国文化，请写一封邮件推荐一部中国电影或一本书。',
                samples: [
                    {
                        text: `Dear Tom,

I am glad to hear that you are interested in Chinese culture. I would like to recommend the film "The Farewell My Concubine" directed by Chen Kaige.

This film is widely regarded as a masterpiece of Chinese cinema. It tells the story of two Peking Opera performers whose lives span several decades of tumultuous Chinese history. Through their personal struggles, the film beautifully captures the essence of traditional Chinese art and the impact of historical change on individual lives.

I believe watching this film will give you a deeper understanding of Chinese history, art, and the complexity of human relationships in Chinese society. I hope you enjoy it!

Yours,
Li Ming`,
                        note: '范文结构清晰：首段引入推荐；中段详细介绍影片内容和文化价值；末段说明推荐理由。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：引入话题，直接推荐',
                        '中段：介绍推荐对象的内容和文化价值',
                        '末段：说明推荐理由，表达祝愿'
                    ],
                    commonPhrases: [
                        'I would like to recommend...',
                        'This...is widely regarded as...',
                        'I believe...will give you a deeper understanding of...',
                        'I hope you enjoy it!'
                    ],
                    notes: '文化推荐信要突出推荐对象的文化价值和意义。'
                }
            },
            partB: {
                title: '相携——三十年前与三十年后',
                translation: '根据以下图画写一篇160-200词的短文。图画描绘了三十年前母亲牵着孩子的手，三十年后孩子搀扶着年迈母亲的场景。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture presents a deeply moving contrast between the past and the present. On the left, a young mother holds her child's hand as they walk together, symbolizing the care and protection parents provide during childhood. On the right, now grown up, the child supports their elderly mother, reflecting the reversal of roles as parents age.

This image beautifully illustrates the Chinese value of filial piety—the duty of children to care for their aging parents. In Chinese culture, family bonds are considered the foundation of society, and the relationship between parents and children is one of the most sacred connections. The picture reminds us that the love and sacrifice our parents give us should be returned with gratitude and devotion.

As the saying goes, "The tree desires stillness, but the wind will not stop; the son wishes to care, but his parents may not wait." We should cherish every moment with our parents and fulfill our responsibility to care for them, just as they once cared for us.`,
                        note: '范文采用"描述图画—分析文化含义—引用名言"的结构。首段描述三十年前后的对比；中段分析孝道的文化意义；末段引用"树欲静而风不止"的古训，情感深刻。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：描述图画中的时间对比',
                        '中段：分析孝道的文化意义',
                        '末段：引用名言，呼吁践行孝道'
                    ],
                    keyExpressions: [
                        'The picture presents a deeply moving contrast...',
                        'This image beautifully illustrates...',
                        'In Chinese culture,...',
                        'As the saying goes,...',
                        'We should cherish every moment with...'
                    ],
                    notes: '亲情类图画作文是考研英语一高频主题，要注意情感真挚，引用恰当。'
                }
            }
        },
        '2013-2': {
            partA: {
                title: '回复同学关于兼职工作的建议邮件',
                translation: '假设你的同学来信询问是否应该在大学期间做兼职。请写一封回信，给出建议。',
                samples: [
                    {
                        text: `Dear Li Hua,

I am glad to receive your email. Regarding your question about whether to take a part-time job during college, I would like to share my thoughts.

I think taking a part-time job can be beneficial, but it should not interfere with your studies. On the one hand, part-time work can help you gain practical experience, develop communication skills, and earn some extra income. On the other hand, if it takes too much time away from your academic work, it may affect your grades.

My suggestion is to find a job that is related to your major and requires no more than 15 hours per week. This way, you can balance work and study effectively.

I hope this helps!

Yours,
Li Ming`,
                        note: '范文采用辩证分析的方式：首段引入话题；中段分析利弊；末段给出具体建议。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：引入话题',
                        '中段：分析利弊（正反两面）',
                        '末段：给出具体建议'
                    ],
                    commonPhrases: [
                        'Regarding your question about...,...',
                        'On the one hand,... On the other hand,...',
                        'My suggestion is to...',
                        'I hope this helps!'
                    ],
                    notes: '建议信要辩证分析，给出具体可操作的建议。'
                }
            },
            partB: {
                title: '做兼职的大学生比例变化',
                translation: '根据以下柱状图写一篇约150词的短文。图表显示了某高校各年级做兼职的大学生比例。',
                type: 'chart',
                samples: [
                    {
                        text: `The bar chart presents the proportion of college students taking part-time jobs at different grade levels. According to the data, the percentage rises steadily from freshmen to seniors, with freshmen at 67.77% and seniors reaching 88.24%.

The upward trend may be explained by several factors. First, as students progress through college, they become more aware of the importance of practical experience for their future careers. Second, senior students have more flexible schedules, allowing them to dedicate more time to part-time work. Third, the pressure of finding employment after graduation motivates students to seek work experience earlier.

While part-time work offers valuable opportunities for personal growth, students should ensure that it does not compromise their academic performance. A balanced approach that prioritizes studies while gaining practical experience would be most beneficial.`,
                        note: '范文遵循"描述数据—分析原因—提出建议"的三段式结构。首段描述各年级比例；中段分析上升趋势的原因；末段提出平衡建议。'
                    }
                ],
                tips: {
                    type: 'chart',
                    structure: [
                        '首段：描述柱状图数据',
                        '中段：分析趋势原因',
                        '末段：提出建议'
                    ],
                    keyExpressions: [
                        'The bar chart presents...',
                        'The upward trend may be explained by...',
                        'While...offers valuable opportunities,...',
                        'A balanced approach would be most beneficial.'
                    ],
                    notes: '柱状图作文要分析趋势背后的深层原因。'
                }
            }
        },
        '2013-1': {
            partA: {
                title: '邀请外国教授参加毕业典礼的邮件',
                translation: '假设你要邀请一位外国教授参加你的毕业典礼。请写一封邮件。',
                samples: [
                    {
                        text: `Dear Professor Brown,

I hope this email finds you well. I am writing to invite you to my graduation ceremony, which will be held on July 5th at the university auditorium.

Your guidance and support throughout my academic journey have been invaluable. It would be a great honor to have you present on this special occasion. The ceremony will begin at 9:00 AM and will be followed by a reception.

I sincerely hope you will be able to attend. Please let me know at your earliest convenience.

Yours sincerely,
Li Ming`,
                        note: '范文简洁得体：首段说明目的；中段表达感激并介绍典礼信息；末段表达期待。'
                    }
                ],
                tips: {
                    type: 'email',
                    structure: [
                        '首段：说明写信目的（邀请）',
                        '中段：表达感激，介绍活动信息',
                        '末段：表达期待，请对方回复'
                    ],
                    commonPhrases: [
                        'I am writing to invite you to...',
                        'It would be a great honor to have you present...',
                        'I sincerely hope you will be able to attend.',
                        'Please let me know at your earliest convenience.'
                    ],
                    notes: '邀请信要表达真诚的邀请意愿，提供必要的活动信息。'
                }
            },
            partB: {
                title: '习惯——专注与拖延',
                translation: '根据以下图画写一篇160-200词的短文。图画描绘了两种不同的学习习惯。',
                type: 'picture',
                samples: [
                    {
                        text: `The picture contrasts two students with vastly different study habits. On the left, a female student sits at her desk, focused and diligent, completing her assignments well before the deadline. On the right, a male student lies lazily on his bed, procrastinating until the last minute. The difference in their attitudes is striking.

This contrast highlights the importance of self-discipline in academic success. Students who manage their time effectively and maintain consistent study habits tend to perform better and experience less stress. In contrast, procrastinators often find themselves overwhelmed by last-minute cramming, leading to poor performance and unnecessary anxiety.

Developing good study habits requires effort and commitment. We should set clear goals, create realistic schedules, and hold ourselves accountable. As the saying goes, "A journey of a thousand miles begins with a single step." Starting today, let us cultivate the discipline needed to achieve our academic aspirations.`,
                        note: '范文采用"描述对比—分析影响—提出建议"的结构。首段描述两种学习习惯的对比；中段分析自律的重要性；末段提出培养好习惯的建议。'
                    }
                ],
                tips: {
                    type: 'picture',
                    structure: [
                        '首段：描述图画中的对比',
                        '中段：分析自律/习惯的重要性',
                        '末段：提出培养好习惯的建议'
                    ],
                    keyExpressions: [
                        'The picture contrasts...',
                        'This contrast highlights the importance of...',
                        'In contrast,...',
                        'As the saying goes,...'
                    ],
                    notes: '学习习惯类图画作文是考研英语一常见主题，要注意结合实际给出具体建议。'
                }
            }
        },
        '2012-2': {
            partA: {
                title: '回复同学关于英语学习的建议邮件',
                translation: '假设你的同学来信询问如何提高英语水平。请写一封回信给出建议。',
                samples: [{ text: `Dear Wang Ming,\n\nI am glad to receive your email. Here are some suggestions for improving your English.\n\nFirst, I recommend reading English newspapers and magazines regularly, such as The Economist or China Daily. This will help you expand your vocabulary and improve your reading comprehension. Second, try to watch English movies or TV shows with subtitles, which can enhance your listening skills. Third, practice speaking with your classmates or join an English corner to build your confidence.\n\nConsistency is key. Even 30 minutes of daily practice can make a significant difference over time.\n\nYours,\nLi Ming`, note: '范文从阅读、听力、口语三个方面给出具体建议，实用性强。' }],
                tips: { type: 'email', structure: ['首段：引入话题', '中段：分点给出建议', '末段：强调坚持的重要性'], commonPhrases: ['Here are some suggestions for...', 'I recommend...', 'Consistency is key.'], notes: '学习建议要具体可操作。' }
            },
            partB: {
                title: '某公司员工工作满意度调查',
                translation: '根据图表写一篇约150词的短文。',
                type: 'chart',
                samples: [{ text: `The chart presents the results of a survey on job satisfaction among employees at a certain company. According to the data, 50% of employees expressed satisfaction with their jobs, while 30% felt neutral and 20% reported dissatisfaction.\n\nThe fact that half of the employees are satisfied suggests that the company has created a generally positive work environment. However, the 20% dissatisfaction rate indicates room for improvement. Common factors affecting job satisfaction include salary, work-life balance, career development opportunities, and workplace relationships.\n\nTo improve overall satisfaction, the company should consider conducting regular feedback sessions, offering competitive compensation packages, and providing clear career advancement paths. Addressing these areas would likely boost morale and productivity across the organization.`, note: '范文遵循"描述数据—分析原因—提出建议"的结构。' }],
                tips: { type: 'chart', structure: ['首段：描述调查数据', '中段：分析满意度因素', '末段：提出改进建议'], keyExpressions: ['The chart presents the results of...', 'According to the data,...', 'To improve...,...'], notes: '调查类图表作文要分析深层原因。' }
            }
        },
        '2012-1': {
            partA: {
                title: '回复留学生关于中国节日的邮件',
                translation: '假设你的外国朋友来信询问中国的传统节日。请写一封回信介绍一个节日。',
                samples: [{ text: `Dear Jack,\n\nI am glad to hear that you are interested in Chinese festivals. I would like to introduce the Mid-Autumn Festival to you.\n\nThe Mid-Autumn Festival falls on the 15th day of the eighth lunar month. It is a time for family reunions. People gather to admire the full moon and eat mooncakes, which symbolize completeness and togetherness. The festival has a history of over 3,000 years and is associated with the legend of Chang'e, the moon goddess.\n\nI hope you will have the chance to experience this wonderful festival someday.\n\nYours,\nLi Ming`, note: '范文简洁介绍了中秋节的时间、习俗和文化含义。' }],
                tips: { type: 'email', structure: ['首段：引入话题', '中段：介绍节日的时间、习俗和文化含义', '末段：表达祝愿'], commonPhrases: ['I would like to introduce...', 'It is a time for...', 'I hope you will have the chance to...'], notes: '节日介绍要包含时间、习俗和文化意义。' }
            },
            partB: {
                title: '乐观与悲观',
                translation: '根据图画写一篇160-200词的短文，描绘面对同一事物的不同态度。',
                type: 'picture',
                samples: [{ text: `The picture illustrates two contrasting attitudes toward the same situation. One person sees a half-empty glass and feels disappointed, while the other sees a half-full glass and feels grateful. This simple yet powerful image conveys an important message: our attitude determines our experience of life.\n\nOptimism and pessimism shape how we interpret events and respond to challenges. Optimistic people tend to focus on opportunities and solutions, while pessimistic individuals dwell on problems and obstacles. Research has shown that optimistic people are generally healthier, more successful, and more resilient in the face of adversity.\n\nCultivating a positive mindset is not about ignoring reality but about choosing to focus on possibilities. As Winston Churchill once said, "A pessimist sees the difficulty in every opportunity; an optimist sees the opportunity in every difficulty." Let us choose to see the glass as half full.`, note: '范文采用"描述图画—分析对比—引用名言"的结构，论证有力。' }],
                tips: { type: 'picture', structure: ['首段：描述图画中的对比', '中段：分析乐观与悲观的影响', '末段：引用名言，呼吁积极心态'], keyExpressions: ['The picture illustrates two contrasting attitudes...', 'Research has shown that...', 'As...once said,...'], notes: '心态类图画作文要辩证分析，引用名言增强说服力。' }
            }
        },
        '2011-2': {
            partA: {
                title: '回复同学关于报考研究生的建议邮件',
                translation: '假设你的同学来信询问是否应该报考研究生。请写一封回信给出建议。',
                samples: [{ text: `Dear Li Hua,\n\nThank you for your email. Regarding your question about whether to pursue a postgraduate degree, I would like to share my perspective.\n\nI think the decision depends on your career goals. If you aspire to work in academia or research, a postgraduate degree is essential. However, if you plan to enter the job market immediately, gaining practical work experience may be more beneficial in the short term.\n\nMy suggestion is to carefully consider your long-term goals and consult with professionals in your field of interest. Whatever you decide, make sure it aligns with your passions and aspirations.\n\nYours,\nLi Ming`, note: '范文辩证分析，给出个性化建议。' }],
                tips: { type: 'email', structure: ['首段：引入话题', '中段：辩证分析利弊', '末段：给出个性化建议'], commonPhrases: ['Regarding your question about...,...', 'I think the decision depends on...', 'Whatever you decide,...'], notes: '建议要个性化，不要一刀切。' }
            },
            partB: {
                title: '汽车品牌市场份额调查',
                translation: '根据饼状图写一篇约150词的短文。',
                type: 'chart',
                samples: [{ text: `The pie chart illustrates the market share of different car brands in a certain region. Brand A leads with 35%, followed by Brand B at 25% and Brand C at 20%. Other brands collectively account for the remaining 20%.\n\nThe dominance of Brand A may be attributed to its strong reputation for reliability and after-sales service. Brand B and Brand C have carved out their niches through competitive pricing and innovative features respectively.\n\nAs the automotive market becomes increasingly competitive, brands must continue to innovate and adapt to changing consumer preferences. Those that prioritize quality, sustainability, and customer experience will be best positioned to maintain or expand their market share.`, note: '范文描述数据，分析原因，提出展望。' }],
                tips: { type: 'chart', structure: ['首段：描述饼状图数据', '中段：分析品牌优势', '末段：展望市场趋势'], keyExpressions: ['The pie chart illustrates...', 'The dominance of...may be attributed to...', 'As...becomes increasingly competitive,...'], notes: '市场份额类图表要分析品牌竞争力。' }
            }
        },
        '2011-1': {
            partA: {
                title: '推荐一部电影给外国朋友',
                translation: '假设你的外国朋友想看一部中国电影。请写一封邮件推荐。',
                samples: [{ text: `Dear David,\n\nI am glad to hear that you are interested in Chinese films. I would like to recommend "Farewell My Concubine" directed by Chen Kaige.\n\nThis film tells the story of two Peking Opera performers whose lives span several decades of Chinese history. It beautifully captures the essence of traditional Chinese art and the impact of historical change on individual lives. The performances are outstanding, and the cinematography is breathtaking.\n\nI believe this film will give you a deeper understanding of Chinese culture and history. I hope you enjoy it!\n\nYours,\nLi Ming`, note: '范文简洁介绍了影片内容和文化价值。' }],
                tips: { type: 'email', structure: ['首段：引入推荐', '中段：介绍影片内容', '末段：说明推荐理由'], commonPhrases: ['I would like to recommend...', 'I believe...will give you a deeper understanding of...'], notes: '电影推荐要突出文化价值。' }
            },
            partB: {
                title: '旅途之"余"——旅游与环保',
                translation: '根据图画写一篇160-200词的短文。图画描绘了游客在游船上往湖中乱扔垃圾的场景，湖面漂浮着各种废弃物，反映了旅游中的环保问题。',
                type: 'picture',
                samples: [{ text: `The picture vividly depicts a thought-provoking scene on a sightseeing boat. Two young tourists are casually throwing rubbish into the lake, while all kinds of garbage—plastic bottles, food wrappers, and fish bones—float on the surface. The caption reads: "The 'leftovers' of the journey." This image serves as a stark reminder of the environmental damage caused by irresponsible tourist behavior.\n\nIn recent years, with the rapid development of tourism, an increasing number of people choose to travel during holidays. However, while enjoying the beautiful scenery, some travelers lack environmental awareness and casually litter in scenic areas. This not only spoils the natural beauty but also poses a serious threat to the ecological environment. Rivers, lakes, and mountains are being polluted by thoughtless visitors, turning once-pristine landscapes into dumping grounds.\n\nTo address this issue, joint efforts are needed. On the one hand, the government and scenic area authorities should strengthen environmental education and impose stricter penalties for littering. On the other hand, every tourist should cultivate a sense of environmental responsibility and take their trash away with them. As the saying goes, "Take nothing but memories, leave nothing but footprints." Only by working together can we ensure that future generations can also enjoy the beauty of nature.`, note: '范文采用"描述图画—分析问题—提出建议"的结构，层层递进，引用名言呼吁环保。' }],
                tips: { type: 'picture', structure: ['首段：描述图画中的游客乱扔垃圾场景', '中段：分析旅游环保问题的严重性', '末段：提出建议，引用名言呼吁'], keyExpressions: ['The picture vividly depicts...', 'This image serves as a stark reminder of...', 'To address this issue, joint efforts are needed.', 'Take nothing but memories, leave nothing but footprints.'], notes: '环保类图画作文要突出问题的严重性和解决的必要性，引用名言增强说服力。' }
            }
        },
        '2010-2': {
            partA: {
                title: '回复教授关于课程安排的邮件',
                translation: '假设你的教授来信询问课程安排的建议。请写一封回信。',
                samples: [{ text: `Dear Professor Zhang,\n\nThank you for your email. I am writing to share my thoughts on the course schedule.\n\nI would suggest scheduling the lecture on Wednesday afternoons, as most students are free during that time. Additionally, it would be helpful to have a tutorial session on Fridays for students to discuss the lecture content and ask questions.\n\nI hope these suggestions are helpful. Please let me know if you need any further input.\n\nYours sincerely,\nLi Ming`, note: '范文简洁明了，给出具体的时间安排建议。' }],
                tips: { type: 'email', structure: ['首段：致谢', '中段：给出建议', '末段：表示愿意进一步帮助'], commonPhrases: ['I would suggest...', 'I hope these suggestions are helpful.'], notes: '建议要具体可行。' }
            },
            partB: {
                title: '手机用户增长',
                translation: '根据图表写一篇约150词的短文。',
                type: 'chart',
                samples: [{ text: `The chart illustrates the growth of mobile phone users in both developed and developing countries over a certain period. As can be seen, developing countries have experienced a more dramatic increase in mobile phone adoption compared to developed countries.\n\nThis trend reflects the rapid technological advancement and economic growth in developing nations. Mobile phones have become essential tools for communication, commerce, and access to information, particularly in areas where traditional infrastructure is limited.\n\nThe narrowing gap between developed and developing countries in mobile phone usage is a positive sign of global technological convergence. It suggests that technology is playing an increasingly important role in bridging the development divide.`, note: '范文描述数据，分析原因，展望趋势。' }],
                tips: { type: 'chart', structure: ['首段：描述数据趋势', '中段：分析原因', '末段：展望趋势'], keyExpressions: ['The chart illustrates...', 'This trend reflects...', 'The narrowing gap is a positive sign of...'], notes: '对比类图表要突出差异和趋势。' }
            }
        },
        '2010-1': {
            partA: {
                title: '通知：国际会议志愿者招募',
                translation: '假设你是学生会主席，请写一份通知招募国际会议志愿者。',
                samples: [{ text: `NOTICE\n\nJanuary 10, 2010\n\nVolunteers Wanted\n\nThe 3rd International Conference on Environmental Science will be held at our university from February 20th to 22nd. We are recruiting 20 student volunteers to assist with the event.\n\nVolunteers should have good English communication skills and a strong sense of responsibility. Duties include guiding participants, providing translation services, and assisting with registration.\n\nInterested students please submit your applications to the Student Union Office before January 20th.\n\nStudent Union`, note: '范文格式规范，信息完整。' }],
                tips: { type: 'notice', structure: ['标题+日期', '招募目的和人数', '职责和要求', '报名方式和截止日期'], commonPhrases: ['We are recruiting...volunteers to...', 'Interested students please submit...'], notes: '招募通知要信息完整。' }
            },
            partB: {
                title: '文化火锅——文化融合',
                translation: '根据图画写一篇160-200词的短文。图画描绘了一个"文化火锅"，融合了中西方文化元素。',
                type: 'picture',
                samples: [{ text: `The picture depicts a "cultural hotpot" containing various elements of both Chinese and Western culture—Confucius, Shakespeare, kung fu, ballet, Chinese medicine, Western science, and many others. This creative image conveys a clear message: cultural exchange and integration are essential for a vibrant and dynamic society.\n\nIn today's globalized world, no culture can develop in isolation. The blending of different cultural traditions enriches our lives and broadens our horizons. Chinese culture has absorbed many valuable elements from other civilizations throughout history, and this openness has been a key factor in its enduring vitality.\n\nHowever, cultural integration should not mean the loss of one's own cultural identity. We should embrace the best of both worlds while preserving the unique characteristics of Chinese culture. As the saying goes, "It is not the strongest of the species that survives, but the one most responsive to change."`, note: '范文描述"文化火锅"的丰富元素，分析文化融合的意义，强调保持文化自信。' }],
                tips: { type: 'picture', structure: ['首段：描述图画内容', '中段：分析文化融合的意义', '末段：强调保持文化自信'], keyExpressions: ['The picture depicts...', 'In today\'s globalized world,...', 'We should embrace the best of both worlds while...'], notes: '文化融合类图画作文要辩证分析，既肯定开放又强调自信。' }
            }
        },
        '2009-1': {
            partB: {
                title: '网络的"近"与"远"',
                translation: '根据图画写一篇160-200词的短文。图画描绘了人们通过网络连接但实际距离很远的场景。',
                type: 'picture',
                samples: [{ text: `The picture presents a thought-provoking scene: a group of people are sitting in separate rooms, each facing a computer screen, connected by the internet yet physically isolated from one another. The image highlights the paradox of modern technology—while the internet brings people closer virtually, it may also increase real-world distance between individuals.\n\nOn the one hand, the internet has revolutionized communication, allowing people to connect with friends and family across the globe instantly. Social media platforms, video calls, and messaging apps have made it easier than ever to maintain relationships regardless of physical distance. On the other hand, excessive reliance on virtual communication can weaken face-to-face interactions and lead to feelings of isolation and loneliness.\n\nThe key is to strike a balance between online and offline interactions. Technology should serve as a tool to enhance, not replace, genuine human connections. We should make conscious efforts to spend quality time with the people around us and nurture meaningful relationships in the real world.`, note: '范文辩证分析了网络的利弊，提出平衡建议。' }],
                tips: { type: 'picture', structure: ['首段：描述图画中的矛盾', '中段：辩证分析网络的利弊', '末段：提出平衡建议'], keyExpressions: ['The picture presents a thought-provoking scene...', 'On the one hand,... On the other hand,...', 'The key is to strike a balance...'], notes: '科技类图画作文要辩证分析，不要片面。' }
            }
        },
        '2008-1': {
            partB: {
                title: '合作——你一条腿，我一条腿',
                translation: '根据图画写一篇160-200词的短文。图画描绘了两个人互相合作、一起前行的场景。',
                type: 'picture',
                samples: [{ text: `The picture depicts two disabled men who have lost one leg each. By supporting each other, they are able to walk together as if they were a complete person. This powerful image conveys a simple yet profound message: cooperation and mutual support can help us overcome individual limitations.\n\nIn today's increasingly interconnected world, cooperation has become more important than ever. No individual, organization, or nation can solve complex problems alone. Whether it is addressing climate change, fighting disease, or promoting economic development, collaboration is essential for success.\n\nThis picture also reminds us that everyone has strengths and weaknesses. By working together and complementing each other's abilities, we can achieve far more than we could individually. As the saying goes, "United we stand, divided we fall." Let us embrace the spirit of cooperation in all aspects of our lives.`, note: '范文描述图画中的合作精神，分析合作的重要性，引用名言升华主题。' }],
                tips: { type: 'picture', structure: ['首段：描述图画内容', '中段：分析合作的重要性', '末段：引用名言，呼吁合作'], keyExpressions: ['The picture depicts...', 'This powerful image conveys...', 'As the saying goes,...'], notes: '合作类图画作文要强调团队精神。' }
            }
        },
        '2007-1': {
            partB: {
                title: '自信——射门的那一刻',
                translation: '根据图画写一篇160-200词的短文。图画描绘了足球场上射门的场景，表达自信的重要性。',
                type: 'picture',
                samples: [{ text: `The picture depicts a dramatic moment in a football match: a striker is about to take a shot at the goal, while the goalkeeper stands ready to defend. Interestingly, the striker imagines himself as a giant, full of confidence, while the goalkeeper imagines himself as tiny and insignificant. This image powerfully illustrates the role of self-confidence in achieving success.\n\nSelf-confidence is a crucial factor in determining our performance. When we believe in our abilities, we are more likely to take risks, persist through challenges, and ultimately succeed. Conversely, self-doubt can paralyze us, preventing us from reaching our full potential.\n\nHowever, confidence should be grounded in preparation and competence. Blind confidence without adequate preparation is merely arrogance. True self-confidence comes from knowing that you have put in the effort and are ready to face whatever challenges come your way. As the saying goes, "Fortune favors the bold."`, note: '范文描述图画中的心理对比，分析自信的重要性，强调自信需以 preparation 为基础。' }],
                tips: { type: 'picture', structure: ['首段：描述图画中的心理对比', '中段：分析自信的重要性', '末段：辩证看待自信与准备的关系'], keyExpressions: ['The picture depicts a dramatic moment...', 'Self-confidence is a crucial factor...', 'However, confidence should be grounded in...'], notes: '自信类图画作文要辩证分析，避免盲目自信。' }
            }
        },
        '2006-1': {
            partB: {
                title: '偶像崇拜',
                translation: '根据图画写一篇160-200词的短文。图画描绘了年轻人追星的场景。',
                type: 'picture',
                samples: [{ text: `The picture depicts a humorous yet thought-provoking scene: a young man has had his hair styled to look exactly like his favorite celebrity, complete with the same hairstyle and accessories. While the young man seems proud of his new look, others around him look on with a mixture of amusement and bewilderment.\n\nThis image reflects the phenomenon of celebrity worship, which has become increasingly prevalent among young people. While it is natural to admire talented individuals, excessive idolization can lead to a loss of personal identity and independent thinking. Young people who blindly imitate their idols may neglect their own unique qualities and potential.\n\nA healthier approach is to admire celebrities for their achievements and positive qualities while maintaining one's own individuality. We should be inspired by the hard work and dedication of successful people, rather than merely copying their appearance. True admiration lies in learning from others' strengths and applying them to our own lives.`, note: '范文描述图画中的追星现象，分析偶像崇拜的利弊，提出理性追星的建议。' }],
                tips: { type: 'picture', structure: ['首段：描述图画场景', '中段：分析偶像崇拜现象', '末段：提出理性追星的建议'], keyExpressions: ['The picture depicts a humorous yet thought-provoking scene...', 'This image reflects the phenomenon of...', 'A healthier approach is to...'], notes: '社会现象类图画作文要辩证分析，提出建设性意见。' }
            }
        },
        '2005-1': {
            partB: {
                title: '养老"足球赛"',
                translation: '根据图画写一篇160-200词的短文。图画描绘了子女互相推卸赡养老人责任的场景。',
                type: 'picture',
                samples: [{ text: `The picture depicts a disturbing scene: four adult children are playing a "football match" with their elderly father as the ball. Each child kicks the old man toward the others, refusing to take responsibility for his care. This satirical image highlights the problem of elder neglect in modern society.\n\nIn Chinese culture, filial piety has always been considered a fundamental virtue. However, as society becomes more materialistic and individualistic, some people have begun to shirk their responsibility to care for aging parents. This is not only morally wrong but also socially harmful, as it undermines the traditional family values that have sustained Chinese society for thousands of years.\n\nWe must remember that our parents sacrificed much to raise us. Caring for them in their old age is not merely a duty but a privilege. Let us honor our parents and ensure that they spend their twilight years with dignity and love. As the saying goes, "A tree may grow a thousand feet high, but its leaves will always return to their roots."`, note: '范文描述图画中的讽刺场景，分析养老问题的社会根源，引用古训呼吁孝道。' }],
                tips: { type: 'picture', structure: ['首段：描述图画中的讽刺场景', '中段：分析问题的社会根源', '末段：引用名言，呼吁孝道'], keyExpressions: ['The picture depicts a disturbing scene...', 'In Chinese culture,...', 'As the saying goes,...'], notes: '社会责任类图画作文要情感真挚，引用恰当。' }
            }
        },
        '2004-1': {
            partB: {
                title: '终点又是新起点',
                translation: '根据图画写一篇160-200词的短文。图画描绘了一个人到达终点后又面临新起点的场景。',
                type: 'picture',
                samples: [{ text: `The picture illustrates a runner who has just crossed a finish line, only to discover that it is also a new starting point ahead. The image conveys a profound message: in life, every ending marks a new beginning, and success is not a final destination but a continuous journey.\n\nThis idea is particularly relevant in today's fast-paced world, where change is the only constant. Those who rest on their laurels after achieving a goal risk being left behind. Instead, we should view each accomplishment as a stepping stone to greater heights. The pursuit of excellence is an ongoing process that requires constant effort and adaptation.\n\nAs students, we should embrace this mindset. Whether it is passing an exam, graduating from university, or landing a job, each milestone is merely a checkpoint on a longer journey. Let us celebrate our achievements briefly, then set our sights on new horizons. As T.S. Eliot wrote, "What we call the beginning is often the end. And to make an end is to make a beginning."`, note: '范文描述图画中的起点与终点关系，分析持续进步的重要性，引用名言升华主题。' }],
                tips: { type: 'picture', structure: ['首段：描述图画中的哲理', '中段：分析持续进步的重要性', '末段：引用名言，联系实际'], keyExpressions: ['The picture illustrates...', 'This idea is particularly relevant in...', 'As...wrote,...'], notes: '哲理类图画作文要深入分析，引用名言增强说服力。' }
            }
        },
        '2003-1': {
            partB: {
                title: '温室花朵经不起风雨',
                translation: '根据图画写一篇160-200词的短文。图画描绘了温室中的花朵在风雨中凋零的场景。',
                type: 'picture',
                samples: [{ text: `The picture presents two contrasting images. In the first, a flower grows beautifully in a greenhouse, protected from harsh weather. In the second, the same flower, once removed from the greenhouse and exposed to a storm, withers and dies. This powerful metaphor conveys an important warning: those who are overprotected cannot withstand challenges.\n\nThis is particularly relevant to the education of young people. Parents who shield their children from all difficulties may inadvertently weaken their ability to cope with adversity. Just as plants need exposure to wind and rain to develop strong roots, young people need to face challenges and overcome obstacles to build resilience and character.\n\nThe solution is not to eliminate all protection but to gradually prepare young people for the realities of life. We should provide guidance and support while allowing them to experience setbacks and learn from their mistakes. Only through this balanced approach can we cultivate individuals who are capable of thriving in an unpredictable world.`, note: '范文描述图画中的对比，分析过度保护的危害，提出平衡教育的建议。' }],
                tips: { type: 'picture', structure: ['首段：描述图画中的对比', '中段：分析过度保护的危害', '末段：提出平衡教育的建议'], keyExpressions: ['The picture presents two contrasting images...', 'This is particularly relevant to...', 'The solution is not to...but to...'], notes: '教育类图画作文要结合实际，提出建设性意见。' }
            }
        },
        '2002-1': {
            partB: {
                title: '中国女孩与美国女孩——文化融合',
                translation: '根据图画写一篇160-200词的短文。图画描绘了一个穿着中国传统服饰的外国女孩。',
                type: 'picture',
                samples: [{ text: `The picture depicts a young American girl dressed in traditional Chinese clothing, smiling happily. She is wearing a Chinese silk dress with delicate embroidery and holding a Chinese fan. This image symbolizes the growing cultural exchange between China and the world.\n\nIn today's globalized world, cultural boundaries are becoming increasingly blurred. People from different countries are embracing each other's traditions and customs with enthusiasm. This exchange is mutually beneficial: it promotes mutual understanding and respect, and enriches the cultural lives of all involved.\n\nHowever, true cultural exchange should go beyond surface-level adoption of foreign customs. It requires genuine interest in understanding the history, values, and beliefs behind different cultural practices. Only through such deep engagement can we build meaningful bridges between cultures and foster a more harmonious world.`, note: '范文描述图画中的文化融合场景，分析文化交流的意义，强调深度理解的重要性。' }],
                tips: { type: 'picture', structure: ['首段：描述图画场景', '中段：分析文化交流的意义', '末段：强调深度理解的重要性'], keyExpressions: ['The picture depicts...', 'In today\'s globalized world,...', 'However, true cultural exchange should go beyond...'], notes: '文化交流类图画作文要积极正面，强调 mutual understanding。' }
            }
        },
        '2001-1': {
            partB: {
                title: '爱心是一盏灯',
                translation: '根据图画写一篇160-200词的短文。图画描绘了爱心如灯般照亮黑暗的场景。',
                type: 'picture',
                samples: [{ text: `The picture depicts a powerful metaphor: a heart-shaped lamp illuminates a dark and winding road ahead. The image conveys the message that love and compassion can light the way through life's darkest moments.\n\nIn our society, there are many people who face difficulties and hardships. A helping hand, a kind word, or a simple gesture of support can make a tremendous difference in someone's life. Love is not about grand gestures; it is about the small, everyday acts of kindness that show we care.\n\nWe should all strive to be that lamp for others. Whether it is volunteering at a charity, donating to those in need, or simply offering a listening ear to a friend, every act of love contributes to a brighter and more compassionate world. As the saying goes, "It is better to light a candle than to curse the darkness."`, note: '范文描述图画中的灯与爱心，分析善举的意义，引用名言呼吁行动。' }],
                tips: { type: 'picture', structure: ['首段：描述图画中的 metaphor', '中段：分析善举的意义', '末段：引用名言，呼吁行动'], keyExpressions: ['The picture depicts a powerful metaphor...', 'Love is not about...; it is about...', 'As the saying goes,...'], notes: '爱心类图画作文要情感真挚，引用恰当。' }
            }
        },
        '2000-1': {
            partB: {
                title: '世界商业捕鱼——从丰富到枯竭',
                translation: '根据图画写一篇160-200词的短文。图画描绘了商业捕鱼从过去鱼类丰富到如今资源枯竭的对比。',
                type: 'picture',
                samples: [{ text: `The picture presents a stark contrast between the past and present of commercial fishing. In the first image, dated 1900, the ocean is teeming with fish of all sizes. In the second, dated 1995, a single small fish remains while countless fishing boats crowd the waters above. This dramatic visual contrast highlights the devastating impact of overfishing on marine ecosystems.\n\nOver the past century, advances in fishing technology have enabled humans to harvest fish at an unprecedented rate. This has led to the depletion of many fish species and the degradation of marine habitats. The consequences extend beyond the environment—millions of people who depend on fishing for their livelihoods are also affected.\n\nAddressing this crisis requires urgent action. Governments must implement and enforce sustainable fishing practices, establish marine protected areas, and invest in aquaculture research. Consumers can also play a role by choosing sustainably sourced seafood. Only through collective effort can we restore the health of our oceans and ensure that future generations can enjoy the bounty of the sea.`, note: '范文描述图画中的强烈对比，分析过度捕捞的危害，提出可持续发展建议。' }],
                tips: { type: 'picture', structure: ['首段：描述图画中的时间对比', '中段：分析过度捕捞的危害', '末段：提出可持续发展建议'], keyExpressions: ['The picture presents a stark contrast...', 'This dramatic visual contrast highlights...', 'Addressing this crisis requires urgent action.'], notes: '环保类图画作文要突出问题的严重性，提出切实可行的建议。' }
            }
        },
    };

    // 获取默认范文（当没有特定数据时使用）
    function getDefaultSamples(part, year, type) {
        const key = year + '-' + (type === '英语一' ? '1' : '2');
        const data = sampleData[key];

        if (data) {
            return data[part]?.samples || [];
        }
        return [];
    }

    // 获取默认技巧
    function getDefaultTips(part, year, type) {
        const key = year + '-' + (type === '英语一' ? '1' : '2');
        const data = sampleData[key];

        if (data) {
            return data[part]?.tips || getGenericTips(part);
        }
        return getGenericTips(part);
    }

    function getGenericTips(part) {
        if (part === 'partA') {
            return {
                type: 'email',
                structure: ['开头寒暄', '正文说明', '结尾期待'],
                commonPhrases: ['I am delighted to...', 'Regarding your inquiry...', 'I hope this helps.'],
                notes: '应用文写作注意格式规范，要点齐全'
            };
        } else {
            return {
                type: 'essay',
                structure: ['描述现象/数据', '分析原因', '表达观点'],
                keyExpressions: ['It can be seen from... that...', 'Several factors lead to...', 'In my opinion...'],
                notes: '议论文写作注意逻辑清晰，论据充分'
            };
        }
    }

    function render(paper, backCallback) {
        currentPaper = paper;
        onBack = backCallback;

        const container = document.getElementById('pastPapersContainer');
        if (!container) return;

        const writingSections = paper.sections.filter(s => s.type === 'writing');
        if (writingSections.length === 0) {
            container.innerHTML = `
                <div class="pp-writing">
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
                            <span class="pp-reader-subtitle">作文</span>
                        </div>
                        <div class="pp-reader-actions"></div>
                    </div>
                    <div style="padding:40px; text-align:center; color:var(--text-secondary);">
                        暂无作文题目
                    </div>
                </div>
            `;
            document.getElementById('ppBackBtn').addEventListener('click', onBack);
            return;
        }

        const section = writingSections[0];
        const parsed = parseWritingContent(section.content, paper.year);

        currentPartA = parsed.partA;
        currentPartB = parsed.partB;

        const hasPartA = currentPartA.raw && currentPartA.raw.trim().length > 20;
        const hasPartB = currentPartB.raw && currentPartB.raw.trim().length > 20;

        const savedAnswerA = localStorage.getItem(`writing_${paper.id}_partA`);
        const savedAnswerB = localStorage.getItem(`writing_${paper.id}_partB`);
        userAnswerA = savedAnswerA || '';
        userAnswerB = savedAnswerB || '';

        let partAHtml = '';
        if (hasPartA) {
            partAHtml = `
                    <div class="pp-writing-section">
                        <h3 class="pp-writing-title">Part A - 应用文（10分）</h3>
                        <div class="pp-writing-question">${currentPartA.display}</div>

                        <div class="pp-ls-accordion" style="margin-top:16px;">
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="sample-a">
                                    <span>参考范文</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingSampleA" style="display:none;">
                                    ${generatePartASamplesHtml()}
                                </div>
                            </div>
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="tips-a">
                                    <span>写作技巧</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingTipsA" style="display:none;">
                                    ${generatePartATipsHtml()}
                                </div>
                            </div>
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="answer-a">
                                    <span>答题区域</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingAnswerA" style="display:none;">
                                    <div class="pp-writing-answer-area">
                                        <textarea id="ppAnswerA" class="pp-writing-textarea pp-writing-textarea-a" placeholder="请在这里输入你的作文..." rows="10">${userAnswerA}</textarea>
                                        <div class="pp-writing-stats">
                                            <span id="ppAnswerACount">${userAnswerA.length}</span> 字符
                                            <span class="pp-writing-target">（约100词）</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
`;
        }

        container.innerHTML = `
            <div class="pp-writing">
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
                        <span class="pp-reader-subtitle">作文指导</span>
                    </div>
                    <div class="pp-reader-actions"></div>
                </div>

                <div class="pp-writing-content">
                    ${partAHtml}
                    <div class="pp-writing-section">
                        <h3 class="pp-writing-title">Part B - 短文写作（20分）</h3>
                        <div class="pp-writing-question" id="ppWritingQuestionB">${currentPartB.display}</div>

                        <div class="pp-ls-accordion" style="margin-top:16px;">
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="sample-b">
                                    <span>参考范文</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingSampleB" style="display:none;">
                                    ${generatePartBSamplesHtml()}
                                </div>
                            </div>
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="tips-b">
                                    <span>写作技巧</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingTipsB" style="display:none;">
                                    ${generatePartBTipsHtml()}
                                </div>
                            </div>
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="answer-b">
                                    <span>答题区域</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingAnswerB" style="display:none;">
                                    <div class="pp-writing-answer-area">
                                        <textarea id="ppAnswerB" class="pp-writing-textarea pp-writing-textarea-b" placeholder="请在这里输入你的作文..." rows="20">${userAnswerB}</textarea>
                                        <div class="pp-writing-stats">
                                            <span id="ppAnswerBCount">${userAnswerB.length}</span> 字符
                                            <span class="pp-writing-target">（160-200词）</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="pp-ls-item">
                                <button class="pp-ls-toggle" data-target="ai-check">
                                    <span>AI智能批改</span>
                                    <span class="pp-ls-arrow">▼</span>
                                </button>
                                <div class="pp-ls-detail" id="ppWritingAiCheck" style="display:none;">
                                    ${generateAICheckHtml()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('ppBackBtn').addEventListener('click', onBack);

        // 绑定手风琴点击
        document.querySelectorAll('.pp-ls-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const detailId = 'ppWriting' + target.charAt(0).toUpperCase() + target.slice(1).replace(/-([a-z])/g, (m, c) => c.toUpperCase());
                const detail = document.getElementById(detailId);
                if (!detail) return;

                const isVisible = detail.style.display !== 'none';

                const accordion = btn.closest('.pp-ls-accordion');
                if (accordion) {
                    accordion.querySelectorAll('.pp-ls-detail').forEach(d => d.style.display = 'none');
                    accordion.querySelectorAll('.pp-ls-toggle').forEach(b => b.classList.remove('open'));
                }

                if (!isVisible) {
                    detail.style.display = 'block';
                    btn.classList.add('open');
                }
            });
        });

        // 尝试加载Part A和Part B题目图片
        if (hasPartA) {
            loadWritingImage(paper.id, paper.year, paper.type, 'partA');
        }
        if (hasPartB) {
            loadWritingImage(paper.id, paper.year, paper.type, 'partB');
        }

        // 绑定答题区域事件
        bindAnswerEvents();
    }

    // 加载作文题目图片
    function loadWritingImage(paperId, year, type, part) {
        const typeNum = type === '英语一' ? '1' : '2';
        const partLower = part.toLowerCase();
        const extensions = ['png', 'jpg', 'jpeg', 'webp'];
        
        const partLetter = partLower === 'parta' ? 'A' : 'B';
        const questionEl = document.getElementById(`ppWritingQuestion${partLetter}`);
        if (!questionEl) return;

        let loaded = false;
        
        const pathFormats = [
            `images/writing/${paperId}-${partLower}`,
            `images/writing/${year}-${typeNum}-${partLower}`,
            `images/writing/${year}-${typeNum}-1-${partLower}`,
            `images/writing/${year}-${typeNum}-2-${partLower}`
        ];
        
        const allPaths = [];
        pathFormats.forEach(fmt => {
            extensions.forEach(ext => {
                allPaths.push(`${fmt}.${ext}`);
            });
        });
        
        let pathIndex = 0;
        
        function tryNextPath() {
            if (loaded || pathIndex >= allPaths.length) return;
            
            const imgPath = allPaths[pathIndex];
            pathIndex++;
            
            const img = new Image();
            img.onload = () => {
                if (loaded) return;
                loaded = true;
                
                const imgContainer = document.createElement('div');
                imgContainer.className = 'pp-writing-image-container';
                imgContainer.innerHTML = `
                    <img src="${imgPath}" alt="${year} ${type} Part ${partLetter}" class="pp-writing-question-image">
                `;
                
                const originalContent = questionEl.innerHTML;
                questionEl.innerHTML = '';
                questionEl.appendChild(imgContainer);
                
                const descDiv = document.createElement('div');
                descDiv.className = 'pp-writing-question-desc';
                descDiv.innerHTML = originalContent;
                questionEl.appendChild(descDiv);
            };
            img.onerror = tryNextPath;
            img.src = imgPath;
        }
        
        tryNextPath();
    }

    // 解析作文内容
    function parseWritingContent(content, year) {
        const result = {
            partA: { raw: '', display: '', type: 'email', hasEmail: false, email: null, hasPicture: false, hasTable: false, directions: '' },
            partB: { raw: '', display: '', type: 'essay', hasPicture: false, hasTable: false, hasPictureChart: false, directions: '' }
        };

        if (!content) {
            result.partA.display = '<div class="pp-writing-empty">暂无内容</div>';
            result.partB.display = '<div class="pp-writing-empty">暂无内容</div>';
            return result;
        }

        content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const hasPartA = /Part\s*A/i.test(content);
        const hasPartB = /Part\s*B/i.test(content);

        let partAContent = '';
        if (hasPartA) {
            if (hasPartB) {
                const match = content.match(/Part\s*A[\s\S]*?(?=Part\s*B)/i);
                partAContent = match ? match[0] : content;
            } else {
                const match = content.match(/Part\s*A[\s\S]*$/i);
                partAContent = match ? match[0] : content;
            }
        }

        let partBContent = '';
        if (hasPartB) {
            const match = content.match(/Part\s*B[\s\S]*$/i);
            partBContent = match ? match[0] : '';
        }

        if (partAContent) {
            result.partA.raw = partAContent;
            
            const dirMatch = partAContent.match(/(?:Part\s*A\s*\d+\.\s*)?Directions:?\s*([\s\S]*?)(?=\n\s*\d+\.|\n\s*[A-Z][a-z]+\s+|$)/i);
            let directionsText = '';
            let bodyContent = partAContent;
            
            if (dirMatch && dirMatch[1].trim()) {
                directionsText = dirMatch[1].trim();
                result.partA.directions = directionsText;
                bodyContent = partAContent.replace(/(?:Part\s*A\s*\d+\.\s*)?Directions:?\s*[\s\S]*?(?=\n\s*\d+\.|\n\s*[A-Z][a-z]+\s+|$)/i, '').trim();
            }
            
            bodyContent = bodyContent
                .replace(/Part\s*A\s*\d+\.\s*/gi, '')
                .replace(/^\d+\.\s*/, '')
                .trim();

            const emailMatch = bodyContent.match(/(Dear\s+[\w\s]+,[\s\S]*?(?:Yours[,]?\s*\n|Sincerely[,]?\s*\n|Best\s+regards[,]?\s*\n|Li\s*Ming\s*$))/i);
            
            let html = '';
            
            if (directionsText) {
                html += `<div class="pp-writing-directions"><span class="pp-writing-directions-label">Directions:</span><div class="pp-writing-directions-text">${formatQuestionText(directionsText)}</div></div>`;
            }
            
            if (emailMatch) {
                result.partA.hasEmail = true;
                result.partA.email = emailMatch[1].trim();
                const remainingContent = bodyContent.replace(/Dear\s+[\w\s]+,[\s\S]*?(?:Yours[,]?\s*\n|Sincerely[,]?\s*\n|Best\s+regards[,]?\s*\n|Li\s*Ming\s*$)/i, '').trim();
                if (remainingContent) {
                    html += `<div class="pp-writing-email-question">${formatQuestionText(remainingContent)}</div>`;
                }
                html += `<div class="pp-writing-email-sample"><div class="pp-writing-email-title">原文邮件：</div><div class="pp-writing-email-body">${formatQuestionText(emailMatch[1].trim())}</div></div>`;
            } else {
                html += `<div class="pp-writing-question">${formatQuestionText(bodyContent)}</div>`;
            }
            
            result.partA.display = html;
        }

        if (partBContent) {
            result.partB.raw = partBContent;
            
            partBContent = partBContent.replace(/^Part\s*B\s*/i, '').trim();
            
            const dirMatch = partBContent.match(/Directions:?\s*([\s\S]*?)(?=\n\n|\n\s*\n|<table|\[IMAGE\]|$)/i);
            let directionsText = '';
            let bodyContent = partBContent;
            
            if (dirMatch && dirMatch[1].trim()) {
                directionsText = dirMatch[1].trim();
                result.partB.directions = directionsText;
                bodyContent = partBContent.replace(/Directions:?\s*[\s\S]*?(?=\n\n|\n\s*\n|<table|\[IMAGE\]|$)/i, '').trim();
            }
            
            bodyContent = bodyContent
                .replace(/Part\s*B\s*\d+\.\s*/gi, '')
                .replace(/^\d+\.\s*/, '')
                .trim();

            const hasHtmlTable = /<table/i.test(bodyContent);
            
            const hasTableData = /\d{4}[\s\d.]+\s+\d+/.test(bodyContent) && 
                                  (/\b(?:空调|洗衣机|电冰箱|电视|电脑|手机)\b/i.test(bodyContent) || 
                                   /\b(?:air\s*conditioner|washing\s*machine|refrigerator|television|computer)\b/i.test(bodyContent));
            
            const hasPictureKeyword = /\b(?:picture|photo|image|下图|图画|图片)\b/i.test(bodyContent);
            const hasChartKeyword = /\b(?:chart|graph|table|图表|表格)\b/i.test(bodyContent);

            const tablePattern = /(\d{4}\s+[\d.]+\s*)+/;
            const hasNumericTable = tablePattern.test(bodyContent);

            let html = '';
            
            if (directionsText) {
                html += `<div class="pp-writing-directions"><span class="pp-writing-directions-label">Directions:</span><div class="pp-writing-directions-text">${formatQuestionText(directionsText)}</div></div>`;
            }

            if (hasHtmlTable) {
                result.partB.hasTable = true;
                result.partB.type = 'table';
                html += formatHtmlTableContent(bodyContent);
            } else if (hasTableData || hasNumericTable) {
                result.partB.hasTable = true;
                result.partB.type = 'table';
                html += formatTableContent(bodyContent);
            } else if (hasPictureKeyword && hasChartKeyword) {
                result.partB.hasPictureChart = true;
                result.partB.type = 'picture+chart';
                html += formatPictureChartContent(bodyContent);
            } else if (hasPictureKeyword) {
                result.partB.hasPicture = true;
                result.partB.type = 'picture';
                html += formatPictureContent(bodyContent);
            } else {
                html += `<div class="pp-writing-essay-question">${formatQuestionText(bodyContent)}</div>`;
            }
            
            result.partB.display = html;
        }

        return result;
    }

    // 格式化问题文本 - 改进段落和换行处理
    function formatQuestionText(text) {
        if (!text) return '';
        
        text = text.trim();
        
        if (/\d{4}[\s\d.]+\s+\d+/.test(text) && /\b(?:空调|洗衣机|电冰箱|电视|电脑)\b/.test(text)) {
            return text;
        }
        
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        text = text.replace(/\n{3,}/g, '\n\n');
        
        const lines = text.split('\n');
        const paragraphs = [];
        let currentParagraph = '';
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            if (!line) {
                if (currentParagraph.trim()) {
                    paragraphs.push(currentParagraph.trim());
                    currentParagraph = '';
                }
                continue;
            }
            
            const isNumbered = /^\d+\.\s+/.test(line) || /^\d+\)\s+/.test(line);
            const isLettered = /^[A-Z]\.\s+/.test(line);
            const isBullet = /^[•\-\*]\s+/.test(line);
            const isListItem = isNumbered || isLettered || isBullet;
            
            const startsWithCapital = /^[A-Z]/.test(line) && !isListItem;
            const endsWithPeriod = /[.!?。！？]$/.test(line);
            
            if (isListItem) {
                if (currentParagraph.trim()) {
                    paragraphs.push(currentParagraph.trim());
                }
                currentParagraph = line;
            } else if (!currentParagraph) {
                currentParagraph = line;
            } else if (startsWithCapital && endsWithPeriod) {
                paragraphs.push(currentParagraph.trim());
                currentParagraph = line;
            } else if (startsWithCapital && !endsWithPeriod) {
                if (currentParagraph.length > 60) {
                    paragraphs.push(currentParagraph.trim());
                    currentParagraph = line;
                } else {
                    currentParagraph += ' ' + line;
                }
            } else {
                currentParagraph += ' ' + line;
            }
        }
        
        if (currentParagraph.trim()) {
            paragraphs.push(currentParagraph.trim());
        }
        
        if (paragraphs.length === 0) {
            return `<p>${text}</p>`;
        }
        
        return paragraphs.map((p, idx) => {
            p = p.replace(/\s+/g, ' ').trim();
            if (!p) return '';
            p = p.replace(/\\n/g, '<br>');
            return `<p class="pp-question-paragraph">${p}</p>`;
        }).join('');
    }

    // 格式化已包含HTML表格的内容
    function formatHtmlTableContent(text) {
        if (!text) return '';
        
        let html = '<div class="pp-writing-chart-question">';
        
        const tableMatch = text.match(/<table[\s\S]*?<\/table>/i);
        let tableHtml = '';
        let beforeTable = '';
        let afterTable = '';
        
        if (tableMatch) {
            tableHtml = tableMatch[0];
            const tableIdx = text.indexOf(tableMatch[0]);
            beforeTable = text.substring(0, tableIdx).trim();
            afterTable = text.substring(tableIdx + tableMatch[0].length).trim();
        }
        
        if (beforeTable) {
            html += `<div class="pp-writing-question-title">${formatQuestionText(beforeTable)}</div>`;
        }
        
        if (tableHtml) {
            tableHtml = tableHtml.replace(/<table[^>]*>/i, '<div class="pp-writing-table-wrapper"><table class="pp-writing-table">');
            tableHtml = tableHtml.replace(/<\/table>/i, '</table></div>');
            tableHtml = tableHtml.replace(/<th>/gi, '<th>');
            tableHtml = tableHtml.replace(/<td>/gi, '<td>');
            html += tableHtml;
        }
        
        if (afterTable) {
            html += `<div class="pp-writing-table-caption">${formatQuestionText(afterTable)}</div>`;
        }
        
        html += '</div>';
        return html;
    }

    // 格式化表格内容 - 正确解析并生成HTML表格
    function formatTableContent(text) {
        if (!text) return '';
        
        let html = '<div class="pp-writing-chart-question">';
        
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        const hasYearData = /\d{4}[\s\d.]+\s+\d{2,}/.test(text);
        
        if (hasYearData) {
            const lines = text.split('\n').filter(l => l.trim());
            
            let tableStartIdx = -1;
            let headers = [];
            let dataRows = [];
            
            const headerKeywords = ['年份', '空调', '洗衣机', '电冰箱', '电视', '电脑', '手机', '汽车', '城镇居民', '农村居民'];
            const headerKeywordsEn = ['year', 'air conditioner', 'washing machine', 'refrigerator', 'television', 'computer', 'mobile phone', 'car', 'urban', 'rural'];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                const hasHeader = headerKeywords.some(k => line.includes(k)) || 
                                  headerKeywordsEn.some(k => line.toLowerCase().includes(k));
                
                if (hasHeader && tableStartIdx === -1) {
                    tableStartIdx = i;
                    
                    const parts = line.split(/\s{2,}|\t/).filter(p => p.trim());
                    if (parts.length <= 1) {
                        const allParts = line.split(/\s+/).filter(p => p.trim());
                        headers = allParts.filter(p => {
                            return !/^\d{4}$/.test(p) && !/^[\d.]+$/.test(p);
                        });
                    } else {
                        headers = parts.filter(p => {
                            return !/^\d{4}$/.test(p) && !/^[\d.]+$/.test(p);
                        });
                    }
                }
                
                const yearMatch = line.match(/^(\d{4})\s+([\d.\s]+)/);
                if (yearMatch) {
                    const year = yearMatch[1];
                    const values = yearMatch[2].trim().split(/\s+/).filter(v => v);
                    dataRows.push({ year, values });
                }
            }
            
            if (dataRows.length > 0) {
                const colCount = dataRows[0]?.values.length || 3;
                
                if (headers.length === 0) {
                    const defaultHeaders = ['空调', '洗衣机', '电冰箱', '彩色电视机', '家用电脑'];
                    headers = defaultHeaders.slice(0, colCount);
                } else {
                    headers = headers.map(h => h.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '').trim()).filter(h => h);
                    while (headers.length < colCount) {
                        headers.push('项目' + (headers.length + 1));
                    }
                    headers = headers.slice(0, colCount);
                }
                
                html += '<div class="pp-writing-table-wrapper">';
                html += '<table class="pp-writing-table">';
                
                html += '<thead><tr><th>年份</th>';
                headers.forEach(h => {
                    html += `<th>${h}</th>`;
                });
                html += '</tr></thead>';
                
                html += '<tbody>';
                dataRows.forEach(row => {
                    html += `<tr><td>${row.year}</td>`;
                    row.values.slice(0, colCount).forEach(val => {
                        html += `<td>${val}</td>`;
                    });
                    for (let i = row.values.length; i < colCount; i++) {
                        html += '<td>—</td>';
                    }
                    html += '</tr>';
                });
                html += '</tbody></table></div>';
            }
            
            const descPatterns = [
                /近年来[^。\n]*[。.]?/,
                /全国居民[^。\n]*[。.]?/,
                /根据下表[^。\n]*[。.]?/,
                /the\s+table\s+shows[^。\n]*[.]?/i,
                /the\s+chart\s+illustrates[^。\n]*[.]?/i
            ];
            
            let descText = '';
            for (const pattern of descPatterns) {
                const match = text.match(pattern);
                if (match && match[0].length > 2) {
                    descText = match[0].trim();
                    break;
                }
            }
            
            if (!descText) {
                const nonTableLines = lines.filter(l => !/^\d{4}\s+[\d.]/.test(l.trim()) && !headerKeywords.some(k => l.includes(k)));
                if (nonTableLines.length > 0) {
                    descText = nonTableLines.slice(0, 2).join(' ').trim();
                }
            }
            
            if (descText) {
                html += `<div class="pp-writing-desc">${formatQuestionText(descText)}</div>`;
            }
            
            const requirementPatterns = [
                /请根据[^。]*[。！？]/,
                /write\s+an\s+essay[^.]*\./i,
                /描述[^。]*说明[^。]*评论[^。]*[。]/
            ];
            
            let requirement = '';
            for (const pattern of requirementPatterns) {
                const match = text.match(pattern);
                if (match) {
                    requirement = match[0];
                    break;
                }
            }
            
            if (!requirement) {
                const lastLines = lines.slice(-3);
                const lastText = lastLines.join(' ').trim();
                if (lastText.length > 20 && !/^\d{4}\s+[\d.]/.test(lastText)) {
                    requirement = lastText;
                }
            }
            
            if (requirement) {
                html += `<div class="pp-writing-requirement">${formatQuestionText(requirement)}</div>`;
            }
        } else {
            html += formatQuestionText(text);
        }
        
        html += '</div>';
        return html;
    }
    
    // 格式化图画内容
    function formatPictureContent(text) {
        if (!text) return '';
        
        let html = '<div class="pp-writing-picture-question">';
        
        // 统一换行符
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // 清理文本
        text = text.replace(/Part\s*B\s*\d+\.\s*Directions:?\s*/gi, '').trim();
        
        // 提取图画描述（查找"如下图"之类的内容）
        const picturePatterns = [
            /根据下图[^。]*。/,
            /如下图[^。]*。/,
            /the\s+picture\s+shows[^。]*\./i,
            /as\s+shown\s+in\s+the\s+picture[^。]*\./i
        ];
        
        let hasPicture = false;
        for (const pattern of picturePatterns) {
            if (pattern.test(text)) {
                hasPicture = true;
                break;
            }
        }
        
        if (hasPicture) {
            // 添加图片占位符
            html += '<div class="pp-writing-picture-placeholder">';
            html += '<div class="pp-writing-picture-icon">🖼️</div>';
            html += '<div class="pp-writing-picture-text">请查看原版试题图片</div>';
            html += '</div>';
            
            // 添加描述文字
            html += '<div class="pp-writing-text-content">';
            html += formatQuestionText(text);
            html += '</div>';
        } else {
            html += formatQuestionText(text);
        }
        
        html += '</div>';
        return html;
    }
    
    // 格式化图画+图表内容
    function formatPictureChartContent(text) {
        if (!text) return '';
        
        let html = '<div class="pp-writing-picturechart-question">';
        
        // 统一换行符
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // 清理文本
        text = text.replace(/Part\s*B\s*\d+\.\s*Directions:?\s*/gi, '').trim();
        
        // 添加图片占位符
        html += '<div class="pp-writing-picture-placeholder">';
        html += '<div class="pp-writing-picture-icon">🖼️</div>';
        html += '<div class="pp-writing-picture-text">请查看原版试题图片和图表</div>';
        html += '</div>';
        
        // 添加描述文字
        html += '<div class="pp-writing-text-content">';
        html += formatQuestionText(text);
        html += '</div>';
        
        html += '</div>';
        return html;
    }

    // 绑定答题区域事件
    function bindAnswerEvents() {
        const answerA = document.getElementById('ppAnswerA');
        const answerB = document.getElementById('ppAnswerB');
        const countA = document.getElementById('ppAnswerACount');
        const countB = document.getElementById('ppAnswerBCount');

        if (answerA && countA) {
            answerA.addEventListener('input', () => {
                const text = answerA.value;
                countA.textContent = text.length;
                localStorage.setItem(`writing_${currentPaper.id}_partA`, text);
                userAnswerA = text;
            });
        }

        if (answerB && countB) {
            answerB.addEventListener('input', () => {
                const text = answerB.value;
                countB.textContent = text.length;
                localStorage.setItem(`writing_${currentPaper.id}_partB`, text);
                userAnswerB = text;
            });
        }

        // AI批改按钮
        const aiCheckBtn = document.getElementById('ppAiCheckBtn');
        if (aiCheckBtn) {
            aiCheckBtn.addEventListener('click', handleAICheck);
        }

        // AI批改标签页切换
        document.querySelectorAll('.pp-ai-tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.pp-ai-tab-btn').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    // 处理AI批改
    function handleAICheck() {
        const resultDiv = document.getElementById('ppAiResult');
        if (!resultDiv) return;

        const activeTab = document.querySelector('.pp-ai-tab-btn.active');
        const part = activeTab?.dataset.part || 'partB';
        const answer = part === 'partA' ? userAnswerA : userAnswerB;

        if (!answer || answer.trim().length < 50) {
            resultDiv.innerHTML = `
                <div class="pp-ai-warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>请先完成作文内容后再提交批改（至少50个字符）</span>
                </div>
            `;
            return;
        }

        resultDiv.innerHTML = `
            <div class="pp-ai-loading">
                <div class="pp-ai-spinner"></div>
                <p>正在提交批改请求...</p>
            </div>
        `;

        // 禁用提交按钮
        const submitBtn = document.getElementById('ppAiCheckBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
        }

        // 构建prompt
        const question = part === 'partA' ? currentPartA.raw : currentPartB.raw;
        const prompt = buildAIPrompt(question, answer, part);

        // 检查是否有API密钥
        const apiKey = localStorage.getItem('apiKey');
        if (!apiKey) {
            resultDiv.innerHTML = `
                <div class="pp-ai-warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <div class="pp-ai-warning-text">
                        <strong>AI批改功能需要API密钥才能使用</strong>
                        <span>请在设置中配置API密钥后再试</span>
                    </div>
                </div>
            `;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
            return;
        }

        // 模拟API调用（实际使用时需要替换为真实API调用）
        setTimeout(() => {
            resultDiv.innerHTML = `
                <div class="pp-ai-result-content">
                    <div class="pp-ai-score-section">
                        <div class="pp-ai-score-main">
                            <span class="pp-ai-score-label">预估得分</span>
                            <span class="pp-ai-score-value">待API接入后显示</span>
                        </div>
                        <div class="pp-ai-score-detail">
                            <div class="pp-ai-score-item">
                                <span class="pp-ai-score-item-label">内容切题</span>
                                <span class="pp-ai-score-item-value">-</span>
                            </div>
                            <div class="pp-ai-score-item">
                                <span class="pp-ai-score-item-label">结构完整</span>
                                <span class="pp-ai-score-item-value">-</span>
                            </div>
                            <div class="pp-ai-score-item">
                                <span class="pp-ai-score-item-label">语言表达</span>
                                <span class="pp-ai-score-item-value">-</span>
                            </div>
                        </div>
                    </div>
                    <div class="pp-ai-divider"></div>
                    <div class="pp-ai-feedback-section">
                        <h4 class="pp-ai-feedback-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            批改说明
                        </h4>
                        <p class="pp-ai-feedback-desc">请配置API密钥后，AI将根据以下提示词进行批改：</p>
                        <pre class="pp-ai-prompt">${prompt.substring(0, 500)}...</pre>
                    </div>
                </div>
            `;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        }, 1500);
    }

    // 构建AI批改prompt
    function buildAIPrompt(question, answer, part) {
        const partType = part === 'partA' ? '应用文（邮件）' : '短文写作';
        const wordCount = part === 'partA' ? '约100词' : '160-200词';

        return `你是一位专业的考研英语作文批改老师。请对以下${partType}进行详细批改。

【题目要求】
${question}

【学生作答】
${answer}

【批改要求】
1. 首先给出预估得分（满分${part === 'partA' ? '10' : '20'}分）
2. 分析文章结构是否清晰合理
3. 指出语法错误和用词问题
4. 评价内容是否切题
5. 给出具体的改进建议
6. 提供一篇高质量的范文参考

请用中文进行批改。`;
    }

    // 生成Part A范文HTML
    function generatePartASamplesHtml() {
        const samples = getDefaultSamples('partA', currentPaper.year, currentPaper.type);
        if (samples.length === 0) {
            return '<p class="pp-no-sample">暂无范文</p>';
        }

        let html = '<div class="pp-samples-list">';
        samples.forEach((sample, index) => {
            html += `
                <div class="pp-sample-item">
                    <div class="pp-sample-text">${sample.text.replace(/\n/g, '<br>')}</div>
                    ${sample.note ? `<div class="pp-sample-note">${sample.note}</div>` : ''}
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    // 生成Part B范文HTML
    function generatePartBSamplesHtml() {
        const samples = getDefaultSamples('partB', currentPaper.year, currentPaper.type);
        if (samples.length === 0) {
            return '<p class="pp-no-sample">暂无范文</p>';
        }

        let html = '<div class="pp-samples-list">';
        samples.forEach((sample, index) => {
            html += `
                <div class="pp-sample-item">
                    <div class="pp-sample-text">${sample.text.replace(/\n/g, '<br>')}</div>
                    ${sample.note ? `<div class="pp-sample-note">${sample.note}</div>` : ''}
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    // 生成Part A技巧HTML
    function generatePartATipsHtml() {
        const tips = getDefaultTips('partA', currentPaper.year, currentPaper.type);
        let html = '<div class="pp-writing-tips">';

        if (tips.structure && tips.structure.length > 0) {
            html += '<h4>📌 文章结构</h4><ul>';
            tips.structure.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        }

        if (tips.commonPhrases && tips.commonPhrases.length > 0) {
            html += '<h4>📝 常用表达</h4><ul>';
            tips.commonPhrases.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        }

        if (tips.notes) {
            html += `<div class="pp-tips-note">💬 ${tips.notes}</div>`;
        }

        html += '</div>';
        return html;
    }

    // 生成Part B技巧HTML
    function generatePartBTipsHtml() {
        const tips = getDefaultTips('partB', currentPaper.year, currentPaper.type);
        let html = '<div class="pp-writing-tips">';

        if (tips.type === 'table') {
            html += '<h4>📊 图表作文写作要点</h4>';
        } else if (tips.type === 'picture') {
            html += '<h4>🎨 图画作文写作要点</h4>';
        } else if (tips.type === 'picture+chart') {
            html += '<h4>📊 图画+图表作文写作要点</h4>';
        } else {
            html += '<h4>📝 短文写作要点</h4>';
        }

        if (tips.structure && tips.structure.length > 0) {
            html += '<ul>';
            tips.structure.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        }

        if (tips.keyExpressions && tips.keyExpressions.length > 0) {
            html += '<h4>🔑 关键表达</h4><ul>';
            tips.keyExpressions.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        }

        if (tips.notes) {
            html += `<div class="pp-tips-note">💬 ${tips.notes}</div>`;
        }

        html += '</div>';
        return html;
    }

    // 生成AI批改HTML
    function generateAICheckHtml() {
        return `
            <div class="pp-ai-check-area">
                <div class="pp-ai-header">
                    <h3 class="pp-ai-title">AI智能批改</h3>
                    <p class="pp-ai-subtitle">基于人工智能的作文评分与改进建议</p>
                </div>
                
                <div class="pp-ai-tab-bar">
                    <button class="pp-ai-tab-btn active" data-part="partA">Part A</button>
                    <button class="pp-ai-tab-btn" data-part="partB">Part B</button>
                </div>
                
                <div class="pp-ai-content">
                    <div class="pp-ai-submit-section">
                        <button id="ppAiCheckBtn" class="pp-ai-check-btn">
                            提交批改
                        </button>
                        <p class="pp-ai-hint">请先在答题区域完成作文后再提交</p>
                    </div>
                    
                    <div id="ppAiResult" class="pp-ai-result-area"></div>
                </div>
                
                <div class="pp-ai-footer">
                    <span class="pp-ai-footer-text">批改结果仅供参考，实际得分以官方标准为准</span>
                </div>
            </div>
        `;
    }

    // 旧版兼容函数（保持API兼容）
    function extractPartA(content) {
        const parsed = parseWritingContent(content, '');
        return parsed.partA.display.replace(/<\/?[^>]+>/g, '').replace(/<br>/g, '\n');
    }

    function extractPartB(content) {
        const parsed = parseWritingContent(content, '');
        return parsed.partB.display.replace(/<\/?[^>]+>/g, '').replace(/<br>/g, '\n');
    }

    function formatQuestionText_OLD(text) {
        return formatQuestionText(text);
    }

    function generatePartASample() {
        const samples = getDefaultSamples('partA', currentPaper?.year || '2025', currentPaper?.type || '英语一');
        return samples[0]?.text || '';
    }

    function generatePartBSample() {
        const samples = getDefaultSamples('partB', currentPaper?.year || '2025', currentPaper?.type || '英语一');
        return samples[0]?.text || '';
    }

    function generatePartATips() {
        return generatePartATipsHtml();
    }

    function generatePartBTips() {
        return generatePartBTipsHtml();
    }

    return {
        render,
        extractPartA,
        extractPartB
    };
})();

window.Writing = Writing;
