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
  setAllUnits,
  setPondStateAt,
  setPondStateWhere,
  type PondLeafState,
  type PondState,
} from '../state-types/pond';
import type { CardState, LeafState, UnitState } from '../types/card';
import { Phase, Player, PLAYER_AFTER } from '../types/gameflow';
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
const gameInvariants: GameInvariants = (s, get, { always, iff }) => {
  always(!!get.leaf.at(HOME[Player.North]).leaf);
  always(!!get.leaf.at(HOME[Player.South]).leaf);

  iff(get.phase === Phase.Activating).must(!!s.activation);
  iff(get.phase === Phase.Deploying).must(!!s.deployment);
  iff(get.phase === Phase.Upgrading).must(!!s.upgrade);

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
  readonly player: Player;
  readonly phase: Phase;
  readonly pond: PondState;
  readonly leaf: {
    readonly at: (xy: Position) => PondLeafState;
    readonly exists: (
      p: (v: PondLeafState, xy: Position) => boolean,
    ) => boolean;
  };
  readonly upgrade: UpgradeState | undefined;
  readonly deployment: DeploymentState | undefined;
  readonly activation: ActivationState | undefined;
};

// Updaters which preserve simple invariants
export type GameUpdate = {
  readonly leaf: {
    readonly at: (x: Position) => {
      readonly to: (x: Partial<PondLeafState>) => GameData;
      readonly update: (
        x: (old: PondLeafState) => Partial<PondLeafState>,
      ) => GameData;
    };
    readonly where: (p: (v: PondLeafState, xy: Position) => boolean) => {
      readonly update: (
        u: (v: PondLeafState, xy: Position) => Partial<PondLeafState>,
      ) => GameData;
    };
  };

  readonly units: {
    readonly everywhere: {
      readonly update: (x: (old: UnitState) => Partial<UnitState>) => GameData;
    };
  };

  readonly funds: {
    readonly of: (x: Player) => {
      readonly to: (x: number) => GameData;
    };
  };

  readonly hand: {
    readonly of: (x: Player) => {
      readonly update: (
        x: (old: readonly CardState[]) => CardState[],
      ) => GameData;
    };
  };
};

// Operations which need to touch multiple places to maintain invariants
type GameMake = {
  readonly nextTurn: () => GameData;
  readonly mainPhase: () => GameData;
  readonly endPhase: () => GameData;
  readonly winner: (x: Player) => GameData;

  readonly idle: () => GameData;
  readonly activating: (x: ActivationState) => GameData;
  readonly upgrading: (x: LeafState) => GameData;
  readonly deploying: (x: UnitState) => GameData;
};

const access: (s: GameState) => GameAccess = s => ({
  get player() {
    return s.flow.player;
  },
  get phase() {
    return s.flow.phase;
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
    return s.flow.phase === Phase.Upgrading ? s.upgrade : undefined;
  },
  get deployment() {
    return s.flow.phase === Phase.Deploying ? s.deployment : undefined;
  },
  get activation() {
    return s.flow.phase === Phase.Activating ? s.activation : undefined;
  },
});

const update: (s: GameState) => GameUpdate = s => ({
  leaf: {
    where: p => ({
      update: u => gameData({ ...s, pond: setPondStateWhere(s.pond, p, u) }),
    }),
    at: xy => ({
      to: v => gameData({ ...s, pond: setPondStateAt(s.pond, xy, v) }),
      update: u => gameData({ ...s, pond: setPondStateAt(s.pond, xy, u) }),
    }),
  },

  units: {
    everywhere: {
      update: u => gameData({ ...s, pond: setAllUnits(s.pond, u) }),
    },
  },

  funds: {
    of: x => ({
      to: v =>
        gameData({
          ...s,
          ...(x === Player.North ? { northFunds: v } : { southFunds: v }),
        }),
    }),
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

// oxlint-disable-next-line max-lines-per-function
const make = (s: GameState): GameMake => ({
  nextTurn: () =>
    gameData({
      ...s,
      flow: {
        ...s.flow,
        phase: Phase.Start,
        player: PLAYER_AFTER[s.flow.player],
      },
    }),

  mainPhase: () =>
    gameData({
      ...s,
      flow: { ...s.flow, phase: Phase.Main },
    }),

  endPhase: () =>
    gameData({
      ...s,
      flow: { ...s.flow, phase: Phase.End },
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

  idle: () =>
    gameData({
      ...s,
      flow: { ...s.flow, phase: Phase.Main },
      upgrade: undefined,
      deployment: undefined,
      activation: undefined,
    }),

  upgrading: leaf =>
    gameData({
      ...s,
      flow: {
        ...s.flow,
        phase: Phase.Upgrading,
      },
      upgrade: { leaf },
    }),

  deploying: unit =>
    gameData({
      ...s,
      flow: {
        ...s.flow,
        phase: Phase.Deploying,
      },
      deployment: { unit },
    }),

  activating: activation =>
    gameData({
      ...s,
      flow: {
        ...s.flow,
        phase: Phase.Activating,
      },
      activation,
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
  // oxlint-disable-next-line capitalized-comments
  // readonly when: (p: boolean) => {
  //   must: (p: boolean) => void;
  // };
  // readonly unless: (p: boolean) => {
  //   readonly must: (q: boolean) => void;
  // };
  readonly iff: (p: boolean) => {
    readonly must: (q: boolean) => void;
  };
};

const invariantChecks: InvariantChecks = {
  always: p => assert(p),
  // oxlint-disable-next-line capitalized-comments
  // when: p => ({
  //   must: q => assert(!p || q),
  // }),
  // unless: p => ({
  //   must: q => assert(p || q),
  // }),
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
