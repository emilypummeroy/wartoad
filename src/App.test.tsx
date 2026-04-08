import { fireEvent, render, screen, within } from '@testing-library/react';

import {
  Phase,
  Player,
  App,
  INITIAL_HAND_CARD_COUNT,
  ROW_COUNT_PER_PLAYER,
  ROW_COUNT,
  FIELD_COUNT_PER_ROW,
} from './App.tsx';

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
  const withinMain = () => within(screen.getByRole('main'));
  const withinSouthHand = () =>
    within(screen.getByRole('region', { name: `${Player.South} hand` }));
  const withinNorthHand = () =>
    within(screen.getByRole('region', { name: `${Player.North} hand` }));
  const withinPickedCardDisplay = () =>
    within(screen.getByRole('region', { name: `Picked card` }));
  const withinPlayArea = () => within(withinMain().getByRole('grid'));

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

    describe('Picked Card', () => {
      it('should not appear before picking a card', () => {
        expect(
          screen.queryByRole('region', { name: 'Picked card' }),
        ).not.toBeInTheDocument();
      });

      it('should show a card picked during the North Main phase', () => {
        advanceToPhase(Player.North, Phase.Main);

        fireEvent.click(withinNorthHand().getAllByRole('button')[2]);

        expect(
          screen.getByRole('region', { name: 'Picked card' }),
        ).toBeVisible();
        expect(
          withinPickedCardDisplay().getByRole('region', {
            name: 'Basic Field',
          }),
        ).toBeVisible();
      });

      it('should not be visible after placing a North card', () => {
        advanceToPhase(Player.North, Phase.Main);

        fireEvent.click(withinNorthHand().getAllByRole('button')[2]);
        fireEvent.click(
          withinPlayArea().getAllByRole('button', {
            name: /North controlled/,
          })[3],
        );

        expect(
          screen.queryByRole('region', { name: 'Picked card' }),
        ).not.toBeInTheDocument();
      });
    });

    describe('North hand', () => {
      it('should start with 7 cards', () => {
        expect(withinNorthHand().getAllByRole('region')).toHaveLength(
          INITIAL_HAND_CARD_COUNT,
        );
      });

      it('should be visible during the North turn', () => {
        advanceToPhase(Player.North, Phase.Start);

        const cards = withinNorthHand().getAllByRole('region');
        expect(cards).not.toHaveLength(0);
        for (const c of cards) {
          expect(c).toHaveAccessibleName('Basic Field');
        }
      });

      it('should show card backs during the South turn', () => {
        advanceToPhase(Player.South, Phase.Start);

        const cards = withinNorthHand().getAllByRole('region');
        expect(cards).not.toHaveLength(0);
        for (const c of cards) {
          expect(c).toHaveAccessibleName('Facedown card');
        }
      });

      it('should gain an extra card only during the North Start phase', () => {
        advanceToPhase(Player.North, Phase.Main);
        const initialCount = withinNorthHand().getAllByRole('region').length;

        advanceToPhase(Player.South, Phase.End);
        expect(withinNorthHand().getAllByRole('region')).toHaveLength(
          initialCount,
        );

        advanceToPhase(Player.North, Phase.Main);
        expect(withinNorthHand().getAllByRole('region')).toHaveLength(
          initialCount + 1,
        );
      });

      it('should allow a card to be picked from the hand by clicking during the North Main phase', () => {
        advanceToPhase(Player.North, Phase.Main);

        fireEvent.click(withinNorthHand().getAllByRole('button')[2]);

        expect(
          screen.getByRole('region', { name: 'Picked card' }),
        ).toBeVisible();
        expect(
          withinPickedCardDisplay().getByRole('region', {
            name: 'Basic Field',
          }),
        ).toBeVisible();
      });

      it('should not allow cards to played from the hand during other phases', () => {
        advanceToPhase(Player.North, Phase.End);

        const clickableCards = withinNorthHand().getAllByRole('button');
        const initialCount = clickableCards.length;
        if (initialCount) fireEvent.click(clickableCards[0]);

        expect(
          withinNorthHand().getAllByRole('button').length,
        ).toBeGreaterThanOrEqual(initialCount);
      });

      it('should not allow cards to played from the hand during South turn', () => {
        advanceToPhase(Player.South, Phase.Main);

        const clickableCards = withinNorthHand().queryAllByRole('button');
        const initialCount = clickableCards.length;
        if (initialCount) fireEvent.click(clickableCards[0]);

        expect(
          withinNorthHand().queryAllByRole('button').length,
        ).toBeGreaterThanOrEqual(initialCount);
      });
    });

    describe('South hand', () => {
      it('should start with 7 cards', () => {
        expect(withinSouthHand().getAllByRole('region')).toHaveLength(
          INITIAL_HAND_CARD_COUNT,
        );
      });

      it('should be visible during the South turn', () => {
        advanceToPhase(Player.South, Phase.Start);

        const cards = withinSouthHand().getAllByRole('region');
        expect(cards).not.toHaveLength(0);
        for (const c of cards) {
          expect(c).toHaveAccessibleName('Basic Field');
        }
      });

      it('should show card backs during the North turn', () => {
        advanceToPhase(Player.North, Phase.Start);

        const cards = withinSouthHand().getAllByRole('region');
        expect(cards).not.toHaveLength(0);
        for (const c of cards) {
          expect(c).toHaveAccessibleName('Facedown card');
        }
      });

      it('should gain an extra card only during the South Start phase', () => {
        advanceToPhase(Player.South, Phase.Main);
        const initialCount = withinSouthHand().getAllByRole('region').length;

        advanceToPhase(Player.North, Phase.End);
        expect(withinSouthHand().getAllByRole('region')).toHaveLength(
          initialCount,
        );

        advanceToPhase(Player.South, Phase.Main);
        expect(withinSouthHand().getAllByRole('region')).toHaveLength(
          initialCount + 1,
        );
      });

      it('should allow a card to be played from the hand by clicking during the South Main phase', () => {
        advanceToPhase(Player.South, Phase.Main);
        const initialCount = withinSouthHand().getAllByRole('region').length;

        fireEvent.click(withinSouthHand().getAllByRole('button')[0]);

        expect(withinSouthHand().getAllByRole('region')).toHaveLength(
          initialCount - 1,
        );
      });

      it('should not allow cards to played from the hand during other phases', () => {
        advanceToPhase(Player.South, Phase.End);

        const clickableCards = withinSouthHand().getAllByRole('button');
        const initialCount = clickableCards.length;
        if (initialCount) fireEvent.click(clickableCards[0]);

        expect(
          withinSouthHand().getAllByRole('button').length,
        ).toBeGreaterThanOrEqual(initialCount);
      });

      it('should not allow cards to played from the hand during North turn', () => {
        advanceToPhase(Player.North, Phase.Main);

        const clickableCards = withinSouthHand().queryAllByRole('button');
        const initialCount = clickableCards.length;
        if (initialCount) fireEvent.click(clickableCards[0]);

        expect(
          withinSouthHand().queryAllByRole('button').length,
        ).toBeGreaterThanOrEqual(initialCount);
      });
    });
  });

  describe('Play area', () => {
    it('should be in the main content area', () => {
      expect(withinMain().getByRole('grid')).toBeVisible();
    });

    describe('after picking a card from the North hand', () => {
      beforeEach(() => {
        advanceToPhase(Player.North, Phase.Main);
        fireEvent.click(withinNorthHand().getAllByRole('button')[0]);
      });

      it('should allow North to play a card on an empty field by clicking the field', () => {
        const initialHandSize = withinNorthHand().getAllByRole('button').length;
        const initialBasicFieldCount = withinPlayArea().queryAllByRole(
          'region',
          {
            name: 'North owned Basic Field',
          },
        ).length;
        const [targetField] = withinPlayArea().getAllByRole('button', {
          name: 'Place on North controlled empty field',
        });

        fireEvent.click(targetField);

        expect(withinNorthHand().getAllByRole('button')).toHaveLength(
          initialHandSize - 1,
        );
        expect(
          withinPlayArea().getAllByRole('region', {
            name: 'North owned Basic Field',
          }),
        ).toHaveLength(initialBasicFieldCount + 1);
      });

      it('should allow North to play a card on a more forward empty field by clicking the field', () => {
        const initialHandSize = withinNorthHand().getAllByRole('button').length;
        const initialBasicFieldCount = withinPlayArea().queryAllByRole(
          'region',
          {
            name: 'North owned Basic Field',
          },
        ).length;
        const [targetField] = withinPlayArea()
          .getAllByRole('button', {
            name: 'Place on North controlled empty field',
          })
          .toReversed();

        fireEvent.click(targetField);

        expect(withinNorthHand().getAllByRole('button')).toHaveLength(
          initialHandSize - 1,
        );
        expect(
          withinPlayArea().getAllByRole('region', {
            name: 'North owned Basic Field',
          }),
        ).toHaveLength(initialBasicFieldCount + 1);
      });
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
            expect(card).toHaveAccessibleName(
              /North (controlled)|(owned)|(Home)/,
            );
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
            expect(card).toHaveAccessibleName(
              /South (controlled)|(owned)|(Home)/,
            );
          }
        }
      });

      it('should have the north home field', () => {
        const [_, homeZone] = within(
          withinPlayArea().getAllByRole('row')[0],
        ).getAllByRole('gridcell');
        expect(within(homeZone).getByRole('region')).toHaveAccessibleName(
          'North Home Basic Field',
        );
      });

      it('should have the south home field', () => {
        const [_, homeZone] = within(
          withinPlayArea().getAllByRole('row')[ROW_COUNT - 1],
        ).getAllByRole('gridcell');
        expect(within(homeZone).getByRole('region')).toHaveAccessibleName(
          'South Home Basic Field',
        );
      });
    });
  });
});
