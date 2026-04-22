import { useId, useContext } from 'react';

import { GameContext } from '../context/GameContext';
import { type PondState } from '../state/pond';
import { type Player } from '../types/gameflow';
import { type Position } from '../types/position';
import { PondLeafCard } from './PondLeafCard';
import { PondLeafDropzone } from './PondLeafDropzone';
import { PondUnitCard } from './PondUnitCard';

type PondLeafContext = readonly [
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
type PondLeafProps = {
  readonly position: Position;

  // TODO 12: Get from context
  readonly onCardPlaced: (position: Position) => void;
  readonly controller: Player;
};

export function PondLeaf({
  position,
  onCardPlaced,
  controller,
}: PondLeafProps) {
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
  return (
    <div
      role="gridcell"
      aria-labelledby={`${leafSymbolId} ${leafNameId}`}
      aria-colindex={position.x}
    >
      <PondLeafDropzone
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
        <div
          key="card-list"
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
