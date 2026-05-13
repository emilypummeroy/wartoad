import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import { type GameActions, DEFAULT_GAME_ACTIONS } from '../actions';
import type { GameState } from '../state-types';
import { DEFAULT_GAME_STATE } from '../state/test-utils';
import { GameContext } from './GameContext';

// (Not a component):
// oxlint-disable-next-line react/display-name
export const renderWithGameContext =
  ([state, dispatch]: [
    state?: Partial<GameState>,
    dispatch?: Partial<GameActions>,
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
            ...DEFAULT_GAME_ACTIONS,
            ...dispatch,
          },
        ]}
      >
        {children}
      </GameContext>,
    );
