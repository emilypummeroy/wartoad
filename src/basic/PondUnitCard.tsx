import { useCallback, useId } from 'react';

import type { UnitCard } from '../types/card';
import { Phase, PLAYER_CLASSNAME, type Gameflow } from '../types/gameflow';
import type { Position } from '../types/position';
import { Froglet } from '../view/Card';

type PondUnitCardProps = Readonly<{
  unit: UnitCard;
  position: Position;
  flow: Gameflow;
  onClick: (unit: UnitCard, start: Position) => void;
}>;

export const PondUnitCard = ({
  unit,
  flow: { player, phase },
  position,
  onClick,
}: PondUnitCardProps) => {
  const buttonId = useId();
  const symbolId = useId();
  const nameId = useId();
  const handleClick = useCallback(
    () => onClick(unit, position),
    [unit, position, onClick],
  );
  const { isExhausted } = unit;
  const canActivate =
    player === unit.owner && phase === Phase.Main && !isExhausted;
  return canActivate ? (
    <div className="showing">
      <div
        role="button"
        aria-labelledby={`${buttonId} ${symbolId} ${nameId}`}
        id={buttonId}
        aria-label="Activate"
        tabIndex={0}
        onClick={handleClick}
        className={`highlighting-card pickable-card ${PLAYER_CLASSNAME[unit.owner]}`}
      >
        <Froglet
          nameId={nameId}
          symbolId={symbolId}
          player={unit.owner}
          isOnLeaf
          isExhausted={isExhausted}
        />
      </div>
    </div>
  ) : (
    <div className={isExhausted ? 'peeking' : 'showing'}>
      <div
        role="listitem"
        className={`highlighting-card ${PLAYER_CLASSNAME[unit.owner]}`}
      >
        <Froglet
          nameId={nameId}
          symbolId={symbolId}
          player={unit.owner}
          isOnLeaf
          isExhausted={isExhausted}
        />
      </div>
    </div>
  );
};
