import './App.css';
import {
  GameContext,
  INITIAL_HAND_CARD_COUNT,
  useGameContextData,
} from './context/GameContext';
import { Game } from './Game';
import { DETERMINISTIC_STARTING_HAND } from './state-types/card';
import { CardClass } from './types/card';

export function DeterministicApp() {
  const context: GameContext = useGameContextData(
    () => shuffled(DETERMINISTIC_STARTING_HAND),
    () => CardClass.Froglet,
  );

  return (
    <GameContext value={context}>
      <Game />
    </GameContext>
  );
}

export function App() {
  const context: GameContext = useGameContextData(
    () => Array.from({ length: INITIAL_HAND_CARD_COUNT }, randomCardClass),
    randomCardClass,
  );

  return (
    <GameContext value={context}>
      <Game />
    </GameContext>
  );
}

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
