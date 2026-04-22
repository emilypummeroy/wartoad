import { Replace, Move } from 'lucide-react';
import { useContext, useId, type ReactNode } from 'react';

import { GameContext } from '../context/GameContext';
import { getPondStateAt, HOME, type PondState } from '../state/pond';
import {
  Phase,
  PLAYER_CLASSNAME,
  Subphase,
  type Player,
} from '../types/gameflow';
import { distanceBetween, type Position } from '../types/position';

type PondLeafDropzoneContext = readonly [
  {
    readonly pond: PondState;
    readonly flow: {
      subphase: Subphase;
      phase: Phase;
      player: Player;
    };
    readonly activation?: { start: Position };
  },
  {
    commitUpgrade: (target: Position) => void;
    commitDeploy: (on: Position) => void;
    commitActivate: (end: Position) => void;
  },
];

type PondLeafDropzoneProps = {
  readonly children: ReactNode;
  readonly targetLabelId: string;
  readonly position: Position;
  readonly controller: Player;
};
export function PondLeafDropzone({
  children,
  targetLabelId,
  position,
  controller,
}: PondLeafDropzoneProps) {
  const [
    {
      flow: { player, phase, subphase },
      activation,
      pond,
    },
    { commitUpgrade, commitDeploy, commitActivate },
  ]: PondLeafDropzoneContext = useContext(GameContext);
  const { isUpgraded } = getPondStateAt(pond, position);
  const dropzoneId = useId();

  const isDropzone =
    phase === Phase.Main &&
    {
      [Subphase.Idle]: false,
      [Subphase.Upgrading]: player === controller && !isUpgraded,
      [Subphase.Deploying]: position.y === HOME[player].y,
      [Subphase.Activating]:
        distanceBetween(position, activation?.start ?? position) <= 1,
    }[subphase];

  const handleClick = {
    [Subphase.Idle]: () => {},
    [Subphase.Upgrading]: () => commitUpgrade(position),
    [Subphase.Deploying]: () => commitDeploy(position),
    [Subphase.Activating]: () => commitActivate(position),
  }[subphase];

  const dropzoneVerb = {
    [Subphase.Idle]: '',
    [Subphase.Upgrading]: 'Upgrade',
    [Subphase.Deploying]: 'Deploy on',
    [Subphase.Activating]: 'Move to',
  }[subphase];

  const DropzoneIcon = {
    [Subphase.Idle]: Replace,
    [Subphase.Upgrading]: Replace,
    [Subphase.Deploying]: Replace,
    [Subphase.Activating]: Move,
  }[subphase];

  return (
    <div
      className={`${isDropzone ? 'dropzone' : ''} zone ${PLAYER_CLASSNAME[controller]}`}
      aria-labelledby={`${isDropzone ? dropzoneId : ''} ${targetLabelId}`}
      role={isDropzone ? 'button' : ''}
      onClick={isDropzone ? handleClick : undefined}
      tabIndex={isDropzone ? 0 : undefined}
    >
      {children}
      {isDropzone && (
        <div role="presentation" id={dropzoneId} className="overlay-container">
          <DropzoneIcon>
            <title>{dropzoneVerb}</title>
          </DropzoneIcon>
        </div>
      )}
    </div>
  );
}
