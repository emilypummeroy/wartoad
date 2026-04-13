import { fireEvent, screen, render } from '@testing-library/react';

import { Position, ROW_COUNT } from './Grid';
import { Subphase, Phase, Player } from './PhaseTracker';
import { Zone } from './Zone';

const { Start, Main, End } = Phase;
const { North, South } = Player;
const { Placing, Idle } = Subphase;

const MIDDLE = 1;

const NOOP = () => {};

const FLOW = {
  player: North,
  phase: Main,
  subphase: Idle,
};

describe(Zone, () => {
  describe.for([North, South])('when controlled by %s', player => {
    it.each([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 0, y: 3 },
      { x: 1, y: 4 },
      { x: 2, y: 5 },
    ])(
      `should have a ${player} Lily Pad if upgraded in non-home %s`,
      position => {
        render(
          <Zone
            isUpgraded
            flow={FLOW}
            position={position}
            controller={player}
            onPlace={NOOP}
          />,
        );

        expect(screen.getByRole('region')).toHaveAccessibleName(
          `${player} owned Lily Pad`,
        );
      },
    );
  });

  it.for<[Player, Position]>([
    [North, Position.HOME[North]],
    [South, Position.HOME[South]],
  ])(
    'should have a %s Home Lily Pad if upgraded in home %s',
    ([player, position]) => {
      render(
        <Zone
          isUpgraded
          flow={FLOW}
          position={position}
          controller={player}
          onPlace={NOOP}
        />,
      );

      expect(screen.getByRole('region')).toHaveAccessibleName(
        `${player} Home Lily Pad`,
      );
    },
  );

  describe.for<[controller: Player, turnPlayer: Player, Phase, Position]>([
    // 2*2*3 -- Position is incidental
    [North, North, Start, { x: MIDDLE, y: 0 }],
    [South, North, Main, { x: MIDDLE, y: ROW_COUNT - 1 }],
    [North, North, End, { x: MIDDLE, y: 0 }],
    [South, North, Start, { x: 0, y: 0 }],
    [North, North, Main, { x: 2, y: 5 }],
    [South, North, End, { x: 0, y: 1 }],
    [South, South, Start, { x: MIDDLE, y: ROW_COUNT - 1 }],
    [North, South, Main, { x: MIDDLE, y: 0 }],
    [South, South, End, { x: MIDDLE, y: ROW_COUNT - 1 }],
    [North, South, Start, { x: 2, y: 4 }],
    [South, South, Main, { x: 0, y: 2 }],
    [North, South, End, { x: 2, y: 3 }],
  ])(
    'basic cases :: controlled by %s | %s %s phase | %s | while idle',
    ([controller, turnPlayer, phase, position]) => {
      const flow = {
        player: turnPlayer,
        phase,
        subphase: Idle,
      };

      it(`should have a ${controller} conrolled leaf if unupgraded`, () => {
        render(
          <Zone
            isUpgraded={false}
            position={position}
            flow={flow}
            controller={controller}
            onPlace={NOOP}
          />,
        );

        expect(screen.getByRole('region')).toHaveAccessibleName(
          `${controller} controlled leaf`,
        );
      });

      it(`should have a ${controller} Lily Pad if upgraded`, () => {
        render(
          <Zone
            isUpgraded
            flow={flow}
            position={position}
            controller={controller}
            onPlace={NOOP}
          />,
        );

        expect(screen.getByRole('region')).toHaveAccessibleName(/Lily Pad/);
      });

      it('should not have a dropzone', () => {
        render(
          <Zone
            position={position}
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
            position={position}
            flow={flow}
            isUpgraded={false}
            controller={controller}
            onPlace={onPlace}
          />,
        );

        fireEvent.click(screen.getByRole('gridcell'));

        expect(onPlace).not.toHaveBeenCalled();
      });
    },
  );

  describe.for<[Player, isUpgraded: boolean, Position]>([
    [North, false, Position.HOME[North]],
    [North, true, { x: 1, y: 3 }],
    [South, false, Position.HOME[South]],
    [South, true, { x: 0, y: 5 }],
    [North, true, Position.HOME[North]],
    [North, false, { x: 1, y: 2 }],
    [South, true, Position.HOME[South]],
    [South, false, { x: 2, y: 4 }],
  ])(
    'when controlled by %s while opponent is placing a card | upgraded: %s | position: %s',
    ([controller, isUpgraded, position]) => {
      const flow = {
        player: controller === North ? South : North,
        phase: Main,
        subphase: Placing,
      };

      it('should not have a dropzone', () => {
        render(
          <Zone
            position={position}
            flow={flow}
            isUpgraded={isUpgraded}
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
            position={position}
            flow={flow}
            isUpgraded={isUpgraded}
            controller={controller}
            onPlace={onPlace}
          />,
        );

        fireEvent.click(screen.getByRole('region'));

        expect(onPlace).not.toHaveBeenCalled();
      });
    },
  );

  describe.for<[Player, Position]>([
    [North, Position.HOME[North]],
    [North, { x: 0, y: 0 }],
    [South, Position.HOME[South]],
    [South, { x: 2, y: 3 }],
  ])(
    'when controlled by %s while they are placing a card | position: %s',
    ([player, position]) => {
      const flow = {
        player,
        phase: Main,
        subphase: Placing,
      };

      it('should not have a dropzone if upgraded', () => {
        render(
          <Zone
            position={position}
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
            position={position}
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
            position={position}
            flow={flow}
            controller={player}
            isUpgraded={false}
            onPlace={NOOP}
          />,
        );

        expect(
          screen.getByRole('button', {
            name: /Place on/,
          }),
        ).toBeVisible();
        expect(
          screen.getByRole('gridcell', {
            name: `Place on ${player} controlled leaf`,
          }),
        ).toBeVisible();
      });

      it('should call onPlace if unupgraded if the dropzone is clicked', () => {
        const onPlace = vi.fn<() => void>();
        render(
          <Zone
            position={position}
            flow={flow}
            controller={player}
            isUpgraded={false}
            onPlace={onPlace}
          />,
        );

        fireEvent.click(
          screen.getByRole('button', {
            name: /Place on/,
          }),
        );

        expect(onPlace).toHaveBeenCalledOnce();
        expect(onPlace).toHaveBeenCalledWith(position);
      });
    },
  );
});
