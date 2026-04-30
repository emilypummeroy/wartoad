import { createContext, useMemo, useRef, useState } from 'react';

import {
  activate,
  commitDeployment,
  commitActivation,
  commitUpgrade,
  type GameActions,
  pickCard,
  finishPhase,
  DEFAULT_GAME_ACTIONS,
} from '../actions';
import { cancelActivePhase } from '../actions/cancel-active-phase';
import { createState, DEFAULT_GAME_STATE } from '../state';
import type { GameState } from '../state-types';
import { type CardState } from '../types/card';
import type { Player } from '../types/gameflow';

export type GameContext = [GameState, GameActions];

export const useGameContextData = (
  getStartingHand: (owner: Player, getNextCardKey: () => number) => CardState[],
  getDrawnCard: (owner: Player, getNextCardKey: () => number) => CardState,
): GameContext => {
  const cardKey = useRef(0);
  const getNextCardKey = () => (cardKey.current += 1);
  const [state, setState] = useState<GameState>(
    createState(p => getStartingHand(p, getNextCardKey)),
  );
  const actions = useMemo(
    () =>
      dropAll(setState)({
        finishPhase: () =>
          finishPhase(player => getDrawnCard(player, getNextCardKey)),

        pickCard,
        activate,

        commitUpgrade,
        commitDeployment,
        commitActivation,

        cancelActivePhase,
      }),
    [getDrawnCard],
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
    commitDeployment,
    commitActivation,
    cancelActivePhase,
  }) => ({
    finishPhase: drop(set)(finishPhase),
    pickCard: drop(set)(pickCard),
    activate: drop(set)(activate),
    commitUpgrade: drop(set)(commitUpgrade),
    commitDeployment: drop(set)(commitDeployment),
    commitActivation: drop(set)(commitActivation),
    cancelActivePhase: drop(set)(cancelActivePhase),
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
