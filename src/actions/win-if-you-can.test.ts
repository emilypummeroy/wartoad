import { getPondStateAt, HOME, setPondStateAt } from '../state-types/pond';
import {
  TEST_LEAVES_BY_KEY,
  TEST_PONDS_BY_KEY,
  TestLeafKey,
  TestPondKey,
} from '../state-types/pond.test-utils';
import { createStateWith, gameflowOf } from '../state/test-utils';
import { Phase, Player, PLAYER_AFTER, Subphase } from '../types/gameflow';
import { winIfYouCan } from './win-if-you-can';

const { North, South } = Player;
const { Idle } = Subphase;
const { Start, Main, End, GameOver } = Phase;

const { INITIAL_POND, ANOTHER_POND, UNITS_POND } = TestPondKey;
const {
  SOUTH_UPGRADED,
  SOUTH_UPGRADED_UNIT,
  SOUTH_UPGRADED_UNITS,
  SOUTH_UPGRADED_OTHER_UNIT,
  NORTH_UPGRADED,
  NORTH_UPGRADED_UNIT,
  NORTH_UPGRADED_UNITS,
  NORTH_UPGRADED_OTHER_UNIT,
} = TestLeafKey;

type Input = [Player, TestPondKey, opponentHome: TestLeafKey];
type Preconditions = [Player, Phase, TestPondKey];

describe(winIfYouCan, () => {
  // Preconditions:
  describe.for<[...Preconditions, winner?: Player]>([
    // < Is End phase
    [North, Main, INITIAL_POND],
    [North, Start, ANOTHER_POND],
    [North, GameOver, INITIAL_POND, North],
    [North, GameOver, ANOTHER_POND, South],
    [South, Main, INITIAL_POND],
    [South, Start, ANOTHER_POND],
    [South, GameOver, INITIAL_POND, North],
    [South, GameOver, ANOTHER_POND, South],
  ])(
    'Precondition failed: need End phase | %s %s phase | %s | winner: %s',
    ([player, phase, pondKey, winner]) => {
      const pond = TEST_PONDS_BY_KEY[pondKey];
      const before = createStateWith({
        ...gameflowOf(player, Idle, phase),
        pond: winner
          ? setPondStateAt(pond, HOME[PLAYER_AFTER[winner]], {
              controller: winner,
            })
          : pond,
        winner,
      });
      it('should not change state at all', () => {
        const after = winIfYouCan()(before);
        expect(after).toStrictEqual(before);
      });
    },
  );

  describe.for<[...Preconditions, opponentHome: TestLeafKey]>([
    // < Can capture opponent Home
    [North, End, INITIAL_POND, SOUTH_UPGRADED_UNIT],
    [North, End, UNITS_POND, SOUTH_UPGRADED],
    [North, End, ANOTHER_POND, SOUTH_UPGRADED_UNITS],
    [South, End, INITIAL_POND, NORTH_UPGRADED_UNIT],
    [South, End, UNITS_POND, NORTH_UPGRADED],
    [South, End, ANOTHER_POND, NORTH_UPGRADED_UNITS],
  ])(
    'Precondition failed: can capture opponent Home | %s %s phase | opponent home: %s',
    ([player, phase, pondKey, opponentHome]) => {
      const pond = TEST_PONDS_BY_KEY[pondKey];
      const before = createStateWith({
        ...gameflowOf(player, Idle, phase),
        pond: setPondStateAt(
          pond,
          HOME[PLAYER_AFTER[player]],
          TEST_LEAVES_BY_KEY[opponentHome],
        ),
      });
      it('should not change state at all', () => {
        const after = winIfYouCan()(before);
        expect(after).toStrictEqual(before);
      });
    },
  );

  // Postconditions:
  describe.for<Input>([
    [North, INITIAL_POND, SOUTH_UPGRADED_OTHER_UNIT],
    [North, ANOTHER_POND, SOUTH_UPGRADED_OTHER_UNIT],
    [South, INITIAL_POND, NORTH_UPGRADED_OTHER_UNIT],
    [South, ANOTHER_POND, NORTH_UPGRADED_OTHER_UNIT],
  ])(
    'Preconditions met | %s turn | in %s with %s at opponent Home',
    ([player, pondKey, leafKey]) => {
      const pond = TEST_PONDS_BY_KEY[pondKey];
      const position = HOME[PLAYER_AFTER[player]];
      const leaf = TEST_LEAVES_BY_KEY[leafKey];
      const before = createStateWith({
        ...gameflowOf(player, Idle, End),
        pond: setPondStateAt(pond, position, leaf),
      });
      const opponent = player === North ? South : North;

      // > GameOver phase
      it('should set Phase to GameOver', () => {
        const after = winIfYouCan()(before);
        expect(after.flow.phase).toBe(GameOver);
      });

      it('should not change other gameflow details', () => {
        const { phase: _, ...got } = winIfYouCan()(before).flow;
        const { phase: __, ...want } = before.flow;
        expect(got).toStrictEqual(want);
      });

      // > winner = player
      it(`should set the winner to ${player}`, () => {
        const after = winIfYouCan()(before);
        expect(after.winner).toBe(player);
      });

      // > opponent Home is captured
      it(`should capture the ${opponent} Home`, () => {
        const after = winIfYouCan()(before);
        const { controller } = getPondStateAt(after.pond, HOME[opponent]);
        expect(controller).toBe(player);
      });

      it(`should not change the rest of the pond`, () => {
        const after = winIfYouCan()(before);
        const want = setPondStateAt(before.pond, HOME[opponent], {
          controller: getPondStateAt(after.pond, HOME[opponent]).controller,
        });
        expect(after.pond).toStrictEqual(want);
      });

      it('should not change other state details', () => {
        let got = {};
        let want = {};
        const after = winIfYouCan()(before);
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
