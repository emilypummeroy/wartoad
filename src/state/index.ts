import { DETERMINISTIC_STARTING_HAND } from '../state-types/card';
import {
  INITIAL_POND,
  setPondStateAt,
  type LeafState,
  type PondState,
} from '../state-types/pond';
import type { CardClass, UnitCard } from '../types/card';
import { Phase, Player, Subphase, type Gameflow } from '../types/gameflow';
import type { Position } from '../types/position';

export type GameState = Readonly<{
  flow: Gameflow;
  pond: PondState;
  // TODO 11: Card[]
  northHand: readonly CardClass[];
  // TODO 11: Card[]
  southHand: readonly CardClass[];
  // TODO 11: Card
  pickedCard?: CardClass;
  activation?: ActivationState;
}>;

export type ActivationState = Readonly<{
  start: Position;
  unit: UnitCard;
}>;

// Provides an interface for accessing state while maintaining invariants.
export type GameData = Readonly<{
  get: GameAccess;
  set: GameUpdate;
  make: GameMake;
}>;

export const gameData = (s: GameState): GameData => ({
  get: gameAccess(s),
  set: gameUpdate(s),
  make: gameMake(s),
});

export const DEFAULT_GAME_STATE = {
  flow: {
    phase: Phase.Main,
    player: Player.South,
    subphase: Subphase.Idle,
  },
  pond: INITIAL_POND,
  northHand: DETERMINISTIC_STARTING_HAND,
  southHand: DETERMINISTIC_STARTING_HAND,
} as const;

export const INITIAL_HAND_CARD_COUNT = 7;

// TODO 11: test
export const createState = (getStartingHand: () => CardClass[]) => ({
  ...DEFAULT_GAME_STATE,
  northHand: getStartingHand(),
  southHand: getStartingHand(),
});

// Accessors for convenience
export type GameAccess = Readonly<{
  flow: Gameflow;
  player: Player;
  phase: Phase;
  subphase: Subphase;

  pond: PondState;
  leaf: { at: (p: Position) => LeafState };

  hand: { of: (p: Player) => readonly CardClass[] };

  activation?: ActivationState;

  out: GameState;
}>;

// Updaters which preserve simple invariants
export type GameUpdate = Readonly<{
  player: { to: (x: Player) => GameData };

  pond: { to: (x: PondState) => GameData };
  leaf: {
    at: (x: Position) => {
      to: (x: Partial<LeafState>) => GameData;
      by: (x: (old: LeafState) => Partial<LeafState>) => GameData;
    };
  };

  hand: {
    of: (x: Player) => {
      to: (x: readonly CardClass[]) => GameData;
      by: (x: (old: readonly CardClass[]) => CardClass[]) => GameData;
    };
  };
}>;

type GameMake = Readonly<{
  idle: () => GameData;
  deploying: (x: CardClass) => GameData;
  upgrading: (x: CardClass) => GameData;
  activating: (x: ActivationState) => GameData;
  phase: (x: Phase) => GameData;
}>;

// TODO 10: Try make this a class instead
const gameUpdate: (s: GameState) => GameUpdate = s => ({
  player: { to: player => gameData({ ...s, flow: { ...s.flow, player } }) },

  pond: { to: pond => gameData({ ...s, pond }) },
  leaf: {
    at: x => ({
      to: v => gameData({ ...s, pond: setPondStateAt(s.pond, x, v) }),
      by: u => gameData({ ...s, pond: setPondStateAt(s.pond, x, u) }),
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

// TODO 10: Try make this a class instead
const gameMake = (s: GameState): GameMake => ({
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
      pickedCard: x.unit.cardClass,
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

// TODO 10: Try make this a class instead
const gameAccess: (s: GameState) => GameAccess = s => ({
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
    at({ x, y }: Position) {
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

  get out() {
    return s;
  },
});
