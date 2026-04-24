import type { GameState } from '../state-types';
import { createUnit } from '../state-types/card';
import { setPondStateAt } from '../state-types/pond';
import {
  CardType,
  UnitClass,
  type CardClass,
  type UnitCard,
} from '../types/card';
import { Player, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';

export { activate } from './activate';
export { commitActivate } from './commit-activate';
export { endPhase } from './end-phase';

export type GameActions = {
  endPhase: () => void;
  // No different pickUnit, pickLeaf, etc.
  // The difference between activation and upgrading is not the concern of
  // Hand or Card.
  // TODO 11: Make it operate on a card instead of a card class
  pickCard: (_: CardClass) => void;
  activate: (unit: UnitCard, position: Position) => void;
  commitUpgrade: (_: Position) => void;
  commitDeploy: (_: Position) => void;
  commitActivate: (_: Position) => void;
};

// TODO 11: Remove the particular card
const removeOne = (
  cards: readonly CardClass[],
  cardClass: CardClass,
): CardClass[] => [
  ...cards.slice(0, cards.lastIndexOf(cardClass)),
  ...cards.slice(cards.lastIndexOf(cardClass) + 1),
];

// TODO 10: test
// TODO 10: make this move the cardclass from the hand and make a Card
export const pickCard =
  (pickedCard: CardClass) =>
  ({ flow, ...rest }: GameState): GameState => ({
    ...rest,
    flow: {
      ...flow,
      subphase:
        // TODO 11: pickedCard.type
        pickedCard.type === CardType.Unit
          ? Subphase.Deploying
          : Subphase.Upgrading,
    },
    pickedCard,
  });

// TODO 11: test
// TODO 11: Make this just for upgrading
export const commitUpgrade =
  (getNextCardKey: () => number) =>
  (position: Position) =>
  ({
    pond: grid,
    flow,
    flow: { subphase, player },
    northHand,
    southHand,
    pickedCard,
  }: GameState): GameState => ({
    flow: { ...flow, subphase: Subphase.Idle },
    northHand:
      player === Player.North && pickedCard && northHand.length > 0
        ? removeOne(northHand, pickedCard)
        : northHand,
    southHand:
      player === Player.South && pickedCard && southHand.length > 0
        ? removeOne(southHand, pickedCard)
        : southHand,
    pond: setPondStateAt(
      grid,
      position,
      subphase === Subphase.Upgrading
        ? // TODO 11: Make it create a card for leaves too
          { isUpgraded: true }
        : old => ({
            ...old,
            units: [
              createUnit({
                cardClass: UnitClass.Froglet,
                owner: player,
                key: getNextCardKey(),
              }),
            ],
          }),
    ),
  });

// TODO 11: test
// TODO 11: Make this just for deploying
export const commitDeploy =
  (getNextCardKey: () => number) =>
  (position: Position) =>
  ({
    pond: grid,
    flow,
    flow: { subphase, player },
    northHand,
    southHand,
    pickedCard,
  }: GameState): GameState => ({
    flow: { ...flow, subphase: Subphase.Idle },
    northHand:
      player === Player.North && pickedCard && northHand.length > 0
        ? removeOne(northHand, pickedCard)
        : northHand,
    southHand:
      player === Player.South && pickedCard && southHand.length > 0
        ? removeOne(southHand, pickedCard)
        : southHand,
    pond: setPondStateAt(
      grid,
      position,
      subphase === Subphase.Upgrading
        ? { isUpgraded: true }
        : // TODO 11: Append a unit instead of setting units
          old => ({
            ...old,
            units: [
              createUnit({
                cardClass: UnitClass.Froglet,
                owner: player,
                key: getNextCardKey(),
              }),
            ],
          }),
    ),
  });
