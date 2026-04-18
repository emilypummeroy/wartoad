import './App.css';
import { useCallback, useState, type ReactNode } from 'react';

import { Froglet, LilyPad } from './Card';
import { CardClass, CardType } from './card-types';
import { type Position, INITIAL_GRID, GridState, Grid } from './Grid';
import { Hand } from './Hand';
import {
  PhaseTracker,
  Phase,
  Player,
  Subphase,
  type FlowState,
} from './PhaseTracker';

export const INITIAL_HAND_CARD_COUNT = 7;

type GameState = {
  readonly flow: FlowState;
  readonly grid: GridState;
  // TODO 11: Card[]
  readonly northHand: readonly CardClass[];
  // TODO 11: Card[]
  readonly southHand: readonly CardClass[];
  // TODO 11: Card
  readonly pickedCard?: CardClass;
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

// TODO 11: Make generic
const shuffled = (cards: readonly CardClass[]): CardClass[] => {
  const source = [...cards];
  const result = [];
  while (source.length > 0) {
    result.push(source.splice(Math.floor(Math.random() * source.length), 1)[0]);
  }
  return result;
};

// TODO 11: Rename to random card class
const randomCard = (): CardClass =>
  Object.values(CardClass)[
    Math.floor(Math.random() * Object.values(CardClass).length)
  ];

// TODO 11: Remove the particular card
const removeOne = (cards: readonly CardClass[], cardClass: CardClass) => [
  ...cards.slice(0, cards.lastIndexOf(cardClass)),
  ...cards.slice(cards.lastIndexOf(cardClass) + 1),
];

const gameStateForNextPhase =
  (isDeterministic: boolean) =>
  ({ flow: { player, phase }, northHand, southHand, ...rest }: GameState) => ({
    ...rest,
    flow: {
      player: phase === Phase.End ? Player.AFTER[player] : player,
      phase: Phase.AFTER[phase],
      subphase: Subphase.Idle,
    },
    // TODO 11: Extract to draw function
    northHand:
      Phase.AFTER[phase] === Phase.Start &&
      Player.AFTER[player] === Player.North
        ? [...northHand, isDeterministic ? CardClass.Froglet : randomCard()]
        : northHand,
    // TODO 11: Extract to draw function
    southHand:
      Phase.AFTER[phase] === Phase.Start &&
      Player.AFTER[player] === Player.South
        ? [...southHand, isDeterministic ? CardClass.Froglet : randomCard()]
        : southHand,
  });

const gameStateForCardPicked =
  (pickedCard: CardClass) =>
  ({ flow, ...rest }: GameState) => ({
    ...rest,
    flow: {
      ...flow,
      subphase:
        // TODO 11: pickedCard.type
        pickedCard.type === CardType.Unit
          ? Subphase.Deploying
          : Subphase.Upgrading,
    },
    pickedCard,
  });

const gameStateForCardPlaced =
  (position: Position) =>
  ({
    grid,
    grid: {
      [position.y]: {
        [position.x]: { isUpgraded, units },
      },
    },
    flow,
    flow: { subphase, player },
    northHand,
    southHand,
    pickedCard,
  }: GameState) => ({
    flow: { ...flow, subphase: Subphase.Idle },
    northHand:
      player === Player.North && pickedCard && northHand.length > 0
        ? removeOne(northHand, pickedCard)
        : northHand,
    southHand:
      player === Player.South && pickedCard && southHand.length > 0
        ? removeOne(southHand, pickedCard)
        : southHand,
    grid: GridState.setAt(
      grid,
      position,
      subphase === Subphase.Upgrading
        ? // TODO 10: Make it create a card for leaves too
          { units, isUpgraded: true }
        : // TODO 9: Make it create a card for new units only
          { isUpgraded, units: [...units, CardClass.Froglet] },
    ),
  });

const DETERMINISTIC_STARTING_HAND = [
  CardClass.LilyPad,
  CardClass.Froglet,
  CardClass.LilyPad,
  CardClass.Froglet,
  CardClass.Froglet,
  CardClass.Froglet,
  CardClass.LilyPad,
];

export function App({
  // TODO 9: Move into a context
  isDeterministic = false,
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
    northHand: isDeterministic
      ? shuffled(DETERMINISTIC_STARTING_HAND)
      : Array.from({ length: INITIAL_HAND_CARD_COUNT }, randomCard),
    southHand: isDeterministic
      ? shuffled(DETERMINISTIC_STARTING_HAND)
      : Array.from({ length: INITIAL_HAND_CARD_COUNT }, randomCard),
  });

  const handleNextPhaseClicked = useCallback(
    () => setGameState(gameStateForNextPhase(isDeterministic)),
    [isDeterministic],
  );
  // TODO 11: Make it operate on a card instead of a card class
  const handlePickCard = useCallback(
    (cardClass: CardClass) => setGameState(gameStateForCardPicked(cardClass)),
    [],
  );
  const handlePlaceCard = useCallback(
    (position: Position) => setGameState(gameStateForCardPlaced(position)),
    [],
  );

  return (
    <div role="application" aria-label="Wartoad" className="wartoad-app">
      <header>
        <div className="title">
          <h1>
            War<span className="accent">toad</span>
          </h1>
        </div>
        <PhaseTracker flow={flow} onNextPhaseClicked={handleNextPhaseClicked} />
      </header>
      <main>
        <section className="handarea">
          <Hand
            player={Player.North}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.North}
            isPlacing={subphase !== Subphase.Idle}
            handCards={northHand}
            onPick={handlePickCard}
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
