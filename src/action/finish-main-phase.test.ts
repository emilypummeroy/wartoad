import type { GameState } from '../state-types';
import {
  getPondStateAt,
  setPondStateAtEach,
  type LeafState,
} from '../state-types/pond';
import {
  TestPondKey,
  TestLeavesKey,
  TEST_PONDS_BY_KEY,
  TEST_LEAVES_BY_KEY,
} from '../state-types/pond.test-utils';
import {
  activationOf,
  createStateWith,
  gameflowOf,
  pickedCardOf,
} from '../state/test-utils';
import { CardClass, CardKey } from '../types/card';
import { Phase, Player, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { finishMainPhase } from './finish-main-phase';

const { Idle, Upgrading, Deploying, Activating } = Subphase;
const { North, South } = Player;
const { Froglet, LilyPad } = CardKey;
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
} = TestLeavesKey;

type Preconditions = [Player, Phase, Subphase];
type Inputs = [Player, TestPondKey, Position[], TestLeavesKey];

describe(finishMainPhase, () => {
  // Preconditions:
  describe.for<[...Preconditions, CardKey?, Position?]>([
    // < subphase = Idle
    [North, Main, Upgrading, Froglet],
    [North, Main, Deploying, LilyPad],
    [North, Main, Activating, undefined, { x: 0, y: 4 }],
    [South, Main, Upgrading, Froglet],
    [South, Main, Deploying, LilyPad],
    [South, Main, Activating, undefined, { x: 1, y: 1 }],

    // < phase = Main
    [North, Start, Idle],
    [North, End, Idle],
    [South, Start, Idle],
    [South, End, Idle],
  ])(
    'Precondition failed: need Main & Idle | %s %s %s',
    ([player, phase, subphase, cardKey, position]) => {
      const cardClass = cardKey && CardClass[cardKey];
      it('should not change state', () => {
        const old = createStateWith({
          ...gameflowOf(player, subphase, phase),
          ...(subphase === Activating
            ? activationOf(position)
            : pickedCardOf(cardClass)),
        });
        expect(finishMainPhase()(old)).toStrictEqual(old);
      });
    },
  );

  const it_should_go_to_end_phase_without_changing_hands_or_player = (
    before: GameState,
    player: Player,
  ) => {
    // > phase = End
    it('should go to the End phase', () => {
      const after = finishMainPhase()(before);
      expect(after.flow.phase).toBe(End);
    });

    // > player unchanged
    it('should not change the player', () => {
      const after = finishMainPhase()(before);
      expect(after.flow.player).toBe(player);
    });

    // > hands unchanged
    it('should not change the hands', () => {
      const after = finishMainPhase()(before);
      expect(after.northHand).toBe(before.northHand);
      expect(after.southHand).toBe(before.southHand);
    });
  };

  // Postconditions: cannot capture
  // > position * cannot capture -> no change to positions
  describe.for<Inputs>([
    // Capturing requires exclusive occupation of a leaf controlled by the opponent of the turn player.
    // Exclusive occupation means that only units of the turn player may be on the leaf.
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

      it_should_go_to_end_phase_without_changing_hands_or_player(
        before,
        player,
      );

      // > -> no change to positions
      it('should not change the pond', () => {
        const after = finishMainPhase()(before);
        expect(after.pond).toStrictEqual(before.pond);
      });
    },
  );

  // Postconditions: Can capture
  // > p <- position . can capture -> capture(p, player)
  // TODO 15: Opponent should capture first.
  describe.for<Inputs>([
    [North, INITIAL_POND, [{ x: 0, y: 2 }], SOUTH_LEAF_OTHER_UNIT],
    [North, ANOTHER_POND, [{ x: 1, y: 2 }], SOUTH_UPGRADED_OTHER_UNIT],
    [North, ANOTHER_POND, [{ x: 2, y: 3 }], SOUTH_UPGRADED_OTHER_UNIT],
    [North, INITIAL_POND, [{ x: 0, y: 2 }], SOUTH_LEAF_OTHER_UNIT],
    // TODO 11: Should win the game [North, ANOTHER_POND, [{ x: 1, y: 5 }], SOUTH_UPGRADED_OTHER_UNIT],
    [South, INITIAL_POND, [{ x: 1, y: 3 }], NORTH_LEAF_OTHER_UNIT],
    [South, INITIAL_POND, [{ x: 0, y: 3 }], NORTH_LEAF_OTHER_UNIT],
    [South, ANOTHER_POND, [{ x: 1, y: 2 }], NORTH_UPGRADED_OTHER_UNIT],
    [South, ANOTHER_POND, [{ x: 2, y: 3 }], NORTH_LEAF_OTHER_UNIT],
    // TODO 11: Should win the game [South, INITIAL_POND, [{ x: 1, y: 0 }], NORTH_UPGRADED_OTHER_UNIT],
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

      it_should_go_to_end_phase_without_changing_hands_or_player(
        before,
        player,
      );

      // > p <- position . can capture -> capture(p, player)
      it.for(positions)('should capture position %s', xy => {
        const after = finishMainPhase()(before);
        const want = { ...leaf, controller: player };
        const got = getPondStateAt(after.pond, xy);
        expect(got).toStrictEqual(want);
      });
    },
  );
});
