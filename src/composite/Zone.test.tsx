import { fireEvent, screen, render } from '@testing-library/react';

import {
  DEFAULT_GAME_DISPATCH,
  DEFAULT_GAME_STATE,
  GameContext,
} from '../context/GameContext';
import { createUnit } from '../state/card';
import { HOME } from '../state/pond';
import { UnitClass } from '../types/card-class';
import { Phase, Player, PLAYER_AFTER, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { Zone } from './Zone';

const { Main } = Phase;
const { North, South } = Player;
const { Upgrading, Deploying } = Subphase;

const NOOP = () => {};

const nFrogletsOwnedBy = (n: number, owner: Player) =>
  Array.from({ length: n }, (_, i) =>
    createUnit({
      cardClass: UnitClass.Froglet,
      key: i,
      owner,
    }),
  );

const nFrogletsOwnedByAlternating = (n: number, firstPlayer: Player) =>
  Array.from({ length: n }, (_, i) =>
    createUnit({
      cardClass: UnitClass.Froglet,
      key: i,
      owner: [firstPlayer, PLAYER_AFTER[firstPlayer]][i % 2],
    }),
  );

describe(Zone, () => {
  describe.for<
    [controlledBy: Player, at: Position, withUnits: number, ownBy: Player]
  >([
    [North, { x: 0, y: 0 }, 0, North],
    [North, { x: 1, y: 1 }, 1, South],
    [North, { x: 2, y: 2 }, 2, North],
    [North, { x: 2, y: 3 }, 3, South],
    [North, { x: 0, y: 4 }, 4, North],
    [North, { x: 1, y: 5 }, 5, South],
    [South, { x: 1, y: 0 }, 1, South],
    [South, { x: 0, y: 1 }, 3, North],
    [South, { x: 2, y: 2 }, 5, South],
    [South, { x: 0, y: 3 }, 0, North],
    [South, { x: 1, y: 4 }, 2, South],
    [South, { x: 2, y: 5 }, 4, North],
  ])(
    'without context when controlled by %s in non-home position %s with %s %s Froglets',
    ([controller, position, unitCount, unitOwner]) => {
      const units = nFrogletsOwnedBy(unitCount, unitOwner);

      it(`should have a ${controller} controlled leaf if unupgraded`, () => {
        render(
          <Zone
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

      it(`should have ${unitCount} ${unitOwner} owned Froglets`, () => {
        render(
          <Zone
            position={position}
            controller={controller}
            zone={{ isUpgraded: true, units }}
            onPlace={NOOP}
          />,
        );
        expect(
          screen.queryAllByRole('region', {
            name: `${unitOwner} unit Froglet`,
          }),
        ).toHaveLength(unitCount);
      });

      it('should not have any dropzone', () => {
        render(
          <Zone
            position={position}
            controller={controller}
            zone={{ isUpgraded: false, units }}
            onPlace={NOOP}
          />,
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    },
  );

  describe.for<[Player, units: number, units: Player]>([
    [North, 0, North],
    [North, 1, South],
    [North, 2, North],
    [South, 0, South],
    [South, 3, North],
    [South, 4, South],
  ])(
    "when upgraded in their %s's home position with %s %s units",
    ([controller, unitCount, unitOwner]) => {
      beforeEach(() => {
        const position = HOME[controller];
        const units = nFrogletsOwnedBy(unitCount, unitOwner);
        render(
          <GameContext value={[DEFAULT_GAME_STATE, DEFAULT_GAME_DISPATCH]}>
            <Zone
              position={position}
              controller={controller}
              zone={{ isUpgraded: true, units }}
              onPlace={NOOP}
            />
            ,
          </GameContext>,
        );
      });

      it(`should have a ${controller} Home Lily Pad`, () => {
        expect(
          screen.getByRole('region', { name: /Home/ }),
        ).toHaveAccessibleName(`${controller} Home Lily Pad`);
      });

      it(`should have ${unitCount} ${unitOwner} Froglets`, () => {
        expect(
          screen.queryAllByRole('region', {
            name: `${unitOwner} unit Froglet`,
          }),
        ).toHaveLength(unitCount);
      });
    },
  );

  describe.for<
    [turn: Player, zone: Player, upgraded: boolean, Position, units: number]
  >([
    [South, North, true, HOME[North], 0],
    [South, North, true, { x: 1, y: 0 }, 1],
    [South, North, false, { x: 1, y: 2 }, 2],
    [North, South, true, HOME[South], 2],
    [North, South, true, { x: 0, y: 5 }, 0],
    [North, South, false, { x: 2, y: 4 }, 1],
  ])(
    'while %s is upgrading but controlled by %s | upgraded: %s | at %s | %s %s units',
    ([player, controller, isUpgraded, position, unitCount]) => {
      const units = nFrogletsOwnedByAlternating(unitCount, player);
      const flow = {
        player,
        phase: Main,
        subphase: Upgrading,
      };
      const context = [
        {
          ...DEFAULT_GAME_STATE,
          flow,
        },
        DEFAULT_GAME_DISPATCH,
      ] as const;
      const onPlace = vi.fn<() => void>();

      beforeEach(() => {
        render(
          <GameContext value={context}>
            <Zone
              position={position}
              controller={controller}
              zone={{ isUpgraded, units }}
              onPlace={onPlace}
            />
            ,
          </GameContext>,
        );
      });

      it('should not have a dropzone', () => {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });

      it('should not call onPlace if clicked', () => {
        fireEvent.click(screen.getAllByRole('region')[0]);
        expect(onPlace).not.toHaveBeenCalled();
      });
    },
  );

  describe.for<[Player, Position, units: number]>([
    [North, HOME[North], 0],
    [North, { x: 2, y: 0 }, 1],
    [North, { x: 1, y: 1 }, 2],
    [North, { x: 0, y: 2 }, 3],
    [North, { x: 1, y: 3 }, 4],
    [North, { x: 2, y: 4 }, 5],
    [North, { x: 0, y: 5 }, 6],
    [South, HOME[South], 6],
    [South, { x: 0, y: 0 }, 5],
    [South, { x: 1, y: 1 }, 4],
    [South, { x: 2, y: 2 }, 0],
    [South, { x: 0, y: 3 }, 2],
    [South, { x: 2, y: 4 }, 1],
    [South, { x: 1, y: 5 }, 3],
  ])(
    'when controlled by %s while they are upgrading | position: %s',
    ([player, position, unitCount]) => {
      const units = nFrogletsOwnedByAlternating(unitCount, player);
      const flow = {
        player,
        phase: Main,
        subphase: Upgrading,
      };
      const context = [
        {
          ...DEFAULT_GAME_STATE,
          flow,
        },
        DEFAULT_GAME_DISPATCH,
      ] as const;

      it('should not have a dropzone if upgraded', () => {
        render(
          <GameContext value={context}>
            <Zone
              position={position}
              controller={player}
              zone={{ isUpgraded: true, units }}
              onPlace={NOOP}
            />
          </GameContext>,
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });

      it('should not call onPlace if upgraded when clicked', () => {
        const onPlace = vi.fn<() => void>();
        render(
          <GameContext value={context}>
            <Zone
              position={position}
              controller={player}
              zone={{ isUpgraded: true, units }}
              onPlace={onPlace}
            />
          </GameContext>,
        );

        fireEvent.click(screen.getAllByRole('region')[0]);
        expect(onPlace).not.toHaveBeenCalled();
      });

      it('should call onPlace if unupgraded if the dropzone is clicked', () => {
        const onPlace = vi.fn<() => void>();
        render(
          <GameContext value={context}>
            <Zone
              position={position}
              controller={player}
              zone={{ isUpgraded: false, units }}
              onPlace={onPlace}
            />
            ,
          </GameContext>,
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

  describe.for<[Player, Position, _isUpgraded: boolean, _units: number]>([
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
      const units = nFrogletsOwnedByAlternating(unitCount, player);
      const onPlace = vi.fn<() => void>();
      const flow = {
        player,
        phase: Main,
        subphase: Deploying,
      };
      const context = [
        {
          ...DEFAULT_GAME_STATE,
          flow,
        },
        DEFAULT_GAME_DISPATCH,
      ] as const;

      beforeEach(() => {
        render(
          <GameContext value={context}>
            <Zone
              position={position}
              controller={player}
              zone={{ isUpgraded, units }}
              onPlace={onPlace}
            />
          </GameContext>,
        );
      });

      it(`should not have a dropzone`, () => {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });

      it('should not call onPlace when clicked', () => {
        fireEvent.click(screen.getAllByRole('region')[0]);
        expect(onPlace).not.toHaveBeenCalled();
      });
    },
  );

  // Use a separate describe block to check accessible names.
  describe.for<
    [Player, Position, isUpgraded: boolean, units: number, string, string]
  >([
    [North, { x: 0, y: 0 }, false, 0, 'controlled', 'leaf'],
    [North, HOME.North, true, 1, 'Home', 'Lily Pad'],
    [North, { x: 2, y: 0 }, true, 2, 'controlled', 'Lily Pad'],
    [South, { x: 0, y: 5 }, true, 2, 'controlled', 'Lily Pad'],
    [South, HOME.South, true, 5, 'Home', 'Lily Pad'],
    [South, { x: 2, y: 5 }, false, 6, 'controlled', 'leaf'],
  ])(
    "in %s's home row position %s while Deploying | isUpgraded: %s | unitCount: %s",
    ([player, position, isUpgraded, unitCount, leafAdjective, leafName]) => {
      const onPlace = vi.fn<() => void>();
      const units = nFrogletsOwnedByAlternating(unitCount, player);
      const flow = {
        player,
        phase: Main,
        subphase: Deploying,
      };
      const context = [
        {
          ...DEFAULT_GAME_STATE,
          flow,
        },
        DEFAULT_GAME_DISPATCH,
      ] as const;

      beforeEach(() => {
        render(
          <GameContext value={context}>
            <Zone
              position={position}
              controller={player}
              zone={{ isUpgraded, units }}
              onPlace={onPlace}
            />
          </GameContext>,
        );
      });

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
