import { never, pick } from '../state/get-out';
import { type CardClass, CardType } from '../types/card';
import { deploy } from './deploy';
import { upgrade } from './upgrade';

export const pickCard = (cardClass: CardClass) =>
  pick(_ => {
    switch (cardClass.type) {
      case CardType.Leaf:
        return upgrade(cardClass);
      case CardType.Unit:
        return deploy(cardClass);
    }
    /* v8 ignore next line -- @preserve */
    return never(cardClass);
  });
