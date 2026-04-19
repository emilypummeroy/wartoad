import { createContext, useContext, type ReactNode } from 'react';

import { Froglet, LilyPad } from './Card';
import { CardClass } from './card-types';
import { Hand } from './Hand';
import {
  Phase,
  PhaseTracker,
  Player,
  Subphase,
  type FlowState,
} from './PhaseTracker';
import { Pond, INITIAL_GRID, type PondState } from './Pond';
import type { Position } from './position';

export type GameState = {
  readonly flow: FlowState;
  readonly grid: PondState;
  // TODO 11: Card[]
  readonly northHand: readonly CardClass[];
  // TODO 11: Card[]
  readonly southHand: readonly CardClass[];
  // TODO 11: Card
  readonly pickedCard?: CardClass;
  readonly activationState?: {
    readonly start: Position;
  };
};

export const DETERMINISTIC_STARTING_HAND = [
  CardClass.LilyPad,
  CardClass.Froglet,
  CardClass.LilyPad,
  CardClass.Froglet,
  CardClass.Froglet,
  CardClass.Froglet,
  CardClass.LilyPad,
];

export type GameContext = {
  readonly state: GameState;
  readonly endPhase: () => void;
  // No different pickUnit, pickLeaf, etc.
  // The difference between activation and upgrading is not the concern of
  // Hand or Card.
  readonly pickCard: (_: CardClass) => void;
  // TODO 10: onUpgrade, onDeploy,
  readonly placeCard: (_: Position) => void;
  // TODO 9: activate(card)
  // - should set pickedCard
  // - should set activationState
  // TODO 9: commitActivation(position)
  // - should move the pickedCard
  // - should unset pickedCard
  // - should unset activationState
};

const shuffled: <T>(cards: readonly T[]) => T[] = cards => {
  const source = [...cards];
  const result = [];
  while (source.length > 0) {
    result.push(source.splice(Math.floor(Math.random() * source.length), 1)[0]);
  }
  return result;
};

export const shuffledDeterministicStartingHand = () =>
  shuffled(DETERMINISTIC_STARTING_HAND);

// TODO 10: Unit test the context and default values
export const GameContext = createContext<GameContext>({
  state: {
    flow: {
      phase: Phase.Main,
      player: Player.South,
      subphase: Subphase.Idle,
    },
    grid: INITIAL_GRID,
    northHand: shuffledDeterministicStartingHand(),
    southHand: shuffledDeterministicStartingHand(),
  },
  endPhase: () => {},
  // TODO 11: Make it operate on a card instead of a card class
  pickCard: (_: CardClass) => {},
  placeCard: (_: Position) => {},
});

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
        <div
          className={`zooming highlighting-card ${Player.STYLES[owner]}`}
          tabIndex={0}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export function Game() {
  const {
    state: {
      flow: { phase, player, subphase },
      flow,
      grid,
      northHand,
      southHand,
      pickedCard,
    },
    endPhase,
    pickCard,
    placeCard,
  } = useContext(GameContext);

  return (
    <div role="application" aria-label="Wartoad" className="wartoad-app">
      <header>
        <div className="title">
          <h1>
            War<span className="accent">toad</span>
          </h1>
        </div>
        <PhaseTracker flow={flow} onNextPhaseClicked={endPhase} />
      </header>
      <main>
        <section className="handarea">
          <Hand
            player={Player.North}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.North}
            isPlacing={subphase !== Subphase.Idle}
            handCards={northHand}
            onPick={pickCard}
          />
          {subphase !== Subphase.Idle && (
            // TODO 18: Make cards zoomable/inspectable/something outside of deploys and upgrades
            <PickedCard owner={player}>
              {pickedCard === CardClass.Froglet ? <Froglet /> : <LilyPad />}
            </PickedCard>
          )}
          <Hand
            player={Player.South}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.South}
            isPlacing={subphase !== Subphase.Idle}
            handCards={southHand}
            onPick={pickCard}
          />
        </section>
        <div className="scroll-x">
          <section className="playarea">
            <Pond onPlaceCard={placeCard} flow={flow} grid={grid} />
          </section>
        </div>
      </main>
    </div>
  );
}
