import { draw } from '../state-types/card.test-utils';
import { createStateWith, gameflowOf } from '../state/test-utils';
import { CardClass, CardKey } from '../types/card';
import { Player, Subphase } from '../types/gameflow';
import { pickCard } from './pick-card';

const { North, South } = Player;
const { LilyPad, Froglet } = CardKey;
const { Upgrading, Deploying } = Subphase;

describe(pickCard, () => {
  describe.for<[Player, CardKey, Subphase]>([
    [North, Froglet, Deploying],
    [South, Froglet, Deploying],
    [North, LilyPad, Upgrading],
    [South, LilyPad, Upgrading],
  ])('Postconditions | %s turn | called with %s', ([player, cardKey, want]) => {
    const card = draw(CardClass[cardKey])(player);
    const before = createStateWith({
      ...gameflowOf(player),
    });

    // > Subphase set to appropriate subphase
    it(`should set the subphase to ${want}`, () => {
      const after = pickCard(card)(before);
      expect(after.flow.subphase).toBe(want);
    });

    it(`should set the phase to ${want}`, () => {
      const after = pickCard(card)(before);
      expect(after.flow.phase).toBe(want);
    });

    it('should not change the rest of the gameflow state', () => {
      const { subphase: _, phase: ____, ...got } = pickCard(card)(before).flow;
      const { subphase: __, phase: ___, ...want } = before.flow;
      expect(got).toStrictEqual(want);
    });

    // > pickedCard set
    it(`should set the picked card to a ${cardKey}`, () => {
      const after = pickCard(card)(before);
      const pickedCard = after.upgrade?.leaf ?? after.deployment?.unit;
      expect(pickedCard?.cardClass).toBe(card.cardClass);
    });

    it(`should not affect the rest of the state`, () => {
      const after = pickCard(card)(before);
      let got = {};
      let want = {};
      {
        const { flow: _, deployment: __, upgrade: ___, ...rest } = after;
        got = rest;
      }
      {
        const { flow: _, deployment: __, upgrade: ___, ...rest } = before;
        want = rest;
      }
      expect(got).toStrictEqual(want);
    });
  });
});
