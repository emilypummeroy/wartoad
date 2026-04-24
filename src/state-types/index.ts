import type { Read } from '../types';
import type { CardClass, UnitCard } from '../types/card';
import type { Gameflow } from '../types/gameflow';
import type { Position } from '../types/position';
import type { PondState } from './pond';

export type GameState = Read<{
  flow: Gameflow;
  pond: PondState;
  // TODO 11: Card[]
  northHand: CardClass[];
  // TODO 11: Card[]
  southHand: CardClass[];
  // TODO 11: Card
  pickedCard?: CardClass;
  activation?: ActivationState;
}>;

export type ActivationState = {
  start: Position;
  unit: UnitCard;
};
