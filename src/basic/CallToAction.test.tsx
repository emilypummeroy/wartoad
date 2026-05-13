import { screen } from '@testing-library/react';

import { renderWithGameContext } from '../context/GameContext.test-utils';
import { gameflowOf } from '../state/test-utils';
import { Phase, Player } from '../types/gameflow';
import { CallToAction } from './CallToAction';

const { North, South } = Player;
const { Start, Main, End, GameOver, Upgrading, Deploying, Activating } = Phase;

describe(CallToAction, () => {
  describe.for<[Player, Phase]>([
    [North, GameOver],
    [North, Upgrading],
    [North, Deploying],
    [North, Activating],
    [South, GameOver],
    [South, Upgrading],
    [South, Deploying],
    [South, Activating],
  ])('in %s %s phase', ([player, phase]) => {
    beforeEach(() => {
      renderWithGameContext([gameflowOf(player, phase)])(<CallToAction />);
    });

    it('should have a call to action', () => {
      expect(screen.getByText(/./)).toBeVisible();
    });

    it('should have a consistent message', () => {
      expect(screen.getByText(/./).textContent).toMatchSnapshot();
    });
  });

  describe.for<[Player, Phase]>([
    [North, Start],
    [North, Main],
    [North, End],
    [South, Start],
    [South, Main],
    [South, End],
  ])('in %s %s phase', ([player, phase]) => {
    beforeEach(() => {
      renderWithGameContext([gameflowOf(player, phase)])(<CallToAction />);
    });

    it('should not have a call to action', () => {
      expect(screen.queryByText(/[^s]/)).not.toBeInTheDocument();
    });
  });
});
