import type { ChartData, PalaceData } from '../types';
import { PALACE_NAMES } from '../types';
import { STEMS, BRANCHES } from '../engine/constants';

interface Props {
  chart: ChartData;
  palace: PalaceData;
  /** 当前大限宫高亮 */
  currentDaxianBranch?: number;
  /** 流年太岁宫高亮 */
  yearlyBranch?: number;
}

const SIHUA_CLASS: Record<string, string> = {
  禄: 'sh-lu', 权: 'sh-quan', 科: 'sh-ke', 忌: 'sh-ji',
};

export default function PalaceCell({ chart, palace, currentDaxianBranch, yearlyBranch }: Props) {
  const majors = palace.stars.filter((s) => s.category === 'major');
  const aux = palace.stars.filter((s) => s.category === 'aux');
  const sha = palace.stars.filter((s) => s.category === 'sha');
  const misc = palace.stars.filter((s) => s.category === 'misc');

  const classes = ['zw-cell'];
  if (palace.branch === chart.mingBranch) classes.push('is-ming');
  if (palace.branch === currentDaxianBranch) classes.push('is-daxian');
  if (palace.branch === yearlyBranch) classes.push('is-yearly');

  return (
    <div className={classes.join(' ')}>
      <div className="zw-cell-stars">
        <div className="zw-majors">
          {majors.map((s) => (
            <span key={s.name} className="zw-major">
              {s.name}
              {s.brightness && <sup className={`br-${s.brightness}`}>{s.brightness}</sup>}
              {s.sihua && <sup className={`zw-sh ${SIHUA_CLASS[s.sihua]}`}>{s.sihua}</sup>}
            </span>
          ))}
          {majors.length === 0 && <span className="zw-major empty">（借对宫）</span>}
        </div>
        <div className="zw-minors aux">
          {aux.map((s) => (
            <span key={s.name}>
              {s.name}
              {s.brightness && <sup className={`br-${s.brightness}`}>{s.brightness}</sup>}
              {s.sihua && <sup className={`zw-sh ${SIHUA_CLASS[s.sihua]}`}>{s.sihua}</sup>}
            </span>
          ))}
        </div>
        <div className="zw-minors sha">
          {sha.map((s) => (
            <span key={s.name}>
              {s.name}
              {s.brightness && <sup className={`br-${s.brightness}`}>{s.brightness}</sup>}
            </span>
          ))}
        </div>
        <div className="zw-minors misc">
          {misc.map((s) => <span key={s.name}>{s.name}</span>)}
        </div>
      </div>
      <div className="zw-cell-foot">
        <span className="zw-changsheng">{palace.changsheng}</span>
        <span className="zw-daxian">{palace.daxianStart}–{palace.daxianEnd}</span>
        <span className="zw-palace-name">
          {PALACE_NAMES[palace.nameIndex]}
          {palace.isBodyPalace && <em className="zw-body-mark">身</em>}
        </span>
        <span className="zw-ganzhi">{STEMS[palace.stem]}{BRANCHES[palace.branch]}</span>
      </div>
    </div>
  );
}
