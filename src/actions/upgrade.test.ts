import { createLeaf } from '../state-types/card';
import {
  createStateWith,
  gameflowOf,
  subphaseStateOf,
  winningPondOf,
} from '../state/test-utils';
import { CardClass, CardKey, type LeafKey } from '../types/card';
import { Phase, Player, Subphase } from '../types/gameflow';
import { counter } from '../types/test-utils';
import { upgrade } from './upgrade';

const { LilyPad } = CardKey;
const { North, South } = Player;
const { Start, End, GameOver } = Phase;
const { Upgrading, Deploying, Activating } = Subphase;

describe(upgrade, () => {
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
    'Preconditions failed: need Idle during Main phase | %s %s %s',
    ([player, phase, winner]) => {
      const card = createLeaf({
        cardClass: CardClass.LilyPad,
        owner: player,
        key: counter(),
      });
      const before = createStateWith({
        ...gameflowOf(player, phase),
        ...winningPondOf(winner),
        ...subphaseStateOf(player, phase),
      });

      it('should not change state', () => {
        expect(upgrade(card)(before)).toStrictEqual(before);
      });
    },
  );

  // Postconditions
  describe.for<[Player, LeafKey]>([
    [North, LilyPad],
    [South, LilyPad],
  ])('Postconditions | %s turn | called with %s', ([player, cardKey]) => {
    const leaf = createLeaf({
      cardClass: CardClass[cardKey],
      owner: player,
      key: counter(),
    });
    const before = createStateWith({
      ...gameflowOf(player),
    });

    // > Subphase := Upgrading
    it('should set the subphase to upgrading', () => {
      const after = upgrade(leaf)(before);
      expect(after.flow.subphase).toBe(Upgrading);
    });

    it('should set the phase to upgrading', () => {
      const after = upgrade(leaf)(before);
      expect(after.flow.phase).toBe(Upgrading);
    });

    it('should not change the rest of the gameflow state', () => {
      const { subphase: _, phase: ____, ...got } = upgrade(leaf)(before).flow;
      const { subphase: __, phase: ___, ...want } = before.flow;
      expect(got).toStrictEqual(want);
    });

    // > pickedCard set
    it(`should set the picked card to a ${cardKey}`, () => {
      const after = upgrade(leaf)(before);
      expect(after.upgrade?.leaf).toBe(leaf);
    });

    it(`should not affect the rest of the state`, () => {
      const after = upgrade(leaf)(before);
      let got = {};
      let want = {};
      {
        const { flow: _, upgrade: __, ...rest } = after;
        got = rest;
      }
      {
        const { flow: _, upgrade: __, ...rest } = before;
        want = rest;
      }
      expect(got).toStrictEqual(want);
    });
  });
});
