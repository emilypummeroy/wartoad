import { shuffled } from '@/types';
import {
  CARD_KEYS,
  CardClass,
  type CardState,
  type LeafClass,
  type UnitClass,
} from '@/types/card';
import type { Player } from '@/types/gameflow';
import { counter } from '@/types/test-utils';

import { createCard, createLeaf, createUnit } from './card';
import { generateDeck } from './deck';

export const makeDraw = () => {
  let i = 0;
  return (owner: Player) => (): CardState =>
    createCard({
      cardClass: CardClass[CARD_KEYS[i++ % CARD_KEYS.length]],
      owner,
      key: counter(),
    });
};

export const makeTutor = (owner: Player) => (cardClass: CardClass) =>
  createCard({
    cardClass,
    owner,
    key: counter(),
  });

export const leafTutor = (owner: Player) => (cardClass: LeafClass) =>
  createLeaf({
    cardClass,
    owner,
    key: counter(),
  });

export const unitTutor = (owner: Player) => (cardClass: UnitClass) =>
  createUnit({
    cardClass,
    owner,
    key: counter(),
  });

export const makeHand = (player: Player, length: number) =>
  shuffled(generateDeck(player, counter)).slice(0, length);
