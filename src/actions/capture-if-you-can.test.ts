import {
  getPondStateAt,
  setPondStateAt,
  setPondStateAtEach,
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
import { partial } from '../types/test-utils';
import { captureIfYouCan } from './capture-if-you-can';

const { North, South } = Player;
const { Activating, Deploying, Upgrading, Start, Main, End, GameOver } = Phase;

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

type Preconditions = [
  capturer: Player,
  turn: Player,
  Phase,
  TestPondKey,
  Position,
  TestLeafKey,
  winner?: Player,
];
type Inputs = [
  capturer: Player,
  turn: Player,
  TestPondKey,
  Position,
  TestLeafKey,
  Position?,
];

describe(captureIfYouCan, () => {
  const it_should_not_change_state = ([
    capturer,
    player,
    phase,
    pondKey,
    position,
    leafKey,
    winner,
  ]: Preconditions) => {
    const pond = TEST_PONDS_BY_KEY[pondKey];
    const leaf = TEST_LEAVES_BY_KEY[leafKey];
    it('should not change state', () => {
      const old = createStateWith({
        ...gameflowOf(player, phase),
        ...phaseStateOf(player, phase),
        ...winningPondOf(winner, setPondStateAt(pond, position, leaf)),
      });
      expect(captureIfYouCan(capturer)(old)).toStrictEqual(old);
    });
  };

  // Preconditions:
  // < need phase = End
  describe.for<Preconditions>([
    [North, North, Start, INITIAL_POND, { x: 2, y: 5 }, SOUTH_LEAF_OTHER_UNIT],
    [South, North, Main, INITIAL_POND, { x: 1, y: 2 }, NORTH_LEAF_OTHER_UNIT],
    [
      North,
      North,
      GameOver,
      INITIAL_POND,
      { x: 0, y: 4 },
      SOUTH_LEAF_OTHER_UNIT,
      North,
    ],
    [
      South,
      North,
      Upgrading,
      INITIAL_POND,
      { x: 2, y: 1 },
      NORTH_LEAF_OTHER_UNIT,
    ],
    [
      North,
      North,
      Deploying,
      INITIAL_POND,
      { x: 1, y: 3 },
      SOUTH_LEAF_OTHER_UNIT,
    ],
    [
      South,
      North,
      Activating,
      INITIAL_POND,
      { x: 0, y: 0 },
      NORTH_LEAF_OTHER_UNIT,
    ],
    [North, South, Start, INITIAL_POND, { x: 2, y: 5 }, SOUTH_LEAF_OTHER_UNIT],
    [South, South, Main, INITIAL_POND, { x: 1, y: 2 }, NORTH_LEAF_OTHER_UNIT],
    [
      North,
      South,
      GameOver,
      INITIAL_POND,
      { x: 0, y: 4 },
      SOUTH_LEAF_OTHER_UNIT,
      South,
    ],
    [
      South,
      South,
      Upgrading,
      INITIAL_POND,
      { x: 2, y: 1 },
      NORTH_LEAF_OTHER_UNIT,
    ],
    [
      North,
      South,
      Deploying,
      INITIAL_POND,
      { x: 1, y: 3 },
      SOUTH_LEAF_OTHER_UNIT,
    ],
    [
      South,
      South,
      Activating,
      INITIAL_POND,
      { x: 0, y: 0 },
      NORTH_LEAF_OTHER_UNIT,
    ],
  ])(
    'Precondition failed: need End phase |  %s capturing in%s %s | %s with %s set to %s',
    inputs => it_should_not_change_state(inputs),
  );

  // Preconditions:
  // < need Can capture
  describe.for<Preconditions>([
    [North, South, End, INITIAL_POND, { x: 1, y: 3 }, SOUTH_LEAF],
    [North, South, End, INITIAL_POND, { x: 0, y: 3 }, SOUTH_LEAF_WITH_UNIT],
    [North, South, End, INITIAL_POND, { x: 2, y: 4 }, SOUTH_LEAF_WITH_UNITS],
    [North, North, End, INITIAL_POND, { x: 2, y: 2 }, NORTH_LEAF_OTHER_UNIT],
    [North, North, End, INITIAL_POND, { x: 1, y: 5 }, SOUTH_UPGRADED_UNITS],
    [North, North, End, INITIAL_POND, { x: 2, y: 2 }, NORTH_LEAF_OTHER_UNIT],
    [South, South, End, INITIAL_POND, { x: 1, y: 2 }, NORTH_LEAF],
    [South, South, End, INITIAL_POND, { x: 0, y: 2 }, NORTH_LEAF_WITH_UNIT],
    [South, South, End, INITIAL_POND, { x: 1, y: 0 }, NORTH_UPGRADED_UNITS],
    [South, North, End, INITIAL_POND, { x: 1, y: 2 }, NORTH_LEAF_WITH_UNITS],
    [South, North, End, INITIAL_POND, { x: 2, y: 3 }, SOUTH_LEAF_OTHER_UNIT],
    [North, South, End, ANOTHER_POND, { x: 2, y: 3 }, SOUTH_LEAF],
    [North, South, End, ANOTHER_POND, { x: 1, y: 1 }, SOUTH_LEAF_WITH_UNIT],
    [North, South, End, ANOTHER_POND, { x: 1, y: 5 }, SOUTH_UPGRADED_UNIT],
    [North, North, End, ANOTHER_POND, { x: 0, y: 4 }, SOUTH_LEAF_WITH_UNITS],
    [North, North, End, ANOTHER_POND, { x: 0, y: 3 }, SOUTH_LEAF_WITH_UNITS],
    [
      North,
      North,
      End,
      ANOTHER_POND,
      { x: 0, y: 2 },
      NORTH_UPGRADED_OTHER_UNIT,
    ],
    [South, South, End, ANOTHER_POND, { x: 2, y: 2 }, NORTH_LEAF],
    [South, South, End, ANOTHER_POND, { x: 1, y: 0 }, NORTH_UPGRADED_UNIT],
    [South, South, End, ANOTHER_POND, { x: 0, y: 1 }, NORTH_LEAF_WITH_UNITS],
    [South, North, End, ANOTHER_POND, { x: 1, y: 2 }, NORTH_UPGRADED_UNITS],
    [
      South,
      North,
      End,
      ANOTHER_POND,
      { x: 0, y: 3 },
      SOUTH_UPGRADED_OTHER_UNIT,
    ],
  ])(
    'Precondition failed: cannot capture | %s capturing in %s %s | %s with %s set to %s',
    inputs => it_should_not_change_state(inputs),
  );

  // Postconditions: Can capture
  // > p <- position . can capture -> capture(p, player)
  // Capturing requires exclusive occupation of a leaf controlled by the opponent of the turn player.
  // Exclusive occupation means that only units of the turn player may be on the leaf.
  describe.for<Inputs>([
    [North, North, INITIAL_POND, { x: 0, y: 2 }, SOUTH_LEAF_OTHER_UNIT],
    [North, South, ANOTHER_POND, { x: 1, y: 2 }, SOUTH_UPGRADED_OTHER_UNIT],
    [North, North, ANOTHER_POND, { x: 2, y: 3 }, SOUTH_UPGRADED_OTHER_UNIT],
    [North, South, INITIAL_POND, { x: 0, y: 2 }, SOUTH_LEAF_OTHER_UNIT],
    [South, North, INITIAL_POND, { x: 1, y: 3 }, NORTH_LEAF_OTHER_UNIT],
    [South, South, INITIAL_POND, { x: 0, y: 3 }, NORTH_LEAF_OTHER_UNIT],
    [South, North, ANOTHER_POND, { x: 1, y: 2 }, NORTH_UPGRADED_OTHER_UNIT],
    [South, South, ANOTHER_POND, { x: 2, y: 3 }, NORTH_LEAF_OTHER_UNIT],
  ])(
    'Postconditions | %s capturing on %s turn | %s with %s set to %s',
    ([capturer, player, pondKey, xy1, leafKey, xy2]) => {
      const pond = TEST_PONDS_BY_KEY[pondKey];
      const leaf = TEST_LEAVES_BY_KEY[leafKey];
      const positions = xy2 ? [xy1, xy2] : [xy1];
      const updates: [Position, PondLeafState][] = positions.map(xy => [
        xy,
        leaf,
      ]);

      const before = createStateWith({
        ...gameflowOf(player, End),
        pond: setPondStateAtEach(pond, ...updates),
      });

      // > Non-pond state unchanged
      it('should not change the rest of the state besides the pond', () => {
        const { pond: _, ...got } = captureIfYouCan(capturer)(before);
        const { pond: __, ...want } = before;
        expect(got).toStrictEqual(want);
      });

      // > p <- position . can capture p -> capture(p, player)
      it.for(positions)('should capture position %s', xy => {
        const after = captureIfYouCan(capturer)(before);
        const got = getPondStateAt(after.pond, xy);
        expect(got.controller).toBe(capturer);
      });

      it.for(positions)('should unupgrade position %s', xy => {
        const after = captureIfYouCan(capturer)(before);
        const got = getPondStateAt(after.pond, xy);
        expect(got.isUpgraded).toBe(false);
      });

      // > p <- position . can capture p -> p.isUpgraded = false
      it.for(positions)(
        'should not change the rest of the leaf at position %s',
        xy => {
          const after = captureIfYouCan(capturer)(before);
          const { ...want } = partial(getPondStateAt(after.pond, xy));
          const { ...got } = partial(getPondStateAt(after.pond, xy));
          delete want.isUpgraded;
          delete want.controller;
          delete got.isUpgraded;
          delete got.controller;
          expect(got).toStrictEqual(want);
        },
      );
    },
  );
});
