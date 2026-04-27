import type { Card, LeafCard, UnitCard } from '../types/card';
import type { Gameflow, Player } from '../types/gameflow';
import type { Position } from '../types/position';
import type { PondState } from './pond';

export type GameState = {
  readonly flow: Gameflow;
  readonly pond: PondState;
  readonly northHand: readonly Card[];
  readonly southHand: readonly Card[];
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
