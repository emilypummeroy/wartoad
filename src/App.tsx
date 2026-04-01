import './App.css';
import { StepForward, Pyramid } from 'lucide-react';
import { useCallback, useId, useState } from 'react';

export const INITIAL_HAND_CARD_COUNT = 7;

const Phase = {
  Draw: 'Draw',
  Main: 'Main',
  End: 'End',
} as const;
type Phase = (typeof Phase)[keyof typeof Phase];
const phaseAfter = {
  [Phase.Draw]: Phase.Main,
  [Phase.Main]: Phase.End,
  [Phase.End]: Phase.Draw,
} as const;

const Player = {
  South: 'South',
  North: 'North',
} as const;
type Player = (typeof Player)[keyof typeof Player];
const playerAfter = {
  [Player.South]: Player.North,
  [Player.North]: Player.South,
} as const;

function NorthFacedownCard() {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card north">
      <Pyramid>
        <title id={id}>North owned</title>
      </Pyramid>
    </section>
  );
}

function SouthFacedownCard() {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card south">
      <Pyramid>
        <title id={id}>South owned</title>
      </Pyramid>
    </section>
  );
}

function NorthHomeBasicField() {
  const nameId = useId();
  const symbolId = useId();
  return (
    <section aria-labelledby={`${symbolId} ${nameId}`} className="card north">
      <div id={nameId}>Basic Field</div>
      <div className="card-line">
        <Pyramid>
          <title id={symbolId}>North owned</title>
        </Pyramid>
        <div>
          <small>Gives:</small>+0
        </div>
      </div>
      <div>Home field</div>
    </section>
  );
}

function SouthHomeBasicField() {
  const nameId = useId();
  const symbolId = useId();
  return (
    <section aria-labelledby={`${symbolId} ${nameId}`} className="card south">
      <div id={nameId}>Basic Field</div>
      <div className="card-line">
        <Pyramid>
          <title id={symbolId}>South owned</title>
        </Pyramid>
        <div>
          <small>Gives:</small>+0
        </div>
      </div>
      <div>Home field</div>
    </section>
  );
}

function HandFacedownCard() {
  const id = useId();
  return (
    <div className="stacking ">
      <section aria-labelledby={id} className="facedown card">
        <Pyramid>
          <title id={id}>Facedown card</title>
        </Pyramid>
      </section>
    </div>
  );
}

function HandBasicField() {
  const nameId = useId();
  const symbolId = useId();
  return (
    <div className="stacking jiggling">
      <section aria-labelledby={`${symbolId} ${nameId}`} className="card">
        <div id={nameId}>Basic Field</div>
        <div className="card-line">
          <div>
            <small>Cost:</small>0
          </div>
          <div>
            <small>Gives:</small>+0
          </div>
        </div>
        <div>Home field</div>
      </section>
    </div>
  );
}

// oxlint-disable max-lines-per-function
// oxlint-disable react/jsx-max-depth
// To be refactored later
export function App() {
  const [{ phase, player }, setPhase] = useState<
    Readonly<{
      phase: Phase;
      player: Player;
    }>
  >({
    phase: Phase.Main,
    player: Player.South,
  });
  const [southHand] = useState(INITIAL_HAND_CARD_COUNT);
  const [northHand] = useState(INITIAL_HAND_CARD_COUNT);

  const setNextPhase = useCallback(() => {
    setPhase(old => ({
      player: old.phase === Phase.End ? playerAfter[old.player] : old.player,
      phase: phaseAfter[old.phase],
    }));
  }, []);
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
            <span className={player === Player.North ? 'north' : 'south'}>
              {player}
            </span>
            : <span className="accent">{phase}</span> phase
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
        <section className="handarea">
          <section aria-labelledby="north-hand">
            <h3 id="north-hand" className="north">
              North hand
            </h3>
            {player === Player.North ? (
              <div className="jiggle-row">
                {Array.from({ length: northHand }, (_, i) => (
                  <HandBasicField key={i} />
                ))}
              </div>
            ) : (
              <div className="splay-row">
                {Array.from({ length: northHand }, (_, i) => (
                  <HandFacedownCard key={i} />
                ))}
              </div>
            )}
          </section>
          <section aria-labelledby="south-hand">
            <h3 id="south-hand" className="south">
              South hand
            </h3>
            {player === Player.South ? (
              <div className="jiggle-row">
                {Array.from({ length: southHand }, (_, i) => (
                  <HandBasicField key={i} />
                ))}
              </div>
            ) : (
              <div className="splay-row">
                {Array.from({ length: southHand }, (_, i) => (
                  <HandFacedownCard key={i} />
                ))}
              </div>
            )}
          </section>
        </section>
        <div className="playarea">
          <div role="grid">
            <div className="zonerow" role="row">
              <div className="zone north" role="gridcell">
                <NorthFacedownCard />
              </div>
              <div className="zone north" role="gridcell">
                <NorthHomeBasicField />
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
                <SouthHomeBasicField />
              </div>
              <div className="zone south" role="gridcell">
                <SouthFacedownCard />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
