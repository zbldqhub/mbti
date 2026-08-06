import { ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function RulesView({ onBack }: Props) {
  return (
    <div className="ts-rules ts-fade-in">
      <header className="ts-page-header">
        <button className="ts-icon-btn" onClick={onBack} aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <h2>规则说明</h2>
      </header>

      <section className="ts-rules-section">
        <h3>怎么玩</h3>
        <p>
          海龟汤是一种情境推理游戏。系统给出一个看似离奇的故事片段（<b>汤面</b>），
          背后隐藏着完整的真相（<b>汤底</b>）。你通过向 AI 主持人不断提出
          「是/否」问题，逐步缩小范围，直到推理出真相。
        </p>
      </section>

      <section className="ts-rules-section">
        <h3>AI 的四种回答</h3>
        <ul>
          <li>
            <b>是</b> —— 你的猜测与真相一致或方向正确
          </li>
          <li>
            <b>否</b> —— 你的猜测与真相矛盾
          </li>
          <li>
            <b>是也不是</b> —— 猜对了一部分，但还不完整
          </li>
          <li>
            <b>无关</b> —— 这个问题与真相没有关系
          </li>
        </ul>
        <p>如果你的提问直接说出了完整真相，AI 会当场宣布你猜对了。</p>
      </section>

      <section className="ts-rules-section">
        <h3>提示</h3>
        <p>
          每局最多可请求 <b>3 次</b>提示。AI 会根据你的推理进度给出方向性暗示，
          但不会直接透露汤底。提示不计入提问次数。
        </p>
      </section>

      <section className="ts-rules-section">
        <h3>我猜到了</h3>
        <p>
          当你胸有成竹时，点击「我猜到了」并输入完整推理。AI 会判断是否命中汤底的核心逻辑
          （不要求一字不差）。验证不消耗提问次数，猜错了也不受惩罚。
        </p>
      </section>

      <section className="ts-rules-section">
        <h3>评价标准</h3>
        <p>通关后按提问次数给出评价，难度越高标准越宽松：</p>
        <table className="ts-rules-table">
          <thead>
            <tr>
              <th>评价</th>
              <th>🟢 简单</th>
              <th>🟡 中等</th>
              <th>🔴 困难</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>推理大师</td>
              <td>≤5 问</td>
              <td>≤8 问</td>
              <td>≤12 问</td>
            </tr>
            <tr>
              <td>逻辑清晰</td>
              <td>≤8 问</td>
              <td>≤12 问</td>
              <td>≤18 问</td>
            </tr>
            <tr>
              <td>渐入佳境</td>
              <td>≤12 问</td>
              <td>≤16 问</td>
              <td>≤25 问</td>
            </tr>
            <tr>
              <td>再接再厉</td>
              <td>更多</td>
              <td>更多</td>
              <td>更多</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="ts-rules-section">
        <h3>进度保存</h3>
        <p>通关记录和每题最佳成绩保存在浏览器本地（localStorage），无需登录。</p>
      </section>
    </div>
  );
}
