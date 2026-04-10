import './App.css';
import { StepForward } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Hand, BasicField } from './Hand';
import { Zone } from './Zone';

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

export const Subphase = {
  Idle: 'Idle',
  Placing: 'Placing',
} as const;
export type Subphase = (typeof Subphase)[keyof typeof Subphase];
export type FlowState = {
  readonly player: Player;
  readonly phase: Phase;
  readonly subphase: Subphase;
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
      flow: { phase, player, subphase: substate },
      flow,
      grid,
      northHand,
      southHand,
    },
    setGameState,
  ] = useState<Readonly<GameState>>({
    flow: {
      phase: Phase.Main,
      player: Player.South,
      subphase: Subphase.Idle,
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
            subphase: Subphase.Idle,
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
        flow: { ...old.flow, subphase: Subphase.Placing },
      })),
    [],
  );

  // TODO move knowledge of x/y into Zone
  const handlePlaceCard =
    ({ x, y }: Position) =>
    () =>
      setGameState(old => {
        const array = old.grid.map((row, yy) =>
          yy !== y ? row : row.map((val, xx) => (xx === x ? true : val)),
        );
        // v8 ignore next 2
        if (!isGridState(array)) {
          throw new Error(`Expected a GridState but got: ${String(array)}`);
        }
        return {
          ...old,
          flow: { ...old.flow, subphase: Subphase.Idle },
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
            disabled={substate === Subphase.Placing}
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
            isPlacing={substate === Subphase.Placing}
            handSize={northHand}
            pickCard={handlePickCard}
          />
          {substate === Subphase.Placing && (
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
            isPlacing={substate === Subphase.Placing}
            handSize={southHand}
            pickCard={handlePickCard}
          />
        </section>
        {
          // Move the playarea container into a HOC
        }
        <div className="scroll-x">
          <section className="playarea">
            <div role="grid">
              {grid.map(
                ([isLeftPlaced, isMiddlePlaced, isRightPlaced], rowY) => (
                  // The grid of field zones never gets rearranged
                  // oxlint-disable-next-line react/no-array-index-key
                  <div className="zonerow" role="row" key={rowY}>
                    <Zone
                      controller={
                        rowY < ROW_COUNT_PER_PLAYER
                          ? Player.North
                          : Player.South
                      }
                      flow={flow}
                      isHome={false}
                      isUpgraded={isLeftPlaced}
                      onPlace={handlePlaceCard({ x: 0, y: rowY })}
                    />
                    <Zone
                      controller={
                        rowY < ROW_COUNT_PER_PLAYER
                          ? Player.North
                          : Player.South
                      }
                      flow={flow}
                      isHome={rowY === 0 || rowY === ROW_COUNT - 1}
                      isUpgraded={isMiddlePlaced}
                      onPlace={handlePlaceCard({ x: 1, y: rowY })}
                    />
                    <Zone
                      controller={
                        rowY < ROW_COUNT_PER_PLAYER
                          ? Player.North
                          : Player.South
                      }
                      flow={flow}
                      isHome={false}
                      isUpgraded={isRightPlaced}
                      onPlace={handlePlaceCard({ x: 2, y: rowY })}
                    />
                  </div>
                ),
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
