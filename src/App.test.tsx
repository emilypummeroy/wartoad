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
    });

    describe('Phases', () => {
      it('should be indicated between the heading and the play area', () => {
        const indicator = screen.getByText('Main');
        const heading = screen.getByRole('heading', { level: 1 });
        const main = screen.getByRole('main');

        expect(indicator).toAppearAfter(heading);
        expect(indicator).toAppearBefore(main);
      });

      it('should start in the main phase', () => {
        const indicator = screen.getByText('Main');
        expect(indicator).toBeVisible();
        expect(screen.queryByText('End Phase')).not.toBeInTheDocument();
      });

      it('should advance to the end phase when the button is clicked', () => {
        fireEvent.click(screen.getByText('Next phase'));

        const indicator = screen.getByText('End');
        expect(indicator).toBeVisible();
        expect(screen.queryByText('Main')).not.toBeInTheDocument();
      });

      it('should cycle between main and end phase when the button is clicked', () => {
        for (let x = 0; x < FEW; x += 1) {
          const mainIndicator = screen.getByText('Main');
          expect(mainIndicator).toBeVisible();
          expect(screen.queryByText('End')).not.toBeInTheDocument();

          fireEvent.click(screen.getByText('Next phase'));

          const endIndicator = screen.getByText('End');
          expect(endIndicator).toBeVisible();
          expect(screen.queryByText('Main')).not.toBeInTheDocument();

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
