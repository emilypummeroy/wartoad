import { fireEvent, render, screen, within } from '@testing-library/react';

import { App } from '../App';
import { INITIAL_HAND_CARD_COUNT } from '../context/GameContext';
import { ROW_COUNT } from '../state/pond';
import { Phase, Player } from '../types/gameflow';
import { advanceToPhase, getAll, getFirst, getThe, queryA, queryAll, withinThe } from './app.test-utils';

const FEW = 3;

const { Start, Main, End } = Phase;
const { North, South } = Player;

describe('the dom test environment', () => {
  it('should have a defined document', () => {
    expectTypeOf(document).not.toBeUndefined();
  });
});

describe(App, () => {
  beforeEach(() => render(<App />));

  describe('Header', () => {
    it('should have the Wartoad heading', () => {
      const heading = screen.getByRole('heading', { level: 1 });
      const banner = screen.getByRole('banner');
      expect(heading).toHaveTextContent('Wartoad');
      expect(banner).toContainElement(heading);
    });

    it('should have the Phase indicator after the heading', () => {
      const indicator = getThe.phaseIndicator(South, Main);
      expect(indicator).toHaveTextContent('South: Main phase');
      expect(screen.getByRole('banner')).toContainElement(indicator);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(indicator).toAppearAfter(heading);
    });

    describe('Phase indicatar', () => {
      it('should start in the South Main phase', () => {
        expect(getThe.phaseIndicator(South, Main)).toBeVisible();
        expect(screen.queryByLabelText('End Phase')).not.toBeInTheDocument();
      });

      it.for([North, South])(
        'should not advance to the %s End phase when the button is clicked while placing a card',
        player => {
          advanceToPhase(player, Main);
          fireEvent.click(getAll.handCards(player)[Math.floor(INITIAL_HAND_CARD_COUNT * Math.random())]);
          fireEvent.click(screen.getByText('Next phase'));

          expect(getThe.phaseIndicator(player, Main)).toBeVisible();
          expect(queryA.phaseIndicator(player, End)).not.toBeInTheDocument();
        },
      );

      it('should cycle between all turns and phases as the button is clicked', () => {
        for (let x = 0; x < FEW; x += 1) {
          expect(getThe.phaseIndicator(South, Main)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
          expect(getThe.phaseIndicator(South, End)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
          expect(getThe.phaseIndicator(North, Start)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
          expect(getThe.phaseIndicator(North, Main)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
          expect(getThe.phaseIndicator(North, End)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
          expect(getThe.phaseIndicator(South, Start)).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
        }
      });
    });
  });

  describe('Pond', () => {
    it('should be in the main content area', () => {
      expect(withinThe.main.getByRole('grid')).toBeVisible();
    });

    describe.for<Player>([North, South])('after picking a card from the %s hand', player => {
      const opponent = player === North ? South : North;

      let cardName = '';
      beforeEach(() => {
        advanceToPhase(player, Main);
        const clickedCard = getFirst.handCard(player);
        cardName = clickedCard.textContent;
        fireEvent.click(clickedCard);
      });

      it(`should allow ${player} to play the picked card on a leaf by clicking on it`, () => {
        // Playing a leaf will make the "basic leaf" count go down.
        // Playing a unit will make the unit count go up.
        const initialHeuristicCount =
          queryAll.unitsControlledBy(player).length - getAll.basicLeavesControlledBy(player).length;
        fireEvent.click(getFirst.basicDropzoneControlledBy(player));

        const newHeuristicCount =
          queryAll.unitsControlledBy(player).length - getAll.basicLeavesControlledBy(player).length;
        expect(newHeuristicCount, `heuristic after playing ${cardName}`).toBe(initialHeuristicCount + 1);
      });

      it(`should not allow ${player} to play a card on an a ${opponent} leaf`, () => {
        expect(queryA.basicDropzoneControlledBy(opponent)).not.toBeInTheDocument();
      });
    });

    describe('The initial placement of leaves', () => {
      it('should have 18 leaves in 6 rows of 3', () => {
        const rows = withinThe.playArea.getAllByRole('row');
        expect(rows).toHaveLength(6);
        for (const row of rows) {
          const leaves = within(row).getAllByRole('gridcell');
          expect(leaves).toHaveLength(3);
          for (const leaf of leaves) {
            expect(leaf).toBeVisible();
          }
        }
      });

      it('should have north leaves in the top 3 rows', () => {
        const northRows = withinThe.playArea.getAllByRole('row').slice(0, 3);
        for (const row of northRows) {
          for (const zone of within(row).getAllByRole('gridcell')) {
            const card = within(zone).getByRole('region');
            expect(card).toHaveAccessibleName(/North (controlled|Home)/);
          }
        }
      });

      it('should have south leaves in the bottom 3 rows', () => {
        const southRows = withinThe.playArea.getAllByRole('row').slice(3);
        for (const row of southRows) {
          for (const zone of within(row).getAllByRole('gridcell')) {
            const card = within(zone).getByRole('region');
            expect(card).toHaveAccessibleName(/South (controlled|Home)/);
          }
        }
      });

      it('should have the north home leaf', () => {
        const [_, homeZone] = within(withinThe.playArea.getAllByRole('row')[0]).getAllByRole('gridcell');
        expect(within(homeZone).getByRole('region')).toHaveAccessibleName('North Home Lily Pad');
      });

      it('should have the south home leaf', () => {
        const [_, homeZone] = within(withinThe.playArea.getAllByRole('row')[ROW_COUNT - 1]).getAllByRole('gridcell');
        expect(within(homeZone).getByRole('region')).toHaveAccessibleName('South Home Lily Pad');
      });
    });
  });
});
