import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import { Phase, Player, Subphase } from '../types/gameflow';
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

export const gameflowOf = ([
  player = DEFAULT_GAME_STATE.flow.player,
  subphase = DEFAULT_GAME_STATE.flow.subphase,
  phase = DEFAULT_GAME_STATE.flow.phase,
]: readonly [Player?, Subphase?, Phase?]) => ({
  flow: {
    player,
    phase,
    subphase,
  },
});

export const activationOf = (start?: Position) =>
  start
    ? {
        activationState: { start },
      }
    : {};
