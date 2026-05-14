import { CardClass, type CardState } from '../types/card';
import type { Player } from '../types/gameflow';
import { createCard } from './card';

const LILYPAD_COUNT = 15;
const OLD_LEAF_COUNT = 5;
const FROGLET_COUNT = 40;
export const INITIAL_DECK_SIZE = LILYPAD_COUNT + OLD_LEAF_COUNT + FROGLET_COUNT;

export const generateDeckDeterministic = (
  owner: Player,
  getNextCardKey: () => number,
): CardState[] => [
  ...[
    CardClass.LilyPad,
    CardClass.Froglet,
    CardClass.LilyPad,
    CardClass.Froglet,
    CardClass.Froglet,
    CardClass.Froglet,
    CardClass.LilyPad,
  ].map(cardClass =>
    createCard({
      cardClass,
      owner,
      key: getNextCardKey(),
    }),
  ),
  ...Array.from({ length: FROGLET_COUNT - 4 }, () =>
    createCard({
      cardClass: CardClass.Froglet,
      owner,
      key: getNextCardKey(),
    }),
  ),
  ...Array.from({ length: LILYPAD_COUNT - 3 }, () =>
    createCard({
      cardClass: CardClass.LilyPad,
      owner,
      key: getNextCardKey(),
    }),
  ),
  ...Array.from({ length: OLD_LEAF_COUNT }, () =>
    createCard({
      cardClass: CardClass.OldLeaf,
      owner,
      key: getNextCardKey(),
    }),
  ),
];

export const generateDeck = (
  owner: Player,
  getNextCardKey: () => number,
): CardState[] => [
  ...Array.from({ length: FROGLET_COUNT }, () =>
    createCard({
      cardClass: CardClass.Froglet,
      owner,
      key: getNextCardKey(),
    }),
  ),
  ...Array.from({ length: LILYPAD_COUNT }, () =>
    createCard({
      cardClass: CardClass.LilyPad,
      owner,
      key: getNextCardKey(),
    }),
  ),
  ...Array.from({ length: OLD_LEAF_COUNT }, () =>
    createCard({
      cardClass: CardClass.OldLeaf,
      owner,
      key: getNextCardKey(),
    }),
  ),
];
