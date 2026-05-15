import './App.css';
import { GameContext, useGameContextData } from './context/GameContext';
import { Game } from './Game';
import { generateDeck, generateDeckDeterministic } from './state-types/deck';
import { shuffled } from './types';

export function DeterministicApp() {
  const context: GameContext = useGameContextData(generateDeckDeterministic);

  return (
    <GameContext value={context}>
      <Game />
    </GameContext>
  );
}

export function App() {
  const context: GameContext = useGameContextData((x, y) =>
    shuffled(generateDeck(x, y)),
  );

  return (
    <GameContext value={context}>
      <Game />
    </GameContext>
  );
}
