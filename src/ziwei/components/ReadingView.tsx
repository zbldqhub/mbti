import type { ReadingSection } from '../interpret';

interface Props {
  sections: ReadingSection[];
}

export default function ReadingView({ sections }: Props) {
  return (
    <div className="zw-reading">
      {sections.map((sec) => (
        <section key={sec.key} className="zw-section">
          <h2 className="zw-section-title">{sec.title}</h2>
          {sec.paragraphs.map((p, i) => (
            <p key={i} className="zw-para">{p}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
