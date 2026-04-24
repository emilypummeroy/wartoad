import type { Read } from '.';

export type Position = Read<{
  x: 0 | 1 | 2;
  y: 0 | 1 | 2 | 3 | 4 | 5;
}>;

export type UnsafePosition = Read<{
  x: number;
  y: number;
}>;

export const isPosition = (xy: UnsafePosition): xy is Position => {
  const { x, y } = xy;
  if (x !== 0 && x !== 1 && x !== 2) return false;
  if (y !== 0 && y !== 1 && y !== 2 && y !== 3 && y !== 4 && y !== 5)
    return false;
  ({ x, y }) satisfies Position;
  return true;
};

export const arePositionsEqual = (
  { x: x1, y: y1 }: Position,
  { x: x2, y: y2 }: Position,
) => x1 === x2 && y1 === y2;

export const distanceBetween = (
  { x: x1, y: y1 }: Position,
  { x: x2, y: y2 }: Position,
) => Math.abs(x1 - x2) + Math.abs(y1 - y2);
