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
export { finishPhase } from './finish-phase';

export type GameActions = {
  endPhase: () => void;
  // No different pickUnit, pickLeaf, etc.
  // The difference between activation and upgrading is not the concern of
  // Hand or Card.
  pickCard: (_: CardClass) => void;
  activate: (unit: UnitCard, position: Position) => void;
  commitUpgrade: (_: Position) => void;
  commitDeploy: (_: Position) => void;
  commitActivate: (_: Position) => void;
};

// TODO 14: Remove the particular card instead of just any member of card class.
const removeOne = (
  cards: readonly CardClass[],
  cardClass: CardClass,
): CardClass[] => [
  ...cards.slice(0, cards.lastIndexOf(cardClass)),
  ...cards.slice(cards.lastIndexOf(cardClass) + 1),
];

// TODO 13: test
// TODO 13: make this remove the card class from the hand and make a Card
export const pickCard =
  (pickedCard: CardClass) =>
  ({ flow, ...rest }: GameState): GameState => ({
    ...rest,
    flow: {
      ...flow,
      subphase:
        // TODO 12: pickedCard.type
        pickedCard.type === CardType.Unit
          ? Subphase.Deploying
          : Subphase.Upgrading,
    },
    pickedCard,
  });

// TODO 12: test
// TODO 12: Make this just for upgrading
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
        ? { isUpgraded: true }
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

// TODO 12: test
// TODO 12: Make this just for deploying
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
        : // TODO 12: Append a unit instead of setting units
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
