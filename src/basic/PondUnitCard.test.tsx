import { fireEvent, render, screen } from '@testing-library/react';

import { createUnit } from '@/state-types/card';
import { UnitClass, type UnitState } from '@/types/card';
import { Phase, Player } from '@/types/gameflow';
import type { Position } from '@/types/position';
import { counter, gameflowFrom } from '@/types/test-utils';

import { PondUnitCard } from './PondUnitCard';

const { North, South } = Player;
const { Start, Main, Upgrading, Deploying, Activating, End, GameOver } = Phase;
describe(PondUnitCard, () => {
  const onClick = vi.fn<(unit: UnitState, position: Position) => void>();
  describe.for<[owner: Player, turn: Player, Phase, Position]>([
    [North, North, Main, { x: 1, y: 2 }],
    [South, South, Main, { x: 0, y: 4 }],
  ])('when owned by %s | during %s %s | %s | not exhausted', ([owner, player, phase, xy]) => {
    const cardClass = UnitClass.Froglet;
    const unit = createUnit({
      cardClass,
      owner,
      key: counter(),
    });
    beforeEach(() => {
      render(<PondUnitCard unit={unit} position={xy} flow={gameflowFrom(player, phase)} onClick={onClick} />);
    });

    it('should render with the right accessible name', () => {
      expect(screen.getByRole('region', { name: `${owner} unit ${cardClass.name}` })).toBeVisible();
    });

    it('should be pickable', () => {
      expect(screen.getByRole('button', { name: /unit/ })).toBeVisible();
    });

    it('should call onClick when clicked', () => {
      fireEvent.click(screen.getByRole('region', { name: /unit/ }));
      expect(onClick).toHaveBeenCalledExactlyOnceWith(unit, xy);
    });
  });

  describe.for<[owner: Player, turn: Player, Phase, Position]>([
    [South, North, Main, { x: 2, y: 3 }],
    [North, South, Main, { x: 1, y: 5 }],
    [North, North, Start, { x: 1, y: 4 }],
    [North, South, End, { x: 2, y: 0 }],
    [South, North, Upgrading, { x: 2, y: 5 }],
    [South, South, Deploying, { x: 0, y: 1 }],
    [North, North, Activating, { x: 2, y: 5 }],
    [North, South, GameOver, { x: 0, y: 1 }],
  ])('when owned by %s | during %s %s | %s | not exhausted', ([owner, player, phase, xy]) => {
    const cardClass = UnitClass.Froglet;
    const unit = createUnit({
      cardClass,
      owner,
      key: counter(),
    });
    beforeEach(() => {
      render(<PondUnitCard unit={unit} position={xy} flow={gameflowFrom(player, phase)} onClick={onClick} />);
    });

    it('should render with the right accessible name', () => {
      expect(screen.getByRole('region', { name: `${owner} unit ${cardClass.name}` })).toBeVisible();
    });

    it('should not be pickable', () => {
      expect(screen.queryByRole('button', { name: /unit/ })).not.toBeInTheDocument();
    });

    it('should not call onClick when clicked', () => {
      fireEvent.click(screen.getByRole('region', { name: /unit/ }));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe.for<[owner: Player, turn: Player, Phase, Position]>([
    [North, North, Main, { x: 0, y: 3 }],
    [North, South, Main, { x: 1, y: 5 }],
    [South, North, Main, { x: 1, y: 4 }],
    [South, South, Main, { x: 2, y: 0 }],
    [North, North, Start, { x: 1, y: 4 }],
    [North, South, End, { x: 2, y: 0 }],
    [South, North, Upgrading, { x: 2, y: 5 }],
    [South, South, Deploying, { x: 0, y: 1 }],
    [North, North, Activating, { x: 2, y: 5 }],
    [North, South, GameOver, { x: 0, y: 1 }],
  ])('when owned by %s | during %s %s | %s | exhausted', ([owner, player, phase, xy]) => {
    const cardClass = UnitClass.Froglet;
    const unit = createUnit({
      cardClass,
      owner,
      key: counter(),
      values: { isExhausted: true },
    });

    beforeEach(() => {
      render(<PondUnitCard unit={unit} position={xy} flow={gameflowFrom(player, phase)} onClick={onClick} />);
    });

    it('should render with the right accessible name showing its exhaustion', () => {
      expect(screen.getByRole('region', { name: `exhausted ${owner} unit ${cardClass.name}` })).toBeVisible();
    });

    it('should not be pickable', () => {
      expect(screen.queryByRole('button', { name: /unit/ })).not.toBeInTheDocument();
    });

    it('should not call onClick when clicked', () => {
      fireEvent.click(screen.getByRole('region', { name: /unit/ }));
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
