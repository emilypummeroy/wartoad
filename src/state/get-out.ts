import type { ActivationState, GameState } from '../state-types';
import {
  HOME,
  setPondStateAt,
  type LeafState,
  type PondState,
} from '../state-types/pond';
import type { Read } from '../types';
import type { CardClass } from '../types/card';
import { Phase, Player, Subphase, type Gameflow } from '../types/gameflow';
import type { Position } from '../types/position';

export type DataLift = (
  f: (data: Read<GameData>) => GameState,
) => (old: GameState) => GameState;

export const data: DataLift = f => old => f(gameData(old));

// Provides an interface for accessing state while maintaining invariants.
export type GameData = {
  get: GameAccess;
  set: GameUpdate;
  make: GameMake;
};

const gameInvariants: GameInvariants = (
  s,
  get,
  { always, unless, when, iff },
) => {
  always(get.leaf.at(HOME[Player.North]).isUpgraded);
  always(get.leaf.at(HOME[Player.South]).isUpgraded);

  when(get.subphase === Subphase.Idle).not(!!s.pickedCard);
  when(get.subphase === Subphase.Idle).not(!!s.activation);

  iff(get.subphase === Subphase.Activating).must(!!s.activation);
  when(get.subphase === Subphase.Activating).not(!!s.pickedCard);

  when(get.subphase === Subphase.Upgrading).must(!!s.pickedCard);
  when(get.subphase === Subphase.Deploying).must(!!s.pickedCard);

  unless(get.phase === Phase.Main).must(get.subphase === Subphase.Idle);
};

export const gameData = (s: GameState): GameData => ({
  get: verifyAccess(s, gameInvariants, gameAccess(s)),
  set: gameUpdate(s),
  make: gameMake(s),
});

// Accessors for convenience
export type GameAccess = {
  out: GameState;
  flow: Gameflow;
  player: Player;
  phase: Phase;
  subphase: Subphase;
  pond: Read<PondState>;
  leaf: { at: (p: Read<Position>) => Read<LeafState> };
  hand: { of: (p: Player) => Read<CardClass[]> };
  activation?: ActivationState;
};

// Updaters which preserve simple invariants
export type GameUpdate = {
  player: { to: (x: Player) => GameData };
  pond: { to: (x: Read<PondState>) => GameData };
  leaf: {
    at: (x: Position) => {
      to: (x: Read<Partial<LeafState>>) => GameData;
      by: (x: (old: Read<LeafState>) => Partial<LeafState>) => GameData;
    };
  };
  hand: {
    of: (x: Player) => {
      to: (x: readonly CardClass[]) => GameData;
      by: (x: (old: readonly CardClass[]) => CardClass[]) => GameData;
    };
  };
};

// Operations which need to touch multiple places to maintain invariants
type GameMake = {
  idle: () => GameData;
  deploying: (x: CardClass) => GameData;
  upgrading: (x: CardClass) => GameData;
  activating: (x: Read<ActivationState>) => GameData;
  phase: (x: Phase) => GameData;
};

const gameAccess: (s: Read<GameState>) => GameAccessInner = s => ({
  get flow() {
    return s.flow;
  },
  get player() {
    return s.flow.player;
  },
  get phase() {
    return s.flow.phase;
  },
  get subphase() {
    return s.flow.subphase;
  },

  get pond() {
    return s.pond;
  },
  leaf: {
    at({ x, y }: Read<Position>) {
      return s.pond[y][x];
    },
  },

  hand: {
    of(p: Player) {
      return p === Player.North ? s.northHand : s.southHand;
    },
  },

  get activation() {
    return s.flow.subphase === Subphase.Activating ? s.activation : undefined;
  },
});

const gameUpdate: (s: Read<GameState>) => GameUpdate = s => ({
  player: { to: player => gameData({ ...s, flow: { ...s.flow, player } }) },
  pond: { to: pond => gameData({ ...s, pond }) },

  leaf: {
    at: xy => ({
      to: v => gameData({ ...s, pond: setPondStateAt(s.pond, xy, v) }),
      by: u => gameData({ ...s, pond: setPondStateAt(s.pond, xy, u) }),
    }),
  },

  hand: {
    of: x => ({
      to: v =>
        gameData({
          ...s,
          ...(x === Player.North ? { northHand: v } : { southHand: v }),
        }),
      by: u =>
        gameData({
          ...s,
          ...(x === Player.North
            ? { northHand: u(s.northHand) }
            : { southHand: u(s.southHand) }),
        }),
    }),
  },
});

const gameMake = (s: Read<GameState>): GameMake => ({
  idle: () =>
    gameData({
      ...s,
      flow: { ...s.flow, subphase: Subphase.Idle },
      pickedCard: undefined,
      activation: undefined,
    }),
  upgrading: pickedCard =>
    gameData({
      ...s,
      flow: { ...s.flow, subphase: Subphase.Upgrading },
      pickedCard,
      activation: undefined,
    }),
  deploying: pickedCard =>
    gameData({
      ...s,
      flow: { ...s.flow, subphase: Subphase.Deploying },
      pickedCard,
      activation: undefined,
    }),
  activating: x =>
    gameData({
      ...s,
      flow: { ...s.flow, subphase: Subphase.Activating },
      pickedCard: undefined,
      activation: x,
    }),
  phase: phase =>
    gameData(
      phase === Phase.Main
        ? { ...s, flow: { ...s.flow, phase } }
        : {
            ...s,
            flow: { ...s.flow, phase, subphase: Subphase.Idle },
            activation: undefined,
            pickedCard: undefined,
          },
    ),
});

/////
// Invariants:

type GameInvariants = (
  s: GameState,
  access: Read<GameAccessInner>,
  checks: Read<InvariantChecks>,
) => void;

type InvariantChecks = {
  always: (p: boolean) => void;
  never: (p: boolean) => void;
  when: (p: boolean) => {
    must: (q: boolean) => void;
    not: (q: boolean) => void;
  };
  unless: (p: boolean) => {
    must: (q: boolean) => void;
    not: (q: boolean) => void;
  };
  iff: (p: boolean) => {
    must: (q: boolean) => void;
  };
};

const invariantChecks: InvariantChecks = {
  always: p => assert(p),
  never: p => assert(!p),
  when: p => ({
    must: q => assert(!p || q),
    not: q => assert(!p || !q),
  }),
  unless: p => ({
    must: q => assert(p || q),
    not: q => assert(p || !q),
  }),
  iff: p => ({ must: q => assert(p === q) }),
};

const assert = (i: boolean) => {
  console.assert(i);
  if (!i) {
    const error = new Error('Invariant assertion failed');
    const line = error.stack?.match(/[^\n]*invariants[^\n]*/)?.[0];
    error.message = `Invariant assertion failed: ${line}`;
    throw error;
  }
};

export const verifyAccess = (
  s: GameState,
  invariants: GameInvariants,
  access: Read<GameAccessInner>,
): GameAccess => {
  invariants(s, access, invariantChecks);
  return {
    ...access,
    get out() {
      return s;
    },
  };
};

type GameAccessInner = Omit<GameAccess, 'out'>;
