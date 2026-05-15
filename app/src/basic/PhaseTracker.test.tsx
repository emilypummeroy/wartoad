import { screen, fireEvent } from '@testing-library/react';

import { renderWithGameContext } from '@/context/GameContext.test-utils';
import { gameflowOf, winningPondOf } from '@/state/test-utils';
import { Phase, Player } from '@/types/gameflow';

import { PhaseTracker } from './PhaseTracker';

const { North, South } = Player;
const { Start, Main, End, GameOver, Upgrading, Deploying, Activating } = Phase;

describe(PhaseTracker, () => {
  const finishPhase = vi.fn<() => void>();
  const cancelActivePhase = vi.fn<() => void>();
  describe.for<[Player, Phase, Phase]>([
    [North, Start, Start],
    [North, Main, Main],
    [North, Main, Deploying],
    [North, Main, Upgrading],
    [North, Main, Activating],
    [North, End, End],
    [South, Start, Start],
    [South, Main, Main],
    [South, Main, Upgrading],
    [South, Main, Deploying],
    [South, Main, Upgrading],
    [South, End, End],
  ])('During %s %s phase | name of phase: %s', ([player, namedPhase, phase]) => {
    beforeEach(() => {
      renderWithGameContext([gameflowOf(player, phase)])(<PhaseTracker />);
    });
    it(`should render the ${player} ${namedPhase} phase tracker`, () => {
      expect(screen.getByRole('region', { name: `${player}: ${namedPhase} phase` })).toBeVisible();
    });
  });

  it.for<[Player, Phase]>([
    [North, Start],
    [North, Main],
    [North, End],
    [South, Start],
    [South, Main],
    [South, End],
  ])('should allow clicking to progress phase when in the %s %s phase', ([player, phase]) => {
    renderWithGameContext([gameflowOf(player, phase), { finishPhase, cancelActivePhase }])(<PhaseTracker />);
    fireEvent.click(screen.getByRole('button', { name: 'Next phase' }));
    expect(finishPhase).toHaveBeenCalledOnce();
    expect(cancelActivePhase).not.toHaveBeenCalled();
  });

  it.for<[Phase, Player, noun: string]>([
    [Deploying, North, 'Deployment'],
    [Upgrading, North, 'Upgrade'],
    [Activating, North, 'Activation'],
    [Deploying, South, 'Deployment'],
    [Upgrading, South, 'Upgrade'],
    [Activating, South, 'Activation'],
  ])('should allow clicking to cancel the action when in the %s %s phase', ([phase, player, noun]) => {
    renderWithGameContext([
      {
        ...gameflowOf(player, phase),
      },
      { finishPhase, cancelActivePhase },
    ])(<PhaseTracker />);
    fireEvent.click(screen.getByRole('button', { name: `Cancel ${noun}` }));
    expect(cancelActivePhase).toHaveBeenCalledOnce();
    expect(finishPhase).not.toHaveBeenCalled();
  });

  it.for<[winner: Player, turn: Player]>([
    [North, North],
    [North, South],
    [South, North],
    [South, South],
  ])('should show the %s player winner message when they win during %s turn', ([winner, player]) => {
    renderWithGameContext([
      {
        ...gameflowOf(player, GameOver),
        ...winningPondOf(winner),
      },
    ])(<PhaseTracker />);
    expect(screen.getByRole('region', { name: `A WINRAR is ${winner}` })).toBeVisible();
  });

  it.for<[winner: Player, turn: Player]>([
    [North, North],
    [North, South],
    [South, North],
    [South, South],
  ])('should not have a button to progress phase after %s wins on %s turn', ([winner, player]) => {
    renderWithGameContext([
      {
        ...gameflowOf(player, GameOver),
        ...winningPondOf(winner),
      },
    ])(<PhaseTracker />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
