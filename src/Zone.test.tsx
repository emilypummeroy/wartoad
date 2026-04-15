import { fireEvent, screen, render } from '@testing-library/react';

import { CardClass } from './card-types';
import { Position, ROW_COUNT } from './Grid';
import { Subphase, Phase, Player } from './PhaseTracker';
import { Zone } from './Zone';

const { Start, Main, End } = Phase;
const { North, South } = Player;
const { Upgrading, Idle } = Subphase;

const MIDDLE = 1;

const NOOP = () => {};

const FLOW = {
  player: North,
  phase: Main,
  subphase: Idle,
};

// TODO 8: Add Dropzone tests for the Deploying Subphase

describe(Zone, () => {
  describe.for<[Player, Position, unitCount: number]>([
    [North, { x: 0, y: 0 }, 0],
    [North, { x: 1, y: 1 }, 0],
    [North, { x: 2, y: 2 }, 0],
    [North, { x: 2, y: 3 }, 0],
    [North, { x: 0, y: 4 }, 0],
    [North, { x: 1, y: 5 }, 0],
    [South, { x: 1, y: 0 }, 0],
    [South, { x: 0, y: 1 }, 0],
    [South, { x: 2, y: 2 }, 0],
    [South, { x: 0, y: 3 }, 0],
    [South, { x: 1, y: 4 }, 0],
    [South, { x: 2, y: 5 }, 0],
    // TODO 8: Add different unit combinations
  ])(
    'when controlled by %s in non-home position',
    ([player, position, unitCount]) => {
      const units = Array.from({ length: unitCount }, () => CardClass.Froglet);
      it(`should have a ${player} Lily Pad if upgraded`, () => {
        render(
          <Zone
            isUpgraded
            flow={FLOW}
            position={position}
            controller={player}
            units={units}
            onPlace={NOOP}
          />,
        );
        expect(screen.getByRole('region')).toHaveAccessibleName(
          `${player} owned Lily Pad`,
        );
      });

      it(`should have a ${player} Lily Pad if upgraded`, () => {
        render(
          <Zone
            isUpgraded
            flow={FLOW}
            position={position}
            controller={player}
            units={units}
            onPlace={NOOP}
          />,
        );
        expect(screen.getByRole('region')).toHaveAccessibleName(
          `${player} owned Lily Pad`,
        );
      });
    },
  );

  it.for<[Player, Position, unitCount: number]>([
    [North, Position.HOME[North], 0],
    [North, Position.HOME[North], 0],
    [South, Position.HOME[South], 0],
    [South, Position.HOME[South], 0],
    // TODO 8: Add different unit combinations
  ])(
    'should have a %s Home Lily Pad if upgraded in home %s with %s units',
    ([player, position, unitCount]) => {
      const units = Array.from({ length: unitCount }, () => CardClass.Froglet);
      render(
        <Zone
          isUpgraded
          flow={FLOW}
          position={position}
          controller={player}
          units={units}
          onPlace={NOOP}
        />,
      );

      expect(screen.getByRole('region')).toHaveAccessibleName(
        `${player} Home Lily Pad`,
      );
    },
  );

  describe.for<
    [controller: Player, turnPlayer: Player, Phase, Position, unitCount: number]
  >([
    // 2*2*3 -- Position and unit count are incidental
    [North, North, Start, { x: MIDDLE, y: 0 }, 0],
    [South, North, Main, { x: MIDDLE, y: ROW_COUNT - 1 }, 0],
    [North, North, End, { x: MIDDLE, y: 0 }, 0],
    [South, North, Start, { x: 0, y: 0 }, 0],
    [North, North, Main, { x: 2, y: 5 }, 0],
    [South, North, End, { x: 0, y: 1 }, 0],
    [South, South, Start, { x: MIDDLE, y: ROW_COUNT - 1 }, 0],
    [North, South, Main, { x: MIDDLE, y: 0 }, 0],
    [South, South, End, { x: MIDDLE, y: ROW_COUNT - 1 }, 0],
    [North, South, Start, { x: 2, y: 4 }, 0],
    [South, South, Main, { x: 0, y: 2 }, 0],
    [North, South, End, { x: 2, y: 3 }, 0],
    // TODO 8: Add different unit combinations
  ])(
    'basic cases :: controlled by %s | %s %s phase | %s | %s units | while idle',
    ([controller, turnPlayer, phase, position, unitCount]) => {
      const units = Array.from({ length: unitCount }, () => CardClass.Froglet);
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
            units={units}
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
            units={units}
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
            units={units}
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
            units={units}
            onPlace={onPlace}
          />,
        );

        fireEvent.click(screen.getByRole('gridcell'));

        expect(onPlace).not.toHaveBeenCalled();
      });
    },
  );

  describe.for<[Player, isUpgraded: boolean, Position, unitCount: number]>([
    [North, false, Position.HOME[North], 0],
    [North, true, { x: 1, y: 3 }, 0],
    [South, false, Position.HOME[South], 0],
    [South, true, { x: 0, y: 5 }, 0],
    [North, true, Position.HOME[North], 0],
    [North, false, { x: 1, y: 2 }, 0],
    [South, true, Position.HOME[South], 0],
    [South, false, { x: 2, y: 4 }, 0],
  ])(
    'when controlled by %s while opponent is placing a card | upgraded: %s | at %s | %s units',
    ([controller, isUpgraded, position, unitCount]) => {
      const units = Array.from({ length: unitCount }, () => CardClass.Froglet);
      const flow = {
        player: controller === North ? South : North,
        phase: Main,
        subphase: Upgrading,
      };

      it('should not have a dropzone', () => {
        render(
          <Zone
            position={position}
            flow={flow}
            isUpgraded={isUpgraded}
            controller={controller}
            units={units}
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
            units={units}
            onPlace={onPlace}
          />,
        );
        fireEvent.click(screen.getByRole('region'));
        expect(onPlace).not.toHaveBeenCalled();
      });
    },
  );

  describe.for<[Player, Position, unitCount: number]>([
    [North, Position.HOME[North], 0],
    [North, { x: 0, y: 0 }, 0],
    [South, Position.HOME[South], 0],
    [South, { x: 2, y: 3 }, 0],
  ])(
    'when controlled by %s while they are placing a card | position: %s',
    ([player, position, unitCount]) => {
      const units = Array.from({ length: unitCount }, () => CardClass.Froglet);
      const flow = {
        player,
        phase: Main,
        subphase: Upgrading,
      };

      it('should not have a dropzone if upgraded', () => {
        render(
          <Zone
            position={position}
            flow={flow}
            controller={player}
            units={units}
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
            units={units}
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
            units={units}
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
            units={units}
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
