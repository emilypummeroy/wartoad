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
      const banner = screen.getByRole('banner');
      expect(heading).toHaveTextContent('Wartide');
      expect(banner).toContainElement(heading);
    });

    it('should have the phase indicator', () => {
      const indicator = screen.getByRole('region', {
        name: 'South: Main phase',
      });
      expect(indicator).toHaveTextContent('South: Main phase');
      expect(screen.getByRole('banner')).toContainElement(indicator);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(indicator).toAppearAfter(heading);
    });

    describe('Phases', () => {
      const withinHeader = () => within(screen.getByRole('banner'));

      it('should start in the south main phase', () => {
        expect(
          withinHeader().getByRole('region', { name: 'South: Main phase' }),
        ).toBeVisible();
        expect(screen.queryByLabelText('End Phase')).not.toBeInTheDocument();
      });

      it('should advance to the south end phase when the button is clicked', () => {
        fireEvent.click(screen.getByText('Next phase'));

        expect(
          withinHeader().getByRole('region', { name: 'South: End phase' }),
        ).toBeVisible();
        expect(
          screen.queryByLabelText('South: Main phase'),
        ).not.toBeInTheDocument();
      });

      it('should advance to the north start phase when the button is clicked twice', () => {
        fireEvent.click(screen.getByText('Next phase'));
        fireEvent.click(screen.getByText('Next phase'));

        expect(
          withinHeader().getByRole('region', { name: 'North: Main phase' }),
        ).toBeVisible();
        expect(
          screen.queryByLabelText('South: End phase'),
        ).not.toBeInTheDocument();
      });

      it('should advance to the north end phase when the button is clicked thrice', () => {
        fireEvent.click(screen.getByText('Next phase'));
        fireEvent.click(screen.getByText('Next phase'));
        fireEvent.click(screen.getByText('Next phase'));

        expect(
          withinHeader().getByRole('region', { name: 'North: End phase' }),
        ).toBeVisible();
        expect(
          screen.queryByLabelText('North: Main phase'),
        ).not.toBeInTheDocument();
      });

      it('should cycle between all turns and phases as the button is clicked', () => {
        for (let x = 0; x < FEW; x += 1) {
          expect(
            withinHeader().getByRole('region', { name: 'South: Main phase' }),
          ).toBeVisible();

          fireEvent.click(screen.getByText('Next phase'));

          expect(
            withinHeader().getByRole('region', { name: 'South: End phase' }),
          ).toBeVisible();

          fireEvent.click(screen.getByText('Next phase'));

          expect(
            withinHeader().getByRole('region', { name: 'North: Main phase' }),
          ).toBeVisible();

          fireEvent.click(screen.getByText('Next phase'));

          expect(
            withinHeader().getByRole('region', { name: 'North: End phase' }),
          ).toBeVisible();

          fireEvent.click(screen.getByText('Next phase'));
        }
      });
    });
  });

  describe('Hands', () => {
    const INITIAL_HAND_CARD_COUNT = 7;

    const withinMain = () => within(screen.getByRole('main'));

    it('should have the South hand before the North hand', () => {
      const south = withinMain().getByRole('region', { name: 'South hand' });
      const north = withinMain().getByRole('region', { name: 'North hand' });
      expect(north).toBeVisible();
      expect(south).toBeVisible();
      expect(north).toAppearBefore(south);
    });

    it('should have both hands before the Play area', () => {
      const south = withinMain().getByRole('region', { name: 'South hand' });
      const north = withinMain().getByRole('region', { name: 'North hand' });
      const playArea = screen.getByRole('grid');
      expect(north).toBeVisible();
      expect(south).toBeVisible();
      expect(north).toAppearBefore(playArea);
      expect(south).toAppearBefore(playArea);
    });

    describe('North hand', () => {
      const withinHand = () =>
        within(withinMain().getByRole('region', { name: 'North hand' }));

      it('should start with 7 cards', () => {
        expect(withinHand().getAllByRole('region')).toHaveLength(
          INITIAL_HAND_CARD_COUNT,
        );
      });
    });

    describe('South hand', () => {
      const withinHand = () =>
        within(withinMain().getByRole('region', { name: 'South hand' }));

      it('should start with 7 cards', () => {
        expect(withinHand().getAllByRole('region')).toHaveLength(
          INITIAL_HAND_CARD_COUNT,
        );
      });
    });
  });

  describe('Play area', () => {
    const ROW_COUNT = 6;
    const ROW_COUNT_PER_PLAYER = 3;
    const FIELD_COUNT_PER_ROW = 3;

    const withinMain = () => within(screen.getByRole('main'));
    const withinPlayArea = () => within(withinMain().getByRole('grid'));

    it('should be in the main content area', () => {
      expect(withinMain().getByRole('grid')).toBeVisible();
    });

    describe('The initial placement of fields', () => {
      it('should have 18 fields in 6 rows of 3', () => {
        const rows = withinPlayArea().getAllByRole('row');
        expect(rows).toHaveLength(ROW_COUNT);
        for (const row of rows) {
          const fields = within(row).getAllByRole('gridcell');
          expect(fields).toHaveLength(FIELD_COUNT_PER_ROW);
          for (const field of fields) {
            expect(field).toBeVisible();
          }
        }
      });

      it('should have north fields in the top 3 rows', () => {
        const southRows = withinPlayArea()
          .getAllByRole('row')
          .slice(0, ROW_COUNT_PER_PLAYER);
        for (const row of southRows) {
          for (const zone of within(row).getAllByRole('gridcell')) {
            const card = within(zone).getByRole('region');
            expect(card).toHaveAccessibleName(/North owned/);
          }
        }
      });

      it('should have south fields in the bottom 3 rows', () => {
        const southRows = withinPlayArea()
          .getAllByRole('row')
          .slice(ROW_COUNT_PER_PLAYER);
        for (const row of southRows) {
          for (const zone of within(row).getAllByRole('gridcell')) {
            const card = within(zone).getByRole('region');
            expect(card).toHaveAccessibleName(/South owned/);
          }
        }
      });

      it('should have the north home field', () => {
        const [_, homeZone] = within(
          withinPlayArea().getAllByRole('row')[0],
        ).getAllByRole('gridcell');
        expect(within(homeZone).getByRole('region')).toHaveAccessibleName(
          'North owned Basic Field',
        );
      });

      it('should have the south home field', () => {
        const [_, homeZone] = within(
          withinPlayArea().getAllByRole('row')[ROW_COUNT - 1],
        ).getAllByRole('gridcell');
        expect(within(homeZone).getByRole('region')).toHaveAccessibleName(
          'South owned Basic Field',
        );
      });
    });
  });
});
