import './App.css';
import { StepForward, Pyramid } from 'lucide-react';
import { useState } from 'react';

const Phase = {
  Main: 'Main',
  End: 'End',
} as const;
type Phase = (typeof Phase)[keyof typeof Phase];

// oxlint-disable react/jsx-max-depth
// oxlint-disable max-lines-per-function
// To be refactored later
export function App() {
  const [phase, setPhase] = useState<Phase>(Phase.Main);
  const setNextPhase = () =>
    setPhase(p => (p === Phase.End ? Phase.Main : Phase.End));
  return (
    <>
      <header>
        <div className="title">
          <h1>
            War<span className="accent">tide</span>
          </h1>
        </div>
        <section aria-labelledby="current-phase" className="phases">
          <h3 id="current-phase">
            <span className="accent">{phase}</span> phase
          </h3>
          <button
            className="icon-text accent"
            aria-label="Next phase"
            onClick={setNextPhase}
          >
            <StepForward />
            Next phase
          </button>
        </section>
      </header>
      <main>
        <div className="playarea" role="grid">
          <div className="zonerow" role="row">
            <div className="zone north" role="gridcell">
            <div className="facedown card north">
              <Pyramid>
                <title>north field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone north" role="gridcell">
            <div className="facedown card north">
              <Pyramid>
                <title>north field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone north" role="gridcell">
            <div className="facedown card north">
              <Pyramid>
                <title>north field</title>
              </Pyramid>
            </div>
            </div>
          </div>
          <div className="zonerow" role="row">
            <div className="zone north" role="gridcell">
            <div className="facedown card north">
              <Pyramid>
                <title>north field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone north" role="gridcell">
            <div className="facedown card north">
              <Pyramid>
                <title>north field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone north" role="gridcell">
            <div className="facedown card north">
              <Pyramid>
                <title>north field</title>
              </Pyramid>
            </div>
            </div>
          </div>
          <div className="zonerow" role="row">
            <div className="zone north" role="gridcell">
            <div className="facedown card north">
              <Pyramid>
                <title>north field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone north" role="gridcell">
            <div className="facedown card north">
              <Pyramid>
                <title>north field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone north" role="gridcell">
            <div className="facedown card north">
              <Pyramid>
                <title>north field</title>
              </Pyramid>
            </div>
            </div>
          </div>
          <div className="zonerow" role="row">
            <div className="zone south" role="gridcell">
            <div className="facedown card south">
              <Pyramid>
                <title>south field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone south" role="gridcell">
            <div className="facedown card south">
              <Pyramid>
                <title>south field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone south" role="gridcell">
            <div className="facedown card south">
              <Pyramid>
                <title>south field</title>
              </Pyramid>
            </div>
            </div>
          </div>
          <div className="zonerow" role="row">
            <div className="zone south" role="gridcell">
            <div className="facedown card south">
              <Pyramid>
                <title>south field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone south" role="gridcell">
            <div className="facedown card south">
              <Pyramid>
                <title>south field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone south" role="gridcell">
            <div className="facedown card south">
              <Pyramid>
                <title>south field</title>
              </Pyramid>
            </div>
            </div>
          </div>
          <div className="zonerow" role="row">
            <div className="zone south" role="gridcell">
            <div className="facedown card south">
              <Pyramid>
                <title>south field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone south" role="gridcell">
            <div className="facedown card south">
              <Pyramid>
                <title>south field</title>
              </Pyramid>
            </div>
            </div>
            <div className="zone south" role="gridcell">
            <div className="facedown card south">
              <Pyramid>
                <title>south field</title>
              </Pyramid>
            </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
