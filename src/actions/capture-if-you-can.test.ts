import {
  getPondStateAt,
  setPondStateAt,
  setPondStateAtEach,
  type LeafState,
} from '../state-types/pond';
import {
  TestPondKey,
  TestLeafKey,
  TEST_PONDS_BY_KEY,
  TEST_LEAVES_BY_KEY,
} from '../state-types/pond.test-utils';
import { createStateWith, gameflowOf } from '../state/test-utils';
import { Phase, Player, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { captureIfYouCan } from './capture-if-you-can';

const { Idle } = Subphase;
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

type Preconditions = [Player, Phase, TestPondKey, Position, TestLeafKey];
type Inputs = [Player, TestPondKey, Position, TestLeafKey, Position?];

describe(captureIfYouCan, () => {
  const it_should_not_change_state = ([
    player,
    phase,
    pondKey,
    position,
    leafKey,
  ]: Preconditions) => {
    const pond = TEST_PONDS_BY_KEY[pondKey];
    const leaf = TEST_LEAVES_BY_KEY[leafKey];
    it('should not change state', () => {
      const old = createStateWith({
        ...gameflowOf(player, Idle, phase),
        pond: setPondStateAt(pond, position, leaf),
      });
      expect(captureIfYouCan()(old)).toStrictEqual(old);
    });
  };

  // Preconditions:
  // < need phase = End
  describe.for<Preconditions>([
    [North, Start, INITIAL_POND, { x: 1, y: 2 }, SOUTH_LEAF_OTHER_UNIT],
    [North, Main, INITIAL_POND, { x: 2, y: 3 }, SOUTH_LEAF_OTHER_UNIT],
    [South, Start, INITIAL_POND, { x: 2, y: 3 }, NORTH_LEAF_OTHER_UNIT],
    [South, Main, INITIAL_POND, { x: 1, y: 2 }, NORTH_LEAF_OTHER_UNIT],
  ])(
    'Precondition failed: need End phase | %s %s | %s with %s set to %s',
    inputs => it_should_not_change_state(inputs),
  );

  // Preconditions:
  // < need Can capture
  describe.for<Preconditions>([
    [North, End, INITIAL_POND, { x: 1, y: 3 }, SOUTH_LEAF],
    [North, End, INITIAL_POND, { x: 0, y: 3 }, SOUTH_LEAF_WITH_UNIT],
    [North, End, INITIAL_POND, { x: 2, y: 4 }, SOUTH_LEAF_WITH_UNITS],
    [North, End, INITIAL_POND, { x: 2, y: 2 }, NORTH_LEAF_OTHER_UNIT],
    [North, End, INITIAL_POND, { x: 1, y: 5 }, SOUTH_UPGRADED_UNITS],
    [North, End, INITIAL_POND, { x: 2, y: 2 }, NORTH_LEAF_OTHER_UNIT],
    [South, End, INITIAL_POND, { x: 1, y: 2 }, NORTH_LEAF],
    [South, End, INITIAL_POND, { x: 0, y: 2 }, NORTH_LEAF_WITH_UNIT],
    [South, End, INITIAL_POND, { x: 1, y: 0 }, NORTH_UPGRADED_UNITS],
    [South, End, INITIAL_POND, { x: 1, y: 2 }, NORTH_LEAF_WITH_UNITS],
    [South, End, INITIAL_POND, { x: 2, y: 3 }, SOUTH_LEAF_OTHER_UNIT],
    [North, End, ANOTHER_POND, { x: 2, y: 3 }, SOUTH_LEAF],
    [North, End, ANOTHER_POND, { x: 1, y: 1 }, SOUTH_LEAF_WITH_UNIT],
    [North, End, ANOTHER_POND, { x: 1, y: 5 }, SOUTH_UPGRADED_UNIT],
    [North, End, ANOTHER_POND, { x: 0, y: 4 }, SOUTH_LEAF_WITH_UNITS],
    [North, End, ANOTHER_POND, { x: 0, y: 3 }, SOUTH_LEAF_WITH_UNITS],
    [North, End, ANOTHER_POND, { x: 0, y: 2 }, NORTH_UPGRADED_OTHER_UNIT],
    [South, End, ANOTHER_POND, { x: 2, y: 2 }, NORTH_LEAF],
    [South, End, ANOTHER_POND, { x: 1, y: 0 }, NORTH_UPGRADED_UNIT],
    [South, End, ANOTHER_POND, { x: 0, y: 1 }, NORTH_LEAF_WITH_UNITS],
    [South, End, ANOTHER_POND, { x: 1, y: 2 }, NORTH_UPGRADED_UNITS],
    [South, End, ANOTHER_POND, { x: 0, y: 3 }, SOUTH_UPGRADED_OTHER_UNIT],
  ])(
    'Precondition failed: cannot capture | %s %s | %s with %s set to %s',
    inputs => it_should_not_change_state(inputs),
  );

  // Postconditions: Can capture
  // > p <- position . can capture -> capture(p, player)
  // TODO 15: Opponent should capture first.
  // Capturing requires exclusive occupation of a leaf controlled by the opponent of the turn player.
  // Exclusive occupation means that only units of the turn player may be on the leaf.
  describe.for<Inputs>([
    [North, INITIAL_POND, { x: 0, y: 2 }, SOUTH_LEAF_OTHER_UNIT],
    [North, ANOTHER_POND, { x: 1, y: 2 }, SOUTH_UPGRADED_OTHER_UNIT],
    [North, ANOTHER_POND, { x: 2, y: 3 }, SOUTH_UPGRADED_OTHER_UNIT],
    [North, INITIAL_POND, { x: 0, y: 2 }, SOUTH_LEAF_OTHER_UNIT],
    [South, INITIAL_POND, { x: 1, y: 3 }, NORTH_LEAF_OTHER_UNIT],
    [South, INITIAL_POND, { x: 0, y: 3 }, NORTH_LEAF_OTHER_UNIT],
    [South, ANOTHER_POND, { x: 1, y: 2 }, NORTH_UPGRADED_OTHER_UNIT],
    [South, ANOTHER_POND, { x: 2, y: 3 }, NORTH_LEAF_OTHER_UNIT],
  ])(
    'Postconditions | %s turn | %s with %s set to %s',
    ([player, pondKey, xy1, leafKey, xy2]) => {
      const pond = TEST_PONDS_BY_KEY[pondKey];
      const leaf = TEST_LEAVES_BY_KEY[leafKey];
      const positions = xy2 ? [xy1, xy2] : [xy1];
      const updates: [Position, LeafState][] = positions.map(xy => [xy, leaf]);

      const before = createStateWith({
        ...gameflowOf(player, Idle, End),
        pond: setPondStateAtEach(pond, ...updates),
      });

      // > Non-pond state unchanged
      it('should not change the rest of the state besides the pond', () => {
        const { pond: _, ...got } = captureIfYouCan()(before);
        const { pond: __, ...want } = before;
        expect(got).toStrictEqual(want);
      });

      // > p <- position . can capture -> capture(p, player)
      it.for(positions)('should capture position %s', xy => {
        const after = captureIfYouCan()(before);
        const want = { ...leaf, controller: player };
        const got = getPondStateAt(after.pond, xy);
        expect(got).toStrictEqual(want);
      });
    },
  );
});
