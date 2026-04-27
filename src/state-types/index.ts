import type { CardClass, LeafCard, UnitCard } from '../types/card';
import type { Gameflow, Player } from '../types/gameflow';
import type { Position } from '../types/position';
import type { PondState } from './pond';

export type GameState = {
  readonly flow: Gameflow;
  readonly pond: PondState;
  // TODO 11: Card[]
  readonly northHand: readonly CardClass[];
  // TODO 11: Card[]
  readonly southHand: readonly CardClass[];
  readonly activation?: ActivationState;
  readonly deployment?: DeploymentState;
  readonly upgrade?: UpgradeState;
  readonly winner?: Player;
};

export type ActivationState = {
  readonly start: Position;
  readonly unit: UnitCard;
};

export type DeploymentState = {
  readonly unit: UnitCard;
};

export type UpgradeState = {
  readonly leaf: LeafCard;
};
