import { isPosition, type Position, type UnsafePosition } from './position';

export const asPosition = (xy: UnsafePosition): Position => {
  assert(isPosition(xy));
  return xy;
};
