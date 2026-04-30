import { useId, useContext } from 'react';

import { PondLeafCard } from '../basic/PondLeafCard';
import { PondLeafDropzone } from '../basic/PondLeafDropzone';
import { PondUnitCard } from '../basic/PondUnitCard';
import { GameContext } from '../context/GameContext';
import type { ActivationState } from '../state-types';
import { type PondState } from '../state-types/pond';
import type { UnitCard } from '../types/card';
import { type Gameflow } from '../types/gameflow';
import { type Position } from '../types/position';

type PondLeafContext = readonly [
  {
    readonly pond: PondState;
    flow: Gameflow;
    activation?: ActivationState;
  },
  {
    activate: (unit: UnitCard, start: Position) => void;
    commitUpgrade: (target: Position) => void;
    commitDeployment: (on: Position) => void;
    commitActivation: (end: Position) => void;
  },
];
type PondLeafProps = {
  readonly position: Position;
};
const clamp = (min: number, v: number, max: number) =>
  Math.max(min, Math.min(max, v));

const SHOW_SIZE = 0.9;
const PEEK_SIZE = 0.45;
const SHOW_LEAF_SIZE = 0.8;
const PEEK_LEAF_SIZE = 0.2;
const LEAF_ZONE_SIZE = 2.2;

const rowSize = ({
  units,
  position,
  isUpgraded,
}: Readonly<{
  units: readonly UnitCard[];
  position: Position;
  isUpgraded: boolean;
}>) => {
  const leafSize = isUpgraded ? SHOW_LEAF_SIZE : PEEK_LEAF_SIZE;
  const showingUnitCount = units.filter(u => !u.isExhausted).length;
  const peekingUnitCount = units.filter(u => u.isExhausted).length;

  const rowSize =
    showingUnitCount * SHOW_SIZE + peekingUnitCount * PEEK_SIZE + leafSize;
  const clampedSize = clamp(
    LEAF_ZONE_SIZE,
    rowSize,
    (1 + position.x) * LEAF_ZONE_SIZE,
  );
  const rowClassName =
    rowSize >= 2 * LEAF_ZONE_SIZE
      ? 'super-compact'
      : rowSize > LEAF_ZONE_SIZE
        ? 'compact'
        : '';
  return [rowClassName, clampedSize];
};

export function PondLeaf({ position }: PondLeafProps) {
  const [
    {
      flow,
      activation,
      pond: {
        [position.y]: {
          [position.x]: leaf,
          [position.x]: { isUpgraded, units },
        },
      },
    },
    { activate, commitUpgrade, commitDeployment, commitActivation },
  ]: PondLeafContext = useContext(GameContext);

  const leafSymbolId = useId();
  const leafNameId = useId();
  const labelledById = `${leafSymbolId} ${leafNameId}`;

  const [rowClassName, clampedSize] = rowSize({
    units,
    position,
    isUpgraded,
  });

  return (
    <div
      role="gridcell"
      aria-labelledby={labelledById}
      aria-colindex={position.x}
    >
      <PondLeafDropzone
        position={position}
        flow={flow}
        leaf={leaf}
        activation={activation}
        onClickUpgrade={commitUpgrade}
        onClickDeploy={commitDeployment}
        onClickMove={commitActivation}
        targetLabelId={labelledById}
      >
        <div
          role="list"
          className={`peek-row ${rowClassName}`}
          style={{ '--row-size': clampedSize }}
        >
          <PondLeafCard
            leafSymbolId={leafSymbolId}
            leafNameId={leafNameId}
            position={position}
          />
          {units.map(card => (
            <PondUnitCard
              key={card.key}
              unit={card}
              position={position}
              flow={flow}
              onClick={activate}
            />
          ))}
        </div>
      </PondLeafDropzone>
    </div>
  );
}
