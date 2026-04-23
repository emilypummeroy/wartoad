import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import type { GameState } from '../state';
import { DEFAULT_GAME_STATE } from '../state';
import type { GameDispatch } from './GameContext';
import { DEFAULT_GAME_DISPATCH, GameContext } from './GameContext';

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
