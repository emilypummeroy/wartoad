import { fireEvent, render, screen } from '@testing-library/react';

import { activationOf, gameflowOf, renderWithGameContext } from '../context/GameContext.test-utils';
import { HOME } from '../state/pond';
import { TEST_PONDS_BY_KEY, ANOTHER_POND_POSITIONS, TestPondKey } from '../state/pond.test-utils';
import type { UnitCard } from '../types/card';
import { Player, Phase, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { PondLeafDropzone } from './PondLeafDropzone';

const { North, South } = Player;
const { Start, Main, End } = Phase;
const { Idle, Upgrading, Deploying, Activating } = Subphase;

const { INITIAL_POND, ANOTHER_POND, FULL_POND, EMPTY_POND, UNITS_POND } = TestPondKey;
const NORTH_POSITION = ANOTHER_POND_POSITIONS.North;
const SOUTH_POSITION = ANOTHER_POND_POSITIONS.South;

type Inputs = [
  controller: Player,
  turnOf: Player,
  Position,
  Subphase,
  pond?: TestPondKey,
  phase?: Phase,
  start?: Position,
];

// ###
// # Outputs:
// > No dropzones
// > Upgrade dropzone
// > Deploy dropzone
// > Move dropzone
describe(PondLeafDropzone, () => {
  const TEST_TARGET_ID = 'test-label-id';
  const TEST_LABEL = 'the Target';
  const CHILD_TEXT = 'Hello';

  const it_should_render_its_children = () => {
    it('should render its children', () => {
      expect(screen.getByText(CHILD_TEXT)).toBeVisible();
    });
  };

  const commitUpgrade = vi.fn<(p: Position) => void>();
  const commitDeploy = vi.fn<(p: Position) => void>();
  const commitActivate = vi.fn<(p: Position) => void>();
  const activate = vi.fn<(c: UnitCard, p: Position) => void>();
  const beforeEach_render_with_subphase = ([controller, player, position, subphase, pondKey, phase, start]: Inputs) => {
    beforeEach(() => {
      const pond = TEST_PONDS_BY_KEY[pondKey ?? INITIAL_POND];
      renderWithGameContext([
        { pond, ...gameflowOf(player, subphase, phase), ...activationOf(start) },
        { activate, commitUpgrade, commitDeploy, commitActivate },
      ])(
        <PondLeafDropzone targetLabelId={TEST_TARGET_ID} position={position} controller={controller}>
          <div id={TEST_TARGET_ID} aria-label={TEST_LABEL}>
            Hello
          </div>
        </PondLeafDropzone>,
      );
    });
  };

  describe('without context', () => {
    beforeEach(() => {
      render(
        <PondLeafDropzone targetLabelId={TEST_TARGET_ID} position={{ x: 2, y: 2 }} controller={Player.South}>
          <div id={TEST_TARGET_ID} aria-label={TEST_LABEL}>
            Hello
          </div>
        </PondLeafDropzone>,
      );
    });
    it_should_render_its_children();
  });

  // ###
  // # Inputs for > No dropzones
  describe.for<Inputs>([
    // < Start phase
    [North, North, { x: 0, y: 0 }, Idle, INITIAL_POND, Start],
    [South, North, { x: 2, y: 0 }, Upgrading, EMPTY_POND, Start],
    [North, South, { x: 0, y: 5 }, Deploying, UNITS_POND, Start],
    [South, South, { x: 2, y: 5 }, Activating, FULL_POND, Start],
    // < End phase
    [North, North, { x: 1, y: 0 }, Idle, FULL_POND, End],
    [South, North, { x: 1, y: 1 }, Upgrading, INITIAL_POND, End],
    [North, South, { x: 1, y: 5 }, Deploying, EMPTY_POND, End],
    [South, South, { x: 1, y: 4 }, Activating, UNITS_POND, End],
    // < Idle
    [North, North, { x: 0, y: 0 }, Idle, INITIAL_POND],
    [South, North, { x: 2, y: 0 }, Idle, EMPTY_POND],
    [North, South, { x: 0, y: 5 }, Idle, UNITS_POND],
    [South, South, { x: 2, y: 5 }, Idle, FULL_POND],
    // < Upgrading & not controller
    [South, North, SOUTH_POSITION.LeafMiddle, Upgrading, ANOTHER_POND],
    [South, North, SOUTH_POSITION.LeafEdge, Upgrading, ANOTHER_POND],
    [North, South, NORTH_POSITION.LeafMiddle, Upgrading, ANOTHER_POND],
    [North, South, NORTH_POSITION.LeafEdge, Upgrading, ANOTHER_POND],
    // < Upgrading & upgraded
    [North, North, HOME[North], Upgrading, INITIAL_POND],
    [North, North, { x: 2, y: 1 }, Upgrading, FULL_POND],
    [South, South, HOME[South], Upgrading, INITIAL_POND],
    [South, South, { x: 0, y: 4 }, Upgrading, FULL_POND],
    // < Deploying & not home row
    [North, North, { x: 1, y: 1 }, Deploying],
    [South, North, { x: 0, y: 5 }, Deploying],
    [South, South, { x: 2, y: 4 }, Deploying],
    [North, South, { x: 1, y: 0 }, Deploying],
    // < Activating & out of range of start
    [North, North, { x: 0, y: 0 }, Activating, UNITS_POND, Main, { x: 2, y: 0 }],
    [South, North, { x: 2, y: 0 }, Activating, UNITS_POND, Main, { x: 0, y: 0 }],
    [South, South, { x: 0, y: 5 }, Activating, UNITS_POND, Main, { x: 2, y: 5 }],
    [North, South, { x: 2, y: 5 }, Activating, UNITS_POND, Main, { x: 0, y: 5 }],
  ])('controlled by %s on %s turn at %s while %s | pond?: %s | phase?: %s | start?: %s', inputs => {
    beforeEach_render_with_subphase(inputs);
    it_should_render_its_children();

    it('should have no dropzones', () => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not call commitUpgrade when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitUpgrade).not.toHaveBeenCalled();
    });

    it('should not call commitDeploy when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitDeploy).not.toHaveBeenCalled();
    });

    it('should not call commitActivate when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitActivate).not.toHaveBeenCalled();
    });
  });

  // ###
  // # Inputs for > Upgrade dropzone
  describe.for<Inputs>([
    // < Upgrading & controlled & not upgraded
    [North, North, { x: 1, y: 2 }, Upgrading, INITIAL_POND],
    [South, South, { x: 2, y: 5 }, Upgrading, INITIAL_POND],
    [North, North, NORTH_POSITION.LeafEdge, Upgrading, ANOTHER_POND],
    [North, North, NORTH_POSITION.LeafHomeRow, Upgrading, ANOTHER_POND],
    [South, South, SOUTH_POSITION.LeafEdge, Upgrading, ANOTHER_POND],
    [South, South, SOUTH_POSITION.LeafEdge, Upgrading, ANOTHER_POND],
  ])('controlled by %s on %s turn at %s while %s | pond: %s', inputs => {
    const [_, __, position] = inputs;
    beforeEach_render_with_subphase(inputs);
    it_should_render_its_children();

    it('should have an Upgrade dropzone', () => {
      expect(screen.getByRole('button', { name: `Upgrade ${TEST_LABEL}` })).toBeVisible();
    });

    it('should call commitUpgrade when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitUpgrade).toHaveBeenCalledExactlyOnceWith(position);
    });

    it('should have no Deploy dropzone', () => {
      expect(screen.queryByRole('button', { name: /Deploy/ })).not.toBeInTheDocument();
    });

    it('should not call commitDeploy when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitDeploy).not.toHaveBeenCalled();
    });

    it('should have no Move dropzone', () => {
      expect(screen.queryByRole('button', { name: /Move/ })).not.toBeInTheDocument();
    });

    it('should not call commitActivate when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitActivate).not.toHaveBeenCalled();
    });
  });

  // ###
  // # Inputs for > Deploy dropzone
  describe.for<Inputs>([
    // < Deploying & home row
    [South, North, { x: 0, y: 0 }, Deploying],
    [North, North, { x: 1, y: 0 }, Deploying],
    [South, North, { x: 2, y: 0 }, Deploying],
    [North, South, { x: 1, y: 5 }, Deploying],
    [South, South, { x: 2, y: 5 }, Deploying],
    [North, South, { x: 0, y: 5 }, Deploying],
  ])('controlled by %s on %s turn at %s while %s', inputs => {
    const [_, __, position] = inputs;
    beforeEach_render_with_subphase(inputs);
    it_should_render_its_children();

    it('should have a Deploy dropzone', () => {
      expect(screen.getByRole('button', { name: `Deploy on ${TEST_LABEL}` })).toBeVisible();
    });

    it('should call commitDeploy when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitDeploy).toHaveBeenCalledExactlyOnceWith(position);
    });

    it('should have no Upgrade dropzone', () => {
      expect(screen.queryByRole('button', { name: /Upgrade / })).not.toBeInTheDocument();
    });

    it('should not call commitUpgrade when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitUpgrade).not.toHaveBeenCalled();
    });

    it('should have no Move dropzone', () => {
      expect(screen.queryByRole('button', { name: /Move/ })).not.toBeInTheDocument();
    });

    it('should not call commitActivate when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitActivate).not.toHaveBeenCalled();
    });
  });

  // ###
  // # Inputs for > Move dropzone
  describe.for<Inputs>([
    // < Activating & in range & not same position
    [South, North, { x: 2, y: 3 }, Activating, UNITS_POND, Main, { x: 2, y: 2 }],
    [North, South, { x: 0, y: 2 }, Activating, FULL_POND, Main, { x: 0, y: 3 }],
    [South, South, { x: 1, y: 1 }, Activating, INITIAL_POND, Main, { x: 2, y: 1 }],
    [North, North, { x: 1, y: 4 }, Activating, ANOTHER_POND, Main, { x: 0, y: 4 }],
    // < Activating & same position as start
    [North, North, { x: 0, y: 0 }, Activating, UNITS_POND, Main, { x: 0, y: 0 }],
    [South, North, { x: 2, y: 0 }, Activating, UNITS_POND, Main, { x: 2, y: 0 }],
    [South, South, { x: 0, y: 5 }, Activating, UNITS_POND, Main, { x: 0, y: 5 }],
    [North, South, { x: 2, y: 5 }, Activating, UNITS_POND, Main, { x: 2, y: 5 }],
  ])('controlled by %s on %s turn at %s while %s | pond: %s | phase: %s | start: %s', inputs => {
    const [_, __, position] = inputs;
    beforeEach_render_with_subphase(inputs);
    it_should_render_its_children();

    it('should have a Move dropzone', () => {
      expect(screen.getByRole('button', { name: `Move to ${TEST_LABEL}` })).toBeVisible();
    });

    it('should call commitActivate when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitActivate).toHaveBeenCalledExactlyOnceWith(position);
    });

    it('should have no Upgrade dropzone', () => {
      expect(screen.queryByRole('button', { name: /Upgrade / })).not.toBeInTheDocument();
    });

    it('should not call commitUpgrade when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitUpgrade).not.toHaveBeenCalled();
    });

    it('should have no Deploy dropzone', () => {
      expect(screen.queryByRole('button', { name: /Deploy/ })).not.toBeInTheDocument();
    });

    it('should not call commitDeploy when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(commitDeploy).not.toHaveBeenCalled();
    });
  });
});
