export type Position = {
  readonly x: number;
  readonly y: number;
};

export const positionsAreEqual = (
  { x: x1, y: y1 }: Position,
  { x: x2, y: y2 }: Position,
) => x1 === x2 && y1 === y2;

export const distanceBetween = (
  { x: x1, y: y1 }: Position,
  { x: x2, y: y2 }: Position,
) => Math.abs(x1 - x2) + Math.abs(y1 - y2);
