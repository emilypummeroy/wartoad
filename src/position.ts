import { Player } from './PhaseTracker';

export const ROW_COUNT = 6 as const;

export type Position = {
  readonly x: number;
  readonly y: number;
};

// TODO 9: Implement distance calculation as well.
export const positionsAreEqual = (
  { x: x1, y: y1 }: Position,
  { x: x2, y: y2 }: Position,
) => x1 === x2 && y1 === y2;

export const HOME = {
  [Player.North]: { x: 1, y: 0 },
  [Player.South]: { x: 1, y: ROW_COUNT - 1 },
};
