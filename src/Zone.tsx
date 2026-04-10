import { Replace, Pyramid, HousePlus } from 'lucide-react';
import { useId, useCallback } from 'react';

import { Player, type FlowState, Subphase } from './App';
import { Position, NORTH_HOME, SOUTH_HOME } from './Grid';

function GreenField({
  owner,
  isHome = false,
}: {
  readonly owner: Player;
  readonly isHome?: boolean;
}) {
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
        Green Field
      </div>
      <div className="card-section-row">
        {isHome ? (
          <HousePlus>
            <title id={symbolId}>{owner} Home</title>
          </HousePlus>
        ) : (
          <Pyramid>
            <title id={symbolId}>{owner} owned</title>
          </Pyramid>
        )}
        <div>
          <small>Gives:</small>+0
        </div>
      </div>
      <div className="card-section-row" />
    </section>
  );
}

function FacedownCard({ player }: { readonly player: Player }) {
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  };
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={`facedown card ${playerStyle[player]}`}
    >
      <Pyramid>
        <title id={id}>{player} controlled empty field</title>
      </Pyramid>
    </section>
  );
}

type ZoneProps = Readonly<{
  flow: FlowState;
  controller: Player;
  position: Position;
  isUpgraded: boolean;
  onPlace: (position: Position) => void;
}>;

export function Zone({
  flow: { subphase, player },
  controller,
  position,
  isUpgraded,
  onPlace,
}: ZoneProps) {
  const isDropzone =
    !isUpgraded && player === controller && subphase === Subphase.Placing;
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[controller];
  const homePosition = {
    [Player.North]: NORTH_HOME,
    [Player.South]: SOUTH_HOME,
  }[controller];

  return (
    <button
      className={`placeable-zone ${playerStyle}`}
      disabled={!isDropzone}
      onClick={useCallback(() => onPlace(position), [position, onPlace])}
    >
      <div className={`zone ${playerStyle}`} role="gridcell">
        {isDropzone && (
          <div className="overlay-container">
            <Replace>
              <title>Place on</title>
            </Replace>
          </div>
        )}
        {isUpgraded ? (
          <GreenField
            isHome={Position.equals(homePosition, position)}
            owner={controller}
          />
        ) : (
          <FacedownCard player={controller} />
        )}
      </div>
    </button>
  );
}
