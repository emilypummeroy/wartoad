import { CARD_KEYS, CardClass } from '../types/card';
import type { Draw, LeafTutor, Tutor, UnitTutor } from '../types/deck';
import { counter } from '../types/test-utils';
import { createCard, createLeaf, createUnit } from './card';

export const makeDraw: () => Draw = () => {
  let i = 0;
  let j = 0;
  return owner => () =>
    createCard({
      cardClass: CardClass[CARD_KEYS[i++ % CARD_KEYS.length]],
      owner,
      key: j++,
    });
};

export const makeTutor: () => Tutor = () => owner => cardClass =>
  createCard({
    cardClass,
    owner,
    key: counter(),
  });

export const leafTutor: () => LeafTutor = () => owner => cardClass =>
  createLeaf({
    cardClass,
    owner,
    key: counter(),
  });

export const unitTutor: () => UnitTutor = () => owner => cardClass =>
  createUnit({
    cardClass,
    owner,
    key: counter(),
  });
