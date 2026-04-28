import { Replace, Move } from 'lucide-react';
import { useContext, useId, type ReactNode } from 'react';

import { GameContext } from '../context/GameContext';
import { getPondStateAt, HOME, type PondState } from '../state-types/pond';
import { noop } from '../types';
import { Phase, type Player, PLAYER_CLASSNAME } from '../types/gameflow';
import { distanceBetween, type Position } from '../types/position';

type PondLeafDropzoneSlice = [
  {
    pond: PondState;
    flow: {
      phase: Phase;
      player: Player;
    };
    activation?: { start: Position };
  },
  {
    commitUpgrade: (target: Position) => void;
    commitDeployment: (on: Position) => void;
    commitActivation: (end: Position) => void;
  },
];

// TODO 14: Make this a view component with memo
type PondLeafDropzoneProps = Readonly<{
  children: ReactNode;
  targetLabelId: string;
  position: Position;
}>;
export function PondLeafDropzone({
  children,
  targetLabelId,
  position,
}: PondLeafDropzoneProps) {
  const [
    {
      flow: { player, phase },
      activation,
      pond,
    },
    { commitUpgrade, commitDeployment, commitActivation },
  ]: PondLeafDropzoneSlice = useContext(GameContext);
  const { isUpgraded, controller } = getPondStateAt(pond, position);
  const dropzoneId = useId();

  const dropzoneType =
    phase === Phase.Upgrading ||
    phase === Phase.Deploying ||
    phase === Phase.Activating
      ? phase
      : undefined;

  const isDropzone = dropzoneType
    ? {
        [Phase.Upgrading]: player === controller && !isUpgraded,
        [Phase.Deploying]: position.y === HOME[player].y,
        [Phase.Activating]:
          distanceBetween(position, activation?.start ?? position) <= 1,
      }[dropzoneType]
    : false;

  const handleClick = dropzoneType
    ? {
        [Phase.Upgrading]: () => commitUpgrade(position),
        [Phase.Deploying]: () => commitDeployment(position),
        [Phase.Activating]: () => commitActivation(position),
      }[dropzoneType]
    : noop;

  const dropzoneVerb = dropzoneType
    ? {
        [Phase.Upgrading]: 'Upgrade',
        [Phase.Deploying]: 'Deploy on',
        [Phase.Activating]: 'Move to',
      }[dropzoneType]
    : '';

  const DropzoneIcon = dropzoneType
    ? {
        [Phase.Upgrading]: Replace,
        [Phase.Deploying]: Replace,
        [Phase.Activating]: Move,
      }[dropzoneType]
    : null;

  return (
    <div
      className={`${isDropzone ? 'dropzone' : ''} zone ${PLAYER_CLASSNAME[controller]}`}
      aria-labelledby={`${isDropzone ? dropzoneId : ''} ${targetLabelId}`}
      role={isDropzone ? 'button' : ''}
      onClick={isDropzone ? handleClick : undefined}
      tabIndex={isDropzone ? 0 : undefined}
    >
      {children}
      {DropzoneIcon && isDropzone && (
        <div role="presentation" id={dropzoneId} className="overlay-container">
          <DropzoneIcon>
            <title>{dropzoneVerb}</title>
          </DropzoneIcon>
        </div>
      )}
    </div>
  );
}
