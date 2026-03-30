import './App.css';
import { StepForward, Pyramid } from 'lucide-react';
import { useId, useState } from 'react';

const Phase = {
  Main: 'Main',
  End: 'End',
} as const;
type Phase = (typeof Phase)[keyof typeof Phase];

const Player = {
  South: 'South',
  North: 'North',
} as const;
type Player = (typeof Player)[keyof typeof Player];

function NorthFacedownCard() {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card north">
      <Pyramid>
        <title id={id}>North field</title>
      </Pyramid>
    </section>
  );
}

function NorthBasicField() {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card north">
      <Pyramid>
        <title id={id}>North field</title>
      </Pyramid>
    </section>
  );
}

function SouthBasicField() {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card south">
      <Pyramid>
        <title id={id}>South field</title>
      </Pyramid>
    </section>
  );
}

function SouthFacedownCard() {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card south">
      <Pyramid>
        <title id={id}>South field</title>
      </Pyramid>
    </section>
  );
}

// oxlint-disable react/jsx-max-depth
// oxlint-disable max-lines-per-function
// To be refactored later
export function App() {
  const [{ phase, player }, setPhasePlayer] = useState<
    Readonly<{
      phase: Phase;
      player: Player;
    }>
  >({
    phase: Phase.Main,
    player: Player.South,
  });
  const setNextPhase = () => {
    setPhasePlayer(old =>
      old.phase === Phase.End
        ? {
            phase: Phase.Main,
            player: old.player === Player.South ? Player.North : Player.South,
          }
        : { phase: Phase.End, player: old.player },
    );
  };
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
            {player}: <span className="accent">{phase}</span> phase
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
              <NorthFacedownCard />
            </div>
            <div className="zone north" role="gridcell">
              <NorthBasicField />
            </div>
            <div className="zone north" role="gridcell">
              <NorthFacedownCard />
            </div>
          </div>
          <div className="zonerow" role="row">
            <div className="zone north" role="gridcell">
              <NorthFacedownCard />
            </div>
            <div className="zone north" role="gridcell">
              <NorthFacedownCard />
            </div>
            <div className="zone north" role="gridcell">
              <NorthFacedownCard />
            </div>
          </div>
          <div className="zonerow" role="row">
            <div className="zone north" role="gridcell">
              <NorthFacedownCard />
            </div>
            <div className="zone north" role="gridcell">
              <NorthFacedownCard />
            </div>
            <div className="zone north" role="gridcell">
              <NorthFacedownCard />
            </div>
          </div>
          <div className="zonerow" role="row">
            <div className="zone south" role="gridcell">
              <SouthFacedownCard />
            </div>
            <div className="zone south" role="gridcell">
              <SouthFacedownCard />
            </div>
            <div className="zone south" role="gridcell">
              <SouthFacedownCard />
            </div>
          </div>
          <div className="zonerow" role="row">
            <div className="zone south" role="gridcell">
              <SouthFacedownCard />
            </div>
            <div className="zone south" role="gridcell">
              <SouthFacedownCard />
            </div>
            <div className="zone south" role="gridcell">
              <SouthFacedownCard />
            </div>
          </div>
          <div className="zonerow" role="row">
            <div className="zone south" role="gridcell">
              <SouthFacedownCard />
            </div>
            <div className="zone south" role="gridcell">
              <SouthBasicField />
            </div>
            <div className="zone south" role="gridcell">
              <SouthFacedownCard />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
