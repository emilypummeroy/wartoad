import {
  UnitClass,
  LeafClass,
  UnitCard,
  LeafCard,
  Card,
  CardClass,
  CardType,
  NoneValues,
} from './card-types';
import { Player } from './PhaseTracker';

describe('UnitClass.is', () => {
  it.for<[string, CardClass]>([CardClass.Froglet].map(x => [x.key, x]))(
    'should allow %s',
    ([_, cardClass]) => {
      expect(UnitClass.is(cardClass)).toBe(true);
      if (!UnitClass.is(cardClass)) expect.fail();
      cardClass satisfies UnitClass;
    },
  );

  it.for<[string, CardClass]>([CardClass.LilyPad].map(x => [x.key, x]))(
    'should filter %s',
    ([_, cardClass]) => {
      expect(UnitClass.is(cardClass)).toBe(false);
      if (!UnitClass.is(cardClass)) cardClass satisfies LeafClass;
    },
  );
});

describe('LeafClass.is', () => {
  it.for<[string, CardClass]>([CardClass.LilyPad].map(x => [x.key, x]))(
    'should allow %s',
    ([_, cardClass]) => {
      expect(LeafClass.is(cardClass)).toBe(true);
      if (LeafClass.is(cardClass)) cardClass satisfies LeafClass;
    },
  );

  it.for<[string, CardClass]>([CardClass.Froglet].map(x => [x.key, x]))(
    'should filter %s',
    ([_, cardClass]) => {
      expect(LeafClass.is(cardClass)).toBe(false);
      if (!LeafClass.is(cardClass)) cardClass satisfies UnitClass;
    },
  );
});

describe('LeafClass.is and UnitClass.is', () => {
  it.for<[string, CardClass]>(Object.entries(CardClass))(
    'should together have exhaustive branch coverage for %s',
    ([_, cardClass]) => {
      expect(LeafClass.is(cardClass)).not.toBe(UnitClass.is(cardClass));
      expect(LeafClass.is(cardClass) || UnitClass.is(cardClass)).toBe(true);
      if (!LeafClass.is(cardClass) && !UnitClass.is(cardClass))
        cardClass satisfies never;
    },
  );
});

describe.for<[Player, number]>(
  [Player.North, Player.South].map((x, i) => [x, i]),
)('for cards owned by %s with key %s', ([owner, key]) => {
  describe('UnitCard.is', () => {
    it.for<[string, number, UnitClass]>(
      [CardClass.Froglet].map((x, i) => [x.key, i, x]),
    )('should allow %s with %s damage', ([_, damage, cardClass]) => {
      const card: Card = {
        key,
        class: cardClass,
        type: CardType.Unit,
        owner,
        values: { damage },
      };
      expect(UnitCard.is(card)).toBe(true);
      if (UnitCard.is(card)) card satisfies UnitCard;
    });

    it.for<[string, LeafClass]>([CardClass.LilyPad].map(x => [x.key, x]))(
      'should filter %s',
      ([_, cardClass]) => {
        const card: Card = {
          key,
          class: cardClass,
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
    it.for<[string, LeafClass]>([CardClass.LilyPad].map(x => [x.key, x]))(
      'should allow %s',
      ([_, cardClass]) => {
        const card: Card = {
          key,
          class: cardClass,
          type: CardType.Leaf,
          owner,
          values: NoneValues,
        };
        expect(LeafCard.is(card)).toBe(true);
        if (LeafCard.is(card)) card satisfies LeafCard;
      },
    );

    it.for<[string, number, UnitClass]>(
      [CardClass.Froglet, CardClass.Froglet].map((x, i) => [x.key, i, x]),
    )('should filter %s with %s damage', ([_, damage, cardClass]) => {
      const card: Card = {
        key,
        class: cardClass,
        type: CardType.Unit,
        owner,
        values: { damage },
      };
      expect(LeafCard.is(card)).toBe(false);
      if (!LeafCard.is(card)) card satisfies UnitCard;
    });
  });

  describe('Card.new', () => {
    it.for<[string, CardClass]>(Object.entries(CardClass))(
      'should produce a stable value for %s',
      ([_, cardClass]) => {
        expect(Card.new({ key, class: cardClass, owner })).toMatchSnapshot();
      },
    );

    it.for<[string, UnitClass]>([CardClass.Froglet].map(x => [x.key, x]))(
      'should create a %s with 0 damage',
      ([_, cardClass]) => {
        const card = Card.new({ key, class: cardClass, owner });
        expect(card.type).toBe(CardType.Unit);
        if (card.type !== CardType.Unit) expect.fail();
        card satisfies UnitCard;
      },
    );
  });

  describe('LeafCard.is, UnitCard.is, and Card.new', () => {
    it.for<[string, CardClass, number]>(
      Object.entries(CardClass).map(([k, c], i) => [k, c, i]),
    )(
      'should together have exhaustive branch coverage for %s',
      ([_, cardClass, keyAdd]) => {
        const card = Card.new({
          key: key + keyAdd,
          class: cardClass,
          owner,
        });
        expect(LeafCard.is(card)).not.toBe(UnitCard.is(card));
        expect(LeafCard.is(card) || UnitCard.is(card)).toBe(true);
        if (!LeafCard.is(card) && !UnitCard.is(card)) card satisfies never;
      },
    );
  });
});
