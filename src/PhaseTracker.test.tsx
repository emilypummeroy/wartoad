import { screen, fireEvent, render } from '@testing-library/react';

import { Phase, PhaseTracker, Player, Subphase } from './PhaseTracker';

const NOOP = () => {};

describe(PhaseTracker, () => {
  it.for<[Player, Phase, Subphase]>([
    [Player.North, Phase.Start, Subphase.Idle],
    [Player.North, Phase.Main, Subphase.Idle],
    [Player.North, Phase.Main, Subphase.Deploying],
    [Player.North, Phase.Main, Subphase.Upgrading],
    [Player.North, Phase.End, Subphase.Idle],
    [Player.South, Phase.Start, Subphase.Idle],
    [Player.South, Phase.Main, Subphase.Idle],
    [Player.South, Phase.Main, Subphase.Deploying],
    [Player.South, Phase.Main, Subphase.Upgrading],
    [Player.South, Phase.End, Subphase.Idle],
  ])(
    'should show the %s %s phase during %s subphase',
    ([player, phase, subphase]) => {
      const flow = { player, phase, subphase };
      render(<PhaseTracker flow={flow} onNextPhaseClicked={NOOP} />);
      expect(
        screen.getByRole('region', { name: `${player}: ${phase} phase` }),
      ).toBeVisible();
    },
  );

  it.for<[Player, Phase]>([
    [Player.North, Phase.Start],
    [Player.North, Phase.Main],
    [Player.North, Phase.End],
    [Player.South, Phase.Start],
    [Player.South, Phase.Main],
    [Player.South, Phase.End],
  ])(
    'should allow clicking to progress phase when Idle in the %s %s phase',
    ([player, phase]) => {
      const onNextPhaseClicked = vi.fn<() => void>();
      render(
        <PhaseTracker
          flow={{ player, phase, subphase: Subphase.Idle }}
          onNextPhaseClicked={onNextPhaseClicked}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Next phase' }));
      expect(onNextPhaseClicked).toHaveBeenCalledOnce();
    },
  );

  it.for<[Subphase, Player]>([
    [Subphase.Deploying, Player.North],
    [Subphase.Upgrading, Player.North],
    [Subphase.Deploying, Player.South],
    [Subphase.Upgrading, Player.South],
  ])(
    'should not allow clicking to progress phase when Idle in the %s %s phase',
    ([subphase, player]) => {
      const onNextPhaseClicked = vi.fn<() => void>();
      render(
        <PhaseTracker
          flow={{ player, phase: Phase.Main, subphase }}
          onNextPhaseClicked={onNextPhaseClicked}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Next phase' }));
      expect(onNextPhaseClicked).not.toHaveBeenCalled();
    },
  );
});
