import { screen } from '@testing-library/react';

import { renderWithGameContext } from '../context/GameContext.test-utils';
import { createUnit } from '../state-types/card';
import { HOME, setPondStateAt } from '../state-types/pond';
import { INITIAL_POND } from '../state-types/pond.test-utils';
import { activationOf, gameflowOf } from '../state/test-utils';
import { CardClass, CardKey, UnitClass, type LeafKey, type UnitState } from '../types/card';
import { Phase, Player, PLAYER_AFTER } from '../types/gameflow';
import type { Position } from '../types/position';
import { _ } from '../types/test-utils';
import { PondLeaf } from './PondLeaf';

const { North, South } = Player;
const { Deploying, Upgrading, Activating, Start, End, Main, GameOver } = Phase;
const { LilyPad } = CardKey;

type Inputs = [
  controller: Player,
  turn: Player,
  Phase,
  Position,
  leafKey?: LeafKey,
  unitOwners?: [] | [Player] | [Player, Player], // More is generally irrelevant
  activationStart?: Position,
];

const Inputs = {
  controller: 0,
  turn: 1,
  phase: 2,
  position: 3,
  leafKey: 4,
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
  const unitOwners = inputs[Inputs.unitOwners] ?? [];

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
  const renderForInputs = (
    [controller, player, phase, position, leafKey, unitOwners = [], activationStart]: Inputs,
    units: UnitState[] = frogletsOwnedBy(unitOwners),
  ) => {
    const leaf = leafKey ? CardClass[leafKey] : undefined;
    renderWithGameContext([
      {
        ...(phase === Activating && activationOf(player, _, activationStart)),
        ...gameflowOf(player, phase),
        pond: setPondStateAt(INITIAL_POND, position, { leaf, units, controller }),
      },
    ])(<PondLeaf position={position} />);
  };

  // Home Lily Pad: upgraded & Home
  describe.for<Inputs>([
    [North, North, Main, HOME[North], LilyPad, []],
    [North, South, Deploying, HOME[North], LilyPad, [South]],
    [South, North, Upgrading, HOME[South], LilyPad, []],
    [South, South, Activating, HOME[South], LilyPad, [North, North]],
  ])('controlled by %s | %s %s | Home position %s | leaf card %s | units owned by %s', inputs => {
    const [controller] = inputs;
    beforeEach(() => renderForInputs(inputs));
    itShouldHaveTheRightFroglets(inputs);
    itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

    it(`should have a ${controller} Home Lily Pad`, () => {
      expect(screen.getByRole('region', { name: /Lily Pad/ })).toHaveAccessibleName(`${controller} Home Lily Pad`);
    });
  });

  // Controlled Lily Pad: upgraded & !Home
  describe.for<Inputs>([
    [North, North, Upgrading, { x: 1, y: 2 }, LilyPad, [North, South]],
    [North, South, Activating, { x: 2, y: 0 }, LilyPad, [North]],
    [South, North, Main, { x: 1, y: 4 }, LilyPad, []],
    [South, South, Deploying, { x: 0, y: 5 }, LilyPad, [South]],
  ])('controlled by %s | %s %s | non-Home position %s | upgraded %s | units owned by %s', inputs => {
    const [controller] = inputs;
    beforeEach(() => renderForInputs(inputs));
    itShouldHaveTheRightFroglets(inputs);
    itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

    it(`should have a ${controller} controlled Lily Pad`, () => {
      expect(screen.getByRole('region', { name: /Lily Pad/ })).toHaveAccessibleName(
        `${controller} controlled Lily Pad`,
      );
    });
  });

  // Controlled leaf: !upgraded & !Home
  describe.for<Inputs>([
    [North, South, Upgrading, { x: 0, y: 2 }, _, []],
    [North, South, Deploying, { x: 1, y: 5 }, _, [South]],
    [South, North, Main, { x: 1, y: 0 }, _, [North, South]],
    [South, North, Activating, { x: 2, y: 3 }, _, [North]],
  ])('controlled by %s | %s %s | non-Home position %s | upgraded %s | units owned by %s', inputs => {
    const [controller] = inputs;
    beforeEach(() => renderForInputs(inputs));
    itShouldHaveTheRightFroglets(inputs);
    itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

    it(`should have a ${controller} controlled leaf`, () => {
      expect(screen.getByRole('region', { name: /leaf/ })).toHaveAccessibleName(`${controller} controlled leaf`);
      expect(screen.getByRole('region', { name: /controlled/ })).toHaveAccessibleName(`${controller} controlled leaf`);
    });
  });

  // No dropzone on zone:
  describe.for<Inputs>([
    // | Idle
    [North, North, Main, { x: 0, y: 0 }, _, [South]],
    [South, North, Main, { x: 1, y: 2 }, LilyPad, [North, South]],
    [North, South, Main, { x: 2, y: 3 }, _, []],
    [South, South, Main, { x: 0, y: 5 }, LilyPad, [North]],

    // | Start
    [North, North, Start, { x: 0, y: 0 }, _, [South]],
    [South, North, Start, { x: 1, y: 2 }, LilyPad, [North, South]],
    [North, South, Start, { x: 2, y: 3 }, _, []],
    [South, South, Start, { x: 0, y: 5 }, LilyPad, [North]],
    // | End
    [North, North, End, { x: 0, y: 0 }, _, [South]],
    [South, North, End, { x: 1, y: 2 }, LilyPad, [North, South]],
    [North, South, End, { x: 2, y: 3 }, _, []],
    [South, South, End, { x: 0, y: 5 }, LilyPad, [North]],
    // | GameOver
    [North, North, GameOver, { x: 0, y: 0 }, _, [South]],
    [South, North, GameOver, { x: 1, y: 2 }, LilyPad, [North, South]],
    [North, South, GameOver, { x: 2, y: 3 }, _, []],
    [South, South, GameOver, { x: 0, y: 5 }, LilyPad, [North]],
    // | Activating & not in range of start
    // Offsets: x+2, y-2, y+2, x-2
    [North, North, Activating, { x: 0, y: 0 }, _, [South], { x: 2, y: 0 }],
    [South, North, Activating, { x: 1, y: 2 }, LilyPad, [North, South], { x: 1, y: 0 }],
    [North, South, Activating, { x: 1, y: 3 }, _, [], { x: 1, y: 5 }],
    [South, South, Activating, { x: 2, y: 5 }, LilyPad, [North], { x: 0, y: 5 }],

    // | Deploying & not back row
    [North, North, Deploying, { x: 1, y: 1 }, LilyPad, [North, North]],
    [South, North, Deploying, { x: 2, y: 5 }, _, []],
    [North, South, Deploying, { x: 0, y: 0 }, LilyPad, [South, South]],
    [South, South, Deploying, { x: 1, y: 4 }, _, [North]],

    // | Upgrading & upgraded & controlled by player
    [North, North, Upgrading, { x: 1, y: 0 }, LilyPad, [North, South]],
    [North, North, Upgrading, { x: 0, y: 2 }, LilyPad, [North]],
    [South, South, Upgrading, { x: 1, y: 5 }, LilyPad, [South, North]],
    [South, South, Upgrading, { x: 2, y: 3 }, LilyPad, []],

    // | Upgrading & not upgraded & not controlled by player
    [South, North, Upgrading, { x: 0, y: 1 }, _, [North, South]],
    [South, North, Upgrading, { x: 1, y: 4 }, _, [North]],
    [North, South, Upgrading, { x: 2, y: 2 }, _, [South, North]],
    [North, South, Upgrading, { x: 0, y: 3 }, _, []],
  ])('controlled by %s | %s %s | %s | upgraded %s | units owned by %s | activation.start %s', inputs => {
    beforeEach(() => renderForInputs(inputs));
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
  });

  // Upgrading dropzone: Upgrading & not upgraded & not Home & controlled by player
  describe.for<Inputs>([
    // Modified from: Upgrading & upgraded & controlled by player
    [North, North, Upgrading, { x: 2, y: 1 }, _, [North, South]],
    [North, North, Upgrading, { x: 0, y: 2 }, _, [North]],
    [South, South, Upgrading, { x: 1, y: 4 }, _, [South, North]],
    [South, South, Upgrading, { x: 2, y: 3 }, _, []],
    // Modified from: Upgrading & not upgraded & not controlled by player
    [South, South, Upgrading, { x: 0, y: 1 }, _, [North, South]],
    [South, South, Upgrading, { x: 1, y: 4 }, _, [North]],
    [North, North, Upgrading, { x: 2, y: 2 }, _, [South, North]],
    [North, North, Upgrading, { x: 0, y: 3 }, _, []],
  ])('controlled by %s | %s %s | non-home %s | upgraded %s | units owned by %s', inputs => {
    const [controller] = inputs;
    beforeEach(() => renderForInputs(inputs));
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
  });

  // Deploying dropzone: Deploying & back row of player
  describe.for<Inputs>([
    // Modified from: Deploying & not back row
    [North, North, Deploying, { x: 1, y: 0 }, _, [North, North]],
    [South, North, Deploying, { x: 2, y: 0 }, LilyPad, []],
    [North, South, Deploying, { x: 0, y: 5 }, LilyPad, [South, South]],
    [South, South, Deploying, { x: 1, y: 5 }, _, [North]],
  ])('controlled by %s | %s %s | back row %s | upgraded %s | units owned by %s', inputs => {
    const [controller, , _, , isUpgraded] = inputs;
    beforeEach(() => renderForInputs(inputs));
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
  });

  // Move dropzone: Activating & in range of start
  describe.for<Inputs>([
    // Modified from: Activating & not in range of start
    // Offsets: x+1, y-1, y+1, x-1
    [North, North, Activating, { x: 1, y: 0 }, _, [South], { x: 2, y: 0 }],
    [South, North, Activating, { x: 0, y: 1 }, LilyPad, [North, South], { x: 0, y: 0 }],
    [North, South, Activating, { x: 2, y: 4 }, _, [], { x: 2, y: 5 }],
    [South, South, Activating, { x: 1, y: 5 }, LilyPad, [North], { x: 0, y: 5 }],

    // | Activating & same position as start
    [North, North, Activating, { x: 1, y: 4 }, _, [South], { x: 1, y: 4 }],
    [South, South, Activating, { x: 0, y: 3 }, LilyPad, [North], { x: 0, y: 3 }],
  ])('controlled by %s | %s %s | %s | upgraded %s | units owned by %s | activation.start %s', inputs => {
    const [controller, , _, , isUpgraded] = inputs;
    beforeEach(() => renderForInputs(inputs));
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
  });

  // Can click units to activate:
  // Idle & units in [player] | [opponent, player] | [player, opponent] | [player, player]
  describe.for<Inputs>([
    [South, North, Main, { x: 2, y: 0 }, _, [North]],
    [South, North, Main, { x: 1, y: 1 }, LilyPad, [North, South]],
    [North, North, Main, { x: 0, y: 2 }, _, [South, North]],
    [North, North, Main, { x: 2, y: 3 }, LilyPad, [North, North]],
    [South, South, Main, { x: 0, y: 4 }, LilyPad, [South]],
    [South, South, Main, { x: 1, y: 5 }, _, [North, South]],
    [North, South, Main, { x: 2, y: 0 }, LilyPad, [South, North]],
    [North, South, Main, { x: 0, y: 1 }, _, [South, South]],
  ])('controlled by %s | %s %s | %s | upgraded %s | units owned by %s', inputs => {
    const [, player, , _, , unitOwners = []] = inputs;
    const units = frogletsOwnedBy(unitOwners);
    const playerUnits = units.filter(({ owner }) => owner === player);
    beforeEach(() => renderForInputs(inputs, units));
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
  // Start phase
  // End phase
  // GameOver
  describe.for<Inputs>([
    [North, North, Start, { x: 2, y: 3 }, LilyPad, []],
    [North, North, End, { x: 2, y: 3 }, LilyPad, []],
    [North, North, GameOver, { x: 2, y: 3 }, LilyPad, []],
    [North, North, Main, { x: 2, y: 3 }, LilyPad, []],
    [North, North, Main, { x: 1, y: 4 }, _, [South]],
    [North, North, Activating, { x: 0, y: 5 }, LilyPad, [North]],
    [South, North, Deploying, { x: 2, y: 0 }, _, [North]],
    [South, North, Upgrading, { x: 1, y: 1 }, LilyPad, [North]],
    [South, South, Start, { x: 2, y: 3 }, LilyPad, []],
    [South, South, End, { x: 2, y: 3 }, LilyPad, []],
    [South, South, GameOver, { x: 2, y: 3 }, LilyPad, []],
    [South, South, Main, { x: 0, y: 2 }, LilyPad, []],
    [North, South, Main, { x: 2, y: 3 }, _, [North]],
    [North, South, Activating, { x: 1, y: 4 }, LilyPad, [South]],
    [South, South, Deploying, { x: 0, y: 5 }, _, [South]],
    [South, South, Upgrading, { x: 2, y: 0 }, LilyPad, [South]],
  ])('controlled by %s | %s %s | %s | upgraded %s | units owned by %s', inputs => {
    beforeEach(() => renderForInputs(inputs));
    itShouldHaveTheRightFroglets(inputs);
    itShouldNotHaveOpponentUpgradeOrActivateButtons(inputs);

    it(`should not have any Activate buttons`, () => {
      expect(screen.queryByRole('button', { name: /Activate/ })).not.toBeInTheDocument();
    });
  });
});
