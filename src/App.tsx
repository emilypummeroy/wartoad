import './App.css';
import { useCallback, useRef, useState } from 'react';

import {
  DEFAULT_GAME_STATE,
  endPhase,
  GameContext,
  INITIAL_HAND_CARD_COUNT,
  pickCard,
  placeCard,
  type GameState,
} from './context/GameContext';
import { Game } from './Game';
import { DETERMINISTIC_STARTING_HAND } from './state/card';
import { CardClass } from './types/card-class';

export function DeterministicApp() {
  const [state, setGameState] = useState<Readonly<GameState>>({
    ...DEFAULT_GAME_STATE,
    northHand: shuffled(DETERMINISTIC_STARTING_HAND),
    southHand: shuffled(DETERMINISTIC_STARTING_HAND),
  });

  const { getNextCardKey: getNext } = useCardKeys();
  const context: GameContext = [
    state,
    {
      endPhase: useCallback(
        () => setGameState(endPhase(() => CardClass.Froglet)),
        [],
      ),
      pickCard: useCallback(cardClass => setGameState(pickCard(cardClass)), []),
      placeCard: useCallback(
        position => setGameState(placeCard(getNext)(position)),
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
    northHand: Array.from({ length: INITIAL_HAND_CARD_COUNT }, randomCardClass),
    southHand: Array.from({ length: INITIAL_HAND_CARD_COUNT }, randomCardClass),
  });

  const { getNextCardKey: getNext } = useCardKeys();
  const context: GameContext = [
    state,
    {
      endPhase: useCallback(() => setGameState(endPhase(randomCardClass)), []),
      pickCard: useCallback(cardClass => setGameState(pickCard(cardClass)), []),
      placeCard: useCallback(
        position => setGameState(placeCard(getNext)(position)),
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

const randomCardClass = (): CardClass =>
  Object.values(CardClass)[
    Math.floor(Math.random() * Object.values(CardClass).length)
  ];

const useCardKeys = () => {
  const previousCardKey = useRef(0);
  return {
    getNextCardKey: useCallback(() => {
      const cardKey = previousCardKey.current + 1;
      previousCardKey.current = cardKey;
      return cardKey;
    }, [previousCardKey]),
  };
};

const shuffled: <T>(cards: readonly T[]) => T[] = cards => {
  const source = [...cards];
  const result = [];
  while (source.length > 0) {
    result.push(source.splice(Math.floor(Math.random() * source.length), 1)[0]);
  }
  return result;
};
