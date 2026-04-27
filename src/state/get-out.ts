// oxlint-disable max-lines
import type {
  ActivationState,
  DeploymentState,
  GameState,
  UpgradeState,
} from '../state-types';
import {
  doesAnyPondLeafSatisfy,
  HOME,
  setPondStateAt,
  setPondStateWhere,
  type LeafState,
  type PondState,
} from '../state-types/pond';
import type { Card, LeafCard, UnitCard } from '../types/card';
import {
  Phase,
  Player,
  PLAYER_AFTER,
  Subphase,
  type Gameflow,
} from '../types/gameflow';
import type { Position } from '../types/position';

export type StateAction = (s: GameState) => GameState;
export type DataAction = (d: GameData) => GameState;

export type DataLift = (f: DataAction) => StateAction;
export const data: DataLift = f => old => f(gameData(old));

export type DataPick = (fn: (d: GameAccess) => StateAction) => StateAction;
export const pick: DataPick = fn => s => fn(gameData(s).get)(s);
export const never = (_: never) => (state: GameState) => state;

export type Chain = (...actions: readonly StateAction[]) => StateAction;
export const chain: Chain =
  (...actions) =>
  state =>
    actions.reduce((s, a) => a(s), state);

// Provides an interface for accessing state while maintaining invariants.
export type GameData = {
  readonly get: GameOut;
  readonly set: GameUpdate;
  readonly make: GameMake;
};

// oxlint-disable-next-line max-statements
const gameInvariants: GameInvariants = (s, get, { always, unless, iff }) => {
  always(get.leaf.at(HOME[Player.North]).isUpgraded);
  always(get.leaf.at(HOME[Player.South]).isUpgraded);

  iff(get.subphase === Subphase.Activating).must(!!s.activation);
  iff(get.subphase === Subphase.Deploying).must(!!s.deployment);
  iff(get.subphase === Subphase.Upgrading).must(!!s.upgrade);

  unless(get.phase === Phase.Main).must(get.subphase === Subphase.Idle);

  iff(get.phase === Phase.GameOver).must(!!s.winner);
  iff(s.winner === Player.North).must(
    get.leaf.at(HOME[Player.South]).controller === Player.North,
  );
  iff(s.winner === Player.South).must(
    get.leaf.at(HOME[Player.North]).controller === Player.South,
  );
};

export const gameData = (s: GameState): GameData => ({
  get: verifyAccess(s, gameInvariants, access(s)),
  set: update(s),
  make: make(s),
});

type GameOut = GameAccess & { readonly out: GameState };

// Accessors for convenience
export type GameAccess = {
  readonly flow: Gameflow;
  readonly player: Player;
  readonly phase: Phase;
  readonly subphase: Subphase;
  readonly pond: PondState;
  readonly leaf: {
    readonly at: (xy: Position) => LeafState;
    readonly exists: (p: (v: LeafState, xy: Position) => boolean) => boolean;
  };
  readonly upgrade: UpgradeState | undefined;
  readonly deployment: DeploymentState | undefined;
  readonly activation: ActivationState | undefined;
};

// Updaters which preserve simple invariants
export type GameUpdate = {
  readonly player: { readonly to: (x: Player) => GameData };
  readonly leaf: {
    readonly at: (x: Position) => {
      readonly to: (x: Partial<LeafState>) => GameData;
      readonly update: (x: (old: LeafState) => Partial<LeafState>) => GameData;
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
      readonly update: (x: (old: readonly Card[]) => Card[]) => GameData;
    };
  };
};

// Operations which need to touch multiple places to maintain invariants
type GameMake = {
  readonly idle: () => GameData;
  readonly activating: (x: ActivationState) => GameData;
  readonly winner: (x: Player) => GameData;
  readonly upgrading: (x: LeafCard) => GameData;
  readonly deploying: (x: UnitCard) => GameData;
};

const access: (s: GameState) => GameAccess = s => ({
  // TODO 12: Make PhaseTracker use this
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
    at({ x, y }) {
      return s.pond[y][x];
    },
    exists(p) {
      return doesAnyPondLeafSatisfy(s.pond, p);
    },
  },

  get upgrade() {
    return s.flow.subphase === Subphase.Upgrading ? s.upgrade : undefined;
  },
  get deployment() {
    return s.flow.subphase === Subphase.Deploying ? s.deployment : undefined;
  },
  get activation() {
    return s.flow.subphase === Subphase.Activating ? s.activation : undefined;
  },
});

const update: (s: GameState) => GameUpdate = s => ({
  player: { to: player => gameData({ ...s, flow: { ...s.flow, player } }) },

  leaf: {
    where: p => ({
      update: u => gameData({ ...s, pond: setPondStateWhere(s.pond, p, u) }),
    }),
    at: xy => ({
      to: v => gameData({ ...s, pond: setPondStateAt(s.pond, xy, v) }),
      update: u => gameData({ ...s, pond: setPondStateAt(s.pond, xy, u) }),
    }),
  },

  phase: {
    to: phase => gameData({ ...s, flow: { ...s.flow, phase } }),
  },

  hand: {
    of: x => ({
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

const make = (s: GameState): GameMake => ({
  idle: () =>
    gameData({
      ...s,
      flow: { ...s.flow, subphase: Subphase.Idle },
      upgrade: undefined,
      deployment: undefined,
      activation: undefined,
    }),

  upgrading: leaf =>
    gameData({
      ...s,
      flow: { ...s.flow, subphase: Subphase.Upgrading },
      upgrade: { leaf },
    }),

  deploying: unit =>
    gameData({
      ...s,
      flow: { ...s.flow, subphase: Subphase.Deploying },
      deployment: { unit },
    }),

  activating: activation =>
    gameData({
      ...s,
      flow: { ...s.flow, subphase: Subphase.Activating },
      activation,
    }),

  winner: winner =>
    gameData({
      ...s,
      flow: { ...s.flow, phase: Phase.GameOver },
      winner,
      pond: setPondStateAt(s.pond, HOME[PLAYER_AFTER[winner]], {
        controller: winner,
      }),
    }),
});

const verifyAccess = (
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

/////
// Invariants:

type GameInvariants = (
  s: GameState,
  access: GameAccess,
  checks: InvariantChecks,
) => void;

type InvariantChecks = {
  readonly always: (p: boolean) => void;
  readonly unless: (p: boolean) => {
    readonly must: (q: boolean) => void;
  };
  readonly iff: (p: boolean) => {
    readonly must: (q: boolean) => void;
  };
};

const invariantChecks: InvariantChecks = {
  always: p => assert(p),
  unless: p => ({
    must: q => assert(p || q),
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
