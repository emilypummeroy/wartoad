import { createContext, useRef, useState } from 'react';

import { createUnit } from '../state/card';
import { INITIAL_POND, setPondStateAt, type PondState } from '../state/pond';
import {
  type CardClass,
  CardType,
  type UnitCard,
  UnitClass,
} from '../types/card';
import {
  Phase,
  PHASE_AFTER,
  Player,
  PLAYER_AFTER,
  Subphase,
  type Gameflow,
} from '../types/gameflow';
import { type Position } from '../types/position';

export type GameContext = readonly [GameState, GameDispatch];

export type GameDispatch = {
  readonly endPhase: () => void;
  // No different pickUnit, pickLeaf, etc.
  // The difference between activation and upgrading is not the concern of
  // Hand or Card.
  // TODO 11: Make it operate on a card instead of a card class
  readonly pickCard: (_: CardClass) => void;
  // TODO 10: onUpgrade, onDeploy,
  readonly placeCard: (_: Position) => void;
  readonly activate: (unit: UnitCard, position: Position) => void;
  // TODO 9: commitActivation(position)
  // - should move the pickedCard
  // - should unset pickedCard
  // - should unset activationState
};

export type GameState = {
  readonly flow: Gameflow;
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

export const useGameContextData = (
  getStartingHand: () => CardClass[],
  getDrawnCard: () => CardClass,
): GameContext => {
  const cardKey = useRef(0);
  const getNextCardKey = () => (cardKey.current += 1);
  const [state, setState] = useState<GameState>(createState(getStartingHand));
  const dispatch = createDispatch(getDrawnCard, getNextCardKey)(setState);
  return [state, dispatch];
};

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
  endPhase: () => {},
  pickCard: () => {},
  placeCard: () => {},
  activate: () => {},
};

// TODO 10: Unit test the context and default values
export const GameContext = createContext<GameContext>([
  DEFAULT_GAME_STATE,
  DEFAULT_GAME_DISPATCH,
]);

export const INITIAL_HAND_CARD_COUNT = 7;

const createDispatch =
  (getDrawnCard: () => CardClass, getNextCardKey: () => number) =>
  (setState: (_: (_: GameState) => GameState) => void): GameDispatch => ({
    endPhase: () => setState(endPhase(getDrawnCard)),

    pickCard: (card: CardClass) => setState(pickCard(card)),

    placeCard: (position: Position) =>
      setState(placeCard(getNextCardKey)(position)),

    activate: (unit: UnitCard, position: Position) =>
      setState(activate(unit, position)),
  });

const createState = (getStartingHand: () => CardClass[]) => ({
  ...DEFAULT_GAME_STATE,
  northHand: getStartingHand(),
  southHand: getStartingHand(),
});

// TODO 11: Remove the particular card
const removeOne = (
  cards: readonly CardClass[],
  cardClass: CardClass,
): CardClass[] => [
  ...cards.slice(0, cards.lastIndexOf(cardClass)),
  ...cards.slice(cards.lastIndexOf(cardClass) + 1),
];

const endPhase =
  (draw: () => CardClass) =>
  ({
    flow: { player, phase },
    northHand,
    southHand,
    ...rest
  }: GameState): GameState => ({
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

const pickCard =
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

const activate =
  (unit: UnitCard, position: Position) =>
  ({ flow, ...rest }: GameState): GameState => ({
    ...rest,
    flow: {
      ...flow,
      subphase: Subphase.Activation,
    },
    pickedCard: unit.cardClass,
    activationState: { start: position },
  });

const placeCard =
  (getNextCardKey: () => number) =>
  (position: Position) =>
  ({
    grid,
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
    grid: setPondStateAt(
      grid,
      position,
      subphase === Subphase.Upgrading
        ? // TODO 10: Make it create a card for leaves too
          { isUpgraded: true }
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
