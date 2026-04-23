import { createContext, useRef, useState } from 'react';

import { commitActivate } from '../action/commit-activate';
import { createState, DEFAULT_GAME_STATE, type GameState } from '../state';
import { createUnit } from '../state-types/card';
import { setPondStateAt } from '../state-types/pond';
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
  readonly activate: (unit: UnitCard, position: Position) => void;
  readonly commitUpgrade: (_: Position) => void;
  readonly commitDeploy: (_: Position) => void;
  readonly commitActivate: (_: Position) => void;
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

export const DEFAULT_GAME_DISPATCH = {
  endPhase: () => {},
  pickCard: () => {},
  activate: () => {},
  commitUpgrade: () => {},
  commitDeploy: () => {},
  commitActivate: () => {},
};

// TODO 10: Unit test the context and default values
export const GameContext = createContext<GameContext>([
  DEFAULT_GAME_STATE,
  DEFAULT_GAME_DISPATCH,
]);

const createDispatch =
  (getDrawnCard: () => CardClass, getNextCardKey: () => number) =>
  (setState: (_: (_: GameState) => GameState) => void): GameDispatch => ({
    endPhase: () => setState(endPhase(getDrawnCard)),

    pickCard: (card: CardClass) => setState(pickCard(card)),

    activate: (unit: UnitCard, position: Position) =>
      setState(activate(unit, position)),

    commitUpgrade: (position: Position) =>
      setState(commitUpgrade(getNextCardKey)(position)),
    commitDeploy: (position: Position) =>
      setState(commitDeploy(getNextCardKey)(position)),
    commitActivate: (position: Position) => setState(commitActivate(position)),
  });

// TODO 11: test
// TODO 11: Remove the particular card
const removeOne = (
  cards: readonly CardClass[],
  cardClass: CardClass,
): CardClass[] => [
  ...cards.slice(0, cards.lastIndexOf(cardClass)),
  ...cards.slice(cards.lastIndexOf(cardClass) + 1),
];

// TODO 11: test
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

// TODO 10: test
// TODO 10: make this move the cardclass from the hand and make a Card
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

// TODO 11: test
const activate =
  (unit: UnitCard, position: Position) =>
  ({ flow, ...rest }: GameState): GameState => ({
    ...rest,
    flow: {
      ...flow,
      subphase: Subphase.Activating,
    },
    pickedCard: unit.cardClass,
    activation: { unit, start: position },
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
