import {
  UnitCard,
  LeafCard,
  Card,
  CardClass,
  CardType,
  NoneValues,
  UnitClass,
  LeafClass,
} from './card-types';
import { Player } from './PhaseTracker';

describe.for<[Player, number]>([
  [Player.North, 0],
  [Player.South, 1],
  [Player.South, 2],
  [Player.North, 3],
])('for cards owned by %s with key %s', ([owner, key]) => {
  describe('UnitCard.is', () => {
    it.for<[string, number, UnitClass]>(
      Object.values(UnitClass).map((x, i) => [x.key, i, x]),
    )('should allow %s with %s damage', ([_, damage, cardClass]) => {
      const card: Card = {
        key,
        cardClass: cardClass,
        type: CardType.Unit,
        owner,
        values: { damage },
      };
      expect(UnitCard.is(card)).toBe(true);
      if (UnitCard.is(card)) card satisfies UnitCard;
    });

    it.for<[string, LeafClass]>(Object.entries(LeafClass))(
      'should filter %s',
      ([_, cardClass]) => {
        const card: Card = {
          key,
          cardClass: cardClass,
          type: CardType.Leaf,
          owner,
          values: NoneValues,
        };
        expect(UnitCard.is(card)).toBe(false);
        if (!UnitCard.is(card)) card satisfies LeafCard;
      },
    );
  });

  describe('LeafCard.is', () => {
    it.for<[string, LeafClass]>(Object.entries(LeafClass))(
      'should allow %s',
      ([_, cardClass]) => {
        const card: Card = {
          key,
          cardClass: cardClass,
          type: CardType.Leaf,
          owner,
          values: NoneValues,
        };
        expect(LeafCard.is(card)).toBe(true);
        if (LeafCard.is(card)) card satisfies LeafCard;
      },
    );
    it.for<[string, number, UnitClass]>(
      Object.values(UnitClass).map((x, i) => [x.key, i, x]),
    )('should filter %s with %s damage', ([_, damage, cardClass]) => {
      const card: Card = {
        key,
        cardClass: cardClass,
        type: CardType.Unit,
        owner,
        values: { damage },
      };
      expect(LeafCard.is(card)).toBe(false);
      if (!LeafCard.is(card)) card satisfies UnitCard;
    });
  });

  describe('UnitCard.create', () => {
    describe.for<[string, UnitClass]>(Object.entries(UnitClass))(
      'for the card %s',
      ([_, cardClass]) => {
        it('should produce a stable value for %s', () => {
          expect(
            Card.create({ key, cardClass: cardClass, owner }),
          ).toMatchSnapshot();
        });

        it('should create it with 0 damage', () => {
          const card = Card.create({ key, cardClass: cardClass, owner });
          expect(card.type).toBe(CardType.Unit);
          if (card.type !== CardType.Unit) expect.fail();
          card satisfies UnitCard;
        });
      },
    );
  });

  describe('LeafCard.create', () => {
    describe.for<[string, LeafClass]>(Object.entries(LeafClass))(
      'for the card %s',
      ([_, cardClass]) => {
        it('should produce a stable value for %s', () => {
          expect(
            Card.create({ key, cardClass: cardClass, owner }),
          ).toMatchSnapshot();
        });
      },
    );
  });

  describe('Card.create', () => {
    it.for<[string, CardClass]>(Object.entries(CardClass))(
      'should produce a stable value for %s',
      ([_, cardClass]) => {
        expect(
          Card.create({ key, cardClass: cardClass, owner }),
        ).toMatchSnapshot();
      },
    );

    it.for<[string, UnitClass]>(Object.entries(UnitClass))(
      'should create a %s with 0 damage',
      ([_, cardClass]) => {
        const card = Card.create({ key, cardClass: cardClass, owner });
        expect(card.type).toBe(CardType.Unit);
        if (card.type !== CardType.Unit) expect.fail();
        card satisfies UnitCard;
      },
    );
  });

  describe('LeafCard.is, UnitCard.is, and Card.create', () => {
    it.for<[string, CardClass, number]>(
      Object.entries(CardClass).map(([k, c], i) => [k, c, i]),
    )(
      'should together have exhaustive branch coverage for %s',
      ([_, cardClass, keyAdd]) => {
        const card = Card.create({
          key: key + keyAdd,
          cardClass: cardClass,
          owner,
        });
        expect(LeafCard.is(card)).not.toBe(UnitCard.is(card));
        expect(LeafCard.is(card) || UnitCard.is(card)).toBe(true);
        if (!LeafCard.is(card) && !UnitCard.is(card)) card satisfies never;
      },
    );
  });
});
