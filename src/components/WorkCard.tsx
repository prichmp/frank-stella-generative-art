import { useState } from 'react';
import type { Work } from '../types';
import { CanvasFigure } from './CanvasFigure';
import { Controls } from './Controls';

interface Props<P> {
  work: Work<P>;
}

export function WorkCard<P>({ work }: Props<P>) {
  const [params, setParams] = useState<P>(work.defaultParams);

  return (
    <article className="work-card" id={work.id}>
      <figure className="work-figure">
        <CanvasFigure
          render={work.render}
          params={params}
          aspectRatio={work.aspectRatio}
          ariaLabel={`Frank Stella — ${work.title}, procedural reproduction`}
        />
        <figcaption>
          <span className="work-title">{work.title}</span>
          <span className="work-meta">
            {work.series} · {work.year}
          </span>
          {work.caption ? <p className="work-caption">{work.caption}</p> : null}
        </figcaption>
      </figure>
      <Controls
        schema={work.schema}
        values={params}
        onChange={setParams}
        onReset={() => setParams(work.defaultParams)}
      />
    </article>
  );
}
