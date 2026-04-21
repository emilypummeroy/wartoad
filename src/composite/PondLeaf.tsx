import { Replace } from 'lucide-react';
import { useId, useCallback, useContext, type ReactNode } from 'react';

import { CardBack, Froglet, LilyPad } from '../base/Card';
import { GameContext } from '../context/GameContext';
import { HOME, type PondState } from '../state/pond';
import type { UnitCard } from '../types/card';
import {
  Phase,
  PLAYER_CLASSNAME,
  Subphase,
  type Player,
  type Gameflow,
} from '../types/gameflow';
import {
  distanceBetween,
  positionsAreEqual,
  type Position,
} from '../types/position';

type PondLeafProps = {
  readonly position: Position;

  // TODO 12: Get from context
  readonly onCardPlaced: (position: Position) => void;
  readonly controller: Player;
};

type PondLeafContext = readonly [
  {
    pond: PondState;
  },
  unknown,
];

export function PondLeaf({
  position,
  onCardPlaced,
  controller,
}: PondLeafProps) {
  const [
    {
      pond: {
        [position.y]: { [position.x]: _ },
      },
    },
  ]: PondLeafContext = useContext(GameContext);
  const leafSymbolId = useId();
  const leafNameId = useId();
  return (
    <div
      role="gridcell"
      aria-labelledby={`${leafSymbolId} ${leafNameId}`}
      aria-colindex={position.x}
    >
      <LeafDropzone
        leafSymbolId={leafSymbolId}
        leafNameId={leafNameId}
        position={position}
        onCardPlaced={onCardPlaced}
        controller={controller}
      >
        <PondLeafCard
          leafSymbolId={leafSymbolId}
          leafNameId={leafNameId}
          position={position}
          controller={controller}
        />
        <PondUnits position={position} />
      </LeafDropzone>
    </div>
  );
}

type PondLeafCardContext = readonly [
  {
    pond: PondState;
  },
  unknown,
];
type PondLeafCardProps = {
  readonly leafSymbolId: string;
  readonly leafNameId: string;
  readonly position: Position;
  readonly controller: Player;
};
function PondLeafCard({
  leafSymbolId,
  leafNameId,
  position,
  controller,
}: PondLeafCardProps) {
  const [
    {
      pond: {
        [position.y]: {
          [position.x]: { isUpgraded },
        },
      },
    },
  ]: PondLeafCardContext = useContext(GameContext);
  const isHome = positionsAreEqual(HOME[controller], position);
  return isUpgraded ? (
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
  );
}

type PondUnitsContext = readonly [
  {
    readonly pond: PondState;
  },
  unknown,
  // {
  //   commitUpgrade: (target: Position) => void;
  //   commitDeploy: (on: Position) => void;
  //   commitActivation: (end: Position) => void;
  // },
];
type PondUnitsProps = {
  readonly position: Position;
};
function PondUnits({ position }: PondUnitsProps) {
  const [
    {
      pond: {
        [position.y]: {
          [position.x]: { units },
        },
      },
    },
  ]: PondUnitsContext = useContext(GameContext);

  return (
    <div
      key="card-list"
      role="list"
      className="splay-row in-zone"
      style={{
        '--hand-size': 0,
      }}
    >
      {units.map(card => (
        <ZoneUnit key={card.key} card={card} position={position} />
      ))}
    </div>
  );
}

type LeafDropzoneContext = readonly [
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

type LeafDropzoneProps = {
  readonly children: ReactNode;
  readonly leafNameId: string;
  readonly leafSymbolId: string;
  readonly position: Position;
  readonly controller: Player;
  readonly onCardPlaced: (position: Position) => void;
};
export function LeafDropzone({
  children,
  leafNameId,
  leafSymbolId,
  position,
  controller,
  onCardPlaced,
}: LeafDropzoneProps) {
  const [
    {
      flow: { player, phase, subphase },
      activationState,
      pond: {
        [position.y]: { [position.x]: leaf },
      },
    },
  ]: LeafDropzoneContext = useContext(GameContext);
  const dropzoneId = useId();
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
