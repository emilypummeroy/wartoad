import { createLeaf, createUnit } from '../state-types/card';
import { never, pick } from '../state/get-out';
import { type CardClass, CardType } from '../types/card';
import { deploy } from './deploy';
import { upgrade } from './upgrade';

// TODO 11: Use card instead of card class
export const pickCard = (cardClass: CardClass, getNextCardKey: () => number) =>
  pick(get => {
    switch (cardClass.type) {
      case CardType.Leaf:
        return upgrade(
          createLeaf({ cardClass, owner: get.player, key: getNextCardKey() }),
        );
      case CardType.Unit:
        return deploy(
          createUnit({ cardClass, owner: get.player, key: getNextCardKey() }),
        );
    }
    /* v8 ignore next line -- @preserve */
    return never(cardClass);
  });
