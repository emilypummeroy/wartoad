import { screen, fireEvent, render } from '@testing-library/react';

import { Phase, Player, Subphase } from '../types/gameflow';
import { PhaseTracker } from './PhaseTracker';

const NOOP = () => {};

const { North, South } = Player;
const { Start, Main, End } = Phase;
const { Idle, Upgrading, Deploying, Activating } = Subphase;

describe(PhaseTracker, () => {
  it.for<[Player, Phase, Subphase]>([
    [North, Start, Idle],
    [North, Main, Idle],
    [North, Main, Deploying],
    [North, Main, Upgrading],
    [North, Main, Activating],
    [North, End, Idle],
    [South, Start, Idle],
    [South, Main, Idle],
    [South, Main, Deploying],
    [South, Main, Upgrading],
    [South, End, Idle],
  ])('should show the %s %s phase during %s subphase', ([player, phase, subphase]) => {
    const flow = { player, phase, subphase };
    render(<PhaseTracker flow={flow} onNextPhaseClicked={NOOP} />);
    expect(screen.getByRole('region', { name: `${player}: ${phase} phase` })).toBeVisible();
  });

  it.for<[Player, Phase]>([
    [North, Start],
    [North, Main],
    [North, End],
    [South, Start],
    [South, Main],
    [South, End],
  ])('should allow clicking to progress phase when Idle in the %s %s phase', ([player, phase]) => {
    const onNextPhaseClicked = vi.fn<() => void>();
    render(<PhaseTracker flow={{ player, phase, subphase: Idle }} onNextPhaseClicked={onNextPhaseClicked} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next phase' }));
    expect(onNextPhaseClicked).toHaveBeenCalledOnce();
  });

  it.for<[Subphase, Player]>([
    [Deploying, North],
    [Upgrading, North],
    [Deploying, South],
    [Upgrading, South],
  ])('should not allow clicking to progress phase when Idle in the %s %s phase', ([subphase, player]) => {
    const onNextPhaseClicked = vi.fn<() => void>();
    render(<PhaseTracker flow={{ player, phase: Main, subphase }} onNextPhaseClicked={onNextPhaseClicked} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next phase' }));
    expect(onNextPhaseClicked).not.toHaveBeenCalled();
  });
});
