import type { ChartData } from '../types';
import { GRID_LAYOUT, BRANCHES } from '../engine/constants';
import PalaceCell from './PalaceCell';

interface Props {
  chart: ChartData;
  currentDaxianBranch?: number;
  yearlyBranch?: number;
}

export default function ChartBoard({ chart, currentDaxianBranch, yearlyBranch }: Props) {
  const cells: { branch: number; row: number; col: number }[] = [];
  GRID_LAYOUT.forEach((rowArr, r) => {
    rowArr.forEach((branch, c) => {
      if (branch !== -1) cells.push({ branch, row: r + 1, col: c + 1 });
    });
  });

  return (
    <div className="zw-board">
      {cells.map(({ branch, row, col }) => (
        <div key={branch} style={{ gridRow: row, gridColumn: col }} className="zw-cell-wrap">
          <PalaceCell
            chart={chart}
            palace={chart.palaces[branch]}
            currentDaxianBranch={currentDaxianBranch}
            yearlyBranch={yearlyBranch}
          />
        </div>
      ))}
      <div className="zw-center" style={{ gridRow: '2 / 4', gridColumn: '2 / 4' }}>
        <div className="zw-center-name">{chart.name}</div>
        <div>{chart.yinyang} · {chart.juName}</div>
        <div>{chart.lunarText}</div>
        <div>公历 {chart.solarText}</div>
        <div>命主 {chart.mingZhu} · 身主 {chart.shenZhu}</div>
        <div>命宫在{BRANCHES[chart.mingBranch]} · 身宫在{BRANCHES[chart.bodyBranch]}</div>
        {chart.unknownTime && <div className="zw-warn">时辰不详，按午时排</div>}
      </div>
    </div>
  );
}
