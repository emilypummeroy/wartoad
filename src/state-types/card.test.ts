import {
  type Card,
  type LeafCard,
  type UnitCard,
  CardClass,
  CardType,
  LeafClass,
  UnitClass,
} from '../types/card';
import { Player } from '../types/gameflow';
import { createUnit, createLeaf, isUnit, isLeaf, createCard } from './card';

describe.for<[Player, number]>([
  [Player.North, 0],
  [Player.South, 1],
  [Player.South, 2],
  [Player.North, 3],
])('for cards owned by %s with key %s', ([owner, key]) => {
  describe(isUnit, () => {
    it.for<[string, number, boolean, UnitClass]>(
      Object.values(UnitClass).map((x, i) => [x.key, i, i % 2 === 0, x]),
    )(
      'should allow %s with %s damage',
      ([_, damage, isExhausted, cardClass]) => {
        const card: Card = {
          key,
          cardClass: cardClass,
          type: CardType.Unit,
          owner,
          damage,
          isExhausted,
        };
        expect(isUnit(card)).toBe(true);
        if (isUnit(card)) card satisfies UnitCard;
      },
    );

    it.for<[string, LeafClass]>(Object.entries(LeafClass))(
      'should filter %s',
      ([_, cardClass]) => {
        const card: Card = {
          key,
          cardClass: cardClass,
          type: CardType.Leaf,
          owner,
        };
        expect(isUnit(card)).toBe(false);
        if (!isUnit(card)) card satisfies LeafCard;
      },
    );
  });

  describe(isLeaf, () => {
    it.for<[string, LeafClass]>(Object.entries(LeafClass))(
      'should allow %s',
      ([_, cardClass]) => {
        const card: Card = {
          key,
          cardClass: cardClass,
          type: CardType.Leaf,
          owner,
        };
        expect(isLeaf(card)).toBe(true);
        if (isLeaf(card)) card satisfies LeafCard;
      },
    );
    it.for<[string, number, boolean, UnitClass]>(
      Object.values(UnitClass).map((x, i) => [x.key, i, i % 2 === 0, x]),
    )(
      'should filter %s with %s damage',
      ([_, damage, isExhausted, cardClass]) => {
        const card: Card = {
          key,
          cardClass: cardClass,
          type: CardType.Unit,
          owner,
          damage,
          isExhausted,
        };
        expect(isLeaf(card)).toBe(false);
        if (!isLeaf(card)) card satisfies UnitCard;
      },
    );
  });

  describe(createUnit, () => {
    describe.for<[string, UnitClass]>(Object.entries(UnitClass))(
      'for the card %s',
      ([_, cardClass]) => {
        it('should produce a stable value for %s', () => {
          expect(
            createCard({ key, cardClass: cardClass, owner }),
          ).toMatchSnapshot();
        });

        it('should create it with 0 damage', () => {
          const card = createCard({ key, cardClass: cardClass, owner });
          expect(card.type).toBe(CardType.Unit);
          if (card.type !== CardType.Unit) expect.fail();
          card satisfies UnitCard;
        });
      },
    );
  });

  describe(createLeaf, () => {
    describe.for<[string, LeafClass]>(Object.entries(LeafClass))(
      'for the card %s',
      ([_, cardClass]) => {
        it('should produce a stable value for %s', () => {
          expect(
            createCard({ key, cardClass: cardClass, owner }),
          ).toMatchSnapshot();
        });
      },
    );
  });

  describe(createCard, () => {
    it.for<[string, CardClass]>(Object.entries(CardClass))(
      'should produce a stable value for %s',
      ([_, cardClass]) => {
        expect(
          createCard({ key, cardClass: cardClass, owner }),
        ).toMatchSnapshot();
      },
    );

    it.for<[string, UnitClass]>(Object.entries(UnitClass))(
      'should create a %s with 0 damage',
      ([_, cardClass]) => {
        const card = createCard({ key, cardClass: cardClass, owner });
        expect(card.type).toBe(CardType.Unit);
        if (card.type !== CardType.Unit) expect.fail();
        card satisfies UnitCard;
      },
    );
  });

  describe(`${isLeaf.name} ${isUnit.name}, and ${createCard.name}`, () => {
    it.for<[string, CardClass, number]>(
      Object.entries(CardClass).map(([k, c], i) => [k, c, i]),
    )(
      'should together have exhaustive branch coverage for %s',
      ([_, cardClass, keyAdd]) => {
        const card = createCard({
          key: key + keyAdd,
          cardClass: cardClass,
          owner,
        });
        expect(isLeaf(card)).not.toBe(isUnit(card));
        expect(isLeaf(card) || isUnit(card)).toBe(true);
        if (!isLeaf(card) && !isUnit(card)) card satisfies never;
      },
    );
  });
});
