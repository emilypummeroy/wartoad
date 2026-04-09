import './App.css';
import { HousePlus, StepForward, Pyramid } from 'lucide-react';
import { useCallback, useId, useState } from 'react';

import { Hand, BasicField } from './Hand';
import { NorthZone, SouthZone } from './Zone';

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

function NorthBasicField() {
  const nameId = useId();
  const symbolId = useId();
  return (
    <section aria-labelledby={`${symbolId} ${nameId}`} className="card north">
      <div className="card-title" id={nameId}>
        Empty Field
      </div>
      <div className="card-section-row">
        <Pyramid>
          <title id={symbolId}>North owned</title>
        </Pyramid>
        <div>
          <small>Gives:</small>+0
        </div>
      </div>
      <div className="card-section-row" />
    </section>
  );
}
function NorthHomeBasicField() {
  const nameId = useId();
  const symbolId = useId();
  return (
    <section aria-labelledby={`${symbolId} ${nameId}`} className="card north">
      <div className="card-title" id={nameId}>
        Empty Field
      </div>
      <div className="card-section-row">
        <HousePlus>
          <title id={symbolId}>North Home</title>
        </HousePlus>
        <div>
          <small>Gives:</small>+0
        </div>
      </div>
      <div className="card-section-row" />
    </section>
  );
}

function SouthBasicField() {
  const nameId = useId();
  const symbolId = useId();
  return (
    <section aria-labelledby={`${symbolId} ${nameId}`} className="card south">
      <div className="card-title" id={nameId}>
        Empty Field
      </div>
      <div className="card-section-row">
        <Pyramid>
          <title id={symbolId}>South owned</title>
        </Pyramid>
        <div>
          <small>Gives:</small>+0
        </div>
      </div>
      <div className="card-section-row" />
    </section>
  );
}

function SouthHomeBasicField() {
  const nameId = useId();
  const symbolId = useId();
  return (
    <section aria-labelledby={`${symbolId} ${nameId}`} className="card south">
      <div className="card-title" id={nameId}>
        Empty Field
      </div>
      <div className="card-section-row">
        <HousePlus>
          <title id={symbolId}>South Home</title>
        </HousePlus>
        <div>
          <small>Gives:</small>+0
        </div>
      </div>
      <div className="card-section-row" />
    </section>
  );
}

const Substate = {
  Idle: 'Idle',
  Placing: 'Placing',
} as const;
type Substate = (typeof Substate)[keyof typeof Substate];
type FlowState = {
  readonly player: Player;
  readonly phase: Phase;
  readonly substate: Substate;
};

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
  array.length === ROW_COUNT &&
  array.every(row => row.length === FIELD_COUNT_PER_ROW);

type GameState = {
  readonly flow: FlowState;
  readonly grid: GridState;
  readonly northHand: number;
  readonly southHand: number;
};

type Position = {
  readonly x: number;
  readonly y: number;
};

// oxlint-disable max-lines-per-function
// oxlint-disable react/jsx-max-depth
// To be refactored later
export function App() {
  const [
    {
      flow: { phase, player, substate },
      grid,
      northHand,
      southHand,
    },
    setGameState,
  ] = useState<Readonly<GameState>>({
    flow: {
      phase: Phase.Main,
      player: Player.South,
      substate: Substate.Idle,
    },
    grid: [
      [false, true, false],
      [false, false, false],
      [false, false, false],
      [false, false, false],
      [false, false, false],
      [false, true, false],
    ],
    northHand: INITIAL_HAND_CARD_COUNT,
    southHand: INITIAL_HAND_CARD_COUNT,
  });

  const setNextPhase = useCallback(
    () =>
      setGameState(
        ({ flow: { player, phase }, northHand, southHand, ...rest }) => ({
          ...rest,
          flow: {
            player: phase === Phase.End ? playerAfter[player] : player,
            phase: phaseAfter[phase],
            substate: Substate.Idle,
          },
          northHand:
            phaseAfter[phase] === Phase.Start &&
            playerAfter[player] === Player.North
              ? northHand + 1
              : northHand,
          southHand:
            phaseAfter[phase] === Phase.Start &&
            playerAfter[player] === Player.South
              ? southHand + 1
              : southHand,
        }),
      ),
    [],
  );

  const handlePickCard = useCallback(
    () =>
      setGameState(old => ({
        ...old,
        flow: { ...old.flow, substate: Substate.Placing },
      })),
    [],
  );

  const handlePlaceCard =
    ({ x, y }: Position) =>
    () =>
      setGameState(old => {
        const array = old.grid.map((row, yy) =>
          yy !== y ? row : row.map((val, xx) => (xx === x ? true : val)),
        );
        if (!isGridState(array)) {
          // v8 ignore next
          throw new Error(`Expected a GridState but got: ${String(array)}`);
        }
        return {
          ...old,
          flow: { ...old.flow, substate: Substate.Idle },
          northHand:
            old.flow.player === Player.North
              ? old.northHand - 1
              : old.northHand,
          southHand:
            old.flow.player === Player.South
              ? old.southHand - 1
              : old.southHand,
          grid: array,
        };
      });

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
            disabled={substate === Substate.Placing}
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
            isPlacing={substate === Substate.Placing}
            handSize={northHand}
            pickCard={handlePickCard}
          />
          {substate === Substate.Placing && (
            <section className="card-display" aria-labelledby="picked-card">
              <h3 id="picked-card">Picked card</h3>
              <div className="zoom-row">
                <div
                  className={`zooming ${player === Player.North ? 'north' : 'south'}`}
                  tabIndex={0}
                >
                  <BasicField />
                </div>
              </div>
            </section>
          )}
          <Hand
            player={Player.South}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.South}
            isPlacing={substate === Substate.Placing}
            handSize={southHand}
            pickCard={handlePickCard}
          />
        </section>
        <div className="scroll-x">
          <section className="playarea">
            <div role="grid">
              {grid
                .slice(0, ROW_COUNT_PER_PLAYER)
                .map(([isLeftPlaced, isMiddlePlaced, isRightPlaced], rowY) => (
                  // The grid of field zones never gets rearranged
                  // oxlint-disable-next-line react/no-array-index-key
                  <div className="zonerow" role="row" key={rowY}>
                    <NorthZone
                      isPlaced={isLeftPlaced}
                      isDropzone={
                        player === Player.North && substate === Substate.Placing
                      }
                      onPlace={handlePlaceCard({ x: 0, y: rowY })}
                    >
                      <NorthBasicField />
                    </NorthZone>
                    <NorthZone
                      isPlaced={isMiddlePlaced}
                      isDropzone={
                        player === Player.North && substate === Substate.Placing
                      }
                      onPlace={handlePlaceCard({ x: 1, y: rowY })}
                    >
                      {rowY === 0 ? (
                        <NorthHomeBasicField />
                      ) : (
                        <NorthBasicField />
                      )}
                    </NorthZone>
                    <NorthZone
                      isPlaced={isRightPlaced}
                      isDropzone={
                        player === Player.North && substate === Substate.Placing
                      }
                      onPlace={handlePlaceCard({ x: 2, y: rowY })}
                    >
                      <NorthBasicField />
                    </NorthZone>
                  </div>
                ))}
              {grid
                .slice(ROW_COUNT_PER_PLAYER, ROW_COUNT)
                .map(([isLeftPlaced, isMiddlePlaced, isRightPlaced], rowY) => (
                  <div
                    className="zonerow"
                    role="row"
                    // The grid of field zones never gets rearranged
                    // oxlint-disable-next-line react/no-array-index-key
                    key={rowY + ROW_COUNT_PER_PLAYER}
                  >
                    <SouthZone
                      isPlaced={isLeftPlaced}
                      isDropzone={
                        player === Player.South && substate === Substate.Placing
                      }
                      onPlace={handlePlaceCard({
                        x: 0,
                        y: rowY + ROW_COUNT_PER_PLAYER,
                      })}
                    >
                      <SouthBasicField />
                    </SouthZone>
                    <SouthZone
                      isPlaced={isMiddlePlaced}
                      isDropzone={
                        player === Player.South && substate === Substate.Placing
                      }
                      onPlace={handlePlaceCard({
                        x: 1,
                        y: rowY + ROW_COUNT_PER_PLAYER,
                      })}
                    >
                      {rowY === 2 ? (
                        <SouthHomeBasicField />
                      ) : (
                        <SouthBasicField />
                      )}
                    </SouthZone>
                    <SouthZone
                      isPlaced={isRightPlaced}
                      isDropzone={
                        player === Player.South && substate === Substate.Placing
                      }
                      onPlace={handlePlaceCard({
                        x: 2,
                        y: rowY + ROW_COUNT_PER_PLAYER,
                      })}
                    >
                      <SouthBasicField />
                    </SouthZone>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
