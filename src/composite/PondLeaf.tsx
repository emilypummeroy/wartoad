import { useId, useContext } from 'react';

import { PondLeafCard } from '../basic/PondLeafCard';
import { PondLeafDropzone } from '../basic/PondLeafDropzone';
import { PondUnitCard } from '../basic/PondUnitCard';
import { GameContext } from '../context/GameContext';
import type { ActivationState } from '../state-types';
import { type PondState } from '../state-types/pond';
import type { UnitCard } from '../types/card';
import type { Gameflow } from '../types/gameflow';
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

export function PondLeaf({ position }: PondLeafProps) {
  const [
    {
      flow,
      activation,
      pond: {
        [position.y]: {
          [position.x]: leaf,
          [position.x]: { units },
        },
      },
    },
    { activate, commitUpgrade, commitDeployment, commitActivation },
  ]: PondLeafContext = useContext(GameContext);

  const leafSymbolId = useId();
  const leafNameId = useId();
  const labelledById = `${leafSymbolId} ${leafNameId}`;

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
        <PondLeafCard
          leafSymbolId={leafSymbolId}
          leafNameId={leafNameId}
          position={position}
        />
        <div
          role="list"
          className="splay-row in-zone"
          style={{
            '--hand-size': 0,
          }}
        >
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
