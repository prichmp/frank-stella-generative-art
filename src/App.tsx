import { WorkCard } from './components/WorkCard';
import { works } from './works';

export function App() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Frank Stella, Procedurally</h1>
        <p className="page-sub">
          Code-drawn studies of Frank Stella's work. Renders in the browser.
        </p>
      </header>
      <main className="gallery">
        {works.map((w) => (
          <WorkCard key={w.id} work={w} />
        ))}
      </main>
      <footer className="page-footer">
        <p>
          Procedural homages to works by Frank Stella. No original imagery used. These are approximations, not
          reproductions.
        </p>
      </footer>
    </div>
  );
}
