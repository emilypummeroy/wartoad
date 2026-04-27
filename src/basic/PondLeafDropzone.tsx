import { Replace, Move } from 'lucide-react';
import { useContext, useId, type ReactNode } from 'react';

import { GameContext } from '../context/GameContext';
import { getPondStateAt, HOME, type PondState } from '../state-types/pond';
import {
  type Player,
  Phase,
  PLAYER_CLASSNAME,
  Subphase,
} from '../types/gameflow';
import { distanceBetween, type Position } from '../types/position';

type PondLeafDropzoneSlice = [
  {
    pond: PondState;
    flow: {
      subphase: Subphase;
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
      flow: { player, phase, subphase },
      activation,
      pond,
    },
    { commitUpgrade, commitDeployment, commitActivation },
  ]: PondLeafDropzoneSlice = useContext(GameContext);
  const { isUpgraded, controller } = getPondStateAt(pond, position);
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
    [Subphase.Idle]: undefined,
    [Subphase.Upgrading]: () => commitUpgrade(position),
    [Subphase.Deploying]: () => commitDeployment(position),
    [Subphase.Activating]: () => commitActivation(position),
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
