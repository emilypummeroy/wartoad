import './App.css';
import { GameContext, useGameContextData } from './context/GameContext';
import { Game } from './Game';
import { INITIAL_HAND_CARD_COUNT } from './state';
import { createCard, deterministicStartingHand } from './state-types/card';
import { CardClass, type CardState } from './types/card';
import type { Player } from './types/gameflow';

export function DeterministicApp() {
  const context: GameContext = useGameContextData(
    generateDeck,
    shuffledDeterministicStartingHand,
    deterministicDraw,
  );

  return (
    <GameContext value={context}>
      <Game />
    </GameContext>
  );
}

export function App() {
  const context: GameContext = useGameContextData(
    (x, y) => shuffled(generateDeck(x, y)),
    drawStartingHand,
    drawNextCard,
  );

  return (
    <GameContext value={context}>
      <Game />
    </GameContext>
  );
}

const LILYPAD_COUNT = 15;
const OLD_LEAF_COUNT = 5;
const FROGLET_COUNT = 40;

export const generateDeck = (
  owner: Player,
  getNextCardKey: () => number,
): CardState[] => [
  ...Array.from({ length: LILYPAD_COUNT }, () =>
    createCard({
      cardClass: CardClass.LilyPad,
      owner,
      key: getNextCardKey(),
    }),
  ),
  ...Array.from({ length: OLD_LEAF_COUNT }, () =>
    createCard({
      cardClass: CardClass.OldLeaf,
      owner,
      key: getNextCardKey(),
    }),
  ),
  ...Array.from({ length: FROGLET_COUNT }, () =>
    createCard({
      cardClass: CardClass.Froglet,
      owner,
      key: getNextCardKey(),
    }),
  ),
];

const drawStartingHand = (owner: Player, getNextCardKey: () => number) =>
  Array.from({ length: INITIAL_HAND_CARD_COUNT }, () =>
    createCard({
      cardClass: randomCardClass(),
      owner,
      key: getNextCardKey(),
    }),
  );

const drawNextCard = (owner: Player, getNextCardKey: () => number) =>
  createCard({
    cardClass: randomCardClass(),
    owner,
    key: getNextCardKey(),
  });

const randomCardClass = (): CardClass =>
  Object.values(CardClass)[
    Math.floor(Math.random() * Object.values(CardClass).length)
  ];

const shuffled: <T>(cards: readonly T[]) => T[] = cards => {
  const source = [...cards];
  const result = [];
  while (source.length > 0) {
    result.push(source.splice(Math.floor(Math.random() * source.length), 1)[0]);
  }
  return result;
};

const shuffledDeterministicStartingHand = (
  player: Player,
  getNextCardKey: () => number,
) => shuffled(deterministicStartingHand(player, getNextCardKey));

const deterministicDraw = (owner: Player, getNextCardKey: () => number) =>
  createCard({
    cardClass: CardClass.Froglet,
    owner,
    key: getNextCardKey(),
  });
