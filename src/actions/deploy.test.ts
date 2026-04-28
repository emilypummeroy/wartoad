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
const { Start, End, GameOver } = Phase;
const { Upgrading, Deploying, Activating } = Subphase;

describe(deploy, () => {
  // Preconditions:
  describe.for<[Player, Phase, Player?]>([
    // < Idle
    [North, Start],
    [North, End],
    [North, GameOver, North],
    [North, GameOver, South],
    [South, Start],
    [South, End],
    [South, GameOver, North],
    [South, GameOver, South],

    // < Main phase
    [North, Upgrading],
    [North, Deploying],
    [North, Activating],
    [South, Upgrading],
    [South, Deploying],
    [South, Activating],
  ])(
    'Preconditions failed: need Main phase | %s %s | winner: %s',
    ([player, phase, winner]) => {
      const unit = createUnit({
        cardClass: CardClass.Froglet,
        owner: player,
        key: counter(),
      });
      const before = createStateWith({
        ...gameflowOf(player, phase),
        ...subphaseStateOf(player, phase),
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

    it('should set the phase to Deploying', () => {
      const after = deploy(unit)(before);
      expect(after.flow.phase).toBe(Deploying);
    });

    it('should not change the rest of the gameflow state', () => {
      const { subphase: _, phase: ____, ...got } = deploy(unit)(before).flow;
      const { subphase: __, phase: ___, ...want } = before.flow;
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
