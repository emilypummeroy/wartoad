export type { Read } from './read';

export const noop = (..._: readonly unknown[]) => {};
export const identity = <T>(x: T) => x;

export const shuffled: <T>(cards: readonly T[]) => T[] = cards => {
  const source = [...cards];
  const result = [];
  while (source.length > 0) {
    result.push(source.splice(Math.floor(Math.random() * source.length), 1)[0]);
  }
  return result;
};
