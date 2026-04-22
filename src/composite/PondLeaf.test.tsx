import { screen } from '@testing-library/react';

import { activationOf, gameflowOf, renderWithGameContext } from '../context/GameContext.test-utils';
import { createUnit } from '../state/card';
import { HOME, INITIAL_POND, setPondStateAt } from '../state/pond';
import { UnitClass, type UnitCard } from '../types/card';
import { Phase, Player, PLAYER_AFTER, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { PondLeaf } from './PondLeaf';

const { North, South } = Player;
const { Start, Main, End } = Phase;
const { Idle, Deploying, Upgrading, Activating } = Subphase;

type Inputs = [
  controller: Player,
  turn: Player,
  Subphase,
  Position,
  upgraded: boolean,
  unitOwners: [] | [Player] | [Player, Player], // More is generally irrelevant
  activationStart?: Position,
];

const Inputs = {
  controller: 0,
  turn: 1,
  subphase: 2,
  position: 3,
  upgraded: 4,
  unitOwners: 5,
  activationStart: 6,
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

const itShouldNotHaveOpponentUpgradeOrActivateButtons = ([, player]: Inputs) => {
  const opponent = PLAYER_AFTER[player];

  // The concept only appies to Upgrading and Activating, not moving or deploying,
  // because you can only target your own stuff to Upgrade and activate
  // but you can target movement or deployment at any position.

  it(`should not have ${opponent}'s Activate buttons`, () => {
    expect(
      screen.queryByRole('button', {
        name: new RegExp(`Activate ${opponent}`),
      }),
    ).not.toBeInTheDocument();
  });

  it(`should not have ${opponent}'s Upgrade dropzone`, () => {
    expect(
      screen.queryByRole('button', {
        name: new RegExp(`Upgrade ${opponent}`),
      }),
    ).not.toBeInTheDocument();
  });
};

describe(PondLeaf, () => {
  const renderForInputsInMainPhase = (
    [controller, player, subphase, position, isUpgraded, unitOwners, activationStart]: Inputs,
    units: UnitCard[] = frogletsOwnedBy(unitOwners),
  ) => {
    renderWithGameContext([
      {
        ...activationOf(activationStart),
        ...gameflowOf([player, subphase, Main]),
        pond: setPondStateAt(INITIAL_POND, position, { isUpgraded, units }),
      },
    ])(<PondLeaf controller={controller} position={position} />);
  };

  // Home Lily Pad: upgraded & Home
  describe.for<Inputs>([
    [North, North, Idle, HOME[North], true, []],
    [North, South, Deploying, HOME[North], true, [South]],
    [South, North, Upgrading, HOME[South], true, []],
    [South, South, Activating, HOME[South], true, [North, North]],
  ])('controlled by %s | Home position %s | upgraded %s | units owned by %s | turn of %s | subphase %s', inputs => {
    const [controller] = inputs;
    beforeEach(() => renderForInputsInMainPhase(inputs));
    itShouldHaveTheRightFroglets(inputs);
    itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

    it(`should have a ${controller} Home Lily Pad`, () => {
      expect(screen.getByRole('region', { name: /Lily Pad/ })).toHaveAccessibleName(`${controller} Home Lily Pad`);
    });
  });

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
      beforeEach(() => renderForInputsInMainPhase(inputs));
      itShouldHaveTheRightFroglets(inputs);
      itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

      it(`should have a ${controller} controlled Lily Pad`, () => {
        expect(screen.getByRole('region', { name: /Lily Pad/ })).toHaveAccessibleName(
          `${controller} controlled Lily Pad`,
        );
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
      beforeEach(() => renderForInputsInMainPhase(inputs));
      itShouldHaveTheRightFroglets(inputs);
      itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

      it(`should have a ${controller} controlled leaf`, () => {
        expect(screen.getByRole('region', { name: /leaf/ })).toHaveAccessibleName(`${controller} controlled leaf`);
        expect(screen.getByRole('region', { name: /controlled/ })).toHaveAccessibleName(
          `${controller} controlled leaf`,
        );
      });
    },
  );

  // No dropzone on zone:
  describe.for<Inputs>([
    // | Idle
    [North, North, Idle, { x: 0, y: 0 }, false, [South]],
    [South, North, Idle, { x: 1, y: 2 }, true, [North, South]],
    [North, South, Idle, { x: 2, y: 3 }, false, []],
    [South, South, Idle, { x: 0, y: 5 }, true, [North]],

    // | Activating & not in range of start
    // Offsets: x+2, y-2, y+2, x-2
    [North, North, Activating, { x: 0, y: 0 }, false, [South], { x: 2, y: 0 }],
    [South, North, Activating, { x: 1, y: 2 }, true, [North, South], { x: 1, y: 0 }],
    [North, South, Activating, { x: 1, y: 3 }, false, [], { x: 1, y: 5 }],
    [South, South, Activating, { x: 2, y: 5 }, true, [North], { x: 0, y: 5 }],

    // | Deploying & not back row
    [North, North, Deploying, { x: 1, y: 1 }, true, [North, North]],
    [South, North, Deploying, { x: 2, y: 5 }, false, []],
    [North, South, Deploying, { x: 0, y: 0 }, true, [South, South]],
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
    'controlled by %s | turn of %s | subphase %s | position %s | upgraded? %s | units owned by %s | activated from %s',
    inputs => {
      beforeEach(() => renderForInputsInMainPhase(inputs));
      itShouldHaveTheRightFroglets(inputs);
      itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

      it('should not have a Deploy dropzone', () => {
        expect(screen.queryByRole('button', { name: /Deploy/ })).not.toBeInTheDocument();
      });

      it('should not have an Upgrade dropzone', () => {
        expect(screen.queryByRole('button', { name: /Upgrade/ })).not.toBeInTheDocument();
      });

      it('should not have a Move dropzone', () => {
        expect(screen.queryByRole('button', { name: /Move/ })).not.toBeInTheDocument();
      });
    },
  );

  // No dropzones or activation buttons if:
  // | Start phase & even if all other conditions are satisfied
  // | End phase & even if all other conditions are satisfied
  describe.for<[Phase, ...Inputs]>([
    [Start, North, North, Idle, { x: 0, y: 0 }, false, [North, North], { x: 1, y: 0 }],
    [Start, North, North, Activating, { x: 0, y: 0 }, false, [North, North], { x: 1, y: 0 }],
    [Start, North, North, Deploying, { x: 2, y: 0 }, false, [North, North], { x: 1, y: 0 }],
    [Start, North, North, Upgrading, { x: 2, y: 0 }, false, [North, North], { x: 1, y: 0 }],
    [Start, South, South, Idle, { x: 0, y: 5 }, false, [South, South], { x: 1, y: 5 }],
    [Start, South, South, Activating, { x: 0, y: 5 }, false, [South, South], { x: 1, y: 5 }],
    [Start, South, South, Deploying, { x: 2, y: 5 }, false, [South, South], { x: 1, y: 5 }],
    [Start, South, South, Upgrading, { x: 2, y: 5 }, false, [South, South], { x: 1, y: 5 }],
    [End, North, North, Idle, { x: 0, y: 0 }, false, [North, North], { x: 0, y: 1 }],
    [End, North, North, Activating, { x: 0, y: 0 }, false, [North, North], { x: 0, y: 1 }],
    [End, North, North, Deploying, { x: 2, y: 0 }, false, [North, North], { x: 2, y: 1 }],
    [End, North, North, Upgrading, { x: 2, y: 0 }, false, [North, North], { x: 2, y: 1 }],
    [End, South, South, Idle, { x: 0, y: 5 }, false, [South, South], { x: 0, y: 4 }],
    [End, South, South, Activating, { x: 0, y: 5 }, false, [South, South], { x: 0, y: 4 }],
    [End, South, South, Deploying, { x: 2, y: 5 }, false, [South, South], { x: 2, y: 4 }],
    [End, South, South, Upgrading, { x: 2, y: 5 }, false, [South, South], { x: 2, y: 4 }],
  ])(
    '<<Special case>> during %s phase | controlled by %s | turn of %s | subphase %s | position %s | upgraded? %s | units owned by %s | activated from %s',
    ([phase, ...input]) => {
      const [controller, player, subphase, position, isUpgraded, unitOwners, activationStart] = input;

      beforeEach(() => {
        renderWithGameContext([
          {
            ...gameflowOf([player, subphase, phase]),
            ...activationOf(activationStart),
            pond: setPondStateAt(INITIAL_POND, position, { isUpgraded, units: frogletsOwnedBy(unitOwners) }),
          },
        ])(<PondLeaf controller={controller} position={position} />);
      });
      itShouldHaveTheRightFroglets(input);
      itShouldNotHaveOpponentUpgradeOrActivateButtons(input);

      it('should not have a Deploy dropzone', () => {
        expect(screen.queryByRole('button', { name: /Deploy/ })).not.toBeInTheDocument();
      });

      it('should not have a Upgrade dropzone', () => {
        expect(screen.queryByRole('button', { name: /Upgrade/ })).not.toBeInTheDocument();
      });

      it('should not have a Move dropzone', () => {
        expect(screen.queryByRole('button', { name: /Move/ })).not.toBeInTheDocument();
      });

      it('should not have any Activate buttons', () => {
        expect(screen.queryByRole('button', { name: /Activate/ })).not.toBeInTheDocument();
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
      const [controller] = inputs;
      beforeEach(() => renderForInputsInMainPhase(inputs));
      itShouldHaveTheRightFroglets(inputs);
      itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

      it('should have an Upgrade dropzone', () => {
        expect(
          screen.getByRole('button', {
            name: `Upgrade ${controller} controlled leaf`,
          }),
        ).toBeInTheDocument();
      });

      it('should not have a Deploy dropzone', () => {
        expect(screen.queryByRole('button', { name: /Deploy/ })).not.toBeInTheDocument();
      });

      it('should not have a Move dropzone', () => {
        expect(screen.queryByRole('button', { name: /Move/ })).not.toBeInTheDocument();
      });

      it('should not have any Activate buttons', () => {
        expect(screen.queryByRole('button', { name: /Activate/ })).not.toBeInTheDocument();
      });
    },
  );

  // Deploying dropzone: Deploying & back row of player
  describe.for<Inputs>([
    // Modified from: Deploying & not back row
    [North, North, Deploying, { x: 1, y: 0 }, false, [North, North]],
    [South, North, Deploying, { x: 2, y: 0 }, true, []],
    [North, South, Deploying, { x: 0, y: 5 }, true, [South, South]],
    [South, South, Deploying, { x: 1, y: 5 }, false, [North]],
  ])(
    'controlled by %s | turn of %s | subphase %s | back row position %s | upgraded? %s | units owned by %s',
    inputs => {
      const [controller, , _, , isUpgraded] = inputs;
      beforeEach(() => renderForInputsInMainPhase(inputs));
      itShouldHaveTheRightFroglets(inputs);
      itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

      it('should have a Deploy dropzone', () => {
        expect(
          screen.getByRole('button', {
            name: `Deploy on ${controller} controlled ${isUpgraded ? 'Lily Pad' : 'leaf'}`,
          }),
        ).toBeInTheDocument();
      });

      it('should not have a Upgrade dropzone', () => {
        expect(screen.queryByRole('button', { name: /Upgrade/ })).not.toBeInTheDocument();
      });

      it('should not have a Move dropzone', () => {
        expect(screen.queryByRole('button', { name: /Move/ })).not.toBeInTheDocument();
      });

      it(`should not have any Activate buttons`, () => {
        expect(screen.queryByRole('button', { name: /Activate/ })).not.toBeInTheDocument();
      });
    },
  );

  // Move dropzone: Activating & in range of start
  describe.for<Inputs>([
    // Modified from: Activating & not in range of start
    // Offsets: x+1, y-1, y+1, x-1
    [North, North, Activating, { x: 1, y: 0 }, false, [South], { x: 2, y: 0 }],
    [South, North, Activating, { x: 0, y: 1 }, true, [North, South], { x: 0, y: 0 }],
    [North, South, Activating, { x: 2, y: 4 }, false, [], { x: 2, y: 5 }],
    [South, South, Activating, { x: 1, y: 5 }, true, [North], { x: 0, y: 5 }],

    // | Activating & same position as start
    [North, North, Activating, { x: 1, y: 4 }, false, [South], { x: 1, y: 4 }],
    [South, South, Activating, { x: 0, y: 3 }, true, [North], { x: 0, y: 3 }],
  ])(
    'controlled by %s | turn of %s | subphase %s | position %s | upgraded? %s | units owned by %s | activated from %s',
    inputs => {
      const [controller, , _, , isUpgraded] = inputs;
      beforeEach(() => renderForInputsInMainPhase(inputs));
      itShouldHaveTheRightFroglets(inputs);
      itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

      it('should have a Move dropzone', () => {
        expect(
          screen.getByRole('button', {
            name: new RegExp(`Move to ${controller} (controlled|Home) ${isUpgraded ? 'Lily Pad' : 'leaf'}`),
          }),
        ).toBeInTheDocument();
      });

      it('should not have a Deploy dropzone', () => {
        expect(screen.queryByRole('button', { name: /Deploy/ })).not.toBeInTheDocument();
      });

      it('should not have a Upgrade dropzone', () => {
        expect(screen.queryByRole('button', { name: /Upgrade/ })).not.toBeInTheDocument();
      });

      it(`should not have any Activate buttons`, () => {
        expect(screen.queryByRole('button', { name: /Activate/ })).not.toBeInTheDocument();
      });
    },
  );

  // Can click units to activate:
  // Idle & units in [player] | [opponent, player] | [player, opponent] | [player, player]
  describe.for<Inputs>([
    [South, North, Idle, { x: 2, y: 0 }, false, [North]],
    [South, North, Idle, { x: 1, y: 1 }, true, [North, South]],
    [North, North, Idle, { x: 0, y: 2 }, false, [South, North]],
    [North, North, Idle, { x: 2, y: 3 }, true, [North, North]],
    [South, South, Idle, { x: 0, y: 4 }, true, [South]],
    [South, South, Idle, { x: 1, y: 5 }, false, [North, South]],
    [North, South, Idle, { x: 2, y: 0 }, true, [South, North]],
    [North, South, Idle, { x: 0, y: 1 }, false, [South, South]],
  ])('controlled by %s | turn of %s | subphase %s | position %s | upgraded? %s | units owned by %s', inputs => {
    const [, player, , _, , unitOwners] = inputs;
    const units = frogletsOwnedBy(unitOwners);
    const playerUnits = units.filter(({ owner }) => owner === player);
    beforeEach(() => renderForInputsInMainPhase(inputs, units));
    itShouldHaveTheRightFroglets(inputs);
    itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

    it(`should have ${player}'s Activate buttons`, () => {
      expect(
        screen.getAllByRole('button', {
          name: `Activate ${player} unit Froglet`,
        }),
      ).toHaveLength(units.filter(({ owner }) => owner === player).length);
    });

    it('should call activate if units are clicked', () => {
      const cards = screen.getAllByRole('button', { name: /Activate/ });
      expect(cards).toHaveLength(playerUnits.length);
    });
  });

  // Cannot click units to activate:
  // Idle & units in [] | [opponent]
  // Activating & units = [player]
  // Deploying & units = [player]
  // Upgrading & units = [player]
  describe.for<Inputs>([
    [North, North, Idle, { x: 2, y: 3 }, true, []],
    [North, North, Idle, { x: 1, y: 4 }, false, [South]],
    [North, North, Activating, { x: 0, y: 5 }, true, [North]],
    [South, North, Deploying, { x: 2, y: 0 }, false, [North]],
    [South, North, Upgrading, { x: 1, y: 1 }, true, [North]],
    [South, South, Idle, { x: 0, y: 2 }, true, []],
    [North, South, Idle, { x: 2, y: 3 }, false, [North]],
    [North, South, Activating, { x: 1, y: 4 }, true, [South]],
    [South, South, Deploying, { x: 0, y: 5 }, false, [South]],
    [South, South, Upgrading, { x: 2, y: 0 }, true, [South]],
  ])('controlled by %s | turn of %s | subphase %s | position %s | upgraded? %s | units owned by %s', inputs => {
    beforeEach(() => renderForInputsInMainPhase(inputs));
    itShouldHaveTheRightFroglets(inputs);
    itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

    it(`should not have any Activate buttons`, () => {
      expect(screen.queryByRole('button', { name: /Activate/ })).not.toBeInTheDocument();
    });
  });
});
