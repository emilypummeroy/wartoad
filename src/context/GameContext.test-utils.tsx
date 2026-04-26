import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import type { GameActions } from '../actions';
import { DEFAULT_GAME_ACTIONS } from '../actions';
import { DEFAULT_GAME_STATE } from '../state';
import type { GameState } from '../state-types';
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
