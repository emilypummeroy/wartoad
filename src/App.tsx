import './App.css';
import { StepForward } from 'lucide-react';
import { useCallback, useState, type ReactNode } from 'react';

import { CardClass } from './card-types';
import { type Position, INITIAL_GRID, GridState, Grid } from './Grid';
import { Froglet, Hand, LilyPad } from './Hand';
import { Phase, Player, Subphase, type FlowState } from './PhaseTracker';

export const INITIAL_HAND_CARD_COUNT = 7;

type GameState = {
  readonly flow: FlowState;
  readonly grid: GridState;
  readonly northHand: number;
  readonly southHand: number;
  readonly pickedCard?: CardClass;
};

// oxlint-disable-next-line no-unused-expressions
CardClass.Froglet.key as 'Froglet';

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
        <div className={`zooming ${Player.STYLES[owner]}`} tabIndex={0}>
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
    player: phase === Phase.End ? Player.AFTER[player] : player,
    phase: Phase.AFTER[phase],
    subphase: Subphase.Idle,
  },
  northHand:
    Phase.AFTER[phase] === Phase.Start && Player.AFTER[player] === Player.North
      ? northHand + 1
      : northHand,
  southHand:
    Phase.AFTER[phase] === Phase.Start && Player.AFTER[player] === Player.South
      ? southHand + 1
      : southHand,
});

const gameStateForCardPicked =
  (pickedCard: CardClass) =>
  ({ flow, ...rest }: GameState) => ({
    ...rest,
    flow: { ...flow, subphase: Subphase.Placing },
    pickedCard,
  });

const gameStateForCardPlaced =
  (position: Position) =>
  ({ grid, flow, northHand, southHand }: GameState) => ({
    flow: { ...flow, subphase: Subphase.Idle },
    northHand: flow.player === Player.North ? northHand - 1 : northHand,
    southHand: flow.player === Player.South ? southHand - 1 : southHand,
    grid: GridState.setAt(grid, position, true),
  });

export function App({
  isDeterministic: _ = false,
}: {
  readonly isDeterministic?: boolean;
}) {
  const [
    {
      flow: { phase, player, subphase },
      flow,
      grid,
      northHand,
      southHand,
      pickedCard,
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
    (isFroglet: boolean) =>
      setGameState(
        gameStateForCardPicked(
          isFroglet ? CardClass.Froglet : CardClass.LilyPad,
        ),
      ),
    [],
  );
  const handlePlaceCard = useCallback(
    (position: Position) => setGameState(gameStateForCardPlaced(position)),
    [],
  );

  return (
    <div className="wartoad-app">
      <header>
        <div className="title">
          <h1>
            War<span className="accent">toad</span>
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
            onPick={handlePickCard}
          />
          {subphase === Subphase.Placing && (
            <PickedCard owner={player}>
              {pickedCard === CardClass.Froglet ? <Froglet /> : <LilyPad />}
            </PickedCard>
          )}
          <Hand
            player={Player.South}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.South}
            isPlacing={subphase === Subphase.Placing}
            handSize={southHand}
            hasFroglet
            onPick={handlePickCard}
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
