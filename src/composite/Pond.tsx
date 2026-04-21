import { ROW_COUNT_PER_PLAYER } from '../state/pond';
import { Player } from '../types/gameflow';
import { type Position } from '../types/position';
import { LeafAndDropzone } from './LeafZone';

export type PondProps = Readonly<{
  onCardPlaced: (position: Position) => void;
}>;
export function Pond({ onCardPlaced }: PondProps) {
  const children = (x: number, y: number) => (
    <LeafAndDropzone
      controller={y < ROW_COUNT_PER_PLAYER ? Player.North : Player.South}
      position={{ x, y }}
      onCardPlaced={onCardPlaced}
    />
  );
  return (
    <div role="grid">
      <div className="zonerow" role="row">
        {children(0, 0)}
        {children(1, 0)}
        {children(2, 0)}
      </div>
      <div className="zonerow" role="row">
        {children(0, 1)}
        {children(1, 1)}
        {children(2, 1)}
      </div>
      <div className="zonerow" role="row">
        {children(0, 2)}
        {children(1, 2)}
        {children(2, 2)}
      </div>
      <div className="zonerow" role="row">
        {children(0, 3)}
        {children(1, 3)}
        {children(2, 3)}
      </div>
      <div className="zonerow" role="row">
        {children(0, 4)}
        {children(1, 4)}
        {children(2, 4)}
      </div>
      <div className="zonerow" role="row">
        {children(0, 5)}
        {children(1, 5)}
        {children(2, 5)}
      </div>
    </div>
  );
}
