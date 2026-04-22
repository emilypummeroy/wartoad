import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import { createUnit, DETERMINISTIC_STARTING_HAND } from '../state/card';
import type { CardClass, UnitCard } from '../types/card';
import { UnitClass, type UnitKey } from '../types/card';
import type { Phase, Subphase } from '../types/gameflow';
import { Player } from '../types/gameflow';
import type { Position } from '../types/position';
import {
  DEFAULT_GAME_DISPATCH,
  DEFAULT_GAME_STATE,
  GameContext,
  type GameDispatch,
  type GameState,
} from './GameContext';

// (Not a component):
// oxlint-disable-next-line react/display-name
export const renderWithGameContext =
  ([state, dispatch]: [
    state?: Partial<GameState>,
    dispatch?: Partial<GameDispatch>,
  ] = []) =>
  (children: ReactNode) =>
    render(
      <GameContext
        value={[
          {
            ...DEFAULT_GAME_STATE,
            ...state,
          },
          {
            ...DEFAULT_GAME_DISPATCH,
            ...dispatch,
          },
        ]}
      >
        {children}
      </GameContext>,
    );

export const gameflowOf = (
  player: Player = DEFAULT_GAME_STATE.flow.player,
  subphase: Subphase = DEFAULT_GAME_STATE.flow.subphase,
  phase: Phase = DEFAULT_GAME_STATE.flow.phase,
): Partial<GameState> => ({
  flow: {
    player,
    phase,
    subphase,
  },
});

export const activationOf = (
  start?: Position,
  unit: UnitCard | UnitKey = UnitClass.Froglet.key,
  owner: Player = typeof unit === 'object' ? unit.owner : Player.North,
): Partial<GameState> =>
  start
    ? {
        activation: {
          start,
          unit:
            typeof unit === 'string'
              ? createUnit({ cardClass: UnitClass[unit], key: -1, owner })
              : { ...unit, owner },
        },
      }
    : {};

export const handsOf = (
  northHand: CardClass[] = DETERMINISTIC_STARTING_HAND,
  southHand: CardClass[] = northHand,
): Partial<GameState> => ({
  northHand,
  southHand,
});

export const pickedCardOf = (pickedCard?: CardClass): Partial<GameState> =>
  pickedCard ? { pickedCard } : {};

export const createStateWith = (partial: Partial<GameState>): GameState => ({
  ...DEFAULT_GAME_STATE,
  ...partial,
});
