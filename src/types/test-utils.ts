import type { Player } from './gameflow';

export const _ = undefined;

export const counter = () => (count += 1);
counter.reset = () => (count = 0);
let count = 0;

export type PhasePlayer = [
  upgrader?: Player,
  deployer?: Player,
  activator?: Player,
];

export const partial: <T>(x: T) => Partial<T> = x => x;
