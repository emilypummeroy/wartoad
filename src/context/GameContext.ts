import { createContext } from 'react';

import { createUnit } from '../state/card';
import { INITIAL_POND, setPondStateAt, type PondState } from '../state/pond';
import { type CardClass, CardType, UnitClass } from '../types/card-class';
import {
  Phase,
  PHASE_AFTER,
  Player,
  PLAYER_AFTER,
  Subphase,
  type FlowState,
} from '../types/gameflow';
import { type Position } from '../types/position';

export type GameContext = readonly [
  state: GameState,
  dispatch: {
    readonly endPhase: () => void;
    // No different pickUnit, pickLeaf, etc.
    // The difference between activation and upgrading is not the concern of
    // Hand or Card.
    // TODO 11: Make it operate on a card instead of a card class
    readonly pickCard: (_: CardClass) => void;
    // TODO 10: onUpgrade, onDeploy,
    readonly placeCard: (_: Position) => void;
    // TODO 9: activate(card, position)
    // - should set pickedCard
    // - should set activationState
    // TODO 9: commitActivation(position)
    // - should move the pickedCard
    // - should unset pickedCard
    // - should unset activationState
  },
];

export type GameState = {
  readonly flow: FlowState;
  readonly grid: PondState;
  // TODO 11: Card[]
  readonly northHand: readonly CardClass[];
  // TODO 11: Card[]
  readonly southHand: readonly CardClass[];
  // TODO 11: Card
  readonly pickedCard?: CardClass;
  readonly activationState?: {
    readonly start: Position;
  };
};

const NOOP = () => {};

export const DEFAULT_GAME_STATE = {
  flow: {
    phase: Phase.Main,
    player: Player.South,
    subphase: Subphase.Idle,
  },
  grid: INITIAL_POND,
  northHand: [],
  southHand: [],
};

export const DEFAULT_GAME_DISPATCH = {
  endPhase: NOOP,
  pickCard: NOOP,
  placeCard: NOOP,
};

// TODO 10: Unit test the context and default values
export const GameContext = createContext<GameContext>([
  DEFAULT_GAME_STATE,
  DEFAULT_GAME_DISPATCH,
]);

export const INITIAL_HAND_CARD_COUNT = 7;

// TODO 11: Remove the particular card
const removeOne = (cards: readonly CardClass[], cardClass: CardClass) => [
  ...cards.slice(0, cards.lastIndexOf(cardClass)),
  ...cards.slice(cards.lastIndexOf(cardClass) + 1),
];

export const endPhase =
  (draw: () => CardClass) =>
  ({ flow: { player, phase }, northHand, southHand, ...rest }: GameState) => ({
    ...rest,
    flow: {
      player: phase === Phase.End ? PLAYER_AFTER[player] : player,
      phase: PHASE_AFTER[phase],
      subphase: Subphase.Idle,
    },
    // TODO 11: Extract to draw function
    northHand:
      PHASE_AFTER[phase] === Phase.Start &&
      PLAYER_AFTER[player] === Player.North
        ? [...northHand, draw()]
        : northHand,
    // TODO 11: Extract to draw function
    southHand:
      PHASE_AFTER[phase] === Phase.Start &&
      PLAYER_AFTER[player] === Player.South
        ? [...southHand, draw()]
        : southHand,
  });

export const pickCard =
  (pickedCard: CardClass) =>
  ({ flow, ...rest }: GameState) => ({
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

export const placeCard =
  (getNextCardKey: () => number) =>
  (position: Position) =>
  ({
    grid,
    grid: {
      [position.y]: {
        [position.x]: { isUpgraded, units },
      },
    },
    flow,
    flow: { subphase, player },
    northHand,
    southHand,
    pickedCard,
  }: GameState) => ({
    flow: { ...flow, subphase: Subphase.Idle },
    northHand:
      player === Player.North && pickedCard && northHand.length > 0
        ? removeOne(northHand, pickedCard)
        : northHand,
    southHand:
      player === Player.South && pickedCard && southHand.length > 0
        ? removeOne(southHand, pickedCard)
        : southHand,
    grid: setPondStateAt(
      grid,
      position,
      subphase === Subphase.Upgrading
        ? // TODO 10: Make it create a card for leaves too
          { units, isUpgraded: true }
        : {
            isUpgraded,
            units: [
              ...units,
              createUnit({
                cardClass: UnitClass.Froglet,
                owner: player,
                key: getNextCardKey(),
              }),
            ],
          },
    ),
  });
