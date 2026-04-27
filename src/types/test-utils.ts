import type { Player } from './gameflow';

export const _ = undefined;

export const counter = () => (count += 1);
counter.reset = () => (count = 0);
let count = 0;

export type SubphasePlayer = [
  upgrader?: Player,
  deployer?: Player,
  activator?: Player,
];
