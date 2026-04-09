import { fireEvent, screen, render } from '@testing-library/react';

import { Player, Phase, Subphase } from './App';
import { Zone } from './Zone';

const NOOP = () => {};

describe(Zone, () => {
  describe.for<
    [controller: Player, turnPlayer: Player, Phase, isHome: boolean]
  >([
    // Triowise all combinations: 3x2x2
    [Player.North, Player.North,  Phase.Start, true, ],
    [Player.South, Player.North,   Phase.Main, true, ],
    [Player.North, Player.North,    Phase.End, true, ],
    [Player.South, Player.North,  Phase.Start, false,],
    [Player.North, Player.North,   Phase.Main, false,],
    [Player.South, Player.North,    Phase.End, false,],
    [Player.North, Player.South,  Phase.Start, true, ],
    [Player.South, Player.South,   Phase.Main, true, ],
    [Player.North, Player.South,    Phase.End, true, ],
    [Player.South, Player.South,  Phase.Start, false,],
    [Player.North, Player.South,   Phase.Main, false,],
    [Player.South, Player.South,    Phase.End, false,],
  ])(
    'basic cases :: controlled by %s | %s %s phase | isHome %s | while idle',
    ([controller, turnPlayer, phase, isHome]) => {
      const flow = {
        player: turnPlayer,
        phase,
        subphase: Subphase.Idle,
      };

      it(`should have a ${controller} empty field if unupgraded`, () => {
        render(
          <Zone
            isUpgraded={false}
            isHome={isHome}
            flow={flow}
            controller={controller}
            onPlace={NOOP}
          />,
        );

        expect(screen.getByRole('region')).toHaveAccessibleName(
          `${controller} controlled empty field`,
        );
      });

      it(`should have a ${controller} ${isHome ? 'Home' : 'owned'} Green Field if upgraded`, () => {
        render(
          <Zone
            isUpgraded
            flow={flow}
            isHome={isHome}
            controller={controller}
            onPlace={NOOP}
          />,
        );

        expect(screen.getByRole('region')).toHaveAccessibleName(
          `${controller} ${isHome ? 'Home' : 'owned'} Green Field`,
        );
      });

      it('should not have a dropzone', () => {
        render(
          <Zone
            isHome={isHome}
            flow={flow}
            isUpgraded={false}
            controller={controller}
            onPlace={NOOP}
          />,
        );

        expect(
          screen.queryByRole('button', {
            name: /Place on/,
          }),
        ).not.toBeInTheDocument();
      });

      it('should not call onPlace if clicked', () => {
        const onPlace = vi.fn<() => void>();
        render(
          <Zone
            isHome={isHome}
            flow={flow}
            isUpgraded={false}
            controller={controller}
            onPlace={onPlace}
          />,
        );

        fireEvent.click(screen.getByRole('button'));

        expect(onPlace).not.toHaveBeenCalled();
      });
    },
  );

  describe.for<[Player, isHome: boolean]>([
    [Player.North, true],
    [Player.North, false],
    [Player.South, true],
    [Player.South, false],
  ])(
    'when controlled by %s while opponent is placing a card | isHome: %s',
    ([controller, isHome]) => {
      const flow = {
        player: controller === Player.North ? Player.South : Player.North,
        phase: Phase.Main,
        subphase: Subphase.Placing,
      };

      it('should not have a dropzone', () => {
        render(
          <Zone
            isHome={isHome}
            flow={flow}
            isUpgraded={false}
            controller={controller}
            onPlace={NOOP}
          />,
        );

        expect(
          screen.queryByRole('button', { name: /Place on/ }),
        ).not.toBeInTheDocument();
        for (const button of screen.queryAllByRole('button'))
          expect(button).not.toBeEnabled();
      });

      it('should not call onPlace if clicked', () => {
        const onPlace = vi.fn<() => void>();
        render(
          <Zone
            isHome={isHome}
            flow={flow}
            isUpgraded={false}
            controller={controller}
            onPlace={onPlace}
          />,
        );

        fireEvent.click(screen.getByRole('region'));

        expect(onPlace).not.toHaveBeenCalled();
      });
    },
  );

  describe.for<[Player, isHome: boolean]>([
    [Player.North, true],
    [Player.North, false],
    [Player.South, true],
    [Player.South, false],
  ])(
    'when controlled by %s while they are placing a card | isHome: %s',
    ([player, isHome]) => {
      const flow = {
        player,
        phase: Phase.Main,
        subphase: Subphase.Placing,
      };

      it('should not have a dropzone if upgraded', () => {
        render(
          <Zone
            isHome={isHome}
            flow={flow}
            controller={player}
            isUpgraded
            onPlace={NOOP}
          />,
        );

        expect(
          screen.queryByRole('button', { name: /Place on/ }),
        ).not.toBeInTheDocument();
        for (const button of screen.queryAllByRole('button'))
          expect(button).not.toBeEnabled();
      });

      it('should not call onPlace if upgraded if the dropzone is clicked', () => {
        const onPlace = vi.fn<() => void>();
        render(
          <Zone
            isHome={isHome}
            flow={flow}
            controller={player}
            isUpgraded
            onPlace={onPlace}
          />,
        );

        fireEvent.click(screen.getByRole('region'));
        expect(onPlace).not.toHaveBeenCalled();
      });
      it('should have a dropzone if unupgraded', () => {
        render(
          <Zone
            isHome={isHome}
            flow={flow}
            controller={player}
            isUpgraded={false}
            onPlace={NOOP}
          />,
        );

        expect(
          screen.getByRole('button', {
            name: `Place on ${player} controlled empty field`,
          }),
        ).toBeVisible();
      });

      it('should call onPlace if unupgraded if the dropzone is clicked', () => {
        const onPlace = vi.fn<() => void>();
        render(
          <Zone
            isHome={isHome}
            flow={flow}
            controller={player}
            isUpgraded={false}
            onPlace={onPlace}
          />,
        );

        fireEvent.click(
          screen.getByRole('button', {
            name: `Place on ${player} controlled empty field`,
          }),
        );

        expect(onPlace).toHaveBeenCalledOnce();
      });
    },
  );
});
