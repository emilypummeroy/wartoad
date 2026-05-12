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

import {
  CardClass,
  CardLocation,
  type LeafState,
  type LeafStats,
  type UnitStats,
} from '../types/card';
import { type Player, PLAYER_CLASSNAME } from '../types/gameflow';

export type LeafCardProps = Readonly<{
  leaf: LeafState;
  location: CardLocation;
  nameId?: string;
  symbolId?: string;
}>;

export function LeafCard({ leaf, location, nameId, symbolId }: LeafCardProps) {
  {
    const _symbolId = useId();
    symbolId ??= _symbolId;
    const _nameId = useId();
    nameId ??= _nameId;
  }
  const costId = useId();
  const isInPond =
    location === CardLocation.Pond || location === CardLocation.Home;
  return (
    <section
      aria-labelledby={`${isInPond ? symbolId : ''} ${nameId}`}
      className={`card leaf ${isInPond ? PLAYER_CLASSNAME[leaf.owner] : ''}`}
    >
      <div className="card-title" id={nameId}>
        {leaf.cardClass.name}
      </div>
      <div className="card-section-cost">
        <div role="group" aria-labelledby={costId} className="card-item">
          <small id={costId}>Cost</small>
          {leaf.cardClass.cost}
        </div>
      </div>
      <div className="card-section-fill">
        {location === CardLocation.Home && (
          <Clover role="img">
            <title id={symbolId}>{leaf.owner} Home</title>
          </Clover>
        )}
        {(location === CardLocation.Pond || location === CardLocation.Hand) && (
          <Leaf role="img">
            <title id={symbolId}>{leaf.owner} controlled</title>
          </Leaf>
        )}
      </div>
      <div className="card-section-row">
        <LeafStatsDisplay stats={leaf.cardClass.stats} />
      </div>
    </section>
  );
}

type UnitCardProps = {
  readonly isOnLeaf?: boolean;
  readonly isExhausted?: boolean;
  readonly player?: Player;
  readonly nameId?: string;
  readonly symbolId?: string;
};
export function Froglet({
  player,
  isOnLeaf = false,
  isExhausted = false,
  nameId,
  symbolId,
}: UnitCardProps) {
  {
    const _nameId = useId();
    const _symbolId = useId();
    nameId ??= _nameId;
    symbolId ??= _symbolId;
  }
  const costId = useId();
  // TODO 26: Wire in card.class:
  // .stats
  // .name
  // .cost
  // card:
  // .owner
  // .damage
  return (
    <section
      aria-labelledby={`${isOnLeaf ? symbolId : ''} ${nameId}`}
      className={`card ${isExhausted ? 'exhausted' : ''} ${isOnLeaf && player ? PLAYER_CLASSNAME[player] : ''}`}
    >
      <div className="card-title" id={nameId}>
        Froglet
      </div>
      <div className="card-section-cost">
        <div role="group" aria-labelledby={costId} className="card-item">
          <small id={costId}>Cost</small>0
        </div>
      </div>
      <div className="card-section-split">
        <UnitStatsDisplay stats={CardClass.Froglet.stats} />
        <div className="card-section-fill">
          <Torus className="flip" role="img">
            <title id={symbolId}>
              {isExhausted ? 'exhausted ' : ''}
              {player} unit
            </title>
          </Torus>
        </div>
      </div>
    </section>
  );
}

export const CardBack = ({
  iconId,
  player,
  isLeaf = false,
}: Readonly<{ iconId?: string; player: Player; isLeaf?: boolean }>) => {
  {
    const _iconId = useId();
    iconId ??= _iconId;
  }
  return (
    <section
      aria-labelledby={iconId}
      className={`${isLeaf ? PLAYER_CLASSNAME[player] : ''} cardback card`}
    >
      <Leaf role="img">
        <title id={iconId}>
          {isLeaf ? `${player} controlled leaf` : 'Card back'}
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
    <div role="group" aria-label="Stats" className="card-section-column">
      <div className="card-item">
        <span role="presentation">{power}</span>
        <Sword role="img">
          <title> Power </title>
        </Sword>
      </div>
      <div className="card-item">
        <span role="presentation">{range}</span>
        <Crosshair role="img">
          <title> Range </title>
        </Crosshair>
      </div>
      <div className="card-item">
        <span role="presentation">{speed}</span>
        <Move role="img">
          <title> Speed </title>
        </Move>
      </div>
      <div className="card-item">
        <span role="presentation">{life}</span>
        <Heart role="img">
          <title> Life </title>
        </Heart>
      </div>
    </div>
  );
}

function LeafStatsDisplay({
  stats: { gives, givesHome },
}: {
  readonly stats: LeafStats;
}) {
  return (
    <div className="card-item">
      <small>Gives</small>
      <div className="card-item-line">
        <small>Home:</small>
        <span>+{givesHome}</span>
      </div>
      <div className="card-item-line">
        <small>Other:</small>
        <span>+{gives}</span>
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
