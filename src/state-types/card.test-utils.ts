import { CardClass } from '../types/card';
import type { Player } from '../types/gameflow';
import { counter } from '../types/test-utils';
import { createCard } from './card';

export const draw =
  (cardClass: CardClass = CardClass.Froglet) =>
  (owner: Player) =>
    createCard({
      cardClass,
      owner,
      key: counter(),
    });
