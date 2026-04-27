import { setPondStateAtEach, type LeafState } from '../state-types/pond';
import {
  TestPondKey,
  TestLeafKey,
  TEST_PONDS_BY_KEY,
  TEST_LEAVES_BY_KEY,
} from '../state-types/pond.test-utils';
import {
  createStateWith,
  gameflowOf,
  subphaseStateOf,
} from '../state/test-utils';
import { Phase, Player, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { finishMainPhase } from './finish-main-phase';

const { Idle, Upgrading, Deploying, Activating } = Subphase;
const { North, South } = Player;
const { Start, Main, End } = Phase;

const { INITIAL_POND, ANOTHER_POND } = TestPondKey;
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

type Preconditions = [Player, Phase, Subphase];
type Inputs = [Player, TestPondKey, Position[], TestLeafKey];

describe(finishMainPhase, () => {
  // Preconditions:
  describe.for<Preconditions>([
    // < subphase = Idle
    [North, Main, Upgrading],
    [North, Main, Deploying],
    [North, Main, Activating],
    [South, Main, Upgrading],
    [South, Main, Deploying],
    [South, Main, Activating],

    // < phase = Main
    [North, Start, Idle],
    [North, End, Idle],
    [South, Start, Idle],
    [South, End, Idle],
  ])(
    'Precondition failed: need Main & Idle | %s %s %s',
    ([player, phase, subphase]) => {
      it('should not change state', () => {
        const old = createStateWith({
          ...gameflowOf(player, subphase, phase),
          ...subphaseStateOf(player, subphase),
        });
        expect(finishMainPhase()(old)).toStrictEqual(old);
      });
    },
  );

  // Postconditions:
  describe.for<Inputs>([
    // TODO 22: Should require controlled neighbour to capture
    [North, INITIAL_POND, [{ x: 1, y: 3 }], SOUTH_LEAF],
    [North, INITIAL_POND, [{ x: 0, y: 3 }], SOUTH_LEAF_WITH_UNIT],
    [North, INITIAL_POND, [{ x: 2, y: 4 }], SOUTH_LEAF_WITH_UNITS],
    [North, INITIAL_POND, [{ x: 1, y: 5 }], SOUTH_UPGRADED_UNITS],
    [South, INITIAL_POND, [{ x: 1, y: 2 }], NORTH_LEAF],
    [South, INITIAL_POND, [{ x: 0, y: 2 }], NORTH_LEAF_WITH_UNIT],
    [South, INITIAL_POND, [{ x: 1, y: 0 }], NORTH_UPGRADED_UNITS],
    [South, INITIAL_POND, [{ x: 1, y: 2 }], NORTH_LEAF_WITH_UNITS],
    [North, ANOTHER_POND, [{ x: 2, y: 3 }], SOUTH_LEAF],
    [North, ANOTHER_POND, [{ x: 1, y: 1 }], SOUTH_LEAF_WITH_UNIT],
    [North, ANOTHER_POND, [{ x: 1, y: 5 }], SOUTH_UPGRADED_UNIT],
    [North, ANOTHER_POND, [{ x: 0, y: 4 }], SOUTH_LEAF_WITH_UNITS],
    [North, ANOTHER_POND, [{ x: 0, y: 3 }], SOUTH_LEAF_WITH_UNITS],
    [South, ANOTHER_POND, [{ x: 2, y: 2 }], NORTH_LEAF],
    [South, ANOTHER_POND, [{ x: 1, y: 0 }], NORTH_UPGRADED_UNIT],
    [South, ANOTHER_POND, [{ x: 0, y: 1 }], NORTH_LEAF_WITH_UNITS],
    [South, ANOTHER_POND, [{ x: 1, y: 2 }], NORTH_UPGRADED_UNITS],
    [North, INITIAL_POND, [{ x: 0, y: 2 }], SOUTH_LEAF_OTHER_UNIT],
    [North, ANOTHER_POND, [{ x: 1, y: 2 }], SOUTH_UPGRADED_OTHER_UNIT],
    [North, ANOTHER_POND, [{ x: 2, y: 3 }], SOUTH_UPGRADED_OTHER_UNIT],
    [North, INITIAL_POND, [{ x: 0, y: 2 }], SOUTH_LEAF_OTHER_UNIT],
    [South, INITIAL_POND, [{ x: 1, y: 3 }], NORTH_LEAF_OTHER_UNIT],
    [South, INITIAL_POND, [{ x: 0, y: 3 }], NORTH_LEAF_OTHER_UNIT],
    [South, ANOTHER_POND, [{ x: 1, y: 2 }], NORTH_UPGRADED_OTHER_UNIT],
    [South, ANOTHER_POND, [{ x: 2, y: 3 }], NORTH_LEAF_OTHER_UNIT],
  ])(
    'Postconditions | %s %s | %s %s',
    ([player, pondKey, positions, leafKey]) => {
      const pond = TEST_PONDS_BY_KEY[pondKey];
      const leaf = TEST_LEAVES_BY_KEY[leafKey];
      const updates: [Position, LeafState][] = positions.map(xy => [xy, leaf]);

      const before = createStateWith({
        ...gameflowOf(player, Idle, Main),
        pond: setPondStateAtEach(pond, ...updates),
      });

      // > phase = End
      it('should go to the End phase', () => {
        const after = finishMainPhase()(before);
        expect(after.flow.phase).toBe(End);
      });

      it('should not change the rest of gameflow state', () => {
        const { phase: _, ...got } = finishMainPhase()(before).flow;
        const { phase: __, ...want } = before.flow;
        expect(got).toStrictEqual(want);
      });

      // > Non-flow state unchanged
      it('should not change the rest of the state besides gameflow', () => {
        const { flow: _, ...got } = finishMainPhase()(before);
        const { flow: __, ...want } = before;
        expect(got).toStrictEqual(want);
      });
    },
  );
});
