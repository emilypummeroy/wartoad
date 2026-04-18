import { StepForward } from 'lucide-react';

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
  Upgrading: 'Upgrading',
  Deploying: 'Deploying',
  Activating: 'Activating',
} as const;
export type Subphase = (typeof Subphase)[keyof typeof Subphase];

export type FlowState = {
  readonly player: Player;
  readonly phase: Phase;
  readonly subphase: Subphase;
};

export function PhaseTracker({
  flow: { player, phase, subphase },
  onNextPhaseClicked,
}: {
  readonly flow: FlowState;
  readonly onNextPhaseClicked: () => void;
}) {
  return (
    <section aria-labelledby="current-phase" className="phases">
      <h3 id="current-phase">
        <span className={player === Player.North ? 'north' : 'south'}>
          {player}
        </span>
        : <span className="accent">{phase}</span> phase
      </h3>
      <button
        className="icon-text accent"
        disabled={subphase !== Subphase.Idle}
        onClick={onNextPhaseClicked}
      >
        <StepForward />
        Next phase
      </button>
    </section>
  );
}
