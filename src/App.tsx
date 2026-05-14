import './App.css';
import { GameContext, useGameContextData } from './context/GameContext';
import { Game } from './Game';
import { createCard } from './state-types/card';
import { generateDeck, generateDeckDeterministic } from './state-types/deck';
import { shuffled } from './types';
import { CardClass } from './types/card';
import type { Player } from './types/gameflow';

export function DeterministicApp() {
  const context: GameContext = useGameContextData(
    generateDeckDeterministic,
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
    drawNextCard,
  );

  return (
    <GameContext value={context}>
      <Game />
    </GameContext>
  );
}

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

const deterministicDraw = (owner: Player, getNextCardKey: () => number) =>
  createCard({
    cardClass: CardClass.Froglet,
    owner,
    key: getNextCardKey(),
  });
