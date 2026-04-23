import { PondLeaf } from './PondLeaf';

export function Pond() {
  return (
    <div role="grid">
      <div className="zonerow" role="row">
        <PondLeaf position={{ x: 0, y: 0 }} />
        <PondLeaf position={{ x: 1, y: 0 }} />
        <PondLeaf position={{ x: 2, y: 0 }} />
      </div>
      <div className="zonerow" role="row">
        <PondLeaf position={{ x: 0, y: 1 }} />
        <PondLeaf position={{ x: 1, y: 1 }} />
        <PondLeaf position={{ x: 2, y: 1 }} />
      </div>
      <div className="zonerow" role="row">
        <PondLeaf position={{ x: 0, y: 2 }} />
        <PondLeaf position={{ x: 1, y: 2 }} />
        <PondLeaf position={{ x: 2, y: 2 }} />
      </div>
      <div className="zonerow" role="row">
        <PondLeaf position={{ x: 0, y: 3 }} />
        <PondLeaf position={{ x: 1, y: 3 }} />
        <PondLeaf position={{ x: 2, y: 3 }} />
      </div>
      <div className="zonerow" role="row">
        <PondLeaf position={{ x: 0, y: 4 }} />
        <PondLeaf position={{ x: 1, y: 4 }} />
        <PondLeaf position={{ x: 2, y: 4 }} />
      </div>
      <div className="zonerow" role="row">
        <PondLeaf position={{ x: 0, y: 5 }} />
        <PondLeaf position={{ x: 1, y: 5 }} />
        <PondLeaf position={{ x: 2, y: 5 }} />
      </div>
    </div>
  );
}
