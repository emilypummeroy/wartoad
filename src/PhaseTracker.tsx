const _Phase = {
  Start: 'Start',
  Main: 'Main',
  End: 'End',
} as const;
export const Phase = {
  ..._Phase,
  AFTER: {
    [_Phase.Start]: _Phase.Main,
    [_Phase.Main]: _Phase.End,
    [_Phase.End]: _Phase.Start,
  },
} as const;
export type Phase = (typeof _Phase)[keyof typeof _Phase];

const _Player = {
  South: 'South',
  North: 'North',
} as const;
export const Player = {
  ..._Player,
  STYLES: {
    [_Player.North]: 'north',
    [_Player.South]: 'south',
  },
  AFTER: {
    [_Player.North]: _Player.South,
    [_Player.South]: _Player.North,
  },
} as const;
export type Player = (typeof _Player)[keyof typeof _Player];

export const Subphase = {
  Idle: 'Idle',
  Placing: 'Placing',
} as const;
export type Subphase = (typeof Subphase)[keyof typeof Subphase];

export type FlowState = {
  readonly player: Player;
  readonly phase: Phase;
  readonly subphase: Subphase;
};
