import './App.css';
import { StepForward, Pyramid } from 'lucide-react';
import { useCallback, useId, useState } from 'react';

export const INITIAL_HAND_CARD_COUNT = 7;
export const BIG_HAND_CARD_COUNT = 12;

export const Phase = {
  Start: 'Start',
  Main: 'Main',
  End: 'End',
} as const;
export type Phase = (typeof Phase)[keyof typeof Phase];
const phaseAfter = {
  [Phase.Start]: Phase.Main,
  [Phase.Main]: Phase.End,
  [Phase.End]: Phase.Start,
} as const;

export const Player = {
  South: 'South',
  North: 'North',
} as const;
export type Player = (typeof Player)[keyof typeof Player];

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

function HandCard({ isPlayerTurn }: { readonly isPlayerTurn: boolean }) {
  const id = useId();
  return isPlayerTurn ? (
    <div className="stacking jiggling">
      <section aria-labelledby={id} className="card">
        <div id={id}>Basic Field</div>
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
  ) : (
    <div className="stacking ">
      <section aria-labelledby={id} className="facedown card">
        <Pyramid>
          <title id={id}>Facedown card</title>
        </Pyramid>
      </section>
    </div>
  );
}

export const styleForHandSize = (n: number): string => {
  if (n <= INITIAL_HAND_CARD_COUNT) return '';
  if (n <= BIG_HAND_CARD_COUNT) return 'compact';
  return 'super-compact';
};

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
  const [southHand, setSouthHand] = useState(INITIAL_HAND_CARD_COUNT);
  const [northHand, setNorthHand] = useState(INITIAL_HAND_CARD_COUNT);

  const setNextPhase = useCallback(() => {
    const next = {
      player: phase === Phase.End ? playerAfter[player] : player,
      phase: phaseAfter[phase],
    };
    setPhase(next);
    if (next.phase === Phase.Start && next.player === Player.North) {
      setNorthHand(northHand + 1);
    }
    if (next.phase === Phase.Start && next.player === Player.South) {
      setSouthHand(southHand + 1);
    }
  }, [player, phase, northHand, southHand]);

  return (
    <div className="wartide-app">
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
              <div
                className={`jiggle-row ${styleForHandSize(northHand)}`}
                key="north-hand-cards"
              >
                {Array.from({ length: northHand }, (_, i) => (
                  <HandCard key={i} isPlayerTurn />
                ))}
              </div>
            ) : (
              <div
                className={`splay-row ${styleForHandSize(northHand)}`}
                key="north-hand-cards"
              >
                {Array.from({ length: northHand }, (_, i) => (
                  <HandCard key={i} isPlayerTurn={false} />
                ))}
              </div>
            )}
          </section>
          <section aria-labelledby="south-hand">
            <h3 id="south-hand" className="south">
              South hand
            </h3>
            {player === Player.South ? (
              <div
                className={`jiggle-row ${styleForHandSize(southHand)}`}
                key="south-player-hand"
              >
                {Array.from({ length: southHand }, (_, i) => (
                  <HandCard key={i} isPlayerTurn />
                ))}
              </div>
            ) : (
              <div
                className={`splay-row ${styleForHandSize(southHand)}`}
                key="south-player-hand"
              >
                {Array.from({ length: southHand }, (_, i) => (
                  <HandCard key={i} isPlayerTurn={false} />
                ))}
              </div>
            )}
          </section>
        </section>
        <div className="scroll-x">
          <section className="playarea">
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
          </section>
        </div>
      </main>
    </div>
  );
}
