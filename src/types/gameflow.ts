export type Gameflow = {
  readonly player: Player;
  readonly phase: Phase;
};

// TODO 25 ActivationStep of an Activation e.g. moving vs attacking
export type Phase = (typeof Phase)[keyof typeof Phase];
export type Player = (typeof Player)[keyof typeof Player];

export const Phase = {
  Start: 'Start',
  Main: 'Main',
  End: 'End',
  GameOver: 'GameOver',
  Upgrading: 'Upgrading',
  Deploying: 'Deploying',
  Activating: 'Activating',
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
