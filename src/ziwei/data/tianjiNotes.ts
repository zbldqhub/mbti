// 天纪论断知识库（倪海厦《天纪·紫微斗数》实例讲义提炼）
// 用途：仅作 AI 解读层的参考素材，按命盘特征选择性注入 prompt。
// 注意：
// 1. 排盘引擎始终遵循中州派（王亭之）规则，本库不参与排盘计算。
// 2. 倪派部分断语涉及生死灾咎，入库文案一律改写为「风险提示 + 化解建议」，
//    严禁直白预言生死，注入时亦要求 AI 软化表述。
// 3. 内容来源：天纪第 5/12/13 集等实例逐字稿（紫微在子/在丑、半空折翅、
//    科权禄三会、小六壬等案例），摘录其可复用的论断模式。

import type { ChartData } from '../types';
import { next } from '../engine/constants';

export interface TianjiNote {
  id: string;
  /** 主题名（注入时作小标题） */
  title: string;
  /** 白话论断（含实例感，已软化为风险+建议表述） */
  text: string;
  /** 命中条件：与本命盘相关才注入 */
  match: (chart: ChartData) => boolean;
}

// ---------- 匹配辅助 ----------

function palaceHas(chart: ChartData, branch: number, star: string): boolean {
  return chart.palaces[branch].stars.some((s) => s.name === star);
}

function majorsIn(chart: ChartData, branch: number): string[] {
  return chart.palaces[branch].stars.filter((s) => s.category === 'major').map((s) => s.name);
}

/** 四化某化所在宫 */
function sihuaBranch(chart: ChartData, type: string): number | null {
  const e = chart.sihua.find((s) => s.type === type);
  return e ? e.branch : null;
}

/** 命宫三方四正（含本宫） */
function mingSFZ(chart: ChartData): number[] {
  const m = chart.mingBranch;
  return [m, next(m, 6), next(m, 4), next(m, 8)];
}

function starsInBranches(chart: ChartData, branches: number[]): Set<string> {
  const set = new Set<string>();
  for (const b of branches) for (const s of chart.palaces[b].stars) set.add(s.name);
  return set;
}

/** 某宫名对应的宫 */
function palaceByName(chart: ChartData, nameIndex: number) {
  return chart.palaces.find((p) => p.nameIndex === nameIndex)!;
}

// ---------- 论断条目 ----------

export const TIANJI_NOTES: TianjiNote[] = [
  {
    id: 'kql-sanhui',
    title: '科权禄三会',
    match: (c) => {
      const sfz = starsInBranches(c, mingSFZ(c));
      const types = new Set(c.sihua.filter((s) => sfz.has(s.star)).map((s) => s.type));
      return types.has('禄') && types.has('权') && types.has('科');
    },
    text: '化禄、化权、化科会于命宫三方四正，天纪实例中断为「一方之主」之命：一位女校长命造即此格，化科大限一到即走马上任。要点：此格之人不甘居人下，宜独当一面；若走自由业，最好兼顾教职或传道（名医、名律师兼任讲师即是此理——科名带来客户，教学相长）。从商还是从公，看大限会到禄还是会到权科。',
  },
  {
    id: 'ban-kong-zhe-chi',
    title: '半空折翅（凶格提醒）',
    match: (c) => {
      const ming = c.mingBranch;
      const dui = next(ming, 6);
      // 廉贞贪狼同陷巳亥，守命或冲命
      for (const b of [ming, dui]) {
        const majors = majorsIn(c, b);
        if ((b === 5 || b === 11) && majors.includes('廉贞') && majors.includes('贪狼')) return true;
      }
      // 化忌冲命
      const ji = sihuaBranch(c, '忌');
      return ji === dui;
    },
    text: '天纪称廉贞贪狼双陷巳亥（守命或对照命宫）以及化忌冲命为「半空折翅」，主 30–40 岁前后易遇人生重大挫折，实例中多为健康突发或重大变故。宜提前知晓、修身谨慎：中年前后特别注意身体与安全，该阶段宜守不宜攻，此即化解。',
  },
  {
    id: 'riyue-fanbei',
    title: '日月反背',
    match: (c) => {
      const sunB = c.palaces.find((p) => p.stars.some((s) => s.name === '太阳'))?.stars.find((s) => s.name === '太阳')?.brightness;
      const moonB = c.palaces.find((p) => p.stars.some((s) => s.name === '太阴'))?.stars.find((s) => s.name === '太阴')?.brightness;
      return sunB === '陷' && moonB === '陷';
    },
    text: '太阳太阴皆落陷，古称日月反背。天纪实例总结三点：一是工作易昼夜颠倒、适合夜间行业或轮班性质；二是六亲助力薄、宜自立；三是性情偏刚燥固执。若再逢化忌，更须注意与父母的缘分和健康。',
  },
  {
    id: 'wuqu-qisha',
    title: '武曲七杀同宫',
    match: (c) => {
      const m = majorsIn(c, c.mingBranch);
      return m.includes('武曲') && m.includes('七杀');
    },
    text: '武曲七杀同守，天纪断：女子逢之主孤军奋战、一生靠自己（古称孤鸾），婚姻宜晚宜柔；男子武职大利（军警司法外交）；主离祖异乡发迹；经商则劳多功少——此二星掌生杀之权而不掌财禄，求权不求财者宜。',
  },
  {
    id: 'fuxiang-zuocai',
    title: '府相会命（佐才格）',
    match: (c) => {
      const sfz = starsInBranches(c, mingSFZ(c));
      const hasFuXiang = sfz.has('天府') && sfz.has('天相');
      const types = new Set(c.sihua.filter((s) => sfz.has(s.star)).map((s) => s.type));
      return hasFuXiang && !(types.has('禄') && types.has('权') && types.has('科'));
    },
    text: '天府天相拱命而不见科权禄全会，天纪称为佐才之命：天生的辅佐人才，宜在大机构做专业幕僚、领高薪的二把手，比在台前独闯更顺遂。实例中此类人去私人企业做副手，安稳而富足。',
  },
  {
    id: 'tanlang-wu',
    title: '贪狼在午守命',
    match: (c) => c.mingBranch === 6 && palaceHas(c, 6, '贪狼'),
    text: '贪狼在午宫不作桃花论，反为武官星。天纪实例：午时贪狼入命者宜军警武职，体型瘦小精悍反主贵（所谓火形人）；若误作桃花批则全错。',
  },
  {
    id: 'tanlang-hai-zi',
    title: '贪狼在亥子守命',
    match: (c) => [0, 11].includes(c.mingBranch) && majorsIn(c, c.mingBranch).includes('贪狼'),
    text: '贪狼居亥子水宫为正格桃花星：人缘魅力出众、多才多艺，亦须节制欲望，防因嗜好分心误事。',
  },
  {
    id: 'huo-tan',
    title: '火贪格',
    match: (c) => {
      for (const b of mingSFZ(c)) {
        if (palaceHas(c, b, '贪狼') && palaceHas(c, b, '火星')) return true;
      }
      return false;
    },
    text: '贪狼与火星同宫为「火贪格」，主突发之贵：武职显达或意外暴起。若庙旺无伤，中年后易有一次跃升之机；唯暴起者须防暴落，得意时留退路。',
  },
  {
    id: 'tianxiang-ming',
    title: '天相坐命',
    match: (c) => majorsIn(c, c.mingBranch).includes('天相'),
    text: '天相为天上的宰相，坐命者是天生的辅佐人才，位高而权轻，宜副职、幕僚、协调之职。天纪提示：大限或流年逢天相，亦可同断——该十年/该年宜居副位辅佐，不必强求正印。',
  },
  {
    id: 'hongluan-huaji',
    title: '红鸾天喜逢忌',
    match: (c) => {
      const ji = sihuaBranch(c, '忌');
      if (ji === null) return false;
      return palaceHas(c, ji, '红鸾') || palaceHas(c, ji, '天喜');
    },
    text: '化忌与红鸾（或天喜）同宫，喜庆之星受纠缠，婚事易生变故。天纪实例：有人订婚后才发现对方尚未离婚。倪师经验：须「过忌」——化忌流年过去、红鸾天喜再动的年份，才宜谈婚论嫁；逢忌之年莫仓促定亲。',
  },
  {
    id: 'fude-taohua',
    title: '福德宫见红鸾天喜',
    match: (c) => {
      const fude = palaceByName(c, 10);
      return fude.stars.some((s) => s.name === '红鸾' || s.name === '天喜');
    },
    text: '红鸾天喜入福德宫，主一生感情丰富、异性缘不断，古断有多婚倾向；亦主晚年仍有伴，感情生活到老年不寂寞。',
  },
  {
    id: 'qianyi-hualu',
    title: '迁移宫化禄',
    match: (c) => {
      const lu = sihuaBranch(c, '禄');
      return lu !== null && c.palaces[lu].nameIndex === 6;
    },
    text: '化禄入迁移宫，外地大利之命：离乡发展比在出生地更有作为，财缘与贵人皆在远方。',
  },
  {
    id: 'tianzhai-huaji',
    title: '田宅宫化忌',
    match: (c) => {
      const ji = sihuaBranch(c, '忌');
      return ji !== null && c.palaces[ji].nameIndex === 9;
    },
    text: '化忌入田宅宫，古断「破祖业」。现代语境：不宜轻易以不动产为人作保，置业与处置房产须格外谨慎，防因轻信之人而破耗家财。',
  },
  {
    id: 'fumu-kong',
    title: '父母宫空弱',
    match: (c) => {
      const fumu = palaceByName(c, 11);
      const hasMajor = fumu.stars.some((s) => s.category === 'major');
      const hasJie = fumu.stars.some((s) => s.name === '地劫' || s.name === '地空');
      return !hasMajor && hasJie;
    },
    text: '父母宫空宫又逢空劫，主祖业无靠、亲缘助力薄，天纪所谓「六亲不靠」：宜白手自立，凡事靠自己闯出局面。',
  },
  {
    id: 'ziwei-wu-fu',
    title: '紫微无辅弼',
    match: (c) => {
      if (!majorsIn(c, c.mingBranch).includes('紫微')) return false;
      const sfz = starsInBranches(c, mingSFZ(c));
      return !(sfz.has('左辅') && sfz.has('右弼'));
    },
    text: '紫微守命却无左辅右弼朝拱，天纪谓之孤君：格局打折，主孤高自持、助力不足。宜主动经营团队与人脉，借人和补足格局。',
  },
  {
    id: 'lian-po',
    title: '廉贞破军（变动格）',
    match: (c) => {
      const m = majorsIn(c, c.mingBranch);
      return m.includes('廉贞') && m.includes('破军');
    },
    text: '廉贞破军同守，天纪视为波动剧烈的格局：人生中途易有大转折，防水险与突发变故；逢大限流年叠疾厄宫时尤须注意健康安全。安身之道在武职、技术或纪律行业。',
  },
  {
    id: 'sha-miao-xian',
    title: '煞星庙陷之别',
    match: (c) => {
      // 命身三方有煞星即可参考
      const sfz = mingSFZ(c);
      return sfz.some((b) => c.palaces[b].stars.some((s) => s.category === 'sha'));
    },
    text: '天纪看煞星重庙陷：煞星入庙如「看得到的煞」——凶处藏吉，风险有预警、可提前防范；煞星落陷如「看不到的煞」——吉处藏凶，表面顺遂时更要留一手。',
  },
  {
    id: 'nan-nv-you-bie',
    title: '男女有别',
    match: (c) => {
      const m = majorsIn(c, c.mingBranch);
      const hasShaPoLang = m.some((n) => ['七杀', '破军', '贪狼'].includes(n));
      return c.gender === 'female' && hasShaPoLang;
    },
    text: '女命得杀破狼等武官格局，天纪称为「男命女身」：事业上能力极强、不让须眉，但婚姻须用心经营，刚柔须济。实例中此类命格女性多为职场强人，感情则宜迟婚、宜柔化。',
  },
  {
    id: 'gu-xing-du-shou',
    title: '六煞星独守一宫',
    match: (c) => {
      // 某宫仅一颗煞星（无正曜无辅佐）——倪师：一星独守主凶灾
      for (const p of c.palaces) {
        const stars = p.stars;
        if (stars.length === 1 && stars[0].category === 'sha') return true;
      }
      return false;
    },
    text: '六煞星（羊陀火铃空劫）单星独守一宫而无正曜辅佐同临，天纪视为该宫对应领域的薄弱环节，行限至该宫时须防突发波折，所谓祸不单行，届时宜加倍谨慎。',
  },

  // ========== 以下为天纪案例集（讲义 1-12 + 第 10-15 集）扩充 ==========

  {
    id: 'ju-ri-ge',
    title: '巨日格',
    match: (c) => {
      const set = starsInBranches(c, mingSFZ(c));
      if (!set.has('太阳') || !set.has('巨门')) return false;
      const ok = (star: string) => {
        for (const b of mingSFZ(c)) {
          const s = c.palaces[b].stars.find((x) => x.name === star);
          if (s && (s.brightness === '庙' || s.brightness === '旺')) return true;
        }
        return false;
      };
      return ok('太阳') && ok('巨门');
    },
    text: '太阳、巨门皆庙旺而会命（同宫或对照皆成格），为巨日格：天纪断为大财之星、能言善道之名嘴，实例中多为经商做财团、格局宏大的生意人；大运走到此格同样主财。唯女命得此格，古断须兼看婚姻，宜以更用心经营感情来平衡。',
  },
  {
    id: 'riyue-bingming',
    title: '日月并明',
    match: (c) => {
      const ok = (star: string) => {
        for (const b of mingSFZ(c)) {
          const s = c.palaces[b].stars.find((x) => x.name === star);
          if (s && (s.brightness === '庙' || s.brightness === '旺')) return true;
        }
        return false;
      };
      return ok('太阳') && ok('太阴');
    },
    text: '太阳太阴皆庙旺会照命宫，为日月并明格：主做事左右逢源、一世荣华。天纪借此勉励：做「听明」之人（听而后明），而非只做聪明之人。',
  },
  {
    id: 'rili-zhongtian',
    title: '日丽中天',
    match: (c) => c.mingBranch === 6 && majorsIn(c, 6).includes('太阳'),
    text: '太阳在午宫守命为日丽中天格：一生如正午之日，光明显达；天纪实例中断武职大利（可至参谋总长）。大限走入午宫太阳，亦主该十年运势如日中天。',
  },
  {
    id: 'yingxing-rumiao',
    title: '英星入庙（破军居子午）',
    match: (c) => [0, 6].includes(c.mingBranch) && majorsIn(c, c.mingBranch).includes('破军'),
    text: '破军守命于子或午宫为英星入庙：男子英挺威重、发武官（军警法官外交官皆宜）；女子得此格则个性偏孤僻、不重利、晚婚为宜。男女皆主大器晚成。',
  },
  {
    id: 'zifu-zuoyuan',
    title: '紫府坐垣',
    match: (c) => {
      const m = majorsIn(c, c.mingBranch);
      return [2, 8].includes(c.mingBranch) && m.includes('紫微') && m.includes('天府');
    },
    text: '紫微天府同宫于寅申守命，为紫府坐垣格：南北斗星君同会，天纪断为「位列三台」之大贵格，主居高位、近权力核心，一生爵禄荣昌。',
  },
  {
    id: 'qisha-chaodou',
    title: '七杀朝斗',
    match: (c) => {
      const m = majorsIn(c, c.mingBranch);
      if (![2, 8].includes(c.mingBranch) || !m.includes('七杀')) return false;
      const opp = majorsIn(c, next(c.mingBranch, 6));
      return opp.includes('紫微') && opp.includes('天府');
    },
    text: '七杀守命于寅申、对宫紫微天府朝照，为七杀朝斗格：将星入命，主武贵、威震一方。天纪提示：命在申宜外出闯荡（向迁移方向发展），命在寅则守成亦荣。',
  },
  {
    id: 'shui-cheng-guie',
    title: '水澄桂萼',
    match: (c) => c.mingBranch === 0 && majorsIn(c, 0).includes('太阴'),
    text: '太阴在子宫守命（子夜明月当空），为水澄桂萼格：主清贵——为官者清廉顺遂；女命得之秀丽温婉、气质出众。',
  },
  {
    id: 'jiangxing-ruming',
    title: '将星入命（武贪丑未）',
    match: (c) => {
      const m = majorsIn(c, c.mingBranch);
      return [1, 7].includes(c.mingBranch) && m.includes('武曲') && m.includes('贪狼');
    },
    text: '武曲贪狼同宫于丑未守命，为将星格：武贵之命，中年后方大展（古以升为将领为喻）。天纪提醒：此类命早年多磨砺，星曜在后面的大限才发力，少年得志反非其所宜。',
  },
  {
    id: 'riyue-jiaming',
    title: '日月夹命',
    match: (c) => {
      const l = next(c.mingBranch, -1);
      const r = next(c.mingBranch, 1);
      const has = (b: number, star: string) => {
        const s = c.palaces[b].stars.find((x) => x.name === star);
        return !!s && (s.brightness === '庙' || s.brightness === '旺');
      };
      return (has(l, '太阳') && has(r, '太阴')) || (has(l, '太阴') && has(r, '太阳'));
    },
    text: '太阳太阴分居命宫两侧夹辅（且皆庙旺），为日月夹命格：主一世财禄不缺、左右逢源、多得贵人夹辅。',
  },
  {
    id: 'fubi-danxing',
    title: '辅弼单星守六亲宫',
    match: (c) => {
      // 兄弟/夫妻/子女/父母宫只见左辅或右弼其一
      for (const idx of [1, 2, 3, 11]) {
        const p = palaceByName(c, idx);
        const fu = p.stars.some((s) => s.name === '左辅');
        const bi = p.stars.some((s) => s.name === '右弼');
        if (fu !== bi) return true;
      }
      return false;
    },
    text: '左辅或右弼单星落入六亲宫（兄弟/夫妻/子女/父母），中州派与天纪同视为「不全」之象：主该宫亲缘有缺——夫妻宫单见主婚姻波折，兄弟宫单见主助力不足，宜后天用心经营弥补。',
  },
  {
    id: 'fuqi-lian-po-tan',
    title: '夫妻宫廉贪/廉破',
    match: (c) => {
      const m = majorsIn(c, palaceByName(c, 2).branch);
      return m.includes('廉贞') && (m.includes('贪狼') || m.includes('破军'));
    },
    text: '夫妻宫坐廉贞贪狼或廉贞破军，古籍视为婚姻重大考验之格。天纪实例中多见生离或变故。现代化解：务必迟婚、择偶首重品性、婚前多相处考验，婚后用心经营，忌冲动决策。',
  },
  {
    id: 'fuqi-tianfu-tianma',
    title: '夫妻宫天府带天马',
    match: (c) => {
      const p = palaceByName(c, 2);
      return p.stars.some((s) => s.name === '天府') && p.stars.some((s) => s.name === '天马');
    },
    text: '夫妻宫天府会天马，天纪称为「娶对老婆/嫁对郎」之配：配偶善理财、厚道、肯为你奔波吃苦。实例中此类配偶是命主一生最正确的「决策」。',
  },
  {
    id: 'fuqi-huake',
    title: '夫妻宫化科',
    match: (c) => {
      const ke = sihuaBranch(c, '科');
      return ke !== null && c.palaces[ke].nameIndex === 2;
    },
    text: '化科入夫妻宫，主配偶为专业技术或自由业人士（教师、医师、律师、会计师之属），与自己容易是同行或同专长，有共同语言。',
  },
  {
    id: 'taiyin-huaji-male',
    title: '男命太阴化忌',
    match: (c) => {
      if (c.gender !== 'male') return false;
      const ji = sihuaBranch(c, '忌');
      return ji !== null && palaceHas(c, ji, '太阴');
    },
    text: '男命逢太阴化忌，太阴主母亲与妻子：古断主婆媳不和、家庭内部多磨合。宜提前知晓、居中善为沟通桥梁，婚后居住适度分开可大大减少摩擦。',
  },
  {
    id: 'taiyang-xian-female',
    title: '女命太阳落陷',
    match: (c) => {
      if (c.gender !== 'female') return false;
      const sun = c.palaces.find((p) => p.stars.some((s) => s.name === '太阳'))?.stars.find((s) => s.name === '太阳');
      return sun?.brightness === '陷';
    },
    text: '女命的太阳代表父亲、丈夫、儿子。太阳落陷者古断此三者缘分较薄；天纪给的择偶建议：宜配年长六岁以上或有过婚史、心性成熟包容之人，感情反而稳固。',
  },
  {
    id: 'changqu-ruming',
    title: '文昌文曲入命',
    match: (c) => {
      const names = new Set(c.palaces[c.mingBranch].stars.map((s) => s.name));
      return names.has('文昌') || names.has('文曲');
    },
    text: '文昌文曲入命，主科甲声名：文笔佳、才学艺能出众（天纪举金庸、贝多芬为例）；若与太阴同会则偏才艺惊艳一路。昌曲会入财帛者，凭专业技术专长立业。',
  },
  {
    id: 'jiyue-tongliang-li',
    title: '机月同梁为吏人',
    match: (c) => {
      const set = starsInBranches(c, mingSFZ(c));
      return ['天机', '太阴', '天同', '天梁'].every((s) => set.has(s));
    },
    text: '机月同梁会命，天纪断「定为吏人」：宜公家单位、学校或大机构领固定薪水，除非科权禄会齐，否则不宜贸然经商创业。稳定即是此格之福。',
  },
];

/** 收集与本命盘相关的天纪论断（上限 max 条） */
export function collectTianjiNotes(chart: ChartData, max = 8): TianjiNote[] {
  const matched = TIANJI_NOTES.filter((n) => {
    try {
      return n.match(chart);
    } catch {
      return false;
    }
  });
  return matched.slice(0, max);
}