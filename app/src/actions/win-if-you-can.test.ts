import { getPondStateAt, HOME, setPondStateAt } from '@/state-types/pond';
import {
  TEST_LEAVES_BY_KEY,
  TEST_PONDS_BY_KEY,
  TestLeafKey,
  TestPondKey,
} from '@/state-types/pond.test-utils';
import {
  createStateWith,
  gameflowOf,
  phaseStateOf,
  winningPondOf,
} from '@/state/test-utils';
import { Phase, Player, PLAYER_AFTER } from '@/types/gameflow';

import { winIfYouCan } from './win-if-you-can';

const { North, South } = Player;
const { Upgrading, Deploying, Activating, Start, Main, End, GameOver } = Phase;

const { INITIAL_POND, ANOTHER_POND, UNITS_POND } = TestPondKey;
const {
  SOUTH_LILYPAD,
  SOUTH_LILYPAD_UNIT,
  SOUTH_LILYPAD_UNITS,
  SOUTH_LILYPAD_OTHER_UNIT,
  NORTH_LILYPAD,
  NORTH_LILYPAD_UNIT,
  NORTH_LILYPAD_UNITS,
  NORTH_LILYPAD_OTHER_UNIT,
} = TestLeafKey;

type Input = [
  you: Player,
  turn: Player,
  TestPondKey,
  opponentHome: TestLeafKey,
];
type Preconditions = [you: Player, turn: Player, Phase, TestPondKey];

describe(winIfYouCan, () => {
  // Preconditions:
  describe.for<[...Preconditions, winner?: Player]>([
    // < Is End phase
    [North, North, Main, INITIAL_POND],
    [North, South, Start, ANOTHER_POND],
    [North, North, Upgrading, INITIAL_POND],
    [North, South, Deploying, ANOTHER_POND],
    [North, North, Activating, INITIAL_POND],
    [North, South, GameOver, INITIAL_POND, North],
    [North, North, GameOver, ANOTHER_POND, South],
    [South, South, Main, INITIAL_POND],
    [South, North, Start, ANOTHER_POND],
    [South, South, Upgrading, INITIAL_POND],
    [South, North, Deploying, ANOTHER_POND],
    [South, South, Activating, ANOTHER_POND],
    [South, North, GameOver, INITIAL_POND, North],
    [South, South, GameOver, ANOTHER_POND, South],
  ])(
    'Precondition failed: need End phase | %s during %s %s phase | %s | winner: %s',
    ([you, player, phase, pondKey, winner]) => {
      const pond = TEST_PONDS_BY_KEY[pondKey];
      const before = createStateWith({
        ...gameflowOf(player, phase),
        ...phaseStateOf(player, phase),
        ...winningPondOf(winner, pond),
      });
      it('should not change state at all', () => {
        const after = winIfYouCan(you)(before);
        expect(after).toStrictEqual(before);
      });
    },
  );

  describe.for<[...Preconditions, opponentHome: TestLeafKey]>([
    // < Can capture opponent Home
    [North, North, End, INITIAL_POND, SOUTH_LILYPAD_UNIT],
    [North, South, End, UNITS_POND, SOUTH_LILYPAD],
    [North, North, End, ANOTHER_POND, SOUTH_LILYPAD_UNITS],
    [South, South, End, INITIAL_POND, NORTH_LILYPAD_UNIT],
    [South, North, End, UNITS_POND, NORTH_LILYPAD],
    [South, South, End, ANOTHER_POND, NORTH_LILYPAD_UNITS],
  ])(
    'Precondition failed: can capture opponent Home | %s during %s %s phase | opponent home: %s',
    ([you, player, phase, pondKey, opponentHome]) => {
      const pond = TEST_PONDS_BY_KEY[pondKey];
      const before = createStateWith({
        ...gameflowOf(player, phase),
        pond: setPondStateAt(
          pond,
          HOME[PLAYER_AFTER[you]],
          TEST_LEAVES_BY_KEY[opponentHome],
        ),
      });
      it('should not change state at all', () => {
        const after = winIfYouCan(you)(before);
        expect(after).toStrictEqual(before);
      });
    },
  );

  // Postconditions:
  describe.for<Input>([
    [North, North, INITIAL_POND, SOUTH_LILYPAD_OTHER_UNIT],
    [North, South, ANOTHER_POND, SOUTH_LILYPAD_OTHER_UNIT],
    [South, North, INITIAL_POND, NORTH_LILYPAD_OTHER_UNIT],
    [South, South, ANOTHER_POND, NORTH_LILYPAD_OTHER_UNIT],
    [North, South, INITIAL_POND, SOUTH_LILYPAD_OTHER_UNIT],
    [North, North, ANOTHER_POND, SOUTH_LILYPAD_OTHER_UNIT],
    [South, South, INITIAL_POND, NORTH_LILYPAD_OTHER_UNIT],
    [South, North, ANOTHER_POND, NORTH_LILYPAD_OTHER_UNIT],
  ])(
    'Preconditions met | %s during %s turn | in %s with %s at opponent Home',
    ([you, player, pondKey, leafKey]) => {
      const pond = TEST_PONDS_BY_KEY[pondKey];
      const position = HOME[PLAYER_AFTER[you]];
      const leaf = TEST_LEAVES_BY_KEY[leafKey];
      const before = createStateWith({
        ...gameflowOf(player, End),
        pond: setPondStateAt(pond, position, leaf),
      });
      const opponent = you === North ? South : North;

      // > GameOver phase
      it('should set Phase to GameOver', () => {
        const after = winIfYouCan(you)(before);
        expect(after.flow.phase).toBe(GameOver);
      });

      it('should not change other gameflow details', () => {
        const { phase: _, ...got } = winIfYouCan(you)(before).flow;
        const { phase: __, ...want } = before.flow;
        expect(got).toStrictEqual(want);
      });

      // > winner = player
      it(`should set the winner to ${player}`, () => {
        const after = winIfYouCan(you)(before);
        expect(after.winner).toBe(you);
      });

      // > opponent Home is captured
      it(`should capture the ${opponent} Home`, () => {
        const after = winIfYouCan(you)(before);
        const { controller, leaf } = getPondStateAt(after.pond, HOME[opponent]);
        expect(controller).toBe(you);
        expect(leaf).not.toBeDefined();
      });

      it(`should not change the rest of the pond`, () => {
        const after = winIfYouCan(you)(before);
        const want = setPondStateAt(before.pond, HOME[opponent], {
          controller: you,
          leaf: undefined,
        });
        expect(after.pond).toStrictEqual(want);
      });

      it('should not change other state details', () => {
        let got = {};
        let want = {};
        const after = winIfYouCan(you)(before);
        {
          const { pond: _, flow: __, winner: ___, ...got_ } = after;
          got = got_;
        }
        {
          const { pond: _, flow: __, winner: ___, ...want_ } = before;
          want = want_;
        }
        expect(got).toStrictEqual(want);
      });
    },
  );
});
