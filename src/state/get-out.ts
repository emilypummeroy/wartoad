import type { ActivationState, GameState } from '../state-types';
import {
  HOME,
  setPondStateAt,
  setPondStateWhere,
  type LeafState,
  type PondState,
} from '../state-types/pond';
import type { Read } from '../types';
import type { CardClass } from '../types/card';
import { Phase, Player, Subphase, type Gameflow } from '../types/gameflow';
import type { Position } from '../types/position';

export type DataLift = (
  f: (data: GameData) => GameState,
) => (old: GameState) => GameState;

export const data: DataLift = f => old => f(gameData(old));

export type DataDrop = (
  fn: (d: GameAccess) => (s: GameState) => GameState,
) => (s: GameState) => GameState;

export const pick: DataDrop = fn => s => fn(gameData(s).get)(s);
export const never = (_: never) => (state: GameState) => state;

// Provides an interface for accessing state while maintaining invariants.
export type GameData = {
  readonly get: GameOut;
  readonly set: GameUpdate;
  readonly make: GameMake;
};

const gameInvariants: GameInvariants = (
  s,
  get,
  { always, unless, when, iff },
) => {
  always(get.leaf.at(HOME[Player.North]).isUpgraded);
  always(get.leaf.at(HOME[Player.South]).isUpgraded);

  when(get.subphase === Subphase.Idle).not(!!s.pickedCard);

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
  readonly flow: Gameflow;
  readonly player: Player;
  readonly phase: Phase;
  readonly subphase: Subphase;
  readonly pond: PondState;
  readonly leaf: { readonly at: (p: Position) => LeafState };
  // hand: { of: (p: Player) => Read<CardClass[]> };
  readonly activation?: ActivationState;
};

// Updaters which preserve simple invariants
export type GameUpdate = {
  readonly player: { readonly to: (x: Player) => GameData };
  // pond: {
  //   //  to: (x: Read<PondState>) => GameData
  // };
  readonly leaf: {
    readonly at: (x: Position) => {
      // to: (x: Read<Partial<LeafState>>) => GameData;
      readonly update: (
        x: (old: Read<LeafState>) => Partial<LeafState>,
      ) => GameData;
    };
    readonly where: (p: (v: LeafState, xy: Position) => boolean) => {
      readonly update: (
        u: (v: LeafState, xy: Position) => Partial<LeafState>,
      ) => GameData;
    };
  };

  readonly phase: { readonly to: (x: Phase) => GameData };
  readonly hand: {
    readonly of: (x: Player) => {
      // to: (x: readonly CardClass[]) => GameData;
      readonly update: (
        x: (old: readonly CardClass[]) => CardClass[],
      ) => GameData;
    };
  };
};

// Operations which need to touch multiple places to maintain invariants
type GameMake = {
  readonly idle: () => GameData;
  // deploying: (x: CardClass) => GameData;
  // upgrading: (x: CardClass) => GameData;
  readonly activating: (x: Read<ActivationState>) => GameData;
};

const gameAccess: (s: Read<GameState>) => GameAccess = s => ({
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

  // hand: {
  //   of(p: Player) {
  //     return p === Player.North ? s.northHand : s.southHand;
  //   },
  // },

  get activation() {
    return s.flow.subphase === Subphase.Activating ? s.activation : undefined;
  },
});

const gameUpdate: (s: Read<GameState>) => GameUpdate = s => ({
  player: { to: player => gameData({ ...s, flow: { ...s.flow, player } }) },

  leaf: {
    where: p => ({
      update: u => gameData({ ...s, pond: setPondStateWhere(s.pond, p, u) }),
    }),
    at: xy => ({
      update: u => gameData({ ...s, pond: setPondStateAt(s.pond, xy, u) }),
    }),
  },

  phase: {
    to: phase =>
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
  },

  hand: {
    of: x => ({
      // to: v =>
      //   gameData({
      //     ...s,
      //     ...(x === Player.North ? { northHand: v } : { southHand: v }),
      //   }),
      update: u =>
        gameData({
          ...s,
          ...(x === Player.North
            ? { northHand: u(s.northHand) }
            : { southHand: u(s.southHand) }),
        }),
    }),
  },
});

const gameMake = (s: GameState): GameMake => ({
  idle: () =>
    gameData({
      ...s,
      flow: { ...s.flow, subphase: Subphase.Idle },
      pickedCard: undefined,
      activation: undefined,
    }),
  // upgrading: pickedCard =>
  //   gameData({
  //     ...s,
  //     flow: { ...s.flow, subphase: Subphase.Upgrading },
  //     pickedCard,
  //     activation: undefined,
  //   }),
  // deploying: pickedCard =>
  //   gameData({
  //     ...s,
  //     flow: { ...s.flow, subphase: Subphase.Deploying },
  //     pickedCard,
  //     activation: undefined,
  //   }),
  activating: x =>
    gameData({
      ...s,
      flow: { ...s.flow, subphase: Subphase.Activating },
      pickedCard: undefined,
      activation: x,
    }),
});

/////
// Invariants:

type GameInvariants = (
  s: GameState,
  access: GameAccess,
  checks: InvariantChecks,
) => void;

type InvariantChecks = Read<{
  always: (p: boolean) => void;
  // never: (p: boolean) => void;
  when: (p: boolean) => {
    must: (q: boolean) => void;
    not: (q: boolean) => void;
  };
  unless: (p: boolean) => {
    must: (q: boolean) => void;
    // not: (q: boolean) => void;
  };
  iff: (p: boolean) => {
    must: (q: boolean) => void;
  };
}>;

const invariantChecks: InvariantChecks = {
  always: p => assert(p),
  // never: p => assert(!p),
  when: p => ({
    must: q => assert(!p || q),
    not: q => assert(!p || !q),
  }),
  unless: p => ({
    must: q => assert(p || q),
    // not: q => assert(p || !q),
  }),
  iff: p => ({ must: q => assert(p === q) }),
};

const assert = (i: boolean) => {
  if (!i) {
    const error = new Error('Invariant assertion failed');
    const frame = error.stack?.match(/[^\n]*[iI]nvariants[^\n]*/)?.[0];
    const fn = frame?.match(/\w*[iI]nvariants\w*/)?.[0];
    const place = frame?.match(/[^/]*.ts:\d*:\d*/)?.[0];
    error.stack = error.stack?.replace(/[\n][^\n]*assert[^\n]*\n/, '');
    error.message = `Invariant assertion failed: ${fn} ${place}`;
    throw error;
  }
};

type GameOut = GameAccess & { readonly out: GameState };
export const verifyAccess = (
  s: GameState,
  invariants: GameInvariants,
  access: GameAccess,
): GameOut => {
  invariants(s, access, invariantChecks);
  return {
    ...access,
    get out() {
      return s;
    },
  };
};
