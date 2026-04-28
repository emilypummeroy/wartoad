import { screen, fireEvent } from '@testing-library/react';

import { renderWithGameContext } from '../context/GameContext.test-utils';
import { winningPondOf } from '../state/test-utils';
import { Phase, Player, Subphase } from '../types/gameflow';
import { PhaseTracker } from './PhaseTracker';

const NOOP = () => {};

const { North, South } = Player;
const { Start, Main, End, GameOver } = Phase;
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
    renderWithGameContext()(<PhaseTracker flow={flow} onNextPhaseClicked={NOOP} />);
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
    renderWithGameContext()(
      <PhaseTracker flow={{ player, phase, subphase: Idle }} onNextPhaseClicked={onNextPhaseClicked} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next phase' }));
    expect(onNextPhaseClicked).toHaveBeenCalledOnce();
  });

  it.for<[Phase & Subphase, Player]>([
    [Deploying, North],
    [Upgrading, North],
    [Activating, North],
    [Deploying, South],
    [Upgrading, South],
    [Activating, South],
  ])('should not allow clicking to progress phase when %s in the %s Main phase', ([phase, player]) => {
    const onNextPhaseClicked = vi.fn<() => void>();
    renderWithGameContext()(
      <PhaseTracker flow={{ player, phase, subphase: phase }} onNextPhaseClicked={onNextPhaseClicked} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next phase' }));
    expect(onNextPhaseClicked).not.toHaveBeenCalled();
  });

  it.for<[winner: Player, turn: Player]>([
    [North, North],
    [North, South],
    [South, North],
    [South, South],
  ])('should show the %s player winner message when they win during %s turn', ([winner, player]) => {
    renderWithGameContext([
      {
        ...winningPondOf(winner),
      },
    ])(<PhaseTracker flow={{ player, phase: GameOver, subphase: Idle }} onNextPhaseClicked={NOOP} />);
    expect(screen.getByRole('region', { name: `A WINRAR is ${winner}` })).toBeVisible();
  });

  it.for<[winner: Player, turn: Player]>([
    [North, North],
    [North, South],
    [South, North],
    [South, South],
  ])('should not have a button to progress phase after %s wins on %s turn', ([winner, player]) => {
    const onNextPhaseClicked = vi.fn<() => void>();
    renderWithGameContext([
      {
        ...winningPondOf(winner),
      },
    ])(<PhaseTracker flow={{ player, phase: GameOver, subphase: Idle }} onNextPhaseClicked={onNextPhaseClicked} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
