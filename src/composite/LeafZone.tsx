import { Replace } from 'lucide-react';
import { useId, useCallback, useContext } from 'react';

import { CardBack, Froglet, LilyPad } from '../base/Card';
import { GameContext } from '../context/GameContext';
import { HOME, type PondState, type ZoneState } from '../state/pond';
import type { UnitCard } from '../types/card';
import {
  Phase,
  PLAYER_CLASSNAME,
  Subphase,
  type Gameflow,
  type Player,
} from '../types/gameflow';
import {
  distanceBetween,
  positionsAreEqual,
  type Position,
} from '../types/position';

type ZoneProps = {
  readonly leafNameId: string;
  readonly leafSymbolId: string;

  // TODO 9: Get these from context
  readonly controller: Player;
  readonly position: Position;
  readonly leaf: ZoneState;
};

export function PondLeaf({
  leafNameId,
  leafSymbolId,

  leaf: { isUpgraded, units },
  controller,
  position,
}: ZoneProps) {
  const isHome = positionsAreEqual(HOME[controller], position);

  return (
    <>
      <div
        key="card-list"
        role="list"
        className="splay-row in-zone"
        style={{
          '--hand-size': 0,
        }}
      >
        {isUpgraded ? (
          // TODO 11: Implement a non-splay-row hack to display cards on leaves
          // TODO 10: Set the controller based on ZoneState not on position
          <div className="stacking peeking">
            <div
              role="listitem"
              className={`highlighting-card ${PLAYER_CLASSNAME[controller]}`}
            >
              <LilyPad
                symbolId={leafSymbolId}
                nameId={leafNameId}
                isHome={isHome}
                player={controller}
                isLeaf
              />
            </div>
          </div>
        ) : (
          <div className="stacking">
            <CardBack
              iconId={leafSymbolId}
              key="facedown-card"
              player={controller}
              isLeaf
            />
          </div>
        )}
        {units.map(card => (
          <ZoneUnit key={card.key} card={card} position={position} />
        ))}
      </div>
    </>
  );
}

type ZoneUnitContext = readonly [
  { flow: Gameflow },
  {
    readonly activate: (unit: UnitCard, position: Position) => void;
  },
];
type ZoneUnitProps = { readonly card: UnitCard; readonly position: Position };

const ZoneUnit = ({ card, position }: ZoneUnitProps) => {
  const [
    {
      flow: { player, phase, subphase },
    },
    { activate },
  ]: ZoneUnitContext = useContext(GameContext);
  const buttonId = useId();
  const symbolId = useId();
  const nameId = useId();
  const handleClick = useCallback(
    () => activate(card, position),
    [card, position, activate],
  );
  const canActivate =
    player === card.owner && phase === Phase.Main && subphase === Subphase.Idle;
  return canActivate ? (
    <div className="stacking peeking">
      <div
        role="button"
        aria-labelledby={`${buttonId} ${symbolId} ${nameId}`}
        id={buttonId}
        aria-label="Activate"
        tabIndex={0}
        onClick={handleClick}
        className={`highlighting-card pickable-card ${PLAYER_CLASSNAME[card.owner]}`}
      >
        <Froglet
          nameId={nameId}
          symbolId={symbolId}
          player={card.owner}
          isOnLeaf
        />
      </div>
    </div>
  ) : (
    <div className="stacking peeking">
      <div
        role="listitem"
        className={`highlighting-card ${PLAYER_CLASSNAME[card.owner]}`}
      >
        <Froglet
          nameId={nameId}
          symbolId={symbolId}
          player={card.owner}
          isOnLeaf
        />
      </div>
    </div>
  );
};

type LeafAndDropzoneContext = readonly [
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

type LeafAndDropzoneProps = {
  readonly position: Position;
  readonly controller: Player;
  readonly onCardPlaced: (position: Position) => void;
};
export function LeafAndDropzone({
  position,
  position: { x, y },
  controller,
  onCardPlaced,
}: LeafAndDropzoneProps) {
  const [
    {
      flow: { player, phase, subphase },
      activationState,
      pond: {
        [y]: { [x]: leaf },
      },
    },
  ]: LeafAndDropzoneContext = useContext(GameContext);
  const dropzoneId = useId();
  const leafSymbolId = useId();
  const leafNameId = useId();
  const isUpgradeDropzone =
    phase === Phase.Main &&
    subphase === Subphase.Upgrading &&
    player === controller &&
    !leaf.isUpgraded;
  const isDeployDropzone =
    phase === Phase.Main &&
    subphase === Subphase.Deploying &&
    position.y === HOME[player].y;
  const isMoveDropzone =
    phase === Phase.Main &&
    subphase === Subphase.Activation &&
    !!activationState &&
    !positionsAreEqual(position, activationState.start) &&
    // TODO 21: Use unit's speed stat
    distanceBetween(position, activationState.start) <= 1;

  const isDropzone = isUpgradeDropzone || isDeployDropzone || isMoveDropzone;
  const handleClick = useCallback(
    () => (isDropzone ? onCardPlaced(position) : undefined),
    [isDropzone, position],
  );

  return (
    <div
      role="gridcell"
      aria-labelledby={`${leafSymbolId} ${leafNameId}`}
      aria-colindex={position.x}
    >
      <div
        className={`${isDropzone ? 'dropzone' : ''} zone ${PLAYER_CLASSNAME[controller]}`}
        aria-labelledby={`${dropzoneId} ${leafSymbolId} ${leafNameId}`}
        role={isDropzone ? 'button' : ''}
        onClick={handleClick}
        tabIndex={isDropzone ? 0 : undefined}
      >
        {isDropzone && (
          <div
            role="presentation"
            id={dropzoneId}
            className="overlay-container"
          >
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
        <PondLeaf
          leafNameId={leafNameId}
          leafSymbolId={leafSymbolId}
          position={position}
          leaf={leaf}
          controller={controller}
        />
      </div>
    </div>
  );
}
