import { WorkCard } from './components/WorkCard';
import { works } from './works';

export function App() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Frank Stella, Procedurally</h1>
        <p className="page-sub">
          Code-drawn studies after Stella, rendered live in your browser. Tweak the controls beside
          each piece — the canvas redraws on every change.
        </p>
      </header>
      <main className="gallery">
        {works.map((w) => (
          <WorkCard key={w.id} work={w} />
        ))}
      </main>
      <footer className="page-footer">
        <p>
          Procedural homages to works by Frank Stella (1936–2024). No image assets are used; every
          figure is drawn from code on a <code>&lt;canvas&gt;</code>. These are approximations, not
          reproductions.
        </p>
      </footer>
    </div>
  );
}
