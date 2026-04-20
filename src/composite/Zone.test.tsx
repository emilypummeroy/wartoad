import { fireEvent, screen } from '@testing-library/react';

import {
  gameflowOf,
  renderWithGameContext,
} from '../context/GameContext.test-utils';
import { createUnit } from '../state/card';
import { HOME } from '../state/pond';
import { UnitClass } from '../types/card';
import { Player, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { Zone } from './Zone';

const { North, South } = Player;
const { Idle, Deploying, Upgrading, Activating } = Subphase;

// TODO 9: The Activation related tests.
//
// Can't activate:
// | Deploying | Upgrading | Activating
// | units in [] | [opponent] | [opponent, opponent]
//
// Can click units to activate:
// & Idle
// & units in [player] | [player, opponent] | [player, player]
//

type Inputs = [
  controller: Player,
  turn: Player,
  Subphase,
  Position,
  upgraded: boolean,
  unitOwners: [] | [Player] | [Player, Player], // More is generally irrelevant
];

const Inputs = {
  controller: 0,
  turn: 1,
  subphase: 2,
  position: 3,
  upgraded: 4,
  unitOwners: 5,
} as const;

const frogletsOwnedBy = (owners: Player[]) =>
  owners.map((owner, key) =>
    createUnit({
      cardClass: UnitClass.Froglet,
      key,
      owner,
    }),
  );

// Have units Froglets: all
const itShouldHaveTheRightFroglets = (inputs: Inputs) => {
  const unitOwners = inputs[Inputs.unitOwners];
  it(`should have ${unitOwners.length} Froglets`, () => {
    const unitElements = screen.queryAllByRole('region', { name: /unit/ });
    expect(unitElements).toHaveLength(unitOwners.length);
  });

  it(`should have each Froglet owned by the right player`, () => {
    const unitElements = screen.queryAllByRole('region', { name: /unit/ });
    for (let i = 0; i < unitOwners.length; i += 1) {
      const element = unitElements[i];
      const owner = unitOwners[i];
      expect(element).toHaveAccessibleName(`${owner} unit Froglet`);
    }
  });
};

describe(Zone, () => {
  const onPlace = vi.fn<() => void>();

  const renderForInputs = ([
    controller,
    player,
    subphase,
    position,
    isUpgraded,
    unitOwners,
  ]: Inputs) => {
    renderWithGameContext([gameflowOf([player, subphase])])(
      <Zone
        controller={controller}
        position={position}
        zone={{ isUpgraded, units: frogletsOwnedBy(unitOwners) }}
        onPlace={onPlace}
      />,
    );
  };

  // Home Lily Pad: upgraded & Home
  describe.for<Inputs>([
    [North, North, Idle, HOME[North], true, []],
    [North, South, Deploying, HOME[North], true, [South]],
    [South, North, Upgrading, HOME[South], true, []],
    [South, South, Activating, HOME[South], true, [North, North]],
  ])(
    'controlled by %s | Home position %s | upgraded %s | units owned by %s | turn of %s | subphase %s',
    inputs => {
      const [controller] = inputs;

      beforeEach(() => renderForInputs(inputs));
      itShouldHaveTheRightFroglets(inputs);

      it(`should have a ${controller} Home Lily Pad`, () => {
        expect(
          screen.getByRole('region', { name: /Lily Pad/ }),
        ).toHaveAccessibleName(`${controller} Home Lily Pad`);
      });
    },
  );

  // Controlled Lily Pad: upgraded & !Home
  describe.for<Inputs>([
    [North, North, Upgrading, { x: 1, y: 2 }, true, [North, South]],
    [North, South, Activating, { x: 2, y: 0 }, true, [North]],
    [South, North, Idle, { x: 1, y: 4 }, true, []],
    [South, South, Deploying, { x: 0, y: 5 }, true, [South]],
  ])(
    'controlled by %s | turn of %s | subphase %s | non-Home position %s | upgraded? %s | units owned by %s',
    inputs => {
      const [controller] = inputs;
      beforeEach(() => renderForInputs(inputs));
      itShouldHaveTheRightFroglets(inputs);

      it(`should have a ${controller} controlled Lily Pad`, () => {
        expect(
          screen.getByRole('region', { name: /Lily Pad/ }),
        ).toHaveAccessibleName(`${controller} controlled Lily Pad`);
      });
    },
  );

  // Controlled leaf: !upgraded & !Home
  describe.for<Inputs>([
    [North, South, Upgrading, { x: 0, y: 2 }, false, []],
    [North, South, Deploying, { x: 1, y: 5 }, false, [South]],
    [South, North, Idle, { x: 1, y: 0 }, false, [North, South]],
    [South, North, Activating, { x: 2, y: 3 }, false, [North]],
  ])(
    'controlled by %s | turn of %s | subphase %s | non-Home position %s | upgraded? %s | units owned by %s',
    inputs => {
      const [controller] = inputs;
      beforeEach(() => renderForInputs(inputs));
      itShouldHaveTheRightFroglets(inputs);

      it(`should have a ${controller} controlled leaf`, () => {
        expect(
          screen.getByRole('region', { name: /leaf/ }),
        ).toHaveAccessibleName(`${controller} controlled leaf`);
        expect(
          screen.getByRole('region', { name: /controlled/ }),
        ).toHaveAccessibleName(`${controller} controlled leaf`);
      });
    },
  );

  // No dropzone on zone:
  // & Deploying | Activating | Idle | upgraded | not controlled by player
  // & Upgrading | Activating | Idle | not back row of player
  // & Upgrading | Deploying | Idle | not in range of activation start
  //
  // equivalent to:
  // | Idle
  // | Deploying & not back row
  // | Upgrading & upgraded & controlled by player
  // | Upgrading & not upgraded & not controlled by player
  // | Activating & not in range of activation start
  //
  // TODO 9: Add the Activating cases
  describe.for<Inputs>([
    // | Idle
    [North, North, Idle, { x: 0, y: 0 }, false, [South]],
    [South, North, Idle, { x: 1, y: 2 }, true, [North, South]],
    [North, South, Idle, { x: 2, y: 3 }, false, []],
    [South, South, Idle, { x: 0, y: 5 }, true, [North]],

    // | Deploying & not back row
    [North, North, Deploying, { x: 1, y: 1 }, false, [North, North]],
    [South, North, Deploying, { x: 2, y: 5 }, false, []],
    [North, South, Deploying, { x: 0, y: 0 }, false, [South, South]],
    [South, South, Deploying, { x: 1, y: 4 }, false, [North]],

    // | Upgrading & upgraded & controlled by player
    [North, North, Upgrading, { x: 2, y: 1 }, true, [North, South]],
    [North, North, Upgrading, { x: 0, y: 2 }, true, [North]],
    [South, South, Upgrading, { x: 1, y: 4 }, true, [South, North]],
    [South, South, Upgrading, { x: 2, y: 3 }, true, []],

    // | Upgrading & not upgraded & not controlled by player
    [South, North, Upgrading, { x: 0, y: 1 }, false, [North, South]],
    [South, North, Upgrading, { x: 1, y: 4 }, false, [North]],
    [North, South, Upgrading, { x: 2, y: 2 }, false, [South, North]],
    [North, South, Upgrading, { x: 0, y: 3 }, false, []],
  ])(
    'controlled by %s | turn of %s | subphase %s | position %s | upgraded? %s | units owned by %s',
    inputs => {
      beforeEach(() => renderForInputs(inputs));
      itShouldHaveTheRightFroglets(inputs);

      it('should not have any dropzone', () => {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });

      it('should not call onPlace if clicked', () => {
        for (const button of screen.queryAllByRole('button')) {
          fireEvent.click(button);
        }
        for (const region of screen.getAllByRole('region')) {
          fireEvent.click(region);
        }
        expect(onPlace).not.toHaveBeenCalled();
      });
    },
  );

  // Upgrading dropzone: Upgrading & not upgraded & not Home & controlled by player
  describe.for<Inputs>([
    // Modified from: Upgrading & upgraded & controlled by player
    [North, North, Upgrading, { x: 2, y: 1 }, false, [North, South]],
    [North, North, Upgrading, { x: 0, y: 2 }, false, [North]],
    [South, South, Upgrading, { x: 1, y: 4 }, false, [South, North]],
    [South, South, Upgrading, { x: 2, y: 3 }, false, []],
    // Modified from: Upgrading & not upgraded & not controlled by player
    [South, South, Upgrading, { x: 0, y: 1 }, false, [North, South]],
    [South, South, Upgrading, { x: 1, y: 4 }, false, [North]],
    [North, North, Upgrading, { x: 2, y: 2 }, false, [South, North]],
    [North, North, Upgrading, { x: 0, y: 3 }, false, []],
  ])(
    'controlled by %s | turn of %s | subphase %s | non-Home position %s | upgraded? %s | units owned by %s',
    inputs => {
      const [controller, , _, position] = inputs;
      beforeEach(() => renderForInputs(inputs));
      itShouldHaveTheRightFroglets(inputs);

      it('should have an Upgrade dropzone', () => {
        expect(
          screen.getByRole('button', {
            name: new RegExp(`Upgrade ${controller} controlled leaf`),
          }),
        ).toBeInTheDocument();
      });

      it('should call onPlace if clicked', () => {
        fireEvent.click(screen.getByRole('button', { name: /Upgrade/ }));
        expect(onPlace).toHaveBeenCalledWith(position);
      });
    },
  );
  // Deploying dropzone: Deploying & back row of player
  describe.for<Inputs>([
    // Modified from: Deploying & not back row
    [North, North, Deploying, { x: 1, y: 0 }, false, [North, North]],
    [South, North, Deploying, { x: 2, y: 0 }, false, []],
    [North, South, Deploying, { x: 0, y: 5 }, false, [South, South]],
    [South, South, Deploying, { x: 1, y: 5 }, false, [North]],
  ])(
    'controlled by %s | turn of %s | subphase %s | back row position %s | upgraded? %s | units owned by %s',
    inputs => {
      const [controller, , _, position] = inputs;
      beforeEach(() => renderForInputs(inputs));
      itShouldHaveTheRightFroglets(inputs);

      it('should have a Deploy dropzone', () => {
        expect(
          screen.getByRole('button', {
            name: new RegExp(`Deploy on ${controller} controlled leaf`),
          }),
        ).toBeInTheDocument();
      });

      it('should call onPlace if clicked', () => {
        fireEvent.click(screen.getByRole('button', { name: /Deploy/ }));
        expect(onPlace).toHaveBeenCalledWith(position);
      });
    },
  );
});
