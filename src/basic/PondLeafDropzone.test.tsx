import { fireEvent, render, screen } from '@testing-library/react';

import { createUnit } from '@/state-types/card';
import { TestLeafKey, TEST_LEAVES_BY_KEY } from '@/state-types/pond.test-utils';
import { CardClass } from '@/types/card';
import { Player, Phase } from '@/types/gameflow';
import type { Position } from '@/types/position';
import { _, counter, gameflowFrom } from '@/types/test-utils';

import { PondLeafDropzone } from './PondLeafDropzone';

const { North, South } = Player;
const { Upgrading, Deploying, Activating, Start, Main, End, GameOver } = Phase;

const { SOUTH_LEAF, NORTH_LEAF, SOUTH_LILYPAD, NORTH_LILYPAD } = TestLeafKey;

type Inputs = [Player, Phase, Position, TestLeafKey, start?: Position];

const TEST_TARGET_ID = 'test-label-id';
const TEST_LABEL = 'the Target';
const CHILD_TEXT = 'Hello';
const A_POSITION: Position = { x: 2, y: 4 };
const B_POSITION: Position = { x: 1, y: 5 };
const C_POSITION: Position = { x: 0, y: 2 };
const D_POSITION: Position = { x: 1, y: 0 };

// ###
// # Outputs:
// > No dropzones
// > Upgrade dropzone
// > Deploy dropzone
// > Move dropzone
describe(PondLeafDropzone, () => {
  const it_should_render_its_children = () => {
    it('should render its children', () => {
      expect(screen.getByText(CHILD_TEXT)).toBeVisible();
    });
  };

  const onClickUpgrade = vi.fn<() => void>();
  const onClickDeploy = vi.fn<() => void>();
  const onClickMove = vi.fn<() => void>();

  const beforeEach_render_with_phase = ([player, phase, position, leafKey, start]: Inputs) => {
    const flow = gameflowFrom(player, phase);
    const leaf = TEST_LEAVES_BY_KEY[leafKey];
    const activation = start
      ? { start, unit: createUnit({ cardClass: CardClass.Froglet, owner: player, key: counter() }) }
      : undefined;
    beforeEach(() => {
      render(
        <PondLeafDropzone
          position={position}
          flow={flow}
          pondLeaf={leaf}
          activation={activation}
          onClickUpgrade={onClickUpgrade}
          onClickDeploy={onClickDeploy}
          onClickMove={onClickMove}
          targetLabelId={TEST_TARGET_ID}
        >
          <div id={TEST_TARGET_ID} aria-label={TEST_LABEL}>
            Hello
          </div>
        </PondLeafDropzone>,
      );
    });
  };

  // ###
  // # Inputs for > No dropzones
  describe.for<Inputs>([
    // < Start phase
    [North, Start, A_POSITION, NORTH_LEAF],
    [South, Start, B_POSITION, NORTH_LILYPAD],
    [North, Start, C_POSITION, SOUTH_LEAF],
    [South, Start, D_POSITION, SOUTH_LILYPAD],
    // < End phase
    [North, End, D_POSITION, NORTH_LEAF],
    [South, End, A_POSITION, NORTH_LILYPAD],
    [North, End, B_POSITION, SOUTH_LEAF],
    [South, End, C_POSITION, SOUTH_LILYPAD],
    // < GameOver
    [North, GameOver, C_POSITION, NORTH_LEAF],
    [South, GameOver, D_POSITION, NORTH_LILYPAD],
    [North, GameOver, A_POSITION, SOUTH_LEAF],
    [South, GameOver, B_POSITION, SOUTH_LILYPAD],
    // < Main/Idle
    [North, Main, B_POSITION, NORTH_LEAF],
    [South, Main, C_POSITION, NORTH_LILYPAD],
    [North, Main, D_POSITION, SOUTH_LEAF],
    [South, Main, A_POSITION, SOUTH_LILYPAD],
    // < Upgrading & not controller
    [North, Upgrading, D_POSITION, SOUTH_LEAF],
    [South, Upgrading, C_POSITION, NORTH_LEAF],
    [North, Upgrading, B_POSITION, SOUTH_LEAF],
    [South, Upgrading, A_POSITION, NORTH_LEAF],
    // < Upgrading & upgraded
    [North, Upgrading, C_POSITION, NORTH_LILYPAD],
    [North, Upgrading, B_POSITION, NORTH_LILYPAD],
    [South, Upgrading, A_POSITION, SOUTH_LILYPAD],
    [South, Upgrading, D_POSITION, SOUTH_LILYPAD],
    // < Deploying & not home row
    [North, Deploying, { x: 0, y: 1 }, NORTH_LEAF],
    [South, Deploying, { x: 1, y: 4 }, NORTH_LILYPAD],
    [South, Deploying, { x: 2, y: 0 }, SOUTH_LEAF],
    [North, Deploying, { x: 1, y: 5 }, SOUTH_LILYPAD],
    // < Activating & out of range of start
    [North, Activating, { x: 0, y: 0 }, NORTH_LEAF, { x: 2, y: 0 }],
    [South, Activating, { x: 2, y: 0 }, NORTH_LILYPAD, { x: 0, y: 0 }],
    [South, Activating, { x: 1, y: 3 }, SOUTH_LEAF, { x: 1, y: 1 }],
    [North, Activating, { x: 1, y: 3 }, SOUTH_LILYPAD, { x: 1, y: 5 }],
  ])('No dropzones | %s %s phase | at %s | %s | start?: %s', inputs => {
    beforeEach_render_with_phase(inputs);
    it_should_render_its_children();

    it('should have no dropzones', () => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not call onClickUpgrade when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickUpgrade).not.toHaveBeenCalled();
    });

    it('should not call onClickDeploy when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickDeploy).not.toHaveBeenCalled();
    });

    it('should not call onClickMove when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickMove).not.toHaveBeenCalled();
    });
  });

  // ###
  // # Inputs for > Upgrade dropzone
  describe.for<Inputs>([
    // < Upgrading & controlled & not upgraded
    [North, Upgrading, A_POSITION, NORTH_LEAF],
    [North, Upgrading, B_POSITION, NORTH_LEAF],
    [South, Upgrading, C_POSITION, SOUTH_LEAF],
    [South, Upgrading, D_POSITION, SOUTH_LEAF],
  ])('controlled by %s on %s turn at %s while %s | pond: %s', inputs => {
    const [_, __, position] = inputs;
    beforeEach_render_with_phase(inputs);
    it_should_render_its_children();

    it('should have an Upgrade dropzone', () => {
      expect(screen.getByRole('button', { name: `Upgrade ${TEST_LABEL}` })).toBeVisible();
    });

    it('should call onClickUpgrade when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickUpgrade).toHaveBeenCalledExactlyOnceWith(position);
    });

    it('should have no Deploy dropzone', () => {
      expect(screen.queryByRole('button', { name: /Deploy/ })).not.toBeInTheDocument();
    });

    it('should not call onClickDeploy when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickDeploy).not.toHaveBeenCalled();
    });

    it('should have no Move dropzone', () => {
      expect(screen.queryByRole('button', { name: /Move/ })).not.toBeInTheDocument();
    });

    it('should not call onClickMove when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickMove).not.toHaveBeenCalled();
    });
  });

  // ###
  // # Inputs for > Deploy dropzone
  describe.for<Inputs>([
    // < Deploying & home row
    [North, Deploying, { x: 0, y: 0 }, NORTH_LEAF],
    [North, Deploying, { x: 1, y: 0 }, NORTH_LILYPAD],
    [North, Deploying, { x: 2, y: 0 }, SOUTH_LEAF],
    [South, Deploying, { x: 1, y: 5 }, SOUTH_LILYPAD],
    [South, Deploying, { x: 2, y: 5 }, SOUTH_LEAF],
    [South, Deploying, { x: 0, y: 5 }, NORTH_LEAF],
  ])('controlled by %s on %s turn at %s while %s', inputs => {
    const [_, __, position] = inputs;
    beforeEach_render_with_phase(inputs);
    it_should_render_its_children();

    it('should have a Deploy dropzone', () => {
      expect(screen.getByRole('button', { name: `Deploy on ${TEST_LABEL}` })).toBeVisible();
    });

    it('should call onClickDeploy when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickDeploy).toHaveBeenCalledExactlyOnceWith(position);
    });

    it('should have no Upgrade dropzone', () => {
      expect(screen.queryByRole('button', { name: /Upgrade / })).not.toBeInTheDocument();
    });

    it('should not call onClickUpgrade when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickUpgrade).not.toHaveBeenCalled();
    });

    it('should have no Move dropzone', () => {
      expect(screen.queryByRole('button', { name: /Move/ })).not.toBeInTheDocument();
    });

    it('should not call onClickMove when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickMove).not.toHaveBeenCalled();
    });
  });

  // ###
  // # Inputs for > Move dropzone
  describe.for<Inputs>([
    // < Activating & in range & not same position
    [North, Activating, { x: 0, y: 2 }, NORTH_LEAF, { x: 0, y: 3 }],
    [South, Activating, { x: 2, y: 3 }, NORTH_LILYPAD, { x: 2, y: 2 }],
    [North, Activating, { x: 1, y: 4 }, SOUTH_LILYPAD, { x: 0, y: 4 }],
    [South, Activating, { x: 1, y: 1 }, SOUTH_LEAF, { x: 2, y: 1 }],
    // < Activating & same position as start
    [North, Activating, { x: 0, y: 0 }, NORTH_LILYPAD, { x: 0, y: 0 }],
    [South, Activating, { x: 2, y: 0 }, NORTH_LEAF, { x: 2, y: 0 }],
    [North, Activating, { x: 2, y: 5 }, SOUTH_LEAF, { x: 2, y: 5 }],
    [South, Activating, { x: 0, y: 5 }, SOUTH_LILYPAD, { x: 0, y: 5 }],
  ])('controlled by %s on %s turn at %s while %s | pond: %s | phase: %s | start: %s', inputs => {
    const [_, __, position] = inputs;
    beforeEach_render_with_phase(inputs);
    it_should_render_its_children();

    it('should have a Move dropzone', () => {
      expect(screen.getByRole('button', { name: `Move to ${TEST_LABEL}` })).toBeVisible();
    });

    it('should call onClickMove when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickMove).toHaveBeenCalledExactlyOnceWith(position);
    });

    it('should have no Upgrade dropzone', () => {
      expect(screen.queryByRole('button', { name: /Upgrade / })).not.toBeInTheDocument();
    });

    it('should not call onClickUpgrade when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickUpgrade).not.toHaveBeenCalled();
    });

    it('should have no Deploy dropzone', () => {
      expect(screen.queryByRole('button', { name: /Deploy/ })).not.toBeInTheDocument();
    });

    it('should not call onClickDeploy when children clicked', () => {
      fireEvent.click(screen.getByLabelText(TEST_LABEL));
      expect(onClickDeploy).not.toHaveBeenCalled();
    });
  });
});
