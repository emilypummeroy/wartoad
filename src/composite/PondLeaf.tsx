import { useId, useContext } from 'react';

import { PondLeafCard } from '../basic/PondLeafCard';
import { PondLeafDropzone } from '../basic/PondLeafDropzone';
import { PondUnitCard } from '../basic/PondUnitCard';
import { GameContext } from '../context/GameContext';
import { type PondState } from '../state/pond';
import { type Position } from '../types/position';

type PondLeafContext = readonly [
  {
    readonly pond: PondState;
  },
  unknown,
];
type PondLeafProps = {
  readonly position: Position;
};

export function PondLeaf({ position }: PondLeafProps) {
  const [
    {
      pond: {
        [position.y]: {
          [position.x]: { units },
        },
      },
    },
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
      <PondLeafDropzone targetLabelId={labelledById} position={position}>
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
            <PondUnitCard key={card.key} card={card} position={position} />
          ))}
        </div>
      </PondLeafDropzone>
    </div>
  );
}
