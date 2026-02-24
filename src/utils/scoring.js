/**
 * MBTI 计分逻辑
 * 
 * 计分规则：
 * - 每个维度单独计分（E/I, S/N, T/F, J/P）
 * - 每题选择对应类型加1分
 * - 最终根据各维度得分比例确定类型
 * 
 * 类型判定：
 * - E/I: E得分 > I得分则为E，反之为I
 * - S/N: S得分 > N得分则为S，反之为N
 * - T/F: T得分 > F得分则为T，反之为F
 * - J/P: J得分 > P得分则为J，反之为P
 */

// 初始化分数对象
export const initScores = () => ({
  E: 0, I: 0,
  S: 0, N: 0,
  T: 0, F: 0,
  J: 0, P: 0
});

// 维度映射
export const dimensionMap = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P']
};

// 类型名称映射
export const typeNames = {
  'ISTJ': '检查者',
  'ISFJ': '保护者',
  'INFJ': '提倡者',
  'INTJ': '建筑师',
  'ISTP': '鉴赏家',
  'ISFP': '探险家',
  'INFP': '调停者',
  'INTP': '逻辑学家',
  'ESTP': '企业家',
  'ESFP': '表演者',
  'ENFP': '竞选者',
  'ENTP': '辩论家',
  'ESTJ': '总经理',
  'ESFJ': '执政官',
  'ENFJ': '主人公',
  'ENTJ': '指挥官'
};

// 类型关键词映射
export const typeKeywords = {
  'ISTJ': ['务实', '可靠', '传统'],
  'ISFJ': ['温暖', '负责', '细心'],
  'INFJ': ['理想', '洞察', '坚定'],
  'INTJ': ['战略', '独立', '高效'],
  'ISTP': ['灵活', '理性', '实用'],
  'ISFP': ['艺术', '敏感', '随和'],
  'INFP': ['诗意', '善良', '理想'],
  'INTP': ['逻辑', '好奇', '客观'],
  'ESTP': '活力', 'ESFP': '热情', 'ENFP': '创意', 'ENTP': '机智',
  'ESTJ': '组织', 'ESFJ': '关怀', 'ENFJ': '领袖', 'ENTJ': '果断'
};

// 类型描述映射
export const typeDescriptions = {
  'ISTJ': {
    traits: [
      '你注重实际，脚踏实地，是值得信赖的人',
      '你喜欢有结构、有组织的生活方式',
      '你重视传统和稳定，做事认真负责'
    ],
    careers: ['会计', '审计', '行政管理', '法律', '工程'],
    relationships: '你在感情中忠诚可靠，重视承诺，但可能不太善于表达情感'
  },
  'ISFJ': {
    traits: [
      '你温柔体贴，总是关心他人的需求',
      '你有很强的责任感，默默付出不求回报',
      '你重视和谐，善于创造温馨的氛围'
    ],
    careers: ['护士', '教师', '社工', '行政管理', '客户服务'],
    relationships: '你是体贴的伴侣，善于照顾人，但有时会忽略自己的需求'
  },
  'INFJ': {
    traits: [
      '你有深刻的洞察力，能理解他人内心',
      '你追求有意义的生活，有强烈的使命感',
      '你富有创造力，善于用独特的方式表达自己'
    ],
    careers: ['心理咨询师', '作家', '艺术家', '人力资源', '教育顾问'],
    relationships: '你渴望深层次的连接，是理解和支持伴侣的理想主义者'
  },
  'INTJ': {
    traits: [
      '你有卓越的战略思维，善于规划未来',
      '你独立自主，追求知识和能力的提升',
      '你高效务实，对目标有坚定的执行力'
    ],
    careers: ['科学家', '工程师', '投资分析师', '战略顾问', '技术主管'],
    relationships: '你重视智慧和独立，需要一个能理解你思维深度的伴侣'
  },
  'ISTP': {
    traits: [
      '你灵活应变，善于解决实际问题',
      '你理性冷静，在危机中保持镇定',
      '你喜欢动手操作，对机械和技术有天赋'
    ],
    careers: ['工程师', '技术员', '飞行员', '运动员', '侦探'],
    relationships: '你享受自由，需要一个能给你空间的伴侣'
  },
  'ISFP': {
    traits: [
      '你敏感细腻，对美有独特的感知',
      '你随和友善，不喜欢冲突和争论',
      '你活在当下，享受生活的每一刻'
    ],
    careers: ['艺术家', '设计师', '音乐家', '厨师', '摄影师'],
    relationships: '你是温柔浪漫的伴侣，用行动而非言语表达爱意'
  },
  'INFP': {
    traits: [
      '你富有同情心，总是为他人着想',
      '你有丰富的内心世界和创造力',
      '你追求真实和意义，不愿妥协价值观'
    ],
    careers: ['作家', '心理咨询师', '社工', '教师', '艺术家'],
    relationships: '你是浪漫而忠诚的伴侣，渴望灵魂深处的共鸣'
  },
  'INTP': {
    traits: [
      '你逻辑思维强，喜欢探索理论和概念',
      '你客观理性，善于分析问题本质',
      '你充满好奇心，不断追求新知识'
    ],
    careers: ['科学家', '程序员', '哲学家', '数据分析师', '研究员'],
    relationships: '你重视智力交流，需要一个能激发你思考的伴侣'
  },
  'ESTP': {
    traits: [
      '你精力充沛，喜欢冒险和刺激',
      '你务实直接，善于抓住机会',
      '你社交能力强，是聚会的焦点'
    ],
    careers: ['销售', '企业家', '运动员', '急救人员', '经纪人'],
    relationships: '你热情直接，喜欢一起体验新鲜事物的伴侣'
  },
  'ESFP': {
    traits: [
      '你热情开朗，是大家的开心果',
      '你喜欢成为焦点，享受表演的乐趣',
      '你随性自在，讨厌被束缚'
    ],
    careers: ['演员', '销售', '活动策划', '公关', '主持人'],
    relationships: '你是热情浪漫的伴侣，喜欢制造惊喜和欢乐'
  },
  'ENFP': {
    traits: [
      '你充满热情，总能感染周围的人',
      '你创意无限，总有新奇的想法',
      '你追求自由，讨厌被规则和惯例束缚'
    ],
    careers: ['创意总监', '市场营销', '记者', '演员', '创业者'],
    relationships: '你是充满激情的伴侣，需要一个能和你一起探索世界的人'
  },
  'ENTP': {
    traits: [
      '你机智幽默，喜欢智力挑战',
      '你善于辩论，享受思想碰撞',
      '你创新求变，讨厌一成不变'
    ],
    careers: ['律师', '创业者', '顾问', '发明家', '战略家'],
    relationships: '你聪明有趣，需要一个能跟上你思维节奏的伴侣'
  },
  'ESTJ': {
    traits: [
      '你组织能力强，善于管理团队',
      '你务实高效，重视结果和成就',
      '你遵守规则，是传统和秩序的维护者'
    ],
    careers: ['管理者', '军官', '法官', '项目经理', '财务主管'],
    relationships: '你是可靠负责的伴侣，用实际行动表达关心'
  },
  'ESFJ': {
    traits: [
      '你热心助人，总是关心他人的感受',
      '你善于社交，是团队和谐的维护者',
      '你重视传统，喜欢营造温馨的氛围'
    ],
    careers: ['教师', '护士', '社工', 'HR', '客户服务经理'],
    relationships: '你是体贴周到的伴侣，重视家庭和社交生活'
  },
  'ENFJ': {
    traits: [
      '你有领袖魅力，善于激励他人',
      '你富有同理心，能理解他人需求',
      '你追求和谐，致力于帮助他人成长'
    ],
    careers: ['培训师', '咨询师', '政治家', '非营利组织负责人', '教练'],
    relationships: '你是温暖支持的伴侣，致力于帮助对方成为最好的自己'
  },
  'ENTJ': {
    traits: [
      '你有天生的领导才能，善于制定战略',
      '你果断自信，追求效率和成果',
      '你目标明确，有强大的执行力'
    ],
    careers: ['CEO', '管理顾问', '律师', '投资银行家', '创业者'],
    relationships: '你是雄心勃勃的伴侣，欣赏同样有抱负的人'
  }
};

// 深度报告内容
export const deepReports = {
  cognitiveFunctions: {
    'INTJ': {
      primary: 'Ni（内倾直觉）- 洞察本质，预见未来',
      secondary: 'Te（外倾思维）- 高效执行，达成目标',
      tertiary: 'Fi（内倾情感）- 内心价值观',
      inferior: 'Se（外倾感觉）- 当下体验'
    },
    'INTP': {
      primary: 'Ti（内倾思维）- 逻辑分析，追求真理',
      secondary: 'Ne（外倾直觉）- 探索可能性',
      tertiary: 'Si（内倾感觉）- 经验积累',
      inferior: 'Fe（外倾情感）- 社交和谐'
    },
    'ENTJ': {
      primary: 'Te（外倾思维）- 组织管理，高效决策',
      secondary: 'Ni（内倾直觉）- 战略洞察',
      tertiary: 'Se（外倾感觉）- 当下行动',
      inferior: 'Fi（内倾情感）- 个人价值'
    },
    'ENTP': {
      primary: 'Ne（外倾直觉）- 创新探索，发现可能',
      secondary: 'Ti（内倾思维）- 逻辑分析',
      tertiary: 'Fe（外倾情感）- 人际互动',
      inferior: 'Si（内倾感觉）- 传统经验'
    },
    'INFJ': {
      primary: 'Ni（内倾直觉）- 深度洞察，预见趋势',
      secondary: 'Fe（外倾情感）- 关怀他人',
      tertiary: 'Ti（内倾思维）- 逻辑分析',
      inferior: 'Se（外倾感觉）- 感官体验'
    },
    'INFP': {
      primary: 'Fi（内倾情感）- 内心价值，真实自我',
      secondary: 'Ne（外倾直觉）- 创意探索',
      tertiary: 'Si（内倾感觉）- 情感记忆',
      inferior: 'Te（外倾思维）- 外部效率'
    },
    'ENFJ': {
      primary: 'Fe（外倾情感）- 关怀他人，促进和谐',
      secondary: 'Ni（内倾直觉）- 洞察需求',
      tertiary: 'Se（外倾感觉）- 当下感知',
      inferior: 'Ti（内倾思维）- 逻辑分析'
    },
    'ENFP': {
      primary: 'Ne（外倾直觉）- 探索可能，激发创意',
      secondary: 'Fi（内倾情感）- 真实价值',
      tertiary: 'Te（外倾思维）- 实现想法',
      inferior: 'Si（内倾感觉）- 传统经验'
    },
    'ISTJ': {
      primary: 'Si（内倾感觉）- 经验积累，细节关注',
      secondary: 'Te（外倾思维）- 高效执行',
      tertiary: 'Fi（内倾情感）- 内心价值',
      inferior: 'Ne（外倾直觉）- 新可能性'
    },
    'ISFJ': {
      primary: 'Si（内倾感觉）- 细节记忆，传统维护',
      secondary: 'Fe（外倾情感）- 关怀他人',
      tertiary: 'Ti（内倾思维）- 逻辑分析',
      inferior: 'Ne（外倾直觉）- 新可能性'
    },
    'ESTJ': {
      primary: 'Te（外倾思维）- 组织管理，结果导向',
      secondary: 'Si（内倾感觉）- 经验借鉴',
      tertiary: 'Ne（外倾直觉）- 新思路',
      inferior: 'Fi（内倾情感）- 个人价值'
    },
    'ESFJ': {
      primary: 'Fe（外倾情感）- 社交和谐，关怀他人',
      secondary: 'Si（内倾感觉）- 传统维护',
      tertiary: 'Ne（外倾直觉）- 新可能',
      inferior: 'Ti（内倾思维）- 逻辑分析'
    },
    'ISTP': {
      primary: 'Ti（内倾思维）- 逻辑分析，问题解决',
      secondary: 'Se（外倾感觉）- 当下体验',
      tertiary: 'Ni（内倾直觉）- 洞察本质',
      inferior: 'Fe（外倾情感）- 社交和谐'
    },
    'ISFP': {
      primary: 'Fi（内倾情感）- 内心价值，真实表达',
      secondary: 'Se（外倾感觉）- 感官体验',
      tertiary: 'Ni（内倾直觉）- 深度洞察',
      inferior: 'Te（外倾思维）- 外部效率'
    },
    'ESTP': {
      primary: 'Se（外倾感觉）- 当下体验，行动导向',
      secondary: 'Ti（内倾思维）- 逻辑分析',
      tertiary: 'Fe（外倾情感）- 人际互动',
      inferior: 'Ni（内倾直觉）- 深度洞察'
    },
    'ESFP': {
      primary: 'Se（外倾感觉）- 感官享受，当下快乐',
      secondary: 'Fi（内倾情感）- 真实自我',
      tertiary: 'Te（外倾思维）- 实现目标',
      inferior: 'Ni（内倾直觉）- 深度洞察'
    }
  },
  stressMode: {
    'INTJ': '压力下可能过度关注细节，陷入完美主义，或突然爆发情绪',
    'INTP': '压力下可能变得情绪化，过度担忧，或逃避现实',
    'ENTJ': '压力下可能变得控制欲强，对他人不耐烦，或情绪化',
    'ENTP': '压力下可能变得固执，过度关注细节，或情绪不稳定',
    'INFJ': '压力下可能过度敏感，自我批评，或逃避社交',
    'INFP': '压力下可能变得挑剔，过度理性，或情绪封闭',
    'ENFJ': '压力下可能过度付出，忽视自己，或变得控制欲强',
    'ENFP': '压力下可能变得焦虑，过度担忧细节，或情绪不稳定',
    'ISTJ': '压力下可能变得焦虑，过度担忧未来，或情绪爆发',
    'ISFJ': '压力下可能过度担忧，想象最坏情况，或变得固执',
    'ESTJ': '压力下可能变得情绪化，过度敏感，或逃避责任',
    'ESFJ': '压力下可能变得冷漠，过度理性，或自我封闭',
    'ISTP': '压力下可能过度担忧未来，情绪爆发，或逃避问题',
    'ISFP': '压力下可能变得挑剔，过度批评，或情绪不稳定',
    'ESTP': '压力下可能过度担忧，想象最坏情况，或情绪封闭',
    'ESFP': '压力下可能变得焦虑，过度计划，或情绪爆发'
  },
  careerMatch: {
    'INTJ': ['战略顾问', '数据科学家', '系统架构师', '投资分析师', '研发总监'],
    'INTP': ['研究员', '算法工程师', '哲学家', '技术专家', '数据分析师'],
    'ENTJ': ['CEO', '管理顾问', '投资银行家', '律师', '企业家'],
    'ENTP': ['创业者', '产品经理', '咨询顾问', '发明家', '战略家'],
    'INFJ': ['心理咨询师', '作家', '教育顾问', 'HR总监', '非营利组织负责人'],
    'INFP': ['作家', '艺术家', '心理咨询师', '社工', '教师'],
    'ENFJ': ['培训师', '教练', '政治家', 'HR总监', '非营利组织负责人'],
    'ENFP': ['创意总监', '市场营销总监', '记者', '演员', '创业者'],
    'ISTJ': ['财务总监', '审计师', '项目经理', '法务主管', '运营经理'],
    'ISFJ': ['护士长', '教务主任', '行政经理', '客服总监', '社工主管'],
    'ESTJ': ['运营总监', '军官', '法官', '项目经理', '财务主管'],
    'ESFJ': ['HR经理', '客户服务总监', '教务主任', '护士长', '公关经理'],
    'ISTP': ['高级工程师', '飞行员', '法医', '运动员', '技术专家'],
    'ISFP': ['艺术总监', '设计师', '音乐家', '厨师长', '摄影师'],
    'ESTP': ['销售总监', '企业家', '运动教练', '急救医生', '经纪人'],
    'ESFP': ['公关总监', '主持人', '演员', '销售经理', '活动策划']
  }
};

/**
 * 计算MBTI类型
 * @param {Object} scores - 各维度分数对象
 * @returns {string} - 4字母MBTI类型
 */
export const calculateMBTIType = (scores) => {
  const type = [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P'
  ].join('');
  
  return type;
};

/**
 * 计算维度百分比
 * @param {Object} scores - 各维度分数对象
 * @returns {Object} - 各维度百分比
 */
export const calculatePercentages = (scores) => {
  const eiTotal = scores.E + scores.I;
  const snTotal = scores.S + scores.N;
  const tfTotal = scores.T + scores.F;
  const jpTotal = scores.J + scores.P;
  
  return {
    E: eiTotal > 0 ? Math.round((scores.E / eiTotal) * 100) : 50,
    I: eiTotal > 0 ? Math.round((scores.I / eiTotal) * 100) : 50,
    S: snTotal > 0 ? Math.round((scores.S / snTotal) * 100) : 50,
    N: snTotal > 0 ? Math.round((scores.N / snTotal) * 100) : 50,
    T: tfTotal > 0 ? Math.round((scores.T / tfTotal) * 100) : 50,
    F: tfTotal > 0 ? Math.round((scores.F / tfTotal) * 100) : 50,
    J: jpTotal > 0 ? Math.round((scores.J / jpTotal) * 100) : 50,
    P: jpTotal > 0 ? Math.round((scores.P / jpTotal) * 100) : 50
  };
};

/**
 * 更新分数
 * @param {Object} scores - 当前分数
 * @param {string} type - 选择的类型
 * @returns {Object} - 更新后的分数
 */
export const updateScore = (scores, type) => {
  return {
    ...scores,
    [type]: (scores[type] || 0) + 1
  };
};

/**
 * 获取类型信息
 * @param {string} type - MBTI类型
 * @returns {Object} - 类型详细信息
 */
export const getTypeInfo = (type) => {
  return {
    name: typeNames[type] || '未知类型',
    keywords: typeKeywords[type] || ['独特', '多面', '平衡'],
    description: typeDescriptions[type] || {
      traits: ['你是一个独特而复杂的人', '你有多重面向等待探索', '保持开放的心态'],
      careers: ['探索不同领域', '寻找适合的方向', '持续学习成长'],
      relationships: '真诚的关系建立在相互理解的基础上'
    }
  };
};

/**
 * 获取深度报告
 * @param {string} type - MBTI类型
 * @returns {Object} - 深度报告内容
 */
export const getDeepReport = (type) => {
  return {
    cognitiveFunctions: deepReports.cognitiveFunctions[type] || {
      primary: '认知功能分析',
      secondary: '需要完整测试解锁',
      tertiary: '继续答题查看详情',
      inferior: '深度报告专属内容'
    },
    stressMode: deepReports.stressMode[type] || '完成深度测试查看压力模式分析',
    careerMatch: deepReports.careerMatch[type] || ['完成深度测试查看详细职业匹配']
  };
};

export default {
  initScores,
  calculateMBTIType,
  calculatePercentages,
  updateScore,
  getTypeInfo,
  getDeepReport,
  typeNames,
  typeKeywords,
  typeDescriptions
};
