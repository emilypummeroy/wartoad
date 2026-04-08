import './App.css';
import { HousePlus, Replace, StepForward, Pyramid } from 'lucide-react';
import { useCallback, useId, useState, type ReactNode } from 'react';

import { Hand, BasicField } from './Hand';

export const INITIAL_HAND_CARD_COUNT = 7;
export const ROW_COUNT = 6;
export const ROW_COUNT_PER_PLAYER = 3;
export const FIELD_COUNT_PER_ROW = 3;

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
        <title id={id}>North controlled empty field</title>
      </Pyramid>
    </section>
  );
}

function SouthFacedownCard() {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card south">
      <Pyramid>
        <title id={id}>South controlled empty field</title>
      </Pyramid>
    </section>
  );
}

function NorthBasicField() {
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
      <div className="card-line" />
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
        <HousePlus>
          <title id={symbolId}>North Home</title>
        </HousePlus>
        <div>
          <small>Gives:</small>+0
        </div>
      </div>
      <div className="card-line" />
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
        <HousePlus>
          <title id={symbolId}>South Home</title>
        </HousePlus>
        <div>
          <small>Gives:</small>+0
        </div>
      </div>
      <div className="card-line" />
    </section>
  );
}

type ZoneProps = Readonly<{
  children: ReactNode;
  isPlaced: boolean;
  isPlacing: boolean;
  onPlace: () => void;
}>;

function NorthZone({ children, isPlaced, isPlacing, onPlace }: ZoneProps) {
  const buttonId = useId();
  const isDropzone = isPlacing && !isPlaced;
  return (
    <button className="placeable-zone" disabled={!isDropzone} onClick={onPlace}>
      <div className="zone north" role="gridcell">
        {isDropzone && (
          <div className="overlay-container">
            <Replace id={buttonId}>
              <title>Place on</title>
            </Replace>
          </div>
        )}
        {isPlaced ? children : <NorthFacedownCard />}
      </div>
    </button>
  );
}

type GridState = readonly [
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
];

const isGridState = (
  array: readonly (readonly boolean[])[],
): array is GridState =>
  array.length === ROW_COUNT && array.every(row => row.length === 3);

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
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedCards, setPlacedCards] = useState<GridState>([
    [false, true, false],
    [false, false, false],
    [false, false, false],
    [false, false, false],
    [false, false, false],
    [false, true, false],
  ]);

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

  const handlePickCard = useCallback(() => setIsPlacing(true), [setIsPlacing]);
  const handlePlaceCard = (zoneX: number, zoneY: number) => () => {
    setIsPlacing(false);
    setNorthHand(n => n - 1);
    setPlacedCards((old: GridState) => {
      const array = old.map((row, j) =>
        j === zoneY ? row.map((p, i) => (i === zoneX ? true : p)) : row,
      );
      if (!isGridState(array)) {
        // v8 ignore next
        throw new Error(`Expected a GridState but got: ${String(array)}`);
      }
      return array;
    });
  };

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
          <Hand
            player={Player.North}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.North}
            isPlacing={isPlacing}
            handSize={northHand}
            pickCard={handlePickCard}
          />
          {isPlacing && (
            <section className="card-display" aria-labelledby="picked-card">
              <h3 id="picked-card">Picked card</h3>
              <div className="zoom-row">
                <div className="zooming">
                  <BasicField />
                </div>
              </div>
            </section>
          )}
          <Hand
            player={Player.South}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.South}
            isPlacing={isPlacing}
            handSize={southHand}
            pickCard={useCallback(() => {
              setSouthHand(southHand - 1);
            }, [southHand])}
          />
        </section>
        <div className="scroll-x">
          <section className="playarea">
            <div role="grid">
              {placedCards
                .slice(0, ROW_COUNT_PER_PLAYER)
                .map(([isLeftPlaced, isMiddlePlaced, isRightPlaced], rowY) => (
                  // The grid of field zones never gets rearranged
                  // oxlint-disable-next-line react/no-array-index-key
                  <div className="zonerow" role="row" key={rowY}>
                    <NorthZone
                      isPlaced={isLeftPlaced}
                      isPlacing={isPlacing}
                      onPlace={handlePlaceCard(0, rowY)}
                    >
                      <NorthBasicField />
                    </NorthZone>
                    <NorthZone
                      isPlaced={isMiddlePlaced}
                      isPlacing={isPlacing}
                      onPlace={handlePlaceCard(1, rowY)}
                    >
                      {rowY === 0 ? (
                        <NorthHomeBasicField />
                      ) : (
                        <NorthBasicField />
                      )}
                    </NorthZone>
                    <NorthZone
                      isPlaced={isRightPlaced}
                      isPlacing={isPlacing}
                      onPlace={handlePlaceCard(2, rowY)}
                    >
                      <NorthBasicField />
                    </NorthZone>
                  </div>
                ))}
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
