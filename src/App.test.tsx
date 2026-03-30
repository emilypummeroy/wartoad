import { fireEvent, render, screen, within } from '@testing-library/react';

import { App } from './App.tsx';

const FEW = 3;

describe('the dom test environment', () => {
  it('should have a defined document', () => {
    expectTypeOf(document).not.toBeUndefined();
  });
});

describe(App, () => {
  beforeEach(() => render(<App />));

  describe('Header', () => {
    it('should have the wartide heading', () => {
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Wartide');
      expect(screen.getByRole('banner')).toContainElement(heading);
    });

    it('should have the phase indicator', () => {
      const indicator = screen.getByRole('region', { name: 'Main phase' });
      expect(indicator).toHaveTextContent('Main phase');
      expect(screen.getByRole('banner')).toContainElement(indicator);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(indicator).toAppearAfter(heading);
    });

    describe('Phases', () => {
      const withinHeader = () => within(screen.getByRole('banner'));

      it('should start in the main phase', () => {
        expect(
          withinHeader().getByRole('region', { name: 'Main phase' }),
        ).toBeVisible();
        expect(screen.queryByLabelText('End Phase')).not.toBeInTheDocument();
      });

      it('should advance to the end phase when the button is clicked', () => {
        fireEvent.click(screen.getByText('Next phase'));

        expect(
          withinHeader().getByRole('region', { name: 'End phase' }),
        ).toBeVisible();
        expect(screen.queryByLabelText('Main phase')).not.toBeInTheDocument();
      });

      it('should cycle between main and end phase when the button is clicked', () => {
        for (let x = 0; x < FEW; x += 1) {
          expect(
            withinHeader().getByRole('region', { name: 'Main phase' }),
          ).toBeVisible();
          expect(screen.queryByLabelText('End phase')).not.toBeInTheDocument();

          fireEvent.click(screen.getByText('Next phase'));

          expect(
            withinHeader().getByRole('region', { name: 'End phase' }),
          ).toBeVisible();
          expect(screen.queryByLabelText('Main phase')).not.toBeInTheDocument();

          fireEvent.click(screen.getByText('Next phase'));
        }
      });
    });
  });

  describe('Play area', () => {
    const ROW_COUNT = 6;
    const FIELDS_PER_ROW = 3;

    it('should exist', () => {
      expect(within(screen.getByRole('main')).getByRole('grid')).toBeVisible();
    });

    it('should 18 fields in 6 rows of 3', () => {
      const playArea = within(screen.getByRole('main')).getByRole('grid');
      const rows = within(playArea).getAllByRole('row');
      expect(rows).toHaveLength(ROW_COUNT);
      for (const row of rows) {
        const fields = within(row).getAllByRole('gridcell');
        expect(fields).toHaveLength(FIELDS_PER_ROW);
        for (const field of fields) {
          expect(field).toBeVisible();
        }
      }
    });
  });
});
