import { createCard } from '../state-types/card';
import { createStateWith, gameflowOf } from '../state/test-utils';
import { CardClass, CardKey } from '../types/card';
import { Player, Subphase } from '../types/gameflow';
import { counter } from '../types/test-utils';
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
    const card = createCard({
      cardClass: CardClass[cardKey],
      owner: player,
      key: counter(),
    });
    const before = createStateWith({
      ...gameflowOf(player),
    });

    // > Subphase set to appropriate subphase
    it(`should set the subphase to ${want}`, () => {
      const after = pickCard(card.cardClass)(before);
      expect(after.flow.subphase).toBe(want);
    });

    it('should not change the rest of the gameflow state', () => {
      const { subphase: _, ...got } = pickCard(card.cardClass)(before).flow;
      const { subphase: __, ...want } = before.flow;
      expect(got).toStrictEqual(want);
    });

    // > pickedCard set
    it(`should set the picked card to a ${cardKey}`, () => {
      const after = pickCard(card.cardClass)(before);
      expect(after.pickedCard).toBe(card.cardClass);
    });

    it(`should not affect the rest of the state`, () => {
      const after = pickCard(card.cardClass)(before);
      let got = {};
      let want = {};
      {
        const { flow: _, pickedCard: __, ...rest } = after;
        got = rest;
      }
      {
        const { flow: _, pickedCard: __, ...rest } = before;
        want = rest;
      }
      expect(got).toStrictEqual(want);
    });
  });
});
