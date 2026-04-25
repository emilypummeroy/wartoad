import { createContext, useRef, useState } from 'react';

import {
  activate,
  commitDeploy,
  commitActivate,
  commitUpgrade,
  type GameActions,
  pickCard,
  finishPhase,
} from '../action';
import { createState, DEFAULT_GAME_STATE } from '../state';
import type { GameState } from '../state-types';
import { type CardClass, type UnitCard } from '../types/card';
import { type Position } from '../types/position';

export type GameContext = [GameState, GameActions];

export const useGameContextData = (
  getStartingHand: () => CardClass[],
  getDrawnCard: () => CardClass,
): GameContext => {
  const cardKey = useRef(0);
  const getNextCardKey = () => (cardKey.current += 1);
  const [state, setState] = useState<GameState>(createState(getStartingHand));
  const dispatch = createDispatch(getDrawnCard, getNextCardKey)(setState);
  return [state, dispatch];
};

export const DEFAULT_GAME_DISPATCH: GameActions = {
  finishPhase: () => {},
  pickCard: () => {},
  activate: () => {},
  commitUpgrade: () => {},
  commitDeploy: () => {},
  commitActivate: () => {},
};

export const GameContext = createContext<GameContext>([
  DEFAULT_GAME_STATE,
  DEFAULT_GAME_DISPATCH,
]);

const createDispatch =
  (getDrawnCard: () => CardClass, getNextCardKey: () => number) =>
  (setState: (_: (_: GameState) => GameState) => void): GameActions => ({
    finishPhase: () => setState(finishPhase(getDrawnCard)),

    pickCard: (card: CardClass) => setState(pickCard(card)),

    activate: (unit: UnitCard, position: Position) =>
      setState(activate(unit, position)),

    commitUpgrade: (position: Position) =>
      setState(commitUpgrade(getNextCardKey)(position)),
    commitDeploy: (position: Position) =>
      setState(commitDeploy(getNextCardKey)(position)),
    commitActivate: (position: Position) => setState(commitActivate(position)),
  });

// type GameStateDrop = (
//   setState: (_: (_: GameState) => GameState) => void,
// ) => (gsa: GameStateActions) => GameActions;

// type GameStateActions = {
//   [K in keyof GameActions]: (
//     ..._: Parameters<GameActions[K]>
//   ) => (_: GameState) => GameState;
// };
