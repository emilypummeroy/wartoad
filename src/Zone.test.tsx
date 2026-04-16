import { fireEvent, screen, render } from '@testing-library/react';

import { CardClass } from './card-types';
import { Position } from './Grid';
import { Subphase, Phase, Player } from './PhaseTracker';
import { Zone } from './Zone';

const { Start, Main, End } = Phase;
const { North, South } = Player;
const { Upgrading, Deploying, Idle } = Subphase;

const FLOW = {
  player: North,
  phase: Main,
  subphase: Idle,
};
const NOOP = () => {};

describe(Zone, () => {
  describe.for<[controlledBy: Player, Position, units: number, Player, Phase]>([
    [North, { x: 0, y: 0 }, 0, North, Start],
    [North, { x: 1, y: 1 }, 1, North, Main],
    [North, { x: 2, y: 2 }, 2, North, End],
    [North, { x: 2, y: 3 }, 3, South, Main],
    [North, { x: 0, y: 4 }, 4, South, End],
    [North, { x: 1, y: 5 }, 5, South, Start],
    [South, { x: 1, y: 0 }, 1, South, Main],
    [South, { x: 0, y: 1 }, 3, South, Start],
    [South, { x: 2, y: 2 }, 5, South, End],
    [South, { x: 0, y: 3 }, 0, North, End],
    [South, { x: 1, y: 4 }, 2, North, Main],
    [South, { x: 2, y: 5 }, 4, North, Start],
  ])(
    'when controlled by %s in non-home position %s with %s Froglets while Idle in %s %s phase',
    ([controller, position, unitCount, turnPlayer, phase]) => {
      const units = Array.from({ length: unitCount }, () => CardClass.Froglet);
      const flow = { player: turnPlayer, phase, subphase: Idle };
      it(`should have a ${controller} controlled leaf if unupgraded`, () => {
        render(
          <Zone
            flow={flow}
            position={position}
            controller={controller}
            zone={{ isUpgraded: false, units }}
            onPlace={NOOP}
          />,
        );
        expect(screen.getAllByRole('region')[0]).toHaveAccessibleName(
          `${controller} controlled leaf`,
        );
      });

      it(`should have a ${controller} Lily Pad if upgraded`, () => {
        render(
          <Zone
            flow={flow}
            position={position}
            controller={controller}
            zone={{ isUpgraded: true, units }}
            onPlace={NOOP}
          />,
        );
        expect(screen.getAllByRole('region')[0]).toHaveAccessibleName(
          `${controller} controlled Lily Pad`,
        );
      });

      it(`should have ${unitCount} ${controller} controlled Froglets`, () => {
        render(
          <Zone
            flow={flow}
            position={position}
            controller={controller}
            zone={{ isUpgraded: true, units }}
            onPlace={NOOP}
          />,
        );
        expect(
          screen.queryAllByRole('region', {
            name: `${controller} controlled Froglet`,
          }),
        ).toHaveLength(unitCount);
      });

      it('should not have any dropzone', () => {
        render(
          <Zone
            position={position}
            flow={flow}
            controller={controller}
            zone={{ isUpgraded: false, units }}
            onPlace={NOOP}
          />,
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    },
  );

  it.for<[Player, Position, unitCount: number]>([
    [North, Position.HOME[North], 0],
    [North, Position.HOME[North], 2],
    [South, Position.HOME[South], 0],
    [South, Position.HOME[South], 3],
  ])(
    'should have a %s Home Lily Pad if upgraded in home %s with %s units',
    ([player, position, unitCount]) => {
      const units = Array.from({ length: unitCount }, () => CardClass.Froglet);
      render(
        <Zone
          flow={FLOW}
          position={position}
          controller={player}
          zone={{ isUpgraded: true, units }}
          onPlace={NOOP}
        />,
      );

      expect(screen.getByRole('region', { name: /Home/ })).toHaveAccessibleName(
        `${player} Home Lily Pad`,
      );
    },
  );

  describe.for<[Player, Player, upgraded: boolean, Position, number]>([
    [South, North, true, Position.HOME[North], 0],
    [South, North, true, { x: 1, y: 0 }, 1],
    [South, North, false, { x: 1, y: 2 }, 2],
    [North, South, true, Position.HOME[South], 2],
    [North, South, true, { x: 0, y: 5 }, 0],
    [North, South, false, { x: 2, y: 4 }, 1],
  ])(
    'while %s is upgrading but controlled by %s | upgraded: %s | at %s | %s units',
    ([player, controller, isUpgraded, position, unitCount]) => {
      const units = Array.from({ length: unitCount }, () => CardClass.Froglet);
      const flow = {
        player,
        phase: Main,
        subphase: Upgrading,
      };

      it('should not have a dropzone', () => {
        render(
          <Zone
            position={position}
            flow={flow}
            controller={controller}
            zone={{ isUpgraded, units }}
            onPlace={NOOP}
          />,
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });

      it('should not call onPlace if clicked', () => {
        const onPlace = vi.fn<() => void>();
        render(
          <Zone
            position={position}
            flow={flow}
            controller={controller}
            zone={{ isUpgraded, units }}
            onPlace={onPlace}
          />,
        );
        fireEvent.click(screen.getAllByRole('region')[0]);
        expect(onPlace).not.toHaveBeenCalled();
      });
    },
  );

  describe.for<[Player, Position, unitCount: number]>([
    [North, Position.HOME[North], 0],
    [North, { x: 2, y: 0 }, 1],
    [North, { x: 1, y: 1 }, 2],
    [North, { x: 0, y: 2 }, 3],
    [North, { x: 1, y: 3 }, 4],
    [North, { x: 2, y: 4 }, 5],
    [North, { x: 0, y: 5 }, 6],
    [South, Position.HOME[South], 6],
    [South, { x: 0, y: 0 }, 5],
    [South, { x: 1, y: 1 }, 4],
    [South, { x: 2, y: 2 }, 0],
    [South, { x: 0, y: 3 }, 2],
    [South, { x: 2, y: 4 }, 1],
    [South, { x: 1, y: 5 }, 3],
  ])(
    'when controlled by %s while they are upgrading | position: %s',
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
            zone={{ isUpgraded: true, units }}
            onPlace={NOOP}
          />,
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });

      it('should not call onPlace if upgraded when clicked', () => {
        const onPlace = vi.fn<() => void>();
        render(
          <Zone
            position={position}
            flow={flow}
            controller={player}
            zone={{ isUpgraded: true, units }}
            onPlace={onPlace}
          />,
        );

        fireEvent.click(screen.getAllByRole('region')[0]);
        expect(onPlace).not.toHaveBeenCalled();
      });

      it('should call onPlace if unupgraded if the dropzone is clicked', () => {
        const onPlace = vi.fn<() => void>();
        render(
          <Zone
            position={position}
            flow={flow}
            controller={player}
            zone={{ isUpgraded: false, units }}
            onPlace={onPlace}
          />,
        );
        fireEvent.click(
          screen.getByRole('button', {
            name: `Upgrade ${player} controlled leaf`,
          }),
        );
        expect(onPlace).toHaveBeenCalledOnce();
        expect(onPlace).toHaveBeenCalledWith(position);
      });
    },
  );

  describe.for<[Player, Position, _isUpgraded: boolean, _unitCount: number]>([
    [North, { x: 0, y: 1 }, false, 0],
    [North, { x: 1, y: 1 }, true, 1],
    [North, { x: 2, y: 1 }, false, 2],
    [North, { x: 0, y: 2 }, true, 3],
    [North, { x: 1, y: 2 }, false, 4],
    [North, { x: 2, y: 2 }, false, 5],
    [North, { x: 0, y: 3 }, true, 3],
    [North, { x: 1, y: 3 }, false, 4],
    [North, { x: 2, y: 3 }, true, 4],
    [North, { x: 0, y: 4 }, false, 0],
    [North, { x: 1, y: 4 }, false, 1],
    [North, { x: 2, y: 4 }, true, 2],
    [North, { x: 0, y: 5 }, false, 3],
    [North, { x: 1, y: 5 }, true, 4],
    [North, { x: 2, y: 5 }, false, 5],
    [South, { x: 0, y: 0 }, false, 0],
    [South, { x: 1, y: 0 }, true, 1],
    [South, { x: 2, y: 0 }, false, 2],
    [South, { x: 0, y: 1 }, true, 3],
    [South, { x: 1, y: 1 }, false, 4],
    [South, { x: 2, y: 1 }, false, 5],
    [South, { x: 0, y: 2 }, true, 3],
    [South, { x: 1, y: 2 }, false, 4],
    [South, { x: 2, y: 2 }, true, 4],
    [South, { x: 0, y: 3 }, false, 0],
    [South, { x: 1, y: 3 }, false, 1],
    [South, { x: 2, y: 3 }, true, 2],
    [South, { x: 0, y: 4 }, false, 3],
    [South, { x: 1, y: 4 }, true, 4],
    [South, { x: 2, y: 4 }, false, 5],
  ])(
    "in %s's non-home row position %s while deploying",
    ([player, position, isUpgraded, unitCount]) => {
      const units = Array.from({ length: unitCount }, () => CardClass.Froglet);
      const flow = {
        player,
        phase: Main,
        subphase: Deploying,
      };
      const onPlace = vi.fn<() => void>();
      beforeEach(() =>
        render(
          <Zone
            position={position}
            flow={flow}
            controller={player}
            zone={{ isUpgraded, units }}
            onPlace={onPlace}
          />,
        ),
      );

      it(`should not have a dropzone`, () => {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });

      it('should not call onPlace when clicked', () => {
        fireEvent.click(screen.getAllByRole('region')[0]);
        expect(onPlace).not.toHaveBeenCalled();
      });
    },
  );

  describe.for<[Player, Position, isUpgraded: boolean, number, string, string]>(
    [
      [North, { x: 0, y: 0 }, false, 0, 'controlled', 'leaf'],
      [North, Position.HOME.North, true, 1, 'Home', 'Lily Pad'],
      [North, { x: 2, y: 0 }, true, 2, 'controlled', 'Lily Pad'],
      [South, { x: 0, y: 5 }, true, 2, 'controlled', 'Lily Pad'],
      [South, Position.HOME.South, true, 5, 'Home', 'Lily Pad'],
      [South, { x: 2, y: 5 }, false, 6, 'controlled', 'leaf'],
    ],
  )(
    "in %s's home row position %s while Deploying | isUpgraded: %s | unitCount: %s",
    ([player, position, isUpgraded, unitCount, leafAdjective, leafName]) => {
      const flow = {
        player,
        phase: Main,
        subphase: Deploying,
      };
      const units = Array.from({ length: unitCount }, () => CardClass.Froglet);
      const zone = {
        isUpgraded,
        units,
      };
      const onPlace = vi.fn<() => void>();
      beforeEach(() =>
        render(
          <Zone
            position={position}
            flow={flow}
            controller={player}
            zone={zone}
            onPlace={onPlace}
          />,
        ),
      );

      it('should call onPlace when the dropzone is clicked', () => {
        fireEvent.click(
          screen.getByRole('button', {
            name: `Deploy on ${player} ${leafAdjective} ${leafName}`,
          }),
        );

        expect(onPlace).toHaveBeenCalledOnce();
        expect(onPlace).toHaveBeenCalledWith(position);
      });
    },
  );
});
