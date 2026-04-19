import { createContext } from 'react';

import { DETERMINISTIC_STARTING_HAND } from '../state/card';
import { INITIAL_POND, type PondState } from '../state/pond';
import type { CardClass } from '../types/card-class';
import { Phase, Player, Subphase, type FlowState } from '../types/gameflow';
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

const shuffled: <T>(cards: readonly T[]) => T[] = cards => {
  const source = [...cards];
  const result = [];
  while (source.length > 0) {
    result.push(source.splice(Math.floor(Math.random() * source.length), 1)[0]);
  }
  return result;
};

export const shuffledDeterministicStartingHand = () =>
  shuffled(DETERMINISTIC_STARTING_HAND);

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
