import { noop } from '@/types';
import { type CardState, type UnitState } from '@/types/card';
import type { Position } from '@/types/position';

export { activate } from './activate';
export { commitActivation } from './commit-activation';
export { commitDeployment } from './commit-deployment';
export { commitUpgrade } from './commit-upgrade';
export { pickCard } from './pick-card';
export { finishPhase } from './finish-phase';

export type GameActions = {
  finishPhase: () => void;
  // No different pickUnit, pickLeaf, etc.
  // The difference between activation and upgrading is not the concern of
  // Hand or Card.
  pickCard: (_: CardState) => void;
  activate: (unit: UnitState, position: Position) => void;
  commitUpgrade: (_: Position) => void;
  commitDeployment: (_: Position) => void;
  commitActivation: (_: Position) => void;
  cancelActivePhase: () => void;
};

export const DEFAULT_GAME_ACTIONS: GameActions = {
  finishPhase: noop,
  pickCard: noop,
  activate: noop,
  commitUpgrade: noop,
  commitDeployment: noop,
  commitActivation: noop,
  cancelActivePhase: noop,
};
