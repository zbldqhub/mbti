/**
 * MBTI 测试题库 - 93题完整版
 * 
 * 结构说明：
 * - 前28题为基础免费版（EI维度23题 + SN维度5题）
 * - 后65题为深度付费版（SN维度18题 + TF维度23题 + JP维度24题）
 * 
 * 计分规则：
 * - 每个选项对应一个类型（E/I, S/N, T/F, J/P）
 * - 选A加A面对应类型分数，选B加B面对应类型分数
 * - 每题计1分
 * 
 * 用户替换说明：
 * 如需替换题库，请保持以下格式，确保前28题为免费题
 */

export const questions = [
  // ========== 基础免费版 - 前28题 ==========
  // EI维度 - 前23题
  {
    id: 1,
    dimension: "EI",
    question: "你通常更喜欢：",
    options: [
      { text: "和很多人一起参加聚会或活动", score: 1, type: "E" },
      { text: "和少数几个亲密的朋友在一起或独处", score: 1, type: "I" }
    ]
  },
  {
    id: 2,
    dimension: "EI",
    question: "在社交场合中，你倾向于：",
    options: [
      { text: "主动和陌生人交谈，容易自来熟", score: 1, type: "E" },
      { text: "等待别人来找你，比较矜持", score: 1, type: "I" }
    ]
  },
  {
    id: 3,
    dimension: "EI",
    question: "你更喜欢通过以下哪种方式充电：",
    options: [
      { text: "参加热闹的社交活动，从外部世界获取能量", score: 1, type: "E" },
      { text: "独自阅读、思考或进行安静的爱好", score: 1, type: "I" }
    ]
  },
  {
    id: 4,
    dimension: "EI",
    question: "当你需要解决一个复杂问题时，你通常：",
    options: [
      { text: "和别人讨论，通过交流理清思路", score: 1, type: "E" },
      { text: "独自思考，在内心整理想法", score: 1, type: "I" }
    ]
  },
  {
    id: 5,
    dimension: "EI",
    question: "你更喜欢的工作环境是：",
    options: [
      { text: "开放式的办公环境，随时可以和同事交流", score: 1, type: "E" },
      { text: "安静的独立空间，可以专注工作", score: 1, type: "I" }
    ]
  },
  {
    id: 6,
    dimension: "EI",
    question: "在会议或聚会中，你通常：",
    options: [
      { text: "积极发言，表达自己的想法", score: 1, type: "E" },
      { text: "先倾听他人，必要时才发言", score: 1, type: "I" }
    ]
  },
  {
    id: 7,
    dimension: "EI",
    question: "你更倾向于：",
    options: [
      { text: "先行动后思考，边做边学", score: 1, type: "E" },
      { text: "先思考后行动，谋定而后动", score: 1, type: "I" }
    ]
  },
  {
    id: 8,
    dimension: "EI",
    question: "你更享受：",
    options: [
      { text: "成为注意力的焦点，在人群中活跃", score: 1, type: "E" },
      { text: "做观察者，在幕后观察", score: 1, type: "I" }
    ]
  },
  {
    id: 9,
    dimension: "EI",
    question: "你结交新朋友的方式通常是：",
    options: [
      { text: "很容易，在各种场合都能认识新人", score: 1, type: "E" },
      { text: "比较慢热，主要通过朋友介绍或深度交往", score: 1, type: "I" }
    ]
  },
  {
    id: 10,
    dimension: "EI",
    question: "你更喜欢哪种类型的周末：",
    options: [
      { text: "参加各种社交活动，认识新朋友", score: 1, type: "E" },
      { text: "在家休息，或只和一两个人见面", score: 1, type: "I" }
    ]
  },
  {
    id: 11,
    dimension: "EI",
    question: "当你感到压力大时，你倾向于：",
    options: [
      { text: "找朋友倾诉，寻求外部支持", score: 1, type: "E" },
      { text: "独自消化，通过独处恢复", score: 1, type: "I" }
    ]
  },
  {
    id: 12,
    dimension: "EI",
    question: "你更喜欢哪种沟通方式：",
    options: [
      { text: "面对面交流，或电话语音", score: 1, type: "E" },
      { text: "文字信息，或电子邮件", score: 1, type: "I" }
    ]
  },
  {
    id: 13,
    dimension: "EI",
    question: "你通常被描述为：",
    options: [
      { text: "开朗、健谈、精力充沛", score: 1, type: "E" },
      { text: "安静、内敛、深思熟虑", score: 1, type: "I" }
    ]
  },
  {
    id: 14,
    dimension: "EI",
    question: "你更喜欢哪种类型的假期：",
    options: [
      { text: "去热门景点，体验当地夜生活，参加团体活动", score: 1, type: "E" },
      { text: "去安静的地方，独自或与少数亲友深度体验", score: 1, type: "I" }
    ]
  },
  {
    id: 15,
    dimension: "EI",
    question: "在团队项目中，你倾向于：",
    options: [
      { text: "主动担任协调者或发言人角色", score: 1, type: "E" },
      { text: "专注于具体任务，在需要时提供意见", score: 1, type: "I" }
    ]
  },
  {
    id: 16,
    dimension: "EI",
    question: "你更讨厌哪种情况：",
    options: [
      { text: "长时间独处，没有人可以交流", score: 1, type: "E" },
      { text: "长时间在人群中，没有机会独处", score: 1, type: "I" }
    ]
  },
  {
    id: 17,
    dimension: "EI",
    question: "你学习新事物的最佳方式是：",
    options: [
      { text: "通过实践和与他人讨论", score: 1, type: "E" },
      { text: "通过阅读和独自思考", score: 1, type: "I" }
    ]
  },
  {
    id: 18,
    dimension: "EI",
    question: "你更倾向于：",
    options: [
      { text: "广泛社交，拥有很多熟人", score: 1, type: "E" },
      { text: "深度交往，拥有几个知心朋友", score: 1, type: "I" }
    ]
  },
  {
    id: 19,
    dimension: "EI",
    question: "当你有一个新想法时，你通常会：",
    options: [
      { text: "立即和别人分享，听取反馈", score: 1, type: "E" },
      { text: "先在脑中完善，觉得成熟了再说", score: 1, type: "I" }
    ]
  },
  {
    id: 20,
    dimension: "EI",
    question: "你更喜欢哪种庆祝方式：",
    options: [
      { text: "举办大型派对，邀请所有人", score: 1, type: "E" },
      { text: "和少数亲友安静地共进晚餐", score: 1, type: "I" }
    ]
  },
  {
    id: 21,
    dimension: "EI",
    question: "在工作中，你更倾向于：",
    options: [
      { text: "通过协作和头脑风暴产生想法", score: 1, type: "E" },
      { text: "独自工作，减少干扰", score: 1, type: "I" }
    ]
  },
  {
    id: 22,
    dimension: "EI",
    question: "你更容易被哪种情况耗尽能量：",
    options: [
      { text: "连续的会议和社交活动", score: 1, type: "I" },
      { text: "连续的独处和缺乏交流", score: 1, type: "E" }
    ]
  },
  {
    id: 23,
    dimension: "EI",
    question: "你通常：",
    options: [
      { text: "边说边想，通过说话来理清思路", score: 1, type: "E" },
      { text: "想好了再说，表达经过深思熟虑", score: 1, type: "I" }
    ]
  },
  // SN维度 - 前5题（免费版）
  {
    id: 24,
    dimension: "SN",
    question: "你更关注：",
    options: [
      { text: "具体的事实、细节和当下现实", score: 1, type: "S" },
      { text: "整体模式、未来可能性和隐含意义", score: 1, type: "N" }
    ]
  },
  {
    id: 25,
    dimension: "SN",
    question: "你更喜欢哪种类型的书：",
    options: [
      { text: "写实小说、传记或实用指南", score: 1, type: "S" },
      { text: "科幻、哲学或充满隐喻的文学", score: 1, type: "N" }
    ]
  },
  {
    id: 26,
    dimension: "SN",
    question: "当你计划旅行时，你更关注：",
    options: [
      { text: "酒店、交通、餐厅等具体细节", score: 1, type: "S" },
      { text: "文化氛围、历史背景和整体体验", score: 1, type: "N" }
    ]
  },
  {
    id: 27,
    dimension: "SN",
    question: "你更倾向于：",
    options: [
      { text: "相信经验，相信'眼见为实'", score: 1, type: "S" },
      { text: "相信直觉，相信'第六感'", score: 1, type: "N" }
    ]
  },
  {
    id: 28,
    dimension: "SN",
    question: "你更喜欢哪种老师：",
    options: [
      { text: "注重事实、步骤和具体例子的", score: 1, type: "S" },
      { text: "注重概念、联想和抽象理论的", score: 1, type: "N" }
    ]
  },

  // ========== 深度付费版 - 后65题 ==========
  // SN维度 - 剩余18题
  {
    id: 29,
    dimension: "SN",
    question: "你更擅长：",
    options: [
      { text: "关注当下，处理眼前具体问题", score: 1, type: "S" },
      { text: "展望未来，规划长期愿景", score: 1, type: "N" }
    ]
  },
  {
    id: 30,
    dimension: "SN",
    question: "你更喜欢哪种工作：",
    options: [
      { text: "有明确流程、可量化结果的实际操作", score: 1, type: "S" },
      { text: "需要创新、探索新方法的研发工作", score: 1, type: "N" }
    ]
  },
  {
    id: 31,
    dimension: "SN",
    question: "你更倾向于：",
    options: [
      { text: "按部就班，遵循已证明有效的方法", score: 1, type: "S" },
      { text: "尝试新方法，寻找更优解决方案", score: 1, type: "N" }
    ]
  },
  {
    id: 32,
    dimension: "SN",
    question: "你更欣赏哪种描述：",
    options: [
      { text: "精确、具体、实事求是的", score: 1, type: "S" },
      { text: "形象、比喻、富有想象力的", score: 1, type: "N" }
    ]
  },
  {
    id: 33,
    dimension: "SN",
    question: "当学习新事物时，你更喜欢：",
    options: [
      { text: "从基础开始，逐步构建", score: 1, type: "S" },
      { text: "先了解整体框架，再填充细节", score: 1, type: "N" }
    ]
  },
  {
    id: 34,
    dimension: "SN",
    question: "你更信任：",
    options: [
      { text: "过去的经验和确凿的数据", score: 1, type: "S" },
      { text: "未来的可能性和创新的想法", score: 1, type: "N" }
    ]
  },
  {
    id: 35,
    dimension: "SN",
    question: "你更喜欢哪种类型的艺术：",
    options: [
      { text: "写实主义、摄影或传统艺术", score: 1, type: "S" },
      { text: "抽象派、概念艺术或现代艺术", score: 1, type: "N" }
    ]
  },
  {
    id: 36,
    dimension: "SN",
    question: "你更倾向于：",
    options: [
      { text: "关注'是什么'，处理具体信息", score: 1, type: "S" },
      { text: "关注'可能是什么'，探索隐含意义", score: 1, type: "N" }
    ]
  },
  {
    id: 37,
    dimension: "SN",
    question: "你更容易注意到：",
    options: [
      { text: "环境中的细节变化，如温度、气味", score: 1, type: "S" },
      { text: "环境中的潜在可能性，如改进空间", score: 1, type: "N" }
    ]
  },
  {
    id: 38,
    dimension: "SN",
    question: "你更喜欢哪种说话方式：",
    options: [
      { text: "具体、明确、描述细节的", score: 1, type: "S" },
      { text: "概括、抽象、使用类比和隐喻的", score: 1, type: "N" }
    ]
  },
  {
    id: 39,
    dimension: "SN",
    question: "你更重视：",
    options: [
      { text: "实用性和可行性", score: 1, type: "S" },
      { text: "创新性和独特性", score: 1, type: "N" }
    ]
  },
  {
    id: 40,
    dimension: "SN",
    question: "你更倾向于：",
    options: [
      { text: "享受已经拥有的，珍惜当下", score: 1, type: "S" },
      { text: "追求未实现的，憧憬未来", score: 1, type: "N" }
    ]
  },
  {
    id: 41,
    dimension: "SN",
    question: "你更喜欢哪种解决问题的方式：",
    options: [
      { text: "参考过往案例，使用经验方法", score: 1, type: "S" },
      { text: "brainstorm新方案，跳出框架思考", score: 1, type: "N" }
    ]
  },
  {
    id: 42,
    dimension: "SN",
    question: "你更关注生活中的：",
    options: [
      { text: "具体的日常事务和实际责任", score: 1, type: "S" },
      { text: "深层意义和人生方向", score: 1, type: "N" }
    ]
  },
  {
    id: 43,
    dimension: "SN",
    question: "你更可能被哪种情况困扰：",
    options: [
      { text: "缺乏具体细节，过于抽象", score: 1, type: "S" },
      { text: "陷入日常琐事，缺乏想象空间", score: 1, type: "N" }
    ]
  },
  {
    id: 44,
    dimension: "SN",
    question: "你更倾向于：",
    options: [
      { text: "写实，描述事实本身", score: 1, type: "S" },
      { text: "象征，赋予事物特殊含义", score: 1, type: "N" }
    ]
  },
  {
    id: 45,
    dimension: "SN",
    question: "你更喜欢哪种类型的信息：",
    options: [
      { text: "具体的、可验证的、实用的", score: 1, type: "S" },
      { text: "概念性的、启发性的、理论的", score: 1, type: "N" }
    ]
  },
  {
    id: 46,
    dimension: "SN",
    question: "你更容易记住：",
    options: [
      { text: "具体的数字、日期、名字等细节", score: 1, type: "S" },
      { text: "整体印象、感觉和模式", score: 1, type: "N" }
    ]
  },

  // TF维度 - 23题
  {
    id: 47,
    dimension: "TF",
    question: "在做决策时，你更重视：",
    options: [
      { text: "逻辑分析、客观标准和公平原则", score: 1, type: "T" },
      { text: "个人价值观、人情味和和谐", score: 1, type: "F" }
    ]
  },
  {
    id: 48,
    dimension: "TF",
    question: "当朋友向你抱怨时，你通常会：",
    options: [
      { text: "帮TA分析问题，提供解决方案", score: 1, type: "T" },
      { text: "先给予情感支持，倾听和理解", score: 1, type: "F" }
    ]
  },
  {
    id: 49,
    dimension: "TF",
    question: "你更倾向于：",
    options: [
      { text: "实话实说，即使可能伤害感情", score: 1, type: "T" },
      { text: "委婉表达，优先维护关系和谐", score: 1, type: "F" }
    ]
  },
  {
    id: 50,
    dimension: "TF",
    question: "你更欣赏哪种领导：",
    options: [
      { text: "能力强、决策果断、注重效率的", score: 1, type: "T" },
      { text: "关心下属、善于倾听、注重团队的", score: 1, type: "F" }
    ]
  },
  {
    id: 51,
    dimension: "TF",
    question: "你更讨厌哪种批评：",
    options: [
      { text: "被说成'不专业'、'没逻辑'", score: 1, type: "T" },
      { text: "被说成'自私'、'冷漠'", score: 1, type: "F" }
    ]
  },
  {
    id: 52,
    dimension: "TF",
    question: "你更重视：",
    options: [
      { text: "事情的真相和正确性", score: 1, type: "T" },
      { text: "人际关系的和睦与融洽", score: 1, type: "F" }
    ]
  },
  {
    id: 53,
    dimension: "TF",
    question: "在工作中，你更倾向于：",
    options: [
      { text: "基于数据和事实做客观判断", score: 1, type: "T" },
      { text: "考虑对人的影响做价值判断", score: 1, type: "F" }
    ]
  },
  {
    id: 54,
    dimension: "TF",
    question: "你更难以接受：",
    options: [
      { text: "不公平、不一致的规则", score: 1, type: "T" },
      { text: "残忍、伤害他人的行为", score: 1, type: "F" }
    ]
  },
  {
    id: 55,
    dimension: "TF",
    question: "你更擅长：",
    options: [
      { text: "发现逻辑错误，进行批判性思考", score: 1, type: "T" },
      { text: "理解他人感受，建立情感连接", score: 1, type: "F" }
    ]
  },
  {
    id: 56,
    dimension: "TF",
    question: "你更倾向于：",
    options: [
      { text: "对事不对人，坚持原则", score: 1, type: "T" },
      { text: "因人而异，灵活变通", score: 1, type: "F" }
    ]
  },
  {
    id: 57,
    dimension: "TF",
    question: "你更重视哪种认可：",
    options: [
      { text: "因为工作成果和能力被认可", score: 1, type: "T" },
      { text: "因为善良和乐于助人被认可", score: 1, type: "F" }
    ]
  },
  {
    id: 58,
    dimension: "TF",
    question: "当团队冲突时，你更倾向于：",
    options: [
      { text: "找出谁对谁错，公正解决", score: 1, type: "T" },
      { text: "寻求双方都能接受的妥协方案", score: 1, type: "F" }
    ]
  },
  {
    id: 59,
    dimension: "TF",
    question: "你更倾向于：",
    options: [
      { text: "被视为能力强的专业人士", score: 1, type: "T" },
      { text: "被视为温暖友善的好朋友", score: 1, type: "F" }
    ]
  },
  {
    id: 60,
    dimension: "TF",
    question: "你更难容忍：",
    options: [
      { text: "愚蠢的错误和无效的方法", score: 1, type: "T" },
      { text: "刻薄的态度和不近人情", score: 1, type: "F" }
    ]
  },
  {
    id: 61,
    dimension: "TF",
    question: "你更倾向于：",
    options: [
      { text: "先完成任务，再考虑感受", score: 1, type: "T" },
      { text: "先照顾感受，再考虑任务", score: 1, type: "F" }
    ]
  },
  {
    id: 62,
    dimension: "TF",
    question: "你更喜欢哪种电影：",
    options: [
      { text: "悬疑、推理、剧情逻辑严密的", score: 1, type: "T" },
      { text: "温情、感人、人物关系丰富的", score: 1, type: "F" }
    ]
  },
  {
    id: 63,
    dimension: "TF",
    question: "你更关注：",
    options: [
      { text: "公平、正义和系统性", score: 1, type: "T" },
      { text: "同情、包容和人性化", score: 1, type: "F" }
    ]
  },
  {
    id: 64,
    dimension: "TF",
    question: "你更倾向于：",
    options: [
      { text: "列出优缺点清单来做决定", score: 1, type: "T" },
      { text: "听从内心的声音来做决定", score: 1, type: "F" }
    ]
  },
  {
    id: 65,
    dimension: "TF",
    question: "你更难以忍受：",
    options: [
      { text: "情绪化、缺乏逻辑的争论", score: 1, type: "T" },
      { text: "冷血、没有人情味的决定", score: 1, type: "F" }
    ]
  },
  {
    id: 66,
    dimension: "TF",
    question: "你更重视：",
    options: [
      { text: "真理和效率", score: 1, type: "T" },
      { text: "和谐与共情", score: 1, type: "F" }
    ]
  },
  {
    id: 67,
    dimension: "TF",
    question: "你更倾向于：",
    options: [
      { text: "直接指出问题，帮助对方改进", score: 1, type: "T" },
      { text: "考虑对方感受，委婉提醒", score: 1, type: "F" }
    ]
  },
  {
    id: 68,
    dimension: "TF",
    question: "你更认同：",
    options: [
      { text: "感情用事是软弱的", score: 1, type: "T" },
      { text: "感情用事是有人情味的", score: 1, type: "F" }
    ]
  },
  {
    id: 69,
    dimension: "TF",
    question: "你更倾向于：",
    options: [
      { text: "被视为理性、客观的人", score: 1, type: "T" },
      { text: "被视为感性、热心的人", score: 1, type: "F" }
    ]
  },

  // JP维度 - 24题
  {
    id: 70,
    dimension: "JP",
    question: "你更喜欢的生活方式是：",
    options: [
      { text: "有计划、有条理、可预测的", score: 1, type: "J" },
      { text: "灵活、随性、保持开放的", score: 1, type: "P" }
    ]
  },
  {
    id: 71,
    dimension: "JP",
    question: "面对截止日期，你通常：",
    options: [
      { text: "提前完成，避免最后一刻的压力", score: 1, type: "J" },
      { text: "在最后期限前冲刺，享受压力下的高效", score: 1, type: "P" }
    ]
  },
  {
    id: 72,
    dimension: "JP",
    question: "你的桌面通常是：",
    options: [
      { text: "整洁有序，东西各归其位", score: 1, type: "J" },
      { text: "有点凌乱，但你知道东西在哪", score: 1, type: "P" }
    ]
  },
  {
    id: 73,
    dimension: "JP",
    question: "你更倾向于：",
    options: [
      { text: "制定详细计划，按计划执行", score: 1, type: "J" },
      { text: "随机应变，根据实际情况调整", score: 1, type: "P" }
    ]
  },
  {
    id: 74,
    dimension: "JP",
    question: "你更喜欢哪种旅行：",
    options: [
      { text: "提前订好所有机票酒店，有详细行程", score: 1, type: "J" },
      { text: "只定大方向，到了再说，随时改变计划", score: 1, type: "P" }
    ]
  },
  {
    id: 75,
    dimension: "JP",
    question: "你更讨厌哪种情况：",
    options: [
      { text: "事情悬而未决，没有定论", score: 1, type: "J" },
      { text: "被计划束缚，不能自由改变", score: 1, type: "P" }
    ]
  },
  {
    id: 76,
    dimension: "JP",
    question: "你更倾向于：",
    options: [
      { text: "喜欢完成任务的满足感", score: 1, type: "J" },
      { text: "喜欢开始新项目的兴奋感", score: 1, type: "P" }
    ]
  },
  {
    id: 77,
    dimension: "JP",
    question: "你更喜欢哪种工作环境：",
    options: [
      { text: "有明确目标、流程清晰、可预期的", score: 1, type: "J" },
      { text: "灵活多变、鼓励创新、允许探索的", score: 1, type: "P" }
    ]
  },
  {
    id: 78,
    dimension: "JP",
    question: "你更重视：",
    options: [
      { text: "决定性和结论", score: 1, type: "J" },
      { text: "可能性和选项", score: 1, type: "P" }
    ]
  },
  {
    id: 79,
    dimension: "JP",
    question: "你更倾向于：",
    options: [
      { text: "先做必须做的事，再做想做的事", score: 1, type: "J" },
      { text: "先做有趣的事，必要的事最后做", score: 1, type: "P" }
    ]
  },
  {
    id: 80,
    dimension: "JP",
    question: "你更喜欢哪种状态：",
    options: [
      { text: "事情已经决定，可以安心执行", score: 1, type: "J" },
      { text: "保持选择开放，留有回旋余地", score: 1, type: "P" }
    ]
  },
  {
    id: 81,
    dimension: "JP",
    question: "你更倾向于：",
    options: [
      { text: "列出待办清单，逐项完成", score: 1, type: "J" },
      { text: "想起来就做，不喜欢被清单束缚", score: 1, type: "P" }
    ]
  },
  {
    id: 82,
    dimension: "JP",
    question: "你更难以忍受：",
    options: [
      { text: "混乱、无序、失控感", score: 1, type: "J" },
      { text: "被规则、期限、承诺限制", score: 1, type: "P" }
    ]
  },
  {
    id: 83,
    dimension: "JP",
    question: "你更倾向于：",
    options: [
      { text: "早点决定，尽早确定", score: 1, type: "J" },
      { text: "等等看，直到最后一刻再决定", score: 1, type: "P" }
    ]
  },
  {
    id: 84,
    dimension: "JP",
    question: "你更喜欢哪种类型的游戏：",
    options: [
      { text: "有明确规则、目标和结局的", score: 1, type: "J" },
      { text: "开放世界、自由探索、没有固定结局的", score: 1, type: "P" }
    ]
  },
  {
    id: 85,
    dimension: "JP",
    question: "你更倾向于：",
    options: [
      { text: "把工作分成几个阶段，按部就班完成", score: 1, type: "J" },
      { text: "在截止日期前集中火力完成", score: 1, type: "P" }
    ]
  },
  {
    id: 86,
    dimension: "JP",
    question: "你更重视：",
    options: [
      { text: "结果和成就", score: 1, type: "J" },
      { text: "过程和体验", score: 1, type: "P" }
    ]
  },
  {
    id: 87,
    dimension: "JP",
    question: "你更倾向于：",
    options: [
      { text: "遵守承诺，说到做到", score: 1, type: "J" },
      { text: "根据实际情况调整承诺", score: 1, type: "P" }
    ]
  },
  {
    id: 88,
    dimension: "JP",
    question: "你更喜欢哪种购物方式：",
    options: [
      { text: "列好清单，买完就走", score: 1, type: "J" },
      { text: "随便逛逛，看心情买", score: 1, type: "P" }
    ]
  },
  {
    id: 89,
    dimension: "JP",
    question: "你更倾向于：",
    options: [
      { text: "喜欢Closure，有始有终", score: 1, type: "J" },
      { text: "喜欢Openness，保持开放", score: 1, type: "P" }
    ]
  },
  {
    id: 90,
    dimension: "JP",
    question: "你更难以忍受：",
    options: [
      { text: "事情没做完，留有尾巴", score: 1, type: "J" },
      { text: "被过早决定限制了可能性", score: 1, type: "P" }
    ]
  },
  {
    id: 91,
    dimension: "JP",
    question: "你更倾向于：",
    options: [
      { text: "喜欢确定性，讨厌惊喜", score: 1, type: "J" },
      { text: "喜欢惊喜，讨厌一成不变", score: 1, type: "P" }
    ]
  },
  {
    id: 92,
    dimension: "JP",
    question: "你更重视：",
    options: [
      { text: "组织和结构", score: 1, type: "J" },
      { text: "自发和适应", score: 1, type: "P" }
    ]
  },
  {
    id: 93,
    dimension: "JP",
    question: "你更倾向于：",
    options: [
      { text: "按计划行事", score: 1, type: "J" },
      { text: "顺其自然", score: 1, type: "P" }
    ]
  }
];

// 基础版题目数量
export const BASIC_QUESTION_COUNT = 28;

// 深度版题目数量
export const PRO_QUESTION_COUNT = 93;

// 获取基础版题目
export const getBasicQuestions = () => questions.slice(0, BASIC_QUESTION_COUNT);

// 获取深度版题目（29-93题）
export const getProQuestions = () => questions.slice(BASIC_QUESTION_COUNT);

// 获取所有题目
export const getAllQuestions = () => questions;

export default questions;
