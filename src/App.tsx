import './App.css';
import { GameContext, useGameContextData } from './context/GameContext';
import { Game } from './Game';
import { INITIAL_HAND_CARD_COUNT } from './state';
import { createCard, deterministicStartingHand } from './state-types/card';
import { CardClass } from './types/card';
import type { Player } from './types/gameflow';

export function DeterministicApp() {
  const context: GameContext = useGameContextData(
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
    drawStartingHand,
    drawNextCard,
  );

  return (
    <GameContext value={context}>
      <Game />
    </GameContext>
  );
}

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
