import {
  getPondStateAt,
  setAllUnits,
  setPondStateAtEach,
  setUnitsAt,
  type PondLeafState,
} from '../state-types/pond';
import {
  TestPondKey,
  TestLeafKey,
  TEST_PONDS_BY_KEY,
  TEST_LEAVES_BY_KEY,
} from '../state-types/pond.test-utils';
import {
  createStateWith,
  gameflowOf,
  phaseStateOf,
  winningPondOf,
} from '../state/test-utils';
import { Phase, Player } from '../types/gameflow';
import type { Position } from '../types/position';
import { ALL_POSITIONS } from '../types/position.test-utils';
import { partial } from '../types/test-utils';
import { finishMainPhase } from './finish-main-phase';

const { North, South } = Player;
const { Upgrading, Deploying, Activating, Start, Main, End, GameOver } = Phase;

const { INITIAL_POND, ANOTHER_POND, UNITS_POND } = TestPondKey;
const {
  NORTH_LEAF,
  NORTH_LEAF_OTHER_UNIT,
  NORTH_LEAF_WITH_UNIT,
  NORTH_LEAF_WITH_UNITS,
  NORTH_UPGRADED_UNITS,
  NORTH_UPGRADED_UNIT,
  NORTH_UPGRADED_OTHER_UNIT,
  SOUTH_LEAF,
  SOUTH_LEAF_OTHER_UNIT,
  SOUTH_LEAF_WITH_UNIT,
  SOUTH_LEAF_WITH_UNITS,
  SOUTH_UPGRADED_UNITS,
  SOUTH_UPGRADED_UNIT,
  SOUTH_UPGRADED_OTHER_UNIT,
} = TestLeafKey;

type Preconditions = [Player, Phase, winner?: Player];
type Inputs = [Player, TestPondKey, Position[], TestLeafKey];

describe(finishMainPhase, () => {
  // Preconditions:
  describe.for<Preconditions>([
    // < phase = Main Idle
    [North, Start],
    [North, End],
    [North, Upgrading],
    [North, Deploying],
    [North, Activating],
    [North, GameOver, North],
    [North, GameOver, South],
    [South, Start],
    [South, End],
    [South, Upgrading],
    [South, Deploying],
    [South, Activating],
    [North, GameOver, North],
    [North, GameOver, South],
  ])(
    'Precondition failed: need Main phase Idle | %s %s | winner %s',
    ([player, phase, winner]) => {
      it('should not change state', () => {
        const before = createStateWith({
          ...gameflowOf(player, phase),
          ...phaseStateOf(player, phase),
          ...winningPondOf(winner),
        });
        expect(finishMainPhase()(before)).toStrictEqual(before);
      });
    },
  );

  // Postconditions:
  describe.for<Inputs>([
    // TODO 22: Should require controlled neighbour to capture
    [North, INITIAL_POND, [{ x: 1, y: 3 }], SOUTH_LEAF],
    [North, UNITS_POND, [{ x: 0, y: 3 }], SOUTH_LEAF_WITH_UNIT],
    [North, INITIAL_POND, [{ x: 2, y: 4 }], SOUTH_LEAF_WITH_UNITS],
    [North, UNITS_POND, [{ x: 1, y: 5 }], SOUTH_UPGRADED_UNITS],
    [South, INITIAL_POND, [{ x: 1, y: 2 }], NORTH_LEAF],
    [South, UNITS_POND, [{ x: 0, y: 2 }], NORTH_LEAF_WITH_UNIT],
    [South, INITIAL_POND, [{ x: 1, y: 0 }], NORTH_UPGRADED_UNITS],
    [South, UNITS_POND, [{ x: 1, y: 2 }], NORTH_LEAF_WITH_UNITS],
    [North, ANOTHER_POND, [{ x: 2, y: 3 }], SOUTH_LEAF],
    [North, UNITS_POND, [{ x: 1, y: 1 }], SOUTH_LEAF_WITH_UNIT],
    [North, ANOTHER_POND, [{ x: 1, y: 5 }], SOUTH_UPGRADED_UNIT],
    [North, UNITS_POND, [{ x: 0, y: 4 }], SOUTH_LEAF_WITH_UNITS],
    [North, ANOTHER_POND, [{ x: 0, y: 3 }], SOUTH_LEAF_WITH_UNITS],
    [South, UNITS_POND, [{ x: 2, y: 2 }], NORTH_LEAF],
    [South, ANOTHER_POND, [{ x: 1, y: 0 }], NORTH_UPGRADED_UNIT],
    [South, UNITS_POND, [{ x: 0, y: 1 }], NORTH_LEAF_WITH_UNITS],
    [South, ANOTHER_POND, [{ x: 1, y: 2 }], NORTH_UPGRADED_UNITS],
    [North, UNITS_POND, [{ x: 0, y: 2 }], SOUTH_LEAF_OTHER_UNIT],
    [North, ANOTHER_POND, [{ x: 1, y: 2 }], SOUTH_UPGRADED_OTHER_UNIT],
    [North, UNITS_POND, [{ x: 2, y: 3 }], SOUTH_UPGRADED_OTHER_UNIT],
    [North, INITIAL_POND, [{ x: 0, y: 2 }], SOUTH_LEAF_OTHER_UNIT],
    [South, UNITS_POND, [{ x: 1, y: 3 }], NORTH_LEAF_OTHER_UNIT],
    [South, INITIAL_POND, [{ x: 0, y: 3 }], NORTH_LEAF_OTHER_UNIT],
    [South, UNITS_POND, [{ x: 1, y: 2 }], NORTH_UPGRADED_OTHER_UNIT],
    [South, ANOTHER_POND, [{ x: 2, y: 3 }], NORTH_LEAF_OTHER_UNIT],
  ])(
    'Postconditions | %s %s | %s %s',
    ([player, pondKey, positions, leafKey]) => {
      const basePond = TEST_PONDS_BY_KEY[pondKey];
      const leaf = TEST_LEAVES_BY_KEY[leafKey];
      const updates: [Position, PondLeafState][] = positions.map(xy => [
        xy,
        leaf,
      ]);
      const pond = setPondStateAtEach(basePond, ...updates);

      const before = createStateWith({
        ...gameflowOf(player, Main),
        pond,
      });

      // > phase = End
      it('should go to the End phase', () => {
        const after = finishMainPhase()(before);
        expect(after.flow.phase).toBe(End);
      });

      it('should not change the rest of gameflow state', () => {
        const { ...got } = partial(finishMainPhase()(before).flow);
        const { ...want } = partial(before.flow);
        delete got.phase;
        delete want.phase;
        expect(got).toStrictEqual(want);
      });

      // > units unexhausted
      it('should make every unit unexhausted', () => {
        // Check for the test pond
        for (const xy of ALL_POSITIONS) {
          const after = finishMainPhase()(before);
          for (const unit of getPondStateAt(after.pond, xy).units)
            expect(unit.isExhausted).toBe(false);
        }

        // Check for the test pond with one position's units exhausted
        for (const xy of ALL_POSITIONS) {
          const exhausted = {
            ...before,
            pond: setUnitsAt(pond, xy, u => ({
              ...u,
              isExhausted: true,
            })),
          };
          const after = finishMainPhase()(exhausted);
          for (const unit of getPondStateAt(after.pond, xy).units)
            expect(unit.isExhausted).toBe(false);
        }

        // Check for the test pond with all units exhausted
        for (const xy of ALL_POSITIONS) {
          const exhausted = {
            ...before,
            pond: setAllUnits(pond, u => ({
              ...u,
              isExhausted: true,
            })),
          };
          const after = finishMainPhase()(exhausted);
          for (const unit of getPondStateAt(after.pond, xy).units)
            expect(unit.isExhausted).toBe(false);
        }
      });

      it('should not change the rest of each leaf', () => {
        const after = finishMainPhase()(before);
        for (const xy of ALL_POSITIONS) {
          const { ...got } = partial(getPondStateAt(after.pond, xy));
          const { ...want } = partial(getPondStateAt(before.pond, xy));
          delete got.units;
          delete want.units;
          expect(got).toStrictEqual(want);
        }
      });

      it('should not change the rest of each unit', () => {
        const after = finishMainPhase()(before);
        for (const xy of ALL_POSITIONS) {
          const gots = getPondStateAt(after.pond, xy).units;
          const wants = getPondStateAt(before.pond, xy).units;
          expect(gots).toHaveLength(wants.length);
          for (let i = 0; i < gots.length; i += 1) {
            const { ...got } = partial(gots[i]);
            const { ...want } = partial(wants[i]);
            delete got.isExhausted;
            delete want.isExhausted;
            expect(got).toStrictEqual(want);
          }
        }
      });

      // > Rest of state unchanged
      it('should not change the rest of the state', () => {
        const { ...got } = partial(finishMainPhase()(before));
        const { ...want } = partial(before);
        delete got.flow;
        delete want.flow;
        expect(got).toStrictEqual(want);
      });
    },
  );
});
