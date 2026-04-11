import './App.css';
import { StepForward } from 'lucide-react';
import { useCallback, useState, type ReactNode } from 'react';

import { type Position, INITIAL_GRID, GridState, Grid } from './Grid';
import { Hand, GreenField } from './Hand';

export const INITIAL_HAND_CARD_COUNT = 7;

const _Phase = {
  Start: 'Start',
  Main: 'Main',
  End: 'End',
} as const;
export const Phase = {
  ..._Phase,
  after: {
    [_Phase.Start]: _Phase.Main,
    [_Phase.Main]: _Phase.End,
    [_Phase.End]: _Phase.Start,
  },
} as const;
export type Phase = (typeof _Phase)[keyof typeof _Phase];

const _Player = {
  South: 'South',
  North: 'North',
} as const;
export const Player = {
  ..._Player,
  styles: {
    [_Player.North]: 'north',
    [_Player.South]: 'south',
  },
  after: {
    [_Player.North]: _Player.South,
    [_Player.South]: _Player.North,
  },
} as const;
export type Player = (typeof _Player)[keyof typeof _Player];

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

type GameState = {
  readonly flow: FlowState;
  readonly grid: GridState;
  readonly northHand: number;
  readonly southHand: number;
};

function PickedCard({
  owner,
  children,
}: {
  readonly owner: Player;
  readonly children: ReactNode;
}) {
  return (
    <section className="card-display" aria-labelledby="picked-card">
      <h3 id="picked-card">Picked card</h3>
      <div className="zoom-row">
        <div className={`zooming ${Player.styles[owner]}`} tabIndex={0}>
          {children}
        </div>
      </div>
    </section>
  );
}

function PhaseBar({
  flow: { player, phase, subphase },
  onNextPhaseClicked,
}: {
  readonly flow: FlowState;
  readonly onNextPhaseClicked: () => void;
}) {
  return (
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
        disabled={subphase === Subphase.Placing}
        onClick={onNextPhaseClicked}
      >
        <StepForward />
        Next phase
      </button>
    </section>
  );
}

const gameStateForNextPhase = ({
  flow: { player, phase },
  northHand,
  southHand,
  ...rest
}: GameState) => ({
  ...rest,
  flow: {
    player: phase === Phase.End ? Player.after[player] : player,
    phase: Phase.after[phase],
    subphase: Subphase.Idle,
  },
  northHand:
    Phase.after[phase] === Phase.Start && Player.after[player] === Player.North
      ? northHand + 1
      : northHand,
  southHand:
    Phase.after[phase] === Phase.Start && Player.after[player] === Player.South
      ? southHand + 1
      : southHand,
});

const gameStateForCardPicked = ({ flow, ...rest }: GameState) => ({
  ...rest,
  flow: { ...flow, subphase: Subphase.Placing },
});

const gameStateForCardPlaced =
  (position: Position) =>
  ({ grid, flow, northHand, southHand }: GameState) => ({
    flow: { ...flow, subphase: Subphase.Idle },
    northHand: flow.player === Player.North ? northHand - 1 : northHand,
    southHand: flow.player === Player.South ? southHand - 1 : southHand,
    grid: GridState.setAt(grid, position, true),
  });

export function App() {
  const [
    {
      flow: { phase, player, subphase },
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
    grid: INITIAL_GRID,
    northHand: INITIAL_HAND_CARD_COUNT,
    southHand: INITIAL_HAND_CARD_COUNT,
  });

  const handleNextPhaseClicked = useCallback(
    () => setGameState(gameStateForNextPhase),
    [],
  );
  const handlePickCard = useCallback(
    () => setGameState(gameStateForCardPicked),
    [],
  );
  const handlePlaceCard = useCallback(
    (position: Position) => setGameState(gameStateForCardPlaced(position)),
    [],
  );

  return (
    <div className="wartode-app">
      <header>
        <div className="title">
          <h1>
            War<span className="accent">tode</span>
          </h1>
        </div>
        <PhaseBar flow={flow} onNextPhaseClicked={handleNextPhaseClicked} />
      </header>
      <main>
        <section className="handarea">
          <Hand
            player={Player.North}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.North}
            isPlacing={subphase === Subphase.Placing}
            handSize={northHand}
            pickCard={handlePickCard}
          />
          {subphase === Subphase.Placing && (
            <PickedCard owner={player}>
              <GreenField />
            </PickedCard>
          )}
          <Hand
            player={Player.South}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.South}
            isPlacing={subphase === Subphase.Placing}
            handSize={southHand}
            pickCard={handlePickCard}
          />
        </section>
        <div className="scroll-x">
          <section className="playarea">
            <Grid onPlaceCard={handlePlaceCard} flow={flow} grid={grid} />
          </section>
        </div>
      </main>
    </div>
  );
}
