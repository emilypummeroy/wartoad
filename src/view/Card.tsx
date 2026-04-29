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

import { CardClass, type LeafStats, type UnitStats } from '../types/card';
import { type Player, PLAYER_CLASSNAME } from '../types/gameflow';

export function LilyPad({
  player,
  isHome = false,
  isLeaf = false,
  nameId,
  symbolId,
}: Readonly<{
  player?: Player;
  nameId?: string;
  symbolId?: string;
  isHome?: boolean;
  isLeaf?: boolean;
}>) {
  // TODO 16: Wire in card.class:
  // .stats
  // .name
  // .cost
  // card:
  // .owner
  {
    const _symbolId = useId();
    symbolId ??= _symbolId;
    const _nameId = useId();
    nameId ??= _nameId;
  }
  const costId = useId();
  return (
    <section
      aria-labelledby={`${isLeaf ? symbolId : ''} ${nameId}`}
      className={`card ${isLeaf && player ? PLAYER_CLASSNAME[player] : ''}`}
    >
      <div className="card-title" id={nameId}>
        Lily Pad
      </div>
      <div className="card-section-row">
        {!isLeaf ? (
          <div role="group" aria-labelledby={costId} className="card-item">
            <small id={costId}>Cost</small>0
          </div>
        ) : isHome ? (
          <Clover role="img">
            <title id={symbolId}>{player} Home</title>
          </Clover>
        ) : (
          <Leaf role="img">
            <title id={symbolId}>{player} controlled</title>
          </Leaf>
        )}
      </div>
      <LeafStatsDisplay stats={CardClass.LilyPad.stats} />
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
  // TODO 17: Wire in card.class:
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
      <div className="card-section-split">
        <UnitStatsDisplay stats={CardClass.Froglet.stats} />
        <div className="card-section-fill">
          {isOnLeaf ? (
            <Torus role="img">
              <title id={symbolId}>
                {isExhausted ? 'exhausted ' : ''}
                {player} unit
              </title>
            </Torus>
          ) : (
            <div role="group" aria-labelledby={costId} className="card-item">
              <small id={costId}>Cost</small>0
            </div>
          )}
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

function LeafStatsDisplay({ stats: { gives } }: { readonly stats: LeafStats }) {
  const givesId = useId();
  return (
    <div role="group" aria-labelledby={givesId} className="card-section-row">
      <div className="card-item">
        <small id={givesId}>Gives</small>+{gives}
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
