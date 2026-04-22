import { Replace } from 'lucide-react';
import { useCallback, useContext, useId, type ReactNode } from 'react';

import { GameContext } from '../context/GameContext';
import { getPondStateAt, HOME, type PondState } from '../state/pond';
import {
  Phase,
  PLAYER_CLASSNAME,
  Subphase,
  type Player,
} from '../types/gameflow';
import {
  distanceBetween,
  positionsAreEqual,
  type Position,
} from '../types/position';

type PondLeafDropzoneContext = readonly [
  {
    readonly pond: PondState;
    readonly flow: {
      subphase: Subphase;
      phase: Phase;
      player: Player;
    };
    readonly activationState?: { start: Position };
  },
  unknown,
  // {
  //   commitUpgrade: (target: Position) => void;
  //   commitDeploy: (on: Position) => void;
  //   commitActivation: (end: Position) => void;
  // },
];

type PondLeafDropzoneProps = {
  readonly children: ReactNode;
  readonly leafNameId: string;
  readonly leafSymbolId: string;
  readonly position: Position;
  readonly controller: Player;
  readonly onCardPlaced: (position: Position) => void;
};
export function PondLeafDropzone({
  children,
  leafNameId,
  leafSymbolId,
  position,
  controller,
  onCardPlaced,
}: PondLeafDropzoneProps) {
  const [
    {
      flow: { player, phase, subphase },
      activationState,
      pond,
    },
  ]: PondLeafDropzoneContext = useContext(GameContext);
  const { isUpgraded } = getPondStateAt(pond, position);
  const dropzoneId = useId();
  const isUpgradeDropzone =
    phase === Phase.Main &&
    subphase === Subphase.Upgrading &&
    player === controller &&
    !isUpgraded;
  const isDeployDropzone =
    phase === Phase.Main &&
    subphase === Subphase.Deploying &&
    position.y === HOME[player].y;
  const isMoveDropzone =
    phase === Phase.Main &&
    subphase === Subphase.Activating &&
    !!activationState &&
    !positionsAreEqual(position, activationState.start) &&
    // TODO 21: Use unit's speed stat
    distanceBetween(position, activationState.start) <= 1;

  const isDropzone = isUpgradeDropzone || isDeployDropzone || isMoveDropzone;
  const handleClick = useCallback(
    () => (isDropzone ? onCardPlaced(position) : undefined),
    [isDropzone, position, onCardPlaced],
  );

  return (
    <div
      className={`${isDropzone ? 'dropzone' : ''} zone ${PLAYER_CLASSNAME[controller]}`}
      aria-labelledby={`${dropzoneId} ${leafSymbolId} ${leafNameId}`}
      role={isDropzone ? 'button' : ''}
      onClick={handleClick}
      tabIndex={isDropzone ? 0 : undefined}
    >
      {isDropzone && (
        <div role="presentation" id={dropzoneId} className="overlay-container">
          <Replace>
            <title>
              {isUpgradeDropzone
                ? 'Upgrade'
                : isDeployDropzone
                  ? 'Deploy on'
                  : isMoveDropzone
                    ? 'Move to'
                    : ''}
            </title>
          </Replace>
        </div>
      )}
      {children}
    </div>
  );
}
