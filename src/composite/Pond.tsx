import { ROW_COUNT_PER_PLAYER } from '../state/pond';
import { Player } from '../types/gameflow';
import { PondLeaf } from './PondLeaf';

export function Pond() {
  const children = (x: number, y: number) => (
    <PondLeaf
      controller={y < ROW_COUNT_PER_PLAYER ? Player.North : Player.South}
      position={{ x, y }}
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
