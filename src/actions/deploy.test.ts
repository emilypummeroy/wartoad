import { createUnit } from '../state-types/card';
import {
  createStateWith,
  gameflowOf,
  subphaseStateOf,
  winningPondOf,
} from '../state/test-utils';
import { CardClass, CardKey, type UnitKey } from '../types/card';
import { Phase, Player, Subphase } from '../types/gameflow';
import { counter } from '../types/test-utils';
import { deploy } from './deploy';

const { Froglet } = CardKey;
const { North, South } = Player;
const { Start, Main, End, GameOver } = Phase;
const { Idle, Upgrading, Deploying, Activating } = Subphase;

describe(deploy, () => {
  // Preconditions:
  describe.for<[Player, Phase, Subphase, Player?]>([
    // < Idle
    [North, Start, Idle],
    [North, End, Idle],
    [North, GameOver, Idle, North],
    [North, GameOver, Idle, South],
    [South, Start, Idle],
    [South, End, Idle],
    [South, GameOver, Idle, North],
    [South, GameOver, Idle, South],

    // < Main phase
    [North, Main, Upgrading],
    [North, Main, Deploying],
    [North, Main, Activating],
    [South, Main, Upgrading],
    [South, Main, Deploying],
    [South, Main, Activating],
  ])(
    'Preconditions failed: need Idle during Main phase | %s %s %s',
    ([player, phase, subphase, winner]) => {
      const unit = createUnit({
        cardClass: CardClass.Froglet,
        owner: player,
        key: counter(),
      });
      const before = createStateWith({
        ...gameflowOf(player, subphase, phase),
        ...subphaseStateOf(player, subphase),
        ...winningPondOf(winner),
      });

      it('should not change state', () => {
        expect(deploy(unit)(before)).toStrictEqual(before);
      });
    },
  );

  // Postconditions
  describe.for<[Player, UnitKey]>([
    [North, Froglet],
    [South, Froglet],
  ])('Postconditions | %s turn | called with %s', ([player, cardKey]) => {
    const unit = createUnit({
      cardClass: CardClass[cardKey],
      owner: player,
      key: counter(),
    });
    const before = createStateWith({
      ...gameflowOf(player),
    });

    // > Subphase := Deploying
    it('should set the subphase to Deploying', () => {
      const after = deploy(unit)(before);
      expect(after.flow.subphase).toBe(Deploying);
    });

    it('should not change the rest of the gameflow state', () => {
      const { subphase: _, ...got } = deploy(unit)(before).flow;
      const { subphase: __, ...want } = before.flow;
      expect(got).toStrictEqual(want);
    });

    // > pickedCard set
    it(`should set the picked card to a ${cardKey}`, () => {
      const after = deploy(unit)(before);
      expect(after.deployment?.unit).toBe(unit);
    });

    it(`should not affect the rest of the state`, () => {
      const after = deploy(unit)(before);
      let got = {};
      let want = {};
      {
        const { flow: _, deployment: __, ...rest } = after;
        got = rest;
      }
      {
        const { flow: _, deployment: __, ...rest } = before;
        want = rest;
      }
      expect(got).toStrictEqual(want);
    });
  });
});
