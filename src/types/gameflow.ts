export type Gameflow = {
  readonly player: Player;
  readonly phase: Phase;
  readonly subphase: Subphase;
};

// TODO 25 ActivationStep
export type Phase = (typeof Phase)[keyof typeof Phase];
export type Player = (typeof Player)[keyof typeof Player];
export type Subphase = (typeof Subphase)[keyof typeof Subphase];

export const Phase = {
  Start: 'Start',
  Main: 'Main',
  End: 'End',
} as const;

export const PHASE_AFTER = {
  [Phase.Start]: Phase.Main,
  [Phase.Main]: Phase.End,
  [Phase.End]: Phase.Start,
} as const;

export const Player = {
  South: 'South',
  North: 'North',
} as const;

export const PLAYER_CLASSNAME = {
  [Player.North]: 'north',
  [Player.South]: 'south',
} as const;

export const PLAYER_AFTER = {
  [Player.North]: Player.South,
  [Player.South]: Player.North,
} as const;

export const Subphase = {
  Idle: 'Idle',
  Upgrading: 'Upgrading',
  Deploying: 'Deploying',
  Activation: 'Activating',
} as const;
