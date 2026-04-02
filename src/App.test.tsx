import { fireEvent, render, screen, within } from '@testing-library/react';

import { Phase, Player, App, INITIAL_HAND_CARD_COUNT } from './App.tsx';

const FEW = 3;
const MANY = 15;

describe('the dom test environment', () => {
  it('should have a defined document', () => {
    expectTypeOf(document).not.toBeUndefined();
  });
});

describe(App, () => {
  beforeEach(() => render(<App />));

  const withinHeader = () => within(screen.getByRole('banner'));

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
      it('should start in the South Main phase', () => {
        expect(
          withinHeader().getByRole('region', { name: 'South: Main phase' }),
        ).toBeVisible();
        expect(screen.queryByLabelText('End Phase')).not.toBeInTheDocument();
      });

      it('should advance to the South End phase when the button is clicked', () => {
        fireEvent.click(screen.getByText('Next phase'));

        expect(
          withinHeader().getByRole('region', { name: 'South: End phase' }),
        ).toBeVisible();
        expect(
          screen.queryByLabelText('South: Main phase'),
        ).not.toBeInTheDocument();
      });

      it('should advance to the North Start phase when the button is clicked twice', () => {
        fireEvent.click(screen.getByText('Next phase'));
        fireEvent.click(screen.getByText('Next phase'));

        expect(
          withinHeader().getByRole('region', { name: 'North: Start phase' }),
        ).toBeVisible();
        expect(
          screen.queryByLabelText('South: End phase'),
        ).not.toBeInTheDocument();
      });

      it('should advance to the North Main phase when the button is clicked thrice', () => {
        fireEvent.click(screen.getByText('Next phase'));
        fireEvent.click(screen.getByText('Next phase'));
        fireEvent.click(screen.getByText('Next phase'));

        expect(
          withinHeader().getByRole('region', { name: 'North: Main phase' }),
        ).toBeVisible();
        expect(
          screen.queryByLabelText('North: Start phase'),
        ).not.toBeInTheDocument();
      });

      it('should advance to the North End phase when the button is clicked four times', () => {
        fireEvent.click(screen.getByText('Next phase'));
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

      it('should advance to the South Start phase when the button is clicked five times', () => {
        fireEvent.click(screen.getByText('Next phase'));
        fireEvent.click(screen.getByText('Next phase'));
        fireEvent.click(screen.getByText('Next phase'));
        fireEvent.click(screen.getByText('Next phase'));
        fireEvent.click(screen.getByText('Next phase'));

        expect(
          withinHeader().getByRole('region', { name: 'South: Start phase' }),
        ).toBeVisible();
        expect(
          screen.queryByLabelText('North: End phase'),
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
            withinHeader().getByRole('region', { name: 'North: Start phase' }),
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

          expect(
            withinHeader().getByRole('region', { name: 'South: Start phase' }),
          ).toBeVisible();
          fireEvent.click(screen.getByText('Next phase'));
        }
      });
    });
  });

  describe('Hands', () => {
    const withinMain = () => within(screen.getByRole('main'));

    const advanceToPhase = (player: Player, phase: Phase) => {
      const pattern = new RegExp(`${player}: ${phase}`);
      for (let i = 0; i < MANY; i += 1) {
        if (withinHeader().queryByLabelText(pattern)) {
          break;
        }
        fireEvent.click(screen.getByText('Next phase'));
      }
      expect(withinHeader().queryByLabelText(pattern)).toBeVisible();
    };

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

      it('should be visible during the North turn', () => {
        for (const phase of Object.values(Phase)) {
          advanceToPhase(Player.North, phase);

          const cards = withinHand().getAllByRole('region');
          expect(cards).not.toHaveLength(0);
          for (const c of cards) {
            expect(c).toHaveAccessibleName('Basic Field');
          }
        }
      });

      it('should not be visible during the South turn', () => {
        for (const phase of Object.values(Phase)) {
          advanceToPhase(Player.South, phase);

          const cards = withinHand().getAllByRole('region');
          expect(cards).not.toHaveLength(0);
          for (const c of cards) {
            expect(c).toHaveAccessibleName('Facedown card');
          }
        }
      });

      it('should gain an extra card during the North Start phase', () => {
        advanceToPhase(Player.North, Phase.Main);
        const initialCount = withinHand().getAllByRole('region').length;

        advanceToPhase(Player.South, Phase.End);
        expect(withinHand().getAllByRole('region')).toHaveLength(initialCount);

        advanceToPhase(Player.North, Phase.Main);
        expect(withinHand().getAllByRole('region')).toHaveLength(
          initialCount + 1,
        );
      });

      it('should allow a card to be played from the hand by clicking during the North Main phase', () => {
        advanceToPhase(Player.North, Phase.Main);
        const initialCount = withinHand().getAllByRole('region').length;

        fireEvent.click(withinHand().getAllByRole('button')[0]);

        expect(withinHand().getAllByRole('region')).toHaveLength(
          initialCount - 1,
        );
      });

      // TODO Convert to unit test
      it('should allow cards to be played until the hand is empty', () => {
        advanceToPhase(Player.North, Phase.Main);

        const initialCount = withinHand().getAllByRole('region').length;
        for (let i = 0; i < initialCount; i += 1) {
          fireEvent.click(withinHand().getAllByRole('button')[0]);
          expect(withinHand().queryAllByRole('region')).toHaveLength(
            initialCount - i - 1,
          );
        }
        expect(withinHand().queryByRole('button')).not.toBeInTheDocument();
      });

      // To be moved into smaller unit tests in Hands.test.tsx
      // oxlint-disable-next-line max-statements
      it('should not allow cards to played from the hand during other phases', () => {
        const initialCount = withinHand().getAllByRole('region').length;
        expect(initialCount).toBeGreaterThan(0);

        advanceToPhase(Player.North, Phase.End);
        let cards = withinHand().queryAllByRole('button');
        if (cards.length > 0) fireEvent.click(cards[0]);
        expect(
          withinHand().getAllByRole('region').length,
        ).toBeGreaterThanOrEqual(initialCount);

        advanceToPhase(Player.South, Phase.Start);
        cards = withinHand().queryAllByRole('button');
        if (cards.length > 0) fireEvent.click(cards[0]);
        expect(
          withinHand().getAllByRole('region').length,
        ).toBeGreaterThanOrEqual(initialCount);

        advanceToPhase(Player.South, Phase.Main);
        cards = withinHand().queryAllByRole('button');
        if (cards.length > 0) fireEvent.click(cards[0]);
        expect(
          withinHand().getAllByRole('region').length,
        ).toBeGreaterThanOrEqual(initialCount);

        advanceToPhase(Player.South, Phase.End);
        cards = withinHand().queryAllByRole('button');
        if (cards.length > 0) fireEvent.click(cards[0]);
        expect(
          withinHand().getAllByRole('region').length,
        ).toBeGreaterThanOrEqual(initialCount);

        advanceToPhase(Player.North, Phase.Start);
        cards = withinHand().queryAllByRole('button');
        if (cards.length > 0) fireEvent.click(cards[0]);
        expect(
          withinHand().getAllByRole('region').length,
        ).toBeGreaterThanOrEqual(initialCount);
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

      it('should be visible during the South turn', () => {
        for (const phase of Object.values(Phase)) {
          advanceToPhase(Player.South, phase);

          const cards = withinHand().getAllByRole('region');
          expect(cards).not.toHaveLength(0);
          for (const c of cards) {
            expect(c).toHaveAccessibleName('Basic Field');
          }
        }
      });

      it('should not be visible during the North turn', () => {
        for (const phase of Object.values(Phase)) {
          advanceToPhase(Player.North, phase);

          const cards = withinHand().getAllByRole('region');
          expect(cards).not.toHaveLength(0);
          for (const c of cards) {
            expect(c).toHaveAccessibleName('Facedown card');
          }
        }
      });

      it('should gain an extra card during the South Start phase', () => {
        advanceToPhase(Player.South, Phase.Main);
        const initialCount = withinHand().getAllByRole('region').length;

        advanceToPhase(Player.North, Phase.End);
        expect(withinHand().getAllByRole('region')).toHaveLength(initialCount);

        advanceToPhase(Player.South, Phase.Main);
        expect(withinHand().getAllByRole('region')).toHaveLength(
          initialCount + 1,
        );
      });

      it('should allow a card to be played from the hand by clicking during the South Main phase', () => {
        advanceToPhase(Player.South, Phase.Main);
        const initialCount = withinHand().getAllByRole('region').length;

        fireEvent.click(withinHand().getAllByRole('button')[0]);

        expect(withinHand().getAllByRole('region')).toHaveLength(
          initialCount - 1,
        );
      });

      // TODO Convert to unit test
      // To be moved into smaller unit tests in Hands.test.tsx
      // oxlint-disable-next-line max-statements
      it('should not allow cards to played from the hand during other phases', () => {
        const initialCount = withinHand().getAllByRole('region').length;
        expect(initialCount).toBeGreaterThan(0);

        advanceToPhase(Player.South, Phase.End);
        let cards = withinHand().queryAllByRole('button');
        if (cards.length > 0) fireEvent.click(cards[0]);
        expect(
          withinHand().getAllByRole('region').length,
        ).toBeGreaterThanOrEqual(initialCount);

        advanceToPhase(Player.North, Phase.Start);
        cards = withinHand().queryAllByRole('button');
        if (cards.length > 0) fireEvent.click(cards[0]);
        expect(
          withinHand().getAllByRole('region').length,
        ).toBeGreaterThanOrEqual(initialCount);

        advanceToPhase(Player.North, Phase.Main);
        cards = withinHand().queryAllByRole('button');
        if (cards.length > 0) fireEvent.click(cards[0]);
        expect(
          withinHand().getAllByRole('region').length,
        ).toBeGreaterThanOrEqual(initialCount);

        advanceToPhase(Player.North, Phase.End);
        cards = withinHand().queryAllByRole('button');
        if (cards.length > 0) fireEvent.click(cards[0]);
        expect(
          withinHand().getAllByRole('region').length,
        ).toBeGreaterThanOrEqual(initialCount);

        advanceToPhase(Player.South, Phase.Start);
        cards = withinHand().queryAllByRole('button');
        if (cards.length > 0) fireEvent.click(cards[0]);
        expect(
          withinHand().getAllByRole('region').length,
        ).toBeGreaterThanOrEqual(initialCount);
      });

      // TODO Convert to unit test
      it('should allow cards to be played until the hand is empty', () => {
        advanceToPhase(Player.South, Phase.Main);

        const initialCount = withinHand().getAllByRole('region').length;
        for (let i = 0; i < initialCount; i += 1) {
          fireEvent.click(withinHand().getAllByRole('button')[0]);
          expect(withinHand().queryAllByRole('region')).toHaveLength(
            initialCount - i - 1,
          );
        }
        expect(withinHand().queryByRole('button')).not.toBeInTheDocument();
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
