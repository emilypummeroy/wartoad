import { createContext, useMemo, useRef, useState } from 'react';

import {
  activate,
  commitDeploy,
  commitActivate,
  commitUpgrade,
  type GameActions,
  pickCard,
  finishPhase,
  DEFAULT_GAME_ACTIONS,
} from '../actions';
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
  const actions = useMemo(
    () =>
      dropAll(setState)({
        finishPhase: () => finishPhase(getDrawnCard),

        pickCard: (card: CardClass) => pickCard(card),

        activate: (unit: UnitCard, position: Position) =>
          activate(unit, position),

        commitUpgrade: (position: Position) =>
          commitUpgrade(getNextCardKey)(position),
        commitDeploy: (position: Position) =>
          commitDeploy(getNextCardKey)(position),
        commitActivate: (position: Position) => commitActivate(position),
      }),
    [setState, getDrawnCard],
  );
  return [state, actions];
};

export const GameContext = createContext<GameContext>([
  DEFAULT_GAME_STATE,
  DEFAULT_GAME_ACTIONS,
]);

const dropAll: DropAll<GameActions, GameState> =
  set =>
  ({
    finishPhase,
    pickCard,
    activate,
    commitUpgrade,
    commitDeploy,
    commitActivate,
  }) => ({
    finishPhase: drop(set)(finishPhase),
    pickCard: drop(set)(pickCard),
    activate: drop(set)(activate),
    commitUpgrade: drop(set)(commitUpgrade),
    commitDeploy: drop(set)(commitDeploy),
    commitActivate: drop(set)(commitActivate),
  });

const drop: Drop<GameState> =
  set =>
  updater =>
  (...p) =>
    set(updater(...p));

type Drop<S> = (
  set: (updater: (s: S) => S) => void,
) => <P extends unknown[]>(
  updater: (...p: P) => (s: S) => S,
) => (...p: P) => void;

type DropAll<A extends Record<string, (...p: readonly any[]) => void>, S> = (
  set: (updater: (s: S) => S) => void,
) => (gameStateActions: Readonly<Actions<A, S>>) => A;

type Actions<
  out A extends Record<string, (...p: readonly any[]) => void>,
  S,
> = {
  [K in keyof A]: (...p: Parameters<A[K]>) => (s: S) => S;
};
