import { draw } from '../state-types/card.test-utils';
import { createStateWith, gameflowOf } from '../state/test-utils';
import { CardClass, CardKey } from '../types/card';
import { Player, Phase } from '../types/gameflow';
import { pickCard } from './pick-card';

const { North, South } = Player;
const { LilyPad, Froglet } = CardKey;
const { Upgrading, Deploying } = Phase;

describe(pickCard, () => {
  describe.for<[Player, CardKey, Phase]>([
    [North, Froglet, Deploying],
    [South, Froglet, Deploying],
    [North, LilyPad, Upgrading],
    [South, LilyPad, Upgrading],
  ])('Postconditions | %s turn | called with %s', ([player, cardKey, want]) => {
    const card = draw(CardClass[cardKey])(player);
    const before = createStateWith({
      ...gameflowOf(player),
    });

    // > Phase set to appropriate value
    it(`should set the phase to ${want}`, () => {
      const after = pickCard(card)(before);
      expect(after.flow.phase).toBe(want);
    });

    it('should not change the rest of the gameflow state', () => {
      const { phase: __, ...got } = pickCard(card)(before).flow;
      const { phase: _, ...want } = before.flow;
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
