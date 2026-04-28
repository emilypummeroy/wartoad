export type { Read } from './read';

export const noop = (..._: readonly unknown[]) => {};
export const identity = <T>(x: T) => x;
