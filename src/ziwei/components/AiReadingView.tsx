import type { AiReading } from '../services/aiReading';

function Stars({ count }: { count: number }) {
  return (
    <span className="zw-stars" aria-label={`${count}星`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= count ? 'on' : ''}>★</i>
      ))}
    </span>
  );
}

export default function AiReadingView({ reading }: { reading: AiReading }) {
  return (
    <div className="zw-ai">
      <p className="zw-ai-summary">{reading.summary}</p>

      <section className="zw-ai-section">
        <h3 className="zw-ai-h">{reading.natal.title}</h3>
        <ul>
          {reading.natal.points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </section>

      <section className="zw-ai-section">
        <h3 className="zw-ai-h">{reading.decade.title}</h3>
        {reading.decade.intro && <p className="zw-ai-intro">{reading.decade.intro}</p>}
        <ul>
          {reading.decade.points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </section>

      <section className="zw-ai-section">
        <h3 className="zw-ai-h">{reading.yearly.title}</h3>
        {reading.yearly.intro && <p className="zw-ai-intro">{reading.yearly.intro}</p>}
        {reading.yearly.aspects.map((a, i) => (
          <div key={i} className="zw-aspect">
            <div className="zw-aspect-head">
              <span className="zw-aspect-name">{a.name}</span>
              <Stars count={a.stars} />
            </div>
            <ul>
              {a.points.map((p, j) => <li key={j}>{p}</li>)}
            </ul>
          </div>
        ))}
      </section>

      <section className="zw-ai-section">
        <h3 className="zw-ai-h">四、总结与建议</h3>
        {reading.conclusion.text && <p className="zw-ai-intro">{reading.conclusion.text}</p>}
        {reading.conclusion.advice.length > 0 && (
          <table className="zw-advice-table">
            <tbody>
              {reading.conclusion.advice.map((a, i) => (
                <tr key={i}>
                  <td className="zw-advice-domain">{a.domain}</td>
                  <td>{a.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {reading.conclusion.motto && (
          <blockquote className="zw-motto">{reading.conclusion.motto}</blockquote>
        )}
      </section>
    </div>
  );
}
