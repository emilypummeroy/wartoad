import type { CardState, LeafState, UnitState } from '../types/card';
import type { Gameflow, Player } from '../types/gameflow';
import type { Position } from '../types/position';
import type { PondState } from './pond';

export type GameState = {
  readonly flow: Gameflow;
  readonly pond: PondState;
  readonly northHand: readonly CardState[];
  readonly southHand: readonly CardState[];
  readonly northFunds: number;
  readonly southFunds: number;
  readonly northDeck: readonly CardState[];
  readonly southDeck: readonly CardState[];
  readonly activation: ActivationState | undefined;
  readonly deployment: DeploymentState | undefined;
  readonly upgrade: UpgradeState | undefined;
  readonly winner: Player | undefined;
};

export type ActivationState = {
  readonly start: Position;
  readonly unit: UnitState;
};

export type DeploymentState = {
  readonly unit: UnitState;
};

export type UpgradeState = {
  readonly leaf: LeafState;
};
