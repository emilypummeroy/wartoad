import { createContext, useRef, useState } from 'react';

import {
  activate,
  commitDeploy,
  commitUpgrade,
  endPhase,
  pickCard,
  type GameDispatch,
} from '../action';
import { commitActivate } from '../action/commit-activate';
import { createState, DEFAULT_GAME_STATE, type GameState } from '../state';
import { type CardClass, type UnitCard } from '../types/card';
import { type Position } from '../types/position';

export type GameContext = readonly [GameState, GameDispatch];

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

export const DEFAULT_GAME_DISPATCH = {
  endPhase: () => {},
  pickCard: () => {},
  activate: () => {},
  commitUpgrade: () => {},
  commitDeploy: () => {},
  commitActivate: () => {},
};

// TODO 10: Unit test the context and default values
export const GameContext = createContext<GameContext>([
  DEFAULT_GAME_STATE,
  DEFAULT_GAME_DISPATCH,
]);

const createDispatch =
  (getDrawnCard: () => CardClass, getNextCardKey: () => number) =>
  (setState: (_: (_: GameState) => GameState) => void): GameDispatch => ({
    endPhase: () => setState(endPhase(getDrawnCard)),

    pickCard: (card: CardClass) => setState(pickCard(card)),

    activate: (unit: UnitCard, position: Position) =>
      setState(activate(unit, position)),

    commitUpgrade: (position: Position) =>
      setState(commitUpgrade(getNextCardKey)(position)),
    commitDeploy: (position: Position) =>
      setState(commitDeploy(getNextCardKey)(position)),
    commitActivate: (position: Position) => setState(commitActivate(position)),
  });
