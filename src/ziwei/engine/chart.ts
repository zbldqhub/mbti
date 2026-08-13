// 排盘总装：生辰 + 性别 → 完整命盘数据

import { next, STEMS, BRANCHES, JU_NAMES } from './constants';
import { getCalendarInfo } from './calendar';
import { getJuNum, getNayinName } from './nayin';
import { getMingBodyBranch, getPalaceNameIndex, getPalaceStem } from './palaces';
import { getZiweiBranch, placeMajorStars } from './majorStars';
import {
  zuofuYoubi, wenchangWenqu, dikongDijie, tiankuiTianyue, lucunYangTuo,
  huoling, tianma, tiankong, hongluanTianxi, tiankuTianxu, guchenGuasu,
  tianguanTianfu, jiekong, xunkong, tianxingTianyao, jieshen, tianwu,
  tianyue, yinsha, santaiBazuo, enguangTiangui, taifuFenggao,
} from './minorStars';
import { getSihua } from './sihua';
import { getBrightness } from './brightness';
import {
  isForward, getDaxian, getChangshengMap, getXiaoxianBranch, getMingZhu, getShenZhu,
} from './limits';
import type {
  BirthInput, ChartData, PalaceData, StarInstance, StarCategory, DaxianEntry,
} from '../types';

const AUX_STARS = new Set(['左辅', '右弼', '天魁', '天钺', '文昌', '文曲', '禄存', '天马']);
const SHA_STARS = new Set(['火星', '铃星', '擎羊', '陀罗', '地空', '地劫']);

function categoryOf(name: string): StarCategory {
  if (AUX_STARS.has(name)) return 'aux';
  if (SHA_STARS.has(name)) return 'sha';
  return 'misc';
}

export function buildChart(input: BirthInput): ChartData {
  const cal = getCalendarInfo(input.year, input.month, input.day, input.hour, input.minute);
  const { lunarMonth: m, lunarDay: d, hourBranch: h, yearStem: ys, yearBranch: yb } = cal;

  const yinyang = `${ys % 2 === 0 ? '阳' : '阴'}${input.gender === 'male' ? '男' : '女'}` as ChartData['yinyang'];
  const forward = isForward(ys, input.gender);

  // 命身宫
  const { ming, body } = getMingBodyBranch(m, h);

  // 五行局（命宫干支纳音）
  const mingStem = getPalaceStem(ys, ming);
  const juNum = getJuNum(mingStem, ming);
  void getNayinName;

  // ---- 汇集各宫星曜 ----
  const starMap = new Map<number, StarInstance[]>();
  const put = (branch: number, name: string, category?: StarCategory) => {
    const list = starMap.get(branch) ?? [];
    list.push({ name, category: category ?? categoryOf(name) });
    starMap.set(branch, list);
  };

  // 十四正曜
  const ziwei = getZiweiBranch(d, juNum);
  const majors = placeMajorStars(ziwei);
  for (const [star, branch] of Object.entries(majors)) {
    put(branch, star, 'major');
  }

  // 辅佐煞杂曜
  const { zuofu, youbi } = zuofuYoubi(m);
  put(zuofu, '左辅'); put(youbi, '右弼');
  const { wenchang, wenqu } = wenchangWenqu(h);
  put(wenchang, '文昌'); put(wenqu, '文曲');
  const { dikong, dijie } = dikongDijie(h);
  put(dikong, '地空'); put(dijie, '地劫');
  const { kui, yue } = tiankuiTianyue(ys);
  put(kui, '天魁'); put(yue, '天钺');
  const { lucun, qingyang, tuoluo } = lucunYangTuo(ys);
  put(lucun, '禄存'); put(qingyang, '擎羊'); put(tuoluo, '陀罗');
  const { huo, ling } = huoling(yb, h);
  put(huo, '火星'); put(ling, '铃星');
  put(tianma(yb), '天马');
  put(tiankong(yb), '天空');
  const { hongluan, tianxi } = hongluanTianxi(yb);
  put(hongluan, '红鸾'); put(tianxi, '天喜');
  const { ku, xu } = tiankuTianxu(yb);
  put(ku, '天哭'); put(xu, '天虚');
  const { gu, gua } = guchenGuasu(yb);
  put(gu, '孤辰'); put(gua, '寡宿');
  const { guan, fu } = tianguanTianfu(ys);
  put(guan, '天官'); put(fu, '天福');
  const jk = jiekong(ys);
  put(jk.zheng, '截空'); put(jk.bang, '截空');
  const xk = xunkong(ys, yb);
  put(xk.zheng, '旬空'); put(xk.bang, '旬空');
  const { xing, yao } = tianxingTianyao(m);
  put(xing, '天刑'); put(yao, '天姚');
  put(jieshen(m), '解神');
  put(tianwu(m), '天巫');
  put(tianyue(m), '天月');
  put(yinsha(m), '阴煞');
  const { santai, bazuo } = santaiBazuo(zuofu, youbi, d);
  put(santai, '三台'); put(bazuo, '八座');
  const { enguang, tiangui } = enguangTiangui(wenchang, wenqu, d);
  put(enguang, '恩光'); put(tiangui, '天贵');
  const { taifu, fenggao } = taifuFenggao(wenqu);
  put(taifu, '台辅'); put(fenggao, '封诰');

  // ---- 组装十二宫 ----
  const changshengMap = getChangshengMap(juNum, forward);
  const daxianSpecs = getDaxian(ming, juNum, forward);
  const daxianByBranch = new Map(daxianSpecs.map((s) => [s.branch, s]));

  const palaces: PalaceData[] = [];
  for (let branch = 0; branch < 12; branch++) {
    const nameIndex = getPalaceNameIndex(ming, branch);
    const dx = daxianByBranch.get(branch)!;
    // 小限岁数
    const xiaoxianAges: number[] = [];
    for (let age = 1; age <= 120; age++) {
      if (getXiaoxianBranch(yb, input.gender, age) === branch) xiaoxianAges.push(age);
    }
    palaces.push({
      branch,
      stem: getPalaceStem(ys, branch),
      nameIndex,
      isBodyPalace: branch === body,
      stars: starMap.get(branch) ?? [],
      changsheng: changshengMap[branch],
      daxianStart: dx.startAge,
      daxianEnd: dx.endAge,
      xiaoxianAges,
    });
  }

  // 天伤天使（按宫位）：阳男阴女天伤在交友、天使在疾厄；阴男阳女反之
  const shangNameIdx = forward ? 7 : 5; // 交友 / 疾厄
  const shiNameIdx = forward ? 5 : 7;
  for (const p of palaces) {
    if (p.nameIndex === shangNameIdx) p.stars.push({ name: '天伤', category: 'misc' });
    if (p.nameIndex === shiNameIdx) p.stars.push({ name: '天使', category: 'misc' });
  }

  // ---- 四化 ----
  const sihuaEntries = getSihua(ys);
  const sihua: ChartData['sihua'] = [];
  for (const { star, type } of sihuaEntries) {
    for (const p of palaces) {
      const inst = p.stars.find((s) => s.name === star);
      if (inst) {
        inst.sihua = type;
        sihua.push({ star, type, branch: p.branch });
        break;
      }
    }
  }

  // ---- 庙旺陷 ----
  for (const p of palaces) {
    for (const s of p.stars) {
      const b = getBrightness(s.name, p.branch);
      if (b !== undefined && b !== '') s.brightness = b;
    }
  }

  const daxian: DaxianEntry[] = daxianSpecs.map((s, i) => ({
    index: i,
    branch: s.branch,
    stem: getPalaceStem(ys, s.branch),
    startAge: s.startAge,
    endAge: s.endAge,
    palaceNameIndex: getPalaceNameIndex(ming, s.branch),
  }));

  return {
    name: input.name,
    gender: input.gender,
    yinyang,
    unknownTime: !!input.unknownTime,
    solarText: `${input.year}年${input.month}月${input.day}日 ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`,
    lunarYearGanZhi: cal.yearGanZhi,
    lunarYear: cal.lunarYear,
    lunarMonth: m,
    lunarDay: d,
    isLeapMonth: cal.isLeapMonth,
    lunarText: `${cal.lunarText} ${BRANCHES[h]}时`,
    hourBranch: h,
    yearStem: ys,
    yearBranch: yb,
    mingBranch: ming,
    bodyBranch: body,
    juNum,
    juName: JU_NAMES[juNum],
    mingZhu: getMingZhu(yb),
    shenZhu: getShenZhu(yb),
    palaces,
    daxian,
    xiaoxianStartBranch: getXiaoxianBranch(yb, input.gender, 1),
    sihua,
  };
}

/** 便捷导出：干支文本 */
export function ganZhiText(stem: number, branch: number): string {
  return `${STEMS[stem]}${BRANCHES[branch]}`;
}

export { next };
