import { never, pick } from '../state/get-out';
import { type Card, CardType } from '../types/card';
import { deploy } from './deploy';
import { upgrade } from './upgrade';

export const pickCard = (card: Card) =>
  pick(() => {
    switch (card.type) {
      case CardType.Leaf:
        return upgrade(card);
      case CardType.Unit:
        return deploy(card);
    }
    /* v8 ignore next line -- @preserve */
    return never(card);
  });
