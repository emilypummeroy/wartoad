import type { CardClass, UnitCard } from '../types/card';
import type { Gameflow } from '../types/gameflow';
import type { Position } from '../types/position';
import type { PondState } from './pond';

export type GameState = {
  readonly flow: Gameflow;
  readonly pond: PondState;
  // TODO 11: Card[]
  readonly northHand: readonly CardClass[];
  // TODO 11: Card[]
  readonly southHand: readonly CardClass[];
  // TODO 11: Card
  readonly pickedCard?: CardClass;
  readonly activation?: ActivationState;
};

export type ActivationState = {
  readonly start: Position;
  readonly unit: UnitCard;
};
