import './App.css';
import { useCallback, useRef, useState } from 'react';

import {
  DEFAULT_GAME_STATE,
  GameContext,
  shuffledDeterministicStartingHand,
  type GameState,
} from './context/GameContext';
import { Game } from './Game';
import { createUnit } from './state/card';
import { setPondStateAt } from './state/pond';
import { CardClass, CardType, UnitClass } from './types/card-class';
import {
  Phase,
  PHASE_AFTER,
  Player,
  PLAYER_AFTER,
  Subphase,
} from './types/gameflow';
import type { Position } from './types/position';

export const INITIAL_HAND_CARD_COUNT = 7;

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

const nextPhaseRandom = ({
  flow: { player, phase },
  northHand,
  southHand,
  ...rest
}: GameState) => ({
  ...rest,
  flow: {
    player: phase === Phase.End ? PLAYER_AFTER[player] : player,
    phase: PHASE_AFTER[phase],
    subphase: Subphase.Idle,
  },
  // TODO 11: Extract to draw function
  northHand:
    PHASE_AFTER[phase] === Phase.Start && PLAYER_AFTER[player] === Player.North
      ? [...northHand, randomCard()]
      : northHand,
  // TODO 11: Extract to draw function
  southHand:
    PHASE_AFTER[phase] === Phase.Start && PLAYER_AFTER[player] === Player.South
      ? [...southHand, randomCard()]
      : southHand,
});

const endPhaseDeterministic = ({
  flow: { player, phase },
  northHand,
  southHand,
  ...rest
}: GameState) => ({
  ...rest,
  flow: {
    player: phase === Phase.End ? PLAYER_AFTER[player] : player,
    phase: PHASE_AFTER[phase],
    subphase: Subphase.Idle,
  },
  // TODO 11: Extract to draw function
  northHand:
    PHASE_AFTER[phase] === Phase.Start && PLAYER_AFTER[player] === Player.North
      ? [...northHand, CardClass.Froglet]
      : northHand,
  // TODO 11: Extract to draw function
  southHand:
    PHASE_AFTER[phase] === Phase.Start && PLAYER_AFTER[player] === Player.South
      ? [...southHand, CardClass.Froglet]
      : southHand,
});

const pickCard =
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

const placeCard =
  (position: Position, getNextCardKey: () => number) =>
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
    grid: setPondStateAt(
      grid,
      position,
      subphase === Subphase.Upgrading
        ? // TODO 10: Make it create a card for leaves too
          { units, isUpgraded: true }
        : {
            isUpgraded,
            units: [
              ...units,
              createUnit({
                cardClass: UnitClass.Froglet,
                owner: player,
                key: getNextCardKey(),
              }),
            ],
          },
    ),
  });

const useCardKeys = () => {
  const previousCardKey = useRef(0);
  return {
    getNext: useCallback(() => {
      const cardKey = previousCardKey.current + 1;
      previousCardKey.current = cardKey;
      return cardKey;
    }, [previousCardKey]),
  };
};

export function DeterministicApp() {
  const [state, setGameState] = useState<Readonly<GameState>>({
    ...DEFAULT_GAME_STATE,
    northHand: shuffledDeterministicStartingHand(),
    southHand: shuffledDeterministicStartingHand(),
  });

  const { getNext } = useCardKeys();
  const context: GameContext = [
    state,
    {
      endPhase: useCallback(() => setGameState(endPhaseDeterministic), []),
      pickCard: useCallback(
        (cardClass: CardClass) => setGameState(pickCard(cardClass)),
        [],
      ),
      placeCard: useCallback(
        (position: Position) => setGameState(placeCard(position, getNext)),
        [getNext],
      ),
    },
  ];

  return (
    <GameContext value={context}>
      <Game />
    </GameContext>
  );
}

export function App() {
  const [state, setGameState] = useState<Readonly<GameState>>({
    ...DEFAULT_GAME_STATE,
    northHand: Array.from({ length: INITIAL_HAND_CARD_COUNT }, randomCard),
    southHand: Array.from({ length: INITIAL_HAND_CARD_COUNT }, randomCard),
  });

  const { getNext } = useCardKeys();
  const context: GameContext = [
    state,
    {
      endPhase: useCallback(() => setGameState(nextPhaseRandom), []),
      pickCard: useCallback(
        (cardClass: CardClass) => setGameState(pickCard(cardClass)),
        [],
      ),
      placeCard: useCallback(
        (position: Position) => setGameState(placeCard(position, getNext)),
        [getNext],
      ),
    },
  ];

  return (
    <GameContext value={context}>
      <Game />
    </GameContext>
  );
}
