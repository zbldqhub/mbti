// 十二宫推断要点（依《推断框架》第四章整理）

export interface PalaceReading {
  name: string;
  meaning: string;
  /** 吉象 */
  auspicious: string;
  /** 凶象 */
  inauspicious: string;
}

/** 按宫名序号索引（0=命宫…11=父母） */
export const PALACE_READINGS: PalaceReading[] = [
  {
    name: '命宫',
    meaning: '一生格局、性格、意志与际遇的总纲。',
    auspicious: '主星入庙、吉化吉辅会集，主格局清贵、一生顺遂有为。',
    inauspicious: '主星落陷、煞忌交冲，主一生多磨砺，须以后天修为与抉择改善。',
  },
  {
    name: '兄弟宫',
    meaning: '兄弟姐妹、同侪、合作伙伴之缘。',
    auspicious: '吉曜守照，主兄弟和睦、同侪得力，合作可成。',
    inauspicious: '煞忌会集或辅佐单见，主兄弟缘薄、合作易生嫌隙，防被同侪拖累。',
  },
  {
    name: '夫妻宫',
    meaning: '婚姻状况、配偶性情、感情模式。',
    auspicious: '吉曜清星守照，主婚姻和谐、配偶贤达。',
    inauspicious: '煞忌桃花交集或辅佐单见，主感情波折、迟婚为宜，防刑克分离。',
  },
  {
    name: '子女宫',
    meaning: '子女缘分与性情，亦主晚辈、下属、学生。',
    auspicious: '吉曜守照，主子女贤孝有成、晚辈得力。',
    inauspicious: '煞忌重，主与子女晚辈缘薄或不和，防下属反叛。',
  },
  {
    name: '财帛宫',
    meaning: '求财方式、财运厚薄、理财能力。',
    auspicious: '财星（武曲、太阴、天府、禄存）或化禄化权守照，主财源丰厚、求财有道。',
    inauspicious: '煞忌空劫会集，主财来财去、破耗纠纷，理财须守。',
  },
  {
    name: '疾厄宫',
    meaning: '体质强弱、疾病倾向、灾厄。',
    auspicious: '吉曜守照，主体质康健、少病少灾。',
    inauspicious: '煞忌刑曜会集，主体弱多病或防意外伤害，宜注意养生。',
  },
  {
    name: '迁移宫',
    meaning: '出外运势、社会人缘、环境变动。',
    auspicious: '吉星会照，主出外得贵、异地发展顺利。',
    inauspicious: '煞忌会集，主出门多是非奔波，变动须谨慎。',
  },
  {
    name: '交友宫',
    meaning: '朋友、下属、合作伙伴之性质与关系。',
    auspicious: '吉曜守照，主得良友益友、下属忠诚得力。',
    inauspicious: '煞忌会集，主误交损友、受朋友拖累，防下属背弃。',
  },
  {
    name: '事业宫',
    meaning: '事业方向、职位高低、工作性质。',
    auspicious: '吉曜化权守照，主事业有成、职位升迁顺利。',
    inauspicious: '煞忌空劫会集，主事业多波折竞争、理想难酬，宜稳中求进。',
  },
  {
    name: '田宅宫',
    meaning: '不动产、家宅运、居住环境。',
    auspicious: '吉曜守照，主有产业、住屋安稳、置业顺利。',
    inauspicious: '煞忌空劫会集，主产业难守、搬迁频繁，置业宜慎。',
  },
  {
    name: '福德宫',
    meaning: '精神享受、思想倾向、福分厚薄（与命宫同参）。',
    auspicious: '吉曜守照，主精神富足、心境安乐、有福可享。',
    inauspicious: '煞忌会集，主劳心多忧、精神困扰，须修心养性。',
  },
  {
    name: '父母宫',
    meaning: '父母缘分、出身背景、上司关系，亦主相貌。',
    auspicious: '吉曜守照，主父母有助力、出身良好、得上司提携。',
    inauspicious: '煞忌或辅佐单见，主与父母缘薄、荫庇不足，早年须自立。',
  },
];
