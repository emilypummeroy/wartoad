import {
  type CardType,
  type CardClassOf,
  type CardValuesOf,
  type Leaf,
  type Unit,
} from '../types/card-class';
import type { Player } from '../types/gameflow';

// Cards are the objects which you draw, have in your hand
// play to the Pond, etc.
// Cards have a key to uniquely identify them among instances
// of the same CardClass.
//
// TODO 10: Maybe They exist in a Space such as the aforementioned Hand, Pond, etc.
//
// They are owned by a particular player.
// Some cards track additional values like how much damage they've taken.
export type Card = UnitCard | LeafCard;
export type UnitCard = CardOf<Unit>;
export type LeafCard = CardOf<Leaf>;
export type CardOf<T extends CardType> = {
  readonly type: T;
  readonly key: number;
  readonly owner: Player;
  readonly cardClass: CardClassOf<T>;
  readonly values: CardValuesOf<T>;
};
