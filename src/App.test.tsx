import { fireEvent, render, screen, within } from '@testing-library/react';

import { Phase, Player, App, INITIAL_HAND_CARD_COUNT } from './App';
import { ROW_COUNT } from './Grid';

const FEW = 3;
const MANY = 15;

const { Start, Main, End } = Phase;
const { North, South } = Player;

describe('the dom test environment', () => {
  it('should have a defined document', () => {
    expectTypeOf(document).not.toBeUndefined();
  });
});

describe(App, () => {
  beforeEach(() => render(<App />));

  const getThe = {
    header: () => screen.getByRole('banner'),
    main: () => screen.getByRole('main'),
    southHand: () => getThe.hand(South),
    northHand: () => getThe.hand(North),
    hand: (player: Player) =>
      screen.getByRole('region', { name: `${player} hand` }),
    pickedCardDisplay: () =>
      screen.getByRole('region', { name: `Picked card` }),
    playArea: () => withinThe.main().getByRole('grid'),
    phaseIndicator: (player: Player, phase: Phase) =>
      withinThe
        .header()
        .getByRole('region', { name: `${player}: ${phase} phase` }),
  };

  const getAll = {
    handCards: (player: Player) =>
      withinThe.hand(player).getAllByRole('region'),
    clickableHandCards: (player: Player) =>
      withinThe.hand(player).getAllByRole('button'),
    visibleHandCards: (player: Player) =>
      withinThe.hand(player).getAllByRole('region', { name: 'Green Field' }),
    hiddenHandCards: (player: Player) =>
      withinThe.hand(player).getAllByRole('region', { name: 'Facedown card' }),
    ownedGreenFields: (player: Player) =>
      withinThe.playArea().getAllByRole('region', {
        name: `${player} owned Green Field`,
      }),
    controlledEmptyFieldDropzone: (player: Player) =>
      withinThe.playArea().getAllByRole('button', {
        name: `Place on ${player} controlled empty field`,
      }),
  };

  const queryAll = {
    clickableHandCards: (player: Player) =>
      withinThe.hand(player).queryAllByRole('button'),
    ownedGreenFields: (player: Player) =>
      withinThe.playArea().queryAllByRole('region', {
        name: `${player} owned Green Field`,
      }),
  };

  const queryThe = {
    pickedCardDisplay: () =>
      screen.queryByRole('region', { name: `Picked card` }),
    phaseIndicator: (player: Player, phase: Phase) =>
      withinThe
        .header()
        .queryByRole('region', { name: `${player}: ${phase} phase` }),
    controlledEmptyFieldDropzone: (player: Player) =>
      withinThe.playArea().queryByRole('button', {
        name: `Place on ${player} controlled empty field`,
      }),
  };

  const withinThe = {
    header: () => within(getThe.header()),
    main: () => within(getThe.main()),
    southHand: () => withinThe.hand(South),
    northHand: () => withinThe.hand(North),
    hand: (player: Player) => within(getThe.hand(player)),
    pickedCardDisplay: () => within(getThe.pickedCardDisplay()),
    playArea: () => within(getThe.playArea()),
  };

  const advanceToPhase = (player: Player, phase: Phase) => {
    for (let i = 0; i < MANY; i += 1) {
      if (queryThe.phaseIndicator(player, phase)) break;
      fireEvent.click(screen.getByText('Next phase'));
    }
    expect(getThe.phaseIndicator(player, phase)).toBeVisible();
  };

  describe('Header', () => {
    it('should have the wartide heading', () => {
      const heading = screen.getByRole('heading', { level: 1 });
      const banner = screen.getByRole('banner');
      expect(heading).toHaveTextContent('Wartide');
      expect(banner).toContainElement(heading);
    });

    it('should have the phase indicator after the heading', () => {
      const indicator = getThe.phaseIndicator(South, Main);
      expect(indicator).toHaveTextContent('South: Main phase');
      expect(screen.getByRole('banner')).toContainElement(indicator);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(indicator).toAppearAfter(heading);
    });

    describe('Phases', () => {
      it('should start in the South Main phase', () => {
        expect(getThe.phaseIndicator(South, Main)).toBeVisible();
        expect(screen.queryByLabelText('End Phase')).not.toBeInTheDocument();
      });

      it.for([North, South])(
        'should not advance to the %s End phase when the button is clicked while placing a card',
        player => {
          advanceToPhase(player, Main);
          fireEvent.click(getAll.clickableHandCards(player)[5]);
          fireEvent.click(screen.getByText('Next phase'));

          expect(getThe.phaseIndicator(player, Main)).toBeVisible();
          expect(queryThe.phaseIndicator(player, End)).not.toBeInTheDocument();
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

  describe('Hands', () => {
    it('should have the North Hand and South hand in that order before the Play area', () => {
      const south = getThe.southHand();
      const north = getThe.northHand();
      const playArea = getThe.playArea();
      expect(north).toAppearBefore(south);
      expect(south).toAppearBefore(playArea);
    });

    describe('Picked Card', () => {
      it('should not appear before picking a card', () => {
        expect(queryThe.pickedCardDisplay()).not.toBeInTheDocument();
      });

      describe.for([North, South])(
        'after %s picks a card from their hand',
        player => {
          it(`should show a card picked during the ${player} Main phase`, () => {
            advanceToPhase(player, Main);
            fireEvent.click(getAll.clickableHandCards(player)[2]);

            expect(getThe.pickedCardDisplay()).toBeVisible();
            expect(
              withinThe.pickedCardDisplay().getByRole('region', {
                name: 'Green Field',
              }),
            ).toBeVisible();
          });

          it(`should not be visible after placing a ${player} card`, () => {
            advanceToPhase(player, Main);
            fireEvent.click(getAll.clickableHandCards(player)[2]);
            fireEvent.click(
              withinThe.playArea().getAllByRole('button', {
                name: new RegExp(`${player} controlled`),
              })[3],
            );
            expect(queryThe.pickedCardDisplay()).not.toBeInTheDocument();
          });
        },
      );
    });

    describe.for([North, South])('%s hand', player => {
      const opponent = player === North ? South : North;

      it('should start with 7 cards', () => {
        expect(getAll.handCards(player)).toHaveLength(INITIAL_HAND_CARD_COUNT);
      });

      it(`should be visible during the ${player} turn`, () => {
        advanceToPhase(player, Start);
        const cards = getAll.handCards(player);
        expect(cards).not.toHaveLength(0);
        for (const c of cards) expect(c).toHaveAccessibleName('Green Field');
        expect(getAll.visibleHandCards(player)).toHaveLength(cards.length);
      });

      it(`should show card backs during the ${opponent} turn`, () => {
        advanceToPhase(opponent, Start);
        const cards = getAll.handCards(player);
        expect(cards).not.toHaveLength(0);
        for (const c of cards) expect(c).toHaveAccessibleName('Facedown card');
        expect(getAll.hiddenHandCards(player)).toHaveLength(cards.length);
      });

      it(`should gain an extra card only during the ${player} Start phase`, () => {
        advanceToPhase(player, Main);
        const initialCount = getAll.handCards(player).length;

        advanceToPhase(opponent, End);
        expect(getAll.handCards(player)).toHaveLength(initialCount);

        advanceToPhase(player, Main);
        expect(getAll.handCards(player)).toHaveLength(initialCount + 1);
      });

      it(`should allow a card to be picked during the ${player} Main phase`, () => {
        advanceToPhase(player, Main);
        fireEvent.click(getAll.clickableHandCards(player)[2]);
        expect(getThe.pickedCardDisplay()).toBeVisible();
      });

      it('should not allow a card to be picked during other phases and turns', () => {
        {
          advanceToPhase(player, End);
          const clickableCards = queryAll.clickableHandCards(player);
          if (clickableCards.length > 0) fireEvent.click(clickableCards[0]);
          expect(queryThe.pickedCardDisplay()).not.toBeInTheDocument();
        }
        {
          advanceToPhase(opponent, Main);
          const clickableCards = queryAll.clickableHandCards(player);
          if (clickableCards.length > 0) fireEvent.click(clickableCards[0]);
          expect(queryThe.pickedCardDisplay()).not.toBeInTheDocument();
        }
      });

      it(`should lose a card when ${player} plays a card`, () => {
        advanceToPhase(player, Main);
        const initialHandSize = getAll.handCards(player).length;

        fireEvent.click(getAll.clickableHandCards(player)[2]);
        fireEvent.click(
          withinThe.playArea().getAllByRole('button', {
            name: `Place on ${player} controlled empty field`,
          })[0],
        );

        expect(getAll.handCards(player)).toHaveLength(initialHandSize - 1);
      });

      it(`should not lose a card when ${opponent} plays a card`, () => {
        advanceToPhase(opponent, Main);
        const initialHandSize = getAll.handCards(player).length;

        fireEvent.click(getAll.clickableHandCards(opponent)[4]);
        fireEvent.click(
          withinThe.playArea().getAllByRole('button', {
            name: /Place/,
          })[0],
        );

        expect(getAll.handCards(player)).toHaveLength(initialHandSize);
      });
    });
  });

  describe('Play area', () => {
    it('should be in the main content area', () => {
      expect(withinThe.main().getByRole('grid')).toBeVisible();
    });

    describe.for([North, South])(
      'after picking a card from the %s hand',
      player => {
        const opponent = player === North ? South : North;

        beforeEach(() => {
          advanceToPhase(player, Main);
          fireEvent.click(getAll.clickableHandCards(player)[0]);
        });

        const INITIAL_UNUPGRADED_FIELDS_PER_PLAYER = 8;
        it.for([0, 2, INITIAL_UNUPGRADED_FIELDS_PER_PLAYER - 1])(
          `should allow ${player} to upgrade their %sth unupgraded field by clicking on it`,
          fieldIndex => {
            const initialBasicFieldCount =
              queryAll.ownedGreenFields(player).length;
            fireEvent.click(
              getAll.controlledEmptyFieldDropzone(player)[fieldIndex],
            );

            expect(getAll.ownedGreenFields(player)).toHaveLength(
              initialBasicFieldCount + 1,
            );
          },
        );

        it(`should not allow ${player} to play a card on an a ${opponent} field`, () => {
          expect(
            queryThe.controlledEmptyFieldDropzone(opponent),
          ).not.toBeInTheDocument();
        });
      },
    );

    describe('The initial placement of fields', () => {
      it('should have 18 fields in 6 rows of 3', () => {
        const rows = withinThe.playArea().getAllByRole('row');
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
        const northRows = withinThe.playArea().getAllByRole('row').slice(0, 3);
        for (const row of northRows) {
          for (const zone of within(row).getAllByRole('gridcell')) {
            const card = within(zone).getByRole('region');
            expect(card).toHaveAccessibleName(
              /North (controlled)|(owned)|(Home)/,
            );
          }
        }
      });

      it('should have south fields in the bottom 3 rows', () => {
        const southRows = withinThe.playArea().getAllByRole('row').slice(3);
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
          withinThe.playArea().getAllByRole('row')[0],
        ).getAllByRole('gridcell');
        expect(within(homeZone).getByRole('region')).toHaveAccessibleName(
          'North Home Green Field',
        );
      });

      it('should have the south home field', () => {
        const [_, homeZone] = within(
          withinThe.playArea().getAllByRole('row')[ROW_COUNT - 1],
        ).getAllByRole('gridcell');
        expect(within(homeZone).getByRole('region')).toHaveAccessibleName(
          'South Home Green Field',
        );
      });
    });
  });
});
