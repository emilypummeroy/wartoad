import { Bench } from './basic/Bench';
import { PhaseTracker } from './basic/PhaseTracker';
import { Pond } from './composite/Pond';

export function Game() {
  return (
    <div role="application" aria-label="Wartoad" className="wartoad-app">
      <header>
        <div className="title">
          <h1>
            War<span className="accent">toad</span>
          </h1>
        </div>
        <PhaseTracker />
      </header>
      <main>
        <Bench />
        <div className="scroll-x">
          <section className="playarea">
            <Pond />
          </section>
        </div>
      </main>
    </div>
  );
}
