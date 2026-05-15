import { Replace, Move } from 'lucide-react';
import { Fragment, useCallback, useId, type ReactNode } from 'react';

import type { ActivationState } from '@/state-types';
import { HOME, type PondLeafState } from '@/state-types/pond';
import { noop } from '@/types';
import { type Gameflow, Phase, PLAYER_CLASSNAME } from '@/types/gameflow';
import { distanceBetween, type Position } from '@/types/position';

type PondLeafDropzoneProps = Readonly<{
  children: ReactNode;

  position: Position;
  flow: Gameflow;
  pondLeaf: PondLeafState;
  activation?: ActivationState;

  targetLabelId: string;

  onClickUpgrade: (xy: Position) => void;
  onClickDeploy: (xy: Position) => void;
  onClickMove: (xy: Position) => void;
}>;

const None = Symbol('None');

export function PondLeafDropzone({
  children,

  position,
  flow: { player, phase },
  pondLeaf: { leaf, controller },
  activation,

  targetLabelId,

  onClickUpgrade,
  onClickDeploy,
  onClickMove,
}: PondLeafDropzoneProps) {
  const dropzoneId = useId();

  const dropzoneType =
    phase === Phase.Upgrading ||
    phase === Phase.Deploying ||
    phase === Phase.Activating
      ? phase
      : None;

  const isDropzoneVisible = {
    [Phase.Upgrading]: player === controller && !leaf,
    [Phase.Deploying]: position.y === HOME[player].y,
    [Phase.Activating]:
      distanceBetween(position, activation?.start ?? position) <= 1,
    [None]: false,
  }[dropzoneType];

  const onClickDropzone = {
    [Phase.Upgrading]: onClickUpgrade,
    [Phase.Deploying]: onClickDeploy,
    [Phase.Activating]: onClickMove,
    [None]: noop,
  }[dropzoneType];
  const handleClick = useCallback(
    () => (isDropzoneVisible ? onClickDropzone(position) : noop()),
    [onClickDropzone, isDropzoneVisible, position],
  );

  const dropzoneVerb = {
    [Phase.Upgrading]: 'Upgrade',
    [Phase.Deploying]: 'Deploy on',
    [Phase.Activating]: 'Move to',
    [None]: 'Something went wrong',
  }[dropzoneType];

  const DropzoneIcon = {
    [Phase.Upgrading]: Replace,
    [Phase.Deploying]: Replace,
    [Phase.Activating]: Move,
    [None]: Fragment,
  }[dropzoneType];

  return (
    <div
      className={`${isDropzoneVisible ? 'dropzone' : ''} zone ${PLAYER_CLASSNAME[controller]}`}
      aria-labelledby={`${isDropzoneVisible ? dropzoneId : ''} ${targetLabelId}`}
      role={isDropzoneVisible ? 'button' : ''}
      onClick={handleClick}
      tabIndex={isDropzoneVisible ? 0 : undefined}
    >
      {children}
      {isDropzoneVisible && (
        <div role="presentation" id={dropzoneId} className="overlay-container">
          <DropzoneIcon>
            <title>{dropzoneVerb}</title>
          </DropzoneIcon>
        </div>
      )}
    </div>
  );
}
