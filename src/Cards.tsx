import {
  Clover,
  Eye,
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

export function ZoneLilyPad({
  owner,
  isHome = false,
  nameId,
  symbolId,
}: {
  readonly owner: Player;
  readonly nameId: string;
  readonly symbolId: string;
  readonly isHome?: boolean;
}) {
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[owner];
  return (
    <section
      aria-labelledby={`${symbolId} ${nameId}`}
      className={`card ${playerStyle}`}
    >
      <div className="card-title" id={nameId}>
        Lily Pad
      </div>
      <div className="card-section-row">
        {isHome ? (
          <Clover>
            <title id={symbolId}>{owner} Home</title>
          </Clover>
        ) : (
          <Leaf>
            <title id={symbolId}>{owner} controlled</title>
          </Leaf>
        )}
      </div>
      <div className="card-section-row">
        <div className="card-item">
          <small>Gives:</small>+0
        </div>
      </div>
    </section>
  );
}

export function ZoneFroglet({ owner }: { readonly owner: Player }) {
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[owner];
  const nameId = useId();
  const symbolId = useId();
  return (
    <section
      aria-labelledby={`${symbolId} ${nameId}`}
      className={`card ${playerStyle}`}
    >
      <div className="card-title" id={nameId}>
        Froglet
      </div>
      <div className="card-section-split">
        <UnitStatsDisplay stats={CardClass.Froglet.details} />
        <div className="card-section-fill">
          <Eye>
            <title id={symbolId}>{owner} controlled</title>
          </Eye>
        </div>
      </div>
    </section>
  );
}

export function ZoneFacedown({
  player,
  id,
}: {
  readonly id: string;
  readonly player: Player;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`facedown card ${Player.STYLES[player]}`}
    >
      <Leaf>
        <title id={id}>{player} controlled leaf</title>
      </Leaf>
    </section>
  );
}

export function HandLilyPad({ titleId }: { readonly titleId?: string }) {
  const id = useId();
  const titleIdFallback = useId();
  return (
    <section
      id={id}
      aria-labelledby={titleId ?? titleIdFallback}
      aria-label="Card"
      className="card"
    >
      <div className="card-title" id={titleId ?? titleIdFallback}>
        Lily Pad
      </div>
      <div className="card-section-row">
        <div className="card-item">
          <small>Cost:</small>0
        </div>
      </div>
      <LeafStatsDisplay stats={CardClass.LilyPad.details} />
    </section>
  );
}

export function HandFroglet({ titleId }: { readonly titleId?: string }) {
  const id = useId();
  const titleIdFallback = useId();
  return (
    <section
      id={id}
      aria-labelledby={titleId ?? titleIdFallback}
      aria-label="Card"
      className="card"
    >
      <div className="card-title" id={titleId ?? titleIdFallback}>
        Froglet
      </div>
      <div className="card-section-split">
        <UnitStatsDisplay stats={CardClass.Froglet.details} />
        <div className="card-section-fill">
          <div className="card-item">
            <small>Cost:</small>0
          </div>
        </div>
      </div>
    </section>
  );
}

export const HandCardBack = () => {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card">
      <Leaf>
        <title id={id}>Card back</title>
      </Leaf>
    </section>
  );
};

export function UnitStatsDisplay({
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

export function LeafStatsDisplay({
  stats: { gives },
}: {
  readonly stats: LeafStats;
}) {
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
