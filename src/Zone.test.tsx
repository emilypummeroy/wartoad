import { fireEvent, screen, render } from '@testing-library/react';

import { ROW_COUNT, Player, Phase, Subphase, type Position } from './App';
import { Zone } from './Zone';

const MIDDLE = 1;

const NOOP = () => {};

const FLOW = {
  player: Player.North,
  phase: Phase.Main,
  subphase: Subphase.Idle,
};

describe(Zone, () => {
  describe.for([Player.North, Player.South])(
    'when controlled by %s',
    player => {
      it.each([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 4 },
        { x: 2, y: 5 },
      ])(
        `should have a ${player} Green Field if upgraded in non-home position %s`,
        _ => {
          render(
            <Zone
              isUpgraded
              flow={FLOW}
              // Make sure this is preserved when refactoring to x/y
              isHome={false}
              controller={player}
              onPlace={NOOP}
            />,
          );

          expect(screen.getByRole('region')).toHaveAccessibleName(
            `${player} owned Green Field`,
          );
        },
      );
    },
  );

  it.for<[Player, Position]>([
    [Player.North, { x: 1, y: 0 }],
    [Player.South, { x: 1, y: ROW_COUNT - 1 }],
  ])(
    'should have a %s Green Field if upgraded in non-home position %s',
    ([player, _]) => {
      render(
        <Zone
          isUpgraded
          flow={FLOW}
          // Make sure this is preserved when refactoring to x/y
          isHome
          controller={player}
          onPlace={NOOP}
        />,
      );

      expect(screen.getByRole('region')).toHaveAccessibleName(
        `${player} Home Green Field`,
      );
    },
  );

  describe.for<[controller: Player, turnPlayer: Player, Phase, Position]>([
    // 2*2*3 -- Position is incidental
    [Player.North, Player.North, Phase.Start, { x: MIDDLE, y: 0 }],
    [Player.South, Player.North, Phase.Main, { x: MIDDLE, y: ROW_COUNT - 1 }],
    [Player.North, Player.North, Phase.End, { x: MIDDLE, y: 0 }],
    [Player.South, Player.North, Phase.Start, { x: 0, y: 0 }],
    [Player.North, Player.North, Phase.Main, { x: 2, y: 5 }],
    [Player.South, Player.North, Phase.End, { x: 0, y: 1 }],
    [Player.South, Player.South, Phase.Start, { x: MIDDLE, y: ROW_COUNT - 1 }],
    [Player.North, Player.South, Phase.Main, { x: MIDDLE, y: 0 }],
    [Player.South, Player.South, Phase.End, { x: MIDDLE, y: ROW_COUNT - 1 }],
    [Player.North, Player.South, Phase.Start, { x: 2, y: 4 }],
    [Player.South, Player.South, Phase.Main, { x: 0, y: 2 }],
    [Player.North, Player.South, Phase.End, { x: 2, y: 3 }],
  ])(
    'basic cases :: controlled by %s | %s %s phase | %s | while idle',
    ([controller, turnPlayer, phase, { x, y }]) => {
      const isHome = x === MIDDLE && (y === 0 || y === ROW_COUNT - 1);
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

      it(`should have a ${controller} Green Field if upgraded`, () => {
        render(
          <Zone
            isUpgraded
            flow={flow}
            isHome={isHome}
            controller={controller}
            onPlace={NOOP}
          />,
        );

        expect(screen.getByRole('region')).toHaveAccessibleName(/Green Field/);
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
          screen.queryByRole('button', { name: /Place on/ }),
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
