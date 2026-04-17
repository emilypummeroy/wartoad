import {
  Clover,
  Torus,
  Book,
  BookPlus,
  Diamond,
  DiamondPlus,
  Battery,
  BatteryPlus,
  Package,
  PackagePlus,
  Circle,
  CirclePlus,
  ListFilter,
  ListFilterPlus,
  Crosshair,
  Heart,
  Leaf,
  Move,
  Sword,
} from 'lucide-react';
import { useId } from 'react';

import { CardClass, type LeafStats, type UnitStats } from './card-types';
import { Player } from './PhaseTracker';

export function LilyPad({
  owner,
  isHome = false,
  isLeaf = false,
  nameId,
  symbolId,
}: Readonly<{
  owner?: Player;
  nameId?: string;
  symbolId?: string;
  isHome?: boolean;
  isLeaf?: boolean;
}>) {
  {
    const _symbolId = useId();
    symbolId ??= _symbolId;
    const _nameId = useId();
    nameId ??= _nameId;
  }
  return (
    <section
      aria-labelledby={`${symbolId} ${nameId}`}
      className={`card ${owner && Player.STYLES[owner]}`}
    >
      <div className="card-title" id={nameId}>
        Lily Pad
      </div>
      <div className="card-section-row">
        {!isLeaf ? (
          <div className="card-item">
            <small>Cost:</small>0
          </div>
        ) : isHome ? (
          <Clover>
            <title id={symbolId}>{owner} Home</title>
          </Clover>
        ) : (
          <Leaf>
            <title id={symbolId}>{owner} controlled</title>
          </Leaf>
        )}
      </div>
      <LeafStatsDisplay stats={CardClass.LilyPad.details} />
    </section>
  );
}

export function Froglet({
  owner,
  isOnLeaf = false,
  nameId,
}: Readonly<{ isOnLeaf?: boolean; nameId?: string; owner?: Player }>) {
  const symbolId = useId();
  {
    const _nameId = useId();
    nameId ??= _nameId;
  }
  return (
    <section
      aria-labelledby={`${isOnLeaf ? symbolId : ''} ${nameId}`}
      className={`card ${isOnLeaf && owner ? Player.STYLES[owner] : ''}`}
    >
      <div className="card-title" id={nameId}>
        Froglet
      </div>
      <div className="card-section-split">
        <UnitStatsDisplay stats={CardClass.Froglet.details} />
        <div className="card-section-fill">
          {isOnLeaf ? (
            <Torus>
              <title id={symbolId}>{owner} controlled</title>
            </Torus>
          ) : (
            <div className="card-item">
              <small>Cost:</small>0
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export const CardBack = ({
  id,
  player,
  isLeaf = false,
}: Readonly<{ id?: string; player?: Player; isLeaf?: boolean }>) => {
  {
    const _id = useId();
    id ??= _id;
  }
  return (
    <section
      aria-labelledby={id}
      className={`${isLeaf && player ? Player.STYLES[player] : ''} facedown card`}
    >
      <Leaf>
        <title id={id}>
          {isLeaf ? `${player ?? ''} controlled leaf` : 'Card back'}
        </title>
      </Leaf>
    </section>
  );
};

function UnitStatsDisplay({
  stats: { power, range, speed, life },
}: {
  readonly stats: UnitStats;
}) {
  return (
    <div className="card-section-column">
      <div className="card-item">
        <span>{power}</span>{' '}
        <Sword>
          <title>Power</title>
        </Sword>
      </div>
      <div className="card-item">
        <span>{range}</span>{' '}
        <Crosshair>
          <title>Range</title>
        </Crosshair>
      </div>
      <div className="card-item">
        <span>{speed}</span>{' '}
        <Move>
          <title>Speed</title>
        </Move>
      </div>
      <div className="card-item">
        <span>{life}</span>{' '}
        <Heart>
          <title>Life</title>
        </Heart>
      </div>
    </div>
  );
}

function LeafStatsDisplay({ stats: { gives } }: { readonly stats: LeafStats }) {
  return (
    <div className="card-section-row">
      <div className="card-item">
        <small>Gives:</small>+{gives}
      </div>
    </div>
  );
}

export {
  // Amphibeans
  // Tadpoles
  Circle,
  CirclePlus,
  // Research
  Book,
  BookPlus,
  // Food
  Diamond,
  DiamondPlus,

  // Bugs
  // Energy
  Battery,
  BatteryPlus,
  // Matter
  Package,
  PackagePlus,

  // Deep ones
  // Zeal
  ListFilter,
  ListFilterPlus,
};
