import { fireEvent, render, screen, within } from '@testing-library/react';

import { Phase, Player, App, INITIAL_HAND_CARD_COUNT, ROW_COUNT } from './App';

const FEW = 3;
const MANY = 15;
interface CustomMatchers<R = unknown> {
  toHaveFlow: () => R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

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

      it('should not advance to the South End phase when the button is clicked while placing a card', () => {
        fireEvent.click(withinSouthHand().getAllByRole('button')[5]);

        fireEvent.click(screen.getByText('Next phase'));

        expect(
          withinHeader().getByRole('region', { name: 'South: Main phase' }),
        ).toBeVisible();
        expect(
          screen.queryByLabelText('South: End phase'),
        ).not.toBeInTheDocument();
      });

      it('should not advance to the North End phase when the button is clicked while placing a card', () => {
        advanceToPhase(Player.North, Phase.Main);
        fireEvent.click(withinNorthHand().getAllByRole('button')[5]);

        fireEvent.click(screen.getByText('Next phase'));

        expect(
          withinHeader().getByRole('region', { name: 'North: Main phase' }),
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
    it('should have the North Hand and South hand in that order before the Play area', () => {
      const south = withinMain().getByRole('region', { name: 'South hand' });
      const north = withinMain().getByRole('region', { name: 'North hand' });
      const playArea = screen.getByRole('grid');
      expect(north).toAppearBefore(south);
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
            name: 'Green Field',
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

      it('should show a card picked during the South Main phase', () => {
        advanceToPhase(Player.South, Phase.Main);

        fireEvent.click(withinSouthHand().getAllByRole('button')[2]);

        expect(
          screen.getByRole('region', { name: 'Picked card' }),
        ).toBeVisible();
        expect(
          withinPickedCardDisplay().getByRole('region', {
            name: 'Green Field',
          }),
        ).toBeVisible();
      });

      it('should not be visible after placing a South card', () => {
        advanceToPhase(Player.South, Phase.Main);

        fireEvent.click(withinSouthHand().getAllByRole('button')[2]);
        fireEvent.click(
          withinPlayArea().getAllByRole('button', {
            name: /South controlled/,
          })[3],
        );

        expect(
          screen.queryByRole('region', { name: 'Picked card' }),
        ).not.toBeInTheDocument();
      });
    });

    describe.for([Player.North, Player.South])('%s hand', player => {
      const opponent = player === Player.North ? Player.South : Player.North;
      const withinPlayerHand =
        player === Player.North ? withinNorthHand : withinSouthHand;
      const withinOpponentHand =
        opponent === Player.North ? withinNorthHand : withinSouthHand;

      it('should start with 7 cards', () => {
        expect(withinNorthHand().getAllByRole('region')).toHaveLength(
          INITIAL_HAND_CARD_COUNT,
        );
      });

      it(`should be visible during the ${player} turn`, () => {
        advanceToPhase(player, Phase.Start);

        const cards = withinPlayerHand().getAllByRole('region');
        expect(cards).not.toHaveLength(0);
        for (const c of cards) {
          expect(c).toHaveAccessibleName('Green Field');
        }
      });

      it(`should show card backs during the ${opponent} turn`, () => {
        advanceToPhase(opponent, Phase.Start);

        const cards = withinPlayerHand().getAllByRole('region');
        expect(cards).not.toHaveLength(0);
        for (const c of cards) {
          expect(c).toHaveAccessibleName('Facedown card');
        }
      });

      it(`should gain an extra card only during the ${player} Start phase`, () => {
        advanceToPhase(player, Phase.Main);
        const initialCount = withinPlayerHand().getAllByRole('region').length;

        advanceToPhase(opponent, Phase.End);
        expect(withinPlayerHand().getAllByRole('region')).toHaveLength(
          initialCount,
        );

        advanceToPhase(player, Phase.Main);
        expect(withinPlayerHand().getAllByRole('region')).toHaveLength(
          initialCount + 1,
        );
      });

      it(`should allow a card to be picked during the ${player} Main phase`, () => {
        advanceToPhase(player, Phase.Main);

        fireEvent.click(withinPlayerHand().getAllByRole('button')[2]);

        expect(
          screen.getByRole('region', { name: 'Picked card' }),
        ).toBeVisible();
        expect(
          withinPickedCardDisplay().getByRole('region', {
            name: 'Green Field',
          }),
        ).toBeVisible();
      });

      it('should not allow a card to be picked during other phases', () => {
        advanceToPhase(opponent, Phase.Main);

        const clickableCards = withinPlayerHand().queryAllByRole('button');
        if (clickableCards.length > 0)
          fireEvent.click(withinPlayerHand().queryAllByRole('button')[0]);

        expect(
          screen.queryByRole('region', { name: 'Picked card' }),
        ).not.toBeInTheDocument();
      });

      it(`should not allow a card to be picked during the ${opponent} Main phase`, () => {
        advanceToPhase(opponent, Phase.Main);

        const clickableCards = withinPlayerHand().queryAllByRole('button');
        if (clickableCards.length > 0)
          fireEvent.click(withinPlayerHand().queryAllByRole('button')[0]);

        expect(
          screen.queryByRole('region', { name: 'Picked card' }),
        ).not.toBeInTheDocument();
      });

      it(`should lose a card when ${player} plays a card`, () => {
        advanceToPhase(player, Phase.Main);

        const initialHandSize =
          withinPlayerHand().getAllByRole('region').length;

        fireEvent.click(withinPlayerHand().getAllByRole('button')[2]);
        fireEvent.click(
          withinPlayArea().getAllByRole('button', {
            name: `Place on ${player} controlled empty field`,
          })[0],
        );

        expect(withinPlayerHand().getAllByRole('region')).toHaveLength(
          initialHandSize - 1,
        );
      });

      it(`should not lose a card when ${opponent} plays a card`, () => {
        advanceToPhase(opponent, Phase.Main);

        const initialHandSize =
          withinPlayerHand().getAllByRole('region').length;

        fireEvent.click(withinOpponentHand().getAllByRole('button')[4]);
        fireEvent.click(
          withinPlayArea().getAllByRole('button', {
            name: /Place/,
          })[0],
        );

        expect(withinPlayerHand().getAllByRole('region')).toHaveLength(
          initialHandSize,
        );
      });
    });
  });

  describe('Play area', () => {
    it('should be in the main content area', () => {
      expect(withinMain().getByRole('grid')).toBeVisible();
    });

    describe('after picking a card from the South hand', () => {
      beforeEach(() => {
        advanceToPhase(Player.South, Phase.Main);
        fireEvent.click(withinSouthHand().getAllByRole('button')[0]);
      });

      it('should allow South to play a card on an empty field by clicking the field', () => {
        const initialBasicFieldCount = withinPlayArea().queryAllByRole(
          'region',
          {
            name: 'South owned Green Field',
          },
        ).length;
        const [targetField] = withinPlayArea().getAllByRole('button', {
          name: 'Place on South controlled empty field',
        });

        fireEvent.click(targetField);

        expect(
          withinPlayArea().getAllByRole('region', {
            name: 'South owned Green Field',
          }),
        ).toHaveLength(initialBasicFieldCount + 1);
      });

      it('should allow South to play a card on a more forward empty field by clicking the field', () => {
        const initialBasicFieldCount = withinPlayArea().queryAllByRole(
          'region',
          {
            name: 'South owned Green Field',
          },
        ).length;
        const [targetField] = withinPlayArea()
          .getAllByRole('button', {
            name: 'Place on South controlled empty field',
          })
          .toReversed();

        fireEvent.click(targetField);

        expect(
          withinPlayArea().getAllByRole('region', {
            name: 'South owned Green Field',
          }),
        ).toHaveLength(initialBasicFieldCount + 1);
      });

      it('should not allow South to play a card on an a North field', () => {
        expect(
          withinPlayArea().queryByRole('button', {
            name: 'Place on North controlled empty field',
          }),
        ).not.toBeInTheDocument();
      });
    });

    describe('after picking a card from the North hand', () => {
      beforeEach(() => {
        advanceToPhase(Player.North, Phase.Main);
        fireEvent.click(withinNorthHand().getAllByRole('button')[0]);
      });

      it('should allow North to play a card on an empty field by clicking the field', () => {
        const initialBasicFieldCount = withinPlayArea().queryAllByRole(
          'region',
          {
            name: 'North owned Green Field',
          },
        ).length;
        const [targetField] = withinPlayArea().getAllByRole('button', {
          name: 'Place on North controlled empty field',
        });

        fireEvent.click(targetField);

        expect(
          withinPlayArea().getAllByRole('region', {
            name: 'North owned Green Field',
          }),
        ).toHaveLength(initialBasicFieldCount + 1);
      });

      it('should allow North to play a card on a more forward empty field by clicking the field', () => {
        const initialHandSize = withinNorthHand().getAllByRole('button').length;
        const initialBasicFieldCount = withinPlayArea().queryAllByRole(
          'region',
          {
            name: 'North owned Green Field',
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
            name: 'North owned Green Field',
          }),
        ).toHaveLength(initialBasicFieldCount + 1);
      });

      it('should not allow North to play a card on an a South field', () => {
        expect(
          withinPlayArea().queryByRole('button', {
            name: 'Place on South controlled empty field',
          }),
        ).not.toBeInTheDocument();
      });
    });

    describe('The initial placement of fields', () => {
      it('should have 18 fields in 6 rows of 3', () => {
        const rows = withinPlayArea().getAllByRole('row');
        expect(rows).toHaveLength(6);
        for (const row of rows) {
          const fields = within(row).getAllByRole('gridcell');
          expect(fields).toHaveLength(3);
          for (const field of fields) {
            expect(field).toBeVisible();
          }
        }
      });

      it('should have north fields in the top 3 rows', () => {
        const southRows = withinPlayArea().getAllByRole('row').slice(0, 3);
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
        const southRows = withinPlayArea().getAllByRole('row').slice(3);
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
          'North Home Green Field',
        );
      });

      it('should have the south home field', () => {
        const [_, homeZone] = within(
          withinPlayArea().getAllByRole('row')[ROW_COUNT - 1],
        ).getAllByRole('gridcell');
        expect(within(homeZone).getByRole('region')).toHaveAccessibleName(
          'South Home Green Field',
        );
      });
    });
  });
});
