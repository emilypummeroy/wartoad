import { type Card, type UnitCard } from '../types/card';
import type { Position } from '../types/position';

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
  pickCard: (_: Card) => void;
  activate: (unit: UnitCard, position: Position) => void;
  commitUpgrade: (_: Position) => void;
  commitDeployment: (_: Position) => void;
  commitActivation: (_: Position) => void;
};

export const DEFAULT_GAME_ACTIONS: GameActions = {
  finishPhase: () => {},
  pickCard: () => {},
  activate: () => {},
  commitUpgrade: () => {},
  commitDeployment: () => {},
  commitActivation: () => {},
};
