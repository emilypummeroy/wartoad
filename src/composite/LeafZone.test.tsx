import { fireEvent, screen } from '@testing-library/react';

import { activationOf, gameflowOf, renderWithGameContext } from '../context/GameContext.test-utils';
import { createUnit } from '../state/card';
import { HOME, INITIAL_POND, setPondStateAt } from '../state/pond';
import { UnitClass, type UnitCard } from '../types/card';
import { Phase, Player, PLAYER_AFTER, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { LeafAndDropzone } from './LeafZone';

const { North, South } = Player;
const { Start, Main, End } = Phase;
const { Idle, Deploying, Upgrading, Activation } = Subphase;

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

describe(LeafAndDropzone, () => {
  const onPlace = vi.fn<() => void>();
  const activate = vi.fn<(c: UnitCard, p: Position) => void>();

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
      { activate },
    ])(<LeafAndDropzone controller={controller} position={position} onCardPlaced={onPlace} />);
  };

  // Home Lily Pad: upgraded & Home
  describe.for<Inputs>([
    [North, North, Idle, HOME[North], true, []],
    [North, South, Deploying, HOME[North], true, [South]],
    [South, North, Upgrading, HOME[South], true, []],
    [South, South, Activation, HOME[South], true, [North, North]],
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
    [North, South, Activation, { x: 2, y: 0 }, true, [North]],
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
    [South, North, Activation, { x: 2, y: 3 }, false, [North]],
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
    [North, North, Activation, { x: 0, y: 0 }, false, [South], { x: 2, y: 0 }],
    [South, North, Activation, { x: 1, y: 2 }, true, [North, South], { x: 1, y: 0 }],
    [North, South, Activation, { x: 1, y: 3 }, false, [], { x: 1, y: 5 }],
    [South, South, Activation, { x: 2, y: 5 }, true, [North], { x: 0, y: 5 }],

    // | Activating & same position as start
    [North, North, Activation, { x: 1, y: 4 }, false, [South], { x: 1, y: 4 }],
    [South, South, Activation, { x: 0, y: 3 }, true, [North], { x: 0, y: 3 }],

    // | Activating & no activation state
    [North, North, Activation, { x: 2, y: 2 }, false, [South]],
    [South, South, Activation, { x: 1, y: 5 }, true, [North]],

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

  // No dropzones or activation buttons if:
  // | Start phase & even if all other conditions are satisfied
  // | End phase & even if all other conditions are satisfied
  // TODO 9: Add a case for Activation subphase
  describe.for<[Phase, ...Inputs]>([
    [Start, North, North, Idle, { x: 0, y: 0 }, false, [North, North], { x: 1, y: 0 }],
    [Start, North, North, Activation, { x: 0, y: 0 }, false, [North, North], { x: 1, y: 0 }],
    [Start, North, North, Deploying, { x: 2, y: 0 }, false, [North, North], { x: 1, y: 0 }],
    [Start, North, North, Upgrading, { x: 2, y: 0 }, false, [North, North], { x: 1, y: 0 }],
    [Start, South, South, Idle, { x: 0, y: 5 }, false, [South, South], { x: 1, y: 5 }],
    [Start, South, South, Activation, { x: 0, y: 5 }, false, [South, South], { x: 1, y: 5 }],
    [Start, South, South, Deploying, { x: 2, y: 5 }, false, [South, South], { x: 1, y: 5 }],
    [Start, South, South, Upgrading, { x: 2, y: 5 }, false, [South, South], { x: 1, y: 5 }],
    [End, North, North, Idle, { x: 0, y: 0 }, false, [North, North], { x: 0, y: 1 }],
    [End, North, North, Activation, { x: 0, y: 0 }, false, [North, North], { x: 0, y: 1 }],
    [End, North, North, Deploying, { x: 2, y: 0 }, false, [North, North], { x: 2, y: 1 }],
    [End, North, North, Upgrading, { x: 2, y: 0 }, false, [North, North], { x: 2, y: 1 }],
    [End, South, South, Idle, { x: 0, y: 5 }, false, [South, South], { x: 0, y: 4 }],
    [End, South, South, Activation, { x: 0, y: 5 }, false, [South, South], { x: 0, y: 4 }],
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
        ])(<LeafAndDropzone controller={controller} position={position} onCardPlaced={onPlace} />);
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
      const [controller, , _, position] = inputs;
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
    [South, North, Deploying, { x: 2, y: 0 }, true, []],
    [North, South, Deploying, { x: 0, y: 5 }, true, [South, South]],
    [South, South, Deploying, { x: 1, y: 5 }, false, [North]],
  ])(
    'controlled by %s | turn of %s | subphase %s | back row position %s | upgraded? %s | units owned by %s',
    inputs => {
      const [controller, , _, position, isUpgraded] = inputs;
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

      it('should call onPlace if clicked', () => {
        fireEvent.click(screen.getByRole('button', { name: /Deploy/ }));
        expect(onPlace).toHaveBeenCalledWith(position);
      });
    },
  );

  // Move dropzone: Activating & in range of start
  describe.for<Inputs>([
    // Modified from: Activating & not in range of start
    // Offsets: x+1, y-1, y+1, x-1
    [North, North, Activation, { x: 1, y: 0 }, false, [South], { x: 2, y: 0 }],
    [South, North, Activation, { x: 0, y: 1 }, true, [North, South], { x: 0, y: 0 }],
    [North, South, Activation, { x: 2, y: 4 }, false, [], { x: 2, y: 5 }],
    [South, South, Activation, { x: 1, y: 5 }, true, [North], { x: 0, y: 5 }],
  ])(
    'controlled by %s | turn of %s | subphase %s | position %s | upgraded? %s | units owned by %s | activated from %s',
    inputs => {
      const [controller, , _, position, isUpgraded] = inputs;
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

      // TODO 9: unskip
      it.skip('should call commitActivation if clicked', () => {
        fireEvent.click(screen.getByRole('button', { name: /Move/ }));
        // TODO 9: change to commitActivation
        expect(onPlace).toHaveBeenCalledWith(position);
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
    const [, player, , position, , unitOwners] = inputs;
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
      for (let i = 0; i < playerUnits.length; i += 1) {
        fireEvent.click(cards[i]);
        expect(activate).toHaveBeenCalledWith(playerUnits[i], position);
      }
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
    [North, North, Activation, { x: 0, y: 5 }, true, [North]],
    [South, North, Deploying, { x: 2, y: 0 }, false, [North]],
    [South, North, Upgrading, { x: 1, y: 1 }, true, [North]],
    [South, South, Idle, { x: 0, y: 2 }, true, []],
    [North, South, Idle, { x: 2, y: 3 }, false, [North]],
    [North, South, Activation, { x: 1, y: 4 }, true, [South]],
    [South, South, Deploying, { x: 0, y: 5 }, false, [South]],
    [South, South, Upgrading, { x: 2, y: 0 }, true, [South]],
  ])('controlled by %s | turn of %s | subphase %s | position %s | upgraded? %s | units owned by %s', inputs => {
    beforeEach(() => renderForInputsInMainPhase(inputs));
    itShouldHaveTheRightFroglets(inputs);
    itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

    it(`should not have any Activate buttons`, () => {
      expect(screen.queryByRole('button', { name: /Activate/ })).not.toBeInTheDocument();
    });

    it('should not call activate if units are clicked', () => {
      const cards = screen.queryAllByRole('region', { name: /unit/ });
      for (const card of cards) {
        fireEvent.click(card);
      }
      expect(activate).not.toHaveBeenCalled();
    });
  });
});
